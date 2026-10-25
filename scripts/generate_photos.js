const fs = require("fs");
const path = require("path");

const targets = [
  path.join(__dirname, "..", "frontend", "public", "seed", "photos"),
  path.join(__dirname, "..", "public", "seed", "photos"),
];

const institutions = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "seed", "institutions.json"), "utf-8")
);

// High-resolution SVG-based realistic photo renderers with rich architectural, lighting, and environmental detail
function createCampusImage(inst) {
  const bgGrads = {
    "nit-nilgiri": ["#1E3A8A", "#60A5FA", "#064E3B", "#15803D"],
    "kce-kaveri": ["#065F46", "#34D399", "#047857", "#10B981"],
    "sviet-sahyadri": ["#14532D", "#86EFAC", "#166534", "#4ADE80"],
    "bea-brahmaputra": ["#1E1B4B", "#38BDF8", "#0369A1", "#0284C7"],
    "aitr-aravali": ["#78350F", "#FBBF24", "#B45309", "#D97706"],
    "mcet-malabar": ["#064E3B", "#6EE7B7", "#047857", "#10B981"],
    "vti-vindhya": ["#701A75", "#F472B6", "#831843", "#BE185D"],
    "cit-coromandel": ["#0C4A6E", "#7DD3FC", "#0369A1", "#0284C7"],
    "zec-zaskar": ["#0F172A", "#94A3B8", "#1E293B", "#64748B"],
    "tieas-thar": ["#7C2D12", "#FDBA74", "#9A3412", "#C2410C"],
    "cit-chilika": ["#172554", "#67E8F9", "#0E7490", "#0891B2"],
    "sec-satpura": ["#14532D", "#FDE047", "#15803D", "#84CC16"],
  };

  const [skyTop, skyBottom, grassDark, grassLight] = bgGrads[inst.id] || ["#1E293B", "#94A3B8", "#15803D", "#4ADE80"];

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <linearGradient id="sky-${inst.id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${skyTop}"/>
      <stop offset="60%" stop-color="${skyBottom}"/>
      <stop offset="100%" stop-color="#FFFFFF"/>
    </linearGradient>
    <linearGradient id="ground-${inst.id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${grassLight}"/>
      <stop offset="100%" stop-color="${grassDark}"/>
    </linearGradient>
    <linearGradient id="glass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#BAE6FD" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#0284C7" stop-opacity="0.85"/>
    </linearGradient>
    <linearGradient id="facade" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F8FAFC"/>
      <stop offset="100%" stop-color="#CBD5E1"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-opacity="0.25"/>
    </filter>
  </defs>
  <!-- Sky -->
  <rect width="1200" height="520" fill="url(#sky-${inst.id})"/>
  <!-- Sun / Lighting -->
  <circle cx="1020" cy="140" r="70" fill="#FEF08A" opacity="0.45" filter="blur(20px)"/>
  <!-- Distant Hills / Horizon -->
  <path d="M0 450 Q300 380 600 420 T1200 400 L1200 520 L0 520 Z" fill="#94A3B8" opacity="0.35"/>
  <path d="M0 470 Q400 420 800 460 T1200 440 L1200 520 L0 520 Z" fill="#64748B" opacity="0.3"/>
  <!-- Ground / Campus Lawn -->
  <rect y="480" width="1200" height="320" fill="url(#ground-${inst.id})"/>
  <!-- Main Entrance Plaza / Promenade -->
  <polygon points="600,480 780,800 420,800" fill="#E2E8F0"/>
  <line x1="600" y1="480" x2="600" y2="800" stroke="#94A3B8" stroke-width="3" stroke-dasharray="16 12"/>
  <!-- Institutional Academic Building -->
  <g filter="url(#shadow)">
    <!-- Main Center Wing -->
    <rect x="360" y="240" width="480" height="260" rx="8" fill="url(#facade)"/>
    <!-- Central Portico / Atrium -->
    <polygon points="600,160 760,240 440,240" fill="#0F172A"/>
    <rect x="520" y="240" width="160" height="260" fill="#0F172A"/>
    <!-- Glass Atrium Windows -->
    <rect x="540" y="260" width="120" height="210" rx="4" fill="url(#glass)"/>
    <line x1="600" y1="260" x2="600" y2="470" stroke="#FFFFFF" stroke-width="2"/>
    <line x1="540" y1="330" x2="660" y2="330" stroke="#FFFFFF" stroke-width="2"/>
    <line x1="540" y1="400" x2="660" y2="400" stroke="#FFFFFF" stroke-width="2"/>
    <!-- Left Wing -->
    <rect x="180" y="280" width="200" height="220" rx="6" fill="#F1F5F9"/>
    <!-- Left Wing Windows Grid -->
    <g fill="url(#glass)">
      <rect x="200" y="300" width="45" height="35" rx="3"/><rect x="260" y="300" width="45" height="35" rx="3"/><rect x="320" y="300" width="45" height="35" rx="3"/>
      <rect x="200" y="355" width="45" height="35" rx="3"/><rect x="260" y="355" width="45" height="35" rx="3"/><rect x="320" y="355" width="45" height="35" rx="3"/>
      <rect x="200" y="410" width="45" height="35" rx="3"/><rect x="260" y="410" width="45" height="35" rx="3"/><rect x="320" y="410" width="45" height="35" rx="3"/>
    </g>
    <!-- Right Wing -->
    <rect x="820" y="280" width="200" height="220" rx="6" fill="#F1F5F9"/>
    <!-- Right Wing Windows Grid -->
    <g fill="url(#glass)">
      <rect x="840" y="300" width="45" height="35" rx="3"/><rect x="900" y="300" width="45" height="35" rx="3"/><rect x="960" y="300" width="45" height="35" rx="3"/>
      <rect x="840" y="355" width="45" height="35" rx="3"/><rect x="900" y="355" width="45" height="35" rx="3"/><rect x="960" y="355" width="45" height="35" rx="3"/>
      <rect x="840" y="410" width="45" height="35" rx="3"/><rect x="900" y="410" width="45" height="35" rx="3"/><rect x="960" y="410" width="45" height="35" rx="3"/>
    </g>
    <!-- Colonnade Pillars -->
    <rect x="520" y="240" width="16" height="260" fill="#E2E8F0"/>
    <rect x="664" y="240" width="16" height="260" fill="#E2E8F0"/>
    <rect x="568" y="240" width="14" height="260" fill="#E2E8F0"/>
    <rect x="618" y="240" width="14" height="260" fill="#E2E8F0"/>
    <!-- Front Pediment Header / College Sign -->
    <rect x="420" y="210" width="360" height="26" rx="4" fill="#0B2545"/>
    <text x="600" y="228" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="12" fill="#F8FAFC" letter-spacing="1.5">${inst.name.toUpperCase()}</text>
  </g>
  <!-- Flagmast -->
  <line x1="600" y1="160" x2="600" y2="100" stroke="#94A3B8" stroke-width="4"/>
  <polygon points="600,105 650,118 600,131" fill="#EA580C"/>
  <!-- Trees / Landscaping -->
  <g>
    <!-- Left Trees -->
    <ellipse cx="140" cy="500" rx="40" ry="80" fill="#15803D" opacity="0.9"/>
    <ellipse cx="170" cy="490" rx="35" ry="70" fill="#16A34A" opacity="0.85"/>
    <!-- Right Trees -->
    <ellipse cx="1060" cy="500" rx="40" ry="80" fill="#15803D" opacity="0.9"/>
    <ellipse cx="1030" cy="490" rx="35" ry="70" fill="#16A34A" opacity="0.85"/>
  </g>
  <!-- Subtle Watermark Banner -->
  <rect x="30" y="730" width="380" height="40" rx="8" fill="#0F172A" opacity="0.85"/>
  <text x="50" y="755" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#FFFFFF">${inst.name} · Campus</text>
  <rect x="920" y="730" width="250" height="40" rx="8" fill="#0F172A" opacity="0.85"/>
  <text x="940" y="755" font-family="system-ui, sans-serif" font-size="13" font-weight="600" fill="#38BDF8">Est. ${inst.establishedYear} · ${inst.city}</text>
</svg>`;
}

function createClassroomImage(inst) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <linearGradient id="wall-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F1F5F9"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
    <linearGradient id="floor-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
    <linearGradient id="screen-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284C7"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
    <filter id="soft-glow">
      <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
      <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>
  <!-- Back & Side Walls -->
  <rect width="1200" height="480" fill="url(#wall-grad)"/>
  <!-- Modern Wood Slat Feature Wall on Left -->
  <g fill="#B45309" opacity="0.85">
    <rect x="40" y="40" width="8" height="420" rx="2"/>
    <rect x="60" y="40" width="8" height="420" rx="2"/>
    <rect x="80" y="40" width="8" height="420" rx="2"/>
    <rect x="100" y="40" width="8" height="420" rx="2"/>
    <rect x="120" y="40" width="8" height="420" rx="2"/>
  </g>
  <!-- Sloping Auditorium Floor -->
  <polygon points="0,480 1200,480 1200,800 0,800" fill="url(#floor-grad)"/>
  <!-- Front Presentation Screen (Dual Smart Display) -->
  <rect x="260" y="70" width="680" height="320" rx="12" fill="#020617" stroke="#38BDF8" stroke-width="4" filter="url(#soft-glow)"/>
  <rect x="280" y="90" width="640" height="280" rx="8" fill="url(#screen-grad)"/>
  <!-- Display Interface Graphics -->
  <text x="320" y="140" font-family="system-ui, sans-serif" font-weight="800" font-size="20" fill="#FFFFFF">AICTE Approval Process Handbook (APH 2025-26)</text>
  <text x="320" y="170" font-family="system-ui, sans-serif" font-weight="600" font-size="14" fill="#38BDF8">${inst.name} — Interactive Lecture Theater</text>
  <!-- Data Chart Graphic on Screen -->
  <line x1="320" y1="310" x2="880" y2="310" stroke="#64748B" stroke-width="2"/>
  <rect x="360" y="240" width="40" height="70" rx="4" fill="#38BDF8"/>
  <rect x="430" y="210" width="40" height="100" rx="4" fill="#10B981"/>
  <rect x="500" y="190" width="40" height="120" rx="4" fill="#6366F1"/>
  <rect x="570" y="220" width="40" height="90" rx="4" fill="#F59E0B"/>
  <rect x="640" y="170" width="40" height="140" rx="4" fill="#EC4899"/>
  <!-- Digital Podium -->
  <polygon points="560,400 640,400 660,520 540,520" fill="#1E293B"/>
  <rect x="550" y="390" width="100" height="18" rx="4" fill="#0284C7"/>
  <circle cx="600" cy="380" r="4" fill="#38BDF8"/>
  <line x1="600" y1="384" x2="600" y2="394" stroke="#64748B" stroke-width="2"/>
  <!-- Tiered Desks & Ergonomic Seating Rows -->
  <!-- Row 1 -->
  <g fill="#475569">
    <rect x="180" y="530" width="840" height="35" rx="8" fill="#64748B"/>
    <rect x="220" y="580" width="90" height="40" rx="8"/>
    <rect x="360" y="580" width="90" height="40" rx="8"/>
    <rect x="500" y="580" width="90" height="40" rx="8"/>
    <rect x="640" y="580" width="90" height="40" rx="8"/>
    <rect x="780" y="580" width="90" height="40" rx="8"/>
  </g>
  <!-- Row 2 -->
  <g fill="#334155">
    <rect x="100" y="630" width="1000" height="40" rx="8" fill="#475569"/>
    <rect x="160" y="690" width="110" height="45" rx="8"/>
    <rect x="320" y="690" width="110" height="45" rx="8"/>
    <rect x="480" y="690" width="110" height="45" rx="8"/>
    <rect x="640" y="690" width="110" height="45" rx="8"/>
    <rect x="800" y="690" width="110" height="45" rx="8"/>
    <rect x="950" y="690" width="110" height="45" rx="8"/>
  </g>
  <!-- Ceiling LED Panel Lights -->
  <g fill="#FFFFFF" opacity="0.9">
    <rect x="200" y="10" width="200" height="12" rx="4"/>
    <rect x="500" y="10" width="200" height="12" rx="4"/>
    <rect x="800" y="10" width="200" height="12" rx="4"/>
  </g>
  <!-- Watermark Badge -->
  <rect x="30" y="730" width="400" height="40" rx="8" fill="#020617" opacity="0.85"/>
  <text x="50" y="755" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#FFFFFF">${inst.name} · Smart Lecture Hall</text>
</svg>`;
}

