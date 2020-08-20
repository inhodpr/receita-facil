// Copyright 2020 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var DRUGS_LIST = null;
var APP = null;

var DrugsForm = function(_app) {
  this.app = _app;
  this.drugsForm = document.getElementById('drogas-form');
  this.drugSelections = [];
  this.categoryDivs = {};

  this.routeMap = {};
  this.routeSelector = null;

  this.counter = 1;
  this.drugPosition = {};

  this.createHandler = function(method, captures) {
    var targetObj = this;
    return function(e) {
      method.apply(targetObj, [captures, e]);
    };
  };

  this.buildDrugField = function(idx, drugData, drugDiv) {
    var drugDiv = document.createElement('div');
    var input_id = document.createElement('input');
    input_id.type = 'hidden';
    input_id.name = 'drug_id';
    input_id.value = idx;
  
    var input_check = document.createElement('input');
    input_check.type = 'checkbox';
    this.drugSelections.push(input_check);
    input_check.addEventListener('change', function(e) {
      var drugId = e.currentTarget.parentElement.firstElementChild.value;
      if (e.currentTarget.checked) {
        routeMap[drugId] = routeSelector.value;  
        drugPosition[drugId] = counter;
        counter += 1;
      } else {
        routeMap[drugId] = null;
        drugPosition[drugId] = null;
      }
      
      app.generatePrescription();
    });
  
    var span_drugname = document.createElement('span');
    span_drugname.innerText = drugData['name'];
  
    drugDiv.appendChild(input_id);
    drugDiv.appendChild(input_check);
    drugDiv.appendChild(span_drugname);
    return drugDiv;
  };

  this.buildCategoryDivs = function() {
    for (i in DRUGS_LIST) {
      var drug = DRUGS_LIST[i];
      var category = drug['category'];
      if (category == '') {
        category = 'OUTROS';
      }
      if (category in this.categoryDivs) {
        continue;
      }

      var categoryDiv = document.createElement('div');
      var categoryName = document.createElement('a');
      var categoryContent = document.createElement('div');

      categoryDiv.setAttribute('class', 'categoria');
      categoryContent.setAttribute('class', 'collapsed');
      categoryName.setAttribute('href', '#');

      categoryName.appendChild(document.createTextNode(category));
      categoryDiv.appendChild(categoryName);
      categoryDiv.appendChild(categoryContent);

      categoryName.addEventListener('click', function() {
        var categoryContent = this.parentElement.childNodes[1];
        if (categoryContent.className == 'collapsed') {
          categoryContent.setAttribute('class', 'expanded');
        } else if (categoryContent.className == 'expanded') {
          categoryContent.setAttribute('class', 'collapsed');
        }
      });
      this.drugsForm.appendChild(categoryDiv);
      this.categoryDivs[category] = categoryDiv;
    }
  };

  this.expandAll = function() {
    document.getElementById('expand-all').setAttribute('style', 'display: none');
    document.getElementById('collapse-all').setAttribute('style', '');
    var nodes = document.querySelectorAll('.collapsed');
    for (node of nodes) {
      node.setAttribute('class', 'expanded');
    }
  };

  this.collapseAll = function() {
    document.getElementById('expand-all').setAttribute('style', '');
    document.getElementById('collapse-all').setAttribute('style', 'display: none');
    var nodes = document.querySelectorAll('.expanded');
    for (node of nodes) {
      node.setAttribute('class', 'collapsed');
    }
  };

  this.resetPrescription = function() {
    // reset inner state;
    this.routeMap = {};
    this.drugPosition = [];
    this.routeSelector.value = 'Uso oral';
    // Unselect all drugs.
    for (idx in this.drugSelections) {
      this.drugSelections[idx].checked = false;
    }
    // Clear copy if it exists.
    var allclones = document.querySelectorAll('.clone');
    allclones.forEach(function (clone) {
      clone.remove();
    })
    this.app.generatePrescription();
  }

  this.buildSpecialPrescriptionToggle = function() {
    var toggleDiv = document.createElement('div');
    toggleDiv.className = 'specialPrescriptionToggle';
    toggleDiv.innerHTML = 
      "<label class='switch'>" + 
        "<input type='checkbox' id='useSpecialPrescription'>" +
        "<span class='slider round'></span>" +
      "</label>" +
      "<span class='specialPrescriptionLabel'>" +
        "Receituário de Controle Especial"
      "</span>";
      this.drugsForm.appendChild(toggleDiv);

      var specialPrescriptionSelector = document.getElementById('useSpecialPrescription');
      specialPrescriptionSelector.addEventListener('change', function() {
        app.toggleSpecialPrescription(this.checked);
      });

  };

  this.buildRouteSelector = function() {
    var selectorHtml = 
      "<label for='route-list'>Via de uso da droga: </label>" +
      "<select id='route-list' name='route'>"+
        "<option value='Uso oral'>Uso oral</option>" +
        "<option value='Uso Tópico'>Uso Tópico</option>" +
        "<option value='Uso Nasal'>Uso Nasal</option>" +
        "<option value='Uso Vaginal'>Uso Vaginal</option>" +
        "<option value='Uso Retal'>Uso Retal</option>" +
        "<option value='Uso Subcutâneo'>Uso Subcutâneo</option>" +
        "<option value='Uso Intramuscular'>Uso Intramuscular</option>" +
        "<option value='Uso Intravenoso'>Uso Intravenoso</option>" +
        "<option value='Uso Oftálmico'>Uso Oftálmico</option>" +
        "<option value='Uso Otológico'>Uso Otológico</option>" +
      "</select>";
    var selectorDiv = document.createElement("div");
    selectorDiv.id = 'route-selector';
    selectorDiv.innerHTML = selectorHtml;
    this.drugsForm.appendChild(selectorDiv);
    this.routeSelector = document.getElementById('route-list');
  };

  this.buildForm = function() {
    var expandAll = document.createElement('a');
    expandAll.appendChild(document.createTextNode('expandir'));
    expandAll.setAttribute('id', 'expand-all');
    expandAll.setAttribute('href', '#');
    expandAll.addEventListener('click',
      this.createHandler(this.expandAll));

    var collapseAll = document.createElement('a');
    collapseAll.appendChild(document.createTextNode('colapsar'));
    collapseAll.setAttribute('id', 'collapse-all');
    collapseAll.setAttribute('style', 'display: none');
    collapseAll.setAttribute('href', '#');
    collapseAll.addEventListener('click',
      this.createHandler(this.collapseAll));

    var resetDrugs = document.createElement('a');
    resetDrugs.id = 'resetDrugs';
    resetDrugs.href = '#';
    resetDrugs.innerText = 'Desmarcar todas';
    resetDrugs.addEventListener('click',
      this.createHandler(this.resetPrescription));

    this.drugsForm.appendChild(expandAll);
    this.drugsForm.appendChild(collapseAll);
    this.drugsForm.appendChild(resetDrugs);
    this.buildSpecialPrescriptionToggle();
    this.buildRouteSelector();

    var printBtn = document.createElement('button');
    printBtn.innerText = 'Prepare to print';
    this.drugsForm.appendChild(printBtn);
    printBtn.addEventListener('click', function(e){
      var cloned = document.getElementsByClassName('main-column')[0].cloneNode(true);
      cloned.classList.add('clone');
      var parent = document.getElementsByClassName('content')[0];
      parent.appendChild(cloned);
    });

    this.buildCategoryDivs();
    for (i in DRUGS_LIST) {
      var drug = DRUGS_LIST[i];
      var drugDiv = this.buildDrugField(i, drug);

      var category = drug['category'];
      var categoryDiv = this.categoryDivs[category];
      categoryDiv.childNodes[1].appendChild(drugDiv);
    }
  };

  this.getDrugDataForCheckbox = function(checkbox) {
    var parent = checkbox.parentElement;
    var hiddenField = parent.firstElementChild;
    var drugId = parseInt(hiddenField.value);
    var drugData = DRUGS_LIST[drugId];
    if (drugId in this.routeMap &&
        this.routeMap[drugId] != null &&
        this.routeMap[drugId] != "") {
      drugData['route'] = this.routeMap[drugId];
    }
    if (drugId in this.drugPosition &&
        this.drugPosition[drugId] != null &&
        this.drugPosition[drugId] > 0) {
      drugData['position'] = this.drugPosition[drugId];
    }
    return drugData;
  };

  this.getSelectedDrugs = function() {
    var selectedDrugs = [];
    for (idx in this.drugSelections) {
      var checkbox = this.drugSelections[idx];
      if (checkbox.checked) {
        selectedDrugs.push(this.getDrugDataForCheckbox(checkbox));
      }
    }
    selectedDrugs = selectedDrugs.sort(function(a, b) {
      return a['position'] - b['position'];
    });
    return selectedDrugs;
  };

  return this;
};

