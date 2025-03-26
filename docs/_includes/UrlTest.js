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