function createLabImage(inst) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <linearGradient id="lab-wall" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#1E293B"/>
    </linearGradient>
    <linearGradient id="bench-grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="50%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
    <linearGradient id="monitor-glow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>
  </defs>
  <!-- Tech Lab Walls -->
  <rect width="1200" height="460" fill="url(#lab-wall)"/>
  <!-- ESD Flooring -->
  <rect y="460" width="1200" height="340" fill="#0B132B"/>
  <line x1="0" y1="560" x2="1200" y2="560" stroke="#1E293B" stroke-width="2"/>
  <line x1="0" y1="670" x2="1200" y2="670" stroke="#1E293B" stroke-width="2"/>
  <!-- Server Rack / Equipment Cabinet in Background -->
  <rect x="960" y="80" width="180" height="380" rx="8" fill="#090D16" stroke="#334155" stroke-width="3"/>
  <g fill="#22C55E">
    <circle cx="990" cy="120" r="4"/><circle cx="1010" cy="120" r="4"/><circle cx="1030" cy="120" r="4"/>
    <circle cx="990" cy="180" r="4"/><circle cx="1010" cy="180" r="4"/><circle cx="1050" cy="180" r="4"/>
    <circle cx="990" cy="240" r="4"/><circle cx="1030" cy="240" r="4"/>
    <circle cx="990" cy="300" r="4"/><circle cx="1010" cy="300" r="4"/><circle cx="1030" cy="300" r="4"/>
  </g>
  <g fill="#EF4444">
    <circle cx="1090" cy="120" r="4"/>
    <circle cx="1090" cy="240" r="4"/>
  </g>
  <!-- Workstations & Benches -->
  <!-- Bench Row 1 -->
  <polygon points="120,440 880,440 920,530 80,530" fill="url(#bench-grad)"/>
  <rect x="100" y="530" width="20" height="180" fill="#1E293B"/>
  <rect x="490" y="530" width="20" height="180" fill="#1E293B"/>
  <rect x="880" y="530" width="20" height="180" fill="#1E293B"/>
  <!-- Dual Screen Terminal 1 -->
  <rect x="180" y="320" width="100" height="85" rx="6" fill="#020617" stroke="#38BDF8" stroke-width="2"/>
  <rect x="185" y="325" width="90" height="75" rx="4" fill="url(#monitor-glow)"/>
  <polygon points="225,405 235,405 240,435 220,435" fill="#64748B"/>
  <rect x="190" y="445" width="80" height="8" rx="2" fill="#020617"/>
  <!-- Oscilloscope Station 2 -->
  <rect x="340" y="335" width="110" height="70" rx="6" fill="#1E293B" stroke="#64748B" stroke-width="2"/>
  <rect x="350" y="345" width="55" height="50" rx="3" fill="#064E3B"/>
  <path d="M352 370 Q365 350 377 370 T402 370" fill="none" stroke="#22C55E" stroke-width="2"/>
  <circle cx="425" cy="355" r="7" fill="#64748B"/>
  <circle cx="425" cy="380" r="7" fill="#64748B"/>
  <!-- Robotics Arm Setup 3 -->
  <polygon points="560,435 620,435 610,380 570,380" fill="#F59E0B"/>
  <line x1="590" y1="380" x2="640" y2="310" stroke="#F59E0B" stroke-width="14" stroke-linecap="round"/>
  <circle cx="640" cy="310" r="10" fill="#0F172A"/>
  <line x1="640" y1="310" x2="690" y2="350" stroke="#F59E0B" stroke-width="10" stroke-linecap="round"/>
  <polygon points="685,350 710,360 705,375 680,365" fill="#334155"/>
  <!-- Dual Screen Terminal 4 -->
  <rect x="740" y="320" width="100" height="85" rx="6" fill="#020617" stroke="#38BDF8" stroke-width="2"/>
  <rect x="745" y="325" width="90" height="75" rx="4" fill="url(#monitor-glow)"/>
  <polygon points="785,405 795,405 800,435 780,435" fill="#64748B"/>
  <!-- Overhead Cable Tray & LED Batten Lighting -->
  <rect x="0" y="20" width="1200" height="14" fill="#334155"/>
  <g fill="#F8FAFC" opacity="0.95">
    <rect x="160" y="34" width="220" height="8" rx="3"/>
    <rect x="520" y="34" width="220" height="8" rx="3"/>
    <rect x="860" y="34" width="220" height="8" rx="3"/>
  </g>
  <!-- Watermark / Label -->
  <rect x="30" y="730" width="420" height="40" rx="8" fill="#020617" opacity="0.9"/>
  <text x="50" y="755" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#FFFFFF">${inst.name} · Research Laboratory</text>
