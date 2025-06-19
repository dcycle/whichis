
class UrlMock {

  constructor(
    value = '',
  ) {
    this._value = value;
  }

  var(
    param,
    defaultValue,
  ) {
    if (!this._value) {
      return defaultValue;
    }
    return this._value;
  }

  getHash() {
    return 'lang/' + this._value;
  }

  setParam(
    param,
    value,
  ) {
    this._value = value;
  }

}
