class MyResult extends Service {

  constructor(
    services,
    game,
    successRate,
    maxGameTime,
    time,
    complete,
    success,
  ) {
    super(services);
    this._game = game;
    this._successRate = successRate;
    this._time = time;
    this._maxGameTime = maxGameTime;
    this._complete = complete;
    this._success = success;
  }

  static makeRandom() {
    return new MyResult(
      services,
      Math.random() * 100,
      Math.random() * 100,
      Math.random() * 100,
    );
  }

  setHash() {
    this
      .setParam('complete', 'yes')
      .setParam('complete', 'yes')
      .setParam('success', 'yes')
      .setParam('time', this.time())
      .setParam('successRate', this.successRate());
  }

  time() {
    return this.format(
      this._time,
      1,
      this._maxGameTime,
      1,
    );
  }

  successRate() {
    return this.format(
      this._successRate,
      0,
      100,
      0,
    );
  }

  format(
    value,
    min,
    max,
    decimals,
  ) {
    value = Math.max(value, min);
    value = Math.min(value, max);
    return value.toFixed(decimals);
  }

  setParam(
    key,
    value,
  ) {
    this.s('url').setHash(
      services.get('url').setParam(key, value),
    );
    return this;
  }

}
