#!/usr/bin/env node

// This script runs under node, and `serverless-webrtc.html` runs inside
// a browser.
// Usage: `node serverless-webrtc.js` or `node serverless-webrtc.js --create`.
var webrtc = require('wrtc');
var readline = require('readline');
var ansi = require('ansi');
var cursor = ansi(process.stdout);

var mqtt = require('mqtt'); //var mqtt = require('./')
//var mqtt_client = mqtt.connect('mqtt://test.mosquitto.org')
var mqtt_client = mqtt.connect('mqtt://ocn.cloudns.org')
//var mqtt_client = mqtt.connect('mqtt://broker.hivemq.com');
//mqtt_client.end();

process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
    mqtt_client.end();
    process.exit();
});

/*
let count = 0;
client.subscribe('presence')
//client.subscribe('1/feeds/sensor')
client.on('message', function (topic, message) {
  console.log('Client got message: ' + message.toString())
  count++;
  if(count>3) {
    client.end()
    return;    
  }
})
//client.end()
console.log('End of script');
*/



var pc = null;
var Goffer = null;
var Ganswer = null;

/* 1. Global settings, data and functions. */
var dataChannelSettings = {
  'reliable': {
        ordered: true,
        maxRetransmits: 0
      },
};

var pcSettings = [
  {
    iceServers: [{url:'stun:stun.l.google.com:19302'}]
  },
  {
    'optional': [{DtlsSrtpKeyAgreement: false}]
  }
];

var pendingDataChannels = {};
var dataChannels = {}

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

if (process.argv[2] == "--create") {
  //makeOffer();
  mqtt_makeOffer();
}
else {
  /*
  rl.question("Please paste your offer:\n", function(_offer) {
    getOffer(_offer);
  });
  */
  console.log("INFO: mqtt_client.subscribe('makeOffer')")
  mqtt_client.subscribe('makeOffer')
  mqtt_client.on('message', function(topic, _offer) {
  console.log("INFO: mqtt_client.on('makeOffer')")
    mqtt_getOffer(_offer);
  });
}

function doHandleError(error) {
  throw error;
}

function onsignalingstatechange(state) {
  //console.info('signaling state change:', state);
}
function oniceconnectionstatechange(state) {
  //console.info('ice connection state change:', state);
}
function onicegatheringstatechange(state) {
  //console.info('ice gathering state change:', state);
}

function inputLoop(channel) {
  cursor.green();
  rl.question("> ", function(text) {
    channel.send(JSON.stringify({message: text}));
    inputLoop(channel);
  });
}

/* 2. This code deals with the --join case. */

function mqtt_getOffer(pastedOffer) {
  data = JSON.parse(pastedOffer);
  Goffer = new webrtc.RTCSessionDescription(data);
  Ganswer = null;

  pc = new webrtc.RTCPeerConnection(pcSettings);
  pc.onsignalingstatechange = onsignalingstatechange;
  pc.oniceconnectionstatechange = oniceconnectionstatechange;
  pc.onicegatheringstatechange = onicegatheringstatechange;
  pc.onicecandidate = function(candidate) {
    // Firing this callback with a null candidate indicates that
    // trickle ICE gathering has finished, and all the candidates
    // are now present in pc.localDescription.  Waiting until now
    // to create the answer saves us from having to send offer +
    // answer + iceCandidates separately.
    if (candidate.candidate == null) {
      mqtt_doShowAnswer();
    }
  }
  doHandleDataChannels();
}
function mqtt_doShowAnswer() {
  Ganswer = pc.localDescription;
  console.log("\n\nHere is your answer:");  
  //console.log(JSON.stringify(Ganswer) + "\n\n");
  mqtt_client.publish('sendAnswer', JSON.stringify(Ganswer));
}

/*
function getOffer(pastedOffer) {
  data = JSON.parse(pastedOffer);
  Goffer = new webrtc.RTCSessionDescription(data);
  Ganswer = null;

  pc = new webrtc.RTCPeerConnection(pcSettings);
  pc.onsignalingstatechange = onsignalingstatechange;
  pc.oniceconnectionstatechange = oniceconnectionstatechange;
  pc.onicegatheringstatechange = onicegatheringstatechange;
  pc.onicecandidate = function(candidate) {
    // Firing this callback with a null candidate indicates that
    // trickle ICE gathering has finished, and all the candidates
    // are now present in pc.localDescription.  Waiting until now
    // to create the answer saves us from having to send offer +
    // answer + iceCandidates separately.
    if (candidate.candidate == null) {
      doShowAnswer();
    }
  }
  doHandleDataChannels();
}
*/

function doShowAnswer() {
  Ganswer = pc.localDescription;
  console.log("\n\nHere is your answer:");
  console.log(JSON.stringify(Ganswer) + "\n\n");
}

