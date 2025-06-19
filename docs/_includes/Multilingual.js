/** Multiligual system, like translations */
class Multilingual extends Service {

  prepare() {
    const that = this;
    const translations = this.s('config').translations();
    const languages = this.s('config').languages();
    languages.forEach((lang) => {
      that.setTranslations(lang, translations[lang]);
    });
  }

  formatNumber(
    n,
  ) {
    return new Intl.NumberFormat(this.activeLang()).format(
      n,
    );
  }

  /** Get the active language */
  activeLang() {
    return this.s('url').var('lang', 'en');
  }

  /** Set the active language */
  setActiveLang(
    lang,
  ) {
    const hash = this.s('url').setParam('lang', lang);
    this.s('urlBar').setHash(hash);
  }

  /** Get the translation set. */
  getTranslations(
    lang,
  ) {
    if (lang == '') {
      return {};
    }
    if (typeof this.translations === 'undefined') {
      this.translations = {};
    }
    if (typeof this.translations[lang] === 'undefined') {
      this.translations[lang] = {};
    }
    return this.translations[lang];
  }

  /** Clear all translations */
  clearTranslations() {
    this.translations = {};
  }

  /** Add translations to the set, overwriting existing ones. */
  setTranslations(
    lang,
    translations,
  ) {
    const previousTranslations = this.getTranslations(lang);
    this.translations[lang] = { ...previousTranslations, ...translations };
  }

  /** Translate a string. */
  t(
    str,
    args = {},
    lang = '',
  ) {
    if (lang == '') {
      lang = this.activeLang();
    }
    const translations = this.getTranslations(lang);
    if (typeof translations[str] === 'undefined') {
      return this.replaceArgs(str, args);
    }
    return this.replaceArgs(translations[str], args);
  }

  /** Internal function to replace args in a string with values. */
  replaceArgs(
    str,
    args,
  ) {
    for (const key in args) {
      str = str.replaceAll(key, args[key]);
    }
    return str;
  }

}
