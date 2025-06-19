class UrlBarMock {

  constructor(
    hash = '',
  ) {
    this._hash = hash;
  }

  getHash() {
    return this._hash;
  }

  setHash(
    hash,
  ) {
    this._hash = hash;
  }

}
