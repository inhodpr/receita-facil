"""Generate a version of the app that can run offline.

Downloads locally the data needed to run the app:
- drugs list, as JSON file.
- icons to a specific directory.
"""


import dataclasses
import json
import os
import shutil
import urllib

from flask import Flask, render_template
from scripts import storage_defs
from urllib import parse


app_storage = storage_defs.Storage()


# Slightly copied from main.py.
def download_drugs(drugs_path):
    class EnhancedJSONEncoder(json.JSONEncoder):
        def default(self, o):
            if dataclasses.is_dataclass(o):
                asdict = dataclasses.asdict(o)
                # clean up drug data empty fields before json-fying
                empty_fields = [k for k, v in asdict.items() if not v]
                for k in empty_fields:
                    del asdict[k]
                return asdict
            return super().default(o)
    
    drugs = app_storage.drugs().fetch_drugs()
    contents = json.dumps(drugs, cls=EnhancedJSONEncoder)
    with open(drugs_path, 'w') as f:
        f.write(contents)


def download_icon(icon_path, adjusted_path):
    with urllib.request.urlopen(icon_path) as img:
        with open(adjusted_path, 'wb') as out:
            out.write(img.read())


def download_support_icons(support_icon_defs_path, basedir, icons_dir):
    support_icons_defs = app_storage.support_icons().fetch_support_icons_definitions()
    adjusted_icon_defs = {}
    for category, icon_paths in support_icons_defs.items():
        adjusted_category = []
        for idx, icon_path in enumerate(icon_paths):
            basename = os.path.basename(icon_path)
            basename = parse.unquote(basename)
            new_path = os.path.join(icons_dir, basename)
            new_full_path = os.path.join(basedir, new_path)
            print(f'Downloading icon {idx + 1} of {len(icon_paths)}.')
            download_icon(icon_path, new_full_path)
            adjusted_category.append(new_path)
        adjusted_icon_defs[category] = adjusted_category
    contents = json.dumps(adjusted_icon_defs)
    with open(support_icon_defs_path, 'w') as f:
        f.write(contents)


def download_home_page(homepage_path):
    app = Flask(__name__)
    with app.app_context():
        homepage = render_template("generic_city.html",
                                unspecifiedCity=True,
                                css_file='pnz_style.css')
    with open(homepage_path, 'w') as f:
        f.write(homepage)


def pack_offline_app():
    basedir = '/tmp/cuidadoparatodos-offline/app'
    if not os.path.exists(basedir):
        os.makedirs(basedir)

    # Delete all files in the base dir.
    # existing_files_glob = os.path.join(basedir, '*')
    # if os.path.exists(existing_files_glob):
    #     os.remove( existing_files_glob)

    # Recreate dirs that we will need.
    os.makedirs(os.path.join(basedir, 'icons'))

    download_home_page(
        os.path.join(basedir, 'index.html'))
    download_drugs(
        os.path.join(basedir, 'drugs'))
    download_support_icons(
        os.path.join(basedir, 'supportIcons'),
        basedir,
        'icons')
    shutil.copytree(
        '/home/inhodpr/receita-facil/static',
        os.path.join(basedir, 'static'))


if __name__ == "__main__":
    pack_offline_app()