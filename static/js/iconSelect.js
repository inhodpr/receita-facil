var removeAllChildren = function (parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
};

export default class IconSelect {
  constructor() {
    this.icons = [
      '/static/images/illustrations/001-contorno-de-seringa.png',
      '/static/images/illustrations/002-comprimido.png',
      '/static/images/illustrations/003-pill.png',
      '/static/images/illustrations/004-circulo-de-fase-da-lua-nova.png',
      '/static/images/illustrations/005-colirio.png',
      '/static/images/illustrations/006-pingo-dagua.png',
      '/static/images/illustrations/007-pomada.png',
      '/static/images/illustrations/008-eye-drops.png',
      '/static/images/illustrations/009-hair-washing.png',
      '/static/images/illustrations/010-asma.png',
      '/static/images/illustrations/011-back-pain.png',
      '/static/images/illustrations/012-eye.png',
      '/static/images/illustrations/013-ear.png',
      '/static/images/illustrations/014-estomago.png',
      '/static/images/illustrations/015-vomiting.png',
      '/static/images/illustrations/016-dizziness.png',
      '/static/images/illustrations/017-blood-pressure.png',
      '/static/images/illustrations/018-sugar-blood-level.png',
      '/static/images/illustrations/019-pain.png',
      '/static/images/illustrations/020-coracao.png',
      '/static/images/illustrations/021-contorno-em-forma-de-coracao.png',
      '/static/images/illustrations/022-cough.png',
      '/static/images/illustrations/023-anti-histaminicos.png',
      '/static/images/illustrations/024-pulmao.png',
      '/static/images/illustrations/025-rim.png',
      '/static/images/illustrations/026-coceira.png',
      '/static/images/illustrations/027-alergia.png',
      '/static/images/illustrations/028-dor-de-garganta.png',
      '/static/images/illustrations/029-dor-de-garganta-1.png',
      '/static/images/illustrations/030-espirrar.png',
      '/static/images/illustrations/031-dor-de-cabeca.png',
      '/static/images/illustrations/032-otorrinolaringologia.png',
      '/static/images/illustrations/033-coriza.png',
      '/static/images/illustrations/034-spray-nasal.png',
      '/static/images/illustrations/035-quit-smoking.png',
      '/static/images/illustrations/036-vacinacao.png',
      '/static/images/illustrations/037-neck.png',
      '/static/images/illustrations/038-colesterol.png',
      '/static/images/illustrations/039-injury.png',
      '/static/images/illustrations/040-shin.png',
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