(function (global) {
  'use strict';
  if( !global.morse ) {
    global.morse = {};
  }

  var M = global.morse;

  M.Scenario = function Scenario(settings) {
    settings = settings ? setttings : {};
    this.id = settings.id;
    this.lang = settings.lang;
    this.name = settings.name;
    this.phrases = [];
    var len,n;
    len = settings.phrases ? settings.phrases : 0;
    for( var n = 0; n < len; n++ ) {
      this.phrases[n] = settings.phrases[n];
    }
  };


/*
  var scenarios = [
    {
      "id": "ja_あ行",
      "lang": "ja",
      "name": "あ行",
      "randam": false,
      "phrases": [
        "ア","イ","ウ","エ","オ"
      ]
    },
  ];
*/

})((this || 0).self || global);
