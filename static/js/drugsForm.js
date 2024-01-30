class DrugSelectionHandler {
  constructor(_drugsForm, drugId) {
    this.drugsForm = _drugsForm;
    this.drugId = drugId;
  }
  handleDrugSelection = function (e) {
    var currentRoute = this.drugsForm.routeSelector.value;
    if (e.currentTarget.checked) {
      this.drugsForm.routeMap[this.drugId] = currentRoute;
      this.drugsForm.drugPosition[this.drugId] = this.drugsForm.counter;
      this.drugsForm.counter += 1;
    }
    else {
      this.drugsForm.routeMap[this.drugId] = null;
      this.drugsForm.drugPosition[this.drugId] = null;
    }
    this.drugsForm.app.generatePrescription();
  }
}

export default class DrugsForm {
  constructor(_app, drugsList) {
    this.app = _app;
    this.drugsList = drugsList;
    this.drugsForm = document.getElementById('drogas-form');
    this.drugSelections = [];
    this.categoryDivs = {};
    this.routeMap = {};
    this.routeSelector = null;
    this.counter = 1;
    this.drugPosition = {};
  }
  createHandler = function (method, captures) {
    var targetObj = this;
    return function (e) {
      method.apply(targetObj, [captures, e]);
    };
  }

  handleDrugSelection = function (e) {
    this.handleDrugSelection(e);
  }

  buildDrugField = function (idx, drugData, drugDiv) {
    var drugDiv = document.createElement('div');
    var input_id = document.createElement('input');
    input_id.type = 'hidden';
    input_id.name = 'drug_id';
    input_id.value = idx;
    var input_check = document.createElement('input');
    input_check.type = 'checkbox';
    this.drugSelections.push(input_check);

    var drugSelectionHandler = new DrugSelectionHandler(this, idx);
    input_check.addEventListener('change', this.handleDrugSelection.bind(drugSelectionHandler));
    var span_drugname = document.createElement('span');
    span_drugname.innerText = drugData['name'];
    drugDiv.appendChild(input_id);
    drugDiv.appendChild(input_check);
    drugDiv.appendChild(span_drugname);
    return drugDiv;
  }

