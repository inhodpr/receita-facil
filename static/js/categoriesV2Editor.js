  
class SingleCategoryEditor {
    constructor(current_category, owner) {
        this.owner = owner;
        this.current_category = current_category;
        this.deleted = false;
        this.field_top_level_category = null;
        this.field_subcategory = null;
    }

    value = function() {
        var value = {};
        value.top_level_group = this.field_top_level_category.value;
        value.subgroup = this.field_subcategory.value;
        return value;
    }

    render = function(parentNode) {
        var root = document.createElement('div');
        var topLevelSelect = document.createElement('select');
        var subcategory = document.createElement('input');
        var labelTopLevelSelect = document.createElement('label');
        var labelSubcategory = document.createElement('label');
        labelTopLevelSelect.innerText = "Categoria principal"
        labelTopLevelSelect.for = topLevelSelect.id;
        subcategory.type = "text";
        labelSubcategory.innerText = "Subcategoria";
        labelSubcategory.for = subcategory.id;
        
        var options = [
            "Uso racional de antibióticos em APS",
            "*DELETAR*",
            "Antibióticos em APS",
            "Cardiovascular",
            "Coloproctologia",
            "Curativos",
            "Dermatologia",
            "Endocrinologia",
            "Farmácia Popular",
            "Gastroenterologia",
            "Neurologia",
            "Nunca Negligenciar",
            "Oftalmologia",
            "Otorrinolaringologia",
            "Pediatria",
            "Pneumologia",
            "Respiratório",
            "Reumatologia",
            "Saúde da mulher",
            "Saúde do homem",
            "Saúde mental",
            "Saúde Bucal",
            "Sintomáticos",
            "Sintomáticos injetáveis",
            "Imagens",
            "Videos",
        ];
        options.forEach(option => {
            var optNode = document.createElement("option");
            optNode.innerText = option;
            topLevelSelect.appendChild(optNode);
        });
        
        var deleteButton = document.createElement('button');
        deleteButton.innerText = "X";
        deleteButton.addEventListener('click', (function (e) {
            e.preventDefault();
            this.deleted = true;
            this.owner.render();
        }).bind(this));
        
        this.field_top_level_category = topLevelSelect;
        this.field_subcategory = subcategory;
        root.classList.add("single-categories-v2-container");
        var topLevelDiv = document.createElement('div');
        topLevelDiv.classList.add("field-top-level-group");
        var subcategoryDiv = document.createElement('div');
        subcategoryDiv.classList.add("field-subgroup");
        
        var pair = document.createElement('div');
        pair.classList.add("pair");
        pair.classList.add("field");

        topLevelDiv.appendChild(labelTopLevelSelect);
        topLevelDiv.appendChild(topLevelSelect);
        subcategoryDiv.appendChild(labelSubcategory);
        subcategoryDiv.appendChild(subcategory);
        pair.appendChild(topLevelDiv);
        pair.appendChild(subcategoryDiv);
        root.appendChild(deleteButton);
        root.appendChild(pair);
        parentNode.appendChild(root);

        // Finally, set the fields to their existing values, if available.
        if ('top_level_group' in this.current_category) {
            topLevelSelect.value = this.current_category['top_level_group'];
        }
        if ('subgroup' in this.current_category) {
            subcategory.value = this.current_category['subgroup'];
        }
    }
}

export default class CategoriesV2Editor {

    constructor(current_categories, root) {
        this.input_categories = current_categories;
        this.parentNode = root;
        this.editors = [];
        this.input_categories.forEach(element => {
            this.editors.push(new SingleCategoryEditor(element, this));
        });
    }

    render = function(parent) {
        // Clear all children from the parentNode.
        while(this.parentNode.firstChild) {
            this.parentNode.removeChild(this.parentNode.firstChild);
        }
        this.editors.forEach(editor => {
            if (!editor.deleted) {
                editor.render(this.parentNode);
            }
        });
        this.renderAddButton(this.parentNode);
    }

    value = function() {
        var values = [];
        this.editors.forEach(editor => {
            if (!editor.deleted) {
                values.push(editor.value());
            }
        });
        return JSON.stringify(values);
    }

    renderAddButton = function() {
        var addButton = document.createElement('button');
        addButton.addEventListener('click', (function (e) {
            e.preventDefault();
            this.editors.push(new SingleCategoryEditor({}, this));
            this.render();
        }).bind(this));
        addButton.innerText = "+ Nova categoria";
        this.parentNode.appendChild(addButton);
    }

}