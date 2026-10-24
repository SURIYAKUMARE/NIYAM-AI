# NIYAM — External Authority Integration Inventory & Baseline Audit
**AICTE Problem Statement ID:** 26261  
**Classification:** `v1.0.0-PROTOTYPE` Technical Disclosure  
**Audit Date:** October 24, 2026  

---

## 1. Integration Inventory Matrix

This document provides a transparent, auditable inventory of all external authority verification connectors implemented within the NIYAM platform. In compliance with the verification mandate, each connector's operational mode is categorized into one of six mutually exclusive states:

* **`TEST_FIXTURE`**: Hard-coded mock used exclusively in isolated unit tests.
* **`SIMULATED_DEMO`**: Realistic demonstration adapter executing realistic latency, schema-compliant payloads, and deterministic success/mismatch/outage scenarios.
* **`IMPLEMENTED_UNCONFIGURED`**: Code implementation exists for live API communication, but live external credentials or environment variables are not provisioned.
* **`AUTHORIZED_TEST`**: Connected to an official staging or sandbox government portal with active test credentials.
* **`LIVE_VERIFIED`**: Actively transacting with live production sovereign registries under statutory agreement.
* **`SOURCE_UNAVAILABLE`**: Connector simulated or observed to experience downstream downtime; platform gracefully records non-adverse status.

---

## 2. Comprehensive Authority Provider Registry

### 2.1 DigiLocker National Document Exchange
* **Issuing Authority:** Ministry of Electronics and Information Technology (MeitY), Government of India.
* **Statutory Role:** Primary repository for official digital educational credentials, university NOCs, and municipal certificates under the Information Technology (Preservation and Retention of Information by Intermediaries Providing Digital Locker Facilities) Rules, 2016.
* **Official Specification Reference:**  
  * DigiLocker API Specification v2.0 (Pull URI & DocType Exchange Architecture).
  * URL: `https://partners.digitallocker.gov.in/public/oauth2/1/token`
* **Authentication Scheme:**  
  * OAuth 2.0 with PKCE (RFC 7636).
  * API Gateway Client ID, Client Secret, and Hashed Requester Consent PIN.
