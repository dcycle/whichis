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
    this.effect = await new Effect(this).preload();
    this.clock = await new Clock(this).preload();
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
