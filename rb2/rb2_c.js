//"use strict";

process.on("SIGINT", function(){
    console.log("SIGINT - Exiting ...");
    process.exit();
  }
);

var noble = require('noble');
var BleAdapter = require ('../ble-adapter').BleAdapter;
var TdTR4 = require ('../ble-adapter').TdTR4;

/*
var socket = require('socket.io-client')('http://localhost:8088');
var plug_it = null;
*/

// IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT
// IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT
/*
var csxx = require('./cxss'); 
var Plug_Sio = require('./plug_sio');
var plug_it = new Plug_Sio();
*/


// IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT
// IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT
var mqttParam_1 = { mqttServer : 'mqtt://ocn.cloudns.org',
//topic_sendAnswer: 'sendAnswer', // tbd_topic_base_sendAnswer
//topic_makeOffer:  'makeOffer'   // tbd_topic_base_makeOffer
topic_sendAnswer: 'tbd_topic_base_sendAnswer', 
topic_makeOffer:  'tbd_topic_base_makeOffer'
};

var Cm = require('../mqrtc/cm');
var Crtc = require('../mqrtc/crtc');

//OLD var cm = new Cm(mqttParam_1);
var cm = new Cm(); //NEW
//cm.Start(mqttParam_1); //NEW
var crtc = new Crtc('dummyParam');

callbackForConnected = function()
{
    console.log('callbackForConnected ')
}

cm.on('gotOffer', (offer) => {
    console.log('[C ] got offer  from   cm = ')//, offer )
    crtc.setOffer( offer, callbackForConnected );
});

crtc.on('gotAnswer', (answer) => {
    console.log('[C ] got answer from crtc = ')//, answer )
    cm.sendAnswer( answer );
});


var Plug_Rtc = require('./plug_rtc');
var plug_it = new Plug_Rtc(crtc);

// IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT IT

// BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB
var Bear = require('../bears/bear.js').Bear;
var Uza = require('../bears/uza.js').Uza;


const machineIdSync = require('node-machine-id').machineIdSync;
let mid = machineIdSync({original: true})
console.log('machineIdSync mid ', mid);

// FORCE
//mid = '9ee278a8-c068-4934-a2d7-9e8a977f44_0';
//console.log('machineIdSync mid ', mid);
//var mid = mid.substr(0, mid.length-2) + '_' + '0';
//console.log('machineIdSync mid ', mid);

var rb2_bear;
rb2_bear = new Bear(mid);

function update_rb2_bear() {

    rb2_bear.getOrCreateBear( (err, data) => {

        if(err) {
            console.log('T: loadFullData   err =', err);
            return;
        }
        console.log('T: getOrCreateBear returned data.bear._id =', data.bear._id);
    
        console.log('T: --------------------------------------------------------------------------------');
    
        var offer = { 
            quote: 'This Bear was set from rb2_c', 
            mqttofferin :   'Xtbd_topic_base/makeOffer',
            mqttanswerout : 'Xtbd_topic_base/sendAnswer',
        };
        
        mqttParam_1.mqttServer = 'mqtt://ocn.cloudns.org';
        mqttParam_1.topic_sendAnswer = offer.mqttanswerout; //'tbd_topic_base_sendAnswer'; 
        mqttParam_1.topic_makeOffer = offer.mqttofferin; // 'tbd_topic_base_makeOffer';

        cm.Start(mqttParam_1); //NEW


        rb2_bear.putDataBear( null, offer, (err, data) => {
    
            console.log('T: putDataBear.data.bear._id =', data.bear._id);
            
            rb2_bear.getDataBear( (err, bear) => {
                console.log('T: getDataBear.offer =', bear.offer);

                update_rb2_uza( bear.name );
                /*
                rb2_bear.loadFullData( (err, data) => {
                    if(err) {
                        console.log('T: loadFullData return error =', err);
                        return;
                    }
                    console.log('T: loadFullData returned data.bear._id =', data.bear._id);
    
                    doDeleteBears();
    
                });
                */
            });
        })
    })
}


//var rb2_uza = new Uza('karel');
var rb2_uza = new Uza('john');

function update_rb2_uza( bearName ) {

    rb2_uza.getOrCreateUser( (err, data) => {
        if(err) {
            console.log('T: getOrCreateUser   err =', err);
            return;
        }
        console.log('T: KKKgetOrCreateUser returned data.uza._id =', data.uza._id);
        console.log('T: KKKgetOrCreateUser returned data =', data);
    
        
        function doGetPutUza() {
            console.log('T: KKKdoGetPutUza');
            rb2_uza.getDataUza( (err, uza) => {
    
                //uza.bears.push('teddyBear');
                uza.bears[0] = bearName;
                //uza.bears[0] = '9ee278a8-c068-4934-a2d7-9e8a977f44b3'; // local vscodeconsole ID
                //uza.bears[0] = '9ee278a8-c068-4934-a2d7-9e8a977f44_0';
                //console.log('T: uza =', uza);
                //console.log('T: uza.name =', uza.name);
                console.log('T: KKKuza.bears =', uza.bears);
                rb2_uza.putDataUza(null, uza.bears, (err, data) => {
    
                });
            });
        }
        setTimeout(doGetPutUza, 100);
    });

}

//===== START =====
update_rb2_bear();
//===== START =====

// BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB

plug_sio_setup();

function plug_sio_setup()
{
    console.log('plug_sio_setup')
    plug_it.do_startScanning = do_startScanning;
    plug_it.do_stopScanning = do_stopScanning;

    noble.on('scanStart', plug_it.on_scanStart_callback.bind(plug_it));
    noble.on('scanStop', plug_it.on_scanStop_callback.bind(plug_it));
    noble.on('discover', plug_it.on_discover_callback.bind(plug_it));  


    plug_it.do_connect = do_connect;       // ( id )
    plug_it.do_disconnect = do_disconnect; // ( id )
    plug_it.do_DNPKT_REM = do_DNPKT_REM;   // ( id_pkt )
}

