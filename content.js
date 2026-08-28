/**
 * Aether OS — Notch Command Center
 * Content Script: iPhone-style notch → glassmorphism command panel
 * All AI tools + utility tools in one unified interface
 */

// ============================================================================
// 1. SHADOW DOM STYLES (Glassmorphism)
// ============================================================================
const SHADOW_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:host{font-family:'Outfit',-apple-system,BlinkMacSystemFont,sans-serif;color:#f1f5f9;line-height:1.5;-webkit-font-smoothing:antialiased}

/* Animations */
@keyframes aeFadeIn{from{opacity:0}to{opacity:1}}
@keyframes aeWaterDropBackdrop{from{background:rgba(4,8,16,0)}to{background:rgba(4,8,16,.18)}}
@keyframes aeWaterDrop{0%{opacity:.9;transform:translate(-50%,-50%) scale(.05)}45%{opacity:.45;transform:translate(-50%,-50%) scale(12)}100%{opacity:0;transform:translate(-50%,-50%) scale(120)}}
@keyframes aeSlideDown{from{opacity:0;transform:translateX(-50%) translateY(-18px) scale(.96)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}
@keyframes aeSpin{to{transform:rotate(360deg)}}
@keyframes aePulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes aeTooltipOrbIn{0%{opacity:0;transform:scale(.35) rotate(-24deg);filter:blur(6px)}70%{opacity:1;transform:scale(1.1) rotate(5deg);filter:blur(0)}100%{opacity:1;transform:scale(1) rotate(0)}}
@keyframes aeTooltipExpand{0%{opacity:.25;transform:scaleX(.15);filter:blur(4px)}100%{opacity:1;transform:scaleX(1);filter:blur(0)}}
@keyframes aeTooltipButtonIn{0%{opacity:0;transform:translateX(-8px) scale(.7)}100%{opacity:1;transform:translateX(0) scale(1)}}
@keyframes aeNotchTileIn{0%{opacity:0;transform:translateX(-50%) translateY(-6px) scale(.94)}100%{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}
@keyframes aeNotchTileOut{0%{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}100%{opacity:0;transform:translateX(-50%) translateY(-5px) scale(.96)}}

/* ── Notch GIF ── */
.ae-notch{
  position:fixed;top:12px;left:50%;transform:translateX(-50%);
  width:40px;height:40px;
  border:0;border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;z-index:2147483648;pointer-events:auto;
  transition:all .3s cubic-bezier(.16,1,.3,1);
  filter:drop-shadow(0 8px 12px rgba(0,0,0,.5));
}
.ae-notch:hover{
  transform:translateX(-50%) translateY(2px) scale(1.08);
  filter:drop-shadow(0 10px 16px rgba(0,0,0,.6));
}
.ae-notch.ae-notch-hidden{opacity:0;transform:translateX(-50%) scale(.25);pointer-events:none}
.ae-notch-image{width:100%;height:100%;display:block;border-radius:50%;object-fit:cover}
.ae-notch-tile{
  position:fixed;top:58px;left:50%;width:max-content;max-width:min(230px,calc(100vw - 28px));
  padding:6px 10px;border:1px solid rgba(255,255,255,.16);border-radius:10px;
  background:rgba(12,18,28,.78);backdrop-filter:blur(14px) saturate(135%);
  -webkit-backdrop-filter:blur(14px) saturate(135%);color:#e2e8f0;text-align:center;
  font-size:10px;font-weight:500;line-height:1.25;letter-spacing:.15px;
  box-shadow:0 8px 22px rgba(0,0,0,.38),inset 0 1px 0 rgba(255,255,255,.08);
  z-index:2147483647;pointer-events:auto;cursor:pointer;
  animation:aeNotchTileIn .28s cubic-bezier(.16,1,.3,1) both;
}
.ae-notch-tile.ae-notch-tile-hiding{animation:aeNotchTileOut .2s ease both}
.ae-notch-tile-label{display:block;color:#94a3b8;font-size:8px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;margin-bottom:2px}
@media (prefers-reduced-motion:reduce){.ae-notch-tile,.ae-notch-tile.ae-notch-tile-hiding{animation:none}}

/* ── Backdrop (Dark Frosted Glass Overlay) ── */
.ae-backdrop{
  position:fixed;inset:0;
  background:rgba(4,8,16,.18);
  z-index:2147483646;pointer-events:auto;
  isolation:isolate;
  animation:aeWaterDropBackdrop .3s ease-out;
}
.ae-backdrop::before{
  content:'';position:fixed;top:32px;left:50%;width:34px;height:34px;
  border:2px solid rgba(150,225,255,.7);border-radius:50%;
  background:radial-gradient(circle,rgba(210,245,255,.2),rgba(100,190,255,0) 70%);
  box-shadow:0 0 18px rgba(100,205,255,.45),inset 0 0 10px rgba(220,250,255,.25);
  pointer-events:none;z-index:0;
  animation:aeWaterDrop .7s cubic-bezier(.16,1,.3,1) forwards;
}

/* ── Command Center (Dark Frosted Glassmorphism Card) ── */
.ae-cc{
  position:fixed;top:62px;left:50%;transform:translateX(-50%);
  width:920px;max-width:calc(100vw - 24px);height:calc(100vh - 76px);max-height:830px;
  background:linear-gradient(145deg, rgba(116,126,132,.78) 0%, rgba(38,47,52,.84) 100%);
  backdrop-filter:blur(3px) saturate(135%) brightness(102%);
  -webkit-backdrop-filter:blur(3px) saturate(135%) brightness(102%);
  border:1.5px solid rgba(255,255,255,.16);
  border-radius:36px;
  display:flex;flex-direction:column;overflow:hidden;
  z-index:2147483647;pointer-events:auto;
  box-shadow:0 32px 90px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.08) inset, inset 0 1px 2px rgba(255,255,255,.2);
  animation:aeSlideDown .42s .06s cubic-bezier(.16,1,.3,1) both;
  color:#f1f5f9;
}

@media (max-width:600px){
  .ae-cc{top:58px;width:calc(100vw - 16px);height:calc(100vh - 68px);border-radius:24px}
}

.ae-cc-header{
  display:flex;justify-content:space-between;align-items:center;
  padding:8px 14px 6px;
  background:rgba(255,255,255,.03);
  border-bottom:1px solid rgba(255,255,255,.09);flex-shrink:0;
}
.ae-cc-title{
  font-size:15px;font-weight:800;letter-spacing:.3px;
  color:#ffffff;
  display:flex;align-items:center;gap:10px;
}
.ae-cc-title::before{
  content:'';display:inline-block;width:7px;height:7px;border-radius:50%;
  background:linear-gradient(135deg,#ff6348,#ff4757);
  box-shadow:0 0 10px rgba(255,91,79,.7);
}
.ae-cc-close{
  width:28px;height:28px;border-radius:50%;
  background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);
  color:#cbd5e1;font-size:20px;display:flex;align-items:center;justify-content:center;
  cursor:pointer;transition:all .22s cubic-bezier(.16,1,.3,1);line-height:1;
  box-shadow:0 4px 12px rgba(0,0,0,.3);
}
.ae-cc-close:hover{
  background:rgba(239,68,68,.25);color:#ff6b6b;border-color:rgba(239,68,68,.5);
  transform:rotate(90deg) scale(1.1);
  box-shadow:0 0 16px rgba(239,68,68,.4);
}

/* ── Tool Grid (Dark Frosted Pills) ── */
.ae-tools{
  display:grid;grid-template-columns:repeat(7,1fr);gap:8px;
  padding:14px 20px;
  background:rgba(0,0,0,.2);
  border-bottom:1px solid rgba(255,255,255,.08);flex-shrink:0;
  max-height:230px;overflow:hidden;opacity:1;transform:translateY(0);
  transition:max-height .35s cubic-bezier(.16,1,.3,1),padding .35s cubic-bezier(.16,1,.3,1),opacity .2s ease,transform .35s cubic-bezier(.16,1,.3,1),border-color .2s ease;
}
.ae-cc.tools-collapsed .ae-tools{
  max-height:0;padding-top:0;padding-bottom:0;opacity:0;transform:translateY(-24px);
  border-bottom-color:transparent;pointer-events:none;
}
.ae-cc.ae-dashboard-mode .ae-tools,.ae-cc.ae-dashboard-mode .ae-chatbar{display:none}
.ae-cc.ae-imageai-mode .ae-chatbar,.ae-cc.ae-calculator-mode .ae-chatbar,.ae-cc.ae-currconv-mode .ae-chatbar,.ae-cc.ae-unitconv-mode .ae-chatbar{display:none}
.ae-focus-panel{max-width:560px;margin:0 auto;padding:20px 8px}
.ae-focus-entry{border:1px solid rgba(255,255,255,.14);border-radius:18px;background:linear-gradient(135deg,rgba(56,189,248,.12),rgba(15,23,42,.5));box-shadow:0 10px 26px rgba(0,0,0,.22),inset 0 1px 0 rgba(255,255,255,.08);overflow:hidden}
.ae-focus-card{width:100%;display:flex;align-items:center;gap:14px;padding:16px;border:0;background:transparent;color:#fff;text-align:left;font:inherit;cursor:pointer}
.ae-focus-card:hover{background:rgba(56,189,248,.1)}
.ae-focus-card-icon{width:38px;height:38px;display:grid;place-items:center;flex:0 0 38px;border:1px solid rgba(56,189,248,.42);border-radius:12px;background:rgba(56,189,248,.14);font-size:18px}
.ae-focus-card-copy{flex:1;min-width:0}
.ae-focus-kicker{color:#38bdf8;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:3px}
.ae-focus-title{font-size:17px;font-weight:800;color:#fff}
.ae-focus-card-desc{margin-top:3px;color:#94a3b8;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ae-focus-card-arrow{color:#7dd3fc;font-size:18px;transition:transform .25s ease}
.ae-focus-entry.open .ae-focus-card-arrow{transform:rotate(90deg)}
.ae-focus-controls{display:none;padding:0 16px 16px}
.ae-focus-entry.open .ae-focus-controls{display:block}
.ae-focus-copy{color:#94a3b8;font-size:13px;margin-bottom:16px}
.ae-focus-mode{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}
.ae-focus-mode label{display:flex;flex-direction:column;gap:6px;padding:12px;border:1px solid rgba(255,255,255,.12);border-radius:14px;background:rgba(0,0,0,.18);color:#cbd5e1;font-size:12px;font-weight:600;cursor:pointer}
.ae-focus-mode label:has(input:checked){border-color:rgba(56,189,248,.7);background:rgba(56,189,248,.12);color:#fff}
.ae-focus-mode input{accent-color:#38bdf8}
.ae-focus-goal{width:100%;min-height:74px;padding:12px;border:1px solid rgba(255,255,255,.14);border-radius:14px;background:rgba(0,0,0,.22);color:#fff;font:inherit;font-size:13px;resize:vertical;outline:none}
.ae-focus-goal:focus{border-color:rgba(56,189,248,.7);box-shadow:0 0 0 3px rgba(56,189,248,.15)}
.ae-focus-action{width:100%;margin-top:12px;padding:12px;border:0;border-radius:13px;background:linear-gradient(135deg,#38bdf8,#388bff);color:#fff;font:inherit;font-weight:700;cursor:pointer}
.ae-focus-action.stop{background:rgba(239,68,68,.2);border:1px solid rgba(239,68,68,.45);color:#fecaca}
.ae-focus-status{margin-top:14px;padding:12px;border-left:3px solid #38bdf8;background:rgba(56,189,248,.08);color:#cbd5e1;font-size:12px;line-height:1.5}
.ae-dashboard-focus-tile{position:fixed;top:0;left:50%;width:240px;height:150px;transform:translateX(-50%);z-index:2147483647;pointer-events:none;animation:aeNotchTileIn .32s cubic-bezier(.16,1,.3,1) both}
.ae-dashboard-focus-button{position:absolute;width:48px;height:48px;border:1px solid rgba(255,255,255,.28);border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle at 35% 30%,rgba(148,163,184,.26),rgba(15,23,42,.94));color:#e0f2fe;font-size:19px;cursor:pointer;pointer-events:auto;box-shadow:0 8px 20px rgba(0,0,0,.45),0 0 14px rgba(148,163,184,.14);transition:transform .24s cubic-bezier(.16,1,.3,1),box-shadow .24s ease,background .24s ease}
.ae-dashboard-focus-button:hover{transform:scale(1.14);box-shadow:0 10px 26px rgba(0,0,0,.5),0 0 22px rgba(56,189,248,.32);background:radial-gradient(circle at 35% 30%,rgba(56,189,248,.38),rgba(15,23,42,.96))}
.ae-dashboard-focus-button span{display:block;font-size:8px;font-weight:700;letter-spacing:.5px;margin-top:1px}
.ae-dashboard-focus-button:nth-child(1){left:18px;top:16px;animation:aeDashboardButtonIn .38s .04s both}
.ae-dashboard-focus-button:nth-child(2){right:18px;top:16px;animation:aeDashboardButtonIn .38s .1s both}
.ae-dashboard-focus-button:nth-child(3){left:62px;top:76px;animation:aeDashboardButtonIn .38s .16s both}
.ae-dashboard-focus-button:nth-child(4){right:62px;top:66px;animation:aeDashboardButtonIn .38s .22s both}
.ae-dashboard-focus-tile.ae-dashboard-focus-expanded{pointer-events:auto;top:58px;width:min(360px,calc(100vw - 24px));height:auto;max-height:calc(100vh - 76px);overflow-y:auto;background:rgba(12,18,28,.88);backdrop-filter:blur(18px) saturate(135%);-webkit-backdrop-filter:blur(18px) saturate(135%);border:1px solid rgba(255,255,255,.16);border-radius:18px;box-shadow:0 18px 42px rgba(0,0,0,.55)}
.ae-dashboard-focus-tile.ae-dashboard-focus-expanded .ae-focus-panel{padding:8px}
.ae-dashboard-focus-tile.ae-dashboard-focus-expanded .ae-focus-entry{background:transparent;border:0;box-shadow:none}
.ae-dashboard-focus-modal{pointer-events:auto;position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;padding:0;background:rgba(4,8,16,.58);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);animation:aeFadeIn .24s ease-out}
.ae-dashboard-focus-card{width:100%;height:100%;max-height:none;box-sizing:border-box;overflow-y:auto;background:linear-gradient(145deg,rgba(30,43,56,.96),rgba(10,18,29,.96));border:1px solid rgba(255,255,255,.17);border-radius:0;box-shadow:0 28px 80px rgba(0,0,0,.65),inset 0 1px 0 rgba(255,255,255,.1);animation:aeDashboardModalCardIn .35s cubic-bezier(.16,1,.3,1) both}
.ae-dashboard-focus-header{display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid rgba(255,255,255,.1)}
.ae-dashboard-focus-heading{color:#fff;font-size:17px;font-weight:800}
.ae-dashboard-focus-subheading{margin-top:3px;color:#94a3b8;font-size:11px}
.ae-dashboard-focus-close{width:30px;height:30px;border:1px solid rgba(255,255,255,.14);border-radius:50%;background:rgba(255,255,255,.07);color:#cbd5e1;font-size:20px;line-height:1;cursor:pointer}
.ae-dashboard-focus-close:hover{background:rgba(239,68,68,.25);color:#fff}
.ae-dashboard-focus-card .ae-focus-panel{padding:8px 22px 22px}
.ae-dashboard-focus-card .ae-focus-entry{border:0;background:transparent;box-shadow:none}
.ae-dashboard-focus-card .ae-focus-card{display:none}
.ae-dashboard-focus-card .ae-focus-controls{display:block}
.ae-dashboard-focus-card .ae-focus-panel{max-width:none;margin:0;padding:0}
.ae-focus-workspace{display:grid;grid-template-columns:178px minmax(0,1fr);min-height:calc(100vh - 74px);background:#050505;color:#f5f5f5;font-family:'Outfit',sans-serif}
.ae-focus-sidebar{display:flex;flex-direction:column;padding:28px 18px 24px;border-right:1px solid rgba(255,255,255,.08)}
.ae-focus-brand{display:flex;align-items:flex-start;gap:10px;margin-bottom:28px;font-size:23px;font-weight:700;line-height:1.05}
.ae-focus-brand-dot{width:14px;height:14px;margin-top:2px;border-radius:50%;background:#ff3f4b;box-shadow:0 0 14px rgba(255,63,75,.45);flex:0 0 14px}
.ae-focus-session-list{display:flex;flex-direction:column;gap:7px}
.ae-focus-session{min-height:54px;padding:0 16px;border:0;border-radius:26px;background:#807a77;color:#fff;text-align:left;font:600 12px 'Outfit',sans-serif;cursor:pointer;transition:transform .2s ease,filter .2s ease,background .2s ease}
.ae-focus-session:nth-child(2){background:#99928e}.ae-focus-session:nth-child(3){background:#b2aaa6}.ae-focus-session:nth-child(4){background:#d0c8c4}
.ae-focus-session:hover{transform:translateX(3px);filter:brightness(1.08)}
.ae-focus-session.active{outline:2px solid #873cff;outline-offset:2px;filter:brightness(1.08)}
.ae-focus-start{margin-top:auto;width:100%;min-height:34px;border:0;border-radius:18px;background:#7d35ed;color:#fff;font:700 11px 'Outfit',sans-serif;cursor:pointer;box-shadow:0 6px 18px rgba(125,53,237,.3)}
.ae-focus-start:hover{background:#934fff}
.ae-focus-main{min-width:0;padding:28px 28px 32px;overflow:auto}
.ae-focus-main-heading{margin-bottom:18px;color:#fff;font-size:14px;font-weight:700;text-transform:lowercase}
.ae-focus-grid{display:grid;grid-template-columns:minmax(280px,1.1fr) minmax(260px,.9fr);gap:16px;max-width:980px;margin:0 auto}
.ae-focus-surface{background:#1b1b1d;border:1px solid rgba(255,255,255,.05);border-radius:11px;box-shadow:0 12px 28px rgba(0,0,0,.25)}
.ae-focus-timer{min-height:266px;padding:18px;display:flex;flex-direction:column;align-items:center;text-align:center}
.ae-focus-timer-label{color:#f4a51c;font-size:12px;font-weight:700;margin-bottom:4px}
.ae-focus-clock{width:174px;height:174px;margin:0 auto 12px;border:4px solid #29292a;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#873cff 0 28%,transparent 28% 100%);box-shadow:inset 0 0 0 9px #151516}
.ae-focus-clock-inner{width:140px;height:140px;border-radius:50%;display:grid;place-items:center;align-content:center;background:#161617}
.ae-focus-time{font-family:'JetBrains Mono',monospace;font-size:28px;font-weight:700;letter-spacing:0;color:#f5f5f5}.ae-focus-cycle{margin-top:2px;color:#d5d5d5;font-size:11px}
.ae-focus-next{margin-top:auto;color:#85858b;font-size:12px}.ae-focus-timer-actions{display:flex;align-items:center;gap:20px;margin-top:8px}.ae-focus-timer-action{border:0;background:transparent;color:#d5d5d5;font-size:19px;cursor:pointer}.ae-focus-timer-action.play{width:36px;height:36px;border-radius:50%;background:#873cff;color:#fff;font-size:16px}
.ae-focus-week{min-height:266px;padding:20px 22px}.ae-focus-surface-title{font-size:13px;font-weight:700}.ae-focus-week-range{margin-top:5px;color:#ddd;font-size:11px}.ae-focus-bars{height:106px;display:flex;align-items:flex-end;justify-content:space-around;gap:10px;margin:18px 0 9px;border-bottom:1px solid rgba(255,255,255,.1)}
.ae-focus-bar-wrap{height:100%;display:flex;flex:1;flex-direction:column;align-items:center;justify-content:flex-end;gap:7px;color:#8e8e95;font-size:9px}.ae-focus-bar{width:9px;height:var(--bar);min-height:8px;border-radius:2px 2px 0 0;background:#8580dc}.ae-focus-bar.today{background:#9185f0}.ae-focus-week-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.ae-focus-stat strong{display:block;font-size:14px}.ae-focus-stat span{display:block;margin-top:3px;color:#8e8e95;font-size:9px}.ae-focus-stat.positive strong{color:#38b77b}
.ae-focus-tasks{grid-column:1 / -1;min-height:200px;padding:18px 14px}.ae-focus-tasks-subtitle{margin-top:9px;color:#8e8e95;font-size:11px}.ae-focus-task-list{display:grid;gap:6px;margin-top:14px}.ae-focus-task{display:flex;align-items:center;gap:9px;min-height:33px;padding:0 9px;border-radius:4px;background:#303032;color:#f0f0f0;font-size:11px}.ae-focus-task input{appearance:none;width:14px;height:14px;border:1px solid #68686d;border-radius:50%;cursor:pointer}.ae-focus-task input:checked{border-color:#8b80dc;background:radial-gradient(circle,#8b80dc 0 45%,transparent 48%)}.ae-focus-task.done span{text-decoration:line-through;color:#777}.ae-focus-task-add{display:flex;align-items:center;gap:6px;margin-top:10px}.ae-focus-task-add input{min-width:0;flex:1;border:0;border-bottom:1px solid #414144;padding:7px 2px;background:transparent;color:#fff;outline:0;font:11px inherit}.ae-focus-task-add button{width:25px;height:25px;border:1px solid #777;border-radius:50%;background:transparent;color:#ddd;cursor:pointer}
.ae-focus-goal-inline{width:100%;margin-top:13px;border:0;border-bottom:1px solid #414144;padding:7px 2px;background:transparent;color:#ddd;outline:0;font:11px 'Outfit',sans-serif}
@media (max-width:700px){.ae-focus-workspace{grid-template-columns:112px minmax(0,1fr)}.ae-focus-sidebar{padding:20px 10px}.ae-focus-brand{font-size:17px}.ae-focus-session{padding:0 10px;font-size:10px}.ae-focus-main{padding:20px 12px}.ae-focus-grid{grid-template-columns:1fr}.ae-focus-tasks{grid-column:auto}}
@keyframes aeDashboardButtonIn{from{opacity:0;transform:scale(.35) translateY(-8px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes aeDashboardModalCardIn{from{opacity:0;transform:translateY(-18px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
@media (prefers-reduced-motion:reduce){.ae-dashboard-focus-button{animation:none!important}}
.ae-dashboard-focus-tile .ae-focus-panel{padding:8px}
.ae-dashboard-focus-tile .ae-focus-entry{background:transparent;border:0;box-shadow:none}
.ae-tool{
  display:flex;flex-direction:column;align-items:center;gap:5px;
  padding:10px 4px;border-radius:18px;cursor:pointer;
  background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);
  backdrop-filter:blur(10px);
  box-shadow:0 4px 12px rgba(0,0,0,.25);
  color:#cbd5e1;
  transition:all .25s cubic-bezier(.16,1,.3,1);
}
.ae-tool:hover{
  background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.22);color:#ffffff;
  transform:translateY(-3px);
  box-shadow:0 8px 20px rgba(0,0,0,.4);
}
.ae-tool.active{
  background:linear-gradient(135deg,#ff6348,#ff4757);
  color:#ffffff;
  border-color:transparent;
  box-shadow:0 8px 22px rgba(255,75,60,.45), 0 2px 6px rgba(255,75,60,.2);
  transform:translateY(-2px);
}
.ae-tool-icon{font-size:20px;line-height:1;transition:transform .2s ease}
.ae-tool:hover .ae-tool-icon{transform:scale(1.12)}
.ae-tool-label{font-size:10px;font-weight:600;color:#94a3b8;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%}
.ae-tool:hover .ae-tool-label{color:#f1f5f9}
.ae-tool.active .ae-tool-label{color:#ffffff;font-weight:700}

/* ── Content Body ── */
.ae-body{
  flex:1;overflow-y:auto;padding:24px 28px;
  scrollbar-width:thin;scrollbar-color:rgba(255,255,255,.18) transparent;
}
.ae-body.ae-feature-chat-mode{display:block}
.ae-body::-webkit-scrollbar{width:6px}
.ae-body::-webkit-scrollbar-track{background:transparent}
.ae-body::-webkit-scrollbar-thumb{background:rgba(255,255,255,.18);border-radius:4px}
.ae-body::-webkit-scrollbar-thumb:hover{background:rgba(255,91,79,.6)}

/* ── Chat Bar (Dark Frosted Inset Input + Coral Send Button) ── */
.ae-chatbar{
  display:flex;align-items:center;gap:12px;padding:14px 24px;
  border-top:1px solid rgba(255,255,255,.09);flex-shrink:0;
  background:rgba(10,14,24,.55);
  backdrop-filter:blur(16px);
}
.ae-chatbar input{
  flex:1;height:44px;border-radius:18px;
  background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.12);
  backdrop-filter:blur(10px);
  box-shadow:inset 2px 2px 5px rgba(0,0,0,.35), inset -1px -1px 2px rgba(255,255,255,.06);
  color:#ffffff;font-family:inherit;font-size:14px;padding:0 18px;outline:none;
  transition:all .22s;
}
.ae-chatbar input:focus{
  border-color:rgba(255,91,79,.6);background:rgba(0,0,0,.45);
  box-shadow:0 0 0 3px rgba(255,91,79,.2), inset 2px 2px 5px rgba(0,0,0,.3);
}
.ae-chatbar input::placeholder{color:#64748b}
.ae-chatbar button{
  width:44px;height:44px;border-radius:18px;
  background:linear-gradient(135deg,#ff6348,#ff4757);border:none;color:#fff;font-size:16px;
  display:flex;align-items:center;justify-content:center;cursor:pointer;
  transition:all .22s cubic-bezier(.16,1,.3,1);flex-shrink:0;
  box-shadow:0 6px 18px rgba(255,75,60,.4);
}
.ae-chatbar button:hover{
  transform:scale(1.08) translateY(-1px);
  box-shadow:0 9px 24px rgba(255,75,60,.52);
}
.ae-chatbar button:active{transform:scale(1)}

/* ── Feature Header ── */
.ae-feat-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;gap:12px;flex-wrap:wrap}
.ae-feat-title{font-size:20px;font-weight:800;color:#ffffff;display:flex;align-items:center;gap:8px}

/* ── Dark Frosted Glass Card ── */
.ae-glass{
  background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);
  backdrop-filter:blur(16px);
  border-radius:24px;padding:20px;
  box-shadow:0 8px 24px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.08);
  color:#f1f5f9;
  transition:all .25s ease;
}
.ae-glass:hover{
  background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.2);
  box-shadow:0 12px 32px rgba(0,0,0,.42);
  transform:translateY(-2px);
}

/* ── No-Text Prompt ── */
.ae-notext{
  text-align:center;padding:48px 24px;color:#94a3b8;
}
.ae-notext-title{font-size:20px;font-weight:800;margin-bottom:8px;color:#ffffff}
.ae-notext textarea{
  width:100%;height:115px;margin-top:16px;padding:16px;border-radius:18px;
  background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.12);
  backdrop-filter:blur(10px);
  box-shadow:inset 3px 3px 6px rgba(0,0,0,.4);
  color:#ffffff;font-family:inherit;font-size:14px;resize:vertical;outline:none;
  transition:all .2s;
}
.ae-notext textarea:focus{border-color:rgba(255,91,79,.6);background:rgba(0,0,0,.45);box-shadow:0 0 0 3px rgba(255,91,79,.2)}
.ae-notext button{
  margin-top:16px;padding:12px 32px;border-radius:16px;
  background:linear-gradient(135deg,#ff6348,#ff4757);border:none;color:#fff;font-weight:700;cursor:pointer;
  transition:all .22s;box-shadow:0 8px 20px rgba(255,75,60,.4);
}
.ae-notext button:hover{transform:translateY(-2px);box-shadow:0 12px 26px rgba(255,75,60,.52)}

/* ── Spinner & Error ── */
.ae-spinner-wrap{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:44px 0;gap:14px;color:#94a3b8;font-size:13.5px}
.ae-spinner{width:44px;height:44px;border:3px solid rgba(255,91,79,.2);border-top-color:#ff5b4f;border-radius:50%;animation:aeSpin .8s linear infinite}
.ae-error{color:#fca5a5;background:rgba(239,68,68,.15);backdrop-filter:blur(10px);padding:16px 20px;border-radius:18px;border:1px solid rgba(239,68,68,.35);font-size:13.5px;line-height:1.55;box-shadow:0 6px 16px rgba(0,0,0,.3)}

/* ── Tooltip (Dark Frosted Glass Pill) ── */
.ae-tooltip{
  position:fixed;
  isolation:isolate;overflow:hidden;
  background:none/*linear-gradient(135deg,rgba(148, 158, 168, 0),rgba(29, 30, 31, 0.03) 48%,rgba(128, 138, 148, 0))*/;
  backdrop-filter:blur(1.8px) saturate(135%);-webkit-backdrop-filter:blur(1.8px) saturate(135%);
  border:1px solid rgba(38, 41, 44, 0.01);border-radius:20px;
  padding:7px 9px;display:flex;align-items:center;gap:6px;
  z-index:2147483647;pointer-events:auto;
  box-shadow:0 18px 42px rgba(0,0,0,.7),0 3px 10px rgba(255, 255, 255, 0.45) inset,0 -1px 0 rgba(255,91,79,.18) inset;
  transform-origin:center bottom;
  width:44px;height:44px;padding:3px;border-radius:50%;
  animation:aeLiquidGlassIn .42s cubic-bezier(.16,1.35,.3,1) both;
  transition:width .45s cubic-bezier(.16,1,.3,1),height .3s ease,border-radius .3s ease,padding .3s ease;
}
.ae-tooltip.ae-tooltip-expanded{width:auto;height:50px;padding:7px 9px;border-radius:20px}
.ae-tooltip::before{
  content:'';position:absolute;inset:0;z-index:-1;pointer-events:none;
  background:linear-gradient(112deg,rgba(255,255,255,.12),transparent 28%,transparent 68%,rgba(255,91,79,.12));
  transform:translateX(-100%);animation:aeGlassSheen 1.1s .12s ease-out both;
}
.ae-tooltip::after{
  content:'';position:absolute;left:12%;right:12%;top:0;height:1px;pointer-events:none;
  background:linear-gradient(90deg,transparent,rgba(203, 213, 225, 0.09),transparent);opacity:.7;
}
.ae-tt-btn{
  width:36px;height:36px;border-radius:12px;background:rgba(15,23,42,.72);border:1px solid rgba(148,163,184,.16);
  color:#cbd5e1;font-size:15px;
  display:flex;align-items:center;justify-content:center;cursor:pointer;
  transition:all .2s cubic-bezier(.16,1,.3,1);
  box-shadow:0 2px 6px rgba(0,0,0,.2);
}
.ae-tt-btn:hover{background:linear-gradient(135deg,#ff6348,#ff4757);color:#fff;border-color:transparent;transform:translateY(-3px) scale(1.08);box-shadow:0 8px 16px rgba(255,75,60,.4)}
.ae-tt-btn:active{transform:translateY(-1px) scale(.96)}
.ae-tt-launcher{width:36px;height:36px;padding:0;border:0;border-radius:50%;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;animation:aeTooltipOrbIn .55s cubic-bezier(.16,1.3,.3,1) both}
.ae-tt-launcher-image{width:100%;height:100%;display:block;border-radius:50%;object-fit:cover;filter:drop-shadow(0 3px 6px rgba(0,0,0,.4))}
.ae-tt-actions{display:flex;align-items:center;gap:6px;overflow:hidden;opacity:0;width:0;transform-origin:left center}
.ae-tooltip-expanded .ae-tt-actions{width:auto;opacity:1;animation:aeTooltipExpand .4s .05s cubic-bezier(.16,1,.3,1) both}
.ae-tooltip-expanded .ae-tt-btn{animation:aeTooltipButtonIn .3s cubic-bezier(.16,1,.3,1) both}
.ae-tooltip-expanded .ae-tt-btn:nth-child(2){animation-delay:.03s}.ae-tooltip-expanded .ae-tt-btn:nth-child(3){animation-delay:.06s}.ae-tooltip-expanded .ae-tt-btn:nth-child(4){animation-delay:.09s}.ae-tooltip-expanded .ae-tt-btn:nth-child(5){animation-delay:.12s}.ae-tooltip-expanded .ae-tt-btn:nth-child(6){animation-delay:.15s}.ae-tooltip-expanded .ae-tt-btn:nth-child(7){animation-delay:.18s}

@keyframes aeLiquidGlassIn{
  0%{opacity:0;transform:translateY(8px) scale(.78);filter:blur(5px)}
  65%{opacity:1;transform:translateY(-2px) scale(1.025);filter:blur(0)}
  100%{opacity:1;transform:translateY(0) scale(1);filter:blur(0)}
}
@keyframes aeGlassSheen{
  0%{transform:translateX(-100%)}
  100%{transform:translateX(100%)}
}
@media (prefers-reduced-motion:reduce){
  .ae-tooltip,.ae-tooltip::before{animation:none}
  .ae-tooltip{opacity:1;transform:none;transition:none}
  .ae-tt-launcher,.ae-tt-actions,.ae-tooltip-expanded .ae-tt-btn{animation:none}
  .ae-tooltip-expanded .ae-tt-actions{opacity:1}
}

/* ── Summary Styles ── */
.ae-tag{display:inline-block;padding:5px 14px;border-radius:14px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;margin-bottom:14px;background:rgba(255,91,79,.18);color:#ff7a6e;border:1px solid rgba(255,91,79,.38);box-shadow:0 4px 10px rgba(0,0,0,.2)}
.ae-section{margin-bottom:22px}
.ae-section h3{font-size:13px;font-weight:800;color:#94a3b8;text-transform:uppercase;letter-spacing:.8px;margin-bottom:12px}
.ae-tldr{font-size:15px;line-height:1.7;color:#f1f5f9;padding:18px 22px;background:rgba(255,255,255,.05);backdrop-filter:blur(12px);border-radius:20px;border:1px solid rgba(255,255,255,.1);border-left:4px solid #ff5b4f;box-shadow:0 6px 18px rgba(0,0,0,.25)}
.ae-bullets{list-style:none;display:flex;flex-direction:column;gap:10px}
.ae-bullets li{font-size:14px;color:#cbd5e1;padding-left:22px;position:relative;line-height:1.6}
.ae-bullets li::before{content:'✦';position:absolute;left:0;color:#ff5b4f;font-size:12px;top:2px}
.ae-actions{list-style:none;display:flex;flex-direction:column;gap:9px}
.ae-actions li{font-size:13.5px;color:#cbd5e1;padding:10px 16px;background:rgba(255,255,255,.04);backdrop-filter:blur(10px);border-radius:14px;border:1px solid rgba(255,255,255,.08);box-shadow:0 3px 10px rgba(0,0,0,.2);transition:all .2s ease}
.ae-actions li:hover{transform:translateX(4px);background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.18);color:#fff}
.ae-actions li::before{content:'☐ ';color:#ff5b4f;font-weight:bold}

/* ── Dictionary Styles ── */
.ae-dict-word{font-size:32px;font-weight:800;margin-bottom:4px;color:#ffffff}
.ae-dict-pron{font-family:'JetBrains Mono',monospace;font-size:14px;color:#ff5b4f;margin-bottom:16px}
.ae-dict-meaning{font-size:15px;color:#f1f5f9;padding:18px 22px;background:rgba(255,255,255,.05);backdrop-filter:blur(12px);border-radius:20px;border:1px solid rgba(255,255,255,.1);border-left:4px solid #ff5b4f;box-shadow:0 6px 18px rgba(0,0,0,.25);margin-bottom:18px}
.ae-pills{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px}
.ae-pill{padding:6px 16px;border-radius:20px;font-size:12px;font-weight:600;transition:all .2s;background:rgba(255,255,255,.06);backdrop-filter:blur(8px);color:#cbd5e1;border:1px solid rgba(255,255,255,.12);box-shadow:0 3px 10px rgba(0,0,0,.2)}
.ae-pill:hover{background:#ff5b4f;color:#fff;border-color:transparent;transform:translateY(-2px);box-shadow:0 6px 14px rgba(255,91,79,.4)}
.ae-eli5{background:rgba(251,191,36,.12);backdrop-filter:blur(12px);border:1px solid rgba(251,191,36,.28);border-radius:20px;padding:20px;margin-top:16px;box-shadow:0 6px 16px rgba(0,0,0,.25)}
.ae-eli5 h4{color:#fbbf24;font-size:14.5px;margin-bottom:8px;font-weight:700}
.ae-eli5 p{font-size:14px;color:#fef08a;line-height:1.6}

/* ── Geo Styles ── */
.ae-geo{display:flex;gap:20px;flex-wrap:wrap}
.ae-geo-info{flex:1;min-width:260px}
.ae-geo-map{flex:1;min-width:260px;min-height:280px;border-radius:22px;overflow:hidden;border:1.5px solid rgba(255,255,255,.12);box-shadow:0 8px 24px rgba(0,0,0,.35)}
.ae-geo-map iframe{width:100%;height:100%;border:none;min-height:280px}
.ae-geo-title{font-size:24px;font-weight:800;margin-bottom:16px;color:#ffffff}
.ae-timeline{position:relative;padding-left:22px;margin-top:18px}
.ae-timeline::before{content:'';position:absolute;left:7px;top:0;bottom:0;width:2px;background:rgba(255,255,255,.2)}
.ae-tl-item{position:relative;margin-bottom:16px;padding-left:16px;font-size:14px;color:#cbd5e1;line-height:1.55}
.ae-tl-item::before{content:'';position:absolute;left:-19px;top:6px;width:10px;height:10px;border-radius:50%;background:#ff5b4f;box-shadow:0 0 8px rgba(255,91,79,.7)}

/* ── Image Intelligence ── */
.ae-img-preview{display:block;max-width:100%;max-height:270px;object-fit:contain;border-radius:20px;margin-bottom:20px;border:1.5px solid rgba(255,255,255,.14);box-shadow:0 8px 24px rgba(0,0,0,.4)}
.ae-ocr-box{font-family:'JetBrains Mono',monospace;font-size:13px;background:rgba(0,0,0,.35);backdrop-filter:blur(10px);padding:16px;border-radius:16px;color:#cbd5e1;white-space:pre-wrap;border:1px solid rgba(255,255,255,.1);box-shadow:inset 2px 2px 6px rgba(0,0,0,.4);max-height:150px;overflow-y:auto}

/* ── Chat Bubbles ── */
.ae-chat-thread{display:flex;flex-direction:column;gap:12px;margin-top:16px;overflow:visible;padding:4px}
.ae-feature-chat{width:100%;margin-top:24px}
.ae-feature-chat .ae-section{margin-bottom:0}
.ae-chat-bubble{padding:14px 18px;border-radius:20px;font-size:14px;line-height:1.6;max-width:85%;word-wrap:break-word}
.ae-chat-bubble p{margin-bottom:8px}
.ae-chat-bubble p:last-child{margin-bottom:0}
.ae-chat-bubble h1,.ae-chat-bubble h2,.ae-chat-bubble h3{margin-top:12px;margin-bottom:8px;font-weight:700;color:#fff}
.ae-chat-bubble h1{font-size:16px}
.ae-chat-bubble h2{font-size:15px}
.ae-chat-bubble h3{font-size:14px}
.ae-chat-bubble ul,.ae-chat-bubble ol{margin-bottom:12px;padding-left:20px;display:flex;flex-direction:column;gap:4px}
.ae-chat-bubble ul:last-child,.ae-chat-bubble ol:last-child{margin-bottom:0}
.ae-chat-bubble li{list-style-type:disc}
.ae-chat-bubble strong{font-weight:700;color:#fff}
.ae-chat-user{align-self:flex-end;background:linear-gradient(135deg,#ff6348,#ff4757);color:#fff;box-shadow:0 6px 16px rgba(255,75,60,.35);border-bottom-right-radius:4px}
.ae-chat-ai{align-self:flex-start;background:rgba(255,255,255,.08);backdrop-filter:blur(12px);color:#f1f5f9;box-shadow:0 6px 18px rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.12);border-bottom-left-radius:4px}
.ae-chat-input-bar{display:flex;gap:10px;margin-top:16px}
.ae-chat-input{flex:1;height:42px;border-radius:16px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(10px);box-shadow:inset 2px 2px 5px rgba(0,0,0,.35);color:#fff;font-family:inherit;font-size:13.5px;padding:0 16px;outline:none}
.ae-chat-input:focus{background:rgba(0,0,0,.45);border-color:rgba(255,91,79,.6)}
.ae-chat-send{width:42px;height:42px;border-radius:16px;background:linear-gradient(135deg,#ff6348,#ff4757);border:none;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;box-shadow:0 6px 16px rgba(255,75,60,.4)}
.ae-chat-send:hover{transform:scale(1.08)}

/* ── Narrate Controls ── */
.ae-narrate{display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.06);backdrop-filter:blur(10px);padding:6px 12px;border-radius:14px;border:1px solid rgba(255,255,255,.12);box-shadow:0 4px 12px rgba(0,0,0,.2)}
.ae-narrate-btn{background:transparent;border:none;color:#ff5b4f;cursor:pointer;font-size:18px;padding:4px;transition:all .2s}
.ae-narrate-btn:hover{transform:scale(1.15)}
.ae-narrate-sel{background:rgba(12,18,30,.85);color:#f1f5f9;border:1px solid rgba(255,255,255,.16);border-radius:10px;padding:4px 10px;font-size:12px;outline:none;max-width:140px}
.ae-narrate-sel option{background:#111827;color:#fff}

/* ── Translate ── */
.ae-trans-bar{display:flex;align-items:center;gap:12px;margin-bottom:18px;flex-wrap:wrap}
.ae-trans-bar select{flex:1;min-width:140px;background:rgba(0,0,0,.3);backdrop-filter:blur(10px);color:#fff;border:1px solid rgba(255,255,255,.14);box-shadow:inset 2px 2px 5px rgba(0,0,0,.35);border-radius:14px;padding:11px 16px;font-size:14px;outline:none}
.ae-trans-bar select option{background:#111827;color:#fff}
.ae-trans-bar button{padding:11px 24px;border-radius:14px;background:linear-gradient(135deg,#ff6348,#ff4757);border:none;color:#fff;font-weight:700;cursor:pointer;transition:all .22s;white-space:nowrap;box-shadow:0 6px 18px rgba(255,75,60,.4)}
.ae-trans-bar button:hover{transform:translateY(-2px);box-shadow:0 9px 24px rgba(255,75,60,.5)}
.ae-trans-result{background:rgba(255,255,255,.05);backdrop-filter:blur(12px);padding:20px;border-radius:20px;border:1px solid rgba(255,255,255,.1);box-shadow:0 6px 18px rgba(0,0,0,.25);font-size:15px;line-height:1.7;white-space:pre-wrap;min-height:75px;color:#f1f5f9}

/* ── Calculator ── */
.ae-calc-display{
  background:rgba(0,0,0,.45);border:1px solid rgba(255,255,255,.1);border-radius:20px;
  backdrop-filter:blur(12px);
  box-shadow:inset 3px 3px 6px rgba(0,0,0,.5);
  padding:18px 24px;margin-bottom:16px;text-align:right;
  font-family:'JetBrains Mono',monospace;font-size:32px;font-weight:700;color:#ffffff;
  min-height:72px;display:flex;align-items:center;justify-content:flex-end;
  overflow:hidden;word-break:break-all;
}
.ae-calc-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.ae-calc-key{
  padding:16px;border-radius:16px;font-size:20px;font-weight:700;
  background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
  backdrop-filter:blur(8px);
  color:#ffffff;cursor:pointer;transition:all .18s cubic-bezier(.16,1,.3,1);text-align:center;
  box-shadow:0 4px 12px rgba(0,0,0,.25);
}
.ae-calc-key:hover{background:rgba(255,255,255,.15);transform:translateY(-2px);box-shadow:0 8px 18px rgba(0,0,0,.35)}
.ae-calc-key:active{transform:scale(.95)}
.ae-calc-op{background:rgba(255,91,79,.18);color:#ff6b57;border-color:rgba(255,91,79,.35)}
.ae-calc-op:hover{background:rgba(255,91,79,.3);color:#fff}
.ae-calc-eq{background:linear-gradient(135deg,#ff6348,#ff4757);color:#fff;border-color:transparent;box-shadow:0 8px 20px rgba(255,75,60,.45)}
.ae-calc-eq:hover{transform:translateY(-2px) scale(1.03);box-shadow:0 12px 26px rgba(255,75,60,.55)}
.ae-calc-fn{background:rgba(255,255,255,.08);color:#94a3b8}
.ae-calc-fn:hover{background:rgba(255,255,255,.18);color:#fff}
.ae-calc-wide{grid-column:span 2}

/* ── Conversion Forms ── */
.ae-conv-row{display:flex;gap:12px;align-items:center;margin-bottom:16px;flex-wrap:wrap}
.ae-conv-row label{font-size:13.5px;color:#94a3b8;min-width:55px;font-weight:700}
.ae-conv-row select,.ae-conv-row input{
  flex:1;min-width:120px;padding:12px 16px;border-radius:14px;
  background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.12);
  backdrop-filter:blur(10px);
  box-shadow:inset 3px 3px 6px rgba(0,0,0,.35);
  color:#ffffff;font-family:inherit;font-size:14px;outline:none;transition:all .2s;
}
.ae-conv-row select:focus,.ae-conv-row input:focus{border-color:rgba(255,91,79,.6);background:rgba(0,0,0,.45)}
.ae-conv-row select option{background:#111827;color:#fff}
.ae-conv-result{font-size:28px;font-weight:800;color:#ff5b4f;text-align:center;padding:22px;background:rgba(255,255,255,.05);backdrop-filter:blur(12px);border-radius:20px;border:1px solid rgba(255,255,255,.12);box-shadow:0 8px 24px rgba(0,0,0,.3);margin-top:14px}

/* ── SmartMark ── */
.ae-mark-item{
  display:flex;justify-content:space-between;align-items:flex-start;gap:12px;
  padding:16px;border-radius:18px;background:rgba(255,255,255,.05);
  backdrop-filter:blur(10px);
  border:1px solid rgba(255,255,255,.09);margin-bottom:12px;
  box-shadow:0 4px 14px rgba(0,0,0,.2);
  transition:all .2s ease;
}
.ae-mark-item:hover{transform:translateX(4px);background:rgba(255,255,255,.09);box-shadow:0 8px 20px rgba(0,0,0,.3)}
.ae-mark-text{flex:1;font-size:14px;color:#cbd5e1;line-height:1.6;cursor:pointer}
.ae-mark-text:hover{color:#ffffff}
.ae-mark-meta{font-size:11px;color:#64748b;margin-top:6px}
.ae-mark-del{
  background:transparent;border:none;color:#64748b;cursor:pointer;
  font-size:16px;padding:4px 8px;border-radius:8px;transition:all .2s;flex-shrink:0;
}
.ae-mark-del:hover{background:rgba(239,68,68,.25);color:#fca5a5}
.ae-feature-clear{color:#ffffff!important;font-size:12px;padding:4px 12px}
.ae-feature-clear:hover{color:#ffffff!important;background:rgba(239,68,68,.25)}
.ae-history-result h4{margin:16px 0 8px;color:#ffffff;font-size:14px}
.ae-history-result p{margin:0 0 10px;color:#cbd5e1;line-height:1.6;white-space:pre-wrap}
.ae-history-result ul{margin:0 0 12px;padding-left:22px;color:#cbd5e1;line-height:1.6}
.ae-mark-save{
  padding:12px 24px;border-radius:16px;background:linear-gradient(135deg,#ff6348,#ff4757);
  border:none;color:#fff;font-weight:700;
  cursor:pointer;transition:all .22s;display:flex;align-items:center;gap:8px;
  font-size:14px;box-shadow:0 8px 20px rgba(255,75,60,.4);
}
.ae-mark-save:hover{transform:translateY(-2px);box-shadow:0 12px 26px rgba(255,75,60,.52)}

/* ── Clipboard ── */
.ae-clip-item{
  display:flex;justify-content:space-between;align-items:center;gap:12px;
  padding:14px 18px;border-radius:16px;background:rgba(255,255,255,.05);
  backdrop-filter:blur(10px);
  border:1px solid rgba(255,255,255,.09);margin-bottom:10px;font-size:14px;color:#cbd5e1;
  box-shadow:0 4px 12px rgba(0,0,0,.2);
  transition:all .2s;
}
.ae-clip-item:hover{transform:translateX(4px);background:rgba(255,255,255,.09);box-shadow:0 6px 16px rgba(0,0,0,.3)}
.ae-clip-copy{
  background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);color:#ff5b4f;cursor:pointer;font-size:14px;
  padding:6px 12px;border-radius:10px;transition:all .2s;flex-shrink:0;font-weight:700;
  box-shadow:0 2px 6px rgba(0,0,0,.2);
}
.ae-clip-copy:hover{background:#ff5b4f;color:#fff;transform:scale(1.06)}

/* ── Infographic ── */
.ae-info-title{font-size:24px;font-weight:800;margin-bottom:20px;color:#ffffff;text-align:center}
.ae-info-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px}
.ae-info-card{
  background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);
  backdrop-filter:blur(14px);
  border-radius:24px;padding:22px;display:flex;flex-direction:column;gap:12px;
  box-shadow:0 8px 24px rgba(0,0,0,.25);transition:all .25s ease;
}
.ae-info-card:hover{
  background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.2);
  box-shadow:0 12px 30px rgba(0,0,0,.35);
  transform:translateY(-4px);
}
.ae-info-card-icon{font-size:32px;line-height:1}
.ae-info-card h3{font-size:17px;font-weight:800;color:#ffffff}
.ae-info-card ul{list-style:none;font-size:14px;color:#cbd5e1;line-height:1.65;display:flex;flex-direction:column;gap:8px}
.ae-info-card li::before{content:'✦ ';color:#ff5b4f;font-size:12px}

/* ── Web Grounding Search ── */
.ae-search-input-row{display:flex;gap:10px;margin-bottom:18px}
.ae-search-input{flex:1;height:46px;border-radius:16px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(10px);box-shadow:inset 2px 2px 5px rgba(0,0,0,.35);color:#fff;font-family:inherit;font-size:14px;padding:0 18px;outline:none;transition:all .22s}
.ae-search-input:focus{border-color:rgba(255,91,79,.6);background:rgba(0,0,0,.45);box-shadow:0 0 0 3px rgba(255,91,79,.2),inset 2px 2px 5px rgba(0,0,0,.3)}
.ae-search-input::placeholder{color:#64748b}
.ae-search-btn{padding:0 24px;height:46px;border-radius:16px;background:linear-gradient(135deg,#ff6348,#ff4757);border:none;color:#fff;font-weight:700;font-size:14px;cursor:pointer;transition:all .22s;white-space:nowrap;box-shadow:0 6px 18px rgba(255,75,60,.4);flex-shrink:0}
.ae-search-btn:hover{transform:translateY(-2px);box-shadow:0 9px 24px rgba(255,75,60,.52)}
.ae-search-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}

.ae-grounded-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);backdrop-filter:blur(16px);border-radius:24px;padding:22px;box-shadow:0 8px 24px rgba(0,0,0,.3),inset 0 1px 0 rgba(255,255,255,.08);color:#f1f5f9;margin-top:18px}
.ae-grounded-header{display:flex;align-items:center;gap:14px;margin-bottom:16px}
.ae-grounded-thumb{width:64px;height:64px;border-radius:14px;object-fit:cover;border:1px solid rgba(255,255,255,.14);box-shadow:0 4px 12px rgba(0,0,0,.3);flex-shrink:0}
.ae-grounded-heading{font-size:20px;font-weight:800;color:#ffffff}
.ae-grounded-source{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:#ff7a6e;background:rgba(255,91,79,.15);border:1px solid rgba(255,91,79,.3);padding:3px 10px;border-radius:10px;margin-top:6px}
.ae-grounded-abstract{font-size:14.5px;line-height:1.7;color:#cbd5e1;margin-bottom:16px}
.ae-grounded-synthesis{font-size:15px;line-height:1.7;color:#f1f5f9;padding:18px 22px;background:rgba(255,255,255,.05);backdrop-filter:blur(12px);border-radius:20px;border:1px solid rgba(255,255,255,.1);border-left:4px solid #ff5b4f;box-shadow:0 6px 18px rgba(0,0,0,.25)}
.ae-grounded-link{display:inline-flex;align-items:center;gap:6px;color:#38bdf8;font-size:13px;font-weight:600;text-decoration:none;margin-top:12px;padding:6px 14px;border-radius:12px;background:rgba(56,189,248,.1);border:1px solid rgba(56,189,248,.2);transition:all .2s}
.ae-grounded-link:hover{background:rgba(56,189,248,.2);border-color:rgba(56,189,248,.4);transform:translateY(-1px)}

.ae-ground-btn{display:inline-flex;align-items:center;gap:8px;padding:10px 20px;border-radius:14px;background:rgba(56,189,248,.12);border:1px solid rgba(56,189,248,.3);color:#38bdf8;font-weight:700;font-size:13px;cursor:pointer;transition:all .22s;margin-top:12px;box-shadow:0 4px 12px rgba(0,0,0,.2)}
.ae-ground-btn:hover{background:rgba(56,189,248,.22);border-color:rgba(56,189,248,.5);transform:translateY(-2px);box-shadow:0 6px 18px rgba(56,189,248,.25)}
.ae-ground-btn:disabled{opacity:.5;cursor:not-allowed;transform:none}

/* ── Writing Assistant Polish Menu ── */
.ae-polish-menu{position:fixed;background:rgba(14,20,34,.92);backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);border:1.5px solid rgba(255,255,255,.18);border-radius:22px;padding:6px 8px;display:flex;align-items:center;gap:5px;z-index:2147483647;pointer-events:auto;box-shadow:0 14px 36px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.06) inset;animation:aeFadeIn .18s ease-out}
.ae-polish-logo{width:36px;height:36px;display:block;flex:0 0 36px;border-radius:50%;object-fit:cover;filter:drop-shadow(0 3px 6px rgba(0,0,0,.4))}
.ae-polish-btn{height:36px;border-radius:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#cbd5e1;font-size:12px;font-weight:600;display:flex;align-items:center;gap:5px;padding:0 12px;cursor:pointer;transition:all .2s cubic-bezier(.16,1,.3,1);box-shadow:0 2px 6px rgba(0,0,0,.2);white-space:nowrap;font-family:inherit}
.ae-polish-btn:hover{background:linear-gradient(135deg,#ff6348,#ff4757);color:#fff;border-color:transparent;transform:translateY(-2px) scale(1.04);box-shadow:0 6px 14px rgba(255,75,60,.4)}
.ae-polish-btn.ae-polish-loading{pointer-events:none;opacity:.7}
.ae-polish-btn .ae-polish-spinner{display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.2);border-top-color:#ff5b4f;border-radius:50%;animation:aeSpin .6s linear infinite}

.ae-polish-lang-picker{position:absolute;bottom:calc(100% + 6px);right:0;background:rgba(14,20,34,.95);backdrop-filter:blur(24px);border:1.5px solid rgba(255,255,255,.16);border-radius:16px;padding:8px;display:flex;flex-direction:column;gap:4px;z-index:2147483647;box-shadow:0 12px 32px rgba(0,0,0,.5);animation:aeFadeIn .15s ease-out;max-height:240px;overflow-y:auto}
.ae-polish-lang-opt{padding:8px 14px;border-radius:10px;font-size:13px;font-weight:500;color:#cbd5e1;cursor:pointer;transition:all .15s;border:none;background:transparent;text-align:left;font-family:inherit;white-space:nowrap}
.ae-polish-lang-opt:hover{background:rgba(255,91,79,.2);color:#fff}

/* ── Inline // Prompt Spinner ── */
.ae-prompt-indicator{position:absolute;display:flex;align-items:center;gap:6px;padding:4px 12px;border-radius:10px;background:rgba(14,20,34,.9);backdrop-filter:blur(16px);border:1px solid rgba(255,91,79,.3);color:#ff7a6e;font-size:12px;font-weight:600;font-family:'Outfit',sans-serif;z-index:2147483646;pointer-events:none;box-shadow:0 6px 16px rgba(0,0,0,.4);animation:aeFadeIn .15s ease-out}
.ae-prompt-indicator .ae-prompt-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#ff5b4f;animation:aePulse 1s ease-in-out infinite}
`;

// ============================================================================
// 2. INITIALIZATION
// ============================================================================
const host = document.createElement('aether-os-host');
host.style.cssText = 'all:initial;position:fixed;z-index:2147483647;top:0;left:0;width:0;height:0;pointer-events:none;';
document.documentElement.appendChild(host);
const shadow = host.attachShadow({ mode: 'open' });
const styleEl = document.createElement('style');
styleEl.textContent = SHADOW_STYLES;
shadow.appendChild(styleEl);
const uiRoot = document.createElement('div');
uiRoot.id = 'ae-root';
shadow.appendChild(uiRoot);

// ============================================================================
// 3. STATE
// ============================================================================
let ccOpen = false;
let notchEl = null;
let notchTile = null;
let notchTileHideTimeout = null;
let notchInactivityTimer = null;
let notchQuestionTimer = null;
let openTabs = [];
let dashboardFocusTile = null;
let dashboardFocusModal = null;
let dashboardTabsModal = null;
let ccBackdrop = null;
let ccPanel = null;
let ccBody = null;
let activeToolId = null;
let lastSelectedText = '';
let lastSelectionContext = '';
let pendingImageUrl = '';
let currentTooltip = null;
let tooltipTimeout = null;
let tooltipExpandTimeout = null;
let smartMarks = [];
let clipHistory = [];
let chatMessages = [];
const featureChatIds = new Set(['summarize', 'mindmap', 'infographic', 'geo']);
const featureChatMessages = { summarize: [], mindmap: [], infographic: [], geo: [] };
let aeSessions = [];
let activeUtterance = null;
let focusTimerInterval = null;
let calcDisplay = '0';
let calcPrev = null;
let calcOp = null;
let calcReset = false;

// Load saved Data
if (chrome.storage && chrome.storage.local) {
  chrome.storage.local.get(['smartMarks', 'clipHistory', 'aeSessions'], r => { 
    if (r.smartMarks) smartMarks = r.smartMarks; 
    if (r.clipHistory) clipHistory = r.clipHistory; 
    if (Array.isArray(r.aeSessions)) aeSessions = r.aeSessions;
  });
}

// ============================================================================
// 4. UTILITIES
// ============================================================================
function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function stripThink(text) {
  if (!text) return '';
  return String(text).replace(/<think[^>]*>[\s\S]*?(?:<\/think[^>]*>|$)/gi, '').trim();
}

function parseMarkdown(text) {
  if (!text) return '';
  let html = escapeHtml(text);
  
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  html = html.replace(/^[\-\*]\s+(.*)$/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*?<\/li>(?:\n<li>.*?<\/li>)*)/gim, '<ul>$1</ul>');
  
  html = html.split('\n\n').map(p => {
    if (p.trim().startsWith('<h') || p.trim().startsWith('<ul')) return p;
    return `<p>${p}</p>`;
  }).join('\n');
  
  html = html.replace(/\n/g, '<br>');
  html = html.replace(/<\/li><br>/g, '</li>');
  html = html.replace(/<ul><br>/g, '<ul>');
  html = html.replace(/<\/ul><br>/g, '</ul>');
  
  return html;
}
function showLoading(el, msg) {
  el.innerHTML = `<div class="ae-spinner-wrap"><div class="ae-spinner"></div>${escapeHtml(msg || 'Loading...')}</div>`;
}
function showError(el, msg) {
  el.innerHTML = `<div class="ae-error">${escapeHtml(msg)}</div>`;
}

function saveAeSession(toolId, title, source, result) {
  const sessionData = {
    id: 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
    toolId, title: title || toolId, source: String(source || '').slice(0, 12000),
    result: String(result || '').slice(0, 20000),
    messages: (featureChatMessages[toolId] || []).slice(),
    createdAt: new Date().toISOString()
  };
  const existingIndex = aeSessions.findIndex(item => item.toolId === toolId && item.source === sessionData.source);
  const session = existingIndex >= 0
    ? { ...aeSessions[existingIndex], ...sessionData, id: aeSessions[existingIndex].id, createdAt: aeSessions[existingIndex].createdAt }
    : sessionData;
  if (existingIndex >= 0) aeSessions.splice(existingIndex, 1);
  aeSessions.unshift(session);
  if (aeSessions.length > 100) aeSessions.length = 100;
  chrome.storage.local.set({ aeSessions });
  return session;
}

function updateLatestAeSession(toolId) {
  const source = featureChatMessages[toolId]?.[0]?.content;
  const session = aeSessions.find(item => item.toolId === toolId && item.source === source);
  if (session) {
    session.messages = featureChatMessages[toolId].slice();
    chrome.storage.local.set({ aeSessions });
  }
}

function sessionToolLabel(toolId) {
  return ({ summarize: 'Summary', mindmap: 'Mindmap', infographic: 'Infographic', geo: 'Geo-Explorer', aichat: 'AI Chat' })[toolId] || toolId;
}
function addFeatureClearButton(head, area, toolId, onClear) {
  if (head.querySelector('.ae-feature-clear')) return;
  const clearButton = document.createElement('button');
  clearButton.className = 'ae-feature-clear ae-mark-del';
  clearButton.type = 'button';
  clearButton.textContent = 'Clear';
  clearButton.title = 'Clear this feature';
  clearButton.onclick = () => {
    if (featureChatMessages[toolId]) featureChatMessages[toolId] = [];
    if (onClear) {
      onClear();
      return;
    }
    area.innerHTML = '<div class="ae-notext"><div class="ae-notext-title">Cleared</div><p>This feature is ready for a new request.</p></div>';
  };
  head.appendChild(clearButton);
}

function createNarratorControls(textFn) {
  const c = document.createElement('div');
  c.className = 'ae-narrate';
  const sel = document.createElement('select');
  sel.className = 'ae-narrate-sel';
  let voices = [];
  const populate = () => {
    voices = window.speechSynthesis.getVoices();
    sel.innerHTML = '';
    voices.forEach(v => {
      const o = document.createElement('option');
      o.value = v.name;
      o.textContent = `${v.name} (${v.lang})`;
      sel.appendChild(o);
    });
  };
  if (window.speechSynthesis.onvoiceschanged !== undefined) window.speechSynthesis.onvoiceschanged = populate;
  populate();
  const play = document.createElement('button');
  play.className = 'ae-narrate-btn'; play.innerHTML = '▶'; play.title = 'Play';
  play.onclick = () => {
    window.speechSynthesis.cancel();
    const t = typeof textFn === 'function' ? textFn() : textFn;
    if (!t) return;
    activeUtterance = new SpeechSynthesisUtterance(t);
    const v = voices.find(x => x.name === sel.value);
    if (v) activeUtterance.voice = v;
    window.speechSynthesis.speak(activeUtterance);
  };
  const stop = document.createElement('button');
  stop.className = 'ae-narrate-btn'; stop.innerHTML = '⏹'; stop.title = 'Stop';
  stop.onclick = () => window.speechSynthesis.cancel();
  c.appendChild(sel); c.appendChild(play); c.appendChild(stop);
  return c;
}

// Provide text or show textarea prompt for text-based tools
function ensureText(area, toolId, renderFn) {
  const text = lastSelectedText;
  if (text && text.length >= 2) { renderFn(area, text); return; }
  area.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'ae-notext';
  wrap.innerHTML = `<div class="ae-notext-title">No text selected</div><p>Select text on the page first, or paste/type below:</p><textarea placeholder="Paste or type text here..."></textarea><br><button>Process</button>`;
  area.appendChild(wrap);
  wrap.querySelector('button').onclick = () => {
    const v = wrap.querySelector('textarea').value.trim();
    if (v) { lastSelectedText = v; renderFn(area, v); }
  };
}

function beginFeatureChat(toolId, text) {
  const messages = featureChatMessages[toolId] || [];
  if (!messages.length || messages[0].content !== text) {
    featureChatMessages[toolId] = [{ role: 'user', content: text }];
  }
}

function renderFeatureChat(area, toolId) {
  const messages = featureChatMessages[toolId] || [];
  area.classList.add('ae-feature-chat-mode');
  let chat = area.querySelector('.ae-feature-chat');
  if (!chat) {
    chat = document.createElement('div');
    chat.className = 'ae-feature-chat';
    area.appendChild(chat);
  }
  chat.innerHTML = '';
  const thread = document.createElement('div');
  thread.className = 'ae-chat-thread';
  messages.slice(2).forEach(message => {
    const bubble = document.createElement('div');
    bubble.className = 'ae-chat-bubble ' + (message.role === 'user' ? 'ae-chat-user' : 'ae-chat-ai');
    bubble.innerHTML = message.role === 'user' ? escapeHtml(message.content) : parseMarkdown(stripThink(message.content));
    thread.appendChild(bubble);
  });
  chat.appendChild(thread);
  if (messages.length <= 2) {
    const hint = document.createElement('p');
    hint.style.cssText = 'color:#64748b;font-size:13px;margin:8px 0 0';
    hint.textContent = 'Ask a follow-up using the chat bar below.';
    chat.appendChild(hint);
  }
  thread.scrollTop = thread.scrollHeight;
}

function sendFeatureChat(input) {
  const toolId = activeToolId;
  const question = input.value.trim();
  if (!featureChatIds.has(toolId) || !question) return;
  const messages = featureChatMessages[toolId] || [];
  if (messages.length < 2) return;
  input.value = '';
  messages.push({ role: 'user', content: question });
  if (ccBody) renderFeatureChat(ccBody, toolId);
  chrome.runtime.sendMessage({ type: 'featureChat', toolId, messages }, response => {
    const error = chrome.runtime.lastError;
    if (error || !response?.success) {
      messages.push({ role: 'assistant', content: 'Error: ' + (error?.message || response?.error || 'Connection failed.') });
    } else {
      messages.push({ role: 'assistant', content: response.data });
    }
    updateLatestAeSession(toolId);
    if (activeToolId === toolId && ccBody) renderFeatureChat(ccBody, toolId);
  });
}

// ============================================================================
// 5. NOTCH + COMMAND CENTER
// ============================================================================
const TOOLS = [
  { id:'history', icon:'◷', label:'History' },
  { id:'smartmark', icon:'📝', label:'SmartMark' },
  { id:'calculator', icon:'🧮', label:'Calc' },
  { id:'unitconv', icon:'📐', label:'Units' },
  { id:'currconv', icon:'💱', label:'Currency' },
  { id:'clipboard', icon:'📋', label:'Clipboard' },
  { id:'aichat', icon:'🤖', label:'AI Chat' },
  { id:'search', icon:'🔍', label:'Search' },
  { id:'imageai', icon:'🖼️', label:'Image AI' },
  { id:'summarize', icon:'✦', label:'Summary', needsText:true },
  { id:'mindmap', icon:'◎', label:'Mind Map', needsText:true },
  { id:'infographic', icon:'📊', label:'Infographic', needsText:true },
  { id:'dictionary', icon:'📖', label:'Dictionary', needsText:true },
  { id:'geo', icon:'🌍', label:'Geo', needsText:true },
  { id:'translate', icon:'🌐', label:'Translate', needsText:true },
  { id:'narrate', icon:'🔊', label:'Narrate', needsText:true },
];

function createNotch() {
  const notch = document.createElement('div');
  notch.className = 'ae-notch';
  notchEl = notch;
  const image = document.createElement('img');
  image.className = 'ae-notch-image';
  image.src = chrome.runtime.getURL('dashboard/bloub.gif');
  image.alt = 'Open Aether Command Center';
  notch.appendChild(image);
  notch.onclick = (e) => {
    e.stopPropagation();
    resetNotchInactivity();
    if (document.documentElement.hasAttribute('data-aether-dashboard')) showDashboardFocusTile();
    else toggleCC();
  };
  uiRoot.appendChild(notch);
  resetNotchInactivity();
}

const NOTCH_PROMPTS = [
  'Are you there?',
  'What are you exploring?',
  'Need a quick hand?',
  'Want to save this thought?',
  'Ready for a tiny reset?'
];

function updateTabManager() {
  renderTabManager();
}

function renderTabManager() {
  chrome.runtime.sendMessage({ type: 'GET_ALL_TABS' }, (response) => {
    if (!response || !Array.isArray(response.tabs)) return;
    const uniqueTabs = [];
    const seen = new Set();
    response.tabs.forEach(tab => {
      const key = tab.url || '';
      if (!seen.has(key)) {
        seen.add(key);
        uniqueTabs.push(tab);
      }
    });
    openTabs = uniqueTabs;
    showTabsModal();
  });
}

function showTabsModal() {
  if (dashboardFocusTile) hideDashboardFocusTile();
  if (dashboardTabsModal) hideTabsModal();
  
  dashboardTabsModal = document.createElement('div');
  dashboardTabsModal.className = 'ae-dashboard-focus-modal';
  dashboardTabsModal.onclick = e => {
    if (e.target === dashboardTabsModal) hideTabsModal();
  };
  
  const card = document.createElement('section');
  card.className = 'ae-dashboard-focus-card';
  card.innerHTML = '<header class="ae-dashboard-focus-header"><div><div class="ae-dashboard-focus-heading">Open Tabs</div><div class="ae-dashboard-focus-subheading">Click to switch tabs</div></div><button class="ae-dashboard-focus-close" type="button" aria-label="Close Tabs">&times;</button></header><div class="ae-dashboard-focus-body" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px;padding:24px;width:100%;box-sizing:border-box"></div>';
  card.querySelector('.ae-dashboard-focus-close').onclick = hideTabsModal;
  
  const bodyContainer = card.querySelector('.ae-dashboard-focus-body');
  
  if (openTabs.length === 0) {
    bodyContainer.innerHTML = '<p style="grid-column:1/-1;color:#94a3b8;text-align:center;padding:20px">No tabs open</p>';
  } else {
    openTabs.forEach(tab => {
      const tabCard = document.createElement('div');
      tabCard.style.cssText = 'background:rgba(255,255,255,.08);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:14px;cursor:pointer;transition:all .3s;display:flex;flex-direction:column;gap:8px;min-height:120px';
      
      const favicon = tab.favIconUrl ? `<img src="${escapeHtml(tab.favIconUrl)}" style="width:24px;height:24px;border-radius:4px">` : '<div style="width:24px;height:24px;background:rgba(255,255,255,.2);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:12px">📄</div>';
      
      const hostname = new URL(tab.url || '').hostname || 'Unknown';
      
      tabCard.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px">
          ${favicon}
          <div style="flex:1;min-width:0">
            <div style="color:#fff;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:13px">${escapeHtml(tab.title || 'Untitled')}</div>
            <div style="color:#94a3b8;font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHtml(hostname)}</div>
          </div>
        </div>
        <div style="color:#cbd5e1;font-size:11px;line-height:1.4;flex:1;overflow:hidden;text-overflow:ellipsis">${escapeHtml(tab.url || '').substring(0, 60)}...</div>
      `;
      
      tabCard.onmouseover = () => {
        tabCard.style.background = 'rgba(255,255,255,.14)';
        tabCard.style.borderColor = 'rgba(255,255,255,.2)';
        tabCard.style.transform = 'translateY(-2px)';
      };
      tabCard.onmouseout = () => {
        tabCard.style.background = 'rgba(255,255,255,.08)';
        tabCard.style.borderColor = 'rgba(255,255,255,.1)';
        tabCard.style.transform = 'translateY(0)';
      };
      tabCard.onclick = (e) => { e.stopPropagation(); chrome.runtime.sendMessage({ type: 'SWITCH_TO_TAB', tabId: tab.id }); };
      
      bodyContainer.appendChild(tabCard);
    });
  }
  
  dashboardTabsModal.appendChild(card);
  uiRoot.appendChild(dashboardTabsModal);
}

function hideTabsModal() {
  if (!dashboardTabsModal) return;
  if (dashboardTabsModal.parentNode) dashboardTabsModal.parentNode.removeChild(dashboardTabsModal);
  dashboardTabsModal = null;
}

function showNotchTile(label, message) {
  if (!notchTile) {
    notchTile = document.createElement('button');
    notchTile.className = 'ae-notch-tile';
    notchTile.type = 'button';
    notchTile.onclick = (e) => { e.stopPropagation(); resetNotchInactivity(); openCC(); };
    uiRoot.appendChild(notchTile);
  }
  clearTimeout(notchTileHideTimeout);
  notchTile.classList.remove('ae-notch-tile-hiding');
  notchTile.innerHTML = `<span class="ae-notch-tile-label">${escapeHtml(label)}</span>${escapeHtml(message)}`;
  notchTile.offsetWidth;
  notchTile.classList.remove('ae-notch-tile-hiding');
  notchTileHideTimeout = setTimeout(hideNotchTile, 7000);
}

function hideNotchTile() {
  if (!notchTile) return;
  notchTile.classList.add('ae-notch-tile-hiding');
  clearTimeout(notchTileHideTimeout);
  notchTileHideTimeout = setTimeout(() => {
    if (notchTile && notchTile.parentNode) notchTile.parentNode.removeChild(notchTile);
    notchTile = null;
  }, 220);
}

function showNotchPrompt() {
  const prompt = NOTCH_PROMPTS[Math.floor(Math.random() * NOTCH_PROMPTS.length)];
  showNotchTile('Aether', prompt);
}

function resetNotchInactivity() {
  clearTimeout(notchInactivityTimer);
  clearTimeout(notchQuestionTimer);
  hideNotchTile();
  notchInactivityTimer = setTimeout(function startQuestionLoop() {
    if (!document.documentElement.hasAttribute('data-aether-dashboard')) {
      showNotchPrompt();
      notchQuestionTimer = setInterval(showNotchPrompt, 20000);
    }
  }, 300000);
}

function buildCC() {
  // Backdrop
  ccBackdrop = document.createElement('div');
  ccBackdrop.className = 'ae-backdrop';
  ccBackdrop.onclick = () => closeCC();

  // Panel
  ccPanel = document.createElement('div');
  ccPanel.className = 'ae-cc';
  if (document.documentElement.hasAttribute('data-aether-dashboard')) ccPanel.classList.add('ae-dashboard-mode');
  ccPanel.onclick = e => e.stopPropagation();

  // Header
  const header = document.createElement('div');
  header.className = 'ae-cc-header';
  const title = document.createElement('div');
  title.className = 'ae-cc-title';
  title.textContent = 'Aether\'s Workspace';
  const closeBtn = document.createElement('button');
  closeBtn.className = 'ae-cc-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.onclick = () => closeCC();
  header.appendChild(title);
  header.appendChild(closeBtn);

  // Tool Grid
  const tools = document.createElement('div');
  tools.className = 'ae-tools';
  TOOLS.forEach(t => {
    const btn = document.createElement('div');
    btn.className = 'ae-tool';
    btn.dataset.tool = t.id;
    btn.innerHTML = `<span class="ae-tool-icon">${t.icon}</span><span class="ae-tool-label">${t.label}</span>`;
    btn.onclick = () => activateTool(t.id);
    tools.appendChild(btn);
  });

  // Body
  ccBody = document.createElement('div');
  ccBody.className = 'ae-body';
  ccBody.innerHTML = '<div class="ae-notext"><div class="ae-notext-title">Welcome to Aether</div><p style="color:#64748b">Select a tool above, or highlight text on the page and use the toolbar.</p></div>';
  if (document.documentElement.hasAttribute('data-aether-dashboard')) renderFocusPanel(ccBody);

  // Chat Bar
  const chatbar = document.createElement('div');
  chatbar.className = 'ae-chatbar';
  const chatInput = document.createElement('input');
  chatInput.placeholder = 'Ask Aether Anything.......';
  chatInput.onkeydown = e => { if (e.key === 'Enter') sendChatFromBar(chatInput); };
  const chatSend = document.createElement('button');
  chatSend.innerHTML = '➤';
  chatSend.onclick = () => sendChatFromBar(chatInput);
  chatbar.appendChild(chatInput);
  chatbar.appendChild(chatSend);

  ccPanel.appendChild(header);
  ccPanel.appendChild(tools);
  ccPanel.appendChild(ccBody);
  ccPanel.appendChild(chatbar);
  ccBackdrop.appendChild(ccPanel);
}

function getFocusState(callback) {
  chrome.storage.local.get(['aetherFocusMode'], result => callback(result.aetherFocusMode || null));
}

function renderFocusPanel(area, expanded = false) {
  if (focusTimerInterval) clearInterval(focusTimerInterval);
  const tasks = ['chapter 1', 'chapter 2', 'chapter 3', 'chapter 4'];
  const sessionTypes = ['Reading', 'Work', 'Meditation', 'Study'];
  area.innerHTML = `<section class="ae-focus-panel"><div class="ae-focus-workspace">
    <aside class="ae-focus-sidebar"><div class="ae-focus-brand"><span class="ae-focus-brand-dot"></span><span>focus<br>sessions</span></div><div class="ae-focus-session-list">${sessionTypes.map((type, index) => `<button class="ae-focus-session${index === 0 ? ' active' : ''}" type="button" data-session="${type}">${type}</button>`).join('')}</div><button class="ae-focus-start" type="button">New focus session</button></aside>
    <main class="ae-focus-main"><div class="ae-focus-main-heading">focus session</div><div class="ae-focus-grid">
      <section class="ae-focus-surface ae-focus-timer"><div class="ae-focus-timer-label">Short Break</div><div class="ae-focus-clock"><div class="ae-focus-clock-inner"><div class="ae-focus-time">34:11</div><div class="ae-focus-cycle">Cycle: 1</div></div></div><div class="ae-focus-next">Next: Focus</div><div class="ae-focus-timer-actions"><button class="ae-focus-timer-action" type="button" aria-label="Reset timer">↩</button><button class="ae-focus-timer-action play" type="button" aria-label="Start or stop focus">▶</button></div></section>
      <section class="ae-focus-surface ae-focus-week"><div class="ae-focus-surface-title">July 7-13, 2025</div><div class="ae-focus-week-range">5h 41min of focus</div><div class="ae-focus-bars">${[['M',38],['T',50],['W',47],['T',48],['F',66],['S',10],['S',0]].map(([day, height], index) => `<div class="ae-focus-bar-wrap"><div class="ae-focus-bar${index === 4 ? ' today' : ''}" style="--bar:${height}px"></div><span>${day}</span></div>`).join('')}</div><div class="ae-focus-week-stats"><div class="ae-focus-stat"><strong>49min</strong><span>Daily Average</span></div><div class="ae-focus-stat"><strong>81</strong><span>Total Cycles</span></div><div class="ae-focus-stat positive"><strong>↑ 41%</strong><span>vs. Previous Week</span></div></div></section>
      <section class="ae-focus-surface ae-focus-tasks"><div class="ae-focus-surface-title">short tasks <span style="float:right;color:#aaa;font-size:18px;font-weight:400">⊕</span></div><div class="ae-focus-tasks-subtitle">Add tasks for your session</div><div class="ae-focus-task-list">${tasks.map(task => `<label class="ae-focus-task"><input type="checkbox"><span>${task}</span></label>`).join('')}</div><div class="ae-focus-task-add"><input type="text" placeholder="Add a short task"><button type="button" aria-label="Add task">+</button></div><input class="ae-focus-goal-inline" type="text" placeholder="What are you working on? (optional)"></section>
    </div></main>
  </div></section>`;

  const panel = area.querySelector('.ae-focus-panel');
  const goalInput = panel.querySelector('.ae-focus-goal-inline');
  const timeEl = panel.querySelector('.ae-focus-time');
  const playButton = panel.querySelector('.ae-focus-timer-action.play');
  const startButton = panel.querySelector('.ae-focus-start');
  let selectedSession = 'Reading';
  let activeState = null;

  panel.querySelectorAll('.ae-focus-session').forEach(button => {
    button.onclick = () => {
      panel.querySelectorAll('.ae-focus-session').forEach(item => item.classList.remove('active'));
      button.classList.add('active');
      selectedSession = button.dataset.session;
    };
  });

  const updateTimer = () => {
    if (!activeState?.startedAt) return;
    const elapsed = Math.max(0, Math.floor((Date.now() - activeState.startedAt) / 1000));
    const minutes = String(Math.floor(elapsed / 60) % 60).padStart(2, '0');
    const seconds = String(elapsed % 60).padStart(2, '0');
    timeEl.textContent = `${minutes}:${seconds}`;
  };
  const update = state => {
    activeState = state?.active ? state : null;
    if (!activeState) return;
    goalInput.value = activeState.goal || '';
    selectedSession = activeState.sessionType || 'Reading';
    panel.querySelectorAll('.ae-focus-session').forEach(button => button.classList.toggle('active', button.dataset.session === selectedSession));
    startButton.textContent = 'Stop focus session';
    playButton.textContent = 'Ⅱ';
    updateTimer();
    focusTimerInterval = setInterval(updateTimer, 1000);
  };
  getFocusState(update);

  const toggleFocus = () => getFocusState(state => {
    if (state?.active) {
      chrome.storage.local.set({ aetherFocusMode: { active: false } }, () => renderFocusPanel(area));
      return;
    }
    const goal = goalInput.value.trim() || `${selectedSession} session`;
    chrome.storage.local.set({ aetherFocusMode: { active: true, mode: 'strict', goal, sessionType: selectedSession, startedAt: Date.now() } }, () => renderFocusPanel(area));
  });
  startButton.onclick = toggleFocus;
  playButton.onclick = toggleFocus;
  panel.querySelector('.ae-focus-timer-action:not(.play)').onclick = () => { timeEl.textContent = '00:00'; };
  panel.querySelectorAll('.ae-focus-task input').forEach(input => {
    input.onchange = () => input.closest('.ae-focus-task').classList.toggle('done', input.checked);
  });
  const taskInput = panel.querySelector('.ae-focus-task-add input');
  const addTask = () => {
    const value = taskInput.value.trim();
    if (!value) return;
    const task = document.createElement('label');
    task.className = 'ae-focus-task';
    task.innerHTML = `<input type="checkbox"><span>${escapeHtml(value)}</span>`;
    task.querySelector('input').onchange = event => task.classList.toggle('done', event.target.checked);
    panel.querySelector('.ae-focus-task-list').appendChild(task);
    taskInput.value = '';
  };
  panel.querySelector('.ae-focus-task-add button').onclick = addTask;
  taskInput.onkeydown = event => { if (event.key === 'Enter') addTask(); };
}

function showDashboardFocusTile() {
  if (dashboardFocusTile) {
    hideDashboardFocusTile();
    return;
  }
  dashboardFocusTile = document.createElement('div');
  dashboardFocusTile.className = 'ae-dashboard-focus-tile';
  dashboardFocusTile.onclick = e => e.stopPropagation();
  uiRoot.appendChild(dashboardFocusTile);
  const actions = [
    { icon: '🎯', label: 'FOCUS', title: 'Open Focus Mode', action: showDashboardFocusControls },
    { icon: '◌', label: 'NOTES', title: 'Notes placeholder', action: () => showNotchTile('Coming soon', 'Notes will live here.') },
    { icon: '⟳', label: 'STATES', title: 'Show Open Tabs', action: renderTabManager },
    { icon: '◉', label: 'UI', title: 'Change UI layout', action: () => {
      hideDashboardFocusTile();
      if (typeof window.openAetherUISwitcher === 'function') window.openAetherUISwitcher();
      else window.postMessage({ type: 'aether-toggle-switcher' }, '*');
    } }
  ];
  actions.forEach(item => {
    const button = document.createElement('button');
    button.className = 'ae-dashboard-focus-button';
    button.type = 'button';
    button.title = item.title;
    button.setAttribute('aria-label', item.title);
    button.innerHTML = `<span>${item.icon}</span><span>${item.label}</span>`;
    button.onclick = item.action;
    dashboardFocusTile.appendChild(button);
  });
}

function showDashboardFocusControls() {
  if (!dashboardFocusTile) return;
  hideDashboardFocusTile();
  dashboardFocusModal = document.createElement('div');
  dashboardFocusModal.className = 'ae-dashboard-focus-modal';
  dashboardFocusModal.onclick = e => {
    if (e.target === dashboardFocusModal) hideDashboardFocusModal();
  };
  const card = document.createElement('section');
  card.className = 'ae-dashboard-focus-card';
  card.innerHTML = '<header class="ae-dashboard-focus-header"><div><div class="ae-dashboard-focus-heading">Student Focus Mode</div><div class="ae-dashboard-focus-subheading">Choose a study mode and stay on task</div></div><button class="ae-dashboard-focus-close" type="button" aria-label="Close Focus Mode">&times;</button></header><div class="ae-dashboard-focus-body"></div>';
  card.querySelector('.ae-dashboard-focus-close').onclick = hideDashboardFocusModal;
  dashboardFocusModal.appendChild(card);
  uiRoot.appendChild(dashboardFocusModal);
  renderFocusPanel(card.querySelector('.ae-dashboard-focus-body'), true);
}

function hideDashboardFocusModal() {
  if (!dashboardFocusModal) return;
  if (dashboardFocusModal.parentNode) dashboardFocusModal.parentNode.removeChild(dashboardFocusModal);
  dashboardFocusModal = null;
}

function hideDashboardFocusTile() {
  if (!dashboardFocusTile) return;
  if (dashboardFocusTile.parentNode) dashboardFocusTile.parentNode.removeChild(dashboardFocusTile);
  dashboardFocusTile = null;
}

function openCC() {
  if (document.documentElement.hasAttribute('data-aether-dashboard')) {
    showDashboardFocusTile();
    return;
  }
  if (ccOpen) return;
  if (!ccPanel) buildCC();
  uiRoot.appendChild(ccBackdrop);
  ccOpen = true;
}
function closeCC() {
  if (!ccOpen) return;
  window.speechSynthesis.cancel();
  if (ccBackdrop && ccBackdrop.parentNode) ccBackdrop.parentNode.removeChild(ccBackdrop);
  ccOpen = false;
  activeToolId = null;
  if (ccPanel) ccPanel.classList.remove('tools-collapsed');
  updateToolHighlight();
}
function toggleTools() {
  if (!ccPanel) return;
  ccPanel.classList.toggle('tools-collapsed');
}
function toggleCC() { ccOpen ? toggleTools() : openCC(); }

function activateTool(id) {
  if (!ccOpen) openCC();
  activeToolId = id;
  ccPanel.classList.add('tools-collapsed');
  ccPanel.classList.toggle('ae-imageai-mode', id === 'imageai');
  ccPanel.classList.toggle('ae-calculator-mode', id === 'calculator');
  ccPanel.classList.toggle('ae-currconv-mode', id === 'currconv');
  ccPanel.classList.toggle('ae-unitconv-mode', id === 'unitconv');
  updateToolHighlight();
  ccBody.innerHTML = '';

  const renderers = {
    history: renderAeHistory,
    smartmark: renderSmartMark,
    calculator: renderCalculator,
    unitconv: renderUnitConversion,
    currconv: renderCurrencyConversion,
    clipboard: renderClipboard,
    aichat: renderAIChat,
    search: renderSearchGrounding,
    imageai: () => {
      if (pendingImageUrl) renderImageAnalysis(ccBody, pendingImageUrl);
      else ccBody.innerHTML = '<div class="ae-notext"><div class="ae-notext-title">No image selected</div><p>Hover over an image on the page and click "Analyse image", or right-click an image.</p></div>';
    },
    summarize: () => ensureText(ccBody, 'summarize', renderSummary),
    mindmap: () => ensureText(ccBody, 'mindmap', renderMindMap),
    infographic: () => ensureText(ccBody, 'infographic', renderInfographic),
    dictionary: () => ensureText(ccBody, 'dictionary', (a,t) => renderDictionary(a, t, lastSelectionContext)),
    geo: () => ensureText(ccBody, 'geo', renderGeoExplore),
    translate: () => ensureText(ccBody, 'translate', renderTranslate),
    narrate: () => ensureText(ccBody, 'narrate', renderNarrate),
  };

  const fn = renderers[id];
  if (fn) fn(ccBody);
}

function updateToolHighlight() {
  if (!ccPanel) return;
  ccPanel.querySelectorAll('.ae-tool').forEach(el => {
    el.classList.toggle('active', el.dataset.tool === activeToolId);
  });
}

function sendChatFromBar(input) {
  const q = input.value.trim();
  if (!q) return;
  if (featureChatIds.has(activeToolId)) {
    sendFeatureChat(input);
    return;
  }
  input.value = '';
  chatMessages.push({ role:'user', content: q });
  if (activeToolId !== 'aichat') activateTool('aichat');
  else refreshChatView();
  // Send to AI
  chrome.runtime.sendMessage({ type:'aiChat', messages: chatMessages }, r => {
    if (r && r.success) {
      chatMessages.push({ role:'assistant', content: r.data });
      saveAeSession('aichat', 'AI Chat', q, chatMessages.map(message => `${message.role}: ${message.content}`).join('\n\n'));
    } else {
      chatMessages.push({ role:'assistant', content: 'Error: ' + (r?.error || 'Connection failed.') });
    }
    if (activeToolId === 'aichat') refreshChatView();
  });
}

// ============================================================================
// 6. UTILITY TOOL RENDERERS
// ============================================================================

// ── SmartMark ──
function renderSmartMark(area, filterText = '') {
  if (!filterText) area.innerHTML = '';
  
  if (!filterText) {
    const head = document.createElement('div');
    head.className = 'ae-feat-head';
    head.innerHTML = '<div class="ae-feat-title">📝 SmartMark</div>';
    addFeatureClearButton(head, area, 'smartmark');
    
    const headActions = document.createElement('div');
    headActions.style.display = 'flex';
    headActions.style.gap = '8px';

    const bkmkBtn = document.createElement('button');
    bkmkBtn.className = 'ae-mark-save';
    bkmkBtn.innerHTML = '🔖 Bookmark Page';
    bkmkBtn.onclick = () => {
      chrome.runtime.sendMessage({ type: 'GET_TAB_INFO' }, res => {
        if (res && res.success && res.tab) {
          const { title, url, favIconUrl } = res.tab;
          let existing = smartMarks.find(m => m.type === 'bookmark' && m.url === url);
          if (!existing) {
            smartMarks.unshift({ type: 'bookmark', title, url, favIconUrl, date: new Date().toLocaleString(), notes: [] });
            if (smartMarks.length > 50) smartMarks.pop();
            saveMarks();
            renderSmartMark(area);
          }
        }
      });
    };
    headActions.appendChild(bkmkBtn);

    const saveBtn = document.createElement('button');
    saveBtn.className = 'ae-mark-save';
    saveBtn.innerHTML = '+ Save Selection';
    saveBtn.onclick = () => {
      const sel = window.getSelection();
      const text = sel ? sel.toString().trim() : '';
      if (!text && lastSelectedText) addMark(lastSelectedText);
      else if (text) addMark(text);
      renderSmartMark(area);
    };
    headActions.appendChild(saveBtn);
    
    head.appendChild(headActions);
    area.appendChild(head);

    const searchInput = document.createElement('input');
    searchInput.className = 'ae-chat-input';
    searchInput.style.marginBottom = '16px';
    searchInput.style.width = '100%';
    searchInput.placeholder = 'Search bookmarks & notes...';
    searchInput.oninput = (e) => {
      renderSmartMark(area, e.target.value.toLowerCase());
    };
    area.appendChild(searchInput);

    const list = document.createElement('div');
    list.id = 'ae-smartmark-list';
    area.appendChild(list);
  }

  const list = area.querySelector('#ae-smartmark-list');
  if (!list) return;
  list.innerHTML = '';

  const filtered = smartMarks.filter(m => {
    if (!filterText) return true;
    if (m.type === 'bookmark') {
      return (m.title||'').toLowerCase().includes(filterText) || (m.url||'').toLowerCase().includes(filterText) || (m.notes||[]).some(n => n.text.toLowerCase().includes(filterText));
    }
    return (m.text||'').toLowerCase().includes(filterText);
  });

  if (filtered.length === 0) {
    list.innerHTML = '<p style="color:#64748b;text-align:center;padding:30px">No marks found.</p>';
  } else {
    filtered.forEach((m, i) => {
      const item = document.createElement('div');
      item.className = 'ae-mark-item';
      item.style.flexDirection = 'column';
      item.style.alignItems = 'stretch';
      item.style.gap = '8px';
      
      const topRow = document.createElement('div');
      topRow.style.display = 'flex';
      topRow.style.justifyContent = 'space-between';
      topRow.style.alignItems = 'center';
      topRow.style.width = '100%';

      const contentDiv = document.createElement('div');
      contentDiv.className = 'ae-mark-text';
      
      if (m.type === 'bookmark') {
        contentDiv.innerHTML = `<div style="display:flex;align-items:center;gap:8px;font-weight:700;color:#fff;">
          ${m.favIconUrl ? `<img src="${escapeHtml(m.favIconUrl)}" style="width:16px;height:16px;">` : '🔖'}
          <a href="${escapeHtml(m.url)}" target="_blank" style="color:#38bdf8;text-decoration:none;">${escapeHtml(m.title || m.url)}</a>
        </div>`;
      } else {
        contentDiv.textContent = m.text.length > 200 ? m.text.slice(0,200) + '...' : m.text;
        contentDiv.onclick = () => { navigator.clipboard.writeText(m.text); contentDiv.style.color = '#34d399'; setTimeout(() => contentDiv.style.color = '', 800); };
      }
      
      const meta = document.createElement('div');
      meta.className = 'ae-mark-meta';
      meta.textContent = m.date || '';
      contentDiv.appendChild(meta);
      
      topRow.appendChild(contentDiv);

      const del = document.createElement('button');
      del.className = 'ae-mark-del';
      del.textContent = '✕';
      del.onclick = () => { smartMarks.splice(smartMarks.indexOf(m), 1); saveMarks(); renderSmartMark(area, filterText); };
      topRow.appendChild(del);
      item.appendChild(topRow);

      if (m.type === 'bookmark' && m.notes && m.notes.length > 0) {
        const notesDiv = document.createElement('div');
        notesDiv.style.background = 'rgba(0,0,0,0.2)';
        notesDiv.style.borderRadius = '12px';
        notesDiv.style.padding = '8px 12px';
        notesDiv.style.marginTop = '8px';
        notesDiv.style.display = 'flex';
        notesDiv.style.flexDirection = 'column';
        notesDiv.style.gap = '8px';
        
        m.notes.forEach((n, ni) => {
          const nRow = document.createElement('div');
          nRow.style.fontSize = '13px';
          nRow.style.color = '#cbd5e1';
          nRow.style.borderLeft = '2px solid #38bdf8';
          nRow.style.paddingLeft = '8px';
          nRow.innerHTML = `<a href="${escapeHtml(n.link)}" target="_blank" style="color:inherit;text-decoration:none;">${escapeHtml(n.text)}</a>`;
          notesDiv.appendChild(nRow);
        });
        item.appendChild(notesDiv);
      }

      list.appendChild(item);
    });
  }
}
function addMark(text) {
  const currentUrl = window.location.href;
  const bookmark = smartMarks.find(m => m.type === 'bookmark' && m.url === currentUrl);
  if (bookmark) {
    if (!bookmark.notes) bookmark.notes = [];
    const encodedText = encodeURIComponent(text.slice(0, 300));
    bookmark.notes.push({ text, link: currentUrl + '#:~:text=' + encodedText, date: new Date().toLocaleString() });
    smartMarks.splice(smartMarks.indexOf(bookmark), 1);
    smartMarks.unshift(bookmark);
  } else {
    smartMarks.unshift({ text, date: new Date().toLocaleString(), type: 'text' });
  }
  if (smartMarks.length > 50) smartMarks.pop();
  saveMarks();
}
function saveMarks() {
  if (chrome.storage && chrome.storage.local) chrome.storage.local.set({ smartMarks });
}

// ── Calculator ──
function renderCalculator(area) {
  area.innerHTML = '';
  const head = document.createElement('div');
  head.className = 'ae-feat-head';
  head.innerHTML = '<div class="ae-feat-title">🧮 Calculator</div>';
  addFeatureClearButton(head, area, 'calculator', () => {
    calcDisplay = '0'; calcPrev = null; calcOp = null; calcReset = false;
    disp.textContent = calcDisplay;
  });
  area.appendChild(head);

  calcDisplay = '0'; calcPrev = null; calcOp = null; calcReset = false;

  const disp = document.createElement('div');
  disp.className = 'ae-calc-display';
  disp.textContent = '0';
  area.appendChild(disp);

  const keys = [
    { l:'C', cls:'ae-calc-fn' }, { l:'⌫', cls:'ae-calc-fn' }, { l:'%', cls:'ae-calc-fn' }, { l:'÷', cls:'ae-calc-op' },
    { l:'7' }, { l:'8' }, { l:'9' }, { l:'×', cls:'ae-calc-op' },
    { l:'4' }, { l:'5' }, { l:'6' }, { l:'−', cls:'ae-calc-op' },
    { l:'1' }, { l:'2' }, { l:'3' }, { l:'+', cls:'ae-calc-op' },
    { l:'0', cls:'ae-calc-wide' }, { l:'.' }, { l:'=', cls:'ae-calc-eq' },
  ];

  const grid = document.createElement('div');
  grid.className = 'ae-calc-grid';
  keys.forEach(k => {
    const btn = document.createElement('button');
    btn.className = 'ae-calc-key ' + (k.cls || '');
    btn.textContent = k.l;
    btn.onclick = () => {
      calcPress(k.l);
      disp.textContent = calcDisplay;
    };
    grid.appendChild(btn);
  });
  area.appendChild(grid);
}
function calcPress(key) {
  if (key >= '0' && key <= '9') {
    if (calcReset) { calcDisplay = ''; calcReset = false; }
    if (calcDisplay === '0' && key !== '0') calcDisplay = key;
    else if (calcDisplay === '0' && key === '0') {}
    else calcDisplay += key;
  } else if (key === '.') {
    if (calcReset) { calcDisplay = '0'; calcReset = false; }
    if (!calcDisplay.includes('.')) calcDisplay += '.';
  } else if (key === 'C') {
    calcDisplay = '0'; calcPrev = null; calcOp = null; calcReset = false;
  } else if (key === '⌫') {
    if (calcReset) { calcDisplay = '0'; calcReset = false; }
    else {
      calcDisplay = calcDisplay.slice(0, -1);
      if (calcDisplay === '' || calcDisplay === '-') calcDisplay = '0';
    }
  } else if (key === '%') {
    calcDisplay = String(parseFloat(calcDisplay) / 100);
  } else if (['+','−','×','÷'].includes(key)) {
    if (calcOp && !calcReset) calcExecute();
    calcPrev = parseFloat(calcDisplay);
    calcOp = key;
    calcReset = true;
  } else if (key === '=') {
    calcExecute();
    calcOp = null;
  }
}
function calcExecute() {
  if (calcPrev === null || !calcOp) return;
  const cur = parseFloat(calcDisplay);
  let result;
  if (calcOp === '+') result = calcPrev + cur;
  else if (calcOp === '−') result = calcPrev - cur;
  else if (calcOp === '×') result = calcPrev * cur;
  else if (calcOp === '÷') result = cur !== 0 ? calcPrev / cur : 'Error';
  calcDisplay = typeof result === 'number' ? String(Math.round(result * 1e10) / 1e10) : 'Error';
  calcPrev = typeof result === 'number' ? result : null;
  calcReset = true;
}

// ── Unit Conversion ──
const UNIT_DATA = {
  Length: { meter:1, kilometer:1000, centimeter:0.01, millimeter:0.001, foot:0.3048, inch:0.0254, mile:1609.34, yard:0.9144 },
  Weight: { kilogram:1, gram:0.001, milligram:1e-6, pound:0.453592, ounce:0.0283495, ton:1000 },
  Volume: { liter:1, milliliter:0.001, gallon:3.78541, quart:0.946353, cup:0.236588 },
  Speed: { 'km/h':1, 'mph':1.60934, 'm/s':3.6, knot:1.852 },
};

function renderUnitConversion(area) {
  area.innerHTML = '';
  const head = document.createElement('div');
  head.className = 'ae-feat-head';
  head.innerHTML = '<div class="ae-feat-title">📐 Unit Conversion</div>';
  addFeatureClearButton(head, area, 'unitconv', () => {
    input.value = '';
    result.textContent = '';
  });
  area.appendChild(head);

  const catSel = document.createElement('select');
  Object.keys(UNIT_DATA).concat(['Temperature']).forEach(c => {
    const o = document.createElement('option'); o.value = o.textContent = c; catSel.appendChild(o);
  });

  const fromSel = document.createElement('select');
  const toSel = document.createElement('select');
  const input = document.createElement('input');
  input.type = 'number'; input.value = '1'; input.step = 'any';
  const result = document.createElement('div');
  result.className = 'ae-conv-result';

  function populateUnits() {
    const cat = catSel.value;
    fromSel.innerHTML = ''; toSel.innerHTML = '';
    const units = cat === 'Temperature' ? ['Celsius','Fahrenheit','Kelvin'] : Object.keys(UNIT_DATA[cat]);
    units.forEach(u => {
      let o1 = document.createElement('option'); o1.value = o1.textContent = u; fromSel.appendChild(o1);
      let o2 = document.createElement('option'); o2.value = o2.textContent = u; toSel.appendChild(o2);
    });
    if (units.length > 1) toSel.selectedIndex = 1;
    convert();
  }
  function convert() {
    const cat = catSel.value;
    const val = parseFloat(input.value) || 0;
    const from = fromSel.value, to = toSel.value;
    let r;
    if (cat === 'Temperature') {
      let c;
      if (from === 'Celsius') c = val;
      else if (from === 'Fahrenheit') c = (val - 32) * 5/9;
      else c = val - 273.15;
      if (to === 'Celsius') r = c;
      else if (to === 'Fahrenheit') r = c * 9/5 + 32;
      else r = c + 273.15;
    } else {
      const d = UNIT_DATA[cat];
      r = val * (d[from] / d[to]);
    }
    result.textContent = `${Math.round(r * 1e6) / 1e6} ${to}`;
  }
  catSel.onchange = populateUnits;
  fromSel.onchange = convert;
  toSel.onchange = convert;
  input.oninput = convert;

  const r1 = document.createElement('div'); r1.className = 'ae-conv-row';
  const l1 = document.createElement('label'); l1.textContent = 'Type';
  r1.appendChild(l1); r1.appendChild(catSel);

  const r2 = document.createElement('div'); r2.className = 'ae-conv-row';
  const l2 = document.createElement('label'); l2.textContent = 'From';
  r2.appendChild(l2); r2.appendChild(fromSel); r2.appendChild(input);

  const r3 = document.createElement('div'); r3.className = 'ae-conv-row';
  const l3 = document.createElement('label'); l3.textContent = 'To';
  r3.appendChild(l3); r3.appendChild(toSel);

  area.appendChild(r1); area.appendChild(r2); area.appendChild(r3); area.appendChild(result);
  populateUnits();
}

// ── Currency Conversion ──
const CURRENCY_RATES = {
  USD:1, EUR:0.92, GBP:0.79, BDT:120.50, INR:83.40, JPY:149.50, CNY:7.24,
  AUD:1.55, CAD:1.36, CHF:0.88, KRW:1330, SAR:3.75, MYR:4.72, THB:35.5, SGD:1.34
};

function renderCurrencyConversion(area) {
  area.innerHTML = '';
  const head = document.createElement('div');
  head.className = 'ae-feat-head';
  head.innerHTML = '<div class="ae-feat-title">💱 Currency Conversion</div>';
  addFeatureClearButton(head, area, 'currconv', () => {
    input.value = '';
    result.textContent = '';
  });
  area.appendChild(head);

  const fromSel = document.createElement('select');
  const toSel = document.createElement('select');
  const input = document.createElement('input');
  input.type = 'number'; input.value = '100'; input.step = 'any';
  const result = document.createElement('div');
  result.className = 'ae-conv-result';

  Object.keys(CURRENCY_RATES).forEach(c => {
    let o1 = document.createElement('option'); o1.value = o1.textContent = c; fromSel.appendChild(o1);
    let o2 = document.createElement('option'); o2.value = o2.textContent = c; toSel.appendChild(o2);
  });
  toSel.value = 'BDT';

  function convert() {
    const val = parseFloat(input.value) || 0;
    const inUSD = val / CURRENCY_RATES[fromSel.value];
    const out = inUSD * CURRENCY_RATES[toSel.value];
    result.textContent = `${out.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})} ${toSel.value}`;
  }
  fromSel.onchange = convert;
  toSel.onchange = convert;
  input.oninput = convert;

  const r1 = document.createElement('div'); r1.className = 'ae-conv-row';
  r1.innerHTML = '<label>From</label>';
  r1.appendChild(fromSel); r1.appendChild(input);
  const r2 = document.createElement('div'); r2.className = 'ae-conv-row';
  r2.innerHTML = '<label>To</label>';
  r2.appendChild(toSel);
  area.appendChild(r1); area.appendChild(r2); area.appendChild(result);
  convert();
}

// ── Clipboard ──
function renderClipboard(area, filterText = '') {
  // Normalize array (migrate old strings and add unique id)
  clipHistory = clipHistory.map(c => {
    let obj = typeof c === 'string' ? { text: c, date: new Date().toLocaleString(), pinned: false } : c;
    if (!obj.id) obj.id = 'clip_' + Math.random().toString(36).substr(2, 9);
    return obj;
  });

  if (!filterText) {
    area.innerHTML = '';
    const head = document.createElement('div');
    head.className = 'ae-feat-head';
    
    head.innerHTML = '<div class="ae-feat-title">📋 Clipboard Manager</div>';
    addFeatureClearButton(head, area, 'clipboard');
    area.appendChild(head);

    const currentDiv = document.createElement('div');
    currentDiv.className = 'ae-glass';
    currentDiv.style.marginBottom = '14px';
    currentDiv.innerHTML = '<h4 style="font-size:13px;color:#94a3b8;margin-bottom:8px">Current Clipboard</h4><p id="ae-clip-current" style="font-size:13px;color:#cbd5e1">Reading...</p>';
    area.appendChild(currentDiv);

    navigator.clipboard.readText().then(t => {
      const p = currentDiv.querySelector('#ae-clip-current');
      if (p) p.textContent = t || '(empty)';
      if (t && !clipHistory.some(c => c.text === t)) { 
        clipHistory.unshift({ id: 'clip_' + Math.random().toString(36).substr(2, 9), text: t, date: new Date().toLocaleString(), pinned: false }); 
        if (clipHistory.length > 30) {
          let unpinnedIdx = clipHistory.length - 1;
          while (unpinnedIdx >= 0 && clipHistory[unpinnedIdx].pinned) unpinnedIdx--;
          if (unpinnedIdx >= 0) clipHistory.splice(unpinnedIdx, 1);
          else clipHistory.pop();
        }
        if (chrome.storage && chrome.storage.local) chrome.storage.local.set({ clipHistory });
        renderClipboard(area);
        return;
      }
    }).catch(() => {
      const p = currentDiv.querySelector('#ae-clip-current');
      if (p) p.textContent = '(Permission denied — click to allow)';
    });

    const searchInput = document.createElement('input');
    searchInput.className = 'ae-chat-input';
    searchInput.style.marginBottom = '16px';
    searchInput.style.width = '100%';
    searchInput.placeholder = 'Search clipboard...';
    searchInput.oninput = (e) => {
      renderClipboard(area, e.target.value.toLowerCase());
    };
    area.appendChild(searchInput);

    const histHeader = document.createElement('div');
    histHeader.style.display = 'flex';
    histHeader.style.justifyContent = 'space-between';
    histHeader.style.alignItems = 'center';
    histHeader.style.marginBottom = '10px';
    histHeader.innerHTML = '<h4 style="font-size:13px;color:#94a3b8;margin:0;">History</h4>';
    
    const clearAllBtn = document.createElement('button');
    clearAllBtn.className = 'ae-mark-del';
    clearAllBtn.textContent = 'Clear All';
    clearAllBtn.style.padding = '4px 10px';
    clearAllBtn.style.fontSize = '12px';
    clearAllBtn.onclick = () => {
      if (confirm('Clear all clipboard history? (Pinned items will be kept)')) {
        clipHistory = clipHistory.filter(c => c.pinned);
        if (chrome.storage && chrome.storage.local) chrome.storage.local.set({ clipHistory });
        renderClipboard(area, filterText);
      }
    };
    histHeader.appendChild(clearAllBtn);
    area.appendChild(histHeader);

    const histDiv = document.createElement('div');
    histDiv.id = 'clipboard-history-container';
    
    // Event Delegation
    histDiv.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      e.stopPropagation();
      const id = btn.dataset.id;
      const itemIdx = clipHistory.findIndex(c => c.id === id);
      if (itemIdx === -1) return;
      
      const itemObj = clipHistory[itemIdx];
      const action = btn.dataset.action;
      
      if (action === 'delete') {
        clipHistory.splice(itemIdx, 1);
        if (chrome.storage && chrome.storage.local) chrome.storage.local.set({ clipHistory });
        renderClipboard(area, filterText);
      } else if (action === 'pin') {
        itemObj.pinned = !itemObj.pinned;
        if (chrome.storage && chrome.storage.local) chrome.storage.local.set({ clipHistory });
        renderClipboard(area, filterText);
      } else if (action === 'copy') {
        navigator.clipboard.writeText(itemObj.text);
        const originalText = btn.textContent;
        btn.textContent = '✓';
        setTimeout(() => btn.textContent = originalText, 800);
      } else if (action === 'format') {
         if (!chatMessages) chatMessages = [];
         chatMessages.push({ role:'user', content: 'Format and fix this code:\n' + itemObj.text });
         activateTool('aichat');
         chrome.runtime.sendMessage({ type:'aiChat', messages: chatMessages }, r => {
            if (r && r.success) chatMessages.push({ role:'assistant', content: r.data });
            if (activeToolId === 'aichat') refreshChatView();
         });
      } else if (action === 'openlink') {
        window.open(itemObj.text, '_blank');
      } else if (action === 'summarize') {
        ensureText(area, 'summarize', renderSummary, itemObj.text);
      } else if (action === 'cleanwhite') {
        const cleaned = itemObj.text.replace(/\s+/g, ' ').trim();
        navigator.clipboard.writeText(cleaned);
        const originalText = btn.textContent;
        btn.textContent = '✓ Cleaned & Copied';
        setTimeout(() => btn.textContent = originalText, 1500);
      }
    });

    area.appendChild(histDiv);
  }

  const histDiv = area.querySelector('#clipboard-history-container');
  if (!histDiv) return;
  histDiv.innerHTML = '';

  const filtered = clipHistory.filter(c => !filterText || c.text.toLowerCase().includes(filterText));

  if (filtered.length === 0) {
    histDiv.innerHTML = '<p style="color:#64748b;font-size:13px;text-align:center;padding:20px 0;">No clipboard history found.</p>';
  } else {
    // Sort pinned to top
    const sorted = [...filtered].sort((a,b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    
    const timeAgo = (dateStr) => {
      if (!dateStr) return '';
      const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
      if (seconds < 60) return `${Math.max(1, seconds)}s ago`;
      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    };

    sorted.forEach((itemObj) => {
      const t = itemObj.text;
      const item = document.createElement('div');
      item.className = 'ae-clip-item';
      item.style.flexDirection = 'column';
      item.style.alignItems = 'stretch';
      item.style.gap = '12px';
      
      const topRow = document.createElement('div');
      topRow.style.display = 'flex';
      topRow.style.justifyContent = 'space-between';
      topRow.style.alignItems = 'flex-start';
      topRow.style.width = '100%';

      const textSpan = document.createElement('span');
      textSpan.textContent = t.length > 100 ? t.slice(0,100) + '...' : t;
      textSpan.style.flex = '1';
      textSpan.style.wordBreak = 'break-all';
      textSpan.style.whiteSpace = 'pre-wrap';
      textSpan.style.marginRight = '8px';
      topRow.appendChild(textSpan);

      const actionsDiv = document.createElement('div');
      actionsDiv.style.display = 'flex';
      actionsDiv.style.flexDirection = 'column';
      actionsDiv.style.alignItems = 'flex-end';
      actionsDiv.style.gap = '6px';

      const btnRow = document.createElement('div');
      btnRow.style.display = 'flex';
      btnRow.style.gap = '6px';

      const pinBtn = document.createElement('button');
      pinBtn.className = 'ae-clip-copy';
      pinBtn.textContent = itemObj.pinned ? '📌' : '📍';
      pinBtn.dataset.action = 'pin';
      pinBtn.dataset.id = itemObj.id;
      btnRow.appendChild(pinBtn);

      const copyBtn = document.createElement('button');
      copyBtn.className = 'ae-clip-copy';
      copyBtn.textContent = '📋';
      copyBtn.dataset.action = 'copy';
      copyBtn.dataset.id = itemObj.id;
      btnRow.appendChild(copyBtn);

      const delBtn = document.createElement('button');
      delBtn.className = 'ae-clip-copy';
      delBtn.textContent = '✕';
      delBtn.dataset.action = 'delete';
      delBtn.dataset.id = itemObj.id;
      btnRow.appendChild(delBtn);

      actionsDiv.appendChild(btnRow);

      if (itemObj.date) {
        const timeSpan = document.createElement('span');
        timeSpan.style.fontSize = '11px';
        timeSpan.style.color = '#64748b';
        timeSpan.textContent = timeAgo(itemObj.date);
        actionsDiv.appendChild(timeSpan);
      }

      topRow.appendChild(actionsDiv);
      item.appendChild(topRow);

      const classRow = document.createElement('div');
      classRow.style.display = 'flex';
      classRow.style.gap = '8px';
      classRow.style.marginTop = '4px';

      let isCode = false;
      let isUrl = false;
      let isColor = false;

      if (/^https?:\/\//i.test(t.trim())) {
        isUrl = true;
      } else if (t.match(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/) || t.startsWith('rgb(')) {
        isColor = true;
      } else if (/(?:\{|\[|\bfunction\s|\bconst\s|\blet\s|=>|\bvar\s|\bclass\s|\bdef\s|\bSELECT\s)/i.test(t)) {
        try {
          JSON.parse(t);
          isCode = true;
        } catch(e) {
          if (/[{}<>;]/.test(t)) isCode = true;
        }
      }

      if (isCode) {
        const fmtBtn = document.createElement('button');
        fmtBtn.className = 'ae-mark-save';
        fmtBtn.style.padding = '4px 8px';
        fmtBtn.style.fontSize = '12px';
        fmtBtn.textContent = '{ } Format Code';
        fmtBtn.dataset.action = 'format';
        fmtBtn.dataset.id = itemObj.id;
        classRow.appendChild(fmtBtn);
      } else if (isColor) {
        const hexMatch = t.match(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/);
        const colorPrev = document.createElement('div');
        colorPrev.style.width = '20px';
        colorPrev.style.height = '20px';
        colorPrev.style.borderRadius = '50%';
        colorPrev.style.background = hexMatch ? hexMatch[0] : t;
        colorPrev.style.border = '1px solid #fff';
        colorPrev.title = 'Color preview';
        classRow.appendChild(colorPrev);
      } else if (isUrl) {
        const linkBtn = document.createElement('button');
        linkBtn.className = 'ae-mark-save';
        linkBtn.style.padding = '4px 8px';
        linkBtn.style.fontSize = '12px';
        linkBtn.textContent = '🔗 Open URL';
        linkBtn.dataset.action = 'openlink';
        linkBtn.dataset.id = itemObj.id;
        classRow.appendChild(linkBtn);
      } else {
        const fixBtn = document.createElement('button');
        fixBtn.className = 'ae-mark-save';
        fixBtn.style.padding = '4px 8px';
        fixBtn.style.fontSize = '12px';
        fixBtn.textContent = '✨ AI Summarize';
        fixBtn.dataset.action = 'summarize';
        fixBtn.dataset.id = itemObj.id;
        classRow.appendChild(fixBtn);

        const cleanBtn = document.createElement('button');
        cleanBtn.className = 'ae-mark-save';
        cleanBtn.style.padding = '4px 8px';
        cleanBtn.style.fontSize = '12px';
        cleanBtn.textContent = '✂️ Clean Whitespace';
        cleanBtn.dataset.action = 'cleanwhite';
        cleanBtn.dataset.id = itemObj.id;
        classRow.appendChild(cleanBtn);
      }

      item.appendChild(classRow);
      histDiv.appendChild(item);
    });
  }
}

// ── AI Chat ──
function renderAIChat(area) {
  area.innerHTML = '';
  const head = document.createElement('div');
  head.className = 'ae-feat-head';
  head.innerHTML = '<div class="ae-feat-title">🤖 AI Chat</div>';
  const clearBtn = document.createElement('button');
  clearBtn.className = 'ae-mark-del';
  clearBtn.textContent = 'Clear';
  clearBtn.style.cssText = 'font-size:12px;padding:4px 12px;color:#94a3b8';
  clearBtn.onclick = () => { chatMessages = []; renderAIChat(area); };
  head.appendChild(clearBtn);
  area.appendChild(head);

  const thread = document.createElement('div');
  thread.className = 'ae-chat-thread';
  thread.id = 'ae-main-chat';
  thread.style.maxHeight = 'none';
  chatMessages.forEach(m => {
    const bubble = document.createElement('div');
    bubble.className = 'ae-chat-bubble ' + (m.role === 'user' ? 'ae-chat-user' : 'ae-chat-ai');
    
    if (m.role === 'user') {
      bubble.textContent = m.content;
    } else {
      const cleaned = stripThink(m.content);
      bubble.innerHTML = parseMarkdown(cleaned);
    }
    
    thread.appendChild(bubble);
  });
  area.appendChild(thread);

  if (chatMessages.length === 0) {
    const hint = document.createElement('p');
    hint.style.cssText = 'text-align:center;color:#64748b;padding:30px;font-size:13px';
    hint.textContent = 'Type a message in the chat bar below to start a conversation with AI.';
    area.appendChild(hint);
  }

  setTimeout(() => thread.scrollTop = thread.scrollHeight, 50);
}

function renderAeHistory(area) {
  area.innerHTML = '';
  const head = document.createElement('div');
  head.className = 'ae-feat-head';
  head.innerHTML = '<div class="ae-feat-title">◷ Session History</div>';
  const clearButton = document.createElement('button');
  clearButton.className = 'ae-feature-clear ae-mark-del';
  clearButton.type = 'button';
  clearButton.textContent = 'Clear All';
  clearButton.onclick = () => {
    aeSessions = [];
    chrome.storage.local.set({ aeSessions }, () => renderAeHistory(area));
  };
  head.appendChild(clearButton);
  area.appendChild(head);

  if (!aeSessions.length) {
    area.innerHTML += '<div class="ae-notext"><div class="ae-notext-title">No saved sessions</div><p>Completed AI tool sessions will appear here.</p></div>';
    return;
  }

  const search = document.createElement('input');
  search.className = 'ae-chat-input';
  search.placeholder = 'Search your sessions...';
  search.style.cssText = 'width:100%;margin-bottom:16px';
  area.appendChild(search);
  const list = document.createElement('div');
  area.appendChild(list);

  const renderList = () => {
    const query = search.value.trim().toLowerCase();
    list.innerHTML = '';
    aeSessions.filter(session => `${session.title} ${session.source} ${session.result}`.toLowerCase().includes(query)).forEach(session => {
      const item = document.createElement('div');
      item.className = 'ae-glass';
      item.style.cssText = 'margin-bottom:12px;cursor:pointer';
      const date = new Date(session.createdAt).toLocaleString();
      item.innerHTML = `<div style="display:flex;justify-content:space-between;gap:12px;align-items:center"><strong>${escapeHtml(session.title)}</strong><span class="ae-mark-meta">${escapeHtml(date)}</span></div><div style="font-size:11px;color:#ff7a6e;margin-top:6px">${escapeHtml(sessionToolLabel(session.toolId))}</div><p style="font-size:13px;color:#cbd5e1;margin-top:8px">${escapeHtml(session.source.slice(0, 180))}${session.source.length > 180 ? '...' : ''}</p>`;
      item.onclick = () => showAeSession(area, session);
      list.appendChild(item);
    });
    if (!list.children.length) list.innerHTML = '<p style="color:#64748b;text-align:center;padding:24px">No matching sessions.</p>';
  };
  search.oninput = renderList;
  renderList();
}

function formatAeSessionResult(session) {
  let data;
  try { data = JSON.parse(session.result); } catch (error) {
    return parseMarkdown(stripThink(session.result));
  }
  if (!data || typeof data !== 'object') return `<p>${escapeHtml(String(data))}</p>`;
  if (session.toolId === 'mindmap' && Array.isArray(data.nodes)) {
    const nodes = data.nodes.map(node => typeof node === 'string' ? node : node.label || node.name || node.text).filter(Boolean);
    const edges = Array.isArray(data.edges) ? data.edges : [];
    return `<h4>Concepts</h4><ul>${nodes.map(node => `<li>${escapeHtml(node)}</li>`).join('')}</ul>${edges.length ? `<h4>Relationships</h4><ul>${edges.map(edge => `<li>${escapeHtml(`${edge.from || edge.source} ${edge.label || 'connects to'} ${edge.to || edge.target}`)}</li>`).join('')}</ul>` : ''}`;
  }
  if (session.toolId === 'infographic' && Array.isArray(data.sections)) {
    return data.sections.map(section => `<h4>${escapeHtml(section.heading || section.title || 'Section')}</h4><ul>${(section.points || section.bullets || []).map(point => `<li>${escapeHtml(typeof point === 'string' ? point : point.text || JSON.stringify(point))}</li>`).join('')}</ul>`).join('');
  }
  const fields = Object.entries(data).filter(([, value]) => value !== undefined && value !== null && value !== '');
  return fields.map(([key, value]) => {
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, character => character.toUpperCase());
    const text = Array.isArray(value) ? `<ul>${value.map(item => `<li>${escapeHtml(typeof item === 'string' ? item : JSON.stringify(item))}</li>`).join('')}</ul>` : `<p>${escapeHtml(String(value))}</p>`;
    return `<h4>${escapeHtml(label)}</h4>${text}`;
  }).join('');
}

function showAeSession(area, session) {
  area.innerHTML = '';
  const head = document.createElement('div');
  head.className = 'ae-feat-head';
  head.innerHTML = `<div class="ae-feat-title">${escapeHtml(session.title)}</div>`;
  const back = document.createElement('button');
  back.className = 'ae-feature-clear ae-mark-del';
  back.textContent = 'Back';
  back.onclick = () => renderAeHistory(area);
  head.appendChild(back);
  area.appendChild(head);
  const content = document.createElement('div');
  content.className = 'ae-glass';
  let html = `<div style="font-size:11px;color:#ff7a6e;margin-bottom:14px">${escapeHtml(sessionToolLabel(session.toolId))} · ${escapeHtml(new Date(session.createdAt).toLocaleString())}</div><h3>Original request</h3><p style="white-space:pre-wrap;line-height:1.6">${escapeHtml(session.source)}</p><h3>Result</h3><div class="ae-history-result">${formatAeSessionResult(session)}</div>`;
  const messages = Array.isArray(session.messages) ? session.messages.slice(2) : [];
  if (messages.length) {
    html += '<h3>Conversation</h3><div class="ae-chat-thread">';
    messages.forEach(message => { html += `<div class="ae-chat-bubble ${message.role === 'user' ? 'ae-chat-user' : 'ae-chat-ai'}">${message.role === 'user' ? escapeHtml(message.content) : parseMarkdown(stripThink(message.content))}</div>`; });
    html += '</div>';
  }
  content.innerHTML = html;
  area.appendChild(content);
}
function refreshChatView() {
  if (activeToolId === 'aichat' && ccBody) renderAIChat(ccBody);
}

// ============================================================================
// 7. AI FEATURE RENDERERS
// ============================================================================

// ── Web Grounding Search ──
function renderSearchGrounding(area) {
  area.innerHTML = '';
  const head = document.createElement('div');
  head.className = 'ae-feat-head';
  head.innerHTML = '<div class="ae-feat-title">🔍 Web Grounded Search</div>';
  addFeatureClearButton(head, area, 'search');
  area.appendChild(head);

  const inputRow = document.createElement('div');
  inputRow.className = 'ae-search-input-row';
  const searchInput = document.createElement('input');
  searchInput.className = 'ae-search-input';
  searchInput.type = 'text';
  searchInput.placeholder = 'Search anything — people, places, concepts, entities...';
  const searchBtn = document.createElement('button');
  searchBtn.className = 'ae-search-btn';
  searchBtn.textContent = 'Search';
  inputRow.appendChild(searchInput);
  inputRow.appendChild(searchBtn);
  area.appendChild(inputRow);

  const resultsContainer = document.createElement('div');
  area.appendChild(resultsContainer);

  // Pre-fill with selected text if available
  if (lastSelectedText && lastSelectedText.length >= 2) {
    searchInput.value = lastSelectedText.slice(0, 200);
  }

  const executeSearch = () => {
    const query = searchInput.value.trim();
    if (!query) return;
    searchBtn.disabled = true;
    searchBtn.textContent = 'Searching...';
    resultsContainer.innerHTML = '';
    showLoading(resultsContainer, 'Searching DuckDuckGo & Wikipedia...');

    chrome.runtime.sendMessage({
      type: 'EXECUTE_SEARCH_GROUNDING',
      payload: { query }
    }, searchResult => {
      if (chrome.runtime.lastError) {
        showError(resultsContainer, chrome.runtime.lastError.message);
        searchBtn.disabled = false;
        searchBtn.textContent = 'Search';
        return;
      }
      if (!searchResult || !searchResult.success) {
        showError(resultsContainer, searchResult?.error || 'No results found.');
        searchBtn.disabled = false;
        searchBtn.textContent = 'Search';
        return;
      }

      const data = searchResult.data;
      resultsContainer.innerHTML = '';

      // Show raw search result card
      const rawCard = document.createElement('div');
      rawCard.className = 'ae-grounded-card';

      let rawHTML = '<div class="ae-grounded-header">';
      if (data.thumbnail) {
        rawHTML += `<img class="ae-grounded-thumb" src="${escapeHtml(data.thumbnail)}" alt="thumbnail">`;
      }
      rawHTML += '<div>';
      rawHTML += `<div class="ae-grounded-heading">${escapeHtml(data.heading || query)}</div>`;
      rawHTML += `<div class="ae-grounded-source">📡 ${escapeHtml(data.source)}</div>`;
      rawHTML += '</div></div>';
      rawHTML += `<div class="ae-grounded-abstract">${escapeHtml(data.displayAbstract || data.abstract)}</div>`;
      if (data.url) {
        rawHTML += `<a class="ae-grounded-link" href="${escapeHtml(data.url)}" target="_blank" rel="noopener noreferrer">🔗 View Source</a>`;
      }
      rawCard.innerHTML = rawHTML;
      resultsContainer.appendChild(rawCard);

      // Now synthesize a grounded answer
      const synthesisBox = document.createElement('div');
      synthesisBox.style.marginTop = '16px';
      showLoading(synthesisBox, 'Synthesizing grounded answer...');
      resultsContainer.appendChild(synthesisBox);

      chrome.runtime.sendMessage({
        type: 'SYNTHESIZE_GROUNDED_ANSWER',
        payload: {
          query: query,
          heading: data.heading,
          abstract: data.abstract
        }
      }, synthResult => {
        if (chrome.runtime.lastError || !synthResult?.success) {
          showError(synthesisBox, chrome.runtime.lastError?.message || synthResult?.error || 'Synthesis failed.');
        } else {
          synthesisBox.innerHTML = '';
          const synthCard = document.createElement('div');
          synthCard.className = 'ae-section';
          synthCard.innerHTML = `<h3>🧠 AI-Synthesized Answer</h3><div class="ae-grounded-synthesis">${parseMarkdown(synthResult.data)}</div>`;
          synthesisBox.appendChild(synthCard);
          saveAeSession('search', `Search: ${query.slice(0, 40)}`, query, String(synthResult.data));
          head.appendChild(createNarratorControls(() => synthResult.data));
        }
        searchBtn.disabled = false;
        searchBtn.textContent = 'Search';
      });
    });
  };

  searchBtn.onclick = executeSearch;
  searchInput.onkeydown = e => { if (e.key === 'Enter') executeSearch(); };
}

// ── Summary ──
function renderSummary(area, text) {
  area.innerHTML = '';
  beginFeatureChat('summarize', text);
  const head = document.createElement('div');
  head.className = 'ae-feat-head';
  head.innerHTML = '<div class="ae-feat-title">✦ AI Summary</div>';
  addFeatureClearButton(head, area, 'summarize');
  area.appendChild(head);
  const body = document.createElement('div');
  showLoading(body, 'Summarizing with Aether AI...');
  area.appendChild(body);

  chrome.runtime.sendMessage({ type:'summarize', text }, r => {
    if (chrome.runtime.lastError || r?.error) { showError(body, chrome.runtime.lastError?.message || r?.error || 'Error'); return; }
    const d = r.data || r;
    const rawTag = (d.tag || 'General').toLowerCase();
    let tc = 'ae-tag-general';
    if (rawTag.includes('research')) tc = 'ae-tag-research';
    else if (rawTag.includes('code') || rawTag.includes('dev')) tc = 'ae-tag-coding';

    let h = `<span class="ae-tag ${tc}">${escapeHtml(d.tag||'General')}</span>`;
    const tldr = d.tldr || d.summary || (typeof d === 'string' ? d : '');
    if (tldr) h += `<div class="ae-section"><h3>TL;DR</h3><div class="ae-tldr">${escapeHtml(tldr)}</div></div>`;
    const bullets = d.bullets || d.keyPoints || d.points || [];
    if (Array.isArray(bullets) && bullets.length) h += `<div class="ae-section"><h3>Key Points</h3><ul class="ae-bullets">${bullets.map(b=>`<li>${escapeHtml(b)}</li>`).join('')}</ul></div>`;
    const actions = d.actions || d.actionItems || [];
    if (Array.isArray(actions) && actions.length) h += `<div class="ae-section"><h3>Action Items</h3><ul class="ae-actions">${actions.map(a=>`<li>${escapeHtml(a)}</li>`).join('')}</ul></div>`;

    body.innerHTML = h;
    head.appendChild(createNarratorControls(() => body.innerText));
    if (featureChatMessages.summarize.length === 1) featureChatMessages.summarize.push({ role: 'assistant', content: JSON.stringify(d) });
    saveAeSession('summarize', 'AI Summary', text, JSON.stringify(d, null, 2));
    renderFeatureChat(area, 'summarize');

    // Save highlight
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(['highlights'], res => {
        const hl = res.highlights || [];
        hl.unshift({ text: text.slice(0,300), tag: d.tag || 'General', tldr: (tldr||'').slice(0,200), date: new Date().toISOString() });
        if (hl.length > 100) hl.pop();
        chrome.storage.local.set({ highlights: hl });
      });
    }
  });
}

// ── Mind Map ──
function renderMindMap(area, text) {
  area.innerHTML = '';
  beginFeatureChat('mindmap', text);
  const head = document.createElement('div');
  head.className = 'ae-feat-head';
  head.innerHTML = '<div class="ae-feat-title">◎ Mind Map</div>';
  addFeatureClearButton(head, area, 'mindmap');
  area.appendChild(head);
  const body = document.createElement('div');
  showLoading(body, 'Generating concept map...');
  area.appendChild(body);

  chrome.runtime.sendMessage({ type:'mindmap', text }, r => {
    if (chrome.runtime.lastError || r?.error) { showError(body, chrome.runtime.lastError?.message || r?.error || 'Error'); return; }
    const d = r.data || r;
    let rawNodes = d.nodes || d.concepts || [];
    let rawEdges = d.edges || d.connections || d.links || [];
    if (rawNodes.length === 0 && typeof d === 'string') { body.innerHTML = `<div class="ae-glass"><p>${escapeHtml(d)}</p></div>`; return; }
    body.innerHTML = '';
    renderSvgMindMap(body, rawNodes, rawEdges);
    if (featureChatMessages.mindmap.length === 1) featureChatMessages.mindmap.push({ role: 'assistant', content: JSON.stringify(d) });
    saveAeSession('mindmap', 'Mindmap', text, JSON.stringify(d, null, 2));
    renderFeatureChat(area, 'mindmap');
  });
}

function renderSvgMindMap(container, rawNodes, rawEdges) {
  const W = 660, H = 440;
  let nodes = rawNodes.map((n, i) => {
    const label = typeof n === 'string' ? n : (n.label || n.name || n.text || `Node ${i}`);
    const id = typeof n === 'string' ? String(i) : String(n.id !== undefined ? n.id : i);
    return { id, label, x: 0, y: 0 };
  });
  if (nodes.length === 0) return;

  let edges = [];
  if (rawEdges.length > 0) {
    const idSet = new Set(nodes.map(n => n.id));
    rawEdges.forEach(e => {
      const from = String(e.from ?? e.source ?? '');
      const to = String(e.to ?? e.target ?? '');
      if (idSet.has(from) && idSet.has(to) && from !== to) edges.push({ from, to, label: e.label || '' });
    });
  }
  if (edges.length === 0 && nodes.length > 1) {
    for (let i = 1; i < nodes.length; i++) edges.push({ from: nodes[0].id, to: nodes[i].id, label: '' });
  }

  const cx = W / 2, cy = H / 2;
  nodes[0].x = cx; nodes[0].y = cy;
  const radius = Math.min(W, H) * 0.32;
  for (let i = 1; i < nodes.length; i++) {
    const angle = (2 * Math.PI * (i - 1)) / (nodes.length - 1) - Math.PI / 2;
    nodes[i].x = cx + radius * Math.cos(angle);
    nodes[i].y = cy + radius * Math.sin(angle);
  }

  // Physics
  const nodeMap = {};
  nodes.forEach(n => nodeMap[n.id] = n);
  for (let iter = 0; iter < 60; iter++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        let dx = nodes[j].x - nodes[i].x, dy = nodes[j].y - nodes[i].y;
        let dist = Math.sqrt(dx*dx + dy*dy) || 1;
        let force = 8000 / (dist * dist);
        let fx = (dx / dist) * force, fy = (dy / dist) * force;
        nodes[i].x -= fx; nodes[i].y -= fy;
        nodes[j].x += fx; nodes[j].y += fy;
      }
    }
    edges.forEach(e => {
      const a = nodeMap[e.from], b = nodeMap[e.to];
      if (!a || !b) return;
      let dx = b.x - a.x, dy = b.y - a.y;
      let dist = Math.sqrt(dx*dx + dy*dy) || 1;
      let force = (dist - 140) * 0.04;
      let fx = (dx / dist) * force, fy = (dy / dist) * force;
      a.x += fx; a.y += fy;
      b.x -= fx; b.y -= fy;
    });
    nodes.forEach(n => {
      n.x = Math.max(60, Math.min(W - 60, n.x));
      n.y = Math.max(30, Math.min(H - 30, n.y));
    });
  }

  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.style.cssText = 'width:100%;height:auto;max-height:440px;border-radius:14px;background:rgba(0,0,0,.2);border:1px solid rgba(255,255,255,.06)';

  edges.forEach(e => {
    const a = nodeMap[e.from], b = nodeMap[e.to];
    if (!a || !b) return;
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - 20;
    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', `M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'rgba(56,139,255,0.3)');
    path.setAttribute('stroke-width', '2');
    path.setAttribute('stroke-dasharray', '6,4');
    svg.appendChild(path);
    if (e.label) {
      const t = document.createElementNS(NS, 'text');
      t.setAttribute('x', (a.x+b.x)/2);
      t.setAttribute('y', (a.y+b.y)/2 - 8);
      t.setAttribute('text-anchor', 'middle');
      t.setAttribute('fill', 'rgba(148,163,184,0.7)');
      t.setAttribute('font-size', '10');
      t.textContent = e.label;
      svg.appendChild(t);
    }
  });

  nodes.forEach((n, i) => {
    const g = document.createElementNS(NS, 'g');
    g.style.cursor = 'grab';
    const isRoot = i === 0;
    const rect = document.createElementNS(NS, 'rect');
    const tw = Math.min(n.label.length * 7.5 + 24, 160);
    rect.setAttribute('x', n.x - tw/2);
    rect.setAttribute('y', n.y - 16);
    rect.setAttribute('width', tw);
    rect.setAttribute('height', 32);
    rect.setAttribute('rx', 10);
    rect.setAttribute('fill', isRoot ? 'rgba(56,139,255,0.25)' : 'rgba(255,255,255,0.08)');
    rect.setAttribute('stroke', isRoot ? 'rgba(56,189,248,0.6)' : 'rgba(255,255,255,0.15)');
    rect.setAttribute('stroke-width', isRoot ? '2' : '1');
    const text = document.createElementNS(NS, 'text');
    text.setAttribute('x', n.x);
    text.setAttribute('y', n.y + 5);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', isRoot ? '#38BDF8' : '#e2e8f0');
    text.setAttribute('font-size', isRoot ? '13' : '11');
    text.setAttribute('font-weight', isRoot ? '700' : '500');
    text.textContent = n.label.length > 20 ? n.label.slice(0,18) + '..' : n.label;
    g.appendChild(rect); g.appendChild(text);

    // Drag
    let dragging = false, ox, oy;
    g.addEventListener('pointerdown', ev => {
      dragging = true; g.style.cursor = 'grabbing';
      const pt = svg.createSVGPoint();
      pt.x = ev.clientX; pt.y = ev.clientY;
      const ctm = svg.getScreenCTM().inverse();
      const sp = pt.matrixTransform(ctm);
      ox = sp.x - n.x; oy = sp.y - n.y;
      g.setPointerCapture(ev.pointerId);
    });
    g.addEventListener('pointermove', ev => {
      if (!dragging) return;
      const pt = svg.createSVGPoint();
      pt.x = ev.clientX; pt.y = ev.clientY;
      const ctm = svg.getScreenCTM().inverse();
      const sp = pt.matrixTransform(ctm);
      n.x = sp.x - ox; n.y = sp.y - oy;
      rect.setAttribute('x', n.x - tw/2);
      rect.setAttribute('y', n.y - 16);
      text.setAttribute('x', n.x);
      text.setAttribute('y', n.y + 5);
      // Update edges
      svg.querySelectorAll('path').forEach(p => p.remove());
      svg.querySelectorAll('text[font-size="10"]').forEach(t => t.remove());
      edges.forEach(e2 => {
        const a2 = nodeMap[e2.from], b2 = nodeMap[e2.to];
        if (!a2 || !b2) return;
        const mx2 = (a2.x+b2.x)/2, my2 = (a2.y+b2.y)/2 - 20;
        const p2 = document.createElementNS(NS, 'path');
        p2.setAttribute('d', `M${a2.x},${a2.y} Q${mx2},${my2} ${b2.x},${b2.y}`);
        p2.setAttribute('fill', 'none');
        p2.setAttribute('stroke', 'rgba(56,139,255,0.3)');
        p2.setAttribute('stroke-width', '2');
        p2.setAttribute('stroke-dasharray', '6,4');
        svg.insertBefore(p2, svg.firstChild);
      });
    });
    g.addEventListener('pointerup', () => { dragging = false; g.style.cursor = 'grab'; });
    svg.appendChild(g);
  });

  container.appendChild(svg);
}

// ── Infographic ──
function renderInfographic(area, text) {
  area.innerHTML = '';
  beginFeatureChat('infographic', text);
  const head = document.createElement('div');
  head.className = 'ae-feat-head';
  head.innerHTML = '<div class="ae-feat-title">📊 Visual Infographic</div>';
  addFeatureClearButton(head, area, 'infographic');
  area.appendChild(head);
  const body = document.createElement('div');
  showLoading(body, 'Structuring infographic...');
  area.appendChild(body);

  chrome.runtime.sendMessage({ type:'infographic', text }, r => {
    if (chrome.runtime.lastError || r?.error) { showError(body, chrome.runtime.lastError?.message || r?.error || 'Error'); return; }
    const d = r.data || r;
    const title = d.title || d.heading || 'Visual Infographic';
    let sections = d.sections || d.items || d.cards || d.keyPoints || [];
    if (Array.isArray(d) && !sections.length) sections = d;
    if (!Array.isArray(sections) || !sections.length) {
      const fb = [];
      Object.keys(d).forEach(k => {
        if (k !== 'title' && k !== 'tag') {
          const v = d[k];
          if (Array.isArray(v)) fb.push({ heading: k.toUpperCase(), icon:'📌', points: v });
          else if (typeof v === 'string') fb.push({ heading: k.toUpperCase(), icon:'📌', points: [v] });
        }
      });
      sections = fb;
    }
    if (!sections.length) { showError(body, 'AI did not return valid sections.'); return; }

    let h = `<div class="ae-info-title">${escapeHtml(title)}</div><div class="ae-info-grid">`;
    sections.forEach((s, i) => {
      const heading = s.heading || s.title || s.name || `Section ${i+1}`;
      const icon = s.icon || '📌';
      let pts = s.points || s.bullets || s.details || s.items || [];
      if (typeof pts === 'string') pts = pts.split('\n').map(p=>p.replace(/^[\-\*\d\.]+\s*/,'').trim()).filter(Boolean);
      if (!Array.isArray(pts)) pts = [s.description || s.summary || JSON.stringify(pts)];
      h += `<div class="ae-info-card"><div class="ae-info-card-icon">${icon}</div><h3>${escapeHtml(heading)}</h3><ul>${pts.map(p=>`<li>${escapeHtml(typeof p==='string'?p:(p.text||JSON.stringify(p)))}</li>`).join('')}</ul></div>`;
    });
    h += '</div>';
    body.innerHTML = h;
    head.appendChild(createNarratorControls(() => body.innerText));
    if (featureChatMessages.infographic.length === 1) featureChatMessages.infographic.push({ role: 'assistant', content: JSON.stringify(d) });
    saveAeSession('infographic', 'Infographic', text, JSON.stringify(d, null, 2));
    renderFeatureChat(area, 'infographic');
  });
}

// ── Dictionary ──
function renderDictionary(area, word, context) {
  area.innerHTML = '';
  const head = document.createElement('div');
  head.className = 'ae-feat-head';
  head.innerHTML = `<div class="ae-feat-title">📖 Dictionary: ${escapeHtml(word.slice(0,40))}</div>`;
  addFeatureClearButton(head, area, 'dictionary');
  area.appendChild(head);
  const body = document.createElement('div');
  showLoading(body, 'Looking up definition...');
  area.appendChild(body);

  chrome.runtime.sendMessage({ type:'dictionary', word, context: context || '' }, r => {
    if (chrome.runtime.lastError || r?.error) { showError(body, chrome.runtime.lastError?.message || r?.error || 'Error'); return; }
    const d = r.data || r;
    let h = '';
    h += `<div class="ae-dict-word">${escapeHtml(d.word || word)}</div>`;
    if (d.pronunciation) h += `<div class="ae-dict-pron">${escapeHtml(d.pronunciation)}</div>`;
    if (d.contextualMeaning) h += `<div class="ae-dict-meaning">${escapeHtml(d.contextualMeaning)}</div>`;
    if (d.definition) h += `<div class="ae-section"><h3>Definition</h3><p style="font-size:14px;color:#cbd5e1;line-height:1.6">${escapeHtml(d.definition)}</p></div>`;
    const syns = d.synonyms || [];
    if (Array.isArray(syns) && syns.length) h += `<div class="ae-section"><h3>Synonyms</h3><div class="ae-pills">${syns.map(s=>`<span class="ae-pill ae-pill-syn">${escapeHtml(s)}</span>`).join('')}</div></div>`;
    const ants = d.antonyms || [];
    if (Array.isArray(ants) && ants.length) h += `<div class="ae-section"><h3>Antonyms</h3><div class="ae-pills">${ants.map(a=>`<span class="ae-pill ae-pill-ant">${escapeHtml(a)}</span>`).join('')}</div></div>`;
    if (d.eli5) h += `<div class="ae-eli5"><h4>🧒 Explain Like I'm 5</h4><p>${escapeHtml(d.eli5)}</p></div>`;
    body.innerHTML = h;
    head.appendChild(createNarratorControls(() => body.innerText));
    saveAeSession('dictionary', `Dictionary: ${word.slice(0, 40)}`, word, JSON.stringify(d, null, 2));
  });
}

// ── Geo Explorer ──
function renderGeoExplore(area, location) {
  area.innerHTML = '';
  beginFeatureChat('geo', location);
  const head = document.createElement('div');
  head.className = 'ae-feat-head';
  head.innerHTML = `<div class="ae-feat-title">🌍 Geo-Explorer: ${escapeHtml(location.slice(0,40))}</div>`;
  addFeatureClearButton(head, area, 'geo');
  area.appendChild(head);
  const body = document.createElement('div');
  showLoading(body, 'Exploring location...');
  area.appendChild(body);

  chrome.runtime.sendMessage({ type:'geoExplore', location }, r => {
    if (chrome.runtime.lastError || r?.error) { showError(body, chrome.runtime.lastError?.message || r?.error || 'Error'); return; }
    const d = r.data || r;
    const name = d.name || location;
    const country = d.country || '';
    const lat = parseFloat(d.lat) || 0;
    const lon = parseFloat(d.lon || d.lng) || 0;

    let leftH = `<div class="ae-geo-title">${escapeHtml(name)}${country ? ', '+escapeHtml(country) : ''}</div>`;
    if (d.summary) leftH += `<div class="ae-tldr" style="margin-bottom:14px">${escapeHtml(d.summary)}</div>`;
    const famous = d.famousFor || [];
    if (Array.isArray(famous) && famous.length) leftH += `<div class="ae-pills" style="margin-bottom:14px">${famous.map(f=>`<span class="ae-pill ae-pill-syn">${escapeHtml(f)}</span>`).join('')}</div>`;
    const facts = d.historicalFacts || d.history || [];
    if (Array.isArray(facts) && facts.length) {
      leftH += '<div class="ae-timeline">';
      facts.forEach(f => leftH += `<div class="ae-tl-item">${escapeHtml(f)}</div>`);
      leftH += '</div>';
    }

    let mapH = '';
    if (lat && lon) {
      mapH = `<iframe src="https://www.openstreetmap.org/export/embed.html?bbox=${lon-0.05}%2C${lat-0.05}%2C${lon+0.05}%2C${lat+0.05}&layer=mapnik&marker=${lat}%2C${lon}" allowfullscreen></iframe>`;
    } else {
      mapH = '<p style="color:#64748b;padding:20px;text-align:center">Map not available</p>';
    }

    body.innerHTML = `<div class="ae-geo"><div class="ae-geo-info">${leftH}</div><div class="ae-geo-map">${mapH}</div></div>`;
    head.appendChild(createNarratorControls(() => body.innerText));
    if (featureChatMessages.geo.length === 1) featureChatMessages.geo.push({ role: 'assistant', content: JSON.stringify(d) });
    saveAeSession('geo', `Geo-Explorer: ${name}`, location, JSON.stringify(d, null, 2));
    renderFeatureChat(area, 'geo');
  });
}

// ── Translate ──
function renderTranslate(area, text) {
  area.innerHTML = '';
  const head = document.createElement('div');
  head.className = 'ae-feat-head';
  head.innerHTML = '<div class="ae-feat-title">🌐 Translation</div>';
  addFeatureClearButton(head, area, 'translate');
  area.appendChild(head);

  const bar = document.createElement('div');
  bar.className = 'ae-trans-bar';
  const langSel = document.createElement('select');
  const languages = ['Bangla','Spanish','French','German','Italian','Chinese','Japanese','Korean','Russian','Portuguese','Arabic','Hindi','Turkish','Dutch','Swedish','Thai','Vietnamese'];
  languages.forEach(l => { const o = document.createElement('option'); o.value = o.textContent = l; langSel.appendChild(o); });
  const transBtn = document.createElement('button');
  transBtn.textContent = 'Translate';
  bar.appendChild(langSel);
  bar.appendChild(transBtn);
  area.appendChild(bar);

  const result = document.createElement('div');
  result.className = 'ae-trans-result';
  result.textContent = text;
  area.appendChild(result);

  transBtn.onclick = () => {
    const tl = langSel.value;
    result.innerHTML = '<div class="ae-spinner-wrap"><div class="ae-spinner"></div>Translating...</div>';
    chrome.runtime.sendMessage({ type:'translate', text, targetLang: tl }, r => {
      if (chrome.runtime.lastError || r?.error) { result.innerHTML = `<div class="ae-error">${escapeHtml(chrome.runtime.lastError?.message || r?.error || 'Error')}</div>`; return; }
      result.textContent = r.data;
      saveAeSession('translate', `Translation to ${tl}`, text, String(r.data));
      // Add narrate for translated text
      let nc = head.querySelector('.ae-narrate');
      if (nc) nc.remove();
      head.appendChild(createNarratorControls(() => result.textContent));
    });
  };
}

// ── Narrate ──
function renderNarrate(area, text) {
  area.innerHTML = '';
  const head = document.createElement('div');
  head.className = 'ae-feat-head';
  head.innerHTML = '<div class="ae-feat-title">🔊 Narrator</div>';
  addFeatureClearButton(head, area, 'narrate');
  head.appendChild(createNarratorControls(text));
  area.appendChild(head);
  const result = document.createElement('div');
  result.className = 'ae-trans-result';
  result.textContent = text;
  area.appendChild(result);
}

// ── Image Analysis ──
function renderImageAnalysis(area, imageUrl) {
  area.innerHTML = '';
  const head = document.createElement('div');
  head.className = 'ae-feat-head';
  head.innerHTML = '<div class="ae-feat-title">🖼️ Image Intelligence</div>';
  addFeatureClearButton(head, area, 'imageai');
  area.appendChild(head);

  const img = document.createElement('img');
  img.className = 'ae-img-preview';
  img.src = imageUrl;
  img.alt = 'Target Image';
  area.appendChild(img);

  const body = document.createElement('div');
  showLoading(body, 'Analyzing image with Vision AI...');
  area.appendChild(body);

  chrome.runtime.sendMessage({ type:'analyzeImageAI', imageUrl }, r => {
    if (chrome.runtime.lastError || r?.error) { showError(body, chrome.runtime.lastError?.message || r?.error || 'Error'); return; }
    const d = r.data || r;
    let h = '';
    if (d.description) h += `<div class="ae-section"><h3>Visual Description</h3><div class="ae-tldr">${parseMarkdown(stripThink(d.description))}</div></div>`;
    if (d.ocrText) h += `<div class="ae-section"><h3>Detected Text (OCR)</h3><div class="ae-ocr-box">${parseMarkdown(stripThink(d.ocrText))}</div></div>`;
    if (d.identifiedItems && Array.isArray(d.identifiedItems) && d.identifiedItems.length) {
      h += `<div class="ae-section"><h3>Identified Items</h3><div class="ae-pills">${d.identifiedItems.map(i=>`<span class="ae-pill ae-pill-syn">${escapeHtml(stripThink(i))}</span>`).join('')}</div></div>`;
    }

    // Web Grounding button
    h += `<div class="ae-section"><button class="ae-ground-btn" id="ae-img-ground-btn">🔍 Ground with Web Search</button><div id="ae-img-ground-results"></div></div>`;

    // Follow-up chat
    h += `<div class="ae-section"><h3>Ask about this image</h3><div class="ae-chat-thread" id="ae-img-thread"></div><div class="ae-chat-input-bar"><input type="text" class="ae-chat-input" id="ae-img-q" placeholder="Ask anything about this image..."><button class="ae-chat-send" id="ae-img-send">➤</button></div></div>`;
    body.innerHTML = h;
    saveAeSession('imageai', 'Image Analysis', imageUrl, JSON.stringify(d, null, 2));

    // Wire up web grounding
    const groundBtn = body.querySelector('#ae-img-ground-btn');
    const groundResults = body.querySelector('#ae-img-ground-results');
    if (groundBtn && groundResults) {
      groundBtn.onclick = () => {
        groundBtn.disabled = true;
        groundBtn.textContent = '🔍 Generating search query...';

        // Build a description string from vision output
        const imageDesc = [
          d.description || '',
          d.ocrText ? `OCR Text: ${d.ocrText}` : '',
          d.identifiedItems && d.identifiedItems.length ? `Items: ${d.identifiedItems.join(', ')}` : ''
        ].filter(Boolean).join('. ');

        // Ask AI to generate a concise 3-5 word search query from the vision output
        chrome.runtime.sendMessage({
          type: 'POLISH_TEXT',
          payload: {
            text: imageDesc,
            action: 'generate_search_query'
          }
        }, queryResult => {
          if (chrome.runtime.lastError || !queryResult?.success) {
            showError(groundResults, 'Failed to generate search query.');
            groundBtn.disabled = false;
            groundBtn.textContent = '🔍 Ground with Web Search';
            return;
          }

          const searchQuery = (queryResult.data || '').trim().replace(/^["']|["']$/g, '').slice(0, 100);
          groundBtn.textContent = `🔍 Searching: "${searchQuery}"...`;
          showLoading(groundResults, `Searching for: "${searchQuery}"...`);

          chrome.runtime.sendMessage({
            type: 'EXECUTE_SEARCH_GROUNDING',
            payload: { query: searchQuery }
          }, searchResult => {
            if (chrome.runtime.lastError || !searchResult?.success) {
              showError(groundResults, searchResult?.error || 'No web results found.');
              groundBtn.disabled = false;
              groundBtn.textContent = '🔍 Ground with Web Search';
              return;
            }

            const sd = searchResult.data;
            groundBtn.textContent = '🔍 Synthesizing answer...';

            // Show raw result
            let cardHTML = '<div class="ae-grounded-card"><div class="ae-grounded-header">';
            if (sd.thumbnail) {
              cardHTML += `<img class="ae-grounded-thumb" src="${escapeHtml(sd.thumbnail)}" alt="">`;
            }
            cardHTML += `<div><div class="ae-grounded-heading">${escapeHtml(sd.heading || searchQuery)}</div>`;
            cardHTML += `<div class="ae-grounded-source">📡 ${escapeHtml(sd.source)}</div></div></div>`;
            cardHTML += `<div class="ae-grounded-abstract">${escapeHtml(sd.abstract)}</div>`;
            if (sd.url) {
              cardHTML += `<a class="ae-grounded-link" href="${escapeHtml(sd.url)}" target="_blank" rel="noopener noreferrer">🔗 View Source</a>`;
            }
            cardHTML += '</div>';
            groundResults.innerHTML = cardHTML;

            // Synthesize grounded answer
            const synthBox = document.createElement('div');
            synthBox.style.marginTop = '12px';
            showLoading(synthBox, 'Synthesizing grounded answer...');
            groundResults.appendChild(synthBox);

            chrome.runtime.sendMessage({
              type: 'SYNTHESIZE_GROUNDED_ANSWER',
              payload: {
                query: searchQuery,
                heading: sd.heading,
                abstract: sd.abstract,
                imageDescription: imageDesc
              }
            }, synthResult => {
              if (chrome.runtime.lastError || !synthResult?.success) {
                showError(synthBox, 'Synthesis failed.');
              } else {
                synthBox.innerHTML = `<div class="ae-section"><h3>🧠 Grounded Identity</h3><div class="ae-grounded-synthesis">${parseMarkdown(synthResult.data)}</div></div>`;
              }
              groundBtn.disabled = false;
              groundBtn.textContent = '🔍 Search Again';
            });
          });
        });
      };
    }

    // Narrator
    head.appendChild(createNarratorControls(() => {
      let t = d.description || '';
      if (d.ocrText) t += '. ' + d.ocrText;
      if (d.identifiedItems) t += '. Items: ' + d.identifiedItems.join(', ');
      return t;
    }));

    // Image chat
    const qInput = body.querySelector('#ae-img-q');
    const sendBtn = body.querySelector('#ae-img-send');
    const thread = body.querySelector('#ae-img-thread');
    const askQ = () => {
      const q = qInput.value.trim();
      if (!q) return;
      qInput.value = '';
      const uBub = document.createElement('div');
      uBub.className = 'ae-chat-bubble ae-chat-user';
      uBub.textContent = q;
      thread.appendChild(uBub);
      const loadBub = document.createElement('div');
      loadBub.className = 'ae-chat-bubble ae-chat-ai';
      loadBub.innerHTML = '<span style="animation:aePulse 1s infinite">Thinking...</span>';
      thread.appendChild(loadBub);
      thread.scrollTop = thread.scrollHeight;

      chrome.runtime.sendMessage({ type:'imageQuestion', imageUrl, question: q }, qr => {
        if (thread.contains(loadBub)) thread.removeChild(loadBub);
        const aBub = document.createElement('div');
        aBub.className = 'ae-chat-bubble ae-chat-ai';
        const ansText = (qr && qr.success) ? (qr.answer || qr.data || 'No answer.') : ('Error: ' + (qr?.error || 'Failed'));
        aBub.innerHTML = parseMarkdown(stripThink(ansText));
        thread.appendChild(aBub);
        thread.scrollTop = thread.scrollHeight;
      });
    };
    if (sendBtn) sendBtn.onclick = askQ;
    if (qInput) qInput.onkeydown = e => { if (e.key === 'Enter') askQ(); };
  });
}

// ============================================================================
// 8. TEXT SELECTION TOOLTIP
// ============================================================================
function removeTooltip() {
  clearTimeout(tooltipExpandTimeout);
  if (notchEl) notchEl.classList.remove('ae-notch-hidden');
  if (currentTooltip && currentTooltip.parentNode) currentTooltip.parentNode.removeChild(currentTooltip);
  currentTooltip = null;
}

function showTooltip(selection, text) {
  removeTooltip();
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  if (!rect || (rect.width === 0 && rect.height === 0)) return;

  // Capture context for dictionary
  try {
    const anchorNode = selection.anchorNode;
    if (anchorNode && anchorNode.textContent) {
      const full = anchorNode.textContent;
      const idx = full.indexOf(text.slice(0, 20));
      const start = Math.max(0, idx - 80);
      const end = Math.min(full.length, idx + text.length + 80);
      lastSelectionContext = full.slice(start, end);
    }
  } catch(e) { lastSelectionContext = ''; }

  lastSelectedText = text;
  if (notchEl) notchEl.classList.add('ae-notch-hidden');

  const tooltip = document.createElement('div');
  tooltip.className = 'ae-tooltip';

  const launcher = document.createElement('button');
  launcher.className = 'ae-tt-launcher';
  launcher.title = 'Show Aether tools';
  launcher.setAttribute('aria-label', 'Show Aether tools');
  const launcherImage = document.createElement('img');
  launcherImage.className = 'ae-tt-launcher-image';
  launcherImage.src = chrome.runtime.getURL('dashboard/bloub.gif');
  launcherImage.alt = '';
  launcher.appendChild(launcherImage);
  launcher.onclick = e => {
    e.stopPropagation();
    tooltip.classList.add('ae-tooltip-expanded');
    positionTooltip();
  };
  tooltip.appendChild(launcher);

  const actions = document.createElement('div');
  actions.className = 'ae-tt-actions';

  const buttons = [
    { id:'summarize', icon:'✦', title:'Summarize' },
    { id:'mindmap', icon:'◎', title:'Mind Map' },
    { id:'infographic', icon:'📊', title:'Infographic' },
    { id:'dictionary', icon:'📖', title:'Dictionary' },
    { id:'geo', icon:'🌍', title:'Geo-Explore' },
    { id:'translate', icon:'🌐', title:'Translate' },
    { id:'narrate', icon:'🔊', title:'Narrate' },
  ];

  buttons.forEach(b => {
    const btn = document.createElement('button');
    btn.className = 'ae-tt-btn';
    btn.innerHTML = b.icon;
    btn.title = b.title;
    btn.onclick = (e) => {
      e.stopPropagation();
      removeTooltip();
      if (notchEl) notchEl.classList.remove('ae-notch-hidden');
      activateTool(b.id);
    };
    actions.appendChild(btn);
  });
  tooltip.appendChild(actions);

  uiRoot.appendChild(tooltip);
  currentTooltip = tooltip;

  function positionTooltip() {
    const ttRect = tooltip.getBoundingClientRect();
    let top = rect.top - ttRect.height - 10;
    let left = rect.left + (rect.width / 2) - (ttRect.width / 2);
    if (top < 10) top = rect.bottom + 10;
    if (left < 10) left = 10;
    if (left + ttRect.width > window.innerWidth - 10) left = window.innerWidth - ttRect.width - 10;
    tooltip.style.top = `${Math.max(10, top)}px`;
    tooltip.style.left = `${Math.max(10, left)}px`;
  }

  positionTooltip();
  tooltipExpandTimeout = setTimeout(() => {
    if (currentTooltip !== tooltip) return;
    tooltip.classList.add('ae-tooltip-expanded');
    requestAnimationFrame(() => {
      positionTooltip();
    });
  }, 650);
}

// ============================================================================
// 9. IMAGE HOVER BUTTON
// ============================================================================
const imgHoverBtn = document.createElement('button');
imgHoverBtn.style.cssText = `
  position:absolute;z-index:2147483646;display:none;padding:6px 14px;
  background:rgba(12,12,24,.85);backdrop-filter:blur(12px);
  border:1px solid rgba(56,139,255,.3);border-radius:10px;
  color:#38BDF8;font-family:'Outfit',sans-serif;font-size:12px;font-weight:600;
  cursor:pointer;transition:all .2s;box-shadow:0 4px 16px rgba(0,0,0,.4);
`;
imgHoverBtn.innerText = '🔍 Analyse image';
document.body.appendChild(imgHoverBtn);

let currentTargetImage = null;

document.addEventListener('mouseover', (e) => {
  if (e.target.tagName === 'IMG' && e.target.naturalWidth > 50 && e.target.naturalHeight > 50) {
    currentTargetImage = e.target;
    const r = currentTargetImage.getBoundingClientRect();
    imgHoverBtn.style.top = `${window.scrollY + r.top + 8}px`;
    imgHoverBtn.style.left = `${window.scrollX + r.left + 8}px`;
    imgHoverBtn.style.display = 'block';
  }
});

document.addEventListener('mouseout', (e) => {
  if (e.target === currentTargetImage && e.relatedTarget !== imgHoverBtn) {
    setTimeout(() => {
      if (!imgHoverBtn.matches(':hover') && (!currentTargetImage || !currentTargetImage.matches(':hover'))) {
        imgHoverBtn.style.display = 'none';
      }
    }, 180);
  }
});

imgHoverBtn.addEventListener('mouseleave', () => { imgHoverBtn.style.display = 'none'; });

imgHoverBtn.addEventListener('click', () => {
  if (!currentTargetImage) return;
  imgHoverBtn.style.display = 'none';
  pendingImageUrl = currentTargetImage.src;
  activateTool('imageai');
});

// ============================================================================
// 10. EVENT LISTENERS
// ============================================================================
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (ccOpen) closeCC();
    removeTooltip();
    removePolishMenu();
    cancelSlashPrompt();
  }
});

document.addEventListener('copy', () => {
  const sel = window.getSelection();
  const text = sel ? sel.toString().trim() : '';
  if (text) {
    if (!clipHistory.some(c => c.text === text)) {
      clipHistory.unshift({ id: 'clip_' + Math.random().toString(36).substr(2, 9), text, date: new Date().toLocaleString(), pinned: false });
      if (clipHistory.length > 30) {
        let unpinnedIdx = clipHistory.length - 1;
        while (unpinnedIdx >= 0 && clipHistory[unpinnedIdx].pinned) unpinnedIdx--;
        if (unpinnedIdx >= 0) clipHistory.splice(unpinnedIdx, 1);
        else clipHistory.pop();
      }
      if (chrome.storage && chrome.storage.local) chrome.storage.local.set({ clipHistory });
      if (ccOpen && activeToolId === 'clipboard') {
        const area = uiRoot.querySelector('.ae-cc-body');
        if (area) renderClipboard(area);
      }
    }
  }
});

document.addEventListener('mousedown', (e) => {
  if (!host.contains(e.target)) {
    removeTooltip();
    removePolishMenu();
  }
});

/**
 * Determine if a DOM node is inside an editable container.
 */
function isEditableElement(node) {
  if (!node) return false;
  let el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
  while (el && el !== document.body) {
    const tag = el.tagName;
    if (tag === 'TEXTAREA') return true;
    if (tag === 'INPUT' && (!el.type || el.type === 'text' || el.type === 'search' || el.type === 'url' || el.type === 'email')) return true;
    if (el.isContentEditable) return true;
    el = el.parentElement;
  }
  return false;
}

document.addEventListener('mouseup', (e) => {
  if (host.contains(e.target)) return;
  clearTimeout(tooltipTimeout);
  tooltipTimeout = setTimeout(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) return;
    const text = sel.toString().trim();
    if (text.length < 3) return;

    // Check if selection is inside an editable container
    const anchorNode = sel.anchorNode;
    if (isEditableElement(anchorNode)) {
      showPolishMenu(sel, text);
    } else {
      showTooltip(sel, text);
    }
  }, 120);
});

// Context menu image analysis
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'analyzeImage' && message.imageUrl) {
    pendingImageUrl = message.imageUrl;
    activateTool('imageai');
  }
});

// ============================================================================
// 11. WRITING ASSISTANT — FLOATING POLISH MENU
// ============================================================================
let currentPolishMenu = null;

function removePolishMenu() {
  if (notchEl) notchEl.classList.remove('ae-notch-hidden');
  if (currentPolishMenu && currentPolishMenu.parentNode) {
    currentPolishMenu.parentNode.removeChild(currentPolishMenu);
  }
  currentPolishMenu = null;
}

/**
 * Get the nearest editable ancestor element for a given node.
 */
function getEditableAncestor(node) {
  let el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
  while (el && el !== document.body) {
    if (el.tagName === 'TEXTAREA') return el;
    if (el.tagName === 'INPUT') return el;
    if (el.isContentEditable) return el;
    el = el.parentElement;
  }
  return null;
}

/**
 * Replace selected text inside an editable element with new content.
 */
function replaceSelectedText(editableEl, newText, savedRange) {
  if (!editableEl) return;
  const tag = editableEl.tagName;

  if (tag === 'TEXTAREA' || tag === 'INPUT') {
    const start = editableEl.selectionStart;
    const end = editableEl.selectionEnd;
    const before = editableEl.value.slice(0, start);
    const after = editableEl.value.slice(end);
    editableEl.value = before + newText + after;
    editableEl.selectionStart = start;
    editableEl.selectionEnd = start + newText.length;
    // Dispatch input event so frameworks react
    editableEl.dispatchEvent(new Event('input', { bubbles: true }));
    editableEl.focus();
  } else if (editableEl.isContentEditable && savedRange) {
    savedRange.deleteContents();
    const textNode = document.createTextNode(newText);
    savedRange.insertNode(textNode);
    // Move cursor to end of inserted text
    const sel = window.getSelection();
    savedRange.setStartAfter(textNode);
    savedRange.setEndAfter(textNode);
    sel.removeAllRanges();
    sel.addRange(savedRange);
    // Dispatch input event
    editableEl.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

function showPolishMenu(selection, text) {
  removePolishMenu();
  removeTooltip();

  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  const savedRange = range.cloneRange(); // Save range before focus is lost
  const rect = range.getBoundingClientRect();
  if (!rect || (rect.width === 0 && rect.height === 0)) return;

  if (notchEl) notchEl.classList.add('ae-notch-hidden');

  // Capture context
  try {
    const anchorNode = selection.anchorNode;
    if (anchorNode && anchorNode.textContent) {
      const full = anchorNode.textContent;
      const idx = full.indexOf(text.slice(0, 20));
      const start = Math.max(0, idx - 100);
      const end = Math.min(full.length, idx + text.length + 100);
      lastSelectionContext = full.slice(start, end);
    }
  } catch(e) { lastSelectionContext = ''; }

  lastSelectedText = text;
  const editableEl = getEditableAncestor(selection.anchorNode);

  const menu = document.createElement('div');
  menu.className = 'ae-polish-menu';

  const logo = document.createElement('img');
  logo.className = 'ae-polish-logo';
  logo.src = chrome.runtime.getURL('dashboard/bloub.gif');
  logo.alt = 'Aether';
  menu.appendChild(logo);

  const polishActions = [
    { label: 'Fix Grammar', action: 'fix_grammar' },
    { label: 'Formal', action: 'make_formal' },
    { label: 'Casual', action: 'make_casual' },
    { label: 'Concise', action: 'make_concise' },
    { label: 'Translate', action: 'translate' },
  ];

  polishActions.forEach(pa => {
    const btn = document.createElement('button');
    btn.className = 'ae-polish-btn';
    btn.textContent = pa.label;
    
    // Prevent focus loss when clicking buttons
    btn.onmousedown = (e) => e.preventDefault();

    btn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();

      if (pa.action === 'translate') {
        showTranslateLanguagePicker(menu, btn, text, editableEl, savedRange);
        return;
      }

      // Show loading state
      const originalHTML = btn.innerHTML;
      btn.innerHTML = `<span class="ae-polish-spinner"></span> Working...`;
      btn.classList.add('ae-polish-loading');

      // Disable other buttons
      menu.querySelectorAll('.ae-polish-btn').forEach(b => { b.style.pointerEvents = 'none'; b.style.opacity = '0.5'; });
      btn.style.opacity = '1';

      chrome.runtime.sendMessage({
        type: 'POLISH_TEXT',
        payload: { text, action: pa.action, context: lastSelectionContext }
      }, result => {
        if (chrome.runtime.lastError || !result?.success) {
          btn.innerHTML = originalHTML;
          btn.classList.remove('ae-polish-loading');
          menu.querySelectorAll('.ae-polish-btn').forEach(b => { b.style.pointerEvents = ''; b.style.opacity = ''; });
          return;
        }

        if (editableEl) {
          replaceSelectedText(editableEl, result.data, savedRange);
        } else {
          // Fallback: copy to clipboard
          navigator.clipboard.writeText(result.data).catch(() => {});
        }
        removePolishMenu();
      });
    };

    menu.appendChild(btn);
  });

  uiRoot.appendChild(menu);
  currentPolishMenu = menu;

  // Position the menu
  const menuRect = menu.getBoundingClientRect();
  let top = rect.top - menuRect.height - 10;
  let left = rect.left + (rect.width / 2) - (menuRect.width / 2);
  if (top < 10) top = rect.bottom + 10;
  if (left < 10) left = 10;
  if (left + menuRect.width > window.innerWidth - 10) left = window.innerWidth - menuRect.width - 10;
  menu.style.top = `${Math.max(10, top)}px`;
  menu.style.left = `${Math.max(10, left)}px`;
}

function showTranslateLanguagePicker(menu, triggerBtn, text, editableEl, savedRange) {
  // Remove existing picker
  const existing = menu.querySelector('.ae-polish-lang-picker');
  if (existing) { existing.remove(); return; }

  const picker = document.createElement('div');
  picker.className = 'ae-polish-lang-picker';
  picker.style.position = 'absolute';
  
  // Prevent focus loss when clicking the picker background
  picker.onmousedown = (e) => e.preventDefault();

  const languages = [
    'Bangla', 'Spanish', 'French', 'German', 'Italian', 'Chinese',
    'Japanese', 'Korean', 'Russian', 'Portuguese', 'Arabic', 'Hindi',
    'Turkish', 'Dutch', 'Swedish', 'Thai', 'Vietnamese'
  ];

  languages.forEach(lang => {
    const opt = document.createElement('button');
    opt.className = 'ae-polish-lang-opt';
    opt.textContent = lang;
    opt.onmousedown = (e) => e.preventDefault();
    opt.onclick = (e) => {
      e.stopPropagation();
      picker.remove();

      // Show loading
      const originalHTML = triggerBtn.innerHTML;
      triggerBtn.innerHTML = `<span class="ae-polish-spinner"></span> Translating...`;
      triggerBtn.classList.add('ae-polish-loading');
      menu.querySelectorAll('.ae-polish-btn').forEach(b => { b.style.pointerEvents = 'none'; b.style.opacity = '0.5'; });
      triggerBtn.style.opacity = '1';

      chrome.runtime.sendMessage({
        type: 'POLISH_TEXT',
        payload: { text, action: 'translate', targetLang: lang, context: lastSelectionContext }
      }, result => {
        if (chrome.runtime.lastError || !result?.success) {
          triggerBtn.innerHTML = originalHTML;
          triggerBtn.classList.remove('ae-polish-loading');
          menu.querySelectorAll('.ae-polish-btn').forEach(b => { b.style.pointerEvents = ''; b.style.opacity = ''; });
          return;
        }

        if (editableEl) {
          replaceSelectedText(editableEl, result.data, savedRange);
        } else {
          navigator.clipboard.writeText(result.data).catch(() => {});
        }
        removePolishMenu();
      });
    };
    picker.appendChild(opt);
  });

  // Position picker above the menu
  menu.style.position = 'fixed'; // ensure relative positioning context
  menu.appendChild(picker);

  // Adjust picker position
  const menuRect = menu.getBoundingClientRect();
  const pickerRect = picker.getBoundingClientRect();
  picker.style.bottom = `${menuRect.height + 6}px`;
  picker.style.right = '0px';
  picker.style.left = 'auto';

  // If picker goes off screen top, flip to below
  if (menuRect.top - pickerRect.height - 6 < 10) {
    picker.style.bottom = 'auto';
    picker.style.top = `${menuRect.height + 6}px`;
  }
}

// ============================================================================
// 12. WRITING ASSISTANT — // SHORTCUT PROMPT EXPANDER
// ============================================================================
let activeSlashPromptEl = null;
let slashPromptIndicator = null;

function cancelSlashPrompt() {
  if (slashPromptIndicator && slashPromptIndicator.parentNode) {
    slashPromptIndicator.parentNode.removeChild(slashPromptIndicator);
  }
  slashPromptIndicator = null;
  activeSlashPromptEl = null;
}

function showSlashIndicator(targetEl) {
  cancelSlashPrompt();
  const indicator = document.createElement('div');
  indicator.className = 'ae-prompt-indicator';
  indicator.innerHTML = '<span class="ae-prompt-dot"></span> AI generating...';

  // Position near the target element
  const rect = targetEl.getBoundingClientRect();
  indicator.style.top = `${window.scrollY + rect.bottom + 4}px`;
  indicator.style.left = `${window.scrollX + rect.left}px`;

  document.body.appendChild(indicator);
  slashPromptIndicator = indicator;
}

/**
 * Extract the text content and position of a // command from an input element.
 * Returns { prompt, fullText, matchStart, matchEnd } or null if no match.
 */
function extractSlashCommand(el) {
  if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
    const val = el.value;
    const cursorPos = el.selectionStart;
    // Look for // pattern in the text up to cursor
    const textUpToCursor = val.slice(0, cursorPos);
    const match = textUpToCursor.match(/\/\/([^\n]+)$/);
    if (match) {
      const prompt = match[1].trim();
      const matchStart = cursorPos - match[0].length;
      return { prompt, fullText: val, matchStart, matchEnd: cursorPos };
    }
  } else if (el.isContentEditable) {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const node = sel.anchorNode;
    if (!node || node.nodeType !== Node.TEXT_NODE) return null;
    const textContent = node.textContent;
    const offset = sel.anchorOffset;
    const textUpToCursor = textContent.slice(0, offset);
    const match = textUpToCursor.match(/\/\/([^\n]+)$/);
    if (match) {
      const prompt = match[1].trim();
      const matchStart = offset - match[0].length;
      return { prompt, fullText: textContent, matchStart, matchEnd: offset, node };
    }
  }
  return null;
}

/**
 * Replace the // command in the input with the AI-generated text.
 */
function replaceSlashCommand(el, command, replacement) {
  if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
    const before = el.value.slice(0, command.matchStart);
    const after = el.value.slice(command.matchEnd);
    el.value = before + replacement + after;
    const newCursorPos = command.matchStart + replacement.length;
    el.selectionStart = newCursorPos;
    el.selectionEnd = newCursorPos;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.focus();
  } else if (el.isContentEditable && command.node) {
    const textNode = command.node;
    const before = textNode.textContent.slice(0, command.matchStart);
    const after = textNode.textContent.slice(command.matchEnd);
    textNode.textContent = before + replacement + after;

    // Restore cursor
    const sel = window.getSelection();
    const range = document.createRange();
    const newPos = command.matchStart + replacement.length;
    range.setStart(textNode, Math.min(newPos, textNode.textContent.length));
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
}

/**
 * Listen for keydown on inputs/textareas/contenteditables to detect // commands.
 */
document.addEventListener('keydown', (e) => {
  // Only process Tab or Enter
  if (e.key !== 'Tab' && e.key !== 'Enter') return;

  const el = e.target;
  if (!el) return;
  const tag = el.tagName;
  const isEditable = (tag === 'TEXTAREA') ||
    (tag === 'INPUT' && (!el.type || el.type === 'text' || el.type === 'search' || el.type === 'url' || el.type === 'email')) ||
    el.isContentEditable;

  if (!isEditable) return;

  const command = extractSlashCommand(el);
  if (!command || !command.prompt || command.prompt.length < 2) return;

  // We found a valid // command — prevent the default action
  e.preventDefault();
  e.stopPropagation();

  // Gather surrounding context (200 chars around the // command)
  const contextStart = Math.max(0, command.matchStart - 200);
  const contextEnd = Math.min(command.fullText.length, command.matchEnd + 200);
  const surroundingContext = command.fullText.slice(contextStart, command.matchStart).trim();

  activeSlashPromptEl = el;
  showSlashIndicator(el);

  chrome.runtime.sendMessage({
    type: 'POLISH_TEXT',
    payload: {
      text: command.prompt,
      action: 'expand_prompt',
      context: surroundingContext
    }
  }, result => {
    cancelSlashPrompt();
    if (chrome.runtime.lastError || !result?.success) {
      // On error, do nothing — leave the original text
      return;
    }
    replaceSlashCommand(el, command, result.data);
  });
}, true); // Capture phase to intercept before other handlers

// ============================================================================
// 13. INIT
// ============================================================================
createNotch();