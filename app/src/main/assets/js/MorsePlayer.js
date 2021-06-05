(function (global) {
  'use strict';
  if( !global.morse ) {
    global.morse = {};
  }

  var M = morse;

  M.MorsePlayer = function(settings) {
    M.BeepPlayer.call(this, settings);
    settings = settings ? settings : {};
    this.charactersPerMinute(settings.characters_per_minute > 0 ? settings.characters_per_minute : M.MorsePlayer.DEFAULT_CHARACTERS_PER_MINUTE);
    this._morse_status = M.MorsePlayer.ST_MORSE_NONE;
    this._morse_base_ms = 0;
    this._morse_interval_id = null;
    this._morse_queue = [];
    this._morse_empty_char_space = false;
    this._morse_lang = "C";
    this.on("started", function(_this){return function(ev) {_this.onBeepStarted(ev);}}(this));
    this.on("finished", function(_this){return function(ev) {_this.onBeepFinished(ev);}}(this));
  };

  M.MorsePlayer.ST_MORSE_NONE = 0;
  M.MorsePlayer.ST_MORSE_STARTING = 1;
  M.MorsePlayer.ST_MORSE_WORKING = 2;
  M.MorsePlayer.ST_MORSE_FINISHING = 3;
  M.MorsePlayer.ST_MORSE_RESARTING = 4;
  M.MorsePlayer.ST_MORSE_UNSARTING = 5;

  M.MorsePlayer.DEFAULT_CHARACTERS_PER_MINUTE = 100;

  M.MorsePlayer.prototype = new M.BeepPlayer();

  M.MorsePlayer.prototype.morseLang = function morseLang(value) {
    if( arguments && arguments.length >= 1 ) {
      this._morse_lang = value;
      return this;
    }
    else {
      return this._morse_lang;
    }
  };

  M.MorsePlayer.prototype.emptyCharSpace = function emptyCharSpace(value) {
    if( arguments && arguments.length >= 1 ) {
      this._empty_char_space = !!value;
      return this;
    }
    else {
      return this._empty_char_space;
    }
  };


  // called when BeepPlaye started.
  M.MorsePlayer.prototype.onBeepStarted = function onBeepStarted(ev) {
    var need_finish = this._status ==  M.MorsePlayer.ST_MORSE_UNSTARTING;
    this._status = M.MorsePlayer.ST_MORSE_WORKING;
    this.fire({"type": "morsestarted", "caller": this});
    if( need_finish ) {
      this.finish();
    }
  };

  // called when BeepPlaye finished.
  M.MorsePlayer.prototype.onBeepFinished = function onBeepFinished(ev) {
    var need_start = this._status ==  M.MorsePlayer.ST_MORSE_RESTARTING;
    this._status = M.MorsePlayer.ST_MORSE_NONE;
    this.fire({"type": "morsefinished", "tag": ev.tag, "caller": this});
    if( need_start ) {
      this.start();
    }
  };

  M.MorsePlayer.prototype.charactersPerMinute = function charactersPerMinute(value) {
    if( arguments && arguments.length > 0 ) {
      if( value > 0 ) {
        this._characters_per_minute = value;
//        this._morse_ms_per_point = 6500 / this._characters_per_minute;
        this._morse_ms_per_point = 6000 / this._characters_per_minute;
      }
      return this;
    }
    return this._characters_per_minute;
  };

    M.MorsePlayer.prototype.pushText = function pushText(text) {
    var len_text = text != null ? text.length : 0;
    for( var n_text = 0; n_text < len_text; n_text++ ) {
      var ch = text[n_text];
      if( ch == '[' ) {
        this.emptyCharSpace(true);
      }
      else if( ch == ']' ) {
        this.emptyCharSpace(false);
      }
      else if( ch == ' ' ) {
        this.emptyCharSpace(false);
        this.pushCode(' ');
      }
      else {
        var codes = this.charToCodes(text[n_text]);
        var len_codes = codes != null ? codes.length : 0;
        for( var n_code = 0; n_code < len_codes; n_code++ ) {
          this.pushCode(codes[n_code]);
        }
      }
    }
  };

  var ja_dakuten = "ガカギキグクゲケゴコザサジシズスゼセゾソダタヂチヅツデテドトバハビヒブフベヘボホヴウ";
  var ja_handakuten = "パハピヒプフペヘポホ";
  function ja_hira2kata(s) {
    return s.replace(/[\u3041-\u3096]/g, function(match) {
        var ch = match.charCodeAt(0) + 0x60;
        return String.fromCharCode(ch);
    });
  }

  M.MorsePlayer.prototype.charToCodes = function charToCodes(ch) {
    var lang = this.morseLang();
    if( lang == "ja" ) {
      ch = ja_hira2kata(ch);
      var ix;
      if( (ix = ja_dakuten.indexOf(ch)) >= 0 && ix % 2 == 0 ) {
        return [this.charToCodes(ja_dakuten[ix+1])[0],this.charToCodes("゛")[0]];
     }
     if( (ix = ja_handakuten.indexOf(ch)) >= 0 && ix % 2 == 0 ) {
        return [this.charToCodes(ja_handakuten[ix+1])[0],this.charToCodes("゜")[0]];
      }
    }
    var table = morse.table[lang];
    if( table != null ) {
      return [table[ch]];
    }
    return null;
  };

  M.MorsePlayer.prototype.pushCode = function pushCode(code) {
    if( !this._morse_queue ) {
      this._morse_queue = [];
    }
    var len = code != null ? code.length : 0;
    for( var n = 0; n < len; n++ ) {
      switch(code[n]) {
      case " ":
        this._morse_queue.push([0,4]);
        break;
      case "*":
        this._morse_queue.push([1,1]);
        this._morse_queue.push([0,1]);
        break;
      case "-":
        this._morse_queue.push([1,3]);
        this._morse_queue.push([0,1]);
        break;
      }
    }
    if( !this._empty_char_space ) {
      this._morse_queue.push([0,2]);
    }
    return this;
  };

  M.MorsePlayer.prototype.startMorse = function startMorse() {
    if( this._morse_status == M.MorsePlayer.ST_MORSE_FINISHING ) {
      this._morse_status = M.MorsePlayer.ST_MORSE_RESARTING;
      return;
    }
    if( this._morse_status != M.MorsePlayer.ST_MORSE_NONE ) {
      return;
    }
    this.emptyCharSpace(false);
    this._morse_status = M.MorsePlayer.ST_MORSE_STARTING;
    this.start();
    this._morse_base_ms = Date.now();
    this._morse_count = 0;
    this._morse_status = 0;
    // this._morse_queue = []; // naver cleared
    this._morse_interval_id = setInterval(function(_this){
      return function() {
        _this.tickMorse();
      }
    }(this), 1);
  };

  M.MorsePlayer.prototype.finishMorse = function finishMorse(tag) {
    if( this._morse_status == M.MorsePlayer.ST_MORSE_STARTING ) {
      this._morse_status = M.MorsePlayer.ST_MORSE_UNSARTING;
      return;
    }
    if( this._morse_status != M.MorsePlayer.ST_MORSE_WORKING ) {
      return;
    }
    this._morse_status = M.MorsePlayer.ST_MORSE_FINISHING;
    if( this._morse_interval_id !== null ) {
      clearInterval(this._morse_interval_id);
    }
    this.emptyCharSpace(false);
    this._morse_base_ms = 0;
    this._morse_count = 0;
    this._morse_status = 0;
    this._morse_interval_id = null;
    this._morse_queue = [];
    this.finish(tag);
  };

  M.MorsePlayer.prototype.getPhrase = function getPhrase() {
    return null;
  };

  M.MorsePlayer.prototype.tickMorse = function tickMorse() {
    var now_ms = Date.now();
    if( this._morse_next_ms > 0 ) {
      // check fin
      if( now_ms > this._morse_next_ms ) {
        // fin 1
        this._morse_status = 1;
        this._morse_next_ms = 0;
        this.beepOff();
      }
    }
    if( !(this._morse_queue.length >0) ) {
      if( this._morse_status != 0 ) {
        var ev = {"type": "morseempty", "caller": this, "phrase": null}
        this.fire(ev);
        if( ev.phrase != null ) {
          this.pushText(ev.phrase);
        }
        else {
          this.finishMorse("morseempty");
        }
      }
      return;
    }
    if( this._morse_status == 0 ||  this._morse_status == 1 ) {
      var one = this._morse_queue.shift();
      this._morse_count = this._morse_count + one[1];
      this._morse_next_ms = this._morse_base_ms + this._morse_count * this._morse_ms_per_point;
      // this._morse_next_ms = Date.now() + one[1] * this._morse_ms_per_point;
      if( this._morse_status == 0 ) {
        this.fire({"type": "morsereloaded", "caller": this});
      }
      this._morse_status = 2; // updates status
      var cnt = one[1];
      if( one[0] ) {
        this.beepOn();
      }
      else {
        this.beepOff();
      }
    }
  }

})((this || 0).self || global);
