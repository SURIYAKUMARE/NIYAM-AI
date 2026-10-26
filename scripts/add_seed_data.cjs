const fs = require("fs");
const path = require("path");
const { generateAllPdfs } = require("./generate_all_assets.cjs");

const newInstitutions = [
  {
    id: "kiat-kailash",
    permanentId: "SYN-2025-013",
    name: "Kailash Institute of Advanced Technology & AI",
    shortName: "KIAT",
    city: "Dehradun",
    district: "Dehradun",
    state: "Uttarakhand",
    pincode: "248007",
    establishedYear: 2011,
    legalEntityType: "Himalayan Higher Education & Research Trust (Fictional)",
    status: "Valid",
    statusReason: "Full compliance with APH 2025-26 norms; accredited smart labs and approved 1:15 faculty ratio.",
    trustScore: 97,
    intake: 420,
    facultyCount: 28,
    campusAreaAcres: 14.5,
    builtUpAreaSqm: 19800,
    contactEmail: "dean@kailash-tech.demo-edu.in",
    contactPhone: "+91-135-2789013",
    website: "https://kailash-tech.demo-edu.in",
    address: "Survey No. 412/1B, Foothills Knowledge Boulevard, Dehradun, Uttarakhand - 248007",
    courses: [
      { id: "c1", degree: "B.Tech", name: "Computer Science & Engineering (AI & ML)", intake: 120, durationYears: 4 },
      { id: "c2", degree: "B.Tech", name: "Electronics & Communication Engineering", intake: 120, durationYears: 4 },
      { id: "c3", degree: "B.Tech", name: "Robotics & Autonomous Systems", intake: 60, durationYears: 4 },
      { id: "c4", degree: "B.Tech", name: "Aerospace & Avionics Engineering", intake: 60, durationYears: 4 },
      { id: "c5", degree: "M.Tech", name: "Computational Intelligence", intake: 30, durationYears: 2 },
      { id: "c6", degree: "M.Tech", name: "Quantum Computing & Cyber Security", intake: 30, durationYears: 2 },
    ],
    photos: [
      {
        type: "campus",
        title: "Main Himalayan Academic Quadrangle & Mountain Observatory",
        path: "/seed/photos/kiat-kailash/campus.jpg",
        alt: "Kailash Institute of Advanced Technology modern foothill campus with solar glass observatory"
      },
      {
        type: "classroom",
        title: "Interactive Tiered AI Innovation Lecture Theatre",
        path: "/seed/photos/kiat-kailash/classroom.jpg",
        alt: "Tiered classroom with interactive dual 4K display panels and ergonomic seating at Kailash Tech"
      },
      {
        type: "lab",
        title: "Supercomputing & Robotics Automation Research Lab",
        path: "/seed/photos/kiat-kailash/lab.jpg",
        alt: "High performance AI server racks and multi-axis robotic arms at Kailash Tech"
      }
    ],
    logo: "/seed/logos/kiat-kailash.svg",
    documents: [
      {
        id: "doc-kiat-01",
        type: "approval_letter",
        title: "AICTE Extension of Approval (EoA) 2025-26",
        refNumber: "AICTE/NRO/SYN-2025-013/2025/EOA",
        issueDate: "2025-05-12",
        validUntil: "2026-06-30",
        status: "Verified",
        tamperDetected: false,
        filePath: "/seed/docs/kiat-kailash/approval_letter.pdf",
        pages: 2,
        fileSize: "184 KB"
      },
      {
        id: "doc-kiat-02",
        type: "affiliation_certificate",
        title: "State Technological University Affiliation Order",
        refNumber: "UTU/AFFIL/2025/UK-512",
        issueDate: "2025-06-04",
        validUntil: "2026-06-30",
        status: "Verified",
        tamperDetected: false,
        filePath: "/seed/docs/kiat-kailash/affiliation_certificate.pdf",
        pages: 1,
        fileSize: "172 KB"
      },
      {
        id: "doc-kiat-03",
        type: "compliance_report",
        title: "TER Regulatory Fee & Green Campus Audit Compliance",
        refNumber: "COMP/SYN-2025-013/AUDIT-25",
        issueDate: "2025-05-20",
        validUntil: "2026-06-30",
        status: "Verified",
        tamperDetected: false,
        filePath: "/seed/docs/kiat-kailash/compliance_report.pdf",
        pages: 1,
        fileSize: "178 KB"
      }
    ]
  },
  {
    id: "rit-rann",
    permanentId: "SYN-2025-014",
    name: "Rann Institute of Technology & Marine Systems",
    shortName: "RIT",
    city: "Bhuj",
    district: "Kachchh",
    state: "Gujarat",
    pincode: "370001",
    establishedYear: 2016,
    legalEntityType: "Kutch Marine & Engineering Trust (Fictional)",
    status: "Tampered",
    statusReason: "Course intake table in submitted PDF has been manually inflated from 60 to 180 seats; cryptographic SHA-256 mismatch detected.",
    trustScore: 26,
    intake: 360,
    facultyCount: 24,
    campusAreaAcres: 10.8,
    builtUpAreaSqm: 14200,
    contactEmail: "registrar@rit-kutch.demo-edu.in",
    contactPhone: "+91-2832-259014",
    website: "https://rit-kutch.demo-edu.in",
    address: "Survey No. 78/3, Coastal Highway Corridor, Bhuj, Kachchh, Gujarat - 370001",
    courses: [
      { id: "c1", degree: "B.Tech", name: "Marine Engineering", intake: 60, durationYears: 4 },
      { id: "c2", degree: "B.Tech", name: "Artificial Intelligence & Data Science", intake: 120, durationYears: 4 },
      { id: "c3", degree: "B.Tech", name: "Civil & Offshore Infrastructure Engineering", intake: 60, durationYears: 4 },
      { id: "c4", degree: "B.Tech", name: "Mechanical Engineering", intake: 60, durationYears: 4 },
      { id: "c5", degree: "B.Tech", name: "Electrical & Energy Engineering", intake: 60, durationYears: 4 },
    ],
    photos: [
      {
        type: "campus",
        title: "Maritime Tech Complex & Wind-Powered Solar Array",
        path: "/seed/photos/rit-rann/campus.jpg",
        alt: "Rann Institute coastal campus building with wind turbines and solar architecture"
      },
      {
        type: "classroom",
        title: "Smart Nautical Simulation & Computing Amphitheatre",
        path: "/seed/photos/rit-rann/classroom.jpg",
        alt: "Amphitheatre classroom featuring nautical navigation simulation monitors at Rann Institute"
      },
      {
        type: "lab",
        title: "Hydrodynamics & Marine Propulsion Testing Facility",
        path: "/seed/photos/rit-rann/lab.jpg",
        alt: "Scale water flume channels and marine engine testing instrumentation at Rann Institute"
      }
    ],
    logo: "/seed/logos/rit-rann.svg",
    documents: [
      {
        id: "doc-rit-01",
        type: "approval_letter",
        title: "AICTE Extension of Approval (EoA) 2025-26 [TAMPERED]",
        refNumber: "AICTE/WRO/SYN-2025-014/2025/EOA",
        issueDate: "2025-05-18",
        validUntil: "2026-06-30",
        status: "Tampered",
        tamperDetected: true,
        tamperType: "INTAKE_INFLATION",
        tamperDetails: "Course intake for B.Tech Marine Engineering altered from sanctioned 60 seats to 180 seats in the submitted PDF. Digital hash and QR code validation failed.",
        filePath: "/seed/docs/rit-rann/approval_letter.pdf",
        pages: 2,
        fileSize: "186 KB"
      },
      {
        id: "doc-rit-02",
        type: "affiliation_certificate",
        title: "State Technological University Affiliation Order",
        refNumber: "GTU/AFFIL/2025/GJ-308",
        issueDate: "2025-06-11",
        validUntil: "2026-06-30",
        status: "Verified",
        tamperDetected: false,
        filePath: "/seed/docs/rit-rann/affiliation_certificate.pdf",
        pages: 1,
        fileSize: "174 KB"
      },
      {
        id: "doc-rit-03",
        type: "compliance_report",
        title: "TER Regulatory Fee & Coastal Environmental Clearance",
        refNumber: "COMP/SYN-2025-014/AUDIT-25",
        issueDate: "2025-05-28",
        validUntil: "2026-06-30",
        status: "Verified",
        tamperDetected: false,
        filePath: "/seed/docs/rit-rann/compliance_report.pdf",
        pages: 1,
        fileSize: "181 KB"
      }
    ]
  },
  {
    id: "dpit-deccan",
    permanentId: "SYN-2025-015",
    name: "Deccan Premier Institute of Technology",
    shortName: "DPIT",
    city: "Hyderabad",
    district: "Hyderabad",
    state: "Telangana",
    pincode: "500081",
    establishedYear: 2010,
    legalEntityType: "Deccan Knowledge & Technical Education Society (Fictional)",
    status: "Expired",
    statusReason: "State Technological University Affiliation expired on 30-April-2024 without mandatory renewal for AY 2025-26.",
    trustScore: 44,
    intake: 300,
    facultyCount: 20,
    campusAreaAcres: 8.5,
    builtUpAreaSqm: 13800,
    contactEmail: "principal@dpit-hyderabad.demo-edu.in",
    contactPhone: "+91-40-2391015",
    website: "https://dpit-hyderabad.demo-edu.in",
    address: "Plot 92, Hitech Regulatory Zone, Madhapur, Hyderabad, Telangana - 500081",
    courses: [
      { id: "c1", degree: "B.Tech", name: "Computer Science & Engineering", intake: 120, durationYears: 4 },
      { id: "c2", degree: "B.Tech", name: "Electronics & Communication Engineering", intake: 120, durationYears: 4 },
      { id: "c3", degree: "B.Tech", name: "Information Technology", intake: 60, durationYears: 4 },
    ],
    photos: [
      {
        type: "campus",
        title: "Central Academic Block & Innovation Hub",
        path: "/seed/photos/dpit-deccan/campus.jpg",
        alt: "Modern glass multi-story academic campus of Deccan Premier Institute in Hyderabad"
      },
      {
        type: "classroom",
        title: "Executive Digital Classroom & Seminar Hall",
        path: "/seed/photos/dpit-deccan/classroom.jpg",
        alt: "Corporate styled seminar classroom with ceiling acoustic baffles and dual screen projectors at Deccan Premier"
      },
      {
        type: "lab",
        title: "Advanced Embedded Systems & VLSI Testing Lab",
        path: "/seed/photos/dpit-deccan/lab.jpg",
        alt: "Cleanroom testing tables with FPGA development modules and logic analyzers at Deccan Premier"
      }
    ],
    logo: "/seed/logos/dpit-deccan.svg",
    documents: [
      {
        id: "doc-dpit-01",
        type: "approval_letter",
        title: "AICTE Extension of Approval (EoA) 2025-26",
        refNumber: "AICTE/SCRO/SYN-2025-015/2025/EOA",
        issueDate: "2025-05-15",
        validUntil: "2026-06-30",
        status: "Verified",
        tamperDetected: false,
        filePath: "/seed/docs/dpit-deccan/approval_letter.pdf",
        pages: 2,
        fileSize: "183 KB"
      },
      {
        id: "doc-dpit-02",
        type: "affiliation_certificate",
        title: "State University Affiliation Order [EXPIRED]",
        refNumber: "JNTU/AFFIL/2024/TS-419",
        issueDate: "2023-05-02",
        validUntil: "2024-04-30",
        status: "Expired",
        tamperDetected: true,
        tamperType: "EXPIRED_DATE",
        tamperDetails: "Affiliation certificate expired on 30-Apr-2024 and lacks statutory renewal for academic session 2025-26.",
        filePath: "/seed/docs/dpit-deccan/affiliation_certificate.pdf",
        pages: 1,
        fileSize: "176 KB"
      },
      {
        id: "doc-dpit-03",
        type: "compliance_report",
        title: "TER Regulatory Fee & Life Safety Compliance Clearance",
        refNumber: "COMP/SYN-2025-015/AUDIT-25",
        issueDate: "2025-05-22",
        validUntil: "2026-06-30",
        status: "Verified",
        tamperDetected: false,
        filePath: "/seed/docs/dpit-deccan/compliance_report.pdf",
        pages: 1,
        fileSize: "179 KB"
      }
    ]
  }
];

