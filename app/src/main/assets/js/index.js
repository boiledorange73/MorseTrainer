
//
//
//
// document.addEventListener("deviceready", init, false);
window.addEventListener("load", init, false);

// initialization
function init() {
  loadScenarioList(
    function(list) {
      if( list == null ) {
        list = getScenarioList();
      }
      onScenarioListLoaded(list);
    }
  );
}
  
function onScenarioListLoaded(list) {
  var player = new morse.ScenarioPlayer({"repeat": 0});

  var e_start = document.getElementById("START");
  var e_stop = document.getElementById("STOP");
  var e_click = document.getElementById("CLICK");
  var e_vol = document.getElementById("VOL");
  var e_times = document.getElementById("TIMES");
  var e_minutes = document.getElementById("MINUTES");
  var e_minutes_rest = document.getElementById("MINUTESREST");
  var e_random = document.getElementById("RANDOM");
  var e_interval = document.getElementById("INTERVAL");
  var e_speed = document.getElementById("SPEED");
  var e_scenario = document.getElementById("SCENARIO");
  var e_clear = document.getElementById("CLEAR");

  var watcher_id = null;

  scenarioList = new morse.ScenarioList({"list":list});

  function reset() {
    // localStorage
    e_vol.value = mynz(localStorage.getItem("e_vol"), "10");
    e_vol.onchange = function() {
      localStorage.setItem("e_vol",e_vol.value);
      if( player ) {
        player.volume(parseFloat(e_vol.value)*0.01);
      }
    };
    e_times.value = mynz(localStorage.getItem("e_times"), "-1");
    e_times.onchange = function() {
      localStorage.setItem("e_times",e_times.value);
    };
    e_minutes.value = mynz(localStorage.getItem("e_minutes"), "");
    e_minutes.onchange = function() {
      localStorage.setItem("e_minutes",e_minutes.value);
    };
    e_random.checked = (localStorage.getItem("e_random") == "true");
    e_random.onchange = function() {
      localStorage.setItem("e_random",e_random.checked ? "true" : "false");
    };
    e_interval.checked = (localStorage.getItem("e_interval") == "true");
    e_interval.onchange = function() {
      localStorage.setItem("e_interval",e_interval.checked ? "true" : "false");
      if( player ) {
        player.interval(e_interval.checked);
      }
    };
    e_speed.value = mynz(localStorage.getItem("e_speed"), "100");
    e_speed.onchange = function() {
      localStorage.setItem("e_speed",e_speed.value);
      if( player ) {
        player.charactersPerMinute(parseInt(e_speed.value));
      }
    };
    e_scenario.value = localStorage.getItem("e_scenario");
    e_scenario.onchange = function() {
      localStorage.setItem("e_scenario",e_scenario.value);
    };
/*
    e_scenario.onchange = function() {
      var scenario = scenarioList.getItem(e_scenario.value);
      player.scenario(scenario);
      localStorage.setItem("e_scenario",e_scenario.value);
    };
*/
    e_scenario.onchange();

  }
  //

  e_start.disabled = false;
  e_stop.disabled = true;

  var fn_started = function() {
    e_start.disabled = true;
    e_stop.disabled = false;
    // start watcher
    e_minutes_rest.innerText = "";
    watcher_id = setInterval(function() {
      var rest = player.getMsRest();
      if( rest === null ) {
        e_minutes_rest.innerText = "";
      }
      else if( rest > 0 ) {
        var v = parseInt(rest / 1000);
        var vs = ("00" + (v % 60)).slice(-2);
        e_minutes_rest.innerText = (v >= 60 ? parseInt(v/60)+":" : "") + vs;
      }
      else {
        e_minutes_rest.innerText = "FIN";
      }
    }, 100);
  };

  var fn_finished = function(ev) {
    // may called 2 times (by finish() and tick())
    e_start.disabled = false;
    e_stop.disabled = true;
    e_minutes_rest.innerText = "";
    // finishes watcher
    if( watcher_id !== null ) {
      clearInterval(watcher_id);
      watcher_id = null;
    }
  };

  e_start.onclick = function() {
    var e_scenario = document.getElementById("SCENARIO");
    var scenario = scenarioList.getItem(e_scenario.value);
    if( scenario == null ) {
      return;
    }
    // wakelock
    acquireWake();
    // gets values
    var e_vol = document.getElementById("VOL");
    var e_times = document.getElementById("TIMES");
    var e_minutes = document.getElementById("MINUTES");
    var e_random = document.getElementById("RANDOM");
    var e_interval = document.getElementById("INTERVAL");
    var e_speed = document.getElementById("SPEED");
    // sets values
    player.repeat(e_times.value);
    var minutes = parseInt(e_minutes.value);
    player.ms(minutes > 0 ? 60000 * minutes : null); 
    player.random(e_random.checked);
    player.interval(e_interval.checked);
    player.charactersPerMinute(parseInt(e_speed.value));
    player.volume(parseFloat(e_vol.value) * 0.01);
    player.scenario(scenario);
    player.startScenario();
  }

  function stopPlaying() {
    releaseWake();
    player.finishMorse();
  };

  e_stop.onclick = stopPlaying;
  window.addEventListener("unload", stopPlaying, false);


  player.on("morsestarted", fn_started);
  player.on("morsefinished", fn_finished);

  scenarioList.createOptions(document, e_scenario);

  e_clear.onclick = function() {
    var fn_clear = function() {
      player.finishMorse();
      localStorage.clear();
      reset();
    }
    if( !window.confirm || window.confirm("??????????????????????????????") ) {
      fn_clear();
    }
  }
  reset();
}

