class Game extends Service {
  constructor(services, data) {
    super(services);
    this.data = data;
    this.successful = 0;
    this.currentQuestionIndex = 0;
    this.totalQuestions = 10;
    this.setTranslations();
  }
  processAnswer(success) {
    if(this.updateSuccessCount(success)) {
      this.s('gameController').stopGame(
        this.s('dom').currentTime(),
        this.successful
      );
    }
    else {
      this.createQuestion();
    }
  }
  updateSuccessCount(success) {
    if (success) {
      this.successful++;
    }
    const successRate = Math.round(this.successful / this.currentQuestionIndex * 100);
    if (!isNaN(successRate)) {
      $('.success-rate-value').text(successRate + '%');
    }
    const total = this.totalQuestions;
    const current = ++this.currentQuestionIndex;
    $('.current-question').text(current);
    $('.total-questions').text(total);

    if (current > total) {
      return true;
    }
  }
  setTranslations() {
    const that = this;
    Object.keys(this.data.meta.translations).forEach((key) => {
      this.s('multilingual').setTranslations(key, this.data.meta.translations[key]);
    });
  }
  start() {
    this.createQuestion();
    $('.show-when-game-starts').show();
    this.setClock();
    this.updateSuccessCount();
  }
  setClock() {
    this.s('dom').startClock();
  }
  createQuestion() {
    const entries = this.findRandomEntries(2);
    const comparison = this.findRandomComparison();

    new Question(
      this.services,
      [
        this.data.data[entries[0]],
        this.data.data[entries[1]],
      ],
      comparison,
      this.data.meta.comparisons[comparison],
      this.randomMoreOrLess(),
      this.data.meta,
      this,
    );
  }
  findRandomEntries(count) {
    const len = this.data.data.length;
    let ret = [];
    if (count > len) {
      throw new Error('Cannot find ' + count + ' entries in an array of length ' + len);
    }
    while (ret.length < count) {
      const index = this.s('utilities').randomNumberBetweenTwoNumbersInclusively(0, len - 1);
      if (!ret.includes(index)) {
        ret.push(index);
      }
    }
    return ret;
  }
  findRandomComparison() {
    return 'population';
  }
  randomMoreOrLess() {
    return (Math.random()>0.5)? 'more' : 'less';
  }
}
