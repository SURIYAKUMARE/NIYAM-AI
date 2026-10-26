const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { chromium } = require(path.join(__dirname, "..", "frontend", "node_modules", "playwright-core"));

const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

// Paths
const logoTargets = [
  path.join(__dirname, "..", "frontend", "public", "seed", "logos"),
  path.join(__dirname, "..", "public", "seed", "logos"),
];
const photoTargets = [
  path.join(__dirname, "..", "frontend", "public", "seed", "photos"),
  path.join(__dirname, "..", "public", "seed", "photos"),
];
const docTargets = [
  path.join(__dirname, "..", "frontend", "public", "seed", "docs"),
  path.join(__dirname, "..", "public", "seed", "docs"),
];

[...logoTargets, ...photoTargets, ...docTargets].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// New Logos
const newLogos = {
  "kiat-kailash": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <linearGradient id="kiat-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#0284C7"/>
    </linearGradient>
    <linearGradient id="snow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#BAE6FD"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="36" fill="#F0F9FF"/>
  <!-- Octagonal Crest Shield -->
  <polygon points="128,24 208,56 224,144 176,216 128,236 80,216 32,144 48,56" fill="url(#kiat-grad)" stroke="#38BDF8" stroke-width="4"/>
  <!-- Triple Snowy Himalayan Peaks -->
  <polygon points="68,144 100,92 132,144" fill="url(#snow-grad)"/>
  <polygon points="104,144 128,76 152,144" fill="#FFFFFF"/>
  <polygon points="124,144 156,92 188,144" fill="url(#snow-grad)"/>
  <!-- AI Neural Network Nodes -->
  <circle cx="96" cy="116" r="4.5" fill="#38BDF8"/>
  <circle cx="128" cy="100" r="5.5" fill="#FBBF24"/>
  <circle cx="160" cy="116" r="4.5" fill="#38BDF8"/>
  <line x1="96" y1="116" x2="128" y2="100" stroke="#FBBF24" stroke-width="2"/>
  <line x1="160" y1="116" x2="128" y2="100" stroke="#FBBF24" stroke-width="2"/>
  <line x1="96" y1="116" x2="160" y2="116" stroke="#38BDF8" stroke-width="1.5" stroke-dasharray="3 2"/>
  <!-- Open Digital Book Base -->
  <path d="M84,168 C104,160 120,164 128,172 C136,164 152,160 172,168 L172,192 C152,184 136,188 128,196 C120,188 104,184 84,192 Z" fill="#FFFFFF"/>
  <!-- Acronym Ribbon -->
  <rect x="80" y="202" width="96" height="22" rx="5" fill="#38BDF8"/>
  <text x="128" y="217" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="12" fill="#0F172A" letter-spacing="2">K I A T</text>
</svg>`,

  "rit-rann": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <linearGradient id="rit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E1B4B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="36" fill="#FFFBEB"/>
  <!-- Circular Maritime Seal -->
  <circle cx="128" cy="128" r="98" fill="url(#rit-grad)" stroke="#F59E0B" stroke-width="4"/>
  <circle cx="128" cy="128" r="88" fill="none" stroke="#FDE68A" stroke-width="1.5" stroke-dasharray="5 3"/>
  <!-- Ship Anchor & Compass Star -->
  <circle cx="128" cy="80" r="14" fill="none" stroke="#FFFFFF" stroke-width="3"/>
  <line x1="128" y1="94" x2="128" y2="162" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/>
  <line x1="108" y1="116" x2="148" y2="116" stroke="#FFFFFF" stroke-width="4" stroke-linecap="round"/>
  <path d="M96 146 C104 172 152 172 160 146" fill="none" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round"/>
  <!-- Sea Wave at bottom -->
  <path d="M72 178 Q100 166 128 178 T184 178" fill="none" stroke="#38BDF8" stroke-width="3"/>
  <!-- Acronym Ribbon -->
  <rect x="88" y="196" width="80" height="20" rx="4" fill="#F59E0B"/>
  <text x="128" y="211" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="12" fill="#1E1B4B" letter-spacing="2">R I T</text>
</svg>`,

  "dpit-deccan": `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <linearGradient id="dpit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4C1D95"/>
      <stop offset="100%" stop-color="#7C3AED"/>
    </linearGradient>
  </defs>
  <rect width="256" height="256" rx="36" fill="#FAF5FF"/>
  <!-- Shield with Crown Crest -->
  <path d="M128 26 C192 26 218 52 218 114 C218 180 156 224 128 238 C100 224 38 180 38 114 C38 52 64 26 128 26 Z" fill="url(#dpit-grad)" stroke="#A78BFA" stroke-width="4"/>
  <!-- Charminar Gateway Silhouette Motif -->
  <rect x="94" y="92" width="16" height="64" rx="2" fill="#EDE9FE"/>
  <rect x="146" y="92" width="16" height="64" rx="2" fill="#EDE9FE"/>
  <path d="M90 92 L102 66 L114 92 Z" fill="#FDE047"/>
  <path d="M142 92 L154 66 L166 92 Z" fill="#FDE047"/>
  <!-- Arch connecting towers -->
  <path d="M106 118 C114 104 142 104 150 118 L150 156 L106 156 Z" fill="#EDE9FE" opacity="0.9"/>
  <!-- Acronym Ribbon -->
  <rect x="84" y="200" width="88" height="22" rx="4" fill="#FDE047"/>
  <text x="128" y="215" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="900" font-size="12" fill="#4C1D95" letter-spacing="2">D P I T</text>
</svg>`,
};

