import dataclasses
from typing import Any
from google.cloud import datastore
from google.cloud.datastore.entity import Entity


@dataclasses.dataclass(init=False, frozen=False)
class Drug:
    id: int
    name: str
    quantity: str = None
    instructions: str = None
    brand: str = None
    category: str = None
    subcategory: str = None
    is_link: bool = False
    is_image: bool = False


def to_entity(drug: Drug, client: datastore.Client) -> Entity:
    entity = Entity(key=client.key('drug', drug.id))
    for field, value in dataclasses.asdict(drug).items():
        entity[field] = value
    return entity


def from_entity(entity: Entity) -> Drug:
    drug = Drug()
    drug.id = entity['id']
    drug.name = entity['name']
    if 'quantity' in entity:
        drug.quantity = entity['quantity']
    if 'instructions' in entity:
        drug.instructions = entity['instructions']
    if 'brand' in entity:
        drug.brand = entity['brand']
    if 'category' in entity:
        drug.category = entity['category']
    if 'subcategory' in entity:
        drug.subcategory = entity['subcategory']
    if 'is_link' in entity:
        drug.is_link = entity['is_link']
    if 'is_image' in entity:
        drug.is_image = entity['is_image']
    return drug


def from_json(obj: Any) -> Drug:
    drug = Drug()
    drug.id = obj['id']
    drug.name = obj['name']
    if 'quantity' in obj:
        drug.quantity = obj['quantity']
    if 'instructions' in obj:
        drug.instructions = obj['instructions']
    if 'brand' in obj:
        drug.brand = obj['brand']
    if 'category' in obj:
        drug.category = obj['category']
    if 'subcategory' in obj:
        drug.subcategory = obj['subcategory']
    if 'is_link' in obj:
        drug.is_link = obj['is_link']
    if 'is_image' in obj:
        drug.is_image = obj['is_image']
    return drug

