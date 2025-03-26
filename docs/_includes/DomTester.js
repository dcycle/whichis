class DomTester extends Service {
  test(count) {
    let items = [];
    for (let i = 0; i < count; i++) {
      items.push(new MockQuestionItem('a' + i, false, this.services));
    }
    this.s('dom').setQuestionItems(items, function() {}, function() {});
  }
}