function doCreateAnswer() {
  pc.createAnswer(doSetLocalDesc, doHandleError);
}

function doSetLocalDesc(desc) {
  Ganswer = desc;
  pc.setLocalDescription(desc, function(){}, doHandleError);
};

function doHandleDataChannels() {
  var labels = Object.keys(dataChannelSettings);
  pc.ondatachannel = function(evt) {
    var channel = evt.channel;
    var label = channel.label;
    pendingDataChannels[label] = channel;
    //channel.binaryType = 'arraybuffer';
    channel.onopen = function() {
      dataChannels[label] = channel;
      delete pendingDataChannels[label];
      if(Object.keys(dataChannels).length === labels.length) {
        mqtt_client.end();
        console.log("\nConnected!");
        inputLoop(channel);
      }
    };
    channel.onmessage = function(evt) {
      data = JSON.parse(evt.data);
      cursor.blue();
      console.log(data.message);
      inputLoop(channel);
    };
    channel.onerror = doHandleError;
  };

  pc.setRemoteDescription(Goffer, doCreateAnswer, doHandleError);
}

/* 3. From here on down deals with the --create case. */
function mqtt_makeOffer()
{
  pc = new webrtc.RTCPeerConnection(pcSettings);
  makeDataChannel();
  pc.onsignalingstatechange = onsignalingstatechange;
  pc.oniceconnectionstatechange = oniceconnectionstatechange;
  pc.onicegatheringstatechange = onicegatheringstatechange;
  pc.createOffer(function (desc) {
    pc.setLocalDescription(desc, function () {}, function (err) {});
    // We'll pick up the offer text once trickle ICE is complete,
    // in onicecandidate.
    },function (err) {
    console.log("Error ", err);
  });
  pc.onicecandidate = function(candidate) {
    // Firing this callback with a null candidate indicates that
    // trickle ICE gathering has finished, and all the candidates
    // are now present in pc.localDescription.  Waiting until now
    // to create the answer saves us from having to send offer +
    // answer + iceCandidates separately.
    if (candidate.candidate == null) {
      console.log("Your offer is:");
      console.log(JSON.stringify(pc.localDescription));
      console.log("INFO: mqtt_client.publish('makeOffer'");
      mqtt_client.publish('makeOffer', JSON.stringify(pc.localDescription));
      
      console.log("INFO: mqtt_client.on('sendAnswer'");
      mqtt_client.subscribe('sendAnswer')
      mqtt_client.on('message', function (topic, _answer) {
          console.log('Got an answer: ' + _answer.toString())
          getAnswer(_answer);
      })
      //rl.question("Please paste your answer:\n", function(_answer) {
      //  getAnswer(_answer);
      //});
    }
  }

}
/*
function makeOffer() {
  pc = new webrtc.RTCPeerConnection(pcSettings);
  makeDataChannel();
  pc.onsignalingstatechange = onsignalingstatechange;
  pc.oniceconnectionstatechange = oniceconnectionstatechange;
  pc.onicegatheringstatechange = onicegatheringstatechange;
  pc.createOffer(function (desc) {
    pc.setLocalDescription(desc, function () {}, function (err) {});
    // We'll pick up the offer text once trickle ICE is complete,
    // in onicecandidate.
    },function (err) {
    console.log("Error ", err);
  });
  pc.onicecandidate = function(candidate) {
    // Firing this callback with a null candidate indicates that
    // trickle ICE gathering has finished, and all the candidates
    // are now present in pc.localDescription.  Waiting until now
    // to create the answer saves us from having to send offer +
    // answer + iceCandidates separately.
    if (candidate.candidate == null) {
      console.log("Your offer is:");
      console.log(JSON.stringify(pc.localDescription));
      rl.question("Please paste your answer:\n", function(_answer) {
        getAnswer(_answer);
      });
    }
  }
}
*/
function makeDataChannel() {
  // If you don't make a datachannel *before* making your offer (such
  // that it's included in the offer), then when you try to make one
  // afterwards it just stays in "connecting" state forever.  This is
  // my least favorite thing about the datachannel API.
  var channel = pc.createDataChannel('test', {reliable:true});
  channel.onopen = function() {
    console.log("\nConnected!");
    mqtt_client.end();
    inputLoop(channel);
  };
  channel.onmessage = function(evt) {
    data = JSON.parse(evt.data);
    cursor.blue();
    console.log(data.message);
    inputLoop(channel);
  };
  channel.onerror = doHandleError;
}

function getAnswer(pastedAnswer) {
  data = JSON.parse(pastedAnswer);
  Ganswer = new webrtc.RTCSessionDescription(data);
  pc.setRemoteDescription(Ganswer);
}