const newGroundTruth = {
  "kiat-kailash": {
    collegeName: "Kailash Institute of Advanced Technology & AI",
    expectedStatus: "Valid",
    expectedTrustScore: 97,
    anomaliesExpected: [],
    verificationMethod: "DigiLocker & X.509 PKI Signature Match"
  },
  "rit-rann": {
    collegeName: "Rann Institute of Technology & Marine Systems",
    expectedStatus: "Tampered",
    expectedTrustScore: 26,
    anomaliesExpected: [
      {
        documentId: "doc-rit-01",
        documentType: "approval_letter",
        anomalyType: "INTAKE_INFLATION",
        ruleViolated: "APH-2025-RULE-01 (Sanctioned Intake Authenticity)",
        severity: "CRITICAL",
        extractedValue: "B.Tech Marine Engineering Intake = 180 seats",
        expectedValue: "B.Tech Marine Engineering Intake = 60 seats",
        sha256Mismatched: true,
        qrPayloadMismatched: true,
        explanation: "Course intake in the submitted PDF has been manually altered from sanctioned 60 seats to 180 seats. Cryptographic hash check and QR payload validation failed."
      }
    ]
  },
  "dpit-deccan": {
    collegeName: "Deccan Premier Institute of Technology",
    expectedStatus: "Expired",
    expectedTrustScore: 44,
    anomaliesExpected: [
      {
        documentId: "doc-dpit-02",
        documentType: "affiliation_certificate",
        anomalyType: "EXPIRED_DATE",
        ruleViolated: "APH-2025-RULE-02 (Statutory Certificate Validity)",
        severity: "CRITICAL",
        extractedValue: "2024-04-30",
        expectedValue: ">= 2026-06-30",
        explanation: "State University Affiliation Order expired on 30-Apr-2024 and lacks mandatory renewal for academic session 2025-26."
      }
    ]
  }
};