  buildCategory = function(category) {
    if (category == '') {
      category = 'OUTROS';
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
    categoryName.addEventListener('click', function () {
      var categoryContent = this.parentElement.childNodes[1];
      if (categoryContent.className == 'collapsed') {
        categoryContent.setAttribute('class', 'expanded');
      }
      else if (categoryContent.className == 'expanded') {
        categoryContent.setAttribute('class', 'collapsed');
      }
    });
    this.drugsForm.appendChild(categoryDiv);
    this.categoryDivs[category] = categoryDiv;
  };

  buildCategoryDivs = function () {
    var categories = new Set();
    this.drugsList.forEach(drug => categories.add(drug['category']));
    
    var specialCategories = [
        'DIGITAR QUALQUER MEDICAMENTO',
        'SALA DE PROCEDIMENTOS',
        'Imagens',
        'Videos',
        'VALIDADE',
        'DIABETES',
        'HIPERTENSÃO / CARDIO'];
    specialCategories.forEach(this.buildCategory.bind(this));
    specialCategories.forEach(specialCategory => categories.delete(specialCategory));
    
    var sortedCategories = Array.from(categories).sort();
    sortedCategories.forEach(this.buildCategory.bind(this));
  }

  expandAll = function () {
    document.getElementById('expand-all').setAttribute('style', 'display: none');
    document.getElementById('collapse-all').setAttribute('style', '');
    var nodes = document.querySelectorAll('.collapsed');
    for (var node of nodes) {
      node.setAttribute('class', 'expanded');
    }
  }

  collapseAll = function () {
    document.getElementById('expand-all').setAttribute('style', '');
    document.getElementById('collapse-all').setAttribute('style', 'display: none');
    var nodes = document.querySelectorAll('.expanded');
    for (var node of nodes) {
      node.setAttribute('class', 'collapsed');
    }
  }

  resetPrescription = function () {
    // reset inner state;
    this.routeMap = {};
    this.drugPosition = [];
    this.routeSelector.value = 'Uso oral';
    // Unselect all drugs.
    for (var idx in this.drugSelections) {
      this.drugSelections[idx].checked = false;
    }
    // Clear copy if it exists.
    var allclones = document.querySelectorAll('.clone');
    allclones.forEach(function (clone) {
      clone.remove();
    });
    this.app.generatePrescription();
  }

  buildSpecialPrescriptionToggle = function () {
    var toggleDiv = document.createElement('div');
    toggleDiv.className = 'specialPrescriptionToggle';
    toggleDiv.innerHTML =
      "<label class='switch'>" +
      "<input type='checkbox' id='useSpecialPrescription'>" +
      "<span class='slider round'></span>" +
      "</label>" +
      "<span class='specialPrescriptionLabel'>" +
      "Receituário de Controle Especial";
    "</span>";
    this.drugsForm.appendChild(toggleDiv);
    var specialPrescriptionSelector = document.getElementById('useSpecialPrescription');
    specialPrescriptionSelector.addEventListener('change', (function (e) {
      this.app.toggleSpecialPrescription(e.currentTarget.checked);
    }).bind(this));
  }

  buildRouteSelector = function () {
    var selectorHtml = "<label for='route-list'>Via de uso da droga: </label>" +
      "<select id='route-list' name='route'>" +
      "<option value='Uso oral'>Uso oral</option>" +
      "<option value='Uso oral contínuo'>Uso oral contínuo</option>" +
      "<option value='Uso Tópico'>Uso Tópico</option>" +
      "<option value='Uso Nasal'>Uso Nasal</option>" +
      "<option value='Uso Vaginal'>Uso Vaginal</option>" +
      "<option value='Uso Retal'>Uso Retal</option>" +
      "<option value='Uso Subcutâneo'>Uso Subcutâneo</option>" +
      "<option value='Uso Intramuscular'>Uso Intramuscular</option>" +
      "<option value='Uso Intravenoso'>Uso Intravenoso</option>" +
      "<option value='Uso Oftálmico'>Uso Oftálmico</option>" +
      "<option value='Uso Otológico'>Uso Otológico</option>" +
      "<option value='Uso Inalatório'>Uso Inalatório</option>" +
      "<option value='Nebulização'>Nebulização</option>" +
      "<option value='Declaração'>Declaração</option>" +
      "<option value='Relatório'>Relatório</option>" +
      "<option value='Laudo Médico'>Laudo Médico</option>" +
      "<option value='Orientações'>Orientações</option>" +
      "<option value='Encaminhamento'>Encaminhamento</option>" +
      "<option value='Retorno'>Retorno</option>" +
      "<option value='Atestado'>Atestado</option>" +
      "<option value='Solicitação de exames'>Solicitação de exames</option>" +
      "</select>";
    var selectorDiv = document.createElement("div");
    selectorDiv.id = 'route-selector';
    selectorDiv.innerHTML = selectorHtml;
    this.drugsForm.appendChild(selectorDiv);
    this.routeSelector = document.getElementById('route-list');
  }

  buildForm = function () {
    var expandAll = document.createElement('a');
    expandAll.appendChild(document.createTextNode('expandir'));
    expandAll.setAttribute('id', 'expand-all');
    expandAll.setAttribute('href', '#');
    expandAll.addEventListener('click', this.createHandler(this.expandAll));
    var collapseAll = document.createElement('a');
    collapseAll.appendChild(document.createTextNode('colapsar'));
    collapseAll.setAttribute('id', 'collapse-all');
    collapseAll.setAttribute('style', 'display: none');
    collapseAll.setAttribute('href', '#');
    collapseAll.addEventListener('click', this.createHandler(this.collapseAll));
    var resetDrugs = document.createElement('a');
    resetDrugs.id = 'resetDrugs';
    resetDrugs.href = '#';
    resetDrugs.innerText = 'Desmarcar todas';
    resetDrugs.addEventListener('click', this.createHandler(this.resetPrescription));
    this.drugsForm.appendChild(expandAll);
    this.drugsForm.appendChild(collapseAll);
    this.drugsForm.appendChild(resetDrugs);
    this.buildSpecialPrescriptionToggle();
    this.buildRouteSelector();
    var printBtn = document.createElement('button');
    printBtn.innerText = 'Duplicar página';
    this.drugsForm.appendChild(printBtn);
    printBtn.addEventListener('click', function (e) {
      var cloned = document.getElementsByClassName('main-column')[0].cloneNode(true);
      cloned.classList.add('clone');
      var parent = document.getElementsByClassName('content')[0];
      parent.appendChild(cloned);
    });
    this.buildCategoryDivs();
    for (var i in this.drugsList) {
      var drug = this.drugsList[i];
      var drugDiv = this.buildDrugField(i, drug);
      var category = drug['category'];
      var categoryDiv = this.categoryDivs[category];
      categoryDiv.childNodes[1].appendChild(drugDiv);
    }
  }
  getDrugDataForCheckbox = function (checkbox) {
    var parent = checkbox.parentElement;
    var hiddenField = parent.firstElementChild;
    var drugId = parseInt(hiddenField.value);
    var drugData = this.drugsList[drugId];
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
  }
  getSelectedDrugs = function () {
    var selectedDrugs = [];
    for (var idx in this.drugSelections) {
      var checkbox = this.drugSelections[idx];
      if (checkbox.checked) {
        selectedDrugs.push(this.getDrugDataForCheckbox(checkbox));
      }
    }
    selectedDrugs = selectedDrugs.sort(function (a, b) {
      return a['position'] - b['position'];
    });
    return selectedDrugs;
  }
}
