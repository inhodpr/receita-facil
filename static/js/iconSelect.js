var removeAllChildren = function (parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
};

var SUPPORT_ICON_DEFS = null;
var INCLUDED_CATEGORIES = new Set([
  'Combinados',
  'Combinados Povos Indígenas',
  'Via de uso',
  'Motivo do uso',
  'Horários',
  'Outros', 
]);

export default class IconSelect {
  constructor(iconsUrl = '/supportIcons') {
    this.root = null;
    this.selectedUrls = [];
    this.selectedDiv = null;
    this.btnShowOptions = null;
    this.divOptions = null;
    this.iconDefsUrl = iconsUrl;
    if (this.iconDefsUrl != null) {
      this.build();
      this.start();
    }
  }

  start = function() {
    if (SUPPORT_ICON_DEFS == null) {
      fetch(this.iconDefsUrl)
        .then(response => response.json())
        .then((function (supportIconDefs) {
          SUPPORT_ICON_DEFS = supportIconDefs;
          this.buildOptions();
        }).bind(this));
    } else {
      this.buildOptions();
    }
  }

  showOptions = function (e) {
    this.divOptions.hidden = !this.divOptions.hidden;
    e.preventDefault();
  }

  handleAddIconClick = function (e) {
    var iconUrl = e.currentTarget.src;
    this.selectedUrls.push(iconUrl);
    this.buildOptions();
  }

  handleRemoveIconClick = function (e) {
    var iconUrl = e.currentTarget.src;
    var position = this.selectedUrls.indexOf(iconUrl);
    if (position >= 0) {
      this.selectedUrls.splice(position, 1);
    }
    this.buildOptions();
  }

  build = function () {
    this.root = document.createElement('div');
    var firstRow = document.createElement('div');
    this.selectedDiv = document.createElement('div');
    this.btnShowOptions = document.createElement('button');
    this.divOptions = document.createElement('div');
    this.root.appendChild(firstRow);
    this.root.appendChild(this.divOptions);
    firstRow.appendChild(this.selectedDiv);
    firstRow.appendChild(this.btnShowOptions);

    this.root.classList = ['icon-select'];
    this.selectedDiv.classList = ['selected-icons'];
    this.btnShowOptions.innerText = '>>';
    this.btnShowOptions.classList = ['show-options'];
    this.btnShowOptions.addEventListener('click', this.showOptions.bind(this));
    this.divOptions.classList = ['icon-options'];
    this.divOptions.hidden = true;
  }

  buildOptions = function () {
    removeAllChildren(this.selectedDiv);
    removeAllChildren(this.divOptions);

    this.selectedUrls.forEach(
      url => {
        var icon = document.createElement('img');
        icon.src = url;
        icon.addEventListener('click', this.handleRemoveIconClick.bind(this));
        this.selectedDiv.appendChild(icon);
      });
    for (var category in SUPPORT_ICON_DEFS) {
      // Remove leading digits which are only used to set group order.
      var headerText = category.replace(/^[0-9]* /, '');
      if (!INCLUDED_CATEGORIES.has(headerText)) {
        console.log('\'' + headerText + '\' skipped due to not being in included categories.');
        continue;
      }
      var categoryHeader = document.createElement('div');
      var categoryContents = document.createElement('div');
      categoryHeader.innerText = headerText;
      categoryHeader.classList = ['category'];
      if (headerText == 'Combinados') {
        categoryContents.classList.add('category-combinados');
      }
      SUPPORT_ICON_DEFS[category].forEach(
        url => {
          var icon = document.createElement('img');
          icon.src = url;
          icon.addEventListener('click', this.handleAddIconClick.bind(this));

          var position = this.selectedUrls.indexOf(url);
          if (position >= 0) {
            icon.classList.add('selected');
          }
          categoryContents.appendChild(icon);
        });
      this.divOptions.appendChild(categoryHeader);
      this.divOptions.appendChild(categoryContents);
    }
  }
}
