import ReceitaDiv from '../static/js/receitaDiv';

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