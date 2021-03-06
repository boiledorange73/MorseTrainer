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
    this._ms = settings.ms * 1;
    this._ms_start = null;
    this._ms_end = null;
    this._scenario = null;
    this._interval = false;
    this._interval_count = 0;
    this.on("morsestarted", function(_this){return function(ev){_this.onMorseStarted(ev);}}(this));
    this.on("morsefinished", function(_this){return function(ev){_this.onMorseFinished(ev);}}(this));
    this.on("morseempty", function(_this){return function(ev){_this.onMorseEmpty(ev);}}(this));
  }

  M.ScenarioPlayer.prototype = new M.MorsePlayer();

  M.ScenarioPlayer.prototype.onMorseStarted = function onMorseStarted(ev) {
    this.fire({"type": "scenariostarted", "caller": this});
  };

  M.ScenarioPlayer.prototype.onMorseFinished = function onMorseFinished(ev) {
    this.fire({"type": "scenariofinished", "tag": ev.tag, "caller": this});
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

  M.ScenarioPlayer.prototype.interval = function interval(value) {
    if( arguments != null && arguments.length >= 1 ) {
      this._interval = !!value;
      this._interval_count = 0;
      return this;
    }
    return !!this._interval;
  };

  M.ScenarioPlayer.prototype.ms = function ms(value) {
    if( arguments != null && arguments.length >= 1 ) {
      this._ms = value * 1;
      return this;
    }
    return !!this._ms;
  };

  M.ScenarioPlayer.prototype.getMsRest = function getMsRest() {
    if( this._ms_end > 0 ) {
      return this._ms_end - (new Date()).getTime();
    }
    return null;
  }
  
  M.ScenarioPlayer.prototype.clearQueue = function clearQueue() {
    this._queue = [];
    this._last = null;
  };

  M.ScenarioPlayer.prototype.initPhrase = function initPhrase() {
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
    if( this._queue == null || !(this._queue.length > 0) ) {
      // no data in _queue
      var fin = false;
      // checks repeat condition
      if( this._repeat > 0 ) {
        if( this._repeat_count + 1 >= this._repeat ) {
          fin = true;
        }
        else {
          this._repeat_count++;
        }
      }
      // checks time condition
      if( this._ms_end > 0 &&  (new Date()).getTime() >= this._ms_end ) {
        fin = true;
      }
      if( fin ) {
        // fin
        if( !this._finalcode ) {
          this._finalcode = true;
          return " \\";
        }
        else {
          this.finishMorse("scenariocounted");
          return null;
        }
      }
      // not fin
      this.initPhrase();
    }
    // checks queue already has something or fetched newly
    if( !(this._queue.length > 0) ) {
      return null;
    }
    //
    var r = this._queue.shift();
    if(  this._interval && this._scenario.interval_skip > 0 ) {
      if( this._interval_count == this._scenario.interval_skip ) {
        r = " " + r;
        this._interval_count = 0;
      }
      this._interval_count++;
    }
    this._last = r;
    return r;
  };

  M.ScenarioPlayer.prototype.startScenario = function startScenario() {
    this.morseLang(this._scenario && this._scenario.lang ? this._scenario.lang: "C");
    this._repeat_count = 0;
    this._ms_end = this._ms > 0 ? (new Date()).getTime() + this._ms : null;
    this._interval_count = 0;
    this._finalcode = false;
    this.initPhrase();
    this.pushText(this.getPhrase());
    this.startMorse();
  };

  M.ScenarioPlayer.prototype.finishScenario = function finishScenario(tag) {
    this.finishMorse(tag);
  };

})((this || 0).self || global);
