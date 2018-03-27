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



function wwc()
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

wwc.prototype.doHandleError = function(error) {
    throw error;
}
  
wwc.prototype.onsignalingstatechange = function (state) {
    //console.info('signaling state change:', state);
}
wwc.prototype.oniceconnectionstatechange = function(state) {
    //console.info('ice connection state change:', state);
}
wwc.prototype.onicegatheringstatechange = function(state) {
    //console.info('ice gathering state change:', state);
}
  

//========================================================================
//===== COMMON ===========================================================
//========================================================================

wwc.prototype.inputLoop = function(channel) {
    var that = this;
    cursor.green();
    rl.question("> ", function(text) {
          channel.send(JSON.stringify({message: text}));
          that.inputLoop(channel);
    });
}



//========================================================================
//===== C join side ======================================================
//========================================================================
var Goffer = null;

/* 2. This code deals with the --join case. */

wwc.prototype.mqtt_getOffer = function(pastedOffer) {
    var that = this;
    data = JSON.parse(pastedOffer);
    Goffer = new webrtc.RTCSessionDescription(data);
    Ganswer = null;
  
    this.pc = new webrtc.RTCPeerConnection(pcSettings);
    this.pc.onsignalingstatechange = this.onsignalingstatechange;
    this.pc.oniceconnectionstatechange = this.oniceconnectionstatechange;
    this.pc.onicegatheringstatechange = this.onicegatheringstatechange;
    this.pc.onicecandidate = function(candidate) {
      // Firing this callback with a null candidate indicates that
      // trickle ICE gathering has finished, and all the candidates
      // are now present in this.pc.localDescription.  Waiting until now
      // to create the answer saves us from having to send offer +
      // answer + iceCandidates separately.
      if (candidate.candidate == null) {
        that.mqtt_doShowAnswer();
      }
    }
    this.doHandleDataChannels();
}

wwc.prototype.mqtt_doShowAnswer = function() {
    Ganswer = this.pc.localDescription;
    console.log("\n\nHere is your answer:");  
    //console.log(JSON.stringify(Ganswer) + "\n\n");
    mqtt_client.publish('sendAnswer', JSON.stringify(Ganswer));
}
  
wwc.prototype.doShowAnswer = function() {
    Ganswer = this.pc.localDescription;
    console.log("\n\nHere is your answer:");
    console.log(JSON.stringify(Ganswer) + "\n\n");
}
  
wwc.prototype.doCreateAnswer = function() {
    this.pc.createAnswer(this.doSetLocalDesc.bind(this), this.doHandleError.bind(this));
}
  
wwc.prototype.doSetLocalDesc = function(desc) {
    Ganswer = desc;
    this.pc.setLocalDescription(desc, function(){}, this.doHandleError.bind(this));
};
  
wwc.prototype.onmessage = function(evt) {
    var that = this;
    data = JSON.parse(evt.data);
    cursor.blue();
    console.log(data.message);
    that.inputLoop(that.channel);
};

wwc.prototype.doHandleDataChannels = function() {
    var that = this;
    var labels = Object.keys(dataChannelSettings);
    this.pc.ondatachannel = function(evt) {
      var channel = evt.channel;
      var label = channel.label;
      that.pendingDataChannels[label] = channel; //that??
      //channel.binaryType = 'arraybuffer';
      channel.onopen = function() {
        that.dataChannels[label] = channel;
        delete that.pendingDataChannels[label];
        if(Object.keys(that.dataChannels).length === labels.length) {
          mqtt_client.end();
          console.log("\nConnected!");
          that.inputLoop(channel);
        }
      };

      channel.onclose = function() {
        console.info('onclose');
      };

      //channel.onmessage = this.onmessage; // NO WORK MATE!
      channel.onmessage = that.onmessage.bind(that); // <= this = wwc
      /*
      channel.onmessage = function(evt) {
          data = JSON.parse(evt.data);
          cursor.blue();
          console.log(data.message);
          that.inputLoop(channel);
      };
      */
      channel.onerror = this.doHandleError;
    };
  
    this.pc.setRemoteDescription(Goffer, this.doCreateAnswer.bind(this), this.doHandleError.bind(this));
}
  
  


wwc.prototype.do_it_c = function() {
    /*
    rl.question("Please paste your offer:\n", function(_offer) {
      getOffer(_offer);
    });
    */
   var that = this;
    console.log("INFO: mqtt_client.subscribe('makeOffer')")
    mqtt_client.subscribe('makeOffer')
    mqtt_client.on('message', function(topic, _offer) {
    console.log("INFO: mqtt_client.on('makeOffer')")
        that.mqtt_getOffer(_offer);
    });
  }
  

//do_it_c();

var wcw = new wwc();
/*
wcw.inputLoop = function(channel) {
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
*/

// onmessage is a callback from RTCDataChannel
wcw.onmessage = function(evt) {
    //console.log('this  =', this); this = wwc { pc: Ganswer: ...}
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
  wcw.inputLoop(wcw.channel);
};

wcw.do_it_c();

