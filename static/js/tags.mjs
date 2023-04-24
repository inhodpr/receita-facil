import IconSelect from './iconSelect.js';

class Drug {
    constructor(_app) {
        this.app = _app;
        this.text = "";
        this.iconSelect = new IconSelect();
        this.textBox = document.createElement('textarea');
        this.textBox.addEventListener('keyup', this.handleUpdateText.bind(this));
    }

    handleUpdateText = function (e) {
        this.text = this.textBox.value;
        this.app.render();
    }

    render = function () {
        var drugRoot = document.createElement('div');
        drugRoot.classList.add('drug');
        var wrapper = document.createElement('div');
        wrapper.classList.add('drug-text-wrapper');

        var printableDrugText = document.createElement('div');
        printableDrugText.classList.add('printable-drug-text');
        printableDrugText.innerText = this.text;

        wrapper.appendChild(this.textBox);
        wrapper.appendChild(printableDrugText);
        drugRoot.appendChild(wrapper);
        drugRoot.appendChild(this.iconSelect.root);
        return drugRoot;
    }

}


class Tag {
    constructor(_app) {
        this.app = _app;
        this.iconSelect = new IconSelect();
        this.drugs = [];
    }


    handleAddDrugClick = function (e) {
        this.drugs.push(new Drug(this.app));
        this.app.render();
    }


    render = function() {
        var tagRoot = document.createElement('div');
        tagRoot.classList.add('tag');

        tagRoot.appendChild(this.iconSelect.root);
        this.drugs.forEach(drug => {
            tagRoot.appendChild(drug.render());
        })

        // Add Drug button.
        var addDrugBtn = document.createElement('button');
        addDrugBtn.classList.add('add-drug');
        addDrugBtn.innerText = '+ droga';  // remove this.
        addDrugBtn.addEventListener('click',
                                    this.handleAddDrugClick.bind(this));
        tagRoot.appendChild(addDrugBtn);
        return tagRoot;
    };
}


export default class TagsApp {
    constructor() {
        this.tags = [];
    }

    start = function() {
        this.render();
    };


    handleAddTagClick = function(e) {
        this.tags.push(new Tag(this));
        this.render();
    }


    removeAllChildren = function (parent) {
        while (parent.firstChild) {
            parent.removeChild(parent.firstChild);
        }
    };


    render = function() {
        var body = document.querySelector('body');
        this.removeAllChildren(body);        
        var root = document.createElement('div');
        root.id = 'root';
        body.appendChild(root);

        this.tags.forEach(tag => {
            root.appendChild(tag.render());
        });

        var plusSign = document.createElement('button');
        plusSign.classList.add('add-tag');
        plusSign.innerText = '+';  // remove this.
        plusSign.addEventListener('click',
                                  this.handleAddTagClick.bind(this));
        root.appendChild(plusSign);
    };
}