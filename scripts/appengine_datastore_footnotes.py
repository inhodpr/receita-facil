from typing import List
from scripts import storage
from google.cloud import datastore

class AppEngineDataStoreFootnotes(storage.FootnotesStorage):
    def __init__(self):
        self._datastore_client = datastore.Client(project='hellodpiresworld')


    def _is_valid_footnote(self, footnote):
        return ('city' in footnote and 'content' in footnote)

    def fetch_footnotes_for_city(self, city: str) -> List[str]:
        query = self._datastore_client.query(kind='footnote')
        footnotes = query.fetch(limit=100)
        return [f.id for f in footnotes if (self._is_valid_footnote(f) and f['city'] in ['any', city])]

    def render_footnote(self, footnote_key: str) -> str:
        key = datastore.Key('footnote', footnote_key, project='hellodpiresworld')
        entity = self._datastore_client.get(key)
        return entity['content']


