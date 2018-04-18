// OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
// OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
// OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
var mqttParam_2 = { mqttServer : 'mqtt://ocn.cloudns.org',
              topic_sendAnswer: 'sendAnswer',
              topic_makeOffer:  'makeOffer'
};

var Om = require('../mqrtc/om');
var Ortc = require('../mqrtc/ortc');

var om = new Om(mqttParam_2);
var ortc = new Ortc('dummyParam');

ortc.on('gotOffer', (offer) => {
    console.log('[O ] got offer  from ortc = ')//, offer )
    om.sendOffer( offer );
});
om.on('gotAnswer', (answer) => {
    console.log('[O ] got answer from   om = ')//, answer )
    ortc.setAnswer( answer );
});


//====================================================================
// SCAN BLUETOOTH LE
//====================================================================
require('./rb2_util'); // const SCANSTART_REM  etc 


var o_i = 10;
var o_text =  'Hello';
ortc.on('gotData', (dataIn) => {
    //console.log('[O ] got dataIn from crtc = ', dataIn )   
    cmd = dataIn.cmd;
    switch( dataIn.cmd)
    {
        case SCANSTARTED_REM:
            console.log('Scan Started dataIn =', dataIn);
            break;
        case SCANSTOPPED_REM:
            console.log('Scan Stopped dataIn =', dataIn);
        break;
        case SCANDATA_REM:
            console.log('Scan Data : id = ', dataIn.payload.id );
            //console.log('Scan Data : ', dataIn.payload );
            break;
    }
    /*
    if( o_i > 0)
    {
        o_i--;
        o_text +=  ' Bello';
        ortc.sendData( o_text );
    }
    */

});

callbackForConnected = function()
{
    console.log('callbackForConnected ')
}
// Start in rolling
//ortc.fakeOnicecandidate();
delay = 1;
setTimeout(function(){

    //ortc.fakeOnicecandidate();
    ortc.mqtt_makeOffer(callbackForConnected);

    delay = 4;
    setTimeout(function() {
        var _cmd = SCANSTART_REM;
        var _payload = "";//data;
        var dataOut = { cmd: _cmd, payload : _payload};
        ortc.sendData( dataOut );

        delay = 4;
        setTimeout(function() {
            var _cmd = SCANSTOP_REM;
            var _payload = "";//data;
            var dataOut = { cmd: _cmd, payload : _payload};
            ortc.sendData( dataOut );            
        }, delay*1000);
    
    
    }, delay*1000);

}, delay*1000);

/**/
