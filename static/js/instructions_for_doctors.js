export class InstructionsForDoctors {
    constructor(_drug, _parent) {
        this.drug = _drug;
        this.parent = _parent;
        this.isClosedBtnClicked = false;
    }

    isClosed = function() {
        return this.isClosedBtnClicked;
    }

    render = function(parent) {
        this.root = document.createElement('div');
        this.root.classList.add('instructions-for-doctors');
        this.closeBtn = document.createElement('button');
        this.closeBtn.innerText = 'X';
        this.text = document.createElement('p');
        this.text.innerText = this.drug['instructions_for_doctors'];
        this.closeBtn.addEventListener('click', (function (e) {
            this.parent.style.display = 'none';
            this.isClosedBtnClicked = true;
        }).bind(this));

        this.root.appendChild(this.closeBtn);
        this.root.appendChild(this.text);
        this.parent.appendChild(this.root);
    }
}