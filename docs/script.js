/** Services singleton. Contains all other singletons. */
class Services {
  /** Init all the singletons. */
  async init() {
    this.selfTester = await new SelfTester(this).preload();
    this.preflight = await new Preflight(this).preload();
    this.config = await new MyConfig(this).preload();
    this.utilities = await new MyUtilities(this).preload();
    this.urlBar = await new UrlBar(this).preload();
    this.url = await new Url(this).preload();
    this.multilingual = await new Multilingual(this).preload();
    this.dom = await new Dom(this).preload();
    this.app = await new App(this).preload();
    this.multilingualDom = await new MyMultilingualDom(this).preload();
    this.gameController = await new MyGameController(this).preload();
    this.domTester = await new DomTester(this).preload();
    return this;
  }
  /** Get a singleton. */
  get(name) {
    if (typeof this[name] == 'undefined') {
      throw new Error('Unknown service or services has not been initalized: ' + name);
    }
    return this[name];
  }
}

/** Mock services for testing. */
class MockServices {
  constructor(services) {
    this.services = services;
  }
  get(name) {
    return this.services[name];
  }
}

/** Base class for a single service singleton. */
class Service {
  constructor(services) {
    if (typeof services === 'undefined') {
      throw new Error('Services must be passed to the constructor in ' + this.constructor.name);
    }
    if (typeof services.get === 'undefined') {
      throw new Error('Valid services must be passed to the constructor in ' + this.constructor.name);
    }
    this.services = services;
  }
  /** Preload this service and return itself. */
  async preload() {
    return this;
  }
  /** Get another service. */
  s(name) {
    return this.services.get(name);
  }
}

class Preflight extends Service {
  check() {
    if (location.protocol == 'file:') {
      throw ('Cannot read README.md file from file:// protocol. You might want to try: python3 -m http.server; see https://documentation.dcycle.com for more details.');
    }
  }
}

/** Wrapper for the application. */
class App extends Service {
  run() {
    try {
      this.s('preflight').check();
      this.s('dom').prepare();
      this.s('multilingual').prepare();
      this.s('multilingualDom').prepare();
      this.armStartGameLink();
    }
    catch (error) {
      console.log(error);
      this.s('dom').addError(error);
    }
  }
  resetAll() {
    const lang = this.s('url').var('lang', 'en');
    this.s('urlBar').setHash('lang/' + lang);
    this.s('urlBar').refreshPage();
  }
  armStartGameLink() {
    $('.start-game a').off().click((e) => {
      e.preventDefault();
      this.s('gameController').startGame();
    });
  }
}

/** In a console, run SelfTester.test() to make sure stuff works. */
class SelfTester extends Service {
  test() {
    new Preflight(new MockServices()).check();
    new UrlTest().run();
    new MultilingualTest().run();
  }
}

class UrlBar extends Service {
  getHash() {
    const ret = window.location.hash;
    if(ret.charAt(0) === '#') {
       return ret.substring(1);
    }

    return ret;
  }
  setHash(hash = '') {
    window.location.hash = hash;
  }
  refreshPage() {
    location.reload();
  }
}

class UrlBarMock {
  constructor(hash = '') {
    this._hash = hash;
  }

  getHash() {
    return this._hash;
  }

  setHash(hash) {
    this._hash = hash;
  }
}

class UrlMock {
  constructor(value = '') {
    this._value = value;
  }

  var(param, defaultValue) {
    if (!this._value) {
      return defaultValue;
    }
    return this._value;
  }

  getHash() {
    return 'lang/' + this._value;
  }

  setParam(param, value) {
    this._value = value;
  }
}

class Tester {
  assert(message, condition) {
    console.log('Asserting ' + message);
    if (!condition) {
      throw message;
    }
    console.log('ok');
  }
  assertEqual(message, first, second) {
    if (typeof first == 'undefined') {
      throw new Error('Do not pass undefined to assertEqual.');
    }
    if (typeof second == 'undefined') {
      throw new Error('Do not pass undefined to assertEqual.');
    }
    console.log('Asserting ' + message);
    if (JSON.stringify(first) != JSON.stringify(second)) {
      throw message + ' ' + JSON.stringify(first) + ' != ' + JSON.stringify(second);
    }
    console.log('ok');
  }
  testCase(name) {
    console.log('');
    console.log('---');
    console.log('Running test case ' + name);
    this[name]();
  }
}