var ReceitaDiv = function(_app) {
  this.app = _app;
  this.prescriptionDiv = null;
  this.currentDrugPositions = [];
  this.currentPositionToIds = {};

  this.switchPrescriptionMode = function(enableSpecialPrescription) {
    if (this.prescriptionDiv) {
      this.prescriptionDiv.innerHTML = "";
      this.currentDrugPositions = [];
      this.currentPositionToIds = {};
    }

    var simplePrescription = document.querySelector('.simple-prescription-form');
    var specialPrescription = document.querySelector('.special-prescription-form');
    var show = function(element) {
      element.hidden = false;
      element.classList.add('enabled');
      element.classList.remove('disabled');
    };
    var hide = function(element) {
      element.hidden = true;
      element.classList.add('disabled');
      element.classList.remove('enabled');
    };
    if (enableSpecialPrescription) {
      this.prescriptionDiv = document.querySelector('#receita-especial');
      hide(simplePrescription);
      show(specialPrescription);
    } else {
      this.prescriptionDiv = document.querySelector('#receita-simples');
      show(simplePrescription);
      hide(specialPrescription);
    }
  };

  this.getTextForDrug = function(drugData) {
    var tmpl =
      "{{drug}} {{dashes}} {{amount}}\r\n" +
      "{{instructions}}\r\n" +
      "{{brand}}";
  
    let replaceKey = function(tmpl, tmplVar, key) {
      if (key in  drugData) {
        return tmpl.replace(tmplVar, drugData[key]);
      } else {
        return tmpl.replace(tmplVar, '');
      }  
    };  

    var colWidth = 60;
    var numDashes = 0;
    if ('quantity' in drugData) {
      numDashes = colWidth - 2 - drugData['name'].length - drugData['quantity'].length;
    }
    if (numDashes < 1) {
      numDashes = 1;
    }
    drugData["dashes"] = '-'.repeat(numDashes);

    tmpl = replaceKey(tmpl, "{{drug}}", "name");
    tmpl = replaceKey(tmpl, "{{dashes}}", "dashes");
    tmpl = replaceKey(tmpl, "{{amount}}", "quantity");
    tmpl = replaceKey(tmpl, "{{instructions}}", "instructions");
    tmpl = replaceKey(tmpl, "{{brand}}", "brand");
    while (tmpl.endsWith('\r\n')) {
      tmpl = tmpl.substr(0, tmpl.length - 2);
    }
    return tmpl;
  };

  this.buildIconsPanel = function() {
    var numCols = 2;
    var icons = ['pro-coffee.svg',
                 'pro-sun.svg',
                 'pro-moon.svg'];
    var iconsDiv = document.createElement('div');
    iconsDiv.classList = ['drug-icons'];

    for (var i = 0; i < icons.length; i += 1) {
      var newIcon = document.createElement('img');
      newIcon.src = '/static/images/icons/' + icons[i];
      newIcon.classList = ['unchecked'];
      iconsDiv.appendChild(newIcon);

      newIcon.addEventListener('click', function(e) {
        var eventSrc = e.currentTarget;
        var isChecked = eventSrc.classList.contains('checked');
        if (isChecked) {
          eventSrc.classList.add('unchecked');
          eventSrc.classList.remove('checked');
        } else {
          eventSrc.classList.add('checked');
          eventSrc.classList.remove('unchecked');
        }
      });
    }

    return iconsDiv;
  };

  this.addDrug = function(drugData) {
    var drugText = this.getTextForDrug(drugData);
    var listItem = document.createElement('li');
    var posSpan = document.createElement('span');
    var textarea = document.createElement('textarea');
    listItem.setAttribute('id', 'drug' + drugData['id']);
    listItem.className = 'receitaItem';
    textarea.setAttribute('cols', 60);
    textarea.value = drugText;
    listItem.appendChild(posSpan);
    listItem.appendChild(this.buildIconsPanel());
    listItem.appendChild(textarea);
    this.prescriptionDiv.appendChild(listItem);

    // Need to do this after the textarea is appended to the doc.
    textarea.style.height = '';
    textarea.style.width = '';
    textarea.style.height = textarea.scrollHeight + 3 + 'px';
    textarea.style.width = textarea.scrollWidth + 3 + 'px';
  };

  this.removeDrugWithId = function(drugId) {
    var drugNode = document.getElementById('drug' + drugId);
    if (drugNode) {
      drugNode.remove();
    } else {
      console.log("Error: trying to remove drug with id 'drug" + drugId + "' " +
                  "but it was not found in the DOM.");
    }
  }

  this.renderDrugs = function(selectedDrugs) {
    var updatedDrugPositions = [];
    var positionToId = {};
    var idToDrugData = {}
    for (idx in selectedDrugs) {
      var drug = selectedDrugs[idx];
      updatedDrugPositions.push(drug['position']);
      positionToId[drug['position']] = drug['id'];
      idToDrugData[drug['id']] = drug;
    }

    var currentIdx = 0;
    var updatedIdx = 0;
    while (currentIdx < this.currentDrugPositions.length) {
      var currentPos = this.currentDrugPositions[currentIdx];
      if (updatedIdx >= updatedDrugPositions.length) {
        // We are probably removing the last drug here.
        this.removeDrugWithId(this.currentPositionToIds[currentPos]);
        currentIdx += 1;
      }

      // updatedIdx is smaller than updatedDrugPositions.length. This is safe.
      var updatedPos = updatedDrugPositions[updatedIdx];
      if (updatedPos == currentPos) {
        // Same drug. Increment both, and continue.
        currentIdx += 1;
        updatedIdx += 1;
      } else if (currentPos < updatedPos) {
        // Some drug in the middle was unselected. Increment only currentIdx.
        this.removeDrugWithId(this.currentPositionToIds[currentPos]);
        currentIdx += 1; 
      } else if (currentPos > updatedPos) {
        var errorMsg = 'currentPos > updatedPos ' + 
                       '('+ currentPos + ' > '+ updatedPos +'). ' +
                       'This should never happen.';
        console.log(errorMsg)
      }
    }
    while (updatedIdx < updatedDrugPositions.length) {
      var updatedPos = updatedDrugPositions[updatedIdx];
      var drugId = positionToId[updatedPos];
      var drugData = idToDrugData[drugId];
      this.addDrug(drugData);
      updatedIdx += 1;
    }

    // Now, finalize the prescription. Add numbers to each list item, and add
    // router headers. But start by removing already existing headers.
    document.querySelectorAll('.routeHeader').forEach(function (h) {
      h.remove();
    });
    var receitaItems = document.querySelectorAll('.receitaItem');
    var listNumber = 1;
    var previousRoute = null;
    for (var idx = 0; idx < receitaItems.length; idx += 1) {
      var drugNode =  receitaItems[idx];
      var drugId = Number(drugNode.id.substr(4));

      // Set numbers for each drug to represent an ordered list.
      var posSpan = drugNode.firstElementChild;
      posSpan.innerText = listNumber + ')';  /* WAAAAT?!?! */
      listNumber = listNumber + 1;

      // Maybe add a header for route before drugNode.
      var drugRoute = idToDrugData[drugId]['route'];
      if (drugRoute != null &&
          drugRoute != "" &&
          (drugRoute != previousRoute || previousRoute == null)) {
        var routeDiv = document.createElement('div');
        routeDiv.classList.add('routeHeader');
        routeDiv.innerText = drugRoute;
        this.prescriptionDiv.insertBefore(routeDiv, drugNode);
        previousRoute = drugRoute;
      } 
    } 

    // Update list of current drugs.
    this.currentDrugPositions = updatedDrugPositions;
    this.currentPositionToIds = positionToId;
  };

  return this;
};