* **Current Operational State:** `SIMULATED_DEMO`
* **Implementation Adapter:** [`backend/app/services/adapters/digilocker_adapter.py`](file:///backend/app/services/adapters/digilocker_adapter.py)
* **Demonstrated Behavior:**  
  * Simulates realistic network round-trip ($280\text{--}650\text{ ms}$).
  * Resolves institutional permanent IDs (`1-492048123`) to verified metadata.
  * In Scenario 4, accurately produces `SOURCE_UNAVAILABLE` when simulate_outage flag is tripped, preventing adverse scoring against the institution.
* **Prerequisites for Production Live Activation:**
  1. Statutory Memorandum of Understanding (MoU) between AICTE and National e-Governance Division (NeGD).
  2. Whitelisting of AICTE static gateway egress IP blocks (`/29`).
  3. Procurement of MeitY Production Client ID and X.509 Partner Signing Certificate.

---

### 2.2 University Affiliation Verification Network
* **Issuing Authority:** State Affiliating Technical Universities (e.g., Anna University, VTU, Mumbai University, AKTU).
* **Statutory Role:** Confirms validity of annual provisional affiliation, approved degree programmes, and sanctioned seat intake per academic year.
* **Official Specification Reference:**  
  * AICTE-University Standard Affiliation API Protocol v1.4 (JSON-LD over HTTPS).
* **Authentication Scheme:**  
  * Mutual TLS (mTLS) with Bearer JWT tokens issued by state university examination & registrar servers.
* **Current Operational State:** `SIMULATED_DEMO`
* **Implementation Adapter:** [`backend/app/services/adapters/university_adapter.py`](file:///backend/app/services/adapters/university_adapter.py)
* **Demonstrated Behavior:**  
  * Validates affiliation order numbers, approved course lists (e.g., B.Tech Computer Science, Mechanical, Electronics), and intake counts against application declarations.
  * Detects seat mismatch discrepancies (Scenario 2: declared 180 seats vs university sanction of 120 seats), triggering `MISMATCH_DETECTED` finding.
* **Prerequisites for Production Live Activation:**
  1. Integration with individual State Technical University registrar databases via National Academic Depository (NAD) / Digilocker.
  2. Exchange of trusted university public key certificates (`.crt`).

---

### 2.3 State Land Revenue Information System
* **Issuing Authority:** State Government Inspector General of Registration (IGR) & Department of Land Records.
* **Statutory Role:** Verifies registered title ownership deeds, non-encumbrance status, surveyed land area in acres, and contiguous parcel demarcation for technical education campuses (APH Chapter II, Clause 5.1).
* **Official Specification Reference:**  
  * National Generic Document Registration System (NGDRS) / State Bhoomi / Mahabhulekh API v2.
* **Authentication Scheme:**  
  * HMAC-SHA256 Signed Request Headers with State Department API Tokens.
* **Current Operational State:** `SIMULATED_DEMO`
* **Implementation Adapter:** [`backend/app/services/adapters/land_revenue_adapter.py`](file:///backend/app/services/adapters/land_revenue_adapter.py)
* **Demonstrated Behavior:**  
  * Extracts survey numbers (e.g., `Survey #142/A, 142/B`) and title holder names.
  * Compares declared land area (e.g., 7.5 Acres) against registry records (5.0 Acres in Scenario 5), generating `MISMATCH_DETECTED` with bounding box coordinates.
* **Prerequisites for Production Live Activation:**
  1. State-level API agreements with individual State Revenue Departments.
  2. Integration with GIS cadastral map layers for automated contiguous parcel geometric boundary validation.

---

### 2.4 Bharatkosh Non-Tax Receipt Portal (NTRP)
* **Issuing Authority:** Controller General of Accounts, Ministry of Finance, Government of India.
* **Statutory Role:** Reconciles electronic technical education regulatory (TER) application processing charges deposited into the Consolidated Fund of India (APH Chapter I, Clause 1.6).
* **Official Specification Reference:**  
  * Bharatkosh NTRP Payment Gateway Integration Manual v3.2.
  * Protocol: AES-128-CBC Encrypted Parameter Exchange with SHA-256 Checksum.
* **Authentication Scheme:**  
  * Merchant Code, Sub-Merchant Key, and SHA-256 Hash Chaining.
* **Current Operational State:** `SIMULATED_DEMO`
* **Implementation Adapter:** [`backend/app/services/adapters/bharatkosh_adapter.py`](file:///backend/app/services/adapters/bharatkosh_adapter.py)
* **Demonstrated Behavior:**  
  * Verifies challan transaction reference (`BK-2025-789210`), amount paid ($\text{INR } 1,50,000$), and settlement status (`SETTLED`).
  * In Scenario 7 (unsettled payment), highlights pending regulatory fee discrepancy, blocking irreversible statutory approval.
* **Prerequisites for Production Live Activation:**
  1. AICTE DDO (Drawing and Disbursing Officer) Merchant Terminal Registration on Bharatkosh portal.
  2. AES-128-CBC production cryptographic keys installed in secure Hardware Security Module (HSM) or cloud secret manager.

---

### 2.5 Public Key / QR Code Digital Signature Verification Service
* **Issuing Authority:** Licensed Certifying Authorities (CCA India) under the Information Technology Act 2000 (Section 3).
* **Statutory Role:** Validates cryptographic digital signatures embedded inside official PDF documents (e.g., municipal approvals, fire safety clearances) and secure 2D QR bar codes.
* **Official Specification Reference:**  
  * Adobe PDF Digital Signature Standard (ISO 32000-1 / PAdES-LTV).
  * RFC 5280 (X.509 Public Key Infrastructure Certificate and CRL Profile).
* **Authentication Scheme:**  
  * Public Key Cryptography (RSA-2048 / ECDSA P-256) with Online Certificate Status Protocol (OCSP) revocation checking.
* **Current Operational State:** `IMPLEMENTED_UNCONFIGURED` (Local Fallback Parser)
* **Implementation Adapter:** [`backend/app/services/adapters/qr_signature_adapter.py`](file:///backend/app/services/adapters/qr_signature_adapter.py)
* **Demonstrated Behavior:**  
  * Discloses that plain QR text extraction is **insufficient for legal authentication**.
  * Checks for attached digital signature signatures and trust anchor validity.
  * If the certificate issuer is not in the trusted CCA root keystore, returns `MANUAL_REVIEW_REQUIRED`, prompting the scrutiny officer to conduct physical verification.
* **Prerequisites for Production Live Activation:**
  1. Installation of India CCA Root Certificate Keystore (`CCA India 2014 Root.cer` and `CCA India 2022 Root.cer`).
  2. Periodic OCSP cache synchronization for real-time certificate revocation checking.

---

## 3. Connector Error Handling & Fallback Strategy

The following truth table defines the application's deterministic response to external integration conditions:

| Connector Condition | Response Status | Regulatory Implication | Adverse Finding Generated? |
| :--- | :--- | :--- | :---: |
| **All fields match authorized registry** | `VERIFIED` | Document authentication completed | **NO** |
| **Field discrepancy detected (e.g. seats, area)** | `MISMATCH_DETECTED` | Officer scrutiny required; institution notified | **YES** |
| **Downstream government portal timed out / down** | `SOURCE_UNAVAILABLE` | Non-adverse; queued for automated retry | **NO** |
| **Unsigned or untrusted QR code payload** | `MANUAL_REVIEW_REQUIRED`| Officer prompted for manual physical verification | **ADVISORY** |
| **Document expired according to authorized registry**| `EXPIRED` | Deficiency notice issued for renewal | **YES** |

---
*Certified by Engineering Lead & Independent Release-Verification Team.*