function mynz(v, d) {
  if( v == null || v == "" ) {
    return d;
  }
  return v;
}

var _OnScenarioListGot_Callback = null;
function onScenarioListGot(props) {
  var callback = _OnScenarioListGot_Callback;
  _OnScenarioListGot_Callback = null;
  if( callback ) {
    if( props == null ) {
      props = getScenarioList(); // gets default if null
    }
    callback(props);
  }
}

function loadScenarioList(callback) {
  if( window.cordova ) {
    // Cordova
    loadScenarioList_Cordova(callback);
  }
  else if( window.Android ){
    // Android app
    _OnScenarioListGot_Callback = callback;
    Android.requestScenarioList("scenarios.json");
  }
  else {
    // Browser
    if( callback ) {
      callback(null);
    }
  }
}

function loadScenarioList_Cordova(callback) {
  resolveLocalFileSystemURL(
     cordova.file.externalApplicationStorageDirectory+"scenarios.json",
    function onSucceeded(fileEntry) {
      fileEntry.file(
        function (file) {
          var reader = new FileReader();
          reader.onloadend = function (e) {
            var props = JSON.parse(e.target.result);
            callback(props);
          }
          reader.readAsText(file);
        },
        function (error) {
          console.log("loadSettings():fileEntry.file Error: " + error.code);
          callback(getScenarioList());
        }
      );
    },
    function onFail (error) {
      console.log("loadSettings():resolveLocalFileSystemURL Error: " + error.code);
      callback(getScenarioList());
    }
  );
}

function acquireWake() {
  if( window.powerManagement ) {
    powerManagement.acquire(
      function() {
        console.log('Wakelock acquired');
      },
      function() {
        console.log('Failed to acquire wakelock');
      }
    );
  }
  else if(window.Android) {
    Android.acquireWake();
  }
}

function releaseWake() {
  if( window.powerManagement ) {
    powerManagement.release(
      function() {
        console.log('Wakelock released');
      },
      function() {
        console.log('Failed to release wakelock');
      }
    );
  }
  else if(window.Android) {
    Android.releaseWake();
  }
}