class UrlTest extends Tester {
  run() {
    this.testCase('setGetHash');
    this.testCase('hashObject');
    this.testCase('var');
    this.testCase('setParam');
  }
  setGetHash() {
    const that = this;
    [
      'a',
      '/a/b/c/d/',
    ].forEach((hash) => {
      const obj = new Url(new MockServices({
        'urlBar': new UrlBarMock(),
      }));
      obj.setHash(hash);
      that.assertEqual('Making sure hash is set', hash, obj.getHash());
    });
  }
  hashObject() {
    const that = this;
    [
      {
        hash: 'a/b/c/d',
        hashObj: { a: 'b', c: 'd' },
        clean: 'a/b/c/d',
      },
      {
        hash: 'a/b/a/c',
        hashObj: { a: 'c' },
        clean: 'a/c',
      },
      {
        hash: 'a/b/c/d/e/f',
        hashObj: { a: 'b', c: 'd', e: 'f' },
        clean: 'a/b/c/d/e/f',
      },
      {
        hash: 'a/b/c/d/e/f/g/h',
        hashObj: { a: 'b', c: 'd', e: 'f', g: 'h' },
        clean: 'a/b/c/d/e/f/g/h',
      },
    ].forEach((test) => {
      const hash = test.hash;
      const hashObj = test.hashObj;
      const clean = test.clean;
      const obj = new Url(new MockServices({
        'urlBar': new UrlBarMock(),
      }));
      this.assertEqual(
        'Making sure hashToObject works',
        hashObj,
        obj.hashToObject(hash),
      );
      this.assertEqual(
        'Making sure objectToHash works',
        clean,
        obj.objectToHash(hashObj),
      );
      this.assertEqual(
        'Making sure cleanhash works',
        clean,
        obj.cleanHash(hash),
      );
    });
  }
  var() {
    [
      {
        hash: 'a/b/c/d',
        name: 'a',
        value: 'b',
        defaultValue: 'z',
      },
      {
        hash: 'a/b/c/d',
        name: 'c',
        value: 'd',
        defaultValue: 'z',
      },
      {
        hash: 'a/b/c/d',
        name: 'b',
        value: 'z',
        defaultValue: 'z',
      },
      {
        hash: 'a/c/a/d',
        name: 'a',
        value: 'd',
        defaultValue: 'z',
      },
      {
        hash: 'a/c/a/d',
        name: 'a',
        value: 'd',
        defaultValue: 'z',
      },
    ].forEach((test) => {
      const hash = test.hash;
      const name = test.name;
      const value = test.value;
      const defaultValue = test.defaultValue;
      const obj = new Url(new MockServices({
        'urlBar': new UrlBarMock(hash),
      }));
      this.assertEqual(
        'Making sure var works',
        value,
        obj.var(name, defaultValue),
      );
    });
  }

  setParam() {
    [
      {
        'hash': 'a/b/c/d',
        'param': 'a',
        'value': 'b',
        'expected': 'a/b/c/d',
      },
      {
        'hash': 'a/b/c/d',
        'param': 'z',
        'value': '12',
        'expected': 'a/b/c/d/z/12',
      },
      {
        'hash': 'a/b/c/d',
        'param': '/this contains a slash',
        'value': '/this also contains a slash',
        'expected': 'a/b/c/d/%2Fthis%20contains%20a%20slash/%2Fthis%20also%20contains%20a%20slash',
      },
    ].forEach((test) => {
      const hash = test.hash;
      const param = test.param;
      const value = test.value;
      const expected = test.expected;
      const obj = new Url(new MockServices({
        'urlBar': new UrlBarMock(hash),
      }));
      this.assertEqual('Making sure setParam works', expected, obj.setParam(param, value));
    });
  }

}

/** Interact with the URL */
class Url extends Service {
  setHash(hash = '') {
    this.s('urlBar').setHash(hash);
  }

  getHash() {
    return this.s('urlBar').getHash();
  }

