# Copyright 2020 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software-
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import dataclasses
import json
import os

from scripts import drug, storage_defs
from scripts import knowledge_base, process_drugs

from collections import namedtuple
from flask import Flask, render_template, request, redirect, Response


app = Flask(__name__)
app_storage = storage_defs.Storage()


ALLOWED_EXTENSIONS = ['txt']
DrugBox = namedtuple('DrugBox', ['usage_hours', 'name', 'icon'])


@app.route('/')
def home():
    return render_template("generic_city.html",
                           unspecifiedCity=True,
                           css_file='pnz_style.css')


@app.route('/pnz')
def homePetrolina():
    return render_template("generic_city.html",
                           css_file='pnz_style.css',
                           city_logo_file='/static/images/logo_prefeitura.png',
                           address='Av. Fernando Góes, S/N, Centro, Petrolina-PE',
                           cnpj='06.914.894/0001-01',
                           telephone='(87) 3866-8550')


@app.route('/ourolandia')
def homeOurolandia():
    return render_template("generic_city.html",
                           css_file='pnz_style.css',
                           city_logo_file='/static/images/logoOurolandia.jpeg',
                           address='Rua da Saudade, S/N, Centro - Ourolândia (BA)',
                           cnpj='10.469.110/0001-50',
                           telephone=None)


@app.route('/santafilomena')
def homeSantaFilomena():
    return render_template("santa_filomena.html")


@app.route('/santacruz')
def homeSantaCruz():
    return render_template("santa_cruz.html")


@app.route('/sbf')
def homeSBF():
    return render_template("sbf.html")


def _allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def _process_upload_contents(file):
    parser = process_drugs.DrugListReader()
    parsed_drugs = parser.process_drugs(file)
    app_storage.drugs().update_drug_definitions(parsed_drugs)


@app.route('/drugs')
def fetch_drugs():
    class EnhancedJSONEncoder(json.JSONEncoder):
        def default(self, o):
            if dataclasses.is_dataclass(o):
                return dataclasses.asdict(o)
            return super().default(o)
    
    drugs = app_storage.drugs().fetch_drugs()
    contents = json.dumps(drugs, cls=EnhancedJSONEncoder)
    return Response(contents, mimetype='application/json')


@app.route('/upload', methods=['GET', 'POST'])
def upload_drugs():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            return redirect(request.url)
        file = request.files['file']
        # if user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            return redirect(request.url)
        if file and _allowed_file(file.filename):
            _process_upload_contents(file)
            return redirect('/')
    return '''
    <!doctype html>
    <title>Upload new File</title>
    <h1>Upload new File</h1>
    <form method=post enctype=multipart/form-data>
      <input type=file name=file>
      <input type=submit value=Upload>
    </form>
    '''


@app.route('/bottom')
def fetch_bottoms():
    valid_templates = app_storage.footnotes().fetch_footnotes_for_city(request.args['city'])
    if not valid_templates:
        return ''
    bottom_index = int(float(request.args['idx']))
    num_valid_bottoms = len(valid_templates)
    template_idx = bottom_index % (num_valid_bottoms + 1)
    # Allow cycling until we have an empty bottom.
    if template_idx == num_valid_bottoms:
        return ''
    return app_storage.footnotes().render_footnote(valid_templates[template_idx])



@app.route('/supportIcons')
def support_icons_defs():
    support_icons_defs = app_storage.support_icons().fetch_support_icons_definitions()
    contents = json.dumps(support_icons_defs)
    return Response(contents, mimetype='application/json')


@app.route('/bibliografia')
def fetch_bibliography():
    return knowledge_base.render_bibliography_page(app)


@app.route('/biblioteca')
def fetch_library():
    return knowledge_base.render_library_page(app)


@app.route('/documentos')
def fetch_documents():
    return knowledge_base.render_documents_page(app)


@app.route('/scores')
def fetch_scores():
    return knowledge_base.render_scores_page(app)


@app.route('/materiais')
def fetch_materials():
    return knowledge_base.render_materials_page(app)


@app.route('/painel')
def fetch_panel():
    return knowledge_base.render_panel_page(app)


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8080, debug=True)
