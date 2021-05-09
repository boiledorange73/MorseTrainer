(function (global) {
  'use strict';
  if( !global.morse ) {
    global.morse = {};
  }

  var M = morse;

  M.BeepPlayer = function BeepPlayer(settings) {
    settings = settings ? settings : {};
    this._volume = settings.volume > 0 ? settings.volume : 1;
    this._status = M.BeepPlayer.ST_NONE;
  };

  M.BeepPlayer.ST_NONE = 0;
  M.BeepPlayer.ST_STARTING = 1;
  M.BeepPlayer.ST_WORKING = 2;
  M.BeepPlayer.ST_FINISHING = 3;
  M.BeepPlayer.ST_RESTARTING = 4;
  M.BeepPlayer.ST_UNSTARTING = 5;

  M.BeepPlayer.prototype.on = function on(type, fn) {
    if( !this._event ) {
      this._event = {};
    }
    var argc = arguments ? arguments.length : 0;
    if( argc >= 2 ) {
      if( !this._event[type] ) {
        this._event[type] = [];
      }
      this._event[type].push(fn);
      return this;
    }
    if( argc == 1 ) {
      return this._event[type];
    }
    return null;
  };

  M.BeepPlayer.prototype.off = function on(type, fn) {
    if( type in this._event ) {
      if( fn == null ) {
        delete this._event[type];
      }
      else {
        for( var n = this._event[type].length - 1; n >= 0; n-- ) {
          if( this._event[type][n] == fn ) {
            this._event[type].splice(n, 1);
          }
        }
        if( !(this._event[type].length > 0) ) {
          delete this._event[type];
        }
      }
    }
  };

  M.BeepPlayer.prototype.fire = function fire(ev) {
    if( ev ) {
      var arr = this._event[ev.type];
      var len = arr ? arr.length : 0;
      for( var n = 0; n < len; n++ ) {
        if( arr[n] ) {
          arr[n](ev);
        }
      }
    }
    return this;
  };

  M.BeepPlayer.prototype.start = function start() {
    if( this._status == M.BeepPlayer.ST_FINISHING ) {
      this._status = M.BeepPlayer.ST_RESTARTING;
      return;
    }
    if( this._status != M.BeepPlayer.ST_NONE ) {
      return;
    }
    this._status = M.BeepPlayer.ST_STARTING;
    this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    this.gainNode = this.audioCtx.createGain();
    this.gainNode.connect(this.audioCtx.destination);
    this.gainNode.gain.value = 0;
//    this.gainNode.gain.minValue = 0;
//    this.gainNode.gain.maxValue = this.volume();
    this.oscillator = this.audioCtx.createOscillator();
    this.oscillator.type = 'sine'; // 'square'
    this.oscillator.frequency.value = 440; // value in hertz
    this.oscillator.connect(this.gainNode);
    this.oscillator.start();
    var need_finish = this._status ==  M.BeepPlayer.ST_UNSTARTING;
    this._status = M.BeepPlayer.ST_WORKING;
    this.fire({"type": "started", "caller": this});
    if( need_finish ) {
      this.finish();
    }
  };

  M.BeepPlayer.prototype.finish = function finish() {
    if( this._status == M.BeepPlayer.ST_STARTING ) {
      this._status = M.BeepPlayer.ST_UNSTARTING;
      return;
    }
    if( this._status != M.BeepPlayer.ST_WORKING ) {
      return;
    }
    this._status = M.BeepPlayer.ST_FINISHING;
    if( this.oscillator ) {
      this.oscillator.stop();
    }
    this.oscillator = null;
    this.gainNode = null;
    var needed_restart = this._status == M.BeepPlayer.ST_RESTARTING;
    this._status = M.BeepPlayer.ST_NONE;
    this.fire({"type": "finished", "caller": this});
    if( needed_restart ) {
      this.start();
    }
  };

  M.BeepPlayer.prototype.volume = function volume(value) {
    if( arguments && arguments.length > 0 ) {
      this._volume = value;
      return this;
    }
    return this._volume;
  };

  M.BeepPlayer.prototype.beepOn = function() {
    if( this.gainNode ) {
      this.gainNode.gain.value = this.volume();
    }
  };

  M.BeepPlayer.prototype.beepOff = function() {
    if( this.gainNode ) {
      this.gainNode.gain.value = 0;
    }
  };

})((this || 0).self || global);
