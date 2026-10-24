# NIYAM — Deployment, Disaster Recovery, and Operational Runbook
**AICTE Problem Statement ID:** 26261  
**Classification:** `v1.0.0-PROTOTYPE` Standard Operating Procedure  
**Document Revision:** 2.1  
**Date:** October 24, 2026  

---

## 1. System Architecture Overview

NIYAM (*National Institutional Yield & Approval Management*) operates as a decoupled, multi-tier web application built on modern web and security standards:

```
+-------------------------------------------------------------+
|                      Client Browser                         |
|   (Desktop 1920x1080 / Mobile iPhone SE 375x667 Viewports)  |
+------------------------------+------------------------------+
                               | HTTPS / WSS
                               v
+-------------------------------------------------------------+
|                Frontend Presentation Tier                   |
|   Next.js 14 (App Router) + React 18 + Tailwind CSS         |
|   Port: 3000 (Internal) / Vercel Edge Serverless            |
+------------------------------+------------------------------+
                               | REST API (JSON / Multipart)
                               v
+-------------------------------------------------------------+
|                 Backend Application Tier                    |
|   FastAPI + Python 3.13 + Uvicorn + SQLAlchemy ORM          |
|   Port: 8000 | Lifespan Migration Engine                   |
+---------------+--------------+---------------+--------------+
                |              |               |
                v              v               v
        +---------------+ +------------+ +--------------------+
        |  SQLite DB    | | Storage    | | Operational        |
        |  (18 Tables)  | | Local Disk | | Malware Quarantine |
        | aicte_verify  | | /uploads/  | | uploads/quarantine |
        +---------------+ +------------+ +--------------------+
```

---

## 2. Environment Variables & Configuration

Create a `.env` file in the project root or configure environment variables in your deployment orchestrator:

```ini
# --- Core Application Settings ---
PROJECT_NAME="NIYAM — Institutional Application Review Platform"
API_V1_STR="/api/v1"
ENVIRONMENT="production"  # or 'development'

# --- Security & JWT Cryptography ---
SECRET_KEY="aicte_regulatory_super_secret_production_key_2026_change_in_prod"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# --- Audit Ledger Tamper-Evident Hashing Key ---
AUDIT_LOG_TAMPER_KEY="aicte_tamper_key_secure_hash_chain_2026"

# --- Database Storage ---
# For SQLite (default prototype):
DATABASE_URL="sqlite:///./aicte_verify.db"
# For Enterprise PostgreSQL:
# DATABASE_URL="postgresql://aicte_user:secure_pwd@postgres-db.internal:5432/niyam_db"

# --- Document Storage & Quarantine Paths ---
UPLOAD_DIR="uploads"
QUARANTINE_DIR="uploads/quarantine"

# --- Frontend API Connectivity ---
# In development:
NEXT_PUBLIC_API_URL="http://127.0.0.1:8000"
# In production / Vercel:
# NEXT_PUBLIC_API_URL="https://niyam-ai.vercel.app"
```

---

## 3. Native Deployment Guide (Windows, macOS, Linux)

### Step 1: Clone Repository
```bash
git clone https://github.com/SURIYAKUMARE/NIYAM-AI.git
cd NIYAM-AI
```

### Step 2: Backend Setup (FastAPI & Python 3.13)
```bash
# 1. Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

# 2. Install backend dependencies
pip install -r backend/requirements.txt

# 3. Execute database schema migration and demo seed
python -m backend.app.db.migrate
python -c "from backend.app.core.database import SessionLocal; from backend.app.data.seed_data import seed_database; db = SessionLocal(); seed_database(db); db.close(); print('Database ready.')"

# 4. Start backend server
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Step 3: Frontend Setup (Next.js 14)
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Typecheck codebase
npx tsc --noEmit

# 4. Build production bundle
npm run build

# 5. Start Next.js production server
npm run start -- -p 3000
```
Application is now live at: `http://localhost:3000` (API documentation at `http://localhost:8000/docs`).

---

## 4. Docker Compose Containerized Deployment

A multi-container setup running backend, frontend, and persistent volumes:

