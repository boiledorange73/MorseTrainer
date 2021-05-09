
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
  var e_random = document.getElementById("RANDOM");
  var e_speed = document.getElementById("SPEED");
  var e_scenario = document.getElementById("SCENARIO");
  var e_clear = document.getElementById("CLEAR");

  scenarioList = new morse.ScenarioList({"list":list});

  function reset() {
    // localStorage
    e_vol.value = mynz(localStorage.getItem("e_vol"), "10");
    e_vol.onchange = function() {
      localStorage.setItem("e_vol",e_vol.value);
    };
    e_times.value = mynz(localStorage.getItem("e_times"), "-1");
    e_times.onchange = function() {
      localStorage.setItem("e_times",e_times.value);
    };
    e_random.checked = (localStorage.getItem("e_random") == "true");
    e_random.onchange = function() {
      localStorage.setItem("e_random",e_random.checked ? "true" : "false");
    };
    e_speed.value = mynz(localStorage.getItem("e_speed"), "100");
    e_speed.onchange = function() {
      localStorage.setItem("e_speed",e_speed.value);
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
  };

  var fn_finished = function() {
    // may called 2 times (by finish() and tick())
    e_start.disabled = false;
    e_stop.disabled = true;
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
    var e_random = document.getElementById("RANDOM");
    var e_speed = document.getElementById("SPEED");
    // sets values
    player.repeat(e_times.value);
    player.random(e_random.checked);
    player.charactersPerMinute(e_speed.value);
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
    if( !window.confirm || window.confirm("設定を消去しますか？") ) {
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
    callback(props);
  }
}

function loadScenarioList(callback) {
  if( window.cordova ) {
    dirpath = cordova.file.externalApplicationStorageDirectory;
  }
  else if( window.Android ){
    _OnScenarioListGot_Callback = callback;
    Android.requestScenarioList("scenarios.json");
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
      "randam": false,
      "phrases": [
        "A","B","C","D","E","F","G"
      ]
    },
    {
      "id": "H-N",
      "lang": "C",
      "name": "H-N",
      "randam": false,
      "phrases": [
        "H","I","J","K","L","M","N"
      ]
    },
    {
      "id": "O-T",
      "lang": "C",
      "name": "O-T",
      "randam": false,
      "phrases": [
        "O","P","Q","R","S","T"
      ]
    },
    {
      "id": "U-Z",
      "lang": "C",
      "name": "U-Z",
      "randam": false,
      "phrases": [
        "U","V","W","X","Y","Z"
      ]
    },
    {
      "id": "A-Z0-9",
      "lang": "C",
      "name": "A-Z",
      "randam": false,
      "phrases": [
        "A","B","C","D","E","F","G",
        "H","I","J","K","L","M","N",
        "O","P","Q","R","S","T",
        "U","V","W","X","Y","Z",
        "1","2","3","4","5","6","7","8","9","0"
      ]
    },
    {
      "id": "ア行",
      "lang": "ja",
      "name": "ア行",
      "randam": false,
      "phrases": [
        "ア","イ","ウ","エ","オ"
      ]
    },
    {
      "id": "カ行",
      "lang": "ja",
      "name": "カ行",
      "randam": false,
      "phrases": [
        "カ","キ","ク","ケ","コ"
      ]
    },
    {
      "id": "サ行",
      "lang": "ja",
      "name": "サ行",
      "randam": false,
      "phrases": [
        "サ","シ","ス","セ","ソ"
      ]
    },
    {
      "id": "タ行",
      "lang": "ja",
      "name": "タ行",
      "randam": false,
      "phrases": [
        "タ","チ","ツ","テ","ト"
      ]
    },
    {
      "id": "ナ行",
      "lang": "ja",
      "name": "ナ行",
      "randam": false,
      "phrases": [
        "ナ","ニ","ヌ","ネ","ノ"
      ]
    },
    {
      "id": "ハ行",
      "lang": "ja",
      "name": "ハ行",
      "randam": false,
      "phrases": [
        "ハ","ヒ","フ","ヘ","ホ"
      ]
    },
    {
      "id": "マ行",
      "lang": "ja",
      "name": "マ行",
      "randam": false,
      "phrases": [
        "マ","ミ","ム","メ","モ"
      ]
    },
    {
      "id": "ヤ行",
      "lang": "ja",
      "name": "ヤ行",
      "randam": false,
      "phrases": [
        "ヤ","ユ","ヨ"
      ]
    },
    {
      "id": "ラ行",
      "lang": "ja",
      "name": "ラ行",
      "randam": false,
      "phrases": [
        "ラ","リ","ル","レ","ロ"
      ]
    },
    {
      "id": "ワ行",
      "lang": "ja",
      "name": "ワ行",
      "randam": false,
      "phrases": [
        "ワ","ヰ","ヱ","ヲ"
      ]
    },
  ];
}
