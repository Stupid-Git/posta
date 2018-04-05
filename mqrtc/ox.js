// OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
// OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
// OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
var mqttParam_2 = { mqttServer : 'mqtt://ocn.cloudns.org',
              topic_sendAnswer: 'sendAnswer',
              topic_makeOffer:  'makeOffer'
};

var Om = require('./om');
var Ortc = require('./ortc');

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


var o_i = 10;
var o_text =  'Hello';
ortc.on('gotData', (dataIn) => {
    console.log('[O ] got dataIn from crtc = ', dataIn )
    
    if( o_i > 0)
    {
        o_i--;
        o_text +=  ' Bello';
        ortc.sendData( o_text );
    }

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
    setTimeout(function(){
        //var text =  { ggg: 'Hello'};
        var text =  'Hello';
        ortc.sendData( text );
        //ortc.sendData( {text: 'Data from O'} );
    }, delay*1000);

}, delay*1000);

/**/
