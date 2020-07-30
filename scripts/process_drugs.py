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

﻿#encoding: utf-8
# Run as:
# cat <list with drugs> | python process_drugs.py > <output>

import json
import sys
from collections import namedtuple


class DrugListReader:
    def __init__(self):
        self.drugId = 1;
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
        self.allDrugs.append(self.currentDrug)
        self.currentDrug = {}

    def parseNewDrug(self, line):
        self.currentDrug = {}
        parts = line.split('//')
        self.currentDrug['name'] = parts[0]
        self.currentDrug['quantity'] = parts[1]
        if len(parts) > 2:
            self.currentDrug['instructions'] = parts[2]
        if len(parts) > 3:
            self.currentDrug['brand'] = parts[3]

    def parseRecommendation(self, line):
        self.currentDrug = {}
        self.currentDrug['name'] = line[2:]

    def appendDescription(self, line):
        if not 'instructions' in self.currentDrug:
            self.currentDrug['instructions'] = ''
        else:
            self.currentDrug['instructions'] += '\r\n'
        self.currentDrug['instructions'] += line


    def process_drugs(self):
        for line in sys.stdin:
            line = line.strip()
            if not line:
                continue
            if line.startswith('## '):
                self.addDrug()
                self.currentCategory = line[3:]
                self.currentSubcategory = None
                continue
            if line.startswith('### '):
                self.addDrug()
                self.currentSubcategory = line[4:]
                continue
            if line.startswith('* '):
                self.addDrug()
                self.parseRecommendation(line)
            if '//' in line:
                self.addDrug()
                self.parseNewDrug(line)
            else:
                self.appendDescription(line)
        self.addDrug()  # don't forget to add the last drug
        return self.allDrugs

processor = DrugListReader()
all_drugs = processor.process_drugs()
print(json.dumps(all_drugs, indent=4))
