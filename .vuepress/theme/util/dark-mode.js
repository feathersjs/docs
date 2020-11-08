// Original idea by @matiaslopezd, https://github.com/feathersjs/docs/issues/1378

class DarkMode {

  constructor(dark = false) {
    this._dark = dark;
    this._key = 'dark-mode-feathers'
  }

  init() {
    this._dark = (/true/i).test(window.localStorage.getItem(this._key));
    if (this._dark) this.toggle(false);
  }

  toggle(dark = this._dark) {
    if (dark) {
      document.body.classList.remove('dark');
      this._remove();
    } else {
      document.body.classList.add('dark');
      this._save();
    }
    this._dark = !dark;
  }

  _save() {
    window.localStorage.setItem(this._key, 'true');
  }

  _remove() {
    window.localStorage.removeItem(this._key);
  }

}

export default DarkMode;

