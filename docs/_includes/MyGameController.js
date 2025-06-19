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

  stopGame(
    time,
    successful,
  ) {
    const result = new MyResult(
      this.services,
      successful,
      time,
    );
    alert('You have a ' + successful + '% success rate in ' + time + ' seconds.');
    this.s('clock').stop();
  }

  newGame(
    data,
  ) {
    return new Game(this.services, data);
  }

  defaultGame() {
    return 'countries';
  }

  loadGame(
    callback,
  ) {
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

  setQuestion(
    question,
  ) {
    const title = question.title();
    this.s('dom').setQuestionTitle(title);
  }

  gameRequestedInUrl() {
    return this.s('url').var('game', '');
  }

}
