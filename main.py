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

import json
import os

from flask import Flask, request, redirect, Response
from google.cloud import storage
from scripts import knowledge_base, process_drugs

ALLOWED_EXTENSIONS = ['txt']
BUCKET_NAME = 'receita-facil-drugs-storage'
BLOB_NAME = 'drugs.json'


app = Flask(__name__)


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def process_upload_contents(file):
	# Parse contents
	parser = process_drugs.DrugListReader()
	parsed_drugs = parser.process_drugs(file)
	parsed_drugs_json = json.dumps(parsed_drugs, indent=4)

	# Now upload JSON to storage bucket.
	client = storage.Client()
	bucket = client.bucket(BUCKET_NAME)
	blob = bucket.blob(BLOB_NAME)
	blob.upload_from_string(parsed_drugs_json,
		                    content_type='application/json')


@app.route('/')
def home():
	# Ignored when running on AppEngine
	return app.send_static_file('index.html')


@app.route('/drugs')
def fetch_drugs():
  client = storage.Client()
  bucket = client.bucket(BUCKET_NAME)
  blob = bucket.blob(BLOB_NAME)
  contents = blob.download_as_string()	
  return Response(contents, mimetype='application/json')


@app.route('/upload', methods=['GET', 'POST'])
def upload_drugs():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'file' not in request.files:
            flash('No file part')
            return redirect(request.url)
        file = request.files['file']
        # if user does not select file, browser also
        # submit an empty part without filename
        if file.filename == '':
            flash('No selected file')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            process_upload_contents(file)
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


@app.route('/bibliografia')
def fetch_bibliografia():
  return knowledge_base.render_bibliography_page(app)


@app.route('/documentos')
def fetch_documentos():
  return knowledge_base.render_documents_page(app)


@app.route('/scores')
def fetch_scores():
  return knowledge_base.render_scores_page(app)


@app.route('/painel')
def fetch_panel():
  return knowledge_base.render_panel_page(app)


if __name__ == '__main__':
	app.run(host='127.0.0.1', port=8080, debug=True)
