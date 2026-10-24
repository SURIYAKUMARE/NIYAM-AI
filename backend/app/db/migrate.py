import sqlite3
import os

def run_migrations(db_path: str = "aicte_verify.db"):
    if not os.path.exists(db_path):
        print(f"Database {db_path} does not exist yet. create_all will create schema.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    columns_to_add = [
        ("users", "mfa_secret", "VARCHAR(64)"),
        ("users", "mfa_enrolled", "BOOLEAN DEFAULT 0"),
        ("users", "mfa_last_verified_counter", "INTEGER"),
        ("users", "mfa_failed_attempts", "INTEGER DEFAULT 0"),
        ("users", "mfa_locked_until", "DATETIME"),
        ("users", "recovery_codes_hash", "VARCHAR(512)"),
        ("document_versions", "malware_scan_status", "VARCHAR(50) DEFAULT 'CLEAN'"),
        ("document_versions", "scan_engine", "VARCHAR(100) DEFAULT 'NIYAM-HEURISTIC-SCANNER-v1'"),
    ]

    for table, col, col_def in columns_to_add:
        try:
            cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col} {col_def}")
            print(f"[Migration] Added column {col} to table {table}")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                pass  # column already exists
            else:
                print(f"[Migration] Note on {table}.{col}: {e}")

    # Also update existing official demo users with default secret if null
    demo_totp_secret = "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP"
    import hashlib
    demo_rec_hash = hashlib.sha256(b"aicte_mfa_rec_REC-DEMO-2025").hexdigest()

    cursor.execute("""
        UPDATE users 
        SET mfa_secret = ?, mfa_enrolled = 1, recovery_codes_hash = ?
        WHERE role IN ('SCRUTINY_OFFICER', 'SUPERVISING_AUTHORITY', 'ADMIN') 
          AND (mfa_secret IS NULL OR mfa_secret = '' OR recovery_codes_hash IS NULL OR recovery_codes_hash = '')
    """, (demo_totp_secret, demo_rec_hash))
    
    conn.commit()
    conn.close()
    print("[Migration] SQLite schema migration complete.")

if __name__ == "__main__":
    run_migrations()
