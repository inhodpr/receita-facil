import enum

from scripts.drug import Drug
from scripts.user import User

from typing import Dict, List, Optional

class DrugsStorage:
    def fetch_drugs(self) -> List[Drug]:
        raise NotImplementedError()

    def update_drug_definitions(self, drugs_list: List[Drug]):
        raise NotImplementedError()
    
    def add_drug(self, drug: Drug):
        raise NotImplementedError()

    def update_drug(self, drug: Drug):
        raise NotImplementedError()
    
    def find_drug_by_id(self, id: int) -> Drug:
        raise NotImplementedError()


class FootnotesStorage:
    def fetch_footnotes_for_city(self, city: str) -> List[str]:
        raise NotImplementedError()

    def render_footnote(self, footnote: str) -> str:
        raise NotImplementedError()


class SupportIconsStorage:
    class Version(enum.IntEnum):
        V1 = 1
        V2 = 2
    
    def fetch_support_icons_definitions(
        self,
        version: Optional[Version] = None) -> Dict[str, List[str]]:
        raise NotImplementedError()


class UserStorage:
    def find_user_by_email(self, email: str) -> User:
        raise NotImplementedError()
