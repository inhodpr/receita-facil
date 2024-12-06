import IconSelect from './iconSelect.js';
import { InstructionsForDoctors } from './instructions_for_doctors.js';

class CustomizedTextHandler {
  constructor(receitaDiv, drugIdx, printableTextDiv, drugTextArea) {
    this.receitaDiv = receitaDiv;
    this.drugPosition = drugIdx;
    this.printableTextDiv = printableTextDiv;
    this.drugTextArea = drugTextArea;
  }
  handleCustomizedText = function (e) {
    var newText = this.drugTextArea.value;
    this.printableTextDiv.innerText = newText;
    this.receitaDiv.drugCustomText[this.drugIdx] = newText;
  };
}


export default class ReceitaDiv {
  constructor(_app) {
    this.app = _app
    this.prescriptionDiv = null;
    this.drugCustomText = {};
    this.drugSupportIconSelectors = {};
    this.drugInstructions = {};
    this.createPrintEvents();
  }

  createPrintEvents = function () {
    window.addEventListener('beforeprint', () => this.handleBeforePrint());
    window.addEventListener('afterprint', () => this.handleAfterPrint());
  } 

  handleIconClick = function (e) {
    this.handleClick(e);
  }
  handleCustomizedText = function (e) {
    this.handleCustomizedText(e);
  }

  switchPrescriptionMode = function (enableSpecialPrescription) {
    if (this.prescriptionDiv) {
      this.prescriptionDiv.innerHTML = "";
    }
    var simplePrescription = document.querySelector('.simple-prescription-form');
    var specialPrescription = document.querySelector('.special-prescription-form');
    var show = function (element) {
      element.hidden = false;
      element.classList.add('enabled');
      element.classList.remove('disabled');
    };
    var hide = function (element) {
      element.hidden = true;
      element.classList.add('disabled');
      element.classList.remove('enabled');
    };
    if (enableSpecialPrescription) {
      this.prescriptionDiv = document.querySelector('#receita-especial');
      hide(simplePrescription);
      show(specialPrescription);
    }
    else {
      this.prescriptionDiv = document.querySelector('#receita-simples');
      show(simplePrescription);
      hide(specialPrescription);
    }
    this.handlePrintButtonOnPrescriptionModeChange(enableSpecialPrescription);
  }
    handlePrintButtonOnPrescriptionModeChange = function (enableSpecialPrescription) {
    const duplicatePrescriptionToggle = document.getElementById('duplicatePrescriptionToggle');
    if(duplicatePrescriptionToggle==null)return;
    
    if(enableSpecialPrescription){
      duplicatePrescriptionToggle.checked = true;
    }else{
      duplicatePrescriptionToggle.checked = false;
    }
  }

  getTextForDrug = function (drugData) {
    var tmpl = "{{drug}} {{dashes}} {{amount}}\r\n" +
      "{{instructions}}\r\n" +
      "{{brand}}";
    let replaceKey = function (tmpl, tmplVar, key) {
      if (key in drugData) {
        return tmpl.replace(tmplVar, drugData[key]);
      }
      else {
        return tmpl.replace(tmplVar, '');
      }
    };
    var colWidth = 40;
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
  }
  
  moveItemUp = function (drugIdx) {
    const currentPosition = this.app.drugsHandler.drugPosition[drugIdx];

    if (currentPosition <= 1) return; 
    const targetDrugId = Object.keys(this.app.drugsHandler.drugPosition).find(id => this.app.drugsHandler.drugPosition[id] === currentPosition - 1);
    if (targetDrugId) {
        this.app.drugsHandler.drugPosition[drugIdx] = currentPosition - 1;
        this.app.drugsHandler.drugPosition[targetDrugId] = currentPosition;
        this.app.generatePrescription();
    }
  };

  moveItemDown = function (drugIdx) {
    const currentPosition = this.app.drugsHandler.drugPosition[drugIdx];
    const maxPosition = Math.max(...Object.values(this.app.drugsHandler.drugPosition));
    if (currentPosition >= maxPosition) return; 
    const targetDrugId = Object.keys(this.app.drugsHandler.drugPosition).find(id => this.app.drugsHandler.drugPosition[id] === currentPosition + 1);
    if (targetDrugId) {
        this.app.drugsHandler.drugPosition[drugIdx] = currentPosition + 1;
        this.app.drugsHandler.drugPosition[targetDrugId] = currentPosition;
        this.app.generatePrescription();
    }
  };

