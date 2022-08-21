export default class IconSelect {
  constructor() {
    this.icons = [
      '/static/images/illustrations/diarreia.png',
      '/static/images/illustrations/migraine.png',
      '/static/images/illustrations/stomachache.png',
    ];
    this.root = null;
    this.selected = null;
    this.btnShowOptions = null;
    this.divOptions = null;
    this.build();
  }

  showOptions = function (e) {
    this.divOptions.hidden = false;
  }

  handleIconClick = function (e) {
    var iconUrl = new URL(e.currentTarget.src);
    if (iconUrl.pathname == '/') {
      this.selected.hidden = true;
    } else {
      this.selected.hidden = false;
      this.selected.src = iconUrl.toString();
    }
    this.divOptions.hidden = true;
  }

  addIcon = function (iconUrl) {
    var icon = document.createElement('img');
    icon.src = iconUrl;
    icon.classList = ['selectable-icon'];
    icon.addEventListener('click', this.handleIconClick.bind(this));
    this.divOptions.appendChild(icon);
  }

  build = function () {
    this.root = document.createElement('div');
    this.selected = document.createElement('img');
    this.btnShowOptions = document.createElement('button');
    this.divOptions = document.createElement('div');
    this.root.appendChild(this.selected);
    this.root.appendChild(this.btnShowOptions);
    this.root.appendChild(this.divOptions);

    this.root.classList = ['icon-select'];
    this.selected.classList = ['selected'];
    this.selected.hidden = true;
    this.btnShowOptions.innerText = '>>';
    this.btnShowOptions.classList = ['show-options'];
    this.btnShowOptions.addEventListener('click', this.showOptions.bind(this));
    this.divOptions.classList = ['icon-options'];
    this.divOptions.hidden = true;

    this.addIcon('/');
    for (var idx in this.icons) {
      this.addIcon(this.icons[idx]);
    }
  }
}