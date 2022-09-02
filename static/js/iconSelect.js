var removeAllChildren = function (parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
};

var SUPPORT_ICON_DEFS = null;

export default class IconSelect {
  constructor() {
    this.root = null;
    this.selectedUrls = [];
    this.selectedDiv = null;
    this.btnShowOptions = null;
    this.divOptions = null;
    this.build();
    if (SUPPORT_ICON_DEFS == null) {
        fetch('/supportIcons')
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
  }

  handleIconClick = function (e) {
    var iconUrl = e.currentTarget.src;
    var position = this.selectedUrls.indexOf(iconUrl);
    if (position >= 0) {
      this.selectedUrls.splice(position, 1);
    } else {
      this.selectedUrls.push(iconUrl);
    }
    removeAllChildren(this.selectedDiv);
    removeAllChildren(this.divOptions);
    this.buildOptions();
  }

  addIcon = function (iconUrl, parent) {
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

  buildOptions = function() {
    this.selectedUrls.forEach(
	    url => {
    var icon = document.createElement('img');
    icon.src = url;
    icon.addEventListener('click', this.handleIconClick.bind(this));
		    this.selectedDiv.appendChild(icon);

	    })
    for (var category in SUPPORT_ICON_DEFS) {
      var categoryHeader = document.createElement('div');
      categoryHeader.innerText = category;
      var categoryContents = document.createElement('div');
      categoryHeader.classList = ['category'];
      SUPPORT_ICON_DEFS[category].forEach(
          url => {
    var icon = document.createElement('img');
    icon.src = url;
    icon.addEventListener('click', this.handleIconClick.bind(this));

    var position = this.selectedUrls.indexOf(url);
    if (position >= 0) {
      icon.classList.add('selected');
    }
    this.divOptions.appendChild(icon);
	  });
      this.divOptions.appendChild(categoryHeader);
      this.divOptions.appendChild(categoryContents);
    }
  }
  }
