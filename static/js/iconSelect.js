var removeAllChildren = function (parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
};

export default class IconSelect {
  constructor() {
    this.icons = [
      '/static/images/illustrations/diarreia.png',
      '/static/images/illustrations/migraine.png',
      '/static/images/illustrations/stomachache.png',
    ];
    this.root = null;
    this.selectedUrls = new Set();
    this.selectedDiv = null;
    this.btnShowOptions = null;
    this.divOptions = null;
    this.build();
  }

  showOptions = function (e) {
    this.divOptions.hidden = !this.divOptions.hidden;
  }

  handleIconClick = function (e) {
    var iconUrl = new URL(e.currentTarget.src);
    if (this.selectedUrls.has(iconUrl.pathname)) {
      this.selectedUrls.delete(iconUrl.pathname);
    } else {
      this.selectedUrls.add(iconUrl.pathname);
    }
    removeAllChildren(this.selectedDiv);
    removeAllChildren(this.divOptions);
    for (var idx in this.icons) {
      this.addIcon(this.icons[idx]);
    }
  }

  addIcon = function (iconUrl) {
    var icon = document.createElement('img');
    icon.src = iconUrl;
    icon.addEventListener('click', this.handleIconClick.bind(this));
    if (this.selectedUrls.has(iconUrl)) {
      icon.classList.add('selected');
      var cloned = icon.cloneNode();
      cloned.addEventListener('click', this.handleIconClick.bind(this))
      this.selectedDiv.appendChild(cloned);
    }
    this.divOptions.appendChild(icon);
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

    for (var idx in this.icons) {
      this.addIcon(this.icons[idx]);
    }
  }
}