// Generate Logos
for (const [id, svg] of Object.entries(newLogos)) {
  logoTargets.forEach((dir) => {
    fs.writeFileSync(path.join(dir, `${id}.svg`), svg.trim(), "utf-8");
  });
  console.log(`✓ Generated logo: ${id}.svg`);
}

// Generate Photos
function createCampusImage(id, name, topColor, bottomColor) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <defs>
    <linearGradient id="sky-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${topColor}"/>
      <stop offset="60%" stop-color="${bottomColor}"/>
      <stop offset="100%" stop-color="#FFFFFF"/>
    </linearGradient>
    <linearGradient id="ground-${id}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#22C55E"/>
      <stop offset="100%" stop-color="#15803D"/>
    </linearGradient>
    <linearGradient id="facade" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#F8FAFC"/>
      <stop offset="100%" stop-color="#CBD5E1"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="520" fill="url(#sky-${id})"/>
  <circle cx="1020" cy="140" r="70" fill="#FEF08A" opacity="0.45"/>
  <path d="M0 450 Q300 380 600 420 T1200 400 L1200 520 L0 520 Z" fill="#64748B" opacity="0.35"/>
  <rect y="480" width="1200" height="320" fill="url(#ground-${id})"/>
  <!-- Main Building Center -->
  <g transform="translate(180, 220)">
    <rect x="0" y="40" width="840" height="260" rx="8" fill="url(#facade)" stroke="#94A3B8" stroke-width="3"/>
    <rect x="340" y="0" width="160" height="300" rx="6" fill="#0F172A"/>
    <!-- Glass Portico -->
    <rect x="360" y="20" width="120" height="240" fill="#38BDF8" opacity="0.85"/>
    <!-- Window Grid -->
    ${Array.from({ length: 4 })
      .map(
        (_, row) =>
          `<g transform="translate(20, ${60 + row * 50})">
            ${Array.from({ length: 7 })
              .map((_, col) => `<rect x="${col * 42}" width="28" height="32" rx="3" fill="#0284C7" opacity="0.8"/>`)
              .join("")}
          </g>
          <g transform="translate(530, ${60 + row * 50})">
            ${Array.from({ length: 7 })
              .map((_, col) => `<rect x="${col * 42}" width="28" height="32" rx="3" fill="#0284C7" opacity="0.8"/>`)
              .join("")}
          </g>`
      )
      .join("")}
  </g>
  <!-- Institution Title Signboard -->
  <rect x="320" y="560" width="560" height="52" rx="10" fill="#0F172A" stroke="#38BDF8" stroke-width="2"/>
  <text x="600" y="592" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="20" fill="#FFFFFF" letter-spacing="1">${name.toUpperCase()}</text>
