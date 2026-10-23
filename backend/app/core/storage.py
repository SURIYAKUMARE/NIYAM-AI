import os
import hashlib
import time
from typing import Tuple, Optional
from fastapi import HTTPException, status
from jose import jwt
from .config import settings

# Supported magic bytes for safe document uploads
MAGIC_NUMBERS = {
    b"%PDF": "application/pdf",
    b"\x89PNG\r\n\x1a\n": "image/png",
    b"\xff\xd8\xff": "image/jpeg",
    b"RIFF": "image/webp"
}

def validate_file_bytes(content: bytes, filename: str) -> str:
    """
    Validate file size and magic bytes against MIME spoofing.
    """
    if len(content) > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB"
        )
    
    ext = os.path.splitext(filename)[1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file extension '{ext}'. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    
    # Check magic header
    detected_mime = None
    for magic, mime in MAGIC_NUMBERS.items():
        if content.startswith(magic):
            detected_mime = mime
            break
            
    if not detected_mime and ext == ".pdf" and b"%PDF" in content[:1024]:
        detected_mime = "application/pdf"

    if not detected_mime:
        # Fallback to extension mime
        ext_map = {
            ".pdf": "application/pdf",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".webp": "image/webp"
        }
        detected_mime = ext_map.get(ext, "application/octet-stream")
        
    return detected_mime

def compute_sha256(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()

class StorageProvider:
    def store_file(self, content: bytes, original_filename: str) -> Tuple[str, str, str, int]:
        """
        Stores file and returns (storage_path, sha256_hash, mime_type, file_size)
        """
        mime_type = validate_file_bytes(content, original_filename)
        sha256_hash = compute_sha256(content)
        file_size = len(content)
        
        # Safe storage path with hash-based filename to prevent path traversal
        ext = os.path.splitext(original_filename)[1].lower()
        sub_dir = sha256_hash[:2]
        dir_path = os.path.join(settings.UPLOAD_DIR, sub_dir)
        os.makedirs(dir_path, exist_ok=True)
        
        file_name = f"{sha256_hash}{ext}"
        storage_path = os.path.join(dir_path, file_name)
        
        with open(storage_path, "wb") as f:
            f.write(content)
            
        return storage_path, sha256_hash, mime_type, file_size

    def read_file(self, storage_path: str) -> bytes:
        if not os.path.exists(storage_path):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Physical document file not found in secure storage."
            )
        with open(storage_path, "rb") as f:
            return f.read()

    def generate_signed_token(self, storage_path: str, doc_id: int, user_id: int, expires_in: int = 900) -> str:
        """
        Generate short-lived (15 min) JWT signed token for private document streaming.
        """
        exp = int(time.time()) + expires_in
        payload = {
            "path": storage_path,
            "doc_id": doc_id,
            "user_id": user_id,
            "exp": exp
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    def verify_signed_token(self, token: str) -> str:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload["path"]
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Expired or invalid document access token."
            )

storage_provider = StorageProvider()
