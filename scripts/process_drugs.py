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

from scripts.drug import Drug
from typing import List
import fileinput

class DrugListReader:
    def __init__(self):
        self.drugId = 0
        self.allDrugs = []
        self.currentDrug = None
        self.currentCategory = None
        self.currentSubcategory = None

    def _add_drug(self):
        if not self.currentDrug:
            return
        self.drugId = self.drugId + 1
        self.currentDrug.id = self.drugId
        if self.currentCategory:
            self.currentDrug.category = self.currentCategory
        if self.currentSubcategory:
            self.currentDrug.subcategory = self.currentSubcategory
        if self.currentDrug.category == 'Videos':
            self.currentDrug.is_link = True
        if self.currentDrug.category == 'Imagens':
            self.currentDrug.is_image = True
        self.allDrugs.append(self.currentDrug)
        self.currentDrug = {}

    def _parse_new_drug(self, line):
        self.currentDrug = Drug()
        parts = line.split('//')
        self.currentDrug.name = str(parts[0]).strip()
        self.currentDrug.quantity = str(parts[1]).strip()
        if len(parts) > 2:
            self.currentDrug.instructions = str(parts[2]).strip()
        if len(parts) > 3:
            self.currentDrug.brand = str(parts[3]).strip()

    def _parse_recommendation(self, line):
        self.currentDrug = Drug()
        self.currentDrug.name = str(line[2:])

    def _append_description(self, line):
        if not self.currentDrug:
            return
        if not self.currentDrug.instructions:
            self.currentDrug.instructions = ''
        else:
            self.currentDrug.instructions += '\r\n'
        self.currentDrug.instructions += str(line)


    def process_drugs(self, input_file) -> List[Drug]:
        for line in input_file:
            if not isinstance(line, str):
                line = line.decode(encoding='utf-8').strip()
            if not line:
                continue
            if line.startswith('## '):
                self._add_drug()
                self.currentCategory = str(line[3:])
                self.currentSubcategory = None
            elif line.startswith('### '):
                self._add_drug()
                self.currentSubcategory = str(line[4:])
            elif line.startswith('* '):
                self._add_drug()
                self._parse_recommendation(line)
            elif '//' in line and not line.startswith('http'):
                self._add_drug()
                self._parse_new_drug(line)
            else:
                self._append_description(line)
        self._add_drug()  # don't forget to add the last drug
        return self.allDrugs


def main():
    reader = DrugListReader()
    with fileinput.input() as f:
        drugs = reader.process_drugs(f)
    print(drugs)

if __name__ == "__main__":
    main()