</svg>`;
}

function createClassroomImage(id, name) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <rect width="1200" height="800" fill="#0F172A"/>
  <!-- Front Presentation Screen -->
  <rect x="250" y="80" width="700" height="320" rx="12" fill="#1E293B" stroke="#38BDF8" stroke-width="4"/>
  <rect x="280" y="100" width="640" height="280" rx="8" fill="#0284C7" opacity="0.15"/>
  <text x="600" y="220" text-anchor="middle" font-family="Arial, sans-serif" font-weight="bold" font-size="24" fill="#38BDF8">${name}</text>
  <text x="600" y="260" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#94A3B8">Smart Digital Tiered Interactive Lecture Amphitheatre</text>
  <!-- Tiered Seating Desks -->
  ${[460, 540, 620, 700]
    .map(
      (y, idx) => `
    <rect x="${100 - idx * 20}" y="${y}" width="${1000 + idx * 40}" height="28" rx="6" fill="#334155"/>
    <rect x="${110 - idx * 20}" y="${y + 28}" width="${980 + idx * 40}" height="14" fill="#1E293B"/>
  `
    )
    .join("")}
</svg>`;
}

function createLabImage(id, name) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="1200" height="800">
  <rect width="1200" height="800" fill="#090D16"/>
  <!-- Lab Workstations Row -->
  <rect x="120" y="280" width="960" height="420" rx="16" fill="#1E293B" stroke="#475569" stroke-width="2"/>
  <!-- Monitors & Testing Racks -->
  ${Array.from({ length: 5 })
    .map(
      (_, i) => `
    <g transform="translate(${160 + i * 180}, 200)">
      <rect x="0" y="0" width="130" height="85" rx="6" fill="#0F172A" stroke="#38BDF8" stroke-width="2"/>
      <rect x="6" y="6" width="118" height="73" fill="#0369A1" opacity="0.4"/>
      <rect x="55" y="85" width="20" height="25" fill="#475569"/>
      <rect x="35" y="110" width="60" height="8" rx="2" fill="#334155"/>
      <rect x="15" y="125" width="100" height="20" rx="3" fill="#0F172A"/>
    </g>`
    )
    .join("")}
  <text x="600" y="100" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="24" fill="#38BDF8">${name}</text>
  <text x="600" y="135" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#94A3B8">Advanced Computing, AI Research &amp; Prototyping Laboratory</text>
