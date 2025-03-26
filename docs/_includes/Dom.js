class Dom extends Service {
  constructor(services) {
    super(services);
    this._clockIsStarted = false;
  }
  addError(error) {
    $('.unhide-if-errors').show();
    $('.put-errors-here').append(`<p>${error}</p>`);
    $('.hide-if-errors').hide();
  }
  currentTime() {
    return parseInt($('.clock').text());
  }
  startClock() {
    $('.clock').show().text(0);
    if (this._clockIsStarted !== true) {
      this.incrementClockInOneSecond();
    }
    this._clockIsStarted = true;
  }
  stopClock() {
    this._clockIsStarted = false;
  }
  incrementClockInOneSecond() {
    const that = this;
    setTimeout(function() {
      if (that._clockIsStarted !== true) {
        return;
      }
      $('.clock').text(that.currentTime() + 1);
      that.incrementClockInOneSecond();
    }, 1000);
  }
  prepare() {
    this.putCurrentYear();
    this.playfulQuestionMarksLogo(this.s('config').colors());
    this.showStartGame();
  }
  showStartGame() {
    this.hideTitle();
    $('.start-game').show();
  }
  hide(selector) {
    $(selector).hide();
  }
  hideTitle() {
    $('.h1').hide();
    return this;
  }
  setQuestionItems(
    items,
    successCallback,
    failCallback,
  ) {
    $('.game-items').html('');
    let i = 1;
    let len = items.length;
    let itemsPerRow = 2;
    if (len % 3 == 0) {
      itemsPerRow = 3;
    }
    if (len % 4 == 0) {
      itemsPerRow = 4;
    }
    const colSize = 12 / itemsPerRow;
    const that = this;
    items.forEach((item) => {
      const formattedCount = this.s('multilingual').formatNumber(item.answer());
      $('.game-items').append(`
        <div class="col-md-${colSize} my-answer" data-count="${item.answer()}" data-answer="${item.id()}">
          <div class="h-100 p-5 my-border rounded-3 my-answer-${item.isAnswer()}">
            <h3 class="my-country-name text-center">${item.translated()}</h3>
            <h3 class="my-country-answer text-center" style="display: none;">${formattedCount}</h3>
          </div>
        </div>`);
        if (i % itemsPerRow == 0) {
          $('.game-items').append('<div class="w-100 mb-4"></div>');
        }
        i++;
      $('[data-answer="' + item.id() + '"]').off().click(function() {
        if (item.isAnswer()) {
          that.showAllAnswers(function() {
            successCallback();
          });
        }
        else {
          that.showAllAnswers(function() {
            failCallback();
          });
        }
      });
    });
    i++;
  }
  showAllAnswers(callback) {
    $('.my-answer-false').css('background-color', 'red');
    $('.my-answer-true').css('background-color', 'green');
    $('.my-country-name').hide();
    $('.my-country-answer').show();
    setTimeout(function() {
      callback();
    }, 2000);
  }
  putCurrentYear() {
    $('.put-year-here').text(new Date().getFullYear());
  }
  playfulQuestionMarksLogo(colors) {
    if (typeof colors === 'undefined') {
      throw new Error('playfulQuestionMarksLogo requires an array; not undefined.');
    }
    const that = this;
    $('.playful-inner').each(function() {
      $(this).css('transform', `rotate(${Math.random() * 20 - 5}deg)`);
      const change = Math.floor(Math.random() * 5);
      const randomColor = that.s('utilities').randomArrayElem(colors);
      $(this).css('color', randomColor);
      const position = -7 - change;
      $(this).css('top', position + 'px');
    });
  }
  setContent(selector, attributes, addClass) {
    attributes.forEach((attribute) => {
      if (attribute.loc == 'content-text') {
        $(selector).text(attribute.content);
      }
      else if (attribute.loc == 'content-html') {
        $(selector).html(attribute.content);
      }
      else {
        $(selector).attr(attribute.loc, attribute.content);
      }
    });
    $(selector).addClass(addClass);
  }
  setTranslatableInnerHTML(
    selector,
    translatableText,
  ) {
    let innerHtml = [];
    translatableText.forEach((part) => {
      switch (part.type) {
        case 'space':
          innerHtml.push(' ');
          break;
        case 'translatable':
        default:
          const text = part.text;
          const translated = this.s('multilingual').t(text);
          innerHtml.push(`<span class="translate-me-content-text" translate-me-content-text="${text}" translate-me-args-content-text='{}'>${translated}</span>`);
          break;
      }
    });
    $(selector).show();
    $(selector).html(innerHtml.join(''));
  }

}
