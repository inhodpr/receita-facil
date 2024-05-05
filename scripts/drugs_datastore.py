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

    def find_drug_by_id(self, id: int) -> drug.Drug:
        key = self._datastore_client.key("drug", int(id))
        entity = self._datastore_client.get(key=key)
        return drug.from_entity(entity)

    def update_drug(self, new_drug: drug.Drug):
        entity = drug.to_entity(new_drug, self._datastore_client)
        self._datastore_client.put(entity)

    def add_drug(self, new_drug: drug.Drug):
        entity = drug.to_entity(new_drug, self._datastore_client)
        self._datastore_client.put(entity)

    def update_drug_definitions(self, drugs_list: List[drug.Drug]):
        raise NotImplementedError()