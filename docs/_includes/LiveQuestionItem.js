class LiveQuestionItem extends QuestionItem {

  constructor(
    name,
    isAnswer,
    answer,
    services,
  ) {
    super(services);
    this._name = name;
    this._isAnswer = isAnswer;
    this._answer = answer;
  }

  id() {
    return this._name;
  }

  isAnswer() {
    return this._isAnswer;
  }

  answer() {
    return this._answer;
  }

  translated() {
    return '<span class="translate-me-content-text" translate-me-content-text="' + this._name + '" translate-me-args-content-text=\'{}\'>' + this.s('multilingual').t(this._name) + '</span>';
  }

}
