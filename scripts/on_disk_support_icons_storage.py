from typing import Dict, List, Optional

from scripts import storage as support_icon_storage

from google.cloud import storage


SUPPORT_ICONS_BUCKET_V1 = 'receita-facil-support-icons'
SUPPORT_ICONS_BUCKET_V2 = 'receita-facil-support-icons-v2'


class OnDiskSupportIconsStorage(support_icon_storage.SupportIconsStorage):
    def __init__(self):
        self._client = storage.Client(project='hellodpiresworld')

    def fetch_support_icons_definitions(
        self,
        version: Optional[support_icon_storage.SupportIconsStorage.Version] = None) -> Dict[str, List[str]]:
        bucket = SUPPORT_ICONS_BUCKET_V2 if version == self.Version.V2 else SUPPORT_ICONS_BUCKET_V1
        allowed_extensions = {'.png', '.svg'}
        blobs = self._client.list_blobs(bucket)
        support_icon_defs = {}
        for blob in blobs:
            category, _ = blob.name.split('/')
            if category not in support_icon_defs:
                support_icon_defs[category] = []
            public_url = blob.public_url
            extension = public_url[public_url.rfind('.'):]
            if extension in allowed_extensions:
                support_icon_defs[category].append(blob.public_url)
        return support_icon_defs
