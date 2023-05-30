import json
from scripts import drug
from google.cloud import datastore

with open('../drugs.json', 'r') as f:
    myjson = json.load(f)

client = datastore.Client(project='hellodpiresworld')
drugs = [drug.from_json(j) for j in myjson]
entities = [drug.to_entity(d, client) for d in drugs]

# entities = entities[100:105]
with client.transaction():
    client.put_multi(entities)

e1 = client.get(key=client.key('drug', 102))
d1 = drug.from_entity(e1)