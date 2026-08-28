/**
 * Aether OS - Universal Dashboard UI Switcher
 * Connects all dashboard pages (index.html, index2.html, index3.html, index4.html)
 * with a dedicated floating trigger, visual modal preview cards, and seamless switching.
 * Keeps browser address bar clean (chrome://newtab) without exposing extension file paths.
 */
(() => {
    // 1. Available UI Dashboard Configurations
    const UI_DASHBOARDS = [
        {
            id: 'aether-os',
            file: 'index.html',
            key: '1',
            title: 'Aether OS',
            tagline: 'Futuristic Radial Hub',
            desc: 'Interactive AI radial command dial, vertical ruler tape clock, web search & smart workspace shortcuts.',
            tags: ['Radial Hub', 'AI Tools', 'Ruler Clock'],
            previewSvg: `<svg viewBox="0 0 400 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="bg-aether" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#0a0e17"/>
                        <stop offset="50%" stop-color="#111928"/>
                        <stop offset="100%" stop-color="#070a10"/>
                    </linearGradient>
                </defs>
                <rect width="400" height="220" fill="url(#bg-aether)"/>
                <!-- Background grid dots -->
                <circle cx="40" cy="30" r="1" fill="rgba(255,255,255,0.2)"/>
                <circle cx="120" cy="50" r="1" fill="rgba(255,255,255,0.2)"/>
                <circle cx="280" cy="40" r="1" fill="rgba(255,255,255,0.2)"/>
                <circle cx="340" cy="80" r="1" fill="rgba(255,255,255,0.2)"/>
                
                <!-- Left: Radial Dial & Card -->
                <circle cx="80" cy="110" r="48" fill="none" stroke="rgba(56,189,248,0.25)" stroke-width="1.5" stroke-dasharray="4,3"/>
                <circle cx="80" cy="110" r="32" fill="rgba(15,23,42,0.6)" stroke="#38bdf8" stroke-width="2"/>
                <circle cx="80" cy="110" r="10" fill="#38bdf8" filter="drop-shadow(0 0 6px #38bdf8)"/>
                <line x1="80" y1="62" x2="80" y2="78" stroke="#38bdf8" stroke-width="2"/>
                <line x1="80" y1="142" x2="80" y2="158" stroke="rgba(56,189,248,0.5)" stroke-width="1.5"/>
                <line x1="32" y1="110" x2="48" y2="110" stroke="rgba(56,189,248,0.5)" stroke-width="1.5"/>
                <line x1="112" y1="110" x2="128" y2="110" stroke="rgba(56,189,248,0.5)" stroke-width="1.5"/>
                <rect x="42" y="172" width="76" height="22" rx="6" fill="rgba(30,41,59,0.8)" stroke="rgba(255,255,255,0.15)"/>
                <text x="80" y="187" fill="#e2e8f0" font-size="8" font-weight="bold" font-family="sans-serif" text-anchor="middle">Tasks &amp; Issues</text>

                <!-- Center: Day, Time, Search & Shortcuts -->
                <text x="200" y="52" fill="#ffffff" font-size="16" font-weight="900" font-family="sans-serif" text-anchor="middle" letter-spacing="2">THURSDAY</text>
                <text x="200" y="68" fill="#94a3b8" font-size="8" font-family="sans-serif" text-anchor="middle" letter-spacing="1">30 JULY, 2026</text>
                <text x="200" y="98" fill="#38bdf8" font-size="22" font-weight="bold" font-family="sans-serif" text-anchor="middle">23:35</text>
                
                <rect x="145" y="116" width="110" height="22" rx="11" fill="rgba(30,41,59,0.85)" stroke="rgba(56,189,248,0.4)"/>
                <circle cx="158" cy="127" r="4" fill="none" stroke="#94a3b8" stroke-width="1.2"/>
                <line x1="161" y1="130" x2="164" y2="133" stroke="#94a3b8" stroke-width="1.2"/>
                <text x="172" y="130" fill="#94a3b8" font-size="8" font-family="sans-serif">Search web...</text>

                <rect x="150" y="148" width="22" height="20" rx="5" fill="#ef4444"/>
                <text x="161" y="161" fill="#fff" font-size="7" font-weight="bold" text-anchor="middle">YT</text>
                <rect x="177" y="148" width="22" height="20" rx="5" fill="#3b82f6"/>
                <text x="188" y="161" fill="#fff" font-size="7" font-weight="bold" text-anchor="middle">GH</text>
                <rect x="204" y="148" width="22" height="20" rx="5" fill="#10b981"/>
                <text x="215" y="161" fill="#fff" font-size="7" font-weight="bold" text-anchor="middle">AI</text>
                <rect x="231" y="148" width="22" height="20" rx="5" fill="#f59e0b"/>
                <text x="242" y="161" fill="#fff" font-size="7" font-weight="bold" text-anchor="middle">RD</text>

                <!-- Right: Ruler Clock -->
                <rect x="330" y="30" width="45" height="160" rx="8" fill="rgba(15,23,42,0.7)" stroke="rgba(255,255,255,0.1)"/>
                <line x1="338" y1="50" x2="350" y2="50" stroke="#64748b" stroke-width="1"/>
                <line x1="338" y1="65" x2="358" y2="65" stroke="#64748b" stroke-width="1"/>
                <line x1="338" y1="80" x2="350" y2="80" stroke="#64748b" stroke-width="1"/>
                <line x1="338" y1="95" x2="362" y2="95" stroke="#38bdf8" stroke-width="2"/>
                <line x1="338" y1="110" x2="350" y2="110" stroke="#64748b" stroke-width="1"/>
                <line x1="338" y1="125" x2="358" y2="125" stroke="#64748b" stroke-width="1"/>
                <line x1="338" y1="140" x2="350" y2="140" stroke="#64748b" stroke-width="1"/>
                <line x1="338" y1="155" x2="358" y2="155" stroke="#64748b" stroke-width="1"/>
                <rect x="345" y="86" width="28" height="18" rx="4" fill="#38bdf8"/>
                <text x="359" y="98" fill="#0f172a" font-size="7" font-weight="bold" font-family="sans-serif" text-anchor="middle">23:35</text>
            </svg>`
        },
        {
            id: 'minimal-dashboard',
            file: 'index2.html',
            key: '2',
            title: 'Minimal Dashboard',
            tagline: 'Vintage Minimalist Workspace',
            desc: 'Clean aesthetic with analog dial clock, 7-day stencil calendar strip, pinned shortcuts & search.',
            tags: ['Analog Clock', '7-Day Calendar', 'Curated Pins'],
            previewSvg: `<svg viewBox="0 0 400 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="bg-minimal" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#4a5052"/>
                        <stop offset="50%" stop-color="#343a3c"/>
                        <stop offset="100%" stop-color="#23282a"/>
                    </linearGradient>
                </defs>
                <rect width="400" height="220" fill="url(#bg-minimal)"/>
                <circle cx="30" cy="24" r="5" fill="none" stroke="#a0b3be" stroke-width="1.2"/>
                <rect x="44" y="19" width="10" height="10" rx="2" fill="none" stroke="#a0b3be" stroke-width="1.2"/>
                <line x1="64" y1="24" x2="74" y2="24" stroke="#a0b3be" stroke-width="1.2"/>
                <line x1="69" y1="19" x2="69" y2="29" stroke="#a0b3be" stroke-width="1.2"/>

                <text x="350" y="32" fill="#c7d8e2" font-size="14" font-family="monospace" font-weight="bold" text-anchor="end">THURSDAY</text>
                <text x="350" y="46" fill="#91a7b4" font-size="9" font-family="monospace" text-anchor="end">30 JULY 2026</text>

                <rect x="35" y="70" width="150" height="24" rx="4" fill="rgba(20,25,28,0.5)" stroke="rgba(255,255,255,0.15)"/>
                <text x="48" y="85" fill="#a9bdc9" font-size="8" font-family="sans-serif">Search the web...</text>

                <rect x="35" y="106" width="32" height="28" rx="6" fill="rgba(20,25,28,0.4)" stroke="rgba(255,255,255,0.1)"/>
                <text x="51" y="123" fill="#c7d8e2" font-size="10" font-weight="bold" text-anchor="middle">★</text>
                <rect x="74" y="106" width="32" height="28" rx="6" fill="rgba(20,25,28,0.4)" stroke="rgba(255,255,255,0.1)"/>
                <text x="90" y="123" fill="#c7d8e2" font-size="9" font-weight="bold" text-anchor="middle">G</text>
                <rect x="113" y="106" width="32" height="28" rx="6" fill="rgba(20,25,28,0.4)" stroke="rgba(255,255,255,0.1)"/>
                <text x="129" y="123" fill="#c7d8e2" font-size="9" font-weight="bold" text-anchor="middle">Y</text>
                <rect x="152" y="106" width="32" height="28" rx="6" fill="rgba(20,25,28,0.4)" stroke="rgba(255,255,255,0.1)"/>
                <text x="168" y="123" fill="#c7d8e2" font-size="9" font-weight="bold" text-anchor="middle">+</text>

                <circle cx="280" cy="98" r="42" fill="rgba(20,25,28,0.6)" stroke="#a9bdc9" stroke-width="2"/>
                <circle cx="280" cy="98" r="3" fill="#d1bd38"/>
                <line x1="280" y1="98" x2="280" y2="72" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
                <line x1="280" y1="98" x2="300" y2="98" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
                <line x1="280" y1="98" x2="266" y2="114" stroke="#d1bd38" stroke-width="1.5" stroke-linecap="round"/>
                <circle cx="280" cy="62" r="1.5" fill="#a9bdc9"/>
                <circle cx="316" cy="98" r="1.5" fill="#a9bdc9"/>
                <circle cx="280" cy="134" r="1.5" fill="#a9bdc9"/>
                <circle cx="244" cy="98" r="1.5" fill="#a9bdc9"/>

                <rect x="35" y="156" width="330" height="42" rx="8" fill="rgba(20,25,28,0.6)" stroke="rgba(255,255,255,0.1)"/>
                <g fill="#91a7b4" font-size="7" font-family="monospace" text-anchor="middle">
                    <text x="65" y="172">SUN</text> <text x="105" y="172">MON</text> <text x="145" y="172">TUE</text> 
                    <text x="185" y="172" fill="#d1bd38" font-weight="bold">WED</text> <text x="225" y="172">THU</text> <text x="265" y="172">FRI</text> <text x="305" y="172">SAT</text>
                    <text x="65" y="188" fill="#c7d8e2">26</text> <text x="105" y="188" fill="#c7d8e2">27</text> <text x="145" y="188" fill="#c7d8e2">28</text>
                    <text x="185" y="188" fill="#d1bd38" font-weight="bold">29</text> <text x="225" y="188" fill="#c7d8e2">30</text> <text x="265" y="188" fill="#c7d8e2">31</text> <text x="305" y="188" fill="#c7d8e2">01</text>
                </g>
            </svg>`
        },
        {
            id: 'forest-dashboard',
            file: 'index3.html',
            key: '3',
            title: 'Forest Dashboard',
            tagline: 'Nature Glassmorphism Hub',
            desc: 'Lush misty forest aesthetic, digital clock, live weather widget, news ticker & interactive note taker.',
            tags: ['Live Weather', 'News Feed', 'Quick Notes'],
            previewSvg: `<svg viewBox="0 0 400 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="bg-forest" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#14261d"/>
                        <stop offset="50%" stop-color="#1d382b"/>
                        <stop offset="100%" stop-color="#0d1b14"/>
                    </linearGradient>
                </defs>
                <rect width="400" height="220" fill="url(#bg-forest)"/>
                <polygon points="30,220 50,110 70,220" fill="rgba(10,25,18,0.7)"/>
                <polygon points="60,220 90,80 120,220" fill="rgba(15,35,25,0.8)"/>
                <polygon points="310,220 340,90 370,220" fill="rgba(15,35,25,0.7)"/>
                <polygon points="350,220 380,110 410,220" fill="rgba(10,25,18,0.8)"/>

                <rect x="110" y="12" width="180" height="22" rx="11" fill="rgba(34,38,40,0.75)" stroke="rgba(255,255,255,0.12)"/>
                <circle cx="130" cy="23" r="6" fill="#e94b35"/>
                <circle cx="155" cy="23" r="6" fill="#ff0033"/>
                <circle cx="180" cy="23" r="6" fill="#1877f2"/>
                <circle cx="205" cy="23" r="6" fill="#ff5b20"/>
                <circle cx="230" cy="23" r="6" fill="#000000"/>
                <circle cx="255" cy="23" r="6" fill="#1db954"/>

                <rect x="25" y="44" width="105" height="74" rx="10" fill="rgba(45,55,50,0.65)" stroke="rgba(200,216,76,0.3)"/>
                <circle cx="58" cy="74" r="18" fill="rgba(0,0,0,0.3)" stroke="#c8d84c" stroke-width="1.5"/>
                <line x1="58" y1="74" x2="58" y2="64" stroke="#fff" stroke-width="1.5"/>
                <line x1="58" y1="74" x2="68" y2="74" stroke="#c8d84c" stroke-width="1.5"/>
                <text x="82" y="70" fill="#e9eef2" font-size="10" font-weight="bold" font-family="sans-serif">10:42</text>
                <text x="82" y="82" fill="#8f9aa2" font-size="7" font-family="sans-serif">AUG 24</text>

                <rect x="138" y="44" width="120" height="74" rx="10" fill="rgba(45,55,50,0.65)" stroke="rgba(255,255,255,0.12)"/>
                <circle cx="162" cy="70" r="10" fill="#f59e0b"/>
                <text x="180" y="72" fill="#fff" font-size="15" font-weight="bold" font-family="sans-serif">7°C</text>
                <text x="180" y="84" fill="#86b6df" font-size="8" font-family="sans-serif">Clear Sky</text>
                <text x="146" y="105" fill="#e9eef2" font-size="7.5" font-family="sans-serif">📝 Quick note saved</text>

                <rect x="266" y="44" width="108" height="74" rx="10" fill="rgba(45,55,50,0.65)" stroke="rgba(255,255,255,0.12)"/>
                <text x="276" y="60" fill="#c8d84c" font-size="8" font-weight="bold" font-family="sans-serif">LIVE NEWS</text>
                <rect x="276" y="67" width="88" height="4" rx="2" fill="#cbd5e1" opacity="0.8"/>
                <rect x="276" y="76" width="65" height="4" rx="2" fill="#94a3b8" opacity="0.6"/>
                <rect x="276" y="85" width="80" height="4" rx="2" fill="#cbd5e1" opacity="0.8"/>
                <rect x="276" y="94" width="50" height="4" rx="2" fill="#94a3b8" opacity="0.6"/>

                <rect x="25" y="128" width="80" height="48" rx="6" fill="rgba(34,44,38,0.7)" stroke="rgba(200,216,76,0.4)"/>
                <text x="35" y="144" fill="#c8d84c" font-size="8" font-weight="bold">MON 24</text>
                <text x="35" y="160" fill="#cbd5e1" font-size="7">Disclosure Day</text>

                <rect x="112" y="128" width="80" height="48" rx="6" fill="rgba(34,44,38,0.5)" stroke="rgba(255,255,255,0.08)"/>
                <text x="122" y="144" fill="#8f9aa2" font-size="8">TUE 25</text>
                <text x="122" y="160" fill="#cbd5e1" font-size="7">Last Sunrise</text>

                <rect x="199" y="128" width="80" height="48" rx="6" fill="rgba(34,44,38,0.5)" stroke="rgba(255,255,255,0.08)"/>
                <text x="209" y="144" fill="#8f9aa2" font-size="8">WED 26</text>
                <text x="209" y="160" fill="#8f9aa2" font-size="7">Team Sync</text>

                <rect x="286" y="128" width="88" height="48" rx="6" fill="rgba(34,44,38,0.5)" stroke="rgba(255,255,255,0.08)"/>
                <text x="296" y="144" fill="#8f9aa2" font-size="8">THU 27</text>
                <text x="296" y="160" fill="#cbd5e1" font-size="7">Colony Launch</text>

                <rect x="0" y="196" width="400" height="24" fill="rgba(15,22,18,0.9)"/>
                <text x="20" y="211" fill="#8f9aa2" font-size="7.5" font-family="sans-serif">⊞ My Section  •  YouTube Premium price update ticker</text>
            </svg>`
        },
        {
            id: 'mountain-desktop',
            file: 'index4.html',
            key: '4',
            title: 'Mountain Desktop',
            tagline: 'Sci-Fi Orbitron Desktop',
            desc: 'Bold Orbitron sci-fi date/time, dynamic peak sound visualizer, weather info & macOS-style dock launcher.',
            tags: ['Orbitron Clock', 'Peak Visualizer', 'App Dock'],
            previewSvg: `<svg viewBox="0 0 400 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="bg-mountain" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#0b131a"/>
                        <stop offset="40%" stop-color="#14212e"/>
                        <stop offset="100%" stop-color="#0b131a"/>
                    </linearGradient>
                </defs>
                <rect width="400" height="220" fill="url(#bg-mountain)"/>
                <polygon points="-20,200 80,120 180,200" fill="rgba(18,32,45,0.7)"/>
                <polygon points="120,200 240,95 360,200" fill="rgba(24,42,60,0.8)"/>
                <polygon points="280,200 350,130 420,200" fill="rgba(18,32,45,0.7)"/>
                
                <text x="200" y="44" fill="#ffffff" font-size="22" font-weight="900" font-family="sans-serif" text-anchor="middle" letter-spacing="6">SATURDAY</text>
                <text x="200" y="60" fill="#94a3b8" font-size="8" font-family="monospace" text-anchor="middle" letter-spacing="2">26 DECEMBER, 2026</text>
                <text x="200" y="78" fill="#38bdf8" font-size="12" font-weight="bold" font-family="monospace" text-anchor="middle">- 13:35 -</text>

                <g fill="#38bdf8">
                    <rect x="130" y="106" width="3" height="12" rx="1.5" opacity="0.4"/>
                    <rect x="138" y="100" width="3" height="18" rx="1.5" opacity="0.6"/>
                    <rect x="146" y="92" width="3" height="26" rx="1.5" opacity="0.8"/>
                    <rect x="154" y="85" width="3" height="33" rx="1.5" opacity="0.9"/>
                    <rect x="162" y="96" width="3" height="22" rx="1.5" opacity="0.7"/>
                    <rect x="170" y="88" width="3" height="30" rx="1.5" opacity="0.9"/>
                    <rect x="178" y="78" width="3" height="40" rx="1.5" fill="#ffffff"/>
                    <rect x="186" y="82" width="3" height="36" rx="1.5" opacity="0.95"/>
                    <rect x="194" y="74" width="3" height="44" rx="1.5" fill="#ffffff"/>
                    <rect x="202" y="74" width="3" height="44" rx="1.5" fill="#ffffff"/>
                    <rect x="210" y="82" width="3" height="36" rx="1.5" opacity="0.95"/>
                    <rect x="218" y="78" width="3" height="40" rx="1.5" fill="#ffffff"/>
                    <rect x="226" y="88" width="3" height="30" rx="1.5" opacity="0.9"/>
                    <rect x="234" y="96" width="3" height="22" rx="1.5" opacity="0.7"/>
                    <rect x="242" y="85" width="3" height="33" rx="1.5" opacity="0.9"/>
                    <rect x="250" y="92" width="3" height="26" rx="1.5" opacity="0.8"/>
                    <rect x="258" y="100" width="3" height="18" rx="1.5" opacity="0.6"/>
                    <rect x="266" y="106" width="3" height="12" rx="1.5" opacity="0.4"/>
                </g>

                <text x="200" y="136" fill="#cbd5e1" font-size="7.5" font-family="sans-serif" text-anchor="middle">Weather near location: 18°C Clear • Wind 8 km/h</text>

                <rect x="75" y="156" width="250" height="36" rx="18" fill="rgba(15,23,42,0.85)" stroke="rgba(255,255,255,0.16)"/>
                <circle cx="100" cy="174" r="10" fill="#3b82f6"/>
                <circle cx="125" cy="174" r="10" fill="#64748b"/>
                <circle cx="150" cy="174" r="10" fill="#ea580c"/>
                <circle cx="175" cy="174" r="10" fill="#ef4444"/>
                <circle cx="200" cy="174" r="10" fill="#8b5cf6"/>
                <circle cx="225" cy="174" r="10" fill="#ec4899"/>
                <circle cx="250" cy="174" r="10" fill="#10b981"/>
                <circle cx="275" cy="174" r="10" fill="#1db954"/>
                <circle cx="300" cy="174" r="10" fill="#0284c7"/>

                <circle cx="175" cy="188" r="1.5" fill="#38bdf8"/>
            </svg>`
        },
        {
            id: 'neuromorphic-Desktop',
            file: 'index5.html',
            key: '4',
            title: 'Neuromorphic Desktop',
            tagline: 'Futuristic Neuromorphic Design',
            desc: 'Innovative neuromorphic interface with tactile feedback, dynamic lighting effects, and immersive user experience.',
            tags: ['Orbitron Clock', 'Peak Visualizer', 'App Dock'],
            previewSvg: `<svg viewBox="0 0 400 220" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="bg-mountain" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#0b131a"/>
                        <stop offset="40%" stop-color="#14212e"/>
                        <stop offset="100%" stop-color="#0b131a"/>
                    </linearGradient>
                </defs>
                <rect width="400" height="220" fill="url(#bg-mountain)"/>
                <polygon points="-20,200 80,120 180,200" fill="rgba(18,32,45,0.7)"/>
                <polygon points="120,200 240,95 360,200" fill="rgba(24,42,60,0.8)"/>
                <polygon points="280,200 350,130 420,200" fill="rgba(18,32,45,0.7)"/>
                
                <text x="200" y="44" fill="#ffffff" font-size="22" font-weight="900" font-family="sans-serif" text-anchor="middle" letter-spacing="6">SATURDAY</text>
                <text x="200" y="60" fill="#94a3b8" font-size="8" font-family="monospace" text-anchor="middle" letter-spacing="2">26 DECEMBER, 2026</text>
                <text x="200" y="78" fill="#38bdf8" font-size="12" font-weight="bold" font-family="monospace" text-anchor="middle">- 13:35 -</text>

                <g fill="#38bdf8">
                    <rect x="130" y="106" width="3" height="12" rx="1.5" opacity="0.4"/>
                    <rect x="138" y="100" width="3" height="18" rx="1.5" opacity="0.6"/>
                    <rect x="146" y="92" width="3" height="26" rx="1.5" opacity="0.8"/>
                    <rect x="154" y="85" width="3" height="33" rx="1.5" opacity="0.9"/>
                    <rect x="162" y="96" width="3" height="22" rx="1.5" opacity="0.7"/>
                    <rect x="170" y="88" width="3" height="30" rx="1.5" opacity="0.9"/>
                    <rect x="178" y="78" width="3" height="40" rx="1.5" fill="#ffffff"/>
                    <rect x="186" y="82" width="3" height="36" rx="1.5" opacity="0.95"/>
                    <rect x="194" y="74" width="3" height="44" rx="1.5" fill="#ffffff"/>
                    <rect x="202" y="74" width="3" height="44" rx="1.5" fill="#ffffff"/>
                    <rect x="210" y="82" width="3" height="36" rx="1.5" opacity="0.95"/>
                    <rect x="218" y="78" width="3" height="40" rx="1.5" fill="#ffffff"/>
                    <rect x="226" y="88" width="3" height="30" rx="1.5" opacity="0.9"/>
                    <rect x="234" y="96" width="3" height="22" rx="1.5" opacity="0.7"/>
                    <rect x="242" y="85" width="3" height="33" rx="1.5" opacity="0.9"/>
                    <rect x="250" y="92" width="3" height="26" rx="1.5" opacity="0.8"/>
                    <rect x="258" y="100" width="3" height="18" rx="1.5" opacity="0.6"/>
                    <rect x="266" y="106" width="3" height="12" rx="1.5" opacity="0.4"/>
                </g>

                <text x="200" y="136" fill="#cbd5e1" font-size="7.5" font-family="sans-serif" text-anchor="middle">Weather near location: 18°C Clear • Wind 8 km/h</text>

                <rect x="75" y="156" width="250" height="36" rx="18" fill="rgba(15,23,42,0.85)" stroke="rgba(255,255,255,0.16)"/>
                <circle cx="100" cy="174" r="10" fill="#3b82f6"/>
                <circle cx="125" cy="174" r="10" fill="#64748b"/>
                <circle cx="150" cy="174" r="10" fill="#ea580c"/>
                <circle cx="175" cy="174" r="10" fill="#ef4444"/>
                <circle cx="200" cy="174" r="10" fill="#8b5cf6"/>
                <circle cx="225" cy="174" r="10" fill="#ec4899"/>
                <circle cx="250" cy="174" r="10" fill="#10b981"/>
                <circle cx="275" cy="174" r="10" fill="#1db954"/>
                <circle cx="300" cy="174" r="10" fill="#0284c7"/>

                <circle cx="175" cy="188" r="1.5" fill="#38bdf8"/>
            </svg>`
        }
    ];

    const isTopWindow = window.top === window;

    // If inside an embedded iframe, simply listen for keyboard shortcuts to forward to top
    if (!isTopWindow) {
        document.addEventListener('keydown', (e) => {
            if (e.altKey && (e.key === 's' || e.key === 'S')) {
                e.preventDefault();
                window.top.postMessage({ type: 'aether-toggle-switcher' }, '*');
            }
        });
        return;
    }

    // 2. Identify and Resolve Active UI
    function getStoredActiveUI() {
        try {
            const saved = localStorage.getItem('aether_active_ui');
            if (saved && UI_DASHBOARDS.some(d => d.file === saved)) {
                return saved;
            }
        } catch (e) {}
        return 'index2.html';
    }

    let activeFile = getStoredActiveUI();
    let currentDashboard = UI_DASHBOARDS.find(d => d.file === activeFile) || UI_DASHBOARDS[0];

    // 3. Viewport Frame Management (for clean URL on newtab)
    const viewportFrame = document.getElementById('aether-viewport-frame');
    if (viewportFrame) {
        // Set initial frame src
        if (!viewportFrame.src || viewportFrame.src.endsWith('about:blank') || !viewportFrame.src.includes('.html')) {
            viewportFrame.src = activeFile;
        } else {
            const currentSrc = viewportFrame.src.split('/').pop();
            if (currentSrc && UI_DASHBOARDS.some(d => d.file === currentSrc)) {
                activeFile = currentSrc;
                currentDashboard = UI_DASHBOARDS.find(d => d.file === activeFile) || UI_DASHBOARDS[0];
            } else {
                viewportFrame.src = activeFile;
            }
        }
    }

    // 4. Switcher Navigation Handler
    function switchPage(targetFile) {
        if (targetFile === activeFile) {
            closeSwitcherModal();
            return;
        }

        activeFile = targetFile;
        currentDashboard = UI_DASHBOARDS.find(d => d.file === activeFile) || UI_DASHBOARDS[0];

        // Persist user selection
        try {
            localStorage.setItem('aether_active_ui', targetFile);
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
                chrome.storage.local.set({ 'aether_active_ui': targetFile });
            }
        } catch (err) {
            console.warn('[Aether Switcher] Storage error:', err);
        }

        // Smooth transition effect
        let transitionOverlay = document.getElementById('aether-switch-transition');
        if (!transitionOverlay) {
            transitionOverlay = document.createElement('div');
            transitionOverlay.id = 'aether-switch-transition';
            transitionOverlay.className = 'aether-switch-transition';
            document.body.appendChild(transitionOverlay);
        }

        // Force reflow and activate overlay
        void transitionOverlay.offsetWidth;
        transitionOverlay.classList.add('is-active');

        setTimeout(() => {
            const frame = document.getElementById('aether-viewport-frame');
            if (frame) {
                // Seamlessly update frame inside newtab container -> address bar remains completely clean!
                frame.src = targetFile;
                updateSwitcherActiveCards();
                closeSwitcherModal();
                setTimeout(() => {
                    transitionOverlay.classList.remove('is-active');
                }, 180);
            } else {
                // Standalone page navigation
                window.location.href = targetFile;
            }
        }, 160);
    }

    // Update active badges and styles on cards without re-creating DOM
    function updateSwitcherActiveCards() {
        const triggerBadge = document.querySelector('.aether-switcher-trigger-badge');
        if (triggerBadge && currentDashboard) {
            triggerBadge.textContent = currentDashboard.title;
        }

        document.querySelectorAll('.aether-ui-card').forEach((card) => {
            const isCurrent = card.dataset.file === activeFile;
            card.classList.toggle('is-current', isCurrent);
            card.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');

            const actionBtn = card.querySelector('.aether-card-action-btn');
            if (actionBtn) {
                actionBtn.textContent = isCurrent ? '✓ Currently Active' : 'Launch this UI →';
            }

            const previewWrap = card.querySelector('.aether-card-preview-wrap');
            if (previewWrap) {
                let badge = previewWrap.querySelector('.aether-card-status-badge');
                if (isCurrent && !badge) {
                    badge = document.createElement('span');
                    badge.className = 'aether-card-status-badge current';
                    badge.textContent = 'Active UI';
                    previewWrap.appendChild(badge);
                } else if (!isCurrent && badge) {
                    badge.remove();
                }
            }
        });
    }

    // 5. Modal Open / Close Logic
    function openSwitcherModal() {
        const backdrop = document.getElementById('aether-ui-switcher-backdrop');
        if (!backdrop) return;
        updateSwitcherActiveCards();
        backdrop.classList.add('is-open');
        backdrop.setAttribute('aria-hidden', 'false');

        const closeBtn = backdrop.querySelector('.aether-switcher-close-btn');
        if (closeBtn) closeBtn.focus();
    }

    function closeSwitcherModal() {
        const backdrop = document.getElementById('aether-ui-switcher-backdrop');
        if (!backdrop) return;
        backdrop.classList.remove('is-open');
        backdrop.setAttribute('aria-hidden', 'true');

        const trigger = document.getElementById('aether-ui-switcher-trigger');
        if (trigger) trigger.focus();
    }

    // Expose global methods
    window.openAetherUISwitcher = openSwitcherModal;
    window.closeAetherUISwitcher = closeSwitcherModal;

    // Listen for messages from embedded child iframes
    window.addEventListener('message', (event) => {
        if (event.data?.type === 'aether-toggle-switcher') {
            const backdrop = document.getElementById('aether-ui-switcher-backdrop');
            if (backdrop?.classList.contains('is-open')) {
                closeSwitcherModal();
            } else {
                openSwitcherModal();
            }
        }
    });

    // 6. DOM Initialization
    function initSwitcher() {
        // Prevent duplicate injection
        if (document.getElementById('aether-ui-switcher-trigger')) return;

        // Create Modal Backdrop & Cards
        const backdrop = document.createElement('div');
        backdrop.id = 'aether-ui-switcher-backdrop';
        backdrop.className = 'aether-switcher-backdrop';
        backdrop.setAttribute('aria-hidden', 'true');

        let cardsHtml = '';
        UI_DASHBOARDS.forEach((dash) => {
            const isCurrent = dash.file === activeFile;
            const tagsHtml = dash.tags.map(t => `<span class="aether-card-tag">${t}</span>`).join('');

            cardsHtml += `
                <article class="aether-ui-card${isCurrent ? ' is-current' : ''}" 
                         data-file="${dash.file}" 
                         tabindex="0" 
                         role="button" 
                         aria-pressed="${isCurrent}"
                         aria-label="${dash.title} - ${dash.tagline}">
                    
                    <div class="aether-card-preview-wrap">
                        ${dash.previewSvg}
                        ${isCurrent ? '<span class="aether-card-status-badge current">Active UI</span>' : ''}
                    </div>

                    <div class="aether-card-body">
                        <div class="aether-card-meta-header">
                            <h3 class="aether-card-title">${dash.title}</h3>
                            <span class="aether-card-tagline">${dash.tagline}</span>
                        </div>

                        <p class="aether-card-desc">${dash.desc}</p>

                        <div class="aether-card-tags">
                            ${tagsHtml}
                        </div>

                        <div class="aether-card-action">
                            <span class="aether-card-action-btn">
                                ${isCurrent ? '✓ Currently Active' : 'Launch this UI →'}
                            </span>
                            <span class="aether-card-shortcut-key">Key [${dash.key}]</span>
                        </div>
                    </div>
                </article>
            `;
        });

        backdrop.innerHTML = `
            <section class="aether-switcher-modal" role="dialog" aria-modal="true" aria-labelledby="aether-switcher-heading">
                <header class="aether-switcher-header">
                    <div class="aether-switcher-header-info">
                        <h2 id="aether-switcher-heading">
                            <span>Choose Workspace UI</span>
                        </h2>
                        <p>Select your favorite dashboard layout and aesthetic. Click any card to switch instantly.</p>
                    </div>
                    <button class="aether-switcher-close-btn" type="button" aria-label="Close UI switcher">&times;</button>
                </header>

                <div class="aether-switcher-grid">
                    ${cardsHtml}
                </div>

                <footer class="aether-switcher-footer">
                    <div class="aether-switcher-footer-keys">
                        <span class="aether-switcher-footer-key"><kbd>1</kbd>–<kbd>4</kbd> Quick select</span>
                        <span class="aether-switcher-footer-key"><kbd>Alt</kbd> + <kbd>S</kbd> Toggle switcher</span>
                        <span class="aether-switcher-footer-key"><kbd>Esc</kbd> Close</span>
                    </div>
                    <div>Aether OS v1.0 • Multi-Theme Workspace</div>
                </footer>
            </section>
        `;

        // Card Click Listeners
        backdrop.querySelectorAll('.aether-ui-card').forEach((card) => {
            const targetFile = card.dataset.file;
            card.addEventListener('click', () => switchPage(targetFile));
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    switchPage(targetFile);
                }
            });
        });

        // Close Button Listener
        backdrop.querySelector('.aether-switcher-close-btn').addEventListener('click', closeSwitcherModal);

        // Click outside modal to close
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) closeSwitcherModal();
        });

        // Add transition overlay placeholder
        const transitionOverlay = document.createElement('div');
        transitionOverlay.id = 'aether-switch-transition';
        transitionOverlay.className = 'aether-switch-transition';

        document.body.appendChild(backdrop);
        document.body.appendChild(transitionOverlay);

        // Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            const isOpen = backdrop.classList.contains('is-open');

            // Toggle with Alt+S or Shift+Alt+S
            if (e.altKey && (e.key === 's' || e.key === 'S')) {
                e.preventDefault();
                isOpen ? closeSwitcherModal() : openSwitcherModal();
                return;
            }

            if (!isOpen) return;

            // Close on Escape
            if (e.key === 'Escape') {
                e.preventDefault();
                closeSwitcherModal();
                return;
            }

            // Quick select with numbers 1, 2, 3, 4
            const numKey = e.key;
            const targetDash = UI_DASHBOARDS.find(d => d.key === numKey);
            if (targetDash) {
                e.preventDefault();
                switchPage(targetDash.file);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSwitcher);
    } else {
        initSwitcher();
    }
})();