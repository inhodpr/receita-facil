import ReceitaDiv from './receitaDiv.js';
import DrugsForm from './drugsForm.js';

export default class ReceitaApp {
    constructor() {
        this.prescriptionHandler = null;
        this.drugsHandler = null;
        this.city = null;
    }

    finishStart = function (drugsList) {
        this.prescriptionHandler = new ReceitaDiv(this);
        this.prescriptionHandler.switchPrescriptionMode(false);
        this.drugsHandler = new DrugsForm(this, drugsList);
        this.drugsHandler.buildForm();
    }

    loadDrugsList = async function (callback) {
        var DRUGS_JSON_URL = '/drugs';
        return fetch(DRUGS_JSON_URL).then(response => response.json());
    };

    start = function () {
        var currentUrl = new URL(document.URL);
        this.city = currentUrl.pathname.substr(1);

        this.bottomIndex = 0;  // Always start with an empty footnote.
        this.bottomDiv = document.getElementById('dynamic-bottom');
        this.nextBottomBtn = document.createElement("button");
        this.footnoteContents = document.createElement("span");
        this.nextBottomBtn.innerText = '>';
        this.nextBottomBtn.addEventListener('click', (e => this.advanceBottom(1)).bind(this));
        this.bottomDiv.appendChild(this.nextBottomBtn);
        this.bottomDiv.appendChild(this.footnoteContents);

        const dateOpts = { year: 'numeric', month: 'numeric', day: 'numeric' };
        var today = new Date();
        var dateText = today.toLocaleDateString('pt-BR', dateOpts);
        document.querySelectorAll('span.autofill-date').forEach(function (p) {
            p.innerText = dateText;
        });
        this.loadDrugsList().then(this.finishStart.bind(this));
        this.advanceBottom(0);
    }

    advanceBottom = function (delta = 1) {
        this.bottomIndex += delta;
        if (this.bottomDiv != null) {
            var bottomRequestUrl = new URL('/bottom', document.location);
            bottomRequestUrl.searchParams.set('city', this.city);
            bottomRequestUrl.searchParams.set('idx', this.bottomIndex);
            fetch(bottomRequestUrl).then(
                r => r.text())
                .then((function (htmlContents) {
                    this.footnoteContents.innerHTML = htmlContents;
                    footnote.innerHTML = htmlContents;
                    if (htmlContents == '') {
                        this.bottomDiv.classList.add('empty');
                    } else {
                        this.bottomDiv.classList.remove('empty');
                    }
                }).bind(this));
        }
    }

    generatePrescription = function () {
        var selectedDrugs = this.drugsHandler.getSelectedDrugs();
        this.prescriptionHandler.renderDrugs(selectedDrugs);
    }

    toggleGroupBySchedule = function (groupBySchedule) {
        this.prescriptionHandler.group_by = (groupBySchedule ? "schedule" : "route");
        this.generatePrescription();
    }

    toggleSpecialPrescription = function (enableSpecialPrescription) {
        // Gather patient name.
        var oldPatientField = document.querySelector('div.prescription-form.enabled input[name="patient-name"]');
        var oldPatientName = "";
        if (oldPatientField != null) {
            oldPatientName = oldPatientField.value;
        }
        this.prescriptionHandler.switchPrescriptionMode(enableSpecialPrescription);
        this.generatePrescription();
        // Restore patient name in new patient field.
        var patientField = document.querySelector('div.prescription-form.enabled input[name="patient-name"]');
        patientField.value = oldPatientName;
    }
}

