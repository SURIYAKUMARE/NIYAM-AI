import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Niyam — Institutional Application Review Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "niyam_super_secret_jwt_key_2025_safe_token_dev")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours for demo ease
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./aicte_verify.db")
    
    # Document storage
    UPLOAD_DIR: str = os.path.abspath(os.getenv("UPLOAD_DIR", "./uploads"))
    MAX_FILE_SIZE_BYTES: int = 25 * 1024 * 1024  # 25 MB
    ALLOWED_EXTENSIONS: set = {".pdf", ".png", ".jpg", ".jpeg", ".webp"}
    STORAGE_TYPE: str = os.getenv("STORAGE_TYPE", "local")  # 'local' or 's3'
    
    # S3 Compatible Storage Config (MinIO / AWS S3)
    S3_ENDPOINT_URL: Optional[str] = os.getenv("S3_ENDPOINT_URL", "http://localhost:9000")
    S3_ACCESS_KEY: Optional[str] = os.getenv("S3_ACCESS_KEY", "minioadmin")
    S3_SECRET_KEY: Optional[str] = os.getenv("S3_SECRET_KEY", "minioadmin")
    S3_BUCKET_NAME: Optional[str] = os.getenv("S3_BUCKET_NAME", "aicte-documents")
    
    # Operational & Security
    DEMO_MODE: bool = True
    SIMULATE_SOURCE_DELAYS: bool = True
    AUDIT_LOG_TAMPER_KEY: str = "aicte-audit-chain-tamper-proof-salt-2025"
    DATA_RETENTION_DAYS: int = 365
    
    model_config = SettingsConfigDict(case_sensitive=True)

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