  removeItem = function (drugIdx) {
    const checkbox = document.querySelector("#drug_check_"+drugIdx)
    if (checkbox) {
        checkbox.checked = false;
        const event = new Event('change');
        checkbox.dispatchEvent(event);
    }
  };

  createActionsButtonsContainers = function (drugIdx){
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('drug-buttons');

    const moveUpButton = document.createElement('button');
    moveUpButton.innerText = '↑';
    moveUpButton.title = 'Mover para Cima';
    moveUpButton.classList.add('button');
    moveUpButton.addEventListener('click', function(e) {
        e.preventDefault();
        this.moveItemUp(drugIdx);
    }.bind(this));

    const moveDownButton = document.createElement('button');
    moveDownButton.innerText = '↓';
    moveDownButton.title = 'Mover para Baixo';
    moveDownButton.classList.add('button');
    moveDownButton.addEventListener('click', function(e){
        e.preventDefault();
        this.moveItemDown(drugIdx);
    }.bind(this));

    const removeButton = document.createElement('button');
    removeButton.innerText = 'x';
    removeButton.title = 'Remover';
    removeButton.classList.add('button');
    removeButton.addEventListener('click', function(e){
        e.preventDefault();
        this.removeItem(drugIdx);
    }.bind(this));

    buttonContainer.appendChild(moveUpButton);
    buttonContainer.appendChild(moveDownButton);
    buttonContainer.appendChild(removeButton);
    return buttonContainer;
  }

  addDrug = function (drugData, drugListNumber) {
    var position = drugData['position'];
    var drugId = drugData['id'];
    const drugIdx = drugData['idx']
    if (!(drugIdx in this.drugCustomText)) {
      this.drugCustomText[drugIdx] = this.getTextForDrug(drugData);
    }
    var drugText = this.drugCustomText[drugIdx];
    if (!(drugIdx in this.drugSupportIconSelectors)) {
      var newIconSelector = new IconSelect();
      if (drugData['support_icons'] && drugData['support_icons'] != '') {
        var iconUrls = drugData['support_icons'].split(',');
        newIconSelector.selectedUrls = iconUrls;
        newIconSelector.buildOptions();
      }
      this.drugSupportIconSelectors[drugIdx] = newIconSelector;
    }
    var iconSelector = this.drugSupportIconSelectors[drugIdx];

    var groupDiv = document.createElement('div');
    groupDiv.classList.add('routeHeader');
    groupDiv.innerText = drugData['route'] || 'Uso Oral';

    var listItem = document.createElement('li');
    var posSpan = document.createElement('span');
    var drugTextWrapper = document.createElement('div');
    var textarea = document.createElement('textarea');
    var printableText = document.createElement('div');
    listItem.classList = ['receitaItem'];
    posSpan.innerText = drugListNumber + ')';
    drugTextWrapper.classList = ['drug-text-wrapper'];
    printableText.classList = ['printable-drug-text'];
    listItem.setAttribute('id', 'drug' + drugId);
    textarea.setAttribute('cols', 60);
    
    textarea.value = drugText;
    printableText.innerText = drugText;
    var customTextHandler = new CustomizedTextHandler(this, drugIdx, printableText, textarea);
    
    textarea.addEventListener('keyup', this.handleCustomizedText.bind(customTextHandler));
    drugTextWrapper.appendChild(textarea);
    drugTextWrapper.appendChild(printableText);
    var divFirstRow = document.createElement("div");
    divFirstRow.classList.add('drug-info');
    divFirstRow.appendChild(posSpan);
    divFirstRow.appendChild(drugTextWrapper);
    divFirstRow.appendChild(iconSelector.root);
    listItem.appendChild(groupDiv);
    listItem.appendChild(divFirstRow);

    divFirstRow.appendChild(this.createActionsButtonsContainers(drugIdx))
    // Add image, if available.
    if ('image_url' in drugData && drugData['image_url'].length > 0) {
      var imgForPatient = document.createElement('img');
      imgForPatient.src = drugData['image_url'];
      imgForPatient.classList.add('img-for-patient');
      listItem.appendChild(imgForPatient);
    }

    // Add QR Code, if available.
    if ('qr_code_url' in drugData && drugData['qr_code_url'].length > 0) {
      var qrCodeDiv = document.createElement('div');
      qrCodeDiv.classList.add('qr-code');

      var qrCodeImg = document.createElement('img');
      qrCodeImg.src = "https://image-charts.com/chart?chs=80x80&cht=qr&chl=" + drugData['qr_code_url'];
      
      var qrCodeSpan = document.createElement('span');
      qrCodeSpan.innerText = drugData['qr_code_subtitle'];
      
      qrCodeDiv.appendChild(qrCodeSpan);
      qrCodeDiv.appendChild(qrCodeImg);
      listItem.appendChild(qrCodeDiv);
    }
    
    // Add instructions for doctors, if available.
    if ('instructions_for_doctors' in drugData) {
      var instructionsForDoctors = null;
      if (drugIdx in this.drugInstructions) {
        instructionsForDoctors = this.drugInstructions[drugIdx];
      } else {
        instructionsForDoctors = new InstructionsForDoctors(drugData);
        this.drugInstructions[drugIdx] = instructionsForDoctors;
      }
      if (!instructionsForDoctors.isClosed()) {
        instructionsForDoctors.render(listItem);
      }
    }
    
    this.prescriptionDiv.appendChild(listItem);
    
    // Need to do this after the textarea is appended to the doc.
    textarea.style.height = '';
    textarea.style.width = '';
    textarea.style.height = textarea.scrollHeight + 3 + 'px';
    textarea.style.width = textarea.scrollWidth + 3 + 'px';
    return listItem;
  }

