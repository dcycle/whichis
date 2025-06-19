class MultilingualTest extends Tester {

  run() {
    this.testCase('activeLang');
    this.testCase('setActiveLang');
    this.testCase('translationCrud');
    this.testCase('t');
  }

  newObj(
    lang,
  ) {
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
