class DrugSelectionHandler {
  constructor(_drugsForm, drugId) {
    this.drugsForm = _drugsForm;
    this.drugId = drugId;
  }
  handleDrugSelection = function (e) {
    var currentRoute = this.drugsForm.routeSelector.value;
    if (e.currentTarget.checked) {
      this.drugsForm.routeMap[this.drugId] = currentRoute;
        this.drugsForm.drugPosition[this.drugId] = Object.keys(this.drugsForm.drugPosition).length + 1;
    }
    else {
        delete this.drugsForm.routeMap[this.drugId];
        delete this.drugsForm.drugPosition[this.drugId];
        this.reassignDrugPositions();
        this.drugsForm.app.handleDrugRemove(this.drugId);
    }
    this.drugsForm.app.generatePrescription();
  }
  reassignDrugPositions = function () {
    let position = 1;
    const sortedDrugIds = Object.keys(this.drugsForm.drugPosition).sort((a, b) => this.drugsForm.drugPosition[a] - this.drugsForm.drugPosition[b]);
    sortedDrugIds.forEach(drugId => {
        this.drugsForm.drugPosition[drugId] = position++;
    });
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

  buildDrugField = function (drugData, drugDiv) {
    var drugDiv = document.createElement('div');
    var input_id = document.createElement('input');
    const drugIdx = drugData['idx'];
    input_id.type = 'hidden';
    input_id.name = 'drug_id';
    input_id.value =drugIdx;
    var input_check = document.createElement('input');
    input_check.type = 'checkbox';
    input_check.id = `drug_check_${drugIdx}`;
    input_check.value = drugIdx;
    input_check.classList.add('drug-checkbox');

    this.drugSelections.push(input_check);

    var drugSelectionHandler = new DrugSelectionHandler(this, drugIdx);
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
    this.app.resetPrescription(); 
    this.app.generatePrescription();
  }

  buildSpecialPrescriptionToggle = function () {
    var toggleDiv = document.createElement('div');
    toggleDiv.className = 'specialPrescriptionToggle toggleInput';
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
      "<option value='Uso Externo'>Uso Externo</option>" +
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
    this.buildPrintToggle();
    this.buildRouteSelector();
    this.buildCategoryDivs();
    this.drugsList.forEach((drug, index) => {
      drug.idx = index; 
      var drugDiv = this.buildDrugField(drug);
      var category = drug['category'];
      var categoryDiv = this.categoryDivs[category];
      categoryDiv.childNodes[1].appendChild(drugDiv);
    });
  }
  getDrugDataForCheckbox = function (checkbox) {
    const drugId= checkbox.value
    var drugData = this.drugsList[drugId];
    // For some drugs, route is already set in the database. For others, we
    // will read from routeMap.
    if (!drugData.route && this.routeMap[drugId]) {
      const route = this.routeMap[drugId];
      if (route) drugData.route = route; 
    }
    const position = this.drugPosition[drugId];
    if (position > 0) {
      drugData.position = position;
    }

    return drugData;
  }
  getSelectedDrugs = function () {  
    const checkboxList = document.querySelectorAll('.drug-checkbox:checked');
    var selectedDrugs = [];
    
    checkboxList.forEach(checkbox => {
      selectedDrugs.push(this.getDrugDataForCheckbox(checkbox));  
    });

    selectedDrugs = selectedDrugs.sort(function (a, b) {
      return a['position'] - b['position'];
    });
    return selectedDrugs;
  }
    buildPrintToggle = function () {
    var toggleDiv = document.createElement('div');
    toggleDiv.className = 'toggleInput'; 
    
    toggleDiv.innerHTML =`
      <label class='switch'> 
        <input type='checkbox' id='duplicatePrescriptionToggle'> 
        <span class='slider round'></span> 
      </label> 
      <span class='duplicatePrescriptionLabel'>Duplicar Página</span>`;    
    
    this.drugsForm.appendChild(toggleDiv);
  };
}