  addLink = function (drugData) {
    var listItem = document.createElement('li');
    var titleSpan = document.createElement('span');
    var qrCode = document.createElement('img');
    var url = "https://image-charts.com/chart?chs=80x80&cht=qr&chl=" + drugData.instructions;
    listItem.setAttribute('id', 'drug' + drugData['id']);
    listItem.classList = ['receitaItem'];
    listItem.classList.add('externalLink');
    titleSpan.innerText = drugData.name;
    listItem.appendChild(titleSpan);
    qrCode.src = url;
    listItem.appendChild(qrCode);
    listItem.appendChild(this.createActionsButtonsContainers(drugData['idx']))
    this.prescriptionDiv.appendChild(listItem);
    return listItem;
  }

  addImage = function (drugData) {
    var listItem = document.createElement('li');
    var outerDiv = document.createElement('div');
    var titleSpan = document.createElement('div');
    var qrCode = document.createElement('img');
    var url = "https://storage.googleapis.com/receita-facil-prescribed-images/" + drugData.instructions;
    var hideTitle = drugData.instructions.startsWith('packs/');
    listItem.setAttribute('id', 'drug' + drugData['id']);
    listItem.classList = ['receitaItem'];
    listItem.classList.add('prescribed-image');
    titleSpan.innerText = drugData.name;
    qrCode.src = url;
    if (!hideTitle) {
      outerDiv.appendChild(titleSpan);
    }
    outerDiv.appendChild(qrCode);
    outerDiv.appendChild(this.createActionsButtonsContainers(drugData['idx']))
    listItem.appendChild(outerDiv);
    this.prescriptionDiv.appendChild(listItem);
    return listItem;
  }

  renderDrugs = function (selectedDrugs) {
    this.prescriptionDiv.innerHTML = "";
    var listNumber = 1;
    for (const drug of selectedDrugs) {    
        if (drug.is_link) {
          this.addLink(drug);
        } else if (drug.is_image) {
          this.addImage(drug);
        } else {
          this.addDrug(drug, listNumber);
          listNumber = listNumber + 1;
        }
    }
  }

  handleBeforePrint = function () {
    const duplicatePrescriptionToggle = document.getElementById('duplicatePrescriptionToggle');
    if(duplicatePrescriptionToggle.checked){
      const cloned = document.getElementsByClassName('main-column')[0].cloneNode(true);
      cloned.classList.add('clone');
      cloned.id = 'clone'
      const parent = document.getElementsByClassName('content')[0];
      parent.appendChild(cloned);

      this.setPrintStyles('A4 landscape');
    }else{
      this.setPrintStyles('A4 portrait');
    }
  }

  handleAfterPrint = function () {
    var clone = document.querySelector('#clone');

    if (clone) {
      clone.remove();
    }
  }
  
  setPrintStyles= function (size) {
    let printStyles = document.querySelector('#print-styles');

    if (!printStyles) {
      printStyles = document.createElement('style');
      printStyles.id = 'print-styles';
      document.head.appendChild(printStyles);
    }

    printStyles.textContent = `@page { size: ${size}; }`;
  }
}