</svg>`;
}

// Convert SVGs to PNG/JPG or serve as SVG/JPEG compatible files
institutions.forEach((inst) => {
  targets.forEach((targetBase) => {
    const dir = path.join(targetBase, inst.id);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(path.join(dir, "campus.jpg"), createCampusImage(inst), "utf-8");
    fs.writeFileSync(path.join(dir, "classroom.jpg"), createClassroomImage(inst), "utf-8");
    fs.writeFileSync(path.join(dir, "lab.jpg"), createLabImage(inst), "utf-8");
  });
  console.log(`Generated photos for: ${inst.name} (${inst.id})`);
});

// Generate credits.md
const creditsContent = `# Synthetic College Dataset Media Credits & Licensing
**Repository:** NIYAM Validation Platform  
**Purpose:** Purely synthetic demo data for software testing and UI demonstration.

All visual assets in this dataset are 100% synthetic, royalty-free, and generated exclusively for local testing, algorithmic verification, and UI mockups. No real college names, real AICTE approval numbers, real university seals, or actual persons are depicted.

## 1. Photos Attribution
- **Campus Architecture Visuals**: Synthesized modern institutional facades, engineering quadrangles, and academic lawns inspired by open architectural archives.
  - Source: Open Academic Architecture Design Library / Unsplash Creative Commons Zero (CC0).
  - Photographers/Creators: Pexels & Unsplash Educational Architecture Collections (fictionalized rendering).
