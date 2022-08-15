#!/usr/bin/python
#
# Copyright 2020 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

class DrugListReader:
    def __init__(self):
        self.drugId = 0
        self.allDrugs = []
        self.currentDrug = None
        self.currentCategory = None
        self.currentSubcategory = None

    def addDrug(self):
        if not self.currentDrug:
            return
        self.drugId = self.drugId + 1
        self.currentDrug['id'] = self.drugId
        if self.currentCategory:
            self.currentDrug['category'] = self.currentCategory
        if self.currentSubcategory:
            self.currentDrug['subcategory'] = self.currentSubcategory
        if 'category' in self.currentDrug and self.currentDrug['category'] == 'Videos':
            self.currentDrug['is_link'] = True
        if 'category' in self.currentDrug and self.currentDrug['category'] == 'Imagens':
            self.currentDrug['is_image'] = True
        self.allDrugs.append(self.currentDrug)
        self.currentDrug = {}

    def parseNewDrug(self, line):
        self.currentDrug = {}
        parts = line.split('//')
        self.currentDrug['name'] = str(parts[0]).strip()
        self.currentDrug['quantity'] = str(parts[1]).strip()
        if len(parts) > 2:
            self.currentDrug['instructions'] = str(parts[2]).strip()
        if len(parts) > 3:
            self.currentDrug['brand'] = str(parts[3]).strip()

    def parseRecommendation(self, line):
        self.currentDrug = {}
        self.currentDrug['name'] = str(line[2:])

    def appendDescription(self, line):
        if not self.currentDrug:
            return
        if not 'instructions' in self.currentDrug:
            self.currentDrug['instructions'] = ''
        else:
            self.currentDrug['instructions'] += '\r\n'
        self.currentDrug['instructions'] += str(line)


    def process_drugs(self, input_file):
        for line in input_file:
            line = line.decode(encoding='utf-8').strip()
            if not line:
                continue
            if line.startswith('## '):
                self.addDrug()
                self.currentCategory = str(line[3:])
                self.currentSubcategory = None
            elif line.startswith('### '):
                self.addDrug()
                self.currentSubcategory = str(line[4:])
            elif line.startswith('* '):
                self.addDrug()
                self.parseRecommendation(line)
            elif '//' in line and not line.startswith('http'):
                self.addDrug()
                self.parseNewDrug(line)
            else:
                self.appendDescription(line)
        self.addDrug()  # don't forget to add the last drug
        return self.allDrugs


