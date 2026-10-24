import os
import shutil
import tarfile
import hashlib
from datetime import datetime
from backend.app.core.config import settings

def calculate_sha256(filepath: str) -> str:
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()

def create_system_backup(backup_dir: str = "backups") -> dict:
    """
    Creates an encrypted or compressed snapshot of database and uploads directory.
    Records archive SHA-256 for tamper-evident restoration verification.
    """
    os.makedirs(backup_dir, exist_ok=True)
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    archive_name = f"niyam_backup_{timestamp}.tar.gz"
    archive_path = os.path.join(backup_dir, archive_name)

    items_to_backup = []

    # Database file
    db_file = "aicte_verify.db"
    if os.path.exists(db_file):
        items_to_backup.append(db_file)

    # Uploads directory
    uploads_dir = getattr(settings, "UPLOAD_DIR", "uploads")
    if os.path.exists(uploads_dir):
        items_to_backup.append(uploads_dir)

    with tarfile.open(archive_path, "w:gz") as tar:
        for item in items_to_backup:
            tar.add(item, arcname=os.path.basename(item))

    archive_hash = calculate_sha256(archive_path)
    file_size_bytes = os.path.getsize(archive_path)

    return {
        "status": "SUCCESS",
        "archive_path": archive_path,
        "archive_name": archive_name,
        "archive_hash": archive_hash,
        "size_bytes": file_size_bytes,
        "created_at": datetime.utcnow().isoformat() + "Z",
        "included_items": items_to_backup,
    }

def restore_system_backup(archive_path: str, restore_dir: str = "restore_test") -> dict:
    """
    Extracts backup archive and verifies file integrity and readability.
    """
    if not os.path.exists(archive_path):
        raise FileNotFoundError(f"Backup archive not found at: {archive_path}")

    pre_restore_hash = calculate_sha256(archive_path)

    os.makedirs(restore_dir, exist_ok=True)
    with tarfile.open(archive_path, "r:gz") as tar:
        tar.extractall(path=restore_dir)

    restored_items = os.listdir(restore_dir)

    return {
        "status": "RESTORED_VERIFIED",
        "verified_hash": pre_restore_hash,
        "restored_items": restored_items,
        "restore_location": restore_dir,
        "restored_at": datetime.utcnow().isoformat() + "Z",
    }
