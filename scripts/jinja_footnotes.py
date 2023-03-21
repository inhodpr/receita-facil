import os
from typing import List

from scripts import storage

from flask import render_template


class JinjaFootnotesStorage(storage.FootnotesStorage):
    def fetch_footnotes_for_city(self, city: str) -> List[str]:
        available_bottom_sections = [
            'all_saline_solution.html',
            'pnz_phones.html',
        ]
        valid_templates = list(filter(
            lambda t: t.startswith('all_') or t.startswith(f"{city}_"),
            available_bottom_sections))
        return valid_templates

    def render_footnote(self, footnote: str) -> str:
        return render_template(os.path.join('bottoms', footnote))