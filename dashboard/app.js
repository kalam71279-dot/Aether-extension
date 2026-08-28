const features = [
    { icon: '☑', title: 'Tasks & Issues', desc: 'Manage your daily tasks and active sprint issues seamlessly. Keep track of what needs to be done.' },
    { icon: '✦', title: 'AI Summarizer', desc: 'Instantly summarize long articles, documents, and codebases into bite-sized actionable insights.' },
    { icon: '◎', title: 'Context Mind Map', desc: 'Visualize your workspace contexts and connected files in an interactive graph node view.' },
    { icon: '📖', title: 'Smart Dictionary', desc: 'Look up terms, jargon, and code syntax references instantly without leaving your dashboard.' },
    { icon: '🌍', title: 'Geo-Explorer', desc: 'Monitor timezone overlaps for your distributed team and schedule meetings effortlessly.' },
    { icon: '👁', title: 'Multimodal Vision', desc: 'Analyze screenshots, images, and mockups using advanced computer vision models.' },
    { icon: '⚙', title: 'System Settings', desc: 'Configure Aether OS preferences, extensions, and aesthetic customizations.' },
    { icon: '👤', title: 'User Profile', desc: 'View your activity stats, configure integrations, and manage your account credentials.' }
];

let currentSector = 0;
let isScrolling = false;

document.addEventListener('DOMContentLoaded', () => {
    initClock();
    initRadialDial();
    initSearch();
    initShortcuts();
    initRulerClock();
});

function initClock() {
    const dayNameEl = document.getElementById('day-name');
    const fullDateEl = document.getElementById('full-date');
    const liveTimeEl = document.getElementById('live-time');

    const updateClock = () => {
        const now = new Date();
        const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
        
        dayNameEl.textContent = days[now.getDay()];
        fullDateEl.textContent = `${now.getDate()} ${months[now.getMonth()]}, ${now.getFullYear()}`;
        
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        liveTimeEl.textContent = `${hh}:${mm}`;
    };

    updateClock();
    setInterval(updateClock, 1000);
}

function initRadialDial() {
    const svgGroup = document.getElementById('sectors-group');
    const dial = document.getElementById('radial-dial');
    const container = document.getElementById('dial-container');
    const radius = 250;
    const numSectors = 8;
    const anglePerSector = 360 / numSectors;

    const describeArc = (x, y, r, startAngle, endAngle) => {
        const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
            const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
            return {
                x: centerX + (radius * Math.cos(angleInRadians)),
                y: centerY + (radius * Math.sin(angleInRadians))
            };
        };
        const start = polarToCartesian(x, y, r, endAngle);
        const end = polarToCartesian(x, y, r, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        return [
            "M", x, y,
            "L", start.x, start.y,
            "A", r, r, 0, largeArcFlag, 0, end.x, end.y,
            "Z"
        ].join(" ");
    };

    // Draw sectors
    for (let i = 0; i < numSectors; i++) {
        const startAngle = i * anglePerSector;
        const endAngle = startAngle + anglePerSector;
        
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", describeArc(radius, radius, radius, startAngle, endAngle));
        path.setAttribute("class", `sector-path ${i === currentSector ? 'active' : ''}`);
        path.dataset.index = i;
        
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        const midAngle = startAngle + (anglePerSector / 2);
        const textRadius = radius * 0.75;
        const tx = radius + (textRadius * Math.cos((midAngle - 90) * Math.PI / 180));
        const ty = radius + (textRadius * Math.sin((midAngle - 90) * Math.PI / 180));
        
        text.setAttribute("x", tx);
        text.setAttribute("y", ty);
        text.setAttribute("class", `sector-label ${i === currentSector ? 'active' : ''}`);
        text.setAttribute("transform", `rotate(${midAngle}, ${tx}, ${ty})`);
        text.innerHTML = `<tspan font-size="20">${features[i].icon}</tspan><tspan x="${tx}" dy="20">${features[i].title.split(' ')[0]}</tspan>`;
        
        path.addEventListener('click', () => {
            updateSector(i);
        });

        svgGroup.appendChild(path);
        svgGroup.appendChild(text);
    }

    // Wheel event
    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (isScrolling) return;
        
        isScrolling = true;
        if (e.deltaY > 0) {
            updateSector((currentSector + 1) % numSectors);
        } else {
            updateSector((currentSector - 1 + numSectors) % numSectors);
        }
        
        setTimeout(() => { isScrolling = false; }, 300); // debounce
    });

    updateFeatureCard();
}

