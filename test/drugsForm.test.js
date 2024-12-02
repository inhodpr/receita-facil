import DrugsForm from '../static/js/drugsForm'; 


describe('DrugsForm', () => {
  let drugsFormInstance;

  beforeEach(() => {
    document.body.innerHTML = '<div id="drogas-form"></div>';
    drugsFormInstance = new DrugsForm();
  });

    it('should build the print toggle correctly', () => {
        drugsFormInstance.buildPrintToggle(); 
        const toggle = document.querySelector('#duplicatePrescriptionToggle');
        expect(toggle).not.toBeNull();  

        const label = document.querySelector('.duplicatePrescriptionLabel');
        expect(label).toBeDefined();
        expect(label.textContent).toBe('Duplicar Página');
    });
});
