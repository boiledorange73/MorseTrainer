(function (global) {
  'use strict';
  if( !global.morse ) {
    global.morse = {};
  }

  var M = global.morse;

  M.ScenarioPlayer = function ScenarioPlayer(settings) {
    settings = settings ? settings : {};
    M.MorsePlayer.call(this, settings);
    this._random = !!settings.random;
    this._repeat = settings.repeat * 1;
    this._repeat_count = 0;
    this._scenario = null;
    this.on("morsestarted", function(_this){return function(ev){_this.onMorseStarted(ev);}}(this));
    this.on("morsefinished", function(_this){return function(ev){_this.onMorseFinished(ev);}}(this));
    this.on("morseempty", function(_this){return function(ev){_this.onMorseEmpty(ev);}}(this));
  }

  M.ScenarioPlayer.prototype = new M.MorsePlayer();

  M.ScenarioPlayer.prototype.onMorseStarted = function onMorseStarted(ev) {
    this.fire({"type": "scenariostarted", "caller": this});
  };

  M.ScenarioPlayer.prototype.onMorseFinished = function onMorseFinished(ev) {
    this.fire({"type": "scenariofinished", "caller": this});
  };

  M.ScenarioPlayer.prototype.onMorseEmpty = function onMorseEmpty(ev) {
    ev.phrase = this.getPhrase();
  };

  M.ScenarioPlayer.prototype.scenario = function scenario(value) {
    if( arguments != null && arguments.length >= 1 ) {
      this._scenario = value;
      this._queue = [];
      this._last = null;
      return this;
    }
    return this._scenario;
  }

  M.ScenarioPlayer.prototype.random = function random(value) {
    if( arguments != null && arguments.length >= 1 ) {
      value = !!value;
      if( (!!this._random) !== value ) {
        this._random = value;
        this.clearQueue();
      }
      return this;
    }
    return !!this._random;
  };

  M.ScenarioPlayer.prototype.repeat = function repeat(value) {
    if( arguments != null && arguments.length >= 1 ) {
      this._repeat = value * 1;
      this._repeat_count = 0;
      return this;
    }
    return !!this._repeat;
  };

  M.ScenarioPlayer.prototype.isRepeatable = function isRepeatable() {
    return !(this._repeat > 0) || this._repeat_count < this._repeat;
  };

  M.ScenarioPlayer.prototype.countUpRepeat = function countUpRepeat() {
    if( this._repeat > 0 ) {
      this._repeat_count++;
    }
    return this;
  };


  M.ScenarioPlayer.prototype.clearQueue = function clearQueue() {
    this._queue = [];
    this._last = null;
  };

  M.ScenarioPlayer.prototype.initPhrase = function initPhrase() {
    this.countUpRepeat();
    // makes rands
    var len = this._scenario && this._scenario.phrases ? this._scenario.phrases.length : 0;
    if( len > 0 ) {
      this._queue = this._scenario.phrases.slice(0, len);
      if( this.random() && len > 1 ) {
        // shuffle
        var m, t;
        for( var n = 0; n < len; n++ ) {
          m = Math.floor(Math.random() * len);
          t = this._queue[n];
          this._queue[n] = this._queue[m];
          this._queue[m] = t;
        }
        // makes first not equal last
        if( this._last !== null && this._queue[0] == this._last ) {
          m = Math.floor(Math.random() * (len-1)) + 1;
          t = this._queue[0];
          this._queue[0] = this._queue[m];
          this._queue[m] = t;
        }
      }
    }
  };

  M.ScenarioPlayer.prototype.getPhrase = function getPhrase() {
    if( !(this._queue != null && this._queue.length > 0) && this.isRepeatable() ) {
      this.initPhrase();
    }
    if( !(this._queue.length > 0) ) {
      return null;
    }
    var r = this._queue.shift();
    this._last = r;
    return r;
  };

  M.ScenarioPlayer.prototype.startScenario = function startScenario() {
    this.morseLang(this._scenario && this._scenario.lang ? this._scenario.lang: "C");
    this._repeat_count = 0;
    this.initPhrase();
    this.pushText(this.getPhrase());
    this.startMorse();
  };

  M.ScenarioPlayer.prototype.finishScenario = function finishScenario() {
    this.finishMorse();
  };

})((this || 0).self || global);
