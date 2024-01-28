import dataclasses
from typing import Any
from google.cloud import datastore
from google.cloud.datastore.entity import Entity
from google.appengine.api import datastore_types


@dataclasses.dataclass(init=False, frozen=False)
class Drug:
    id: int
    name: str
    quantity: str = None
    instructions: str = None
    instructions_for_doctors: str = None
    brand: str = None
    category: str = None
    subcategory: str = None
    support_icons: Any = None
    is_link: bool = False
    is_image: bool = False
    
    # Usage route for this drug. Oral, IV, etc.
    # https://github.com/inhodpr/receita-facil/issues/48
    route: str | None = None

    # URL of an image describing how to use the drug, or any other visual
    # information useful for the patient. Displayed below the drug
    # instructions.
    # https://github.com/inhodpr/receita-facil/issues/50
    image_url: str | None = None

    # URL associated with a drug. Shown as a QR code with a subtitle under
    # the drug instructions.
    # https://github.com/inhodpr/receita-facil/issues/51
    qr_code_url: str | None = None
    qr_code_subtitle: str | None = None


def to_entity(drug: Drug, client: datastore.Client) -> Entity:
    entity = Entity(key=client.key('drug', drug.id))
    for field, value in dataclasses.asdict(drug).items():
        entity[field] = value
    # Convert instructions_for_doctors to datastore_types.Text. This is
    # better for long text and is never indexed.
    curr_instructions_for_doctors = entity['instructions_for_doctors']
    entity['instructions_for_doctors'] = datastore_types.Text(curr_instructions_for_doctors)
    entity.exclude_from_indexes.add('instructions_for_doctors')
    return entity


def from_entity(entity: Entity) -> Drug:
    drug = Drug()
    if 'id' in entity:
        drug.id = entity['id']
    else:
        drug.id = entity.key.id

    drug.name = entity['name']
    if 'quantity' in entity:
        drug.quantity = entity['quantity']
    if 'instructions' in entity:
        drug.instructions = entity['instructions']
    if 'instructions_for_doctors' in entity:
        drug.instructions_for_doctors = entity['instructions_for_doctors']
    if 'brand' in entity:
        drug.brand = entity['brand']
    if 'category' in entity:
        drug.category = entity['category']
    if 'subcategory' in entity:
        drug.subcategory = entity['subcategory']
    if 'support_icons' in entity:
        drug.support_icons = entity['support_icons']
    if 'is_link' in entity:
        drug.is_link = entity['is_link']
    if 'is_image' in entity:
        drug.is_image = entity['is_image']
    if 'route' in entity:
        drug.route = entity['route']
    if 'image_url' in entity:
        drug.image_url = entity['image_url']
    if 'qr_code_url' in entity:
        drug.qr_code_url = entity['qr_code_url']
    if 'qr_code_subtitle' in entity:
        drug.qr_code_subtitle = entity['qr_code_subtitle']
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
    if 'support_icons' in obj:
        drug.support_icons = obj['support_icons']
    if 'is_link' in obj:
        drug.is_link = obj['is_link']
    if 'is_image' in obj:
        drug.is_image = obj['is_image']
    if 'route' in obj:
        drug.route = obj['route']
    if 'image_url' in obj:
        drug.image_url = obj['image_url']
    if 'qr_code_url' in obj:
        drug.qr_code_url = obj['qr_code_url']
    if 'qr_code_subtitle' in obj:
        drug.qr_code_subtitle = obj['qr_code_subtitle']
    return drug

