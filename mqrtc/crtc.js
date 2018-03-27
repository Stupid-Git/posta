var webrtc = require('wrtc');
//var readline = require('readline');
var ansi = require('ansi');
//var cursor = ansi(process.stdout);

var EventEmitter = require('events').EventEmitter;
var util = require('util');

function Crtc( dummyParam )
{
    pc = null;
    this.Ganswer = null;
    this.pendingDataChannels = {};
    this.dataChannels = {}
    this.channel;

    //console.log('===== START: Crtc =====')
    // call the super constructor to initialize `this`
    EventEmitter.call(this);
    // your own initialization of `this` follows here

    var that = this;

    //function setOffer( offer ) { // NOT PUBLIC
    this.setOfferTesting = function( offer ) {
        var answer =  { text : "WTF" };
        that.emit('gotAnswer', answer);
    }

    //-------------------------------------------------------------------------
    this.sendData = function( text ) {
        //console.log('crtc: sendData: ', JSON.stringify({message: text}) )
        this.channel.send(JSON.stringify({message: text}));
    }






    //-------------------------------------------------------------------------
    //-------------------------------------------------------------------------
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
    
    
    doHandleError = function(error) {
        throw error;
    }
      
    onsignalingstatechange = function (state) {
        //console.info('signaling state change:', state);
    }
    oniceconnectionstatechange = function(state) {
        //console.info('ice connection state change:', state);
    }
    onicegatheringstatechange = function(state) {
        //console.info('ice gathering state change:', state);
    }
      
    
    //========================================================================
    //===== COMMON ===========================================================
    //========================================================================
    /*
    wwc.prototype.inputLoop = function(channel) {
        var that = this;
        cursor.green();
        rl.question("> ", function(text) {
              channel.send(JSON.stringify({message: text}));
              that.inputLoop(channel);
        });
    }
    */
    
    
    //========================================================================
    //===== C join side ======================================================
    //========================================================================
    var Goffer = null;
    
    /* 2. This code deals with the --join case. */
    this.setOffer = function(pastedOffer) { //mqtt_getOffer
        data = pastedOffer; //JSON.parse(pastedOffer);
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
        this.doHandleDataChannels();
    }    
    mqtt_doShowAnswer = function() {
        Ganswer = pc.localDescription;
        //mqtt_client.publish('sendAnswer', JSON.stringify(Ganswer));
        that.emit('gotAnswer', Ganswer);
    }
      
      
    doCreateAnswer = function() {
        pc.createAnswer(doSetLocalDesc, doHandleError);
    }
      
    doSetLocalDesc = function(desc) {
        Ganswer = desc;
        pc.setLocalDescription(desc, function(){}, doHandleError);
    };
      
    onmessage = function(evt) {
        var that = this;
        data = JSON.parse(evt.data);
        //cursor.blue();
        //console.log(data.message);
        //that.inputLoop(that.channel);
        that.emit('gotData', data.message )
    };
    
    this.doHandleDataChannels = function() {
        var that = this;
        var labels = Object.keys(dataChannelSettings);
        
        pc.ondatachannel = function(evt) {
          var channel = evt.channel;
          var label = channel.label;
          that.pendingDataChannels[label] = channel; //that??
          //channel.binaryType = 'arraybuffer';
          channel.onopen = function() {
            that.dataChannels[label] = channel;
            that.channel = channel; //karel
            delete that.pendingDataChannels[label];
            if(Object.keys(that.dataChannels).length === labels.length) {
              //mqtt_client.end();
              console.log("\nConnected!");
              console.log("\nConnected!");
              //that.inputLoop(channel);
              console.log("Connected!");

            }
          };
    
          channel.onclose = function() {
            console.info('onclose');
          };
    
          //channel.onmessage = this.onmessage; // NO WORK MATE!
          //channel.onmessage = that.onmessage.bind(that); // <= this = wwc
          
          channel.onmessage = function(evt) {
              data = JSON.parse(evt.data);
              //cursor.blue();
              //console.log(data.message);
              //that.inputLoop(channel);
              that.emit('gotData', data.message )
          };
          
          channel.onerror = doHandleError;
        };
      
        pc.setRemoteDescription(Goffer, doCreateAnswer, doHandleError);
    }

}


// Declare that your class should use EventEmitter as its prototype.
// This is roughly equivalent to: Master.prototype = Object.create(EventEmitter.prototype)
util.inherits(Crtc, EventEmitter);

module.exports = Crtc;
//module.exports = new Crtc();

  