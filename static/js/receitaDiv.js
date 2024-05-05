import IconSelect from './iconSelect.js';
import { InstructionsForDoctors } from './instructions_for_doctors.js';

class CustomizedTextHandler {
  constructor(receitaDiv, drugPosition, printableTextDiv, drugTextArea) {
    this.receitaDiv = receitaDiv;
    this.drugPosition = drugPosition;
    this.printableTextDiv = printableTextDiv;
    this.drugTextArea = drugTextArea;
  }
  handleCustomizedText = function (e) {
    var newText = this.drugTextArea.value;
    this.printableTextDiv.innerText = newText;
    this.receitaDiv.drugCustomText[this.drugPosition] = newText;
  };
}


export default class ReceitaDiv {
  constructor(_app) {
    this.prescriptionDiv = null;
    this.drugCustomText = {};
    this.drugSupportIconSelectors = {};
    this.drugInstructions = {};
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

  addDrug = function (drugData, drugListNumber) {
    var position = drugData['position'];
    var drugId = drugData['id'];
    if (!(position in this.drugCustomText)) {
      this.drugCustomText[position] = this.getTextForDrug(drugData);
    }
    var drugText = this.drugCustomText[position];
    if (!(position in this.drugSupportIconSelectors)) {
      var newIconSelector = new IconSelect();
      if (drugData['support_icons'] && drugData['support_icons'] != '') {
        var iconUrls = drugData['support_icons'].split(',');
        newIconSelector.selectedUrls = iconUrls;
        newIconSelector.buildOptions();
      }
      this.drugSupportIconSelectors[position] = newIconSelector;
    }
    var iconSelector = this.drugSupportIconSelectors[position];
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
    var customTextHandler = new CustomizedTextHandler(this, position, printableText, textarea);
    
    textarea.addEventListener('keyup', this.handleCustomizedText.bind(customTextHandler));
    drugTextWrapper.appendChild(textarea);
    drugTextWrapper.appendChild(printableText);
    var divFirstRow = document.createElement("div");
    divFirstRow.classList.add('drug-info');
    divFirstRow.appendChild(posSpan);
    divFirstRow.appendChild(drugTextWrapper);
    divFirstRow.appendChild(iconSelector.root);
    listItem.appendChild(divFirstRow);
    
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
      if (drugId in this.drugInstructions) {
        instructionsForDoctors = this.drugInstructions[drugId];
      } else {
        instructionsForDoctors = new InstructionsForDoctors(drugData);
        this.drugInstructions[drugId] = instructionsForDoctors;
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
    listItem.appendChild(outerDiv);
    this.prescriptionDiv.appendChild(listItem);
    return listItem;
  }

  renderDrugs = function (selectedDrugs) {
    this.prescriptionDiv.innerHTML = "";
    this.prescriptionDiv.classList = "group-by-route";
    var groupKey = function (drug) {
      return [drug['route']];
    };
    var drugSets = {};
    for (var idx in selectedDrugs) {
      var selectedDrug = selectedDrugs[idx];
      groupKey(selectedDrug).forEach(function (group) {
        if (!(group in drugSets)) {
          drugSets[group] = [];
        }
        drugSets[group].push(selectedDrug);
      });
    }
    var sortedDrugSets = {};
    for (var group in drugSets) {
      sortedDrugSets[group] = drugSets[group].sort(function (a, b) { return a['position'] - b['position']; });
    }
    var listNumber = 1;
    for (var group in sortedDrugSets) {
      var drugsInGroup = sortedDrugSets[group];
      var groupDiv = document.createElement('div');
      groupDiv.classList.add('routeHeader');
      groupDiv.innerText = group;
      this.prescriptionDiv.appendChild(groupDiv);
      for (var idx in drugsInGroup) {
        var drugData = drugsInGroup[idx];
        if (drugData.is_link) {
          this.addLink(drugData);
        } else if (drugData.is_image) {
          this.addImage(drugData);
        } else {
          this.addDrug(drugData, listNumber);
          listNumber = listNumber + 1;
        }
      }
    }
  }
}

