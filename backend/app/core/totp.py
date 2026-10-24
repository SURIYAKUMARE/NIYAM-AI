import hmac
import hashlib
import struct
import time
import base64
import secrets
from typing import Tuple, List, Optional
from datetime import datetime, timezone

def generate_totp_secret() -> str:
    """Generate RFC 6238 compliant base32 secret (160-bit)."""
    return base64.b32encode(secrets.token_bytes(20)).decode('utf-8')

def get_totp_uri(secret: str, username: str, issuer: str = "NIYAM-AICTE") -> str:
    """Generates standard otpauth:// URI for authenticator QR enrollment."""
    return f"otpauth://totp/{issuer}:{username}?secret={secret}&issuer={issuer}&algorithm=SHA1&digits=6&period=30"

def generate_totp_code(secret_b32: str, for_time: Optional[int] = None, interval: int = 30) -> str:
    """Computes standard 6-digit TOTP code for a given timestamp."""
    if for_time is None:
        for_time = int(time.time())
    counter = for_time // interval
    # Pad base32 if needed
    padding = '=' * ((8 - len(secret_b32) % 8) % 8)
    key = base64.b32decode(secret_b32.strip() + padding, casefold=True)
    msg = struct.pack(">Q", counter)
    h = hmac.new(key, msg, hashlib.sha1).digest()
    offset = h[-1] & 0x0f
    code_int = struct.unpack(">I", h[offset:offset + 4])[0] & 0x7fffffff
    return str(code_int % 1000000).zfill(6)

def verify_totp_code(
    secret_b32: str,
    code: str,
    last_verified_counter: Optional[int] = None,
    window: int = 1,
    interval: int = 30
) -> Tuple[bool, Optional[int]]:
    """
    Verifies 6-digit TOTP code against time window with replay protection.
    Returns (is_valid, current_counter).
    """
    if not secret_b32 or not code:
        return False, None

    code = str(code).strip()
    if len(code) != 6 or not code.isdigit():
        return False, None

    now = int(time.time())
    current_counter = now // interval

    # Window check (-1, 0, +1 interval, i.e., +/- 30 seconds drift tolerance)
    for offset in range(-window, window + 1):
        test_counter = current_counter + offset
        # Prevent replay: cannot use the same or earlier counter than last verified
        if last_verified_counter is not None and test_counter <= last_verified_counter:
            continue
        expected_code = generate_totp_code(secret_b32, for_time=test_counter * interval, interval=interval)
        if hmac.compare_digest(expected_code, code):
            return True, test_counter

    return False, None

def generate_recovery_codes(count: int = 8) -> Tuple[List[str], str]:
    """Generates recovery codes and returns (plain_codes, hashed_storage_str)."""
    plain = [f"REC-{secrets.token_hex(2).upper()}-{secrets.token_hex(2).upper()}" for _ in range(count)]
    # Hash each code with salt for secure DB storage
    hashed = [hash_recovery_code(c) for c in plain]
    return plain, ",".join(hashed)

def hash_recovery_code(code: str) -> str:
    clean = code.strip().upper()
    return hashlib.sha256(f"aicte_mfa_rec_{clean}".encode('utf-8')).hexdigest()

def verify_and_consume_recovery_code(code: str, stored_hash_str: Optional[str]) -> Tuple[bool, Optional[str]]:
    """Checks if recovery code is valid, and consumes it from the stored list."""
    if not stored_hash_str:
        return False, stored_hash_str
    code_hash = hash_recovery_code(code)
    hashes = [h.strip() for h in stored_hash_str.split(",") if h.strip()]
    if code_hash in hashes:
        hashes.remove(code_hash)
        return True, ",".join(hashes)
    return False, stored_hash_str
