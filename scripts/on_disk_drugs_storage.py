import json
from typing import Dict, List

from scripts import drug, storage as drug_storage

from google.cloud import storage

BUCKET_NAME = 'receita-facil-drugs-storage'
BLOB_NAME = 'drugs.json'

class OnDiskDrugStorage(drug_storage.DrugsStorage):
    def __init__(self):
        self._client = storage.Client(project='hellodpiresworld')

    def fetch_drugs(self) -> List[drug.Drug]:
        bucket = self._client.bucket(BUCKET_NAME)
        blob = bucket.blob(BLOB_NAME)
        contents = blob.download_as_string()
        raw_drug_list = json.loads(contents)
        parsed_drugs = [drug.from_json(raw_drug) for raw_drug in raw_drug_list]
        return parsed_drugs


    def update_drug_definitions(self, drugs_list: List[drug.Drug]):
        bucket = self._client.bucket(BUCKET_NAME)
        blob = bucket.blob(BLOB_NAME)
        blob.upload_from_string(drugs_list, content_type='application/json')