### `docker-compose.yml`
```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite:////app/data/aicte_verify.db
      - UPLOAD_DIR=/app/uploads
      - SECRET_KEY=aicte_containerized_secret_2026
    volumes:
      - niyam_data:/app/data
      - niyam_uploads:/app/uploads
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/docs"]
      interval: 15s
      timeout: 5s
      retries: 3

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:8000
    depends_on:
      backend:
        condition: service_healthy
    restart: always

volumes:
  niyam_data:
  niyam_uploads:
```

### Start Container Cluster
```bash
docker-compose up -d --build
```

---

## 5. Tested Disaster Recovery & Backup Walkthrough

The platform includes automated, tamper-evident disaster recovery tools in `backend/app/services/backup_service.py`.

### 5.1 Creating a Verified System Backup
Execute the backup command:
```bash
python -c "from backend.app.services.backup_service import create_system_backup; meta = create_system_backup('backups'); print('Created backup:', meta['archive_name'], 'SHA256:', meta['archive_hash'])"
```
* **Output:** Creates `backups/niyam_backup_YYYYMMDD_HHMMSS.tar.gz`.
* **Security Control:** Infected files in `uploads/quarantine/` are automatically excluded from the backup archive.
* **Integrity Guarantee:** A SHA-256 hash is computed for the archive.

### 5.2 Verifying Archive Hash
```bash
# Windows PowerShell:
Get-FileHash -Path backups/niyam_backup_*.tar.gz -Algorithm SHA256

# Linux / macOS:
sha256sum backups/niyam_backup_*.tar.gz
```

### 5.3 Executing Full Restoration to a Target Directory
```bash
python -c "
from backend.app.services.backup_service import restore_system_backup
import glob

latest_backup = sorted(glob.glob('backups/niyam_backup_*.tar.gz'))[-1]
restore_meta = restore_system_backup(latest_backup, 'restored_production')
print('Restoration Status:', restore_meta['status'])
print('Verified Archive SHA-256:', restore_meta['verified_hash'])
"
```

### 5.4 Validating Restored Database Records
```bash
python -c "
import sqlite3
conn = sqlite3.connect('restored_production/aicte_verify.db')
c = conn.cursor()
c.execute('SELECT count(*) FROM users')
print('Users recovered:', c.fetchone()[0])
c.execute('SELECT count(*) FROM applications')
print('Applications recovered:', c.fetchone()[0])
c.execute('SELECT count(*) FROM audit_logs')
print('Audit ledger entries recovered:', c.fetchone()[0])
conn.close()
"
```
* **Verification Result:** Fully verified in automated regression test `test_acceptance_16`.

---

## 6. Default Demonstration Accounts & Personas

For evaluators and regulatory review teams, the following accounts are pre-seeded:

| Persona / Role | Username | Password | Multi-Factor Authentication (MFA) | Default TOTP Secret | Emergency Recovery Code |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **Institution Applicant** | `applicant` | `password123` | *Disabled for applicant* | N/A | N/A |
| **Scrutiny Officer** | `officer` | `password123` | **Server-Enforced TOTP** | `JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP` | `REC-DEMO-2025` |
| **Supervising Authority** | `authority` | `password123` | **Server-Enforced TOTP** | `JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP` | `REC-DEMO-2025` |
| **System Administrator** | `admin` | `password123` | **Server-Enforced TOTP** | `JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP` | `REC-DEMO-2025` |
| **Statutory Auditor** | `auditor` | `password123` | *Read-only session* | N/A | N/A |

> **Evaluator Tip:**  
> When logging in as `officer`, `authority`, or `admin`, enter `password123`. The system prompts for a 6-digit TOTP code. Evaluators may use any standard authenticator app (e.g. Google Authenticator) configured with the secret `JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP`, or enter the single-use recovery code `REC-DEMO-2025`.

---

## 7. Operational Health Checks & Monitoring

1. **API Endpoint Health Check:**
   ```bash
   curl -I http://127.0.0.1:8000/docs
   ```
2. **Database & Demo User Readiness:**
   ```bash
   curl -s http://127.0.0.1:8000/api/v1/auth/demo-accounts | grep applicant
   ```
3. **Cryptographic Audit Ledger Inspection:**
   ```bash
   curl -s -H "Authorization: Bearer <OFFICER_TOKEN>" http://127.0.0.1:8000/api/v1/audit
   ```
4. **Malware Quarantine Repository Inspection:**
   ```bash
   ls -la uploads/quarantine/
   ```

---
*Certified by Engineering Lead & Independent Release-Verification Team.*
