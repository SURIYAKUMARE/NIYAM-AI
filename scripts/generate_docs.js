const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const { chromium } = require(path.join(__dirname, "..", "frontend", "node_modules", "playwright-core"));
const EDGE_PATH = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const targetDirs = [
  path.join(__dirname, "..", "frontend", "public", "seed", "docs"),
  path.join(__dirname, "..", "public", "seed", "docs"),
];

targetDirs.forEach((d) => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});

const institutions = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "data", "seed", "institutions.json"), "utf-8")
);

// High-fidelity vector QR Code generator function (renders clean SVG QR pattern)
function generateQrSvg(verifyUrl, docId) {
  // Deterministic pseudo-random matrix based on SHA-256 hash
  const hash = crypto.createHash("sha256").update(verifyUrl + docId).digest("hex");
  const size = 25;
  const cells = [];

  // Corner finder patterns (7x7)
  function addFinder(startX, startY) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          cells.push(`M${startX + c},${startY + r}h1v1h-1z`);
        }
      }
    }
  }

  addFinder(1, 1);
  addFinder(size - 8, 1);
  addFinder(1, size - 8);

  // Timing lines
  for (let i = 8; i < size - 8; i += 2) {
    cells.push(`M${i},6h1v1h-1z`);
    cells.push(`M6,${i}h1v1h-1z`);
  }

  // Data modules derived from hash
  let bitIdx = 0;
  for (let r = 1; r < size - 1; r++) {
    for (let c = 1; c < size - 1; c++) {
      // Skip finder zones
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

// Vector Signature Generator
function generateSignatureSvg(signerName, roleTitle) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 80" width="200" height="66">
    <!-- Drawn realistic signature flourish -->
    <path d="M20 52 C35 20, 50 18, 65 38 C75 52, 90 22, 105 32 C120 42, 115 15, 135 25 C150 32, 165 48, 185 36 C195 30, 210 20, 220 38" fill="none" stroke="#1E3A8A" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M40 58 Q120 62 205 52" fill="none" stroke="#1E3A8A" stroke-width="1.8" stroke-dasharray="2 3"/>
    <path d="M70 28 L95 62" fill="none" stroke="#1E3A8A" stroke-width="2"/>
    <path d="M140 18 C155 35, 170 30, 180 58" fill="none" stroke="#1E3A8A" stroke-width="2"/>
  </svg>`;
}

// Circular Institutional Seal Stamp
function generateStampSvg(instName, statusText = "AUTHORIZED VERIFICATION") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="110" height="110">
    <g transform="rotate(-8 80 80)">
      <circle cx="80" cy="80" r="72" fill="none" stroke="#991B1B" stroke-width="3" stroke-dasharray="5 2"/>
      <circle cx="80" cy="80" r="64" fill="none" stroke="#991B1B" stroke-width="1.5"/>
      <path id="curve" d="M 25 80 A 55 55 0 1 1 135 80" fill="none"/>
      <text font-family="Arial, sans-serif" font-size="9.5" font-weight="900" fill="#991B1B" letter-spacing="1.5">
        <textPath href="#curve" startOffset="50%" text-anchor="middle">OFFICIAL STATUTORY SEAL</textPath>
      </text>
      <text x="80" y="78" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" font-weight="bold" fill="#991B1B">REGISTRAR</text>
      <text x="80" y="93" text-anchor="middle" font-family="Arial, sans-serif" font-size="8.5" font-weight="bold" fill="#991B1B">2025-26 SESSION</text>
      <text x="80" y="124" text-anchor="middle" font-family="Arial, sans-serif" font-size="8" font-weight="900" fill="#991B1B" letter-spacing="1">AUTHENTICATED</text>
      <circle cx="80" cy="80" r="4" fill="#991B1B"/>
    </g>
  </svg>`;
}

// Master HTML template for documents
function renderDocumentHtml({
  inst,
  doc,
  logoSvg,
  bodyContent,
  showSignature = true,
  showStamp = true,
  isTampered = false,
  tamperBadge = null,
}) {
  const qrSvg = generateQrSvg(`/verify/${doc.id}`, doc.id);
  const signatureSvg = generateSignatureSvg("Dr. S. K. Narayanan", "Member Secretary / Competent Authority");
  const stampSvg = generateStampSvg(inst.name);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${doc.title} - ${inst.name}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 16mm 14mm 16mm 14mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 10.5pt;
      line-height: 1.45;
      color: #111827;
      background: #FFFFFF;
      position: relative;
    }
    .watermark {
      position: fixed;
      top: 42%;
      left: 6%;
      right: 6%;
      text-align: center;
      font-family: 'Arial', sans-serif;
      font-size: 58pt;
      font-weight: 900;
      color: rgba(203, 213, 225, 0.28);
      transform: rotate(-35deg);
      user-select: none;
      pointer-events: none;
      z-index: 0;
      letter-spacing: 4px;
    }
    .header-table {
      width: 100%;
      border-bottom: 2.5pt solid #0F6B6B;
      padding-bottom: 8pt;
      margin-bottom: 12pt;
    }
    .header-logo {
      width: 80px;
      vertical-align: middle;
    }
    .header-text {
      vertical-align: middle;
      padding-left: 12pt;
      text-align: left;
    }
    .inst-title {
      font-family: 'Arial', sans-serif;
      font-size: 15pt;
      font-weight: 900;
      color: #0F172A;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      line-height: 1.2;
    }
    .inst-subtitle {
      font-family: 'Arial', sans-serif;
      font-size: 8.5pt;
      color: #475569;
      margin-top: 2pt;
      font-weight: 600;
    }
    .inst-legal {
      font-family: 'Arial', sans-serif;
      font-size: 8pt;
      color: #0F6B6B;
      font-weight: bold;
      margin-top: 1pt;
    }
    .meta-bar {
      display: flex;
      justify-content: space-between;
      font-family: 'Arial', sans-serif;
      font-size: 8.5pt;
      font-weight: 700;
      color: #334155;
      margin-bottom: 12pt;
      border-bottom: 0.75pt solid #CBD5E1;
      padding-bottom: 4pt;
    }
    .doc-headline {
      text-align: center;
      font-family: 'Arial', sans-serif;
      font-size: 12.5pt;
      font-weight: 900;
      color: #0F172A;
      text-transform: uppercase;
      margin: 10pt 0 10pt 0;
      letter-spacing: 0.5px;
      text-decoration: underline;
    }
    .content-para {
      text-align: justify;
      margin-bottom: 8pt;
      text-indent: 20pt;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 10pt 0 12pt 0;
      font-size: 9pt;
      font-family: 'Arial', sans-serif;
    }
    table.data-table th, table.data-table td {
      border: 1pt solid #94A3B8;
      padding: 4.5pt 6pt;
      text-align: left;
    }
    table.data-table th {
      background-color: #F1F5F9;
      font-weight: 800;
      color: #0F172A;
      text-transform: uppercase;
      font-size: 8pt;
    }
    .sign-section {
      width: 100%;
      margin-top: 18pt;
      page-break-inside: avoid;
    }
    .qr-box {
      width: 110px;
      text-align: center;
      vertical-align: bottom;
      font-family: 'Arial', sans-serif;
      font-size: 7pt;
      color: #475569;
    }
    .sign-box {
      text-align: right;
      vertical-align: bottom;
      padding-right: 10pt;
    }
    .sign-box-title {
      font-family: 'Arial', sans-serif;
      font-size: 8.5pt;
      font-weight: bold;
      color: #0F172A;
      margin-top: 2pt;
    }
    .stamp-box {
      vertical-align: bottom;
      text-align: center;
      width: 130px;
    }
    .footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      border-top: 1pt solid #CBD5E1;
      padding-top: 4pt;
      font-family: 'Arial', sans-serif;
      font-size: 7.5pt;
      color: #64748B;
      display: flex;
      justify-content: space-between;
    }
    .tamper-highlight {
      background-color: #FEF3C7;
      border: 1.5pt dashed #D97706;
      padding: 2pt 4pt;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="watermark">SAMPLE – DEMO DATA</div>

  <table class="header-table">
    <tr>
      <td class="header-logo">
        <div style="width:72px; height:72px;">${logoSvg}</div>
      </td>
      <td class="header-text">
        <div class="inst-title">${inst.name}</div>
        <div class="inst-subtitle">${inst.address}</div>
        <div class="inst-legal">Sponsoring Trust: ${inst.legalEntityType} · AICTE Perm ID: ${inst.permanentId}</div>
      </td>
    </tr>
  </table>

  <div class="meta-bar">
    <div><strong>Ref. No:</strong> ${doc.refNumber}</div>
    <div><strong>Date of Issue:</strong> ${doc.issueDate}</div>
    <div><strong>Valid Through:</strong> ${doc.validUntil}</div>
  </div>

  <div class="doc-headline">${doc.title}</div>

  <div class="main-body">
    ${bodyContent}
  </div>

  <table class="sign-section">
    <tr>
      <td class="qr-box">
        ${qrSvg}
        <div style="margin-top:2pt;">Scan to Verify</div>
        <div style="font-family:monospace; font-size:6.5pt; color:#0F6B6B;">${doc.id}</div>
      </td>
      <td class="stamp-box">
        ${showStamp ? stampSvg : '<div style="color:#94A3B8; font-size:8pt; border:1pt dashed #CBD5E1; padding:20pt 10pt; text-align:center;">[STAMP NOT AFFIXED]</div>'}
      </td>
      <td class="sign-box">
        ${showSignature ? signatureSvg : '<div style="color:#DC2626; font-size:9pt; font-weight:bold; height:50px; display:flex; align-items:center; justify-content:flex-end;">[SIGNATURE MISSING / UNVERIFIED]</div>'}
        <div class="sign-box-title">Registrar / Authorized Signatory</div>
        <div style="font-size:7.5pt; font-family:Arial, sans-serif; color:#64748B;">Competent Institutional Regulation Authority</div>
      </td>
    </tr>
  </table>

  <div class="footer">
    <span>Fictional document generated for software testing.</span>
    <span>Document ID: ${doc.id} · APH 2025-26 Regulation Verification</span>
    <span>Page 1 of 1</span>
  </div>
</body>
</html>`;
}

// Content generator for Approval Letter
function getApprovalLetterContent(inst, isTampered = false) {
  const cseIntake = isTampered ? `<span class="tamper-highlight">180 (Altered from 60)</span>` : "120";

  let courseRows = inst.courses
    .map(
      (c, idx) => `<tr>
      <td style="text-align:center;">${idx + 1}</td>
      <td><strong>${c.degree}</strong> ${c.name}</td>
      <td style="text-align:center;">${c.degree === "B.Tech" ? "4 Years" : "2 Years"}</td>
      <td style="text-align:center; font-weight:bold;">${c.name.includes("Computer Science") && isTampered ? cseIntake : c.intake}</td>
      <td style="text-align:center; color:#047857; font-weight:bold;">APPROVED (2025-26)</td>
    </tr>`
    )
    .join("");

  return `
    <p class="content-para">
      In terms of the provisions under the All India Council for Technical Education (Grant of Approvals for Technical Institutions) Regulations, 2020 notified on 4th February 2020 and amended from time to time, and norms, standards, procedures and conditions prescribed by the Council from time to time, I am directed to convey the official Extension of Approval (EoA) to <strong>${inst.name}</strong>, situated at ${inst.address}, for the academic session <strong>2025-26</strong>.
    </p>
    <p class="content-para">
      The approval is granted subject to the strict observance of regulatory conditions specified in the AICTE Approval Process Handbook (APH 2025-26), including land ownership compliance, structural floor plan safety, anti-ragging mandates, barrier-free access for Persons with Disabilities (PWD), and maintenance of the mandated Faculty-to-Student Cadre Ratio (1:20 for undergraduate degree engineering).
    </p>

    <table class="data-table">
      <thead>
        <tr>
          <th style="width:5%; text-align:center;">S.No</th>
          <th style="width:45%;">Approved Programme / Course</th>
          <th style="width:15%; text-align:center;">Duration</th>
          <th style="width:15%; text-align:center;">Sanctioned Intake</th>
          <th style="width:20%; text-align:center;">Approval Status</th>
        </tr>
      </thead>
      <tbody>
        ${courseRows}
      </tbody>
    </table>

    <p class="content-para" style="font-size:9.5pt;">
      It is mandatory for the institution to maintain an operational grievance redressal committee, internal complaint committee, and dedicated broadband leased line connectivity exceeding 100 Mbps. Any unauthorized deviation in sanctioned seat intake or course curriculum shall invite disciplinary actions under Section 10(k) of the AICTE Act.
    </p>
  `;
}

// Content generator for Affiliation Certificate
function getAffiliationCertContent(inst, isTampered = false, isExpired = false) {
  const certDate = isExpired ? `<span class="tamper-highlight">31-Mar-2023 (EXPIRED)</span>` : "30-Jun-2026";
  const refNum = isTampered ? `<span class="tamper-highlight">STU/AFFIL/2025/RJ-999-TAMPERED</span>` : "STU/AFFIL/2025/VALID-881";

  return `
    <p class="content-para">
      This is to certify that <strong>${inst.name}</strong>, established under the aegis of <strong>${inst.legalEntityType}</strong>, has been granted formal <strong>Provisional Affiliation</strong> by the State Technological University for conducting technical degree and postgraduate courses for the academic year 2025-26, under the statutory provisions of the State Technical Universities Act.
    </p>
    <p class="content-para">
      The affiliation is granted following the recommendation of the University Inspection Committee and scrutiny of the institutional infrastructure, faculty credentials, laboratory equipment, and library resources in accordance with university affiliation statutes.
    </p>

    <table class="data-table">
      <thead>
        <tr>
          <th style="width:25%;">University Ref Number</th>
          <th style="width:25%;">Affiliation Category</th>
          <th style="width:25%;">Sanctioned Academic Year</th>
          <th style="width:25%;">Validity Period</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>${refNum}</strong></td>
          <td>Provisional Technical Affiliation</td>
          <td>2025-26 Session</td>
          <td><strong>${certDate}</strong></td>
        </tr>
      </tbody>
    </table>

    <p class="content-para">
      The college authorities shall strictly adhere to the academic curriculum, semester examination schedules, and continuous internal assessment norms prescribed by the Academic Council. Admission of students beyond the sanctioned intake approved by AICTE and the University is strictly prohibited and shall be considered null and void.
    </p>
    <p class="content-para">
      This certificate is issued under the seal of the University Registrar and remains subject to renewal upon completion of the annual compliance audit.
    </p>
  `;
}

// Content generator for Compliance Report
function getComplianceReportContent(inst, isMissingFields = false, isExpired = false) {
  const landArea = isMissingFields ? `<span class="tamper-highlight">[SURVEY NO. MISSING]</span>` : `${inst.campusAreaAcres} Acres (Survey No. 104/2A, 104/2B)`;
  const builtUp = isMissingFields ? `<span class="tamper-highlight">[BUILT-UP AREA UNVERIFIED]</span>` : `${inst.builtUpAreaSqm.toLocaleString()} Sq. Meters`;
  const clearanceDate = isExpired ? `<span class="tamper-highlight">31-Mar-2024 (EXPIRED CONSENT)</span>` : "30-Jun-2026 (Valid)";

  return `
    <p class="content-para">
      This comprehensive Technical & Physical Compliance Report certifies the verification of essential regulatory parameters for <strong>${inst.name}</strong> (AICTE Permanent ID: ${inst.permanentId}) in accordance with Chapter IV and Chapter VII of the Approval Process Handbook.
    </p>

    <table class="data-table">
      <thead>
        <tr>
          <th style="width:30%;">Regulatory Parameter</th>
          <th style="width:35%;">Prescribed Statutory Norm</th>
          <th style="width:35%;">Observed Institutional Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Campus Land Title</strong></td>
          <td>Min. 7.5 Acres Contiguous (Rural/Urban)</td>
          <td><strong>${landArea}</strong></td>
        </tr>
        <tr>
          <td><strong>Instructional Built-up Area</strong></td>
          <td>Min. 11,000 Sq. Meters for Sanctioned Intake</td>
          <td><strong>${builtUp}</strong></td>
        </tr>
        <tr>
          <td><strong>Fire & Life Safety NOC</strong></td>
          <td>Valid State Municipal Fire Directorate NOC</td>
          <td>${clearanceDate}</td>
        </tr>
        <tr>
          <td><strong>Computing Terminals & Wi-Fi</strong></td>
          <td>1:6 Terminal Ratio (Min 180 Terminals)</td>
          <td>Verified: 240 Core i7 Terminals (1 Gbps LAN)</td>
        </tr>
        <tr>
          <td><strong>TER Regulatory Fee</strong></td>
          <td>Online Bharatkosh Settlement</td>
          <td>Settled: Ref # BHRTK-2025-99214</td>
        </tr>
      </tbody>
    </table>

    <p class="content-para">
      The institutional campus was evaluated against physical barrier-free requirements, dedicated medical centers, clean energy provisions, and anti-ragging squads. All physical facilities meet prescribed regulatory thresholds for technical educational institutions.
    </p>
  `;
}

async function run() {
  console.log("=====================================================================");
  console.log("   GENERATING 36 REALISTIC A4 PDF SAMPLE DOCUMENTS (HTML+CSS+PUPPETEER) ");
  console.log("=====================================================================");

  const browser = await chromium.launch({
    executablePath: EDGE_PATH,
    headless: true,
  });

  const page = await browser.newPage();

  let generatedCount = 0;

  for (const inst of institutions) {
    console.log(`\nProcessing: ${inst.name} (${inst.id})`);

    // Read institute logo SVG
    const logoPath = path.join(__dirname, "..", "frontend", "public", "seed", "logos", `${inst.id}.svg`);
    const logoSvg = fs.existsSync(logoPath) ? fs.readFileSync(logoPath, "utf-8") : "<svg></svg>";

    for (const doc of inst.documents) {
      const isZecTampered = inst.id === "zec-zaskar" && doc.type === "approval_letter";
      const isTharTampered = inst.id === "tieas-thar" && doc.type === "affiliation_certificate";
      const isVtiExpired = inst.id === "vti-vindhya" && doc.type === "affiliation_certificate";
      const isCoroExpired = inst.id === "cit-coromandel" && doc.type === "compliance_report";
      const isChilikaMissing = inst.id === "cit-chilika" && doc.type === "compliance_report";
      const isSatpuraMissing = inst.id === "sec-satpura" && doc.type === "approval_letter";

      let bodyContent = "";
      let showSignature = true;
      let showStamp = true;

      if (doc.type === "approval_letter") {
        bodyContent = getApprovalLetterContent(inst, isZecTampered);
        if (isSatpuraMissing) {
          bodyContent += `<p style="color:#DC2626; font-size:8.5pt; font-weight:bold; margin-top:6pt;">[NOTICE: BHARATKOSH TRANSACTION REFERENCE NOT RECORDED. MUNICIPAL BUILDING SANCTION EXEMPTION PENDING.]</p>`;
        }
      } else if (doc.type === "affiliation_certificate") {
        bodyContent = getAffiliationCertContent(inst, isTharTampered, isVtiExpired);
      } else if (doc.type === "compliance_report") {
        bodyContent = getComplianceReportContent(inst, isChilikaMissing, isCoroExpired);
        if (isChilikaMissing) {
          showSignature = false;
          showStamp = false;
        }
      }

      const html = renderDocumentHtml({
        inst,
        doc,
        logoSvg,
        bodyContent,
        showSignature,
        showStamp,
        isTampered: doc.tamperDetected,
      });

      await page.setContent(html, { waitUntil: "domcontentloaded" });

      const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "14mm", right: "12mm", bottom: "14mm", left: "12mm" },
      });

      for (const dir of targetDirs) {
        const collegeDir = path.join(dir, inst.id);
        if (!fs.existsSync(collegeDir)) fs.mkdirSync(collegeDir, { recursive: true });
        const fileName = `${doc.type}.pdf`;
        const outPdfPath = path.join(collegeDir, fileName);
        fs.writeFileSync(outPdfPath, pdfBuffer);
      }

      generatedCount++;
      process.stdout.write(`  ✓ Rendered ${doc.type}.pdf\n`);
    }
  }

  await browser.close();

  console.log("\n=====================================================================");
  console.log(`   SUCCESS: ${generatedCount} PDF DOCUMENTS GENERATED ACROSS 12 COLLEGES`);
  console.log("=====================================================================\n");
}

run().catch((err) => {
  console.error("PDF generation failed:", err);
  process.exit(1);
});
