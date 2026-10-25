const fs = require("fs");
const path = require("path");

const targets = [
  path.join(__dirname, "..", "frontend", "public", "seed", "logos"),
  path.join(__dirname, "..", "public", "seed", "logos"),
];

targets.forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const logos = {
  "nit-nilgiri": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <linearGradient id="nit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B2545"/>
      <stop offset="100%" stop-color="#134074"/>
    </linearGradient>
    <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F6D365"/>
      <stop offset="100%" stop-color="#FDA085"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="36" fill="#F8FAFC"/>
  <!-- Outer Shield -->
  <path d="M128 24 C190 24 216 48 216 110 C216 180 156 222 128 236 C100 222 40 180 40 110 C40 48 66 24 128 24 Z" fill="url(#nit-grad)" stroke="#D4AF37" stroke-width="4"/>
  <!-- Mountain Peaks -->
  <path d="M72 140 L110 88 L144 140 Z" fill="#EEF4F8" opacity="0.95"/>
  <path d="M116 140 L152 74 L184 140 Z" fill="#D4AF37" opacity="0.95"/>
  <!-- Atom orbit -->
  <ellipse cx="128" cy="115" rx="50" ry="18" fill="none" stroke="#60A5FA" stroke-width="2.5" transform="rotate(-25 128 115)"/>
  <ellipse cx="128" cy="115" rx="50" ry="18" fill="none" stroke="#60A5FA" stroke-width="2.5" transform="rotate(25 128 115)"/>
  <circle cx="128" cy="115" r="5" fill="#FBBF24"/>
  <!-- Open Book at Base -->
  <path d="M80 170 C100 162 120 166 128 174 C136 166 156 162 176 170 L176 195 C156 187 136 191 128 199 C120 191 100 187 80 195 Z" fill="#FFFFFF"/>
  <!-- Acronym Ribbon -->
  <rect x="84" y="202" width="88" height="22" rx="6" fill="#D4AF37"/>
  <text x="128" y="217" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="13" fill="#0B2545" letter-spacing="2">N I T</text>
</svg>`,

  "kce-kaveri": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <linearGradient id="kce-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F6B6B"/>
      <stop offset="100%" stop-color="#064E3B"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="36" fill="#F0FDF4"/>
  <!-- Circular Seal Base -->
  <circle cx="128" cy="128" r="98" fill="url(#kce-grad)" stroke="#10B981" stroke-width="4"/>
  <circle cx="128" cy="128" r="86" fill="none" stroke="#A7F3D0" stroke-width="1.5" stroke-dasharray="4 3"/>
  <!-- Gear teeth elements -->
  <g fill="#10B981" opacity="0.6">
    <rect x="124" y="20" width="8" height="14" rx="2"/>
    <rect x="124" y="222" width="8" height="14" rx="2"/>
    <rect x="20" y="124" width="14" height="8" rx="2"/>
    <rect x="222" y="124" width="14" height="8" rx="2"/>
  </g>
  <!-- River Wave Graphic -->
  <path d="M56 142 C80 120 105 160 128 138 C151 116 176 156 200 134 L200 162 C176 184 151 144 128 166 C105 188 80 148 56 170 Z" fill="#6EE7B7" opacity="0.9"/>
  <!-- Flame of Wisdom -->
  <path d="M128 66 C140 85 146 100 138 116 C134 104 126 98 124 90 C120 98 114 104 118 116 C110 100 116 85 128 66 Z" fill="#FBBF24"/>
  <circle cx="128" cy="108" r="4" fill="#F97316"/>
  <!-- Bottom Banner -->
  <rect x="80" y="180" width="96" height="24" rx="6" fill="#FBBF24"/>
  <text x="128" y="196" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="14" fill="#064E3B" letter-spacing="2">K C E</text>
</svg>`,

  "sviet-sahyadri": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <linearGradient id="sviet-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1B4332"/>
      <stop offset="100%" stop-color="#2D6A4F"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="36" fill="#F7FEE7"/>
  <!-- Hexagonal Crest -->
  <polygon points="128,26 216,74 216,182 128,230 40,182 40,74" fill="url(#sviet-grad)" stroke="#C67D34" stroke-width="4"/>
  <!-- Valley Ridges -->
  <polygon points="128,68 178,146 78,146" fill="#74C69D" opacity="0.8"/>
  <polygon points="128,92 162,146 94,146" fill="#D8F3DC"/>
  <!-- Sprouting Leaf of Tech -->
  <path d="M128 146 C128 126 148 118 154 104 C154 126 138 138 128 146 Z" fill="#C67D34"/>
  <path d="M128 146 C128 126 108 118 102 104 C102 126 118 138 128 146 Z" fill="#FBBF24"/>
  <!-- Cog Base -->
  <circle cx="128" cy="172" r="18" fill="none" stroke="#C67D34" stroke-width="4" stroke-dasharray="8 4"/>
  <circle cx="128" cy="172" r="6" fill="#C67D34"/>
  <!-- Ribbon -->
  <rect x="74" y="196" width="108" height="20" rx="4" fill="#C67D34"/>
  <text x="128" y="211" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="12" fill="#FFFFFF" letter-spacing="2">S V I E T</text>
</svg>`,

  "bea-brahmaputra": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <linearGradient id="bea-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E1B4B"/>
      <stop offset="100%" stop-color="#312E81"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="36" fill="#F0F9FF"/>
  <!-- Pointed Arch Shield -->
  <path d="M128 24 L212 60 L212 144 C212 196 168 226 128 236 C88 226 44 196 44 144 L44 60 Z" fill="url(#bea-grad)" stroke="#06B6D4" stroke-width="4"/>
  <!-- Stylized River Sweep -->
  <path d="M46 116 Q128 70 210 116 L210 144 Q128 98 46 144 Z" fill="#06B6D4" opacity="0.8"/>
  <path d="M46 142 Q128 96 210 142 L210 170 Q128 124 46 170 Z" fill="#67E8F9" opacity="0.6"/>
  <!-- Caliper / Compass Vector -->
  <path d="M128 54 L114 106 L142 106 Z" fill="#FBBF24"/>
  <circle cx="128" cy="54" r="6" fill="#FBBF24"/>
  <path d="M110 114 L128 80 L146 114" fill="none" stroke="#FBBF24" stroke-width="3"/>
  <!-- Badge Label -->
  <rect x="86" y="196" width="84" height="22" rx="5" fill="#06B6D4"/>
  <text x="128" y="211" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="13" fill="#1E1B4B" letter-spacing="2">B E A</text>
</svg>`,

  "aitr-aravali": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <linearGradient id="aitr-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#78350F"/>
      <stop offset="100%" stop-color="#C2410C"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="36" fill="#FFFBEB"/>
  <!-- Octagonal Motif -->
  <polygon points="80,30 176,30 226,80 226,176 176,226 80,226 30,176 30,80" fill="url(#aitr-grad)" stroke="#F59E0B" stroke-width="4"/>
  <!-- Radiant Sunburst -->
  <circle cx="128" cy="110" r="26" fill="#FDE68A"/>
  <g stroke="#FDE68A" stroke-width="3">
    <line x1="128" y1="74" x2="128" y2="64"/>
    <line x1="128" y1="146" x2="128" y2="156"/>
    <line x1="92" y1="110" x2="82" y2="110"/>
    <line x1="164" y1="110" x2="174" y2="110"/>
    <line x1="102" y1="84" x2="94" y2="76"/>
    <line x1="154" y1="136" x2="162" y2="144"/>
    <line x1="102" y1="136" x2="94" y2="144"/>
    <line x1="154" y1="84" x2="162" y2="76"/>
  </g>
  <!-- Architectural Arch Motif -->
  <path d="M88 184 L88 140 C88 116 168 116 168 140 L168 184 Z" fill="none" stroke="#FFFFFF" stroke-width="3"/>
  <rect x="76" y="188" width="104" height="22" rx="4" fill="#F59E0B"/>
  <text x="128" y="203" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="12" fill="#78350F" letter-spacing="2">A I T R</text>
</svg>`,

  "mcet-malabar": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <linearGradient id="mcet-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#064E3B"/>
      <stop offset="100%" stop-color="#047857"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="36" fill="#F0FDF4"/>
  <!-- Classic Curvature Shield -->
  <path d="M128 26 C194 26 216 52 216 118 C216 186 164 218 128 234 C92 218 40 186 40 118 C40 52 62 26 128 26 Z" fill="url(#mcet-grad)" stroke="#84CC16" stroke-width="4"/>
  <!-- Stylized Palm Frond Geometry -->
  <path d="M128 160 C128 90 80 80 72 74 C86 94 108 120 128 160 Z" fill="#84CC16"/>
  <path d="M128 160 C128 90 176 80 184 74 C170 94 148 120 128 160 Z" fill="#A3E635"/>
  <!-- Lighthouse Beacon Tower -->
  <polygon points="120,160 136,160 132,100 124,100" fill="#FFFFFF"/>
  <rect x="122" y="94" width="12" height="6" fill="#FBBF24"/>
  <!-- Light rays -->
  <polygon points="122,96 86,84 88,96" fill="#FDE68A" opacity="0.6"/>
  <polygon points="134,96 170,84 168,96" fill="#FDE68A" opacity="0.6"/>
  <!-- Name Plaque -->
  <rect x="80" y="196" width="96" height="22" rx="4" fill="#84CC16"/>
  <text x="128" y="211" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="12" fill="#064E3B" letter-spacing="2">M C E T</text>
</svg>`,

  "vti-vindhya": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <linearGradient id="vti-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#881337"/>
      <stop offset="100%" stop-color="#4C0519"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="36" fill="#FFF1F2"/>
  <!-- Heraldic Shield -->
  <path d="M128 24 C190 24 214 44 214 104 C214 172 152 216 128 232 C104 216 42 172 42 104 C42 44 66 24 128 24 Z" fill="url(#vti-grad)" stroke="#CA8A04" stroke-width="4"/>
  <!-- Roman Pillar Structure -->
  <rect x="100" y="80" width="12" height="66" fill="#FDE047"/>
  <rect x="144" y="80" width="12" height="66" fill="#FDE047"/>
  <rect x="92" y="72" width="72" height="8" rx="2" fill="#CA8A04"/>
  <rect x="92" y="146" width="72" height="8" rx="2" fill="#CA8A04"/>
  <!-- Cog & Wrench Motif in Center -->
  <circle cx="128" cy="112" r="14" fill="#FFFFFF"/>
  <circle cx="128" cy="112" r="6" fill="#881337"/>
  <!-- Three Stars of Excellence -->
  <polygon points="128,42 131,48 138,49 133,54 135,60 128,56 121,60 123,54 118,49 125,48" fill="#FDE047"/>
  <polygon points="98,48 101,54 108,55 103,60 105,66 98,62 91,66 93,60 88,55 95,54" fill="#FDE047"/>
  <polygon points="158,48 161,54 168,55 163,60 165,66 158,62 151,66 153,60 148,55 155,54" fill="#FDE047"/>
  <!-- Label -->
  <rect x="88" y="194" width="80" height="22" rx="4" fill="#CA8A04"/>
  <text x="128" y="209" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="13" fill="#4C0519" letter-spacing="2">V T I</text>
</svg>`,

  "cit-coromandel": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <linearGradient id="cit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0C4A6E"/>
      <stop offset="100%" stop-color="#0369A1"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="36" fill="#F0F9FF"/>
  <!-- Circular Compass Outer Base -->
  <circle cx="128" cy="128" r="98" fill="url(#cit-grad)" stroke="#38BDF8" stroke-width="4"/>
  <circle cx="128" cy="128" r="86" fill="none" stroke="#BAE6FD" stroke-width="2"/>
  <!-- Compass Star -->
  <polygon points="128,46 136,118 208,128 136,138 128,210 120,138 48,128 120,118" fill="#FFFFFF" opacity="0.3"/>
  <polygon points="128,60 134,122 196,128 134,134 128,196 122,134 60,128 122,122" fill="#38BDF8"/>
  <!-- Gear & Anchor Central Icon -->
  <circle cx="128" cy="128" r="22" fill="#0C4A6E" stroke="#FDE047" stroke-width="3"/>
  <circle cx="128" cy="128" r="8" fill="#FDE047"/>
  <!-- Banner -->
  <rect x="86" y="184" width="84" height="22" rx="5" fill="#38BDF8"/>
  <text x="128" y="199" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="13" fill="#0C4A6E" letter-spacing="2">C I T</text>
</svg>`,

  "zec-zaskar": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <linearGradient id="zec-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#1E293B"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="36" fill="#F8FAFC"/>
  <!-- Diamond Crystal Crest -->
  <polygon points="128,24 224,128 128,232 32,128" fill="url(#zec-grad)" stroke="#93C5FD" stroke-width="4"/>
  <!-- Glacial Peaks -->
  <polygon points="128,68 180,154 76,154" fill="#93C5FD" opacity="0.75"/>
  <polygon points="128,88 166,154 90,154" fill="#E2E8F0"/>
  <!-- Engineering Caliper -->
  <path d="M104 140 C104 124 152 124 152 140 L152 168 L104 168 Z" fill="none" stroke="#F8FAFC" stroke-width="3"/>
  <circle cx="128" cy="132" r="5" fill="#38BDF8"/>
  <!-- Label Banner -->
  <rect x="86" y="186" width="84" height="20" rx="4" fill="#93C5FD"/>
  <text x="128" y="200" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="12" fill="#0F172A" letter-spacing="2">Z E C</text>
</svg>`,

  "tieas-thar": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <linearGradient id="thar-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#451A03"/>
      <stop offset="100%" stop-color="#9A3412"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="36" fill="#FFF7ED"/>
  <!-- Sun Fortress Shield -->
  <path d="M128 24 L216 56 L216 148 C216 196 168 226 128 236 C88 226 40 196 40 148 L40 56 Z" fill="url(#thar-grad)" stroke="#EA580C" stroke-width="4"/>
  <!-- Solar Panel Grid Shape -->
  <polygon points="86,140 170,140 182,174 74,174" fill="#FDBA74"/>
  <line x1="128" y1="140" x2="128" y2="174" stroke="#451A03" stroke-width="2"/>
  <line x1="80" y1="157" x2="176" y2="157" stroke="#451A03" stroke-width="2"/>
  <!-- Wind Turbine Icon -->
  <polygon points="126,140 130,140 131,88 125,88" fill="#FFFFFF"/>
  <circle cx="128" cy="88" r="6" fill="#FED7AA"/>
  <line x1="128" y1="88" x2="104" y2="68" stroke="#FFFFFF" stroke-width="3"/>
  <line x1="128" y1="88" x2="152" y2="68" stroke="#FFFFFF" stroke-width="3"/>
  <line x1="128" y1="88" x2="128" y2="114" stroke="#FFFFFF" stroke-width="3"/>
  <!-- Label -->
  <rect x="76" y="196" width="104" height="20" rx="4" fill="#EA580C"/>
  <text x="128" y="210" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="11" fill="#FFFFFF" letter-spacing="2">T I E A S</text>
</svg>`,

  "cit-chilika": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <linearGradient id="chilika-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#172554"/>
      <stop offset="100%" stop-color="#0F766E"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="36" fill="#F0FDFA"/>
  <!-- Teardrop Crest Shape -->
  <path d="M128 26 C176 80 216 128 216 166 C216 206 176 232 128 232 C80 232 40 206 40 166 C40 128 80 80 128 26 Z" fill="url(#chilika-grad)" stroke="#14B8A6" stroke-width="4"/>
  <!-- Chemistry Flask Vector -->
  <path d="M120 90 L136 90 L136 112 L158 152 C164 162 156 174 144 174 L112 174 C100 174 92 162 98 152 L120 112 Z" fill="#CCFBF1" opacity="0.9"/>
  <!-- Water Waves in Flask -->
  <path d="M104 154 Q128 144 152 154 L144 172 L112 172 Z" fill="#14B8A6"/>
  <!-- Wing Motif -->
  <path d="M136 100 C156 94 176 80 186 66 C176 84 158 98 136 104 Z" fill="#FDE047"/>
  <!-- Acronym -->
  <rect x="76" y="192" width="104" height="22" rx="4" fill="#14B8A6"/>
  <text x="128" y="207" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="11" fill="#172554" letter-spacing="1.5">C I T - P U R I</text>
</svg>`,

  "sec-satpura": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <linearGradient id="sec-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#14532D"/>
      <stop offset="100%" stop-color="#166534"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="36" fill="#FEFCE8"/>
  <!-- Crowned Shield -->
  <path d="M128 32 C188 32 214 56 214 116 C214 180 156 220 128 234 C100 220 42 180 42 116 C42 56 68 32 128 32 Z" fill="url(#sec-grad)" stroke="#F59E0B" stroke-width="4"/>
  <!-- Gear rim crown -->
  <circle cx="128" cy="80" r="26" fill="none" stroke="#FBBF24" stroke-width="4" stroke-dasharray="8 4"/>
  <!-- Central Torch Flame -->
  <path d="M128 56 C134 68 140 76 134 88 C130 80 126 76 124 72 C122 76 118 80 122 88 C116 76 122 68 128 56 Z" fill="#F59E0B"/>
  <rect x="124" y="88" width="8" height="22" rx="2" fill="#FBBF24"/>
  <!-- Forest Trees Base -->
  <polygon points="128,118 148,154 108,154" fill="#BBF7D0"/>
  <polygon points="98,128 116,158 80,158" fill="#86EFAC"/>
  <polygon points="158,128 176,158 140,158" fill="#86EFAC"/>
  <!-- Ribbon -->
  <rect x="88" y="196" width="80" height="20" rx="4" fill="#F59E0B"/>
  <text x="128" y="210" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="13" fill="#14532D" letter-spacing="2">S E C</text>
</svg>`,
};

for (const [id, svg] of Object.entries(logos)) {
  targets.forEach((dir) => {
    fs.writeFileSync(path.join(dir, `${id}.svg`), svg.trim(), "utf-8");
  });
  console.log(`Generated logo: ${id}.svg`);
}

console.log("All 12 logos generated successfully!");
