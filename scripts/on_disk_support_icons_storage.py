from typing import List

from scripts import storage as support_icon_storage

from google.cloud import storage


SUPPORT_ICONS_BUCKET = 'receita-facil-support-icons'


class OnDiskSupportIconsStorage(support_icon_storage.SupportIconsStorage):
    def fetch_support_icons_definitions(self) -> dict[str, List[str]]:
        client = storage.Client()
        blobs = client.list_blobs(SUPPORT_ICONS_BUCKET)
        support_icon_defs = {}
        for blob in blobs:
            category, _ = blob.name.split('/')
            if category not in support_icon_defs:
                support_icon_defs[category] = []
            support_icon_defs[category].append(blob.public_url)
        return support_icon_defs
