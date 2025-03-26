class MockQuestionItem extends QuestionItem {
  constructor(id, isAnswer, services) {
    super(services);
    this._id = id;
    this._isAnswer = isAnswer;
  }
  id() {
    return this._id;
  }
  isAnswer() {
    return this._isAnswer;
  }
  answer() {
    return '123';
  }
  translated() {
    return '<span>' + this._id + '</span>';
  }
}
