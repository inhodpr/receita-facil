from typing import Dict, List

from scripts import storage as support_icon_storage

from google.cloud import storage


SUPPORT_ICONS_BUCKET = 'receita-facil-support-icons'


class OnDiskSupportIconsStorage(support_icon_storage.SupportIconsStorage):
    def __init__(self):
        self._client = storage.Client(project='hellodpiresworld')

    def fetch_support_icons_definitions(self) -> Dict[str, List[str]]:
        blobs = self._client.list_blobs(SUPPORT_ICONS_BUCKET)
        support_icon_defs = {}
        for blob in blobs:
            category, _ = blob.name.split('/')
            if category not in support_icon_defs:
                support_icon_defs[category] = []
            if blob.public_url and blob.public_url.endswith('.png'):
                support_icon_defs[category].append(blob.public_url)
        return support_icon_defs