</svg>`;
}

const photoConfigs = [
  { id: "kiat-kailash", name: "Kailash Institute of Advanced Tech", top: "#0369A1", bot: "#38BDF8" },
  { id: "rit-rann", name: "Rann Institute of Technology & Marine", top: "#92400E", bot: "#F59E0B" },
  { id: "dpit-deccan", name: "Deccan Premier Institute of Tech", top: "#4C1D95", bot: "#8B5CF6" },
];

photoConfigs.forEach((p) => {
  photoTargets.forEach((dir) => {
    const pDir = path.join(dir, p.id);
    if (!fs.existsSync(pDir)) fs.mkdirSync(pDir, { recursive: true });

    fs.writeFileSync(path.join(pDir, "campus.jpg"), createCampusImage(p.id, p.name, p.top, p.bot), "utf-8");
    fs.writeFileSync(path.join(pDir, "classroom.jpg"), createClassroomImage(p.id, p.name), "utf-8");
    fs.writeFileSync(path.join(pDir, "lab.jpg"), createLabImage(p.id, p.name), "utf-8");
  });
  console.log(`✓ Generated 3 photos for ${p.id}`);
});

// QR & Seals for Documents
function generateQrSvg(verifyUrl, docId) {
  const hash = crypto.createHash("sha256").update(verifyUrl + docId).digest("hex");
  const size = 25;
  const cells = [];
  function addFinder(startX, startY) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          cells.push(`M${startX + c},${startY + r}h1v1h-1z`);
        }
      }
    }
  }
  addFinder(1, 1);
  addFinder(size - 8, 1);
  addFinder(1, size - 8);
  for (let i = 8; i < size - 8; i += 2) {
    cells.push(`M${i},6h1v1h-1z`);
    cells.push(`M6,${i}h1v1h-1z`);
  }
  let bitIdx = 0;
  for (let r = 1; r < size - 1; r++) {
    for (let c = 1; c < size - 1; c++) {
      if (r <= 8 && c <= 8) continue;
      if (r <= 8 && c >= size - 9) continue;
      if (r >= size - 9 && c <= 8) continue;
      if (r === 6 || c === 6) continue;
      const charVal = parseInt(hash[bitIdx % hash.length], 16);
      bitIdx++;
      if ((charVal + r + c) % 2 === 0) {
        cells.push(`M${c},${r}h1v1h-1z`);
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="100" height="100" shape-rendering="crispEdges">
    <rect width="${size}" height="${size}" fill="#FFFFFF"/>
    <path d="${cells.join(" ")}" fill="#0F172A"/>
  </svg>`;
}

function generateSignatureSvg(signerName, roleTitle) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="200" height="66">
    <path d="M20 52 C35 20, 50 18, 65 38 C75 52, 90 22, 105 32 C120 42, 115 15, 135 25 C150 32, 165 48, 185 36 C195 30, 210 20, 220 38" fill="none" stroke="#1E3A8A" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M40 58 Q120 62 205 52" fill="none" stroke="#1E3A8A" stroke-width="1.8" stroke-dasharray="2 3"/>
    <path d="M70 28 L95 62" fill="none" stroke="#1E3A8A" stroke-width="2"/>
    <path d="M140 18 C155 35, 170 30, 180 58" fill="none" stroke="#1E3A8A" stroke-width="2"/>
  </svg>`;
}

function generateStampSvg(instName) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="110" height="110">
    <g transform="rotate(-8 80 80)">
      <circle cx="80" cy="80" r="72" fill="none" stroke="#991B1B" stroke-width="3" stroke-dasharray="5 2"/>
      <circle cx="80" cy="80" r="64" fill="none" stroke="#991B1B" stroke-width="1.5"/>
      <path id="curve" d="M 25 80 A 55 55 0 1 1 135 80" fill="none"/>
      <text font-family="Arial, sans-serif" font-size="9" font-weight="900" fill="#991B1B" letter-spacing="1">
        <textPath href="#curve" startOffset="50%" text-anchor="middle">OFFICIAL STATUTORY SEAL</textPath>
      </text>
      <text x="80" y="78" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#991B1B">REGISTRAR</text>
      <text x="80" y="93" text-anchor="middle" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#991B1B">2025-26 SESSION</text>
      <text x="80" y="124" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" font-weight="900" fill="#991B1B" letter-spacing="1">AUTHENTICATED</text>
      <circle cx="80" cy="80" r="4" fill="#991B1B"/>
    </g>
  </svg>`;
}

