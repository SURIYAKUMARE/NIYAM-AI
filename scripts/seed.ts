import fs from "fs";
import path from "path";
import crypto from "crypto";
import { DatabaseSync } from "node:sqlite";

interface Course {
  id: string;
  degree: string;
  name: string;
  intake: number;
  durationYears: number;
}

interface DocumentItem {
  id: string;
  type: string;
  title: string;
  refNumber: string;
  issueDate: string;
  validUntil: string;
  status: string;
  tamperDetected?: boolean;
  tamperType?: string;
  tamperDetails?: string;
  filePath: string;
}

interface InstitutionData {
  id: string;
  permanentId: string;
  name: string;
  shortName: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
  establishedYear: number;
  legalEntityType: string;
  status: "Valid" | "Expired" | "Tampered" | "Missing Fields";
  statusReason: string;
  trustScore: number;
  intake: number;
  facultyCount: number;
  campusAreaAcres: number;
  builtUpAreaSqm: number;
  contactEmail: string;
  contactPhone: string;
  website: string;
  address: string;
  courses: Course[];
  documents: DocumentItem[];
}

function calculateSha256(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    return crypto.createHash("sha256").update(filePath).digest("hex");
  }
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export function seedInstitutionsDatabase(): void {
  console.log("===============================================================================");
  console.log("   SEEDING 12 SYNTHETIC INSTITUTIONS, DOCUMENTS & BENCHMARK DATASET           ");
  console.log("===============================================================================");

  const dbPath = path.join(process.cwd(), "aicte_verify.db");
  const jsonPath = path.join(process.cwd(), "data", "seed", "institutions.json");
  const groundTruthPath = path.join(process.cwd(), "data", "seed", "ground_truth.json");

  if (!fs.existsSync(jsonPath)) {
    throw new Error(`Seed file not found: ${jsonPath}`);
  }

  const rawData = fs.readFileSync(jsonPath, "utf-8");
  const institutions: InstitutionData[] = JSON.parse(rawData);

  let groundTruth: any = {};
  if (fs.existsSync(groundTruthPath)) {
    groundTruth = JSON.parse(fs.readFileSync(groundTruthPath, "utf-8"));
  }

  const db = new DatabaseSync(dbPath);

  // Helper prepared statements
  const findInstStmt = db.prepare("SELECT id FROM institutions WHERE aicte_permanent_id = ?");
  const insertInstStmt = db.prepare(`
    INSERT INTO institutions (
      aicte_permanent_id, name, legal_entity_type, state, district, pin_code,
      contact_email, contact_phone, established_year, accreditation_grade,
      has_prior_deficiencies, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  const updateInstStmt = db.prepare(`
    UPDATE institutions SET
      name = ?, legal_entity_type = ?, state = ?, district = ?, pin_code = ?,
      contact_email = ?, contact_phone = ?, established_year = ?,
      has_prior_deficiencies = ?
    WHERE aicte_permanent_id = ?
  `);

  const findAppStmt = db.prepare("SELECT id FROM applications WHERE application_number = ?");
  const insertAppStmt = db.prepare(`
    INSERT INTO applications (
      application_number, institution_id, category_code, academic_year, status,
      submission_date, rule_set_version, approved_programmes, ter_payment_status,
      ter_transaction_ref, overall_risk_score, assigned_officer_id, notes,
      created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, ?, ?, 2, ?, datetime('now'), datetime('now'))
  `);

  const updateAppStmt = db.prepare(`
    UPDATE applications SET
      status = ?, overall_risk_score = ?, approved_programmes = ?, notes = ?, updated_at = datetime('now')
    WHERE id = ?
  `);

  const findDocStmt = db.prepare("SELECT id FROM documents WHERE application_id = ? AND checklist_item_code = ?");
  const insertDocStmt = db.prepare(`
    INSERT INTO documents (
      application_id, checklist_item_code, title, document_type, is_mandatory,
      status, current_version_id, created_at
    ) VALUES (?, ?, ?, ?, 1, ?, NULL, datetime('now'))
  `);

  const updateDocVersionRefStmt = db.prepare(`
    UPDATE documents SET current_version_id = ?, status = ? WHERE id = ?
  `);

  const insertDocVersionStmt = db.prepare(`
    INSERT INTO document_versions (
      document_id, version_number, file_name, file_size, mime_type, sha256_hash,
      storage_path, uploaded_by_user_id, uploaded_at, is_duplicate_detected,
      metadata_json, malware_scan_status, scan_engine
    ) VALUES (?, 1, ?, ?, 'application/pdf', ?, ?, 1, datetime('now'), ?, ?, 'CLEAN', 'Heuristic Signature Engine v2.4')
  `);

  const findValRunStmt = db.prepare("SELECT id FROM validation_runs WHERE application_id = ?");
  const insertValRunStmt = db.prepare(`
    INSERT INTO validation_runs (
      application_id, rule_set_version, triggered_by_user_id, total_rules_evaluated,
      findings_count, status, summary, run_at
    ) VALUES (?, 'v2025.1', 1, 14, ?, ?, ?, datetime('now'))
  `);

  const findFindingStmt = db.prepare("SELECT id FROM findings WHERE application_id = ? AND rule_code = ?");
  const insertFindingStmt = db.prepare(`
    INSERT INTO findings (
      validation_run_id, application_id, document_version_id, rule_code, category,
      severity, explanation, expected_value, observed_value, rule_citation,
      page_number, bounding_box, excerpt, detection_method, confidence_score,
      status, officer_notes, reviewed_by_user_id, reviewed_at, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, '{\"x\":120,\"y\":240,\"w\":400,\"h\":80}', ?, 'DETERMINISTIC_RULES', 0.98, 'OPEN', NULL, NULL, NULL, datetime('now'))
  `);

  let seededCount = 0;

  for (const inst of institutions) {
    // 1. Institution
    const existingInst = findInstStmt.get(inst.permanentId) as { id: number } | undefined;
    let instId: number;

    const hasDeficiencies = inst.status !== "Valid";
    const accGrade = inst.status === "Valid" ? "NAAC A+" : "NAAC B+ (Renewal)";

    if (existingInst) {
      instId = existingInst.id;
      updateInstStmt.run(
        inst.name,
        inst.legalEntityType,
        inst.state,
        inst.district,
        inst.pincode,
        inst.contactEmail,
        inst.contactPhone,
        inst.establishedYear,
        hasDeficiencies ? 1 : 0,
        inst.permanentId
      );
    } else {
      const res = insertInstStmt.run(
        inst.permanentId,
        inst.name,
        inst.legalEntityType,
        inst.state,
        inst.district,
        inst.pincode,
        inst.contactEmail,
        inst.contactPhone,
        inst.establishedYear,
        accGrade,
        hasDeficiencies ? 1 : 0
      );
      instId = Number(res.lastInsertRowid);
    }

    // 2. Application
    const appNumber = `AICTE-2025-APP-${inst.permanentId.replace("SYN-2025-", "10")}`;
    const riskScore = Math.max(2, 100 - inst.trustScore);

    let appStatus = "PRELIMINARY_CHECK_PASSED";
    if (inst.status === "Valid") {
      appStatus = "RECOMMENDED_FOR_APPROVAL";
    } else {
      appStatus = "DEFICIENCIES_DETECTED";
    }

    const approvedProgrammesJson = JSON.stringify(inst.courses);
    const existingApp = findAppStmt.get(appNumber) as { id: number } | undefined;
    let appId: number;

    if (existingApp) {
      appId = existingApp.id;
      updateAppStmt.run(appStatus, riskScore, approvedProgrammesJson, inst.statusReason, appId);
    } else {
      const res = insertAppStmt.run(
        appNumber,
        instId,
        "EXTENSION_OF_APPROVAL",
        "2025-26",
        appStatus,
        "v2025.1",
        approvedProgrammesJson,
        inst.status === "Missing Fields" && inst.id === "sec-satpura" ? "PENDING" : "PAID",
        inst.status === "Missing Fields" && inst.id === "sec-satpura" ? null : "BHRTK-2025-99214",
        riskScore,
        inst.statusReason
      );
      appId = Number(res.lastInsertRowid);
    }

    // 3. Documents & Versions
    for (const doc of inst.documents) {
      let checklistCode = "DOC-EOA";
      if (doc.type === "affiliation_certificate") checklistCode = "DOC-AFFILIATION";
      if (doc.type === "compliance_report") checklistCode = "DOC-TER-RECEIPT";

      const existingDoc = findDocStmt.get(appId, checklistCode) as { id: number } | undefined;
      let docId: number;

      let docStatus = "VALIDATED";
      if (doc.status === "Expired") docStatus = "DEFICIENT";
      if (doc.status === "Tampered") docStatus = "DEFICIENT";
      if (doc.status === "Missing Fields") docStatus = "DEFICIENT";

      if (existingDoc) {
        docId = existingDoc.id;
      } else {
        const res = insertDocStmt.run(appId, checklistCode, doc.title, doc.type, docStatus);
        docId = Number(res.lastInsertRowid);
      }

      // Check physical PDF on disk to calculate real size & hash
      const pdfDiskPath = path.join(process.cwd(), "frontend", "public", "seed", "docs", inst.id, `${doc.type}.pdf`);
      let fileSize = 14200;
      let shaHash = calculateSha256(pdfDiskPath);
      if (fs.existsSync(pdfDiskPath)) {
        fileSize = fs.statSync(pdfDiskPath).size;
      }

      const metaJson = JSON.stringify({
        docId: doc.id,
        refNumber: doc.refNumber,
        issueDate: doc.issueDate,
        validUntil: doc.validUntil,
        status: doc.status,
        tamperDetected: doc.tamperDetected || false,
        tamperType: doc.tamperType || null,
        tamperDetails: doc.tamperDetails || null,
      });

      const isDuplicate = inst.id === "zec-zaskar" && doc.type === "approval_letter" ? 1 : 0;

      const verRes = insertDocVersionStmt.run(
        docId,
        `${doc.type}.pdf`,
        fileSize,
        shaHash,
        `/seed/docs/${inst.id}/${doc.type}.pdf`,
        isDuplicate,
        metaJson
      );
      const versionId = Number(verRes.lastInsertRowid);

      updateDocVersionRefStmt.run(versionId, docStatus, docId);

      // 4. Ground Truth Findings Insertion
      const collegeGroundTruth = groundTruth.colleges?.[inst.id];
      if (collegeGroundTruth && collegeGroundTruth.anomaliesExpected) {
        let existingValRun = findValRunStmt.get(appId) as { id: number } | undefined;
        let valRunId: number;
        if (existingValRun) {
          valRunId = existingValRun.id;
        } else {
          const runRes = insertValRunStmt.run(
            appId,
            collegeGroundTruth.anomaliesExpected.length,
            inst.status === "Valid" ? "COMPLIANT" : "DEFICIENCIES_DETECTED",
            inst.statusReason
          );
          valRunId = Number(runRes.lastInsertRowid);
        }

        for (const anomaly of collegeGroundTruth.anomaliesExpected) {
          if (anomaly.documentType === doc.type) {
            const existingFinding = findFindingStmt.get(appId, anomaly.ruleViolated) as { id: number } | undefined;
            if (!existingFinding) {
              insertFindingStmt.run(
                valRunId,
                appId,
                versionId,
                anomaly.ruleViolated,
                "REGULATORY_COMPLIANCE",
                anomaly.severity,
                anomaly.explanation,
                anomaly.expectedValue || "Valid & In-Force",
                anomaly.extractedValue || "Discrepancy Detected",
                "APH 2025-26 Norms",
                `Document Reference: ${doc.refNumber}`
              );
            }
          }
        }
      }
    }

    seededCount++;
    console.log(`  ✓ Seeded [${inst.status.padEnd(14)}] ${inst.permanentId} · ${inst.name} (${inst.city}, ${inst.state})`);
  }

  console.log("===============================================================================");
  console.log(`   SUCCESS: ${seededCount}/12 COLLEGES AND DOSSIERS SEEDED INTO SQLITE DATABASE`);
  console.log("===============================================================================\n");
}

// Execute directly
try {
  seedInstitutionsDatabase();
} catch (err: any) {
  console.error("Database seed failed:", err);
  process.exit(1);
}
