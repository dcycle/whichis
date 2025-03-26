/** A multilingual representation of the DOM. */
class MyMultilingualDom extends Service {

  /** Prepare our multilingual DOM */
  prepare() {
    const activeLang = this.s('multilingual').activeLang();
    this.putLanguages(
      this.s('config').languages(),
    );
    this.setActiveLang(activeLang);
    this.setHomeButton(activeLang);
    this.setContent(
      '.put-readme-here',
      'href',
      'https://github.com/dcycle/whichis/blob/master/README.md',
    )
    this.setContent(
      '.question',
      'content-text',
      'Question',
    )
    this.setContent(
      '.success-rate',
      'content-text',
      'Success Rate',
    )
    this.setContent(
      '.colon',
      'content-text',
      ':',
    )
    if (this.s('gameController').gameRequestedInUrl()) {
      this.s('gameController').startGame();
    }
    else {
      this.setClickToStartLink();
    }
  }
  setHomeButton(lang) {
    const that = this;
    $('.back-to-home').attr('href', '#lang/' + lang);
    $('.back-to-home').off().click(function(e) {
      e.preventDefault();
      that.s('app').resetAll();
    });
  }

  setClickToStartLink() {
    this.setContent(
      '.click-to-start',
      'content-text',
      'Start Game',
    );
    $('.click-to-start').attr('href', '#' + this.s('url').setParam('game', this.s('gameController').defaultGame()));
    const that = this;
    $('.start-game').off().click(function() {
      that.s('gameController').startGame();
    });
  }

  /** Of the language links (en, fr), make the appropriate one active */
  setActiveLangLink(activeLang) {
    const that = this;
    $('.language').removeClass('active');
    $('.language').each(function() {
      const lang = $(this).data('lang');
      if (activeLang == lang) {
        $(this).addClass('active');
        $(this).text(lang);
      }
      else {
        $(this).html('<a href="#' + that.s('url').setParam('lang', lang) + '" class="switch-lang" data-lang="' + lang + '">' + lang + '</a>');
        $(this).off().on('click', function(e) {
          // We don't want to link to #, we put href="#" to make the cursor a
          // pointer, not to actually go there.
          e.preventDefault();
          that.setActiveLang(lang);
        });
      }
    });
  }

  /** Set the active language */
  setActiveLang(lang) {
    this.s('multilingual').setActiveLang(lang);
    this.translateInterface(lang);
    this.setActiveLangLink(lang);
  }

  /** Set the "Start Game" link title */
  translateInterface(lang) {
    const that = this;
    $('.translate-me-href').each(function() {
      const str = $(this).attr('translate-me-href');
      const stringifiedArgs = $(this).attr('translate-me-args-href');
      const args = JSON.parse(stringifiedArgs);
      const translated = that.s('multilingual').t(str, args, lang);
      $(this).attr('href', translated);
    });
    $('.translate-me-content-text').each(function() {
      const str = $(this).attr('translate-me-content-text');
      const stringifiedArgs = $(this).attr('translate-me-args-content-text');
      const args = JSON.parse(stringifiedArgs);
      const translated = that.s('multilingual').t(str, args, lang);
      $(this).text(translated);
    });
  }

  /** Put languages */
  putLanguages(languages) {
    let first = true;
    languages.forEach((language) => {
      $('.languages').append(`<span class="language" data-lang="${language}">${language}</span>`);
    });
  }

  setContent(selector, loc, content, args = {}) {
    this.s('dom').setContent(selector, [
      {
        loc: loc,
        content: this.s('multilingual').t(content, args),
      },
      {
        loc: 'translate-me-' + loc,
        content: content,
      },
      {
        loc: 'translate-me-args-' + loc,
        content: JSON.stringify(args),
      },
    ], 'translate-me-' + loc);
  }

}
