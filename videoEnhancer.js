/* ═══════════════════════════════════════════════════════════════════════════
   Aether Video Enhancer — Content Script (Global Overlay Version)
   Does NOT wrap <video> in a div, thus won't break complex players (YouTube).
   Instead, uses a single global HUD tracking the active video.
   ═══════════════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  if (window.__aetherVideoEnhancerLoaded) return;
  window.__aetherVideoEnhancerLoaded = true;

  const FILTER_PRESETS = {
    default:   { label: 'Default',   css: 'none' },
    vibrant:   { label: 'Vibrant',   css: 'saturate(1.35) contrast(1.1) brightness(1.02)' },
    night:     { label: 'Night',     css: 'brightness(1.25) contrast(0.95)' },
    cinematic: { label: 'Cinematic', css: 'sepia(0.15) contrast(1.15) saturate(1.1)' },
  };
  const STORAGE_KEY = 'aetherVideoEnhancerPrefs';

  let prefs = { volumeBoost: 100, filterPreset: 'default' };
  if (chrome.storage && chrome.storage.local) {
    chrome.storage.local.get([STORAGE_KEY], r => {
      if (r[STORAGE_KEY]) prefs = { ...prefs, ...r[STORAGE_KEY] };
    });
  }
  function savePrefs() {
    if (chrome.storage && chrome.storage.local) chrome.storage.local.set({ [STORAGE_KEY]: prefs });
  }

  // UI state
  let activeVideo = null;
  let hudContainer = null;
  let toggleBtn = null;
  let panel = null;
  let panelOpen = false;
  let isHoveringHUD = false;

  // Track state per video element
  const videoStates = new WeakMap();

  function getState(video) {
    if (!videoStates.has(video)) {
      videoStates.set(video, {
        audioCtx: null, gainNode: null, dialogueFilter: null, dialogueEnabled: false, mediaSource: null,
        activePreset: prefs.filterPreset || 'default',
        manualBrightness: 100, manualContrast: 100, manualSaturation: 100, useManualFilters: false,
        volumePercent: prefs.volumeBoost || 100,
        theaterActive: false
      });
      // Apply initial filter
      applyFilter(video);
    }
    return videoStates.get(video);
  }

  function applyFilter(video) {
    const state = getState(video);
    if (state.useManualFilters) {
      video.style.filter = `brightness(${state.manualBrightness / 100}) contrast(${state.manualContrast / 100}) saturate(${state.manualSaturation / 100})`;
    } else {
      const preset = FILTER_PRESETS[state.activePreset] || FILTER_PRESETS.default;
      video.style.filter = preset.css;
    }
  }

  function ensureAudio(video) {
    const state = getState(video);
    if (state.audioCtx) return;
    try {
      state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      state.mediaSource = state.audioCtx.createMediaElementSource(video);
      state.gainNode = state.audioCtx.createGain();
      state.gainNode.gain.value = state.volumePercent / 100;

      state.dialogueFilter = state.audioCtx.createBiquadFilter();
      state.dialogueFilter.type = 'peaking';
      state.dialogueFilter.frequency.value = 2500;
      state.dialogueFilter.Q.value = 1.2;
      state.dialogueFilter.gain.value = state.dialogueEnabled ? 6 : 0;

      state.mediaSource.connect(state.dialogueFilter);
      state.dialogueFilter.connect(state.gainNode);
      state.gainNode.connect(state.audioCtx.destination);
    } catch (e) {
      console.warn('[Aether VE] Audio init failed:', e);
    }
  }

  // --- Theater Backdrop ---
  let backdrop = document.getElementById('aether-theater-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'aether-theater-backdrop';
    document.body.appendChild(backdrop);
  }

  function toggleTheater(video) {
    const state = getState(video);
    state.theaterActive = !state.theaterActive;
    backdrop.classList.toggle('active', state.theaterActive);
    
    if (state.theaterActive) {
      video.classList.add('aether-ve-theater-active');
      backdrop.onclick = () => { toggleTheater(video); renderPanel(video); };
    } else {
      video.classList.remove('aether-ve-theater-active');
      backdrop.onclick = null;
    }
  }

  function takeSnapshot(video) {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || video.clientWidth;
      canvas.height = video.videoHeight || video.clientHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const link = document.createElement('a');
      link.download = `frame_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.warn('[Aether VE] Snapshot failed:', err);
    }
  }

  function togglePiP(video) {
    if (document.pictureInPictureElement === video) {
      document.exitPictureInPicture().catch(() => {});
    } else {
      video.requestPictureInPicture().catch(() => {});
    }
  }

  function resetAll(video) {
    const state = getState(video);
    state.volumePercent = 100;
    if (state.gainNode) state.gainNode.gain.value = 1;
    state.dialogueEnabled = false;
    if (state.dialogueFilter) state.dialogueFilter.gain.value = 0;
    state.activePreset = 'default';
    state.useManualFilters = false;
    state.manualBrightness = 100;
    state.manualContrast = 100;
    state.manualSaturation = 100;
    video.style.filter = 'none';
    
    if (state.theaterActive) {
      state.theaterActive = false;
      backdrop.classList.remove('active');
      video.classList.remove('aether-ve-theater-active');
      backdrop.onclick = null;
    }
    
    prefs.volumeBoost = 100;
    prefs.filterPreset = 'default';
    savePrefs();
    renderPanel(video);
  }

  // --- HUD Construction ---
  function createHUD() {
    hudContainer = document.createElement('div');
    hudContainer.id = 'aether-ve-global-hud';
    hudContainer.style.position = 'fixed';
    hudContainer.style.zIndex = '2147483647';
    hudContainer.style.pointerEvents = 'none';
    hudContainer.style.opacity = '0';
    hudContainer.style.transition = 'opacity 0.2s';
    
    toggleBtn = document.createElement('button');
    toggleBtn.className = 'aether-ve-toggle';
    toggleBtn.textContent = '🎬';
    toggleBtn.style.pointerEvents = 'auto';
    toggleBtn.onmouseenter = () => isHoveringHUD = true;
    toggleBtn.onmouseleave = () => isHoveringHUD = false;
    toggleBtn.onclick = (e) => {
      e.stopPropagation();
      panelOpen = !panelOpen;
      panel.classList.toggle('open', panelOpen);
      if (panelOpen && activeVideo) renderPanel(activeVideo);
    };
    
    panel = document.createElement('div');
    panel.className = 'aether-ve-panel';
    panel.style.pointerEvents = 'auto';
    panel.onmouseenter = () => isHoveringHUD = true;
    panel.onmouseleave = () => isHoveringHUD = false;
    
    hudContainer.appendChild(toggleBtn);
    hudContainer.appendChild(panel);
    document.documentElement.appendChild(hudContainer); // Append to html to avoid z-index traps
  }

  function renderPanel(video) {
    if (!panelOpen) return;
    const state = getState(video);
    panel.innerHTML = '';
    
    const makeSec = t => {
      const s = document.createElement('div'); s.className = 'aether-ve-section';
      const h = document.createElement('div'); h.className = 'aether-ve-section-title'; h.textContent = t;
      s.appendChild(h); return s;
    };
    const makeSli = (lbl, min, max, val, unit, fn) => {
      const r = document.createElement('div'); r.className = 'aether-ve-slider-row';
      const l = document.createElement('span'); l.className = 'aether-ve-slider-label'; l.textContent = lbl;
      const v = document.createElement('span'); v.className = 'aether-ve-slider-value'; v.textContent = val + unit;
      const i = document.createElement('input'); i.type = 'range'; i.className = 'aether-ve-slider';
      i.min = min; i.max = max; i.value = val;
      i.oninput = () => { const nv = parseInt(i.value, 10); v.textContent = nv + unit; fn(nv); };
      r.append(l, i, v); return r;
    };
    const makeTog = (lbl, checked, fn) => {
      const r = document.createElement('div'); r.className = 'aether-ve-toggle-row';
      const l = document.createElement('span'); l.className = 'aether-ve-toggle-label'; l.textContent = lbl;
      const sw = document.createElement('label'); sw.className = 'aether-ve-switch';
      const cb = document.createElement('input'); cb.type = 'checkbox'; cb.checked = checked;
      const tr = document.createElement('span'); tr.className = 'aether-ve-switch-track';
      cb.onchange = () => fn(cb.checked);
      sw.append(cb, tr); r.append(l, sw); return r;
    };
    const makeBtn = (txt, active, fn) => {
      const b = document.createElement('button'); b.className = 'aether-ve-action-btn' + (active ? ' active-action' : '');
      b.textContent = txt; b.onclick = (e) => { e.stopPropagation(); fn(); }; return b;
    };

    const aSec = makeSec('🔊 Audio Boost');
    aSec.appendChild(makeSli('Volume', 100, 400, state.volumePercent, '%', v => {
      state.volumePercent = v; prefs.volumeBoost = v; savePrefs();
      ensureAudio(video); if (state.gainNode) state.gainNode.gain.value = v / 100;
    }));
    aSec.appendChild(makeTog('Dialogue Boost', state.dialogueEnabled, c => {
      state.dialogueEnabled = c; ensureAudio(video);
      if (state.dialogueFilter) state.dialogueFilter.gain.value = c ? 6 : 0;
    }));
    panel.appendChild(aSec);
    const div1 = document.createElement('div'); div1.className = 'aether-ve-divider'; panel.appendChild(div1);

    const fSec = makeSec('🎨 Visual Filters');
    const pWrap = document.createElement('div'); pWrap.className = 'aether-ve-presets';
    Object.entries(FILTER_PRESETS).forEach(([k, p]) => {
      const b = document.createElement('button');
      b.className = 'aether-ve-preset-btn' + (!state.useManualFilters && state.activePreset === k ? ' active' : '');
      b.textContent = p.label;
      b.onclick = () => { state.activePreset = k; state.useManualFilters = false; prefs.filterPreset = k; savePrefs(); applyFilter(video); renderPanel(video); };
      pWrap.appendChild(b);
    });
    fSec.appendChild(pWrap);
    fSec.appendChild(makeSli('Brightness', 50, 200, state.manualBrightness, '%', v => { state.manualBrightness = v; state.useManualFilters = true; applyFilter(video); }));
    fSec.appendChild(makeSli('Contrast', 50, 200, state.manualContrast, '%', v => { state.manualContrast = v; state.useManualFilters = true; applyFilter(video); }));
    fSec.appendChild(makeSli('Saturation', 0, 200, state.manualSaturation, '%', v => { state.manualSaturation = v; state.useManualFilters = true; applyFilter(video); }));
    panel.appendChild(fSec);
    const div2 = document.createElement('div'); div2.className = 'aether-ve-divider'; panel.appendChild(div2);

    const uSec = makeSec('⚡ Utilities');
    const aWrap = document.createElement('div'); aWrap.className = 'aether-ve-actions';
    aWrap.appendChild(makeBtn('📸 Snapshot', false, () => takeSnapshot(video)));
    aWrap.appendChild(makeBtn(state.theaterActive ? '💡 Exit Theater' : '🎭 Theater', state.theaterActive, () => { toggleTheater(video); renderPanel(video); }));
    aWrap.appendChild(makeBtn('📺 PiP', false, () => togglePiP(video)));
    aWrap.appendChild(makeBtn('↺ Reset', false, () => resetAll(video)));
    uSec.appendChild(aWrap);
    panel.appendChild(uSec);
  }

  // --- Tracking Logic ---
  function findActiveVideo() {
    const videos = Array.from(document.querySelectorAll('video')).filter(v => v.clientWidth >= 120 && v.clientHeight >= 80);
    if (!videos.length) return null;
    
    // Check if any is actually playing
    let playing = videos.filter(v => !v.paused && !v.ended);
    if (playing.length > 0) return playing.sort((a,b) => (b.clientWidth*b.clientHeight) - (a.clientWidth*a.clientHeight))[0];
    
    // Otherwise pick the largest
    return videos.sort((a,b) => (b.clientWidth*b.clientHeight) - (a.clientWidth*a.clientHeight))[0];
  }

  let lastMouseMove = Date.now();
  document.addEventListener('mousemove', () => { lastMouseMove = Date.now(); }, {passive: true});

  function trackerLoop() {
    if (!hudContainer) createHUD();
    
    const v = findActiveVideo();
    if (v !== activeVideo) {
      if (panelOpen) { panelOpen = false; panel.classList.remove('open'); }
      activeVideo = v;
      if (v) renderPanel(v);
    }
    
    if (activeVideo) {
      const rect = activeVideo.getBoundingClientRect();
      // Is video visible?
      if (rect.bottom > 0 && rect.top < window.innerHeight && rect.right > 0 && rect.left < window.innerWidth && rect.width > 0 && rect.height > 0) {
        
        hudContainer.style.top = Math.max(10, rect.top + 10) + 'px';
        hudContainer.style.left = (rect.right - 46) + 'px'; // 36px width + 10px margin
        
        const isRecentMove = (Date.now() - lastMouseMove < 2500);
        if (panelOpen || isHoveringHUD || isRecentMove) {
          hudContainer.style.opacity = '1';
          hudContainer.style.pointerEvents = panelOpen || isHoveringHUD ? 'auto' : 'none'; // Only allow clicks on panel/btn if visible
          if (!panelOpen) toggleBtn.style.pointerEvents = 'auto'; // allow click on button
        } else {
          hudContainer.style.opacity = '0';
          hudContainer.style.pointerEvents = 'none';
        }
      } else {
        hudContainer.style.opacity = '0';
        hudContainer.style.pointerEvents = 'none';
      }
    } else {
      hudContainer.style.opacity = '0';
      hudContainer.style.pointerEvents = 'none';
    }
    
    requestAnimationFrame(trackerLoop);
  }

  trackerLoop();

})();
