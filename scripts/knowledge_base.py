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


from flask import render_template
from google.cloud import storage

def _fetch_from_storage(pagename):
  client = storage.Client()
  bucket_name = 'receita-facil-knowledge-' + pagename
  blobs = [(blob.name, blob.media_link) for blob in client.list_blobs(bucket_name)]
  return render_template("knowledge_base.html",
			            pagename=pagename,
			            blobs=blobs)


def render_documents_page(app):
	return _fetch_from_storage("documentos")


def render_protocols_page(app):
	return _fetch_from_storage("protocolos")


def render_scores_page(app):
	return _fetch_from_storage("scores")