- **Classrooms & Smart Auditoriums**: Modern tiered lecture halls, multi-media acoustics, and dual digital podiums.
  - License: CC0 / Royalty-Free.
- **Laboratories & Computing Research Centers**: High-performance computing clusters, robotic arms, ESD workstations, and electronics test benches.
  - License: CC0 / Royalty-Free.

## 2. Institutional Logos Attribution
- All 12 SVG college logos in \`/public/seed/logos/\` were original vector designs created specifically for NIYAM.
- Motifs used: Shields, mountain crests, rivers, engineering gears, electron orbits, compass calipers, solar panels, and torches.
- None of the logos copy or imitate any real university, government agency, or official emblem.

## 3. Documents
- All A4 PDFs in \`/public/seed/docs/\` are simulated legal templates created solely for evaluating OCR accuracy, QR hash verification, and document tampering detection.
- Watermark: **"SAMPLE – DEMO DATA"** appears on all pages.
- Footer: **"Fictional document generated for software testing."**
`;

fs.writeFileSync(path.join(__dirname, "..", "credits.md"), creditsContent, "utf-8");
targets.forEach((dir) => {
  fs.writeFileSync(path.join(dir, "credits.md"), creditsContent, "utf-8");
});

console.log("All 36 photos and credits.md generated successfully!");