function renderDocHtml({ inst, doc, logoSvg, bodyContent, showSignature = true, showStamp = true, isTampered = false }) {
  const qrSvg = generateQrSvg(`/verify/${doc.id}`, doc.id);
  const signatureSvg = generateSignatureSvg("Dr. S. K. Narayanan", "Member Secretary / Competent Authority");
  const stampSvg = generateStampSvg(inst.name);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${doc.title} - ${inst.name}</title>
  <style>
    @page { size: A4 portrait; margin: 16mm 14mm 16mm 14mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 10.5pt; line-height: 1.45; color: #111827; background: #FFFFFF; position: relative; }
    .watermark { position: fixed; top: 42%; left: 6%; right: 6%; text-align: center; font-family: 'Arial', sans-serif; font-size: 56pt; font-weight: 900; color: rgba(203, 213, 225, 0.28); transform: rotate(-35deg); user-select: none; pointer-events: none; z-index: 0; letter-spacing: 4px; }
    .header-table { width: 100%; border-bottom: 2.5pt solid #0F6B6B; padding-bottom: 8pt; margin-bottom: 12pt; }
    .header-logo { width: 80px; vertical-align: middle; }
    .header-text { vertical-align: middle; padding-left: 12pt; text-align: left; }
    .inst-title { font-family: 'Arial', sans-serif; font-size: 14pt; font-weight: 900; color: #0F172A; text-transform: uppercase; line-height: 1.2; }
    .inst-subtitle { font-family: 'Arial', sans-serif; font-size: 8.5pt; color: #475569; margin-top: 2pt; font-weight: 600; }
    .inst-legal { font-family: 'Arial', sans-serif; font-size: 8pt; color: #0F6B6B; font-weight: bold; margin-top: 1pt; }
    .meta-bar { display: flex; justify-content: space-between; font-family: 'Arial', sans-serif; font-size: 8.5pt; background: #F8FAFC; border: 1pt solid #E2E8F0; padding: 4pt 8pt; margin-bottom: 12pt; border-radius: 3pt; font-weight: 600; }
    .doc-headline { text-align: center; font-family: 'Arial', sans-serif; font-size: 12.5pt; font-weight: 900; color: #0F172A; letter-spacing: 0.8px; text-decoration: underline; margin-bottom: 12pt; text-transform: uppercase; }
    .content-para { text-align: justify; margin-bottom: 9pt; text-indent: 18pt; font-size: 10.5pt; }
    .data-table { width: 100%; border-collapse: collapse; margin: 10pt 0 14pt 0; font-family: 'Arial', sans-serif; font-size: 8.5pt; }
    .data-table th, .data-table td { border: 1pt solid #CBD5E1; padding: 5pt 7pt; text-align: left; }
    .data-table th { background: #0F172A; color: #FFFFFF; font-weight: bold; }
    .data-table tr:nth-child(even) { background: #F8FAFC; }
    .tamper-highlight { background: #FEE2E2 !important; color: #991B1B; font-weight: bold; }
    .footer-section { margin-top: 18pt; padding-top: 10pt; border-top: 1pt solid #E2E8F0; width: 100%; }
    .footer-table { width: 100%; }
    .footer-table td { vertical-align: bottom; }
    .doc-footnote { position: fixed; bottom: 8mm; left: 14mm; right: 14mm; display: flex; justify-content: space-between; font-family: 'Arial', sans-serif; font-size: 7pt; color: #64748B; border-top: 0.5pt solid #CBD5E1; padding-top: 3pt; }
  </style>
</head>
<body>
  <div class="watermark">SAMPLE – DEMO DATA</div>
  <table class="header-table">
    <tr>
      <td class="header-logo">${logoSvg}</td>
      <td class="header-text">
        <div class="inst-title">${inst.name}</div>
        <div class="inst-subtitle">${inst.address}</div>
        <div class="inst-legal">Sponsoring Trust: ${inst.legalEntityType} · AICTE Perm ID: <strong>${inst.permanentId}</strong></div>
      </td>
    </tr>
  </table>
  <div class="meta-bar">
    <span>Ref. No: <strong>${doc.refNumber}</strong></span>
    <span>Date of Issue: <strong>${doc.issueDate}</strong></span>
    <span>Valid Through: <strong>${doc.validUntil || "2026-06-30"}</strong></span>
  </div>
  <div class="doc-headline">${doc.title.replace(/\[.*?\]/, "")}</div>
  ${bodyContent}
  <div class="footer-section">
    <table class="footer-table">
      <tr>
        <td style="width: 25%; text-align: left;">
          ${qrSvg}
          <div style="font-family: Arial, sans-serif; font-size: 7pt; color: #64748B; margin-top: 2pt;">Scan to Verify<br><strong>${doc.id}</strong></div>
        </td>
        <td style="width: 35%; text-align: center;">
          ${showStamp ? stampSvg : '<div style="height:80px; display:flex; align-items:center; justify-content:center; color:#DC2626; font-family:Arial; font-size:8pt; font-weight:bold;">[MANDATORY STATUTORY SEAL MISSING]</div>'}
        </td>
        <td style="width: 40%; text-align: right;">
          ${showSignature ? signatureSvg : '<div style="height:50px; display:flex; align-items:center; justify-content:flex-end; color:#DC2626; font-family:Arial; font-size:8pt; font-weight:bold;">[SIGNATURE BLOCK OMITTED]</div>'}
          <div style="font-family: Arial, sans-serif; font-size: 8pt; font-weight: bold; color: #0F172A;">Registrar / Authorized Signatory</div>
          <div style="font-family: Arial, sans-serif; font-size: 7pt; color: #64748B;">Competent Institutional Regulation Authority</div>
        </td>
      </tr>
    </table>
  </div>
  <div class="doc-footnote">
    <span>Fictional document generated for software testing.</span>
    <span>Document ID: ${doc.id} · APH 2025-26 Regulation Verification</span>
    <span>Page 1 of 1</span>
  </div>
</body>
</html>`;
}

// Generate PDFs using Playwright
async function generateAllPdfs(newInstitutions) {
  console.log("Launching Edge / Playwright to generate realistic A4 PDFs...");
  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true,
  });
  const page = await browser.newPage();

  for (const inst of newInstitutions) {
    console.log(`\nGenerating documents for: ${inst.name} (${inst.id})`);
    const logoSvg = newLogos[inst.id] || "<svg></svg>";

    for (const doc of inst.documents) {
      let bodyContent = "";

      if (doc.type === "approval_letter") {
        const isTampered = inst.id === "rit-rann";
        bodyContent = `
          <p class="content-para">
            In terms of the provisions under the All India Council for Technical Education (Grant of Approvals for Technical Institutions) Regulations, 2025 notified by the Council vide notification number F.No. AB/AICTE/REG/2025 and amended statutory benchmarks, the Council hereby conveys formal grant of approval to <strong>${inst.name}</strong> for conducting technical courses for the academic session 2025-26.
          </p>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:30%;">Approved Technical Course</th>
                <th style="width:15%;">Program Level</th>
                <th style="width:25%;">Affiliating Body</th>
                <th style="width:15%;">Sanctioned Intake</th>
                <th style="width:15%;">Approval Status</th>
              </tr>
            </thead>
            <tbody>
              ${inst.courses
                .slice(0, 4)
                .map((c, i) => {
                  const intakeText = isTampered && i === 0 ? "180 [ALTERED]" : `${c.intake}`;
                  const rowClass = isTampered && i === 0 ? ' class="tamper-highlight"' : "";
                  return `<tr${rowClass}>
                    <td><strong>${c.name}</strong></td>
                    <td>${c.degree}</td>
                    <td>State Technological University</td>
                    <td style="text-align:center; font-weight:bold;">${intakeText}</td>
                    <td style="color:${isTampered && i === 0 ? "#DC2626" : "#059669"}; font-weight:bold;">Approved</td>
                  </tr>`;
                })
                .join("")}
            </tbody>
          </table>
          <p class="content-para">
            The institution shall ensure strict adherence to faculty student ratio (1:15), barrier-free built-up instructional area (${inst.builtUpAreaSqm} sq.m), campus land quota (${inst.campusAreaAcres} Acres), and anti-ragging measures. Any deviation shall render approval liable to withdrawal.
          </p>
        `;
      } else if (doc.type === "affiliation_certificate") {
        const isExpired = inst.id === "dpit-deccan";
        bodyContent = `
          <p class="content-para">
            This is to certify that <strong>${inst.name}</strong>, established under the aegis of <strong>${inst.legalEntityType}</strong>, has been evaluated for provisional affiliation for conducting degree engineering programs under the statutory provisions of the State Technical Universities Act.
          </p>
          <table class="data-table">
            <thead>
              <tr>
                <th>University Reference</th>
                <th>Affiliation Category</th>
                <th>Sanctioned Academic Year</th>
                <th>Validity Through</th>
              </tr>
            </thead>
            <tbody>
              <tr${isExpired ? ' class="tamper-highlight"' : ""}>
                <td><strong>${doc.refNumber}</strong></td>
                <td>Provisional Technical Affiliation</td>
                <td>${isExpired ? "2023-24 (EXPIRED)" : "2025-26 Session"}</td>
                <td style="font-weight:bold; color:${isExpired ? "#DC2626" : "#059669"};">${doc.validUntil || "30-Jun-2026"}</td>
              </tr>
            </tbody>
          </table>
          <p class="content-para">
            ${isExpired ? '<strong style="color:#DC2626;">[NOTICE: Affiliation expired on 30-April-2024. Application for continuation has not been approved for AY 2025-26.]</strong>' : "The institution is authorized to admit students strictly up to the intake approved by AICTE and the University. All academic curricula and examination schedules prescribed by the University shall be implemented without alteration."}
          </p>
        `;
      } else if (doc.type === "compliance_report") {
        bodyContent = `
          <p class="content-para">
            This Comprehensive Statutory Compliance &amp; Verification Report certifies the on-site physical inspection and automated regulatory scrutiny of <strong>${inst.name}</strong> against the standards prescribed in AICTE Approval Process Handbook (APH 2025-26).
          </p>
          <table class="data-table">
            <thead>
              <tr>
                <th style="width:30%;">Regulatory Domain</th>
                <th style="width:35%;">Prescribed Statutory Norm</th>
                <th style="width:35%;">Observed Institutional Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Campus Land Title</strong></td>
                <td>Min. 7.5 Acres Contiguous</td>
                <td><strong>${inst.campusAreaAcres} Acres (Registered Deed)</strong></td>
              </tr>
              <tr>
                <td><strong>Instructional Built-up Area</strong></td>
                <td>Min. 11,000 Sq. Meters for Sanctioned Intake</td>
                <td><strong>${inst.builtUpAreaSqm.toLocaleString()} Sq. Meters</strong></td>
              </tr>
              <tr>
                <td><strong>Fire &amp; Life Safety NOC</strong></td>
                <td>Valid State Municipal Fire Directorate NOC</td>
                <td>Clearance Valid Thru ${doc.validUntil || "2026-06-30"}</td>
              </tr>
              <tr>
                <td><strong>TER Regulatory Fee</strong></td>
                <td>Online Bharatkosh Settlement</td>
                <td>Settled: Ref # BHRTK-2025-${inst.permanentId.slice(-4)}</td>
              </tr>
            </tbody>
          </table>
          <p class="content-para">
            Physical inspection confirmed functional smart lecture theatres, high-performance computing clusters, clean energy provisions, and full accessibility ramps for persons with disabilities.
          </p>
        `;
      }

      const html = renderDocHtml({
        inst,
        doc,
        logoSvg,
        bodyContent,
        showSignature: true,
        showStamp: true,
        isTampered: doc.tamperDetected,
      });

      await page.setContent(html, { waitUntil: "domcontentloaded" });
      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "14mm", right: "12mm", bottom: "14mm", left: "12mm" },
      });

      for (const dir of docTargets) {
        const collegeDir = path.join(dir, inst.id);
        if (!fs.existsSync(collegeDir)) fs.mkdirSync(collegeDir, { recursive: true });
        const fileName = `${doc.type}.pdf`;
        fs.writeFileSync(path.join(collegeDir, fileName), pdfBuffer);
      }

      console.log(`  ✓ Rendered ${doc.type}.pdf for ${inst.id}`);
    }
  }

  await browser.close();
  console.log("PDF generation complete!");
}

module.exports = {
  newLogos,
  generateAllPdfs,
};
