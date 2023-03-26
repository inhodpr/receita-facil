import dataclasses
from typing import Any


@dataclasses.dataclass(init=False)
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

