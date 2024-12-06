import ReceitaDiv from '../static/js/receitaDiv';
import { JSDOM } from 'jsdom';


describe('Print Events', () => {
  let receitaDiv;

  beforeEach(() => {
    receitaDiv = new ReceitaDiv();

    document.body.innerHTML = `
      <div class="content">
        <div class="main-column">
          <div>test div</div>
        </div>
        <div class="right-column">
          <div id="drogas-form">
            <input type="checkbox" id="duplicatePrescriptionToggle" />
          </div>
        </div>
      </div>
    `;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should register print events', () => {
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');
    
    receitaDiv.createPrintEvents();

    expect(addEventListenerSpy).toHaveBeenCalledWith('beforeprint', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('afterprint', expect.any(Function));
  });

  test('should handle beforeprint event correctly when clone is enabled', () => {
    const setPrintStylesSpy = jest.spyOn(receitaDiv, 'setPrintStyles');
    const originalElement = document.querySelector('.main-column'); 
    const checkbox = document.getElementById('duplicatePrescriptionToggle');
    checkbox.checked = true;

    receitaDiv.handleBeforePrint();
    const clonedElement = document.querySelector('#clone');
    
    expect(setPrintStylesSpy).toHaveBeenCalledWith('A4 landscape');
    expect(originalElement.innerHTML).toBe(clonedElement.innerHTML);
    expect(clonedElement).toBeTruthy();
    expect(clonedElement.classList.contains('clone')).toBe(true);
  });

    test('should handle beforeprint event correctly when clone is disabled', () => {
    const setPrintStylesSpy = jest.spyOn(receitaDiv, 'setPrintStyles');
    const checkbox = document.getElementById('duplicatePrescriptionToggle');
    checkbox.checked = false;

    receitaDiv.handleBeforePrint();

    const clonedElement = document.querySelector('#clone');
    
    expect(setPrintStylesSpy).toHaveBeenCalledWith('A4 portrait');
    expect(clonedElement).toBeNull();
  });

  test('should handle afterprint event correctly when clone is enabled', () => {
    const mainColumnBefore = document.querySelector('.main-column');
    const checkbox = document.getElementById('duplicatePrescriptionToggle');
    checkbox.checked = true;

    receitaDiv.handleBeforePrint();

    const clonedElementBefore = document.querySelector('#clone');
    expect(clonedElementBefore).toBeTruthy();

    receitaDiv.handleAfterPrint();

    const clonedElementAfter = document.querySelector('#clone');
    const mainColumnAfter = document.querySelector('.main-column');

    expect(mainColumnBefore).toBe(mainColumnAfter);
    expect(clonedElementAfter).toBeNull();
  });

  test('should handle afterprint event correctly when clone does not exist', () => {
    const mainColumnBefore = document.querySelector('.main-column');
    const checkbox = document.getElementById('duplicatePrescriptionToggle');
    checkbox.checked = false;

    receitaDiv.handleBeforePrint();

    const clonedElementBefore = document.querySelector('#clone');
    expect(clonedElementBefore).toBeNull();

    receitaDiv.handleAfterPrint();

    const mainColumnAfter = document.querySelector('.main-column');
    const clonedElementAfter = document.querySelector('#clone');

    expect(mainColumnBefore).toBe(mainColumnAfter);
    expect(clonedElementAfter).toBeNull();
  }); 

  test('should apply print styles correctly in setPrintStyles', () => {
    receitaDiv.setPrintStyles('A4 portrait');

    const printStyles = document.querySelector('#print-styles');
    expect(printStyles).toBeTruthy();
    expect(printStyles.textContent).toBe('@page { size: A4 portrait; }');
  });
  it('should check print button when enableSpecialPrescription is true', () => {
    const toggle = document.querySelector('#duplicatePrescriptionToggle');

    expect(toggle.checked).toBe(false);

    receitaDiv.handlePrintButtonOnPrescriptionModeChange(true);

    expect(toggle.checked).toBe(true);
  });

  it('should uncheck print button when enableSpecialPrescription is false', () => {
    const toggle = document.querySelector('#duplicatePrescriptionToggle');

    expect(toggle.checked).toBe(false);

    receitaDiv.handlePrintButtonOnPrescriptionModeChange(false);

    expect(toggle.checked).toBe(false);
  });
});

describe('Prescription Action Buttons', () => {
  let receitaDiv;
  let mockApp;
  let mockListener= jest.fn();

  beforeEach(() => {
    const dom = new JSDOM(`<!DOCTYPE html><html><body>
      <div class="content">
        <div class="main-column" id="main-column">
        </div>
      </div>
      <form id="drogas-form"></form>
    </body></html>`);
    global.document = dom.window.document;
    global.window = dom.window;

    mockApp = {
      drugsHandler: {
        drugPosition: {
          '10': 1,
          '11': 2,
          '12': 3
        }
      },
      generatePrescription: jest.fn()
    };

    const checkbox10 = document.createElement('input');
    checkbox10.type = 'checkbox';
    checkbox10.id = 'drug_check_10';
    checkbox10.checked = true;
    document.body.appendChild(checkbox10);

    const checkbox11 = document.createElement('input');
    checkbox11.type = 'checkbox';
    checkbox11.id = 'drug_check_11';
    checkbox11.checked = true;
    document.body.appendChild(checkbox11);
    checkbox11.addEventListener('change', mockListener);

    const checkbox12 = document.createElement('input');
    checkbox12.type = 'checkbox';
    checkbox12.id = 'drug_check_12';
    checkbox12.checked = true;
    document.body.appendChild(checkbox12);

    receitaDiv = new ReceitaDiv(mockApp);

    const prescriptionDiv = document.createElement('div');
    prescriptionDiv.id = 'receita-simples';
    document.body.appendChild(prescriptionDiv);
    receitaDiv.prescriptionDiv = prescriptionDiv;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('moveItemUp should swap positions correctly', () => {
    receitaDiv.moveItemUp('11');
    expect(mockApp.drugsHandler.drugPosition).toEqual({
      '10': 2,
      '11': 1,
      '12': 3
    });
    expect(mockApp.generatePrescription).toHaveBeenCalled();
  });

  test('moveItemUp does nothing if the item is already at the top', () => {
    receitaDiv.moveItemUp('10');
    expect(mockApp.drugsHandler.drugPosition).toEqual({
      '10': 1,
      '11': 2,
      '12': 3
    });
    expect(mockApp.generatePrescription).not.toHaveBeenCalled();
  });

  test('moveItemDown should swap positions correctly', () => {
    receitaDiv.moveItemDown('11');
    expect(mockApp.drugsHandler.drugPosition).toEqual({
      '10': 1,
      '11': 3,
      '12': 2
    });
    expect(mockApp.generatePrescription).toHaveBeenCalled();
  });

  test('moveItemDown does nothing if the item is already at the bottom', () => {
    receitaDiv.moveItemDown('12');

    expect(mockApp.drugsHandler.drugPosition).toEqual({
      '10': 1,
      '11': 2,
      '12': 3
    });
    expect(mockApp.generatePrescription).not.toHaveBeenCalled();
  });

  test('removeItem unchecks the checkbox, removes the drug, and calls generatePrescription', () => {
    expect(document.getElementById('drug_check_11').checked).toBe(true);

    receitaDiv.removeItem('11');

    expect(document.getElementById('drug_check_11').checked).toBe(false);
    expect(mockListener).toHaveBeenCalled();
  });

});