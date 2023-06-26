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
  # Hack for renaming pages without having to rename full buckets.
  renamed_pages = {
      'biblioteca': 'bibliografia',
      'materiais': 'scores',
  }
  bucket_suffix = renamed_pages[pagename] if pagename in renamed_pages else pagename
  bucket_name = 'receita-facil-knowledge-' + bucket_suffix
  blobs = [(blob.name, blob.media_link) for blob in client.list_blobs(bucket_name)]
  return render_template("knowledge_base.html",
			            pagename=pagename,
			            blobs=blobs)


def render_library_page(app):
	return _fetch_from_storage("biblioteca")

def render_materials_page(app):
	return _fetch_from_storage("materiais")

