export default class CategoriesV2Editor {

    constructor(current_categories) {
        this.current_categories = current_categories;
    }

    render = function(parent) {
        this.current_categories.forEach(element => {
            this.renderSingleCategory(element, parent);
        });
        this.renderAddButton(parent);
    }

    renderSingleCategory = function(element, parent) {
        var idx = parent.childElementCount;
        var root = document.createElement('div');
        var topLevelSelect = document.createElement('select');
        var subcategory = document.createElement('input');
        var labelTopLevelSelect = document.createElement('label');
        var labelSubcategory = document.createElement('label');
        topLevelSelect.id = "top-level-category-" + idx;
        if ('top_level_group' in  element) {
            topLevelSelect.value = element['top_level_group'];
        }
        labelTopLevelSelect.innerText = "Categoria principal"
        labelTopLevelSelect.for = topLevelSelect.id;
        subcategory.id = "subcategory-" + idx;
        subcategory.type = "text";
        if ('subgroup' in element) {
            subcategory.value = element['subgroup'];
        }
        labelSubcategory.innerText = "Subcategoria";
        labelSubcategory.for = subcategory.id;

        var options = [
            "Uso racional de antibióticos em APS",
            "*DELETAR*",
            "Cardiovascular",
            "Condutas",
            "Dermatologia",
            "Doenças que não podem ser neglicenciadas",
            "Endocrinologia",
            "Gastrologia",
            "Neurologia",
            "Oftalmologia",
            "Otorrinolaringologia",
            "Pediatria",
            "Respiratório",
            "Reumatologia",
            "Saúde da mulher",
            "Saúde do homem",
            "Saúde mental",
            "Sintomáticos",
            "Sintomáticos injetáveis",
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
            root.remove();
        }).bind(this));

        root.classList.add("single-categories-v2-container");
        var topLevelDiv = document.createElement('div');
        var subcategoryDiv = document.createElement('div');
        topLevelDiv.appendChild(labelTopLevelSelect);
        topLevelDiv.appendChild(topLevelSelect);
        subcategoryDiv.appendChild(labelSubcategory);
        subcategoryDiv.appendChild(subcategory);
        root.appendChild(topLevelDiv);
        root.appendChild(subcategoryDiv);
        root.appendChild(deleteButton);
        parent.appendChild(root);
        return root;
    }

    renderAddButton = function(parent) {
        var addButton = document.createElement('button');
        addButton.addEventListener('click', (function (e) {
            e.preventDefault();
            this.renderSingleCategory({}, parent);
        }).bind(this));
        addButton.innerText = "+ Nova categoria";
        parent.appendChild(addButton);
    }

}