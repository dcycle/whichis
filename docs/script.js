/** Interact with the URL */
class Url {
  /** Current URL */
  static current() {
    return window.location.href;
  }

  /** Normalize the hash by removing extra slashes */
  static normalizeHash() {
    this.setHash(this.objectToHash(this.hashToObject(this.hash())));
  }

  /** Only the hash */
  static hash() {
    return this.current().split('#').pop();
  }

  /** convert a hash a/b to an object {a: b} */
  static hashToObject(hash) {
    if (typeof hash === 'undefined') {
      return {};
    }
    let ret = {};
    let index = 0;
    let currentKey = '';
    const parts = hash.split('/');
    for (const part of parts) {
      if (index % 2 == 0) {
        currentKey = decodeURIComponent(part);
      }
      else {
        if (currentKey !== '') {
          ret[currentKey] = decodeURIComponent(part);
        }
      }
      index++;
    }
    return ret;
  }

  /** If hash is a/b/c/d, then a is b, c is d, b is undefined.
   * If the hash is %2F/%2F/a/b, then a is b and / is /.
   * If the hash is a/b/a/c/a/d, it wil return b (the first occurrence).
   */
  static var(name, hash, defaultValue = '') {
    if (this.hashToObject(hash)[name]) {
      return this.hashToObject(hash)[name];
    }
    return defaultValue;
  }

  /** convert an object {a: b} to a hash a/b */
  static objectToHash(obj) {
    let retComponents = [];
    for (const key in obj) {
      retComponents.push(encodeURIComponent(key) + '/' + encodeURIComponent(obj[key]));
    }
    return retComponents.join('/');
  }

  /** Set param and value to hash
   * Example 1: adding param a and value b will cause the hash to contain
   * a/b.
   * Example 2: adding param / and value / will cause the hash to contain
   * %2F/%2F.
   * If the param already exists, it will be replaced.
   */
  static setParam(param, value) {
    let hashObj = this.hashToObject(this.hash());
    hashObj[param] = value;
    this.setHash(this.objectToHash(hashObj));
  }

  /** Completely replace the hash in the URL. */
  static setHash(hash) {
    window.location.hash = '#' + hash;
  }

}

/** Multiligual system, like translations */
class Multilingual {

  /** Access to the URL */
  static url() {
    return Url;
  }

  /** Get the active language */
  static activeLang() {
    if (typeof this._activeLang !== 'undefined') {
      return this._activeLang;
    }
    return this.url().var('lang', this.url().hash(), 'en');
  }

  /** Set the active language */
  static setActiveLang(lang) {
    this.url().setParam('lang', lang);
    this._activeLang = lang;
  }

