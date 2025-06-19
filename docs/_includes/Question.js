class Question extends Service {

  constructor(
    services,
    entries,
    comparison,
    comparisonData,
    moreOrLess,
    meta,
    game,
  ) {
    super(services);
    this._entries = entries;
    this._comparison = comparison;
    this._comparisonData = comparisonData;
    this._moreOrLess = moreOrLess;
    this._meta = meta;
    this.updateQuestionMarkLogo();
    this.s('dom')
      .hideTitle()
      .setTranslatableInnerHTML(
        '.put-question-here',
        this.text(),
      );
    this._questions = [];
    let correctAnswer = undefined;
    this._entries.forEach((entry) => {
      console.log('check');
      if (correctAnswer === undefined) {
        correctAnswer = entry;
      }
      else if (moreOrLess == 'more') {
        if (Number(entry[comparison]) > Number(correctAnswer[comparison])) {
          correctAnswer = entry;
        }
      }
      else {
        if (Number(entry[comparison]) < Number(correctAnswer[comparison])) {
          correctAnswer = entry;
        }
      }
    });
    this._entries.forEach((entry) => {
      this._questions.push(new LiveQuestionItem(
        entry.name,
        entry.name == correctAnswer.name,
        entry[comparison],
        this.services,
      ));
    });
    this.s('dom').setQuestionItems(
      this._questions,
      function() {
        game.processAnswerBefore(true);
      },
      function() {
        game.processAnswerBefore(false);
      },
      function() {
        game.processAnswer(true);
      },
      function() {
        game.processAnswer(false);
      },
    );
  }

  updateQuestionMarkLogo() {
    this.s('dom').playfulQuestionMarksLogo(this.s('config').colors());
  }

  text() {
    return [
      {
        type: 'translatable',
        text: 'Which',
        contexts: ['country'],
      },
      {
        type: 'space',
      },
      {
        type: 'translatable',
        text: this._meta.singular,
      },
      {
        type: 'space',
      },
      {
        type: 'translatable',
        text: this._comparisonData[this._moreOrLess],
      },
      {
        type: 'translatable',
        text: '?',
      },
    ]
  }

}
