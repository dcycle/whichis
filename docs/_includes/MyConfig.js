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
