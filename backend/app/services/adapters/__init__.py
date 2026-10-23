from typing import Dict
from ...models.models import AuthoritySourceType
from .base_adapter import AuthorityAdapter
from .digilocker_adapter import DigiLockerAdapter
from .affiliation_adapter import UniversityAffiliationAdapter
from .land_revenue_adapter import LandRevenueAdapter
from .bank_ter_adapter import BankTERAdapter
from .qr_adapter import QRSignatureAdapter

ADAPTER_MAP: Dict[AuthoritySourceType, AuthorityAdapter] = {
    AuthoritySourceType.DIGILOCKER: DigiLockerAdapter(),
    AuthoritySourceType.UNIVERSITY_AFFILIATION: UniversityAffiliationAdapter(),
    AuthoritySourceType.LAND_REVENUE_PORTAL: LandRevenueAdapter(),
    AuthoritySourceType.BANK_TER_GATEWAY: BankTERAdapter(),
    AuthoritySourceType.QR_SIGNATURE_SERVICE: QRSignatureAdapter()
}

def get_adapter(source_type: AuthoritySourceType) -> AuthorityAdapter:
    adapter = ADAPTER_MAP.get(source_type)
    if not adapter:
        raise ValueError(f"No adapter registered for authority type {source_type}")
    return adapter