async function main() {
  console.log("Updating institutions.json...");
  const instPaths = [
    path.join(__dirname, "..", "data", "seed", "institutions.json"),
    path.join(__dirname, "..", "frontend", "data", "seed", "institutions.json"),
  ];

  for (const instPath of instPaths) {
    const list = JSON.parse(fs.readFileSync(instPath, "utf-8"));
    newInstitutions.forEach((newInst) => {
      const idx = list.findIndex((c) => c.id === newInst.id);
      if (idx >= 0) {
        list[idx] = newInst;
      } else {
        list.push(newInst);
      }
    });
    fs.writeFileSync(instPath, JSON.stringify(list, null, 2), "utf-8");
    console.log(`✓ Updated ${instPath} (Total Colleges: ${list.length})`);
  }

  console.log("\nUpdating ground_truth.json...");
  const gtPaths = [
    path.join(__dirname, "..", "data", "seed", "ground_truth.json"),
    path.join(__dirname, "..", "frontend", "data", "seed", "ground_truth.json"),
  ];

  for (const gtPath of gtPaths) {
    const gt = JSON.parse(fs.readFileSync(gtPath, "utf-8"));
    gt.totalColleges = 15;
    gt.totalDocuments = 45;
    gt.summary.validColleges = 7;
    gt.summary.expiredColleges = 3;
    gt.summary.tamperedColleges = 3;
    gt.summary.missingFieldsColleges = 2;

    for (const [colId, colGt] of Object.entries(newGroundTruth)) {
      gt.colleges[colId] = colGt;
    }

    fs.writeFileSync(gtPath, JSON.stringify(gt, null, 2), "utf-8");
    console.log(`✓ Updated ${gtPath} (Total Colleges: ${gt.totalColleges})`);
  }

  console.log("\nGenerating PDF documents for new institutions...");
  await generateAllPdfs(newInstitutions);
  console.log("\nSUCCESS: All new fake colleges and fake documents generated successfully!");
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
