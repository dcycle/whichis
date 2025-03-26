class MyUtilities extends Service {
  randomArrayElem(array) {
    if (typeof array === 'undefined') {
      throw new Error('randomArrayElem requires an array; not undefined.');
    }
    const index = this.randomNumberBetweenTwoNumbersInclusively(0, array.length - 1);
    return array[index];
  }
  randomNumberBetweenTwoNumbersInclusively(min, max) {
    // https://stackoverflow.com/questions/4959975/generate-random-number-between-two-numbers-in-javascript
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