  /** Get the translation set. */
  static getTranslations(lang) {
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

  /** Add translations to the set, overwriting existing ones. */
  static setTranslations(lang, translations) {
    const previousTranslations = this.getTranslations(lang);
    this.translations[lang] = { ...previousTranslations, ...translations };
  }

  /** Access to the config. */
  static config() {
    return MyConfig;
  }

  /** Access to the languages */
  static languages() {
    return MyConfig.languages();
  }

  /** Translate a string. */
  static t(str, args = {}, lang = '') {
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
  static replaceArgs(str, args) {
    for (const key in args) {
      str = str.replaceAll(key, args[key]);
    }
    return str;
  }
}

/** Represens the app as a whole. */
class App {
  /** Access to the dom. */
  static dom() {
    return MyMultilingualDom;
  }

  /** Access to the config. */
  static config() {
    return MyConfig;
  }

  /** Access to the URL */
  static url() {
    return Url;
  }

  /** Run the app. */
  static run() {
    try {
      this.url().normalizeHash();
      this.preflight();
      this.config().preload(() => {
        this.runAfterConfigPreload();
      });
    }
    catch (error) {
      this.dom().addError(error);
    }
  }

  /** Run the app once we know the config is preloaded. */
  static runAfterConfigPreload() {
    this.dom().init(
      this.config().colors(),
      this.config().languages(),
    );
  }

  /** Make sure the app can run properly. Throw an exception if it can't. */
  static preflight() {
    if (location.protocol == 'file:') {
      throw ('This site does not work using the file:// protocol. You might want to try: python3 -m http.server');
    }
  }
}

/** Wrapper for the config object at ./data/all.json */
class MyConfig {
  /** Preload the config */
  static preload(callback) {
    const that = this;
    $.getJSON(`./data/all.json`, (data) => {
      that.data = data;
      callback();
    });
  }

  /** Make sure the config has been preloaded */
  static assertPreloaded() {
    if (typeof this.data === 'undefined') {
      throw 'Config data has not been preloaded.';
    }
  }

  /** Get a random color among all colors. */
  static colors() {
    this.assertPreloaded();
    return this.data['colors'];
  }

  /** Get available languages. */
  static languages() {
    this.assertPreloaded();
    return this.data['languages'];
  }
}

/** A multilingual representation of the DOM. */
class MyMultilingualDom {

  /** Access to the multilingual object. */
  static multilingual() {
    return Multilingual;
  }

  /** Access to the utilities. */
  static utilities() {
    return MyUtilities;
  }

  /** Access to the dom. */
  static dom() {
    return MyDom;
  }

  /** Of the language links (en, fr), make the appropriate one active */
  static setActiveLangLink(activeLang) {
    const that = this;
    $('.language').removeClass('active');
    $('.language').each(function() {
      const lang = $(this).data('lang');
      if (activeLang == lang) {
        $(this).addClass('active');
        $(this).text(lang);
      }
      else {
        $(this).html('<a href="#" class="switch-lang" data-lang="' + lang + '">' + lang + '</a>');
        $(this).on('click', function(e) {
          // We don't want to link to #, we put href="#" to make the cursor a
          // pointer, not to actually go there.
          e.preventDefault();
          that.setActiveLang(lang);
        });
      }
    });
  }

  /** Set the active language */
  static setActiveLang(lang) {
    this.multilingual().setActiveLang(lang);
    this.translateInterface(lang);
    this.setActiveLangLink(lang);
  }

  /** Set the "Start Game" link title */
  static setStartGameLink(title, args = {}) {
    this.dom().setStartGameLink(this.t(title, args));
  }

  /** Set the "Start Game" link title */
  static translateInterface(lang) {
    $('.translate-me').each(function() {
      const str = decodeURIComponent($(this).data('str'));
      const args = JSON.parse(decodeURIComponent($(this).data('args')));
      const translated = Multilingual.t(str, args, lang);
      $(this).text(translated);
    });
  }

  /** Initialize the multilingual dom. */
  static init(colors, languages) {
    this.dom().init(colors, languages);
    this.setActiveLangLink(this.multilingual().activeLang());
  }














  static t(str, args = {}) {
    const translated = this.multilingual().t(str, args);
    return '<span class="translate-me" data-str="' + encodeURIComponent(str) + '" data-args="' + encodeURIComponent(JSON.stringify(args)) + '">' + this.utilities().escapeHtml(translated) + '</span>';
  }

}

/** Interact with the DOM */
class MyDom {
  /** Access to the utilities. */
  static utilities() {
    return MyUtilities;
  }

  /** Initialize the dom. */
  static init(colors, languages) {
    this.putCurrentYear();
    this.playfulQuestionMarksLogo(colors);
    this.putLanguages(languages);
  }

  /** Hides everything but the error message, and displays an error. */
  static addError(error) {
    $('.unhide-if-errors').show();
    $('.put-errors-here').append(`<p>${error}</p>`);
    $('.hide-if-errors').hide();
  }

  /** Opposite of addError() */
  static removeErrors() {
    $('.unhide-if-errors').hide();
    $('.put-errors-here').html('');
    $('.hide-if-errors').show();
  }

  /** Make the question marks logo look colorful and playful. */
  static playfulQuestionMarksLogo(colors) {
    const that = this;
    $('.playful-inner').each(function() {
      $(this).css('transform', `rotate(${Math.random() * 20 - 5}deg)`);
      const change = Math.floor(Math.random() * 5);
      const randomColor = that.utilities().randomArrayElem(colors);
      $(this).css('color', randomColor);
      const position = -7 - change;
      $(this).css('top', position + 'px');
    });
  }

  /** Put the current year in the copyright section. */
  static putCurrentYear() {
    $('.put-year-here').text(new Date().getFullYear());
  }

  /** Set the title */
  static setQuestionTitle(title) {
    this.hideTitle();
    $('.question-title').show().text(title);
  }

  /** Set the "Start Game" link title */
  static setStartGameLink(title) {
    this.hideTitle();
    $('.start-game').show();
    $('.click-to-start').html(title);
  }

  /** Set the title */
  static hideTitle() {
    $('.h1').hide();
  }

  /** Put languages */
  static putLanguages(languages) {
    let first = true;
    languages.forEach((language) => {
      $('.languages').append(`<span class="language" data-lang="${language}">${language}</span>`);
    });
  }

}



class Translations {
  static init() {
    this.switchLanguage('en');
  }
  static switchLanguage(lang) {
    $.getJSON(`./data/translations/${lang}.json`, (data) => {
      this.translate(data);
    });
  }
  static translate(data) {
    console.log(data);
  }
}

class Info {
  static randomColor(callback) {
    $.getJSON(`./data/all.json`, (data) => {
      if (typeof data['colors'] !== 'undefined') {
        callback(MyUtilities.randomArrayElem(data['colors']));
      }
    });
  }
}

class Dataset {
  constructor(dataset) {
    this.dataset = dataset;
  }

  randomQuestion() {
    $.getJSON(`./data/countries/countries.json`, (data) => {
      try {
        App.randomArrayElems(data.data);
      }
      catch (error) {
        App.addError(error);
      }
    }).fail(function() { App.addError('Failed to load dataset.'); });
  }

}

class Question {

}

class Game {
  constructor(dataset, numQuestions) {
    this.dataset = dataset;
    this.numQuestions = numQuestions;
  }

  start() {
    const question = this.dataset.randomQuestion();
  }

}

class MyUtilities {
  static randomArrayElem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }
  static randomArrayElems(array) {
    const len = console.log(array.length);
    if (len < 3) {
      throw "fffa";
    }
    else {
      throw len;
    }
    return array[Math.floor(Math.random() * array.length)];
  }
  static escapeHtml(unsafe) {
    // https://stackoverflow.com/a/6234804
    return unsafe
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

}

class MyQuestion {

}

class MyDummyQuestion extends MyQuestion {

  title() {
    return 'Choose one of these two items.'
  }
}

class MyGameController {
  static startGame() {
    MyDom.hideStartGame();
    MyDom.showGame();
  }
  static armStartGameButton() {
    const that = this;
    $('.start-game').click(function() {
      that.startGame();
    });
  }
  static setQuestion(question) {
    const title = question.title();
    MyDom.setQuestionTitle(title);
  }
}

class xApp {
  static xun() {
    try {
      this.preflight();
      MyDom.putCurrentYear();
      MyDom.playfulQuestionMarksLogo();
      MyGameController.armStartGameButton();
    }
    catch (error) {
      this.addError(error);
    }
  }



  static startGame() {
    MyDom.startGame();
    const dataset = new Dataset("countries");
    const game = new Game(dataset, 10);
    game.start();
  }
  static showQuestion(index, total) {
    $('.question-number').text('Question ' + index + ' of ' + total);
  }
}
