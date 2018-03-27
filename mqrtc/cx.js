
var mqttParam_1 = { mqttServer : 'mqtt://ocn.cloudns.org',
              topic_sendAnswer: 'sendAnswer',
              topic_makeOffer:  'makeOffer'
};

// CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC
// CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC
// CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC
var Cm = require('./cm');
var Crtc = require('./crtc');

var cm = new Cm(mqttParam_1);
var crtc = new Crtc('dummyParam');


cm.on('gotOffer', (offer) => {
    console.log('[C ] got offer  from   cm = ')//, offer )
    crtc.setOffer( offer );
});

crtc.on('gotAnswer', (answer) => {
    console.log('[C ] got answer from crtc = ')//, answer )
    cm.sendAnswer( answer );
});

// that.emit('gotData', data.message )
crtc.on('gotData', (dataIn) => {
    console.log('[C ] got dataIn from ortc = ', dataIn )
    var text = 'And Hello from C side';
    crtc.sendData( text );
});

// OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
// OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
// OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
/*
var mqttParam_2 = { mqttServer : 'mqtt://ocn.cloudns.org',
              topic_sendAnswer: 'sendAnswer',
              topic_makeOffer:  'makeOffer'
};

var Om = require('./om');
var Ortc = require('./ortc');

var om = new Om(mqttParam_2);
var ortc = new Ortc('dummyParam');

ortc.on('gotOffer', (offer) => {
    console.log('[O ] got offer  from ortc = ', offer )
    om.sendOffer( offer );
});

om.on('gotAnswer', (answer) => {
    console.log('[O ] got answer from   om = ', answer )
    ortc.setAnswer( answer );
});


ortc.on('gotData', (dataIn) => {
    console.log('[O ] got dataIn from crtc = ', dataIn )
});


// Start in rolling
//ortc.fakeOnicecandidate();
delay = 1;
setTimeout(function(){

    //ortc.fakeOnicecandidate();
    ortc.mqtt_makeOffer();

    delay = 4;
    setTimeout(function(){
        var text =  'Hello';
        ortc.sendData( text );
        //ortc.sendData( {text: 'Data from O'} );
    }, delay*1000);

}, delay*1000);

*/
