# NIYAM — Deployment, Backup Restoration & Disaster Recovery Guide

---

## 1. Local Development Quickstart

### Prerequisites
- Python 3.11+ (Python 3.13 supported)
- Node.js 18+ (Node.js 20 or 24 LTS recommended)
- Git

### One-Click Native Startup (Windows)
Double-click [`run_all.bat`](run_all.bat) or run from PowerShell:
```powershell
.\run_all.ps1
```
- **Backend API:** `http://localhost:8000` (Swagger UI: `http://localhost:8000/docs`)
- **Frontend Portal:** `http://localhost:3000`

### Manual Startup
1. **Backend:**
   ```bash
   pip install -r backend/requirements.txt
   python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
2. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 2. Containerized Deployment (Docker Compose)

The repository provides production-ready container configurations:
- [`Dockerfile.backend`](Dockerfile.backend) (FastAPI + Python 3.11-slim)
- [`frontend/Dockerfile`](frontend/Dockerfile) (Next.js multi-stage build)
- [`docker-compose.yml`](docker-compose.yml) (PostgreSQL 15, Redis, Backend, Frontend)

### Run Container Stack
```bash
docker compose up --build -d
```

### Health Checks
- Backend Health: `curl http://localhost:8000/health`
- Database Connectivity: verified automatically via SQLAlchemy connection pool.

---

## 3. Backup & Tested Restoration Procedures

Niyam includes a native backup and integrity restoration utility in [`backend/app/services/backup_service.py`](backend/app/services/backup_service.py).

### Create a System Backup
Creates a compressed archive containing the database (`aicte_verify.db`) and document uploads (`/uploads`), generating a cryptographic SHA-256 manifest hash:
```python
from backend.app.services.backup_service import create_system_backup
backup_info = create_system_backup("backups")
print(f"Created: {backup_info['archive_path']}, Hash: {backup_info['archive_hash']}")
```

### Restore from Backup Archive
Extracts archive and validates that every file checksum matches pre-backup integrity:
```python
from backend.app.services.backup_service import restore_system_backup
restore_info = restore_system_backup("backups/niyam_backup_20261024_072300.tar.gz", "restore_target")
print(f"Restored: {restore_info['status']}")
```

---

## 4. Disaster Recovery & Rollback Plan

1. **Database Corruption / Schema Rollback:**
   - Terminate active web processes.
   - Restore the latest verified backup tarball using `restore_system_backup()`.
   - Verify SHA-256 block chain integrity via `GET /api/v1/audit/verify-chain`.
2. **Credential Rotation:**
   - Rotate `JWT_SECRET_KEY` in `.env`.
   - All active sessions are invalidated immediately upon next API request.
3. **External Connector Fallback:**
   - In case of external provider degradation (e.g. DigiLocker or State Land Revenue outage), circuit breakers route requests to `SOURCE_UNAVAILABLE`.
   - Officers execute manual evidence confirmation with mandatory physical evidence references.