function getScenarioList() {

  return [
     {
       "id": "A-G",
       "lang": "C",
       "name": "A-G",
       "interval_skip": 7,
       "phrases": [
         "A","B","C","D","E","F","G"
       ]
     },
     {
       "id": "H-N",
       "lang": "C",
       "name": "H-N",
       "interval_skip": 7,
       "phrases": [
         "H","I","J","K","L","M","N"
       ]
     },
     {
       "id": "O-T",
       "lang": "C",
       "name": "O-T",
       "interval_skip": 6,
       "phrases": [
         "O","P","Q","R","S","T"
       ]
     },
     {
       "id": "U-Z",
       "lang": "C",
       "name": "U-Z",
       "interval_skip": 6,
       "phrases": [
         "U","V","W","X","Y","Z"
       ]
     },
     {
       "id": "A-Z",
       "lang": "C",
       "name": "A-Z (Alphabet)",
       "interval_skip": 5,
       "phrases": [
         "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"
       ]
     },
     {
       "id": "0-9",
       "lang": "C",
       "name": "0-9",
       "randam": false,
       "interval_skip": 5,
       "phrases": [
         "1","2","3","4","5","6","7","8","9","0"
       ]
     },
     {
       "id": "A-Z 0-9",
       "lang": "C",
       "name": "A-Z 0-9 (Alphabet & Number)",
       "interval_skip": 5,
       "phrases": [
         "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z",
         "1","2","3","4","5","6","7","8","9","0"
       ]
     },
     {
       "id": "??????",
       "lang": "ja",
       "name": "??????",
       "interval_skip": 5,
       "phrases": [
         "???","???","???","???","???"
       ]
     },
     {
       "id": "??????",
       "lang": "ja",
       "name": "??????",
       "interval_skip": 5,
       "phrases": [
         "???","???","???","???","???"
       ]
     },
     {
       "id": "??????",
       "lang": "ja",
       "name": "??????",
       "interval_skip": 5,
       "phrases": [
         "???","???","???","???","???"
       ]
     },
     {
       "id": "??????",
       "lang": "ja",
       "name": "??????",
       "interval_skip": 5,
       "phrases": [
         "???","???","???","???","???"
       ]
     },
     {
       "id": "??????",
       "lang": "ja",
       "name": "??????",
       "interval_skip": 5,
       "phrases": [
         "???","???","???","???","???"
       ]
     },
     {
       "id": "??????",
       "lang": "ja",
       "name": "??????",
       "interval_skip": 5,
       "phrases": [
         "???","???","???","???","???"
       ]
     },
     {
       "id": "??????",
       "lang": "ja",
       "name": "??????",
       "interval_skip": 5,
       "phrases": [
         "???","???","???","???","???"
       ]
     },
     {
       "id": "??????",
       "lang": "ja",
       "name": "??????",
       "interval_skip": 5,
       "phrases": [
         "???","???","???","???","???"
       ]
     },
     {
       "id": "??????",
       "lang": "ja",
       "name": "??????",
       "interval_skip": 5,
       "phrases": [
         "???","???","???"
       ]
     },
     {
       "id": "??????",
       "lang": "ja",
       "name": "??????",
       "interval_skip": 5,
       "phrases": [
         "???","???","???","???","???"
       ]
     },
     {
       "id": "?????????",
       "lang": "ja",
       "name": "?????????",
       "interval_skip": 5,
       "phrases": [
         "???","???","???","???","???"
       ]
     },
     {
       "id": "??????????????",
       "lang": "ja",
       "name": "???????????????",
       "interval_skip": 5,
       "phrases": [
         "???","???","??","???","???"
       ]
     },
     {
       "id": "??????",
       "lang": "ja",
       "name": "??????",
       "interval_skip": 5,
       "phrases": [
         "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???"
       ]
     },
     {
       "id": "??????",
       "lang": "ja",
       "name": "??????",
       "interval_skip": 5,
       "phrases": [
         "???","???","???","???","???","???","???","???","???","???","???","???","???","???"
       ]
     },
     {
       "id": "??????",
       "lang": "ja",
       "name": "??????+???",
       "interval_skip": 5,
       "phrases": [
         "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???"
       ]
     },
     {
       "id": "??????",
       "lang": "ja",
       "name": "??????",
       "interval_skip": 5,
       "phrases": [
         "???","???","???","???","???","???","???","???","???","???","???","???","???","???"
       ]
     },
     {
       "id": "??????",
       "lang": "ja",
       "name": "??????",
       "interval_skip": 5,
       "phrases": [
         "???","???","???","???","???","???","???","???","???","???","???","???","???","???","???"
       ]
     },
     {
       "id": "???-???",
       "lang": "ja",
       "name": "???-??? (????????????)",
       "interval_skip": 5,
       "phrases": [
         "???","???","???","???","???",
         "???","???","???","???","???",
         "???","???","???","???","???",
         "???","???","???","???","???",
         "???","???","???","???","???",
         "???","???","???","???","???",
         "???","???","???","???","???",
         "???","???","???","???","???",
         "???","???","???","???","???",
         "???","???","???","???","???",
         "???","???","???","???","???",
         "???","???","???","???","???",
         "???","???","???",
         "???","???","???","???","???",
         "???","???","???","???","???",
         "???","???","??","???","???"
       ]
     }
  ];
}
