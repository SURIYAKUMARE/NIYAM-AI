import abc
import time
from typing import Dict, Any
from ...models.models import VerificationStatus, AuthoritySourceType

class AuthorityAdapter(abc.ABC):
    @property
    @abc.abstractmethod
    def source_type(self) -> AuthoritySourceType:
        pass

    @property
    @abc.abstractmethod
    def endpoint_name(self) -> str:
        pass

    @abc.abstractmethod
    def verify(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes verification against issuing authority.
        Returns dictionary with:
        - status: VerificationStatus
        - matched_fields: dict
        - mismatched_fields: dict
        - response_summary: str
        - latency_ms: int
        - simulated_demo: bool
        """
        pass
