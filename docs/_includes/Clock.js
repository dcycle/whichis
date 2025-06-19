class Clock extends Service {

  constructor(
    services,
  ) {
    super(services);
    this._started = false;
    this._paused = false;
    this._seconds = 0;
    this.heartbeat();
    this.element().show().text(0);
  }

  element() {
    return $('.clock');
  }

  heartbeat() {
    const that = this;
    setInterval(() => {
      if (that._started && !that._paused) {
        that.increment();
      }
    }, 100);
  }

  increment() {
    this._seconds += 0.1;
    this.element().text(this._seconds.toFixed(1));
  }

  reset() {
    this.set(0);
  }

  get() {
    return this._seconds;
  }

  start() {
    this._started = true;
  }

  stop() {
    this._started = false;
  }

  pause() {
    this._paused = true;
  }

  unpause() {
    this._paused = false;
  }

}