  /** convert a hash a/b to an object {a: b} */
  hashToObject(hash) {
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

  /** convert an object {a: b} to a hash a/b */
  objectToHash(obj) {
    let retComponents = [];
    for (const key in obj) {
      retComponents.push(encodeURIComponent(key) + '/' + encodeURIComponent(obj[key]));
    }
    return retComponents.join('/');
  }

  /** Normalize the hash by removing extra slashes */
  cleanHash(hash) {
    return this.objectToHash(this.hashToObject(hash));
  }

  /** If hash is a/b/c/d, then a is b, c is d, b is undefined.
   * If the hash is %2F/%2F/a/b, then a is b and / is /.
   * If the hash is a/b/a/c/a/d, it wil return b (the first occurrence).
   */
  var(name, defaultValue = '') {
    const hash = this.getHash();
    if (this.hashToObject(hash)[name]) {
      return this.hashToObject(hash)[name];
    }
    return defaultValue;
  }

  /** Set param and value to hash
   * Example 1: adding param a and value b will cause the hash to contain
   * a/b.
   * Example 2: adding param / and value / will cause the hash to contain
   * %2F/%2F.
   * If the param already exists, it will be replaced.
   */
  setParam(param, value) {
    const hash = this.getHash();
    let hashObj = this.hashToObject(hash);
    hashObj[param] = value;
    return this.objectToHash(hashObj);
  }

}

class MultilingualTest extends Tester {
  run() {
    this.testCase('activeLang');
    this.testCase('setActiveLang');
    this.testCase('translationCrud');
    this.testCase('t');
  }
  newObj(lang) {
    return new Multilingual(new MockServices({
      'url': new UrlMock(lang),
      'urlBar': new UrlBarMock('lang/' + lang),
    }));
  }
  activeLang() {
    const that = this;
    [
      {
        'lang': 'en',
        'expected': 'en',
      },
      {
        'lang': 'fr',
        'expected': 'fr',
      },
      {
        'lang': '',
        'expected': 'en',
      },
    ].forEach((test) => {
      const obj = that.newObj(test.lang);
      const expected = test.expected;

      this.assertEqual('Making sure activeLang works ' + expected, expected, obj.activeLang());
    });
  }
  setActiveLang() {
    const that = this;
    [
      {
        'lang': 'en',
        'expected': 'lang/en',
      },
      {
        'lang': 'fr',
        'expected': 'lang/fr',
      },
    ].forEach((test) => {
      const lang = test.lang;
      const expected = test.expected;
      const obj = that.newObj(lang);

      obj.setActiveLang(lang);
      this.assertEqual('Making sure setActiveLang works ' + expected, expected, obj.s('url').getHash());
    });
  }
  translationCrud() {
    const that = this;
    [
      {
        'hash': '',
        'lang': 'xx',
        'translations': {
          'hello': 'world',
        },
        'expected': 'a/b/c/d/lang/en',
      },
    ].forEach((test) => {
      const lang = test.lang;
      const translations = test.translations;
      const obj = that.newObj(test.hash);

      obj.setTranslations(lang, translations);

      this.assertEqual(
        'Making sure set/get translations works',
        translations,
        obj.getTranslations(lang),
      );
      obj.clearTranslations();
      this.assertEqual(
        'Making sure clear translations works',
        {},
        obj.getTranslations(lang),
      );
    });
  }
  t() {
    const that = this;
    [
      {
        'lang': 'xx',
        'args': { 'name': 'world' },
        'translations': {},
        'string': 'hello',
        'expected': 'hello',
      },
      {
        'lang': 'xx',
        'args': { 'name': 'world' },
        'translations': {},
        'string': 'hello',
        'expected': 'hello',
      },
      {
        'lang': 'fr',
        'args': { 'name': 'world' },
        'translations': {
          'hello': 'bonjour',
        },
        'string': 'hello',
        'expected': 'bonjour',
      },
      {
        'lang': 'fr',
        'args': { 'name': 'world' },
        'translations': {
          'hello name': 'bonjour name',
        },
        'string': 'hello name',
        'expected': 'bonjour world',
      },
    ].forEach((test) => {
      const string = test.string;
      const lang = test.lang;
      const args = test.args;
      const translations = test.translations;
      const expected = test.expected;
      const obj = that.newObj(lang);
      obj.setTranslations(lang, translations);

      this.assertEqual(
        'Making sure t works: ' + expected,
        expected,
        obj.t(string, args),
      );
    });
  }
}

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

  formatNumber(n) {
    return new Intl.NumberFormat(this.activeLang()).format(
      n,
    );
  }

