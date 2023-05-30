from typing import List
from scripts import drug, storage
from google.cloud import datastore

class DrugsDatastore(storage.DrugsStorage):
    def __init__(self):
        self._datastore_client = datastore.Client(project='hellodpiresworld')


    def fetch_drugs(self) -> List[drug.Drug]:
        query = self._datastore_client.query(kind='drug')
        entities = query.fetch(limit=3000)
        return [drug.from_entity(entity) for entity in entities]


    def update_drug_definitions(self, drugs_list: List[drug.Drug]):
        raise NotImplementedError()