function updateSector(index) {
    const oldSector = currentSector;
    currentSector = index;
    
    // Update SVG active classes
    const paths = document.querySelectorAll('.sector-path');
    const labels = document.querySelectorAll('.sector-label');
    paths[oldSector].classList.remove('active');
    labels[oldSector].classList.remove('active');
    paths[currentSector].classList.add('active');
    labels[currentSector].classList.add('active');

    // Rotate dial
    const dial = document.getElementById('radial-dial');
    // We want the active sector to be pointing somewhat right (90 deg).
    // Sector i center angle is i*45 + 22.5.
    // If currentSector = 0, angle is 22.5. We want it at 90. Rotation = 90 - 22.5 = 67.5.
    const centerAngle = (currentSector * 45) + 22.5;
    const rotateAngle = 90 - centerAngle;
    dial.style.transform = `rotate(${rotateAngle}deg)`;

    // Update feature card with fade
    const card = document.getElementById('feature-card');
    card.classList.add('fade');
    setTimeout(() => {
        updateFeatureCard();
        card.classList.remove('fade');
    }, 200); // half of css transition time
}

function updateFeatureCard() {
    const feat = features[currentSector];
    document.getElementById('card-icon').textContent = feat.icon;
    document.getElementById('card-title').textContent = feat.title;
    document.getElementById('card-desc').textContent = feat.desc;
}

function initSearch() {
    const input = document.getElementById('search-input');
    const btn = document.getElementById('search-btn');

    const executeSearch = () => {
        const q = input.value.trim();
        if (q) {
            window.location.href = `https://www.google.com/search?q=${encodeURIComponent(q)}`;
        }
    };

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') executeSearch();
    });
    btn.addEventListener('click', executeSearch);
}

const defaultShortcuts = [
    { url: 'https://youtube.com', name: 'YouTube', icon: '▶', color: '#ff0000' },
    { url: 'https://github.com', name: 'GitHub', icon: '◆', color: '#ffffff' },
    { url: 'https://reddit.com', name: 'Reddit', icon: '◉', color: '#ff4500' },
    { url: 'https://wikipedia.org', name: 'Wikipedia', icon: 'W', color: '#c0c0c0' }
];

function initShortcuts() {
    const storageKey = 'shortcuts';
    // Use chrome.storage.local if available, else localStorage for dev
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get([storageKey], (result) => {
            let scs = result[storageKey];
            if (!scs || !scs.length) scs = defaultShortcuts;
            renderShortcuts(scs);
        });
    } else {
        let scs = JSON.parse(localStorage.getItem(storageKey));
        if (!scs || !scs.length) scs = defaultShortcuts;
        renderShortcuts(scs);
    }

    setupAddShortcutForm();
}

function saveShortcuts(scs) {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.set({ shortcuts: scs });
    } else {
        localStorage.setItem('shortcuts', JSON.stringify(scs));
    }
}

function renderShortcuts(scs) {
    const row = document.getElementById('shortcuts-row');
    row.innerHTML = '';

    scs.forEach((sc, index) => {
        const card = document.createElement('a');
        card.className = 'shortcut-card';
        card.href = '#';
        card.onclick = (e) => {
            e.preventDefault();
            window.open(sc.url, '_self');
        };
        
        const icon = document.createElement('div');
        icon.className = 'shortcut-icon';
        icon.textContent = sc.icon || sc.name.charAt(0).toUpperCase();
        icon.style.color = sc.color || '#fff';
        
        const name = document.createElement('div');
        name.className = 'shortcut-name';
        name.textContent = sc.name;

        // Delete btn
        const del = document.createElement('button');
        del.className = 'delete-btn';
        del.innerHTML = '&times;';
        del.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            scs.splice(index, 1);
            saveShortcuts(scs);
            renderShortcuts(scs);
        };

        card.appendChild(icon);
        card.appendChild(name);
        card.appendChild(del);
        row.appendChild(card);
    });

    // Add button
    const addBtn = document.createElement('div');
    addBtn.className = 'shortcut-card add-shortcut-btn';
    addBtn.innerHTML = '<div class="shortcut-icon" style="color:rgba(255,255,255,0.5)">+</div><div class="shortcut-name">Add</div>';
    addBtn.onclick = () => {
        document.getElementById('add-shortcut-form').classList.remove('hidden');
    };
    row.appendChild(addBtn);
}

