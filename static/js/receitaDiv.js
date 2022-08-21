import IconSelect from './iconSelect.js';

class IconClickHandler {
  constructor(receitaDiv, drugId, schedule) {
    this.receitaDiv = receitaDiv;
    this.drugId = drugId;
    this.schedule = schedule;
  }
  handleClick(e) {
    var eventSrc = e.currentTarget;
    var isChecked = eventSrc.classList.contains('checked');
    if (!(this.drugId in this.receitaDiv.drugSchedule)) {
      this.receitaDiv.drugSchedule[this.drugId] = new Set();
    }
    if (isChecked) {
      this.receitaDiv.drugSchedule[this.drugId].delete(this.schedule);
      eventSrc.classList.add('unchecked');
      eventSrc.classList.remove('checked');
    }
    else {
      this.receitaDiv.drugSchedule[this.drugId].add(this.schedule);
      eventSrc.classList.add('checked');
      eventSrc.classList.remove('unchecked');
    }
  }
};

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
    this.group_by = 'route';
    this.drugSchedule = {};
    this.drugCustomText = {};
    this.drugSupportIconSelectors = {};
  }

  handleIconClick = function (e) {
    this.handleClick(e);
  }
  handleCustomizedText = function (e) {
    this.handleCustomizedText(e);
  }

  buildIconsPanel = function (drugData) {
    var drugId = drugData['id'];
    var icons = ['pro-coffee.svg',
      'pro-sun.svg',
      'pro-moon.svg'];
    var iconsDiv = document.createElement('div');
    iconsDiv.classList = ['drug-icons'];
    for (var i = 0; i < icons.length; i += 1) {
      var newIcon = document.createElement('img');
      newIcon.src = '/static/images/icons/' + icons[i];
      if (drugId in this.drugSchedule && this.drugSchedule[drugId].has(i)) {
        newIcon.classList = ['checked'];
      }
      else {
        newIcon.classList = ['unchecked'];
      }
      iconsDiv.appendChild(newIcon);
      var iconClickHandler = new IconClickHandler(this, drugId, i);
      newIcon.addEventListener('click', this.handleIconClick.bind(iconClickHandler));
    }
    return iconsDiv;
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
    var colWidth = 55;
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

  addDrug = function (drugData) {
    var position = drugData['position'];
    if (!(position in this.drugCustomText)) {
      this.drugCustomText[position] = this.getTextForDrug(drugData);
    }
    var drugText = this.drugCustomText[position];
    if (!(position in this.drugSupportIconSelectors)) {
      this.drugSupportIconSelectors[position] = new IconSelect();
    }
    var iconSelector = this.drugSupportIconSelectors[position];
    var listItem = document.createElement('li');
    var posSpan = document.createElement('span');
    var drugTextWrapper = document.createElement('div');
    var textarea = document.createElement('textarea');
    var printableText = document.createElement('div');
    listItem.classList = ['receitaItem'];
    drugTextWrapper.classList = ['drug-text-wrapper'];
    printableText.classList = ['printable-drug-text'];
    listItem.setAttribute('id', 'drug' + drugData['id']);
    textarea.setAttribute('cols', 60);

    textarea.value = drugText;
    printableText.innerText = drugText;
    var customTextHandler = new CustomizedTextHandler(this, position, printableText, textarea);

    textarea.addEventListener('keyup', this.handleCustomizedText.bind(customTextHandler));
    listItem.appendChild(posSpan);
    listItem.appendChild(this.buildIconsPanel(drugData));
    drugTextWrapper.appendChild(textarea);
    drugTextWrapper.appendChild(printableText);
    listItem.appendChild(drugTextWrapper);
    listItem.appendChild(iconSelector.root);
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
    var posSpan = document.createElement('span');
    var titleSpan = document.createElement('span');
    var qrCode = document.createElement('img');
    var url = "https://chart.googleapis.com/chart?chs=80x80&cht=qr&chl=" + drugData.instructions;
    listItem.setAttribute('id', 'drug' + drugData['id']);
    listItem.classList = ['receitaItem'];
    listItem.classList.add('externalLink');
    listItem.appendChild(posSpan);
    titleSpan.innerText = drugData.name;
    listItem.appendChild(titleSpan);
    qrCode.src = url;
    listItem.appendChild(qrCode);
    this.prescriptionDiv.appendChild(listItem);
    return listItem;
  }

  addImage = function (drugData) {
    var listItem = document.createElement('li');
    var posSpan = document.createElement('span');
    var outerDiv = document.createElement('div');
    var titleSpan = document.createElement('div');
    var qrCode = document.createElement('img');
    var url = "https://storage.googleapis.com/receita-facil-prescribed-images/" + drugData.instructions;
    listItem.setAttribute('id', 'drug' + drugData['id']);
    listItem.classList = ['receitaItem'];
    listItem.classList.add('prescribed-image');
    titleSpan.innerText = drugData.name;
    qrCode.src = url;
    outerDiv.appendChild(titleSpan);
    outerDiv.appendChild(qrCode);
    listItem.appendChild(posSpan);
    listItem.appendChild(outerDiv);
    this.prescriptionDiv.appendChild(listItem);
    return listItem;
  }

  renderDrugs = function (selectedDrugs) {
    this.prescriptionDiv.innerHTML = "";
    this.prescriptionDiv.classList = (this.group_by == "route" ? ["group-by-route"] : ["group-by-schedule"]);
    var groupKey = function (drug, group_by) {
      if (group_by == 'route') {
        return [drug['route']];
      } else {
        return this.drugSchedule[drug['id']];
      }
    };
    var drugSets = {};
    for (var idx in selectedDrugs) {
      var selectedDrug = selectedDrugs[idx];
      groupKey(selectedDrug, this.group_by).forEach(function (group) {
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
      if (this.group_by == "schedule") {
        groupDiv.classList.add('group-' + group);
      }
      groupDiv.innerText = group;
      this.prescriptionDiv.appendChild(groupDiv);
      for (var idx in drugsInGroup) {
        var drugData = drugsInGroup[idx];
        var listItem = null;
        if (drugData.is_link) {
          listItem = this.addLink(drugData);
        }
        else if (drugData.is_image) {
          listItem = this.addImage(drugData);
        }
        else {
          listItem = this.addDrug(drugData);
        }
        var posSpan = listItem.firstElementChild;
        posSpan.innerText = listNumber + ')'; /* WAAAAT?!?! */
        listNumber = listNumber + 1;
      }
    }
  }
}

