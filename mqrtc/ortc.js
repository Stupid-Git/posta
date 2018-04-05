var webrtc = require('wrtc');

var EventEmitter = require('events').EventEmitter;
var util = require('util');

function Ortc( dummyParam )
{
    pc = null;
    this.Ganswer = null;
    this.pendingDataChannels = {};
    this.dataChannels = {}
    this.channel;

    //console.log('===== START: Ortc =====')
    // call the super constructor to initialize `this`
    EventEmitter.call(this);
    // your own initialization of `this` follows here

    var that = this;

    //function setOffer( offer ) { // NOT PUBLIC
    this.setAnswer = function( answer ) {
        console.log('[Ortc] got Answer.length =', answer.length );
        getAnswer( answer )
    }

    //function fakeOnicecandidate() { // NOT PUBLIC
    this.fakeOnicecandidate = function() { // PUBLIC
        //var localDescription = { text: 'wtf'};
        var localDescription = {"type":"offer","sdp":"v=0\r\no=- 1533404694000337664 2 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE data\r\na=msid-semantic: WMS\r\nm=application 64348 DTLS/SCTP 5000\r\nc=IN IP4 192.168.194.32\r\na=candidate:2823902898 1 udp 2122265343 fd56:5799:d8f6:1f2d:b299:9386:6521:99bd 64346 typ host generation 0 network-id 5 network-cost 50\r\na=candidate:3236845751 1 udp 2122199807 fd27:a0a7:73a3:25::9b8 64347 typ host generation 0 network-id 2 network-cost 50\r\na=candidate:2293731847 1 udp 2122129151 192.168.194.32 64348 typ host generation 0 network-id 4 network-cost 50\r\na=candidate:2999745851 1 udp 2122063615 192.168.56.1 64349 typ host generation 0 network-id 3 network-cost 50\r\na=candidate:3844927209 1 udp 2121998079 10.2.254.15 64350 typ host generation 0 network-id 1 network-cost 50\r\na=candidate:3872565826 1 tcp 1518285567 fd56:5799:d8f6:1f2d:b299:9386:6521:99bd 64547 typ host tcptype passive generation 0 network-id 5 network-cost 50\r\na=candidate:2389550151 1 tcp 1518220031 fd27:a0a7:73a3:25::9b8 64548 typ host tcptype passive generation 0 network-id 2 network-cost 50\r\na=candidate:3325325047 1 tcp 1518149375 192.168.194.32 64549 typ host tcptype passive generation 0 network-id 4 network-cost 50\r\na=candidate:4233069003 1 tcp 1518083839 192.168.56.1 64550 typ host tcptype passive generation 0 network-id 3 network-cost 50\r\na=candidate:2880377369 1 tcp 1518018303 10.2.254.15 64551 typ host tcptype passive generation 0 network-id 1 network-cost 50\r\na=ice-ufrag:z0U1\r\na=ice-pwd:CN6YQSNR7JRMa171CVVjjplG\r\na=fingerprint:sha-256 13:9E:24:F8:C6:A5:C2:6C:E0:9E:AA:20:83:C1:63:E0:F7:3E:C3:D8:65:7A:6C:CA:01:F9:F9:A2:03:B5:BB:7B\r\na=setup:actpass\r\na=mid:data\r\na=sctpmap:5000 webrtc-datachannel 1024\r\n"};
        //console.log("Your offer is:");
        //console.log(JSON.stringify(localDescription));
        console.log('[Ortc] made Offer.length =', localDescription.length );
        this.emit('gotOffer', localDescription);
    }

    //-------------------------------------------------------------------------
    this.sendData = function( text ) {
        //console.log('ortc: sendData: ', JSON.stringify({message: text}) )
        //var message = { text: 'Hello'};
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
    
    var OLDpcSettings = [
      {
        //iceServers: [{url:'stun:stun.l.google.com:19302'}]
        iceServers: [{url:'stun:ocn.cloudns.org:3478'}]
      },
      {
        'optional': [{DtlsSrtpKeyAgreement: false}]
      }
    ];
    var pcSettings = { 
        iceServers: [
          {
            urls : 'turn:ocn.cloudns.org:3478',
            username:'karel',
            credential:'abc123'
            //urls: "stun:stun.services.mozilla.com",
            //username: "louis@mozilla.com", 
            //credential: "webrtcdemo"
          }//,{
          //  urls: 'stun:ocn.cloudns.org:3478'
          //}
        ]
      };
    
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
    inputLoop = function(channel) {
        var that = this;
        cursor.green();
        rl.question("> ", function(text) {
              channel.send(JSON.stringify({message: text}));
              that.inputLoop(channel);
        });
    }
    */    
    
    //========================================================================
    //===== O offer (create side) ============================================
    //========================================================================
    onmessage = function(evt) {
        var that = this;
        data = JSON.parse(evt.data);
        //cursor.blue();
        //that.inputLoop(that.channel);
        that.emit('gotData', data.message )
    };

    this.makeDataChannel = function(callbackForConnected ) {
        // If you don't make a datachannel *before* making your offer (such
        // that it's included in the offer), then when you try to make one
        // afterwards it just stays in "connecting" state forever.  This is
        // my least favorite thing about the datachannel API.
        var that = this;
        //var channel = pc.createDataChannel('test', {reliable:true});
        this.channel = pc.createDataChannel('test', {reliable:true});
    
        this.channel.onopen = function() {
            console.log("\nConnected!");
            callbackForConnected();
            //mqtt_client.end();
            //that.inputLoop(this.channel);
        };
        //this.channel.onmessage = this.onmessage; // <= this = RTCDataChannel { addEventListener: , .
        
        this.channel.onmessage = function(evt) {
            //data = JSON.parse(evt.data);
            //cursor.blue();
            //console.log(data.message);
            //that.inputLoop(channel);
            //var that = this;
            data = JSON.parse(evt.data);
            that.emit('gotData', data.message )
        };
        
        this.channel.onerror = this.doHandleError;
    }
    
    getAnswer = function(pastedAnswer) {
      data = pastedAnswer; //JSON.parse(pastedAnswer);
      Ganswer = new webrtc.RTCSessionDescription(data);
      pc.setRemoteDescription(Ganswer);
    }
    
    /* 3. From here on down deals with the --create case. */
    this.mqtt_makeOffer = function( callbackForConnected ) //public
    {
        var that = this;
        pc = new webrtc.RTCPeerConnection(pcSettings);
        this.makeDataChannel(callbackForConnected);
        pc.onsignalingstatechange = this.onsignalingstatechange;
        pc.oniceconnectionstatechange = this.oniceconnectionstatechange;
        pc.onicegatheringstatechange = this.onicegatheringstatechange;
        pc.createOffer(function (desc) {
            pc.setLocalDescription(desc, function () {}, function (err) {});
            // We'll pick up the offer text once trickle ICE is complete,
            // in onicecandidate.
            },function (err) {
            console.log("Error ", err);
        });
    
        var that = this;
        pc.onicecandidate = function(candidate) {
            // Firing this callback with a null candidate indicates that
            // trickle ICE gathering has finished, and all the candidates
            // are now present in pc.localDescription.  Waiting until now
            // to create the answer saves us from having to send offer +
            // answer + iceCandidates separately.
            if (candidate.candidate == null) {
                //console.log("Your offer is:");
                //console.log(JSON.stringify(pc.localDescription));
                that.emit('gotOffer', pc.localDescription);
            }
        }
    }
    
    //if (process.argv[2] == "--create") {
    //do_it_o = function() {
    //  this.mqtt_makeOffer();
    //}

}


// Declare that your class should use EventEmitter as its prototype.
// This is roughly equivalent to: Master.prototype = Object.create(EventEmitter.prototype)
util.inherits(Ortc, EventEmitter);

module.exports = Ortc;
//module.exports = new Ortc();
