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
  showRain() {
    this.s('effect').stopFireworks();
    $('.panel').hide();
    $('.rain').show();
  }
  showFireworks() {
    $('.panel').hide();
    $('.fireworks').show();
    this.s('effect').startFireworks();
  }
  showMain() {
    this.s('effect').stopFireworks();
    $('.panel').hide();
    $('.main').show();
  }
  armStartGameLink() {
    $('.start-game a').off().click((e) => {
      e.preventDefault();
      this.s('gameController').startGame();
    });
  }
}
