class Tester {

  assert(
    message,
    condition,
  ) {
    console.log('Asserting ' + message);
    if (!condition) {
      throw message;
    }
    console.log('ok');
  }

  assertEqual(
    message,
    first,
    second,
  ) {
    if (typeof first == 'undefined') {
      throw new Error('Do not pass undefined to assertEqual.');
    }
    if (typeof second == 'undefined') {
      throw new Error('Do not pass undefined to assertEqual.');
    }
    console.log('Asserting ' + message);
    if (JSON.stringify(first) != JSON.stringify(second)) {
      throw message + ' ' + JSON.stringify(first) + ' != ' + JSON.stringify(second);
    }
    console.log('ok');
  }

  testCase(
    name,
  ) {
    console.log('');
    console.log('---');
    console.log('Running test case ' + name);
    this[name]();
  }

}