function setupAddShortcutForm() {
    const form = document.getElementById('add-shortcut-form');
    const saveBtn = document.getElementById('save-shortcut-btn');
    const cancelBtn = document.getElementById('cancel-shortcut-btn');
    const nameInput = document.getElementById('shortcut-name');
    const urlInput = document.getElementById('shortcut-url');

    cancelBtn.onclick = () => {
        form.classList.add('hidden');
        nameInput.value = '';
        urlInput.value = '';
    };

    saveBtn.onclick = () => {
        let name = nameInput.value.trim();
        let url = urlInput.value.trim();
        if (name && url) {
            if (!url.startsWith('http')) url = 'https://' + url;
            const newSc = { url, name, icon: name.charAt(0).toUpperCase(), color: '#38BDF8' };
            
            const storageKey = 'shortcuts';
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.get([storageKey], (res) => {
                    let scs = res[storageKey] || defaultShortcuts;
                    scs.push(newSc);
                    saveShortcuts(scs);
                    renderShortcuts(scs);
                });
            } else {
                let scs = JSON.parse(localStorage.getItem(storageKey)) || defaultShortcuts;
                scs.push(newSc);
                saveShortcuts(scs);
                renderShortcuts(scs);
            }
            cancelBtn.onclick();
        }
    };
}

function initRulerClock() {
    const canvas = document.getElementById('ruler-canvas');
    const ctx = canvas.getContext('2d');
    const secondsCallout = document.getElementById('seconds-callout');
    const hmCallout = document.getElementById('hm-callout');

    const updateCanvasSize = () => {
        const height = window.innerHeight;
        canvas.height = height;
        canvas.style.height = `${height}px`;
    };
    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize();

    const pixelsPerSecond = 20;

    function draw() {
        const now = new Date();
        const height = canvas.height;
        const width = canvas.width;
        
        ctx.clearRect(0, 0, width, height);

        const currentSec = now.getSeconds();
        const currentMs = now.getMilliseconds();
        const totalSecFloat = currentSec + (currentMs / 1000);
        
        // Update readouts
        secondsCallout.textContent = String(currentSec).padStart(2, '0');
        const h = now.getHours();
        const m = String(now.getMinutes()).padStart(2, '0');
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        hmCallout.textContent = `${String(h12).padStart(2, '0')}:${m} ${ampm}`;

        const centerY = height / 2;

        ctx.font = '11px "JetBrains Mono"';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        // Draw ruler from -30 to +30 seconds around the current time
        for (let i = -30; i <= 30; i++) {
            const secMarker = (Math.floor(totalSecFloat) + i + 60) % 60;
            const diff = i - (currentMs / 1000); // fractional distance from center
            const y = centerY + (diff * pixelsPerSecond);

            if (y >= 0 && y <= height) {
                if (secMarker % 5 === 0) {
                    // Major tick
                    ctx.fillStyle = 'rgba(56, 139, 255, 0.5)';
                    ctx.fillRect(width - 30, y - 1, 30, 2);
                    
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
                    ctx.fillText(String(secMarker).padStart(2, '0'), width - 35, y);
                } else {
                    // Minor tick
                    ctx.fillStyle = 'rgba(56, 139, 255, 0.3)';
                    ctx.fillRect(width - 15, y, 15, 1);
                }
            }
        }

        requestAnimationFrame(draw);
    }

    requestAnimationFrame(draw);
}