var ReceitaApp = function() {
  this.prescriptionHandler = null;
  this.drugsHandler = null;

  this.loadDrugsList = async function() {
    var DRUGS_JSON_URL = '/drugs'
    var xhr = new XMLHttpRequest();
    xhr.open("GET", DRUGS_JSON_URL, false);  // synchronous request
    xhr.send(null);
    var contents = xhr.responseText;
    DRUGS_LIST = JSON.parse(contents);
  };

  this.generatePrescription = function() {
    var selectedDrugs = this.drugsHandler.getSelectedDrugs();
    this.prescriptionHandler.renderDrugs(selectedDrugs);
  };
  
  this.toggleSpecialPrescription = function(enableSpecialPrescription) {
    // Gather patient name.
    var patientField = document.querySelector(
      'div.prescription-form.enabled input[name="patient-name"]');
    var patientName = patientField.value;

    this.prescriptionHandler.switchPrescriptionMode(enableSpecialPrescription);
    var selectedDrugs = this.drugsHandler.getSelectedDrugs();
    this.prescriptionHandler.renderDrugs(selectedDrugs);

    // Restore patient name in new patient field.
    var patientField = document.querySelector(
      'div.prescription-form.enabled input[name="patient-name"]');
    patientField.value = patientName;
  };

  this.start = function() {
    const dateOpts = { year: 'numeric', month: 'numeric', day: 'numeric' };
    var today = new Date();
    var dateText = today.toLocaleDateString('pt-BR', dateOpts);
    document.querySelectorAll('span.autofill-date').forEach(function(p) {
      p.innerText = dateText;
    });

    this.loadDrugsList();
    this.prescriptionHandler = ReceitaDiv(this);
    this.prescriptionHandler.switchPrescriptionMode(false);
    this.drugsHandler = DrugsForm(this);
    this.drugsHandler.buildForm();
  };

  return this;
};

window.addEventListener('load', function() {
  APP = ReceitaApp();
  APP.start();
});