function plug_sio_unSetup()
{
    console.log('plug_sio_unSetup')
    plug_it.do_startScanning = null; //do_startScanning;
    plug_it.do_stopScanning = null; //do_stopScanning;

    noble.removeListener('scanStart', plug_it.on_scanStart_callback.bind(plug_it));
    noble.removeListener('scanStop', plug_it.on_scanStop_callback.bind(plug_it));
    noble.removeListener('discover', plug_it.on_discover_callback.bind(plug_it));  


    plug_it.do_connect = null; //do_connect;       // ( id )
    plug_it.do_disconnect = null; //do_disconnect; // ( id )
    plug_it.do_DNPKT_REM = null; //do_DNPKT_REM;   // ( id_pkt )
}



function do_startScanning( param ) {
  noble.startScanning();
}
function do_stopScanning( param ) {
  noble.stopScanning();
}


let devArray = [];

// DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN
function do_DNPKT_REM(id_pkt) {
    var id = id_pkt.id;
    var pkt = id_pkt.pkt;
    console.log('do_DNPKT_REM (id = ' + id + ') pkt.len = ' + pkt.length);
    
    if(!devArray[id])
        return;
    var _tr4 = devArray[id].tr4;
    if( _tr4 ) {
        _tr4.SendPacket( pkt, (error) => {            
        });
    }
}

// UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP
G_OnTR4_upPacket = function( status, id_pkt ) {    
    console.log('OnTR4_upPacket (id = ' + id_pkt.id + ') pkt.len = ' + id_pkt.pkt.length);
    plug_it.on_UPPKT_callback( id_pkt );
}

G_OnTR4_Connected = function( id ) {
    var id_status = { id : id, status : true };
    console.log("OnTR4_Connected: id_status =", id_status);
    plug_it.up_connectionStatus(id_status);
}

G_OnTR4_Disconnected = function( id ) {
    var id_status = { id : id, status : false };
    console.log("OnTR4_Disconnected: id_status =", id_status);
    plug_it.up_connectionStatus(id_status);
    devArray[this.id] = null; //{}
}

function do_connect(id) {
    console.log("[CONNECT_REM] ...");
    if( devArray[id] ) { //Already connected?
        //TODO
    }

    BleAdapter.ScanForDevice(id, (error, device) => {
        if(error){
            console.log('Error during ScanForDevice: ', error)
            //TODO callback(error);
            return;
        }

        var id = device.id;

        devArray[id] = {}
        devArray[id].device = device;
        devArray[id].tr4 = new TdTR4(device, id);
        //devArray[id].upBridge = new UpBridge(id);

        var _tr4 = devArray[id].tr4;
        //var _upBridge = devArray[id].upBridge;
        
        _tr4.on('tr4:connected', G_OnTR4_Connected ) // _upBridge.OnTR4_Connected_Binded

        _tr4.connect( (error) => {
            if(error) {
                console.log('do_connect Connection Failed =', id)
                devArray[id] = {}
                callback(error);
            } else {
                console.log('do_connect Connection OK =', id)
                /* _tr4.on('tr4:disconnected', _upBridge.OnTR4_Disconnected_Binded )
                   _tr4.on('tr4:upPacket', _upBridge.OnTR4_upPacket_Binded ) */
                _tr4.on('tr4:disconnected', G_OnTR4_Disconnected )
                _tr4.on('tr4:upPacket', G_OnTR4_upPacket )
            }

        });
    })
}

function do_disconnect(id) {
    console.log("[DISCONNECT_REM] ...");
    if(devArray[id]) {
        var _tr4 = devArray[id].tr4;
        if(_tr4) {
            _tr4.disconnect();    
            return
        }
    }
}





var RB = function()
{
    this.adapter = BleAdapter;
    this.tr4 = null;
}

RB.prototype.processCmd = function( procId, data )
{

    switch(procId){
        case 'proc_Start':
        if(plug_it == null) {
            //OLD attach_scanRelated();
            //OLD attach_connectRelated();
        }
        
/*        
            this.Start(data.id, (error, param) => {
                if(!error)
                {
                    // TODO Start Sending data
                }
            });
*/
            break;
/*
        case 'proc_Send0x9e':
            var pkt = new Buffer( [0x01, 0x9e,0x00, 0x00,0x00 ,0xce,0x94] );
            this.SendTr4Packet( pkt );            
            break;
        
        case 'proc_OnUpPkt':
            var pkt = data;
            this.tr4.disconnect();
            this.processCmd('proc_post', 'dummy Data');
            // device.disconnect(); //just for testing
            break;
*/
        default:
            break;
    }

}


// Using noble.on('stateChange', ... is a work around so that the 
// state (initialized) of noble is suitable to allow scanning to be
// started by the NobleDevice within the program

var rb = new RB();

var noble = require('noble') //NobleDevice.noble;
noble.on('stateChange', function(state) {
    console.log('noble.on(-stateChange-): (state, initialized) =', state, noble.initialized) ;
    if (state === 'poweredOn') {
        //console.log('noble.on(-stateChange-):     poweredOn state =', state)

        rb.processCmd('proc_Start', { id: 'd81e6c802446' })

        //noble.startScanning();
    } else {
        console.log('noble.on(-stateChange-): NOT poweredOn state =', state)
        //noble.stopScanning();
    }
});

//debug noble.on('scanStart', () => {console.log('noble.on(scanStart)')})
