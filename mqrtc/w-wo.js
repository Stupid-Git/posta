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

function wwo()
{
  this.pc = null;
  this.Ganswer = null;
  this.pendingDataChannels = {};
  this.dataChannels = {}
  this.channel;
}

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


var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


wwo.prototype.doHandleError = function(error) {
  throw error;
}

wwo.prototype.onsignalingstatechange = function (state) {
  //console.info('signaling state change:', state);
}
wwo.prototype.oniceconnectionstatechange = function(state) {
  //console.info('ice connection state change:', state);
}
wwo.prototype.onicegatheringstatechange = function(state) {
  //console.info('ice gathering state change:', state);
}



//========================================================================
//===== COMMON ===========================================================
//========================================================================

wwo.prototype.inputLoop = function(channel) {
    var that = this;
    cursor.green();
    rl.question("> ", function(text) {
          channel.send(JSON.stringify({message: text}));
          that.inputLoop(channel);
    });
}
  


//========================================================================
//===== O offer (create side) ============================================
//========================================================================
wwo.prototype.onmessage = function(evt) {
    var that = this;
    data = JSON.parse(evt.data);
    cursor.blue();
    console.log(data.message);
    that.inputLoop(that.channel);
};

wwo.prototype.makeDataChannel = function() {
    // If you don't make a datachannel *before* making your offer (such
    // that it's included in the offer), then when you try to make one
    // afterwards it just stays in "connecting" state forever.  This is
    // my least favorite thing about the datachannel API.
    var that = this;
    //var channel = this.pc.createDataChannel('test', {reliable:true});
    this.channel = this.pc.createDataChannel('test', {reliable:true});

    this.channel.onopen = function() {
        console.log("\nConnected!");
        mqtt_client.end();
        that.inputLoop(this.channel);
    };
    this.channel.onmessage = this.onmessage; // <= this = RTCDataChannel { addEventListener: , .
    /*
    this.channel.onmessage = function(evt) {
        data = JSON.parse(evt.data);
        cursor.blue();
        console.log(data.message);
        that.inputLoop(channel);
    };
    */
    this.channel.onerror = this.doHandleError;
}

wwo.prototype.getAnswer = function(pastedAnswer) {
  data = JSON.parse(pastedAnswer);
  Ganswer = new webrtc.RTCSessionDescription(data);
  this.pc.setRemoteDescription(Ganswer);
}

/* 3. From here on down deals with the --create case. */
wwo.prototype.mqtt_makeOffer = function()
{
    var that = this;
    this.pc = new webrtc.RTCPeerConnection(pcSettings);
    this.makeDataChannel();
    this.pc.onsignalingstatechange = this.onsignalingstatechange;
    this.pc.oniceconnectionstatechange = this.oniceconnectionstatechange;
    this.pc.onicegatheringstatechange = this.onicegatheringstatechange;
    this.pc.createOffer(function (desc) {
        that.pc.setLocalDescription(desc, function () {}, function (err) {});
        // We'll pick up the offer text once trickle ICE is complete,
        // in onicecandidate.
        },function (err) {
        console.log("Error ", err);
    });

    var that = this;
    this.pc.onicecandidate = function(candidate) {
        // Firing this callback with a null candidate indicates that
        // trickle ICE gathering has finished, and all the candidates
        // are now present in this.pc.localDescription.  Waiting until now
        // to create the answer saves us from having to send offer +
        // answer + iceCandidates separately.
        if (candidate.candidate == null) {
            console.log("Your offer is:");
            console.log(JSON.stringify(that.pc.localDescription));
            console.log("INFO: mqtt_client.publish('makeOffer'");
            mqtt_client.publish('makeOffer', JSON.stringify(that.pc.localDescription));
            
            console.log("INFO: mqtt_client.on('sendAnswer'");
            mqtt_client.subscribe('sendAnswer')
            mqtt_client.on('message', function (topic, _answer) {
                console.log('Got an answer: ' + _answer.toString())
                that.getAnswer(_answer);
                //this.getAnswer(_answer);
            })
            //rl.question("Please paste your answer:\n", function(_answer) {
            //  getAnswer(_answer);
            //});
        }
    }
}

//if (process.argv[2] == "--create") {
wwo.prototype.do_it_o = function() {
  this.mqtt_makeOffer();
}

//do_it_o();

var wow = new wwo();

wow.inputLoop = function(channel) {
  //console.log('param channel =', channel);
  var that = this;
  // console.log('this  =', this); -> this = wwo
  //console.log('this.channel  =', this.channel);
  cursor.green();
  rl.question(">>>>>>>>>>>>>>>>>>>>>>> ", function(text) {
        that.channel.send(JSON.stringify({message: text}));
        that.inputLoop(that.channel);
  });
}

// onmessage is a callback from RTCDataChannel
wow.onmessage = function(evt) {
  // console.log('this  =', this); -> this  = RTCDataChannel { addEventListener: , ...
  /*
  var that = this;
  console.log('this  =', this);
  this  = RTCDataChannel {
    addEventListener:     [Function: addEventListener],
    dispatchEvent:        [Function: dispatchEvent],
    removeEventListener:  [Function: removeEventListener],
    send:                 [Function: send],
    close:                [Function: close],
    onopen:               [Function],
    onmessage:            [Function],
    onerror:              [Function] }
  */

  data = JSON.parse(evt.data);
  cursor.red();
  console.log(data.message);
  cursor.green();
  wow.inputLoop(wow.channel);
};

wow.do_it_o();