  /** Get the active language */
  activeLang() {
    return this.s('url').var('lang', 'en');
  }

  /** Set the active language */
  setActiveLang(lang) {
    const hash = this.s('url').setParam('lang', lang);
    this.s('urlBar').setHash(hash);
  }

  /** Get the translation set. */
  getTranslations(lang) {
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
  setTranslations(lang, translations) {
    const previousTranslations = this.getTranslations(lang);
    this.translations[lang] = { ...previousTranslations, ...translations };
  }

  /** Translate a string. */
  t(str, args = {}, lang = '') {
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
  replaceArgs(str, args) {
    for (const key in args) {
      str = str.replaceAll(key, args[key]);
    }
    return str;
  }

}

class QuestionItem extends Service {
  id() {
    throw new Error('Please use subclass of QuestionItem');
  }
  isAnswer() {
    throw new Error('Please use subclass of QuestionItem');
  }
  answer() {
    throw new Error('Please use subclass of QuestionItem');
  }
  translated() {
    throw new Error('Please use subclass of QuestionItem');
  }
}

class MockQuestionItem extends QuestionItem {
  constructor(id, isAnswer, services) {
    super(services);
    this._id = id;
    this._isAnswer = isAnswer;
  }
  id() {
    return this._id;
  }
  isAnswer() {
    return this._isAnswer;
  }
  answer() {
    return '123';
  }
  translated() {
    return '<span>' + this._id + '</span>';
  }
}

class LiveQuestionItem extends QuestionItem {
  constructor(name, isAnswer, answer, services) {
    super(services);
    this._name = name;
    this._isAnswer = isAnswer;
    this._answer = answer;
  }
  id() {
    return this._name;
  }
  isAnswer() {
    return this._isAnswer;
  }
  answer() {
    return this._answer;
  }
  translated() {
    return '<span class="translate-me-content-text" translate-me-content-text="' + this._name + '" translate-me-args-content-text=\'{}\'>' + this.s('multilingual').t(this._name) + '</span>';
  }
}

class DomTester extends Service {
  test(count) {
    let items = [];
    for (let i = 0; i < count; i++) {
      items.push(new MockQuestionItem('a' + i, false, this.services));
    }
    this.s('dom').setQuestionItems(items, function() {}, function() {});
  }
}

class Dom extends Service {
  constructor(services) {
    super(services);
    this._clockIsStarted = false;
  }
  addError(error) {
    $('.unhide-if-errors').show();
    $('.put-errors-here').append(`<p>${error}</p>`);
    $('.hide-if-errors').hide();
  }
  currentTime() {
    return parseInt($('.clock').text());
  }
  startClock() {
    $('.clock').show().text(0);
    if (this._clockIsStarted !== true) {
      this.incrementClockInOneSecond();
    }
    this._clockIsStarted = true;
  }
  stopClock() {
    this._clockIsStarted = false;
  }
  incrementClockInOneSecond() {
    const that = this;
    setTimeout(function() {
      if (that._clockIsStarted !== true) {
        return;
      }
      $('.clock').text(that.currentTime() + 1);
      that.incrementClockInOneSecond();
    }, 1000);
  }
  prepare() {
    this.putCurrentYear();
    this.playfulQuestionMarksLogo(this.s('config').colors());
    this.showStartGame();
  }
  showStartGame() {
    this.hideTitle();
    $('.start-game').show();
  }
  hide(selector) {
    $(selector).hide();
  }
  hideTitle() {
    $('.h1').hide();
    return this;
  }
  setQuestionItems(
    items,
    successCallback,
    failCallback,
  ) {
    $('.game-items').html('');
    let i = 1;
    let len = items.length;
    let itemsPerRow = 2;
    if (len % 3 == 0) {
      itemsPerRow = 3;
    }
    if (len % 4 == 0) {
      itemsPerRow = 4;
    }
    const colSize = 12 / itemsPerRow;
    const that = this;
    items.forEach((item) => {
      const formattedCount = this.s('multilingual').formatNumber(item.answer());
      $('.game-items').append(`
        <div class="col-md-${colSize} my-answer" data-count="${item.answer()}" data-answer="${item.id()}">
          <div class="h-100 p-5 my-border rounded-3 my-answer-${item.isAnswer()}">
            <h3 class="my-country-name text-center">${item.translated()}</h3>
            <h3 class="my-country-answer text-center" style="display: none;">${formattedCount}</h3>
          </div>
        </div>`);
        if (i % itemsPerRow == 0) {
          $('.game-items').append('<div class="w-100 mb-4"></div>');
        }
        i++;
      $('[data-answer="' + item.id() + '"]').off().click(function() {
        if (item.isAnswer()) {
          that.showAllAnswers(function() {
            successCallback();
          });
        }
        else {
          that.showAllAnswers(function() {
            failCallback();
          });
        }
      });
    });
    i++;
  }
  showAllAnswers(callback) {
    $('.my-answer-false').css('background-color', 'red');
    $('.my-answer-true').css('background-color', 'green');
    $('.my-country-name').hide();
    $('.my-country-answer').show();
    setTimeout(function() {
      callback();
    }, 2000);
  }
  putCurrentYear() {
    $('.put-year-here').text(new Date().getFullYear());
  }
  playfulQuestionMarksLogo(colors) {
    if (typeof colors === 'undefined') {
      throw new Error('playfulQuestionMarksLogo requires an array; not undefined.');
    }
    const that = this;
    $('.playful-inner').each(function() {
      $(this).css('transform', `rotate(${Math.random() * 20 - 5}deg)`);
      const change = Math.floor(Math.random() * 5);
      const randomColor = that.s('utilities').randomArrayElem(colors);
      $(this).css('color', randomColor);
      const position = -7 - change;
      $(this).css('top', position + 'px');
    });
  }
  setContent(selector, attributes, addClass) {
    attributes.forEach((attribute) => {
      if (attribute.loc == 'content-text') {
        $(selector).text(attribute.content);
      }
      else if (attribute.loc == 'content-html') {
        $(selector).html(attribute.content);
      }
      else {
        $(selector).attr(attribute.loc, attribute.content);
      }
    });
    $(selector).addClass(addClass);
  }
  setTranslatableInnerHTML(
    selector,
    translatableText,
  ) {
    let innerHtml = [];
    translatableText.forEach((part) => {
      switch (part.type) {
        case 'space':
          innerHtml.push(' ');
          break;
        case 'translatable':
        default:
          const text = part.text;
          const translated = this.s('multilingual').t(text);
          innerHtml.push(`<span class="translate-me-content-text" translate-me-content-text="${text}" translate-me-args-content-text='{}'>${translated}</span>`);
          break;
      }
    });
    $(selector).show();
    $(selector).html(innerHtml.join(''));
  }

}

// /** Wrapper for the config object at ./data/all.json */
class MyConfig extends Service {
  /** Prepare the config */
  async preload() {
    const that = this;
    $.ajaxSetup({
      async: false
    });
    $.getJSON(`./data/all.json`, (data) => {
      that.data = data;
    });
    return this;
  }

  /** Make sure the config has been preloaded */
  assertPreloaded() {
    if (typeof this.data === 'undefined') {
      throw new Error('Config data has not been preloaded.');
    }
  }

  /** Get all colors. */
  colors() {
    this.assertPreloaded();
    return this.data['colors'];
  }

  /** Get all available translations from the config file. */
  translations() {
    this.assertPreloaded();
    return this.data['translations'];
  }

  /** Get available languages. */
  languages() {
    this.assertPreloaded();
    return this.data['languages'];
  }

}

/** A multilingual representation of the DOM. */
class MyMultilingualDom extends Service {

  /** Prepare our multilingual DOM */
  prepare() {
    const activeLang = this.s('multilingual').activeLang();
    this.putLanguages(
      this.s('config').languages(),
    );
    this.setActiveLang(activeLang);
    this.setHomeButton(activeLang);
    this.setContent(
      '.put-readme-here',
      'href',
      'https://github.com/dcycle/whichis/blob/master/README.md',
    )
    this.setContent(
      '.question',
      'content-text',
      'Question',
    )
    this.setContent(
      '.success-rate',
      'content-text',
      'Success Rate',
    )
    this.setContent(
      '.colon',
      'content-text',
      ':',
    )
    if (this.s('gameController').gameRequestedInUrl()) {
      this.s('gameController').startGame();
    }
    else {
      this.setClickToStartLink();
    }
  }
  setHomeButton(lang) {
    const that = this;
    $('.back-to-home').attr('href', '#lang/' + lang);
    $('.back-to-home').off().click(function(e) {
      e.preventDefault();
      that.s('app').resetAll();
    });
  }

  setClickToStartLink() {
    this.setContent(
      '.click-to-start',
      'content-text',
      'Start Game',
    );
    $('.click-to-start').attr('href', '#' + this.s('url').setParam('game', this.s('gameController').defaultGame()));
    const that = this;
    $('.start-game').off().click(function() {
      that.s('gameController').startGame();
    });
  }

  /** Of the language links (en, fr), make the appropriate one active */
  setActiveLangLink(activeLang) {
    const that = this;
    $('.language').removeClass('active');
    $('.language').each(function() {
      const lang = $(this).data('lang');
      if (activeLang == lang) {
        $(this).addClass('active');
        $(this).text(lang);
      }
      else {
        $(this).html('<a href="#' + that.s('url').setParam('lang', lang) + '" class="switch-lang" data-lang="' + lang + '">' + lang + '</a>');
        $(this).off().on('click', function(e) {
          // We don't want to link to #, we put href="#" to make the cursor a
          // pointer, not to actually go there.
          e.preventDefault();
          that.setActiveLang(lang);
        });
      }
    });
  }

  /** Set the active language */
  setActiveLang(lang) {
    this.s('multilingual').setActiveLang(lang);
    this.translateInterface(lang);
    this.setActiveLangLink(lang);
  }

  /** Set the "Start Game" link title */
  translateInterface(lang) {
    const that = this;
    $('.translate-me-href').each(function() {
      const str = $(this).attr('translate-me-href');
      const stringifiedArgs = $(this).attr('translate-me-args-href');
      const args = JSON.parse(stringifiedArgs);
      const translated = that.s('multilingual').t(str, args, lang);
      $(this).attr('href', translated);
    });
    $('.translate-me-content-text').each(function() {
      const str = $(this).attr('translate-me-content-text');
      const stringifiedArgs = $(this).attr('translate-me-args-content-text');
      const args = JSON.parse(stringifiedArgs);
      const translated = that.s('multilingual').t(str, args, lang);
      $(this).text(translated);
    });
  }

  /** Put languages */
  putLanguages(languages) {
    let first = true;
    languages.forEach((language) => {
      $('.languages').append(`<span class="language" data-lang="${language}">${language}</span>`);
    });
  }

  setContent(selector, loc, content, args = {}) {
    this.s('dom').setContent(selector, [
      {
        loc: loc,
        content: this.s('multilingual').t(content, args),
      },
      {
        loc: 'translate-me-' + loc,
        content: content,
      },
      {
        loc: 'translate-me-args-' + loc,
        content: JSON.stringify(args),
      },
    ], 'translate-me-' + loc);
  }

}

class MyUtilities extends Service {
  randomArrayElem(array) {
    if (typeof array === 'undefined') {
      throw new Error('randomArrayElem requires an array; not undefined.');
    }
    const index = this.randomNumberBetweenTwoNumbersInclusively(0, array.length - 1);
    return array[index];
  }
  randomNumberBetweenTwoNumbersInclusively(min, max) {
    // https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}

class Game extends Service {
  constructor(services, data) {
    super(services);
    this.data = data;
    this.successful = 0;
    this.currentQuestionIndex = 0;
    this.totalQuestions = 10;
    this.setTranslations();
  }
  processAnswer(success) {
    if(this.updateSuccessCount(success)) {
      this.s('gameController').stopGame(
        this.s('dom').currentTime(),
        this.successful
      );
    }
    else {
      this.createQuestion();
    }
  }
  updateSuccessCount(success) {
    if (success) {
      this.successful++;
    }
    const successRate = Math.round(this.successful / this.currentQuestionIndex * 100);
    console.log(successRate);
    if (!isNaN(successRate)) {
      $('.success-rate-value').text(successRate + '%');
    }
    const total = this.totalQuestions;
    const current = ++this.currentQuestionIndex;
    $('.current-question').text(current);
    $('.total-questions').text(total);

    if (current > total) {
      return true;
    }
  }
  setTranslations() {
    const that = this;
    Object.keys(this.data.meta.translations).forEach((key) => {
      this.s('multilingual').setTranslations(key, this.data.meta.translations[key]);
    });
  }
  start() {
    this.createQuestion();
    $('.show-when-game-starts').show();
    this.setClock();
    this.updateSuccessCount();
  }
  setClock() {
    this.s('dom').startClock();
  }
  createQuestion() {
    const entries = this.findRandomEntries(2);
    const comparison = this.findRandomComparison();

    new Question(
      this.services,
      [
        this.data.data[entries[0]],
        this.data.data[entries[1]],
      ],
      comparison,
      this.data.meta.comparisons[comparison],
      this.randomMoreOrLess(),
      this.data.meta,
      this,
    );
  }
  findRandomEntries(count) {
    const len = this.data.data.length;
    let ret = [];
    if (count > len) {
      throw new Error('Cannot find ' + count + ' entries in an array of length ' + len);
    }
    while (ret.length < count) {
      const index = this.s('utilities').randomNumberBetweenTwoNumbersInclusively(0, len - 1);
      if (!ret.includes(index)) {
        ret.push(index);
      }
    }
    return ret;
  }
  findRandomComparison() {
    return 'population';
  }
  randomMoreOrLess() {
    return (Math.random()>0.5)? 'more' : 'less';
  }
}

class Question extends Service {
  constructor(
    services,
    entries,
    comparison,
    comparisonData,
    moreOrLess,
    meta,
    game,
  ) {
    super(services);
    this._entries = entries;
    this._comparison = comparison;
    this._comparisonData = comparisonData;
    this._moreOrLess = moreOrLess;
    this._meta = meta;
    this.updateQuestionMarkLogo();
    this.s('dom')
      .hideTitle()
      .setTranslatableInnerHTML(
        '.put-question-here',
        this.text(),
      );
    this._questions = [];
    let correctAnswer = undefined;
    this._entries.forEach((entry) => {
      console.log('check');
      if (correctAnswer === undefined) {
        console.log('xxx correct answer is ' + entry.name);
        correctAnswer = entry;
      }
      else if (moreOrLess == 'more') {
        if (Number(entry[comparison]) > Number(correctAnswer[comparison])) {
          correctAnswer = entry;
        }
      }
      else {
        if (Number(entry[comparison]) < Number(correctAnswer[comparison])) {
          correctAnswer = entry;
        }
      }
    });
    this._entries.forEach((entry) => {
      this._questions.push(new LiveQuestionItem(
        entry.name,
        entry.name == correctAnswer.name,
        entry[comparison],
        this.services,
      ));
    });
    this.s('dom').setQuestionItems(
      this._questions,
      function() {
        game.processAnswer(true);
      }, function() {
        game.processAnswer(false);
      },
    );
  }
  updateQuestionMarkLogo() {
    this.s('dom').playfulQuestionMarksLogo(this.s('config').colors());
  }
  text() {
    return [
      {
        type: 'translatable',
        text: 'Which',
        contexts: ['country'],
      },
      {
        type: 'space',
      },
      {
        type: 'translatable',
        text: this._meta.singular,
      },
      {
        type: 'space',
      },
      {
        type: 'translatable',
        text: this._comparisonData[this._moreOrLess],
      },
      {
        type: 'translatable',
        text: '?',
      },
    ]
  }
}

class MyGameController extends Service {
  startGame() {
    const that = this;
    this.s('dom').hide('.start-game');
    this.s('urlBar').setHash(
      this.s('url').setParam('game', this.defaultGame()),
    )
    this.loadGame(function(data) {
      that.newGame(data).start();
    });
  }
  stopGame(time, successful) {
    alert('You have a ' + successful + '% success rate in ' + time + ' seconds.');
    this.s('dom').stopClock();
  }
  newGame(data) {
    return new Game(this.services, data);
  }
  defaultGame() {
    return 'countries';
  }
  loadGame(callback) {
    const gameName = this.gameRequestedInUrl();
    const that = this;
    jQuery.getJSON(
      `./data/${gameName}/${gameName}.json`,
      {},
      callback,
    ).fail(function() {
      alert('Failed to load game!');
      that.s('app').resetAll();
    });
  }
  setQuestion(question) {
    const title = question.title();
    this.s('dom').setQuestionTitle(title);
  }
  gameRequestedInUrl() {
    return this.s('url').var('game', '');
  }
}
