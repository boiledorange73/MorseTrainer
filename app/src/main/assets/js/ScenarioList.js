(function (global) {
  'use strict';
  if( !global.morse ) {
    global.morse = {};
  }

  var M = global.morse;

  M.ScenarioList = function ScenarioList(settings) {
    settings = settings ? settings : {};
    this._list = settings.list;
  };

  M.ScenarioList.prototype.fetchIdList = function fetchIdList() {
    var len = this._list != null ? this._list.length : 0;
    var ret = [];
    for( var n = 0; n < len; n++ ) {
      var item = this._list[n];
      if( item != null && item.id != null ) {
        ret.push(item.id);
      }
    }
    return ret;
  };

  M.ScenarioList.prototype.createOptions = function createOptions(doc, e_select) {
    var len = this._list != null ? this._list.length : 0;
    var ret = [];
    for( var n = 0; n < len; n++ ) {
      var item = this._list[n];
      if( item != null && item.id != null ) {
        var e_option = doc.createElement("option");
        e_option.value = item.id;
        e_option.appendChild(doc.createTextNode(item.name));
        e_select.appendChild(e_option);
      }
    }
    return this;
  };

  M.ScenarioList.prototype.getItem = function getItem(id) {
    var len = this._list != null ? this._list.length : 0;
    var ret = [];
    for( var n = 0; n < len; n++ ) {
      var item = this._list[n];
      if( item != null && item.id != null && item.id == id ) {
        return item;
      }
    }
    return null;
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
