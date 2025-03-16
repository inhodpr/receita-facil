export default class CategoriesV2Editor {

    constructor(current_categories) {
        this.current_categories = current_categories;
    }

    render = function(parent) {
        this.current_categories.array.forEach(element => {
            renderSingleCategory(element, parent);
        });
    }

    renderSingleCategory = function(element, parent) {
        var idx = parent.childElementCount;
        var root = document.createElement('div');
        var topLevelSelect = document.createElement('input');
        var subcategory = document.createElement('input');
        var labelTopLevelSelect = document.createElement('label');
        var labelSubcategory = document.createElement('label');
        topLevelSelect.id = "top-level-category-" + idx;
        topLevelSelect.type = "select";
        labelTopLevelSelect.for = topLevelSelect.id;
        subcategory.id = "subcategory-" + idx;
        subcategory.type = "text";
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
            topLevelSelect.appendChild(option);
        });
        
        root.classList.add("single-categories-v2-container");
        var topLevelDiv = document.createElement('div');
        var subcategoryDiv = document.createElement('div');
        topLevelDiv.appendChild(labelTopLevelSelect);
        topLevelDiv.appendChild(topLevelSelect);
        subcategoryDiv.appendChild(labelSubcategory);
        subcategoryDiv.appendChild(subcategory);
        root.appendChild(topLevelDiv);
        root.appendChild(subcategoryDiv);
        return root;
    }
}