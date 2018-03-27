//"use strict";

var BleAdapter = require ('../ble-adapter').BleAdapter;
var TdTR4 = require ('../ble-adapter').TdTR4;

const TAGS = require('./rb2_util')
const SCANSTART_WEB        = 'scanStart:web';         // Down
const SCANSTOP_WEB         = 'scanStop:web';          // Down
const SCANDATA_WEB         = 'scanData:web';          // Up
const SCANSTARTED_WEB      = 'scanStarted:web';       // Up
const SCANSTOPPED_WEB      = 'scanStopped:web';       // Up

const SCANSTART_REM        = 'scanStart:rem';         // Down
const SCANSTOP_REM         = 'scanStop:rem';          // Down
const SCANDATA_REM         = 'scanData:rem';          // Up
const SCANSTARTED_REM      = 'scanStarted:rem';       // Up
const SCANSTOPPED_REM      = 'scanStopped:rem';       // Up

// MODIFY THIS WITH THE APPROPRIATE URL
var noble = require('noble');

/*
var socket = require('socket.io-client')('http://localhost:8088');
var plug_sio = null;
*/
var Plug_Sio = require('./plug_sio');
var plug_sio = new Plug_Sio();
plug_sio_setup();
function plug_sio_setup()
{
console.log('plug_sio_setup')
    plug_sio.do_startScanning = do_startScanning;
    plug_sio.do_stopScanning = do_stopScanning;

    noble.on('scanStart', plug_sio.on_scanStart_callback.bind(plug_sio));
    noble.on('scanStop', plug_sio.on_scanStop_callback.bind(plug_sio));
    noble.on('discover', plug_sio.on_discover_callback.bind(plug_sio));  


    plug_sio.do_connect = do_connect;       // ( id )
    plug_sio.do_disconnect = do_disconnect; // ( id )
    plug_sio.do_DNPKT_REM = do_DNPKT_REM;   // ( id_pkt )
    
}



process.on("SIGINT", function(){
  console.log("SIGINT - Exiting ...");
  process.exit();
});


//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//  Example Stuff (Start)
//------------------------------------------------------------------------------

//--------------------------------------------------
//https://www.jaredwolff.com/blog/raspberry-pi-getting-interactive-with-your-server-using-websockets/
/*
socket.on('example-ping', function(data) {
    console.log("ping");

    delay = data["duration"];
    // Set a timer for when we should stop watering
    setTimeout(function(){
      socket.emit("example-pong", "This is data from Raspberry Pi");
    }, delay*1000);
});

//--------------------------------------------------
socket.on('fromW-ping', function(data){
		console.log('server recv: fromW-ping');
		console.log('  data = ' + data);
		console.log('server send: toC-ping');
    	io.sockets.emit('toC-ping',{ duration: 2 });
});

socket.on('fromC-pong', function(data){
		console.log('server recv: fromC-pong');
		console.log('  data = ' + data);
		console.log('server send: toW-pong');
		var _msg = data;
		data = { user :'client', msg : _msg};
    	io.sockets.emit('toW-pong', data);
});
*/
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------
//  Example Stuff (End)
//------------------------------------------------------------------------------
//------------------------------------------------------------------------------




//#############################################################################
//#############################################################################
//#############################################################################
//#############################################################################
//#############################################################################

function on_scanStart_callback()
{
  console.log('on_scanStart_callback');
  //socket.emit(SCANSTARTED_REM, 'Enter Data..');
}
function on_scanStop_callback()
{
  console.log('on_scanStop_callback');
  socket.emit(SCANSTOPPED_REM, 'Enter Data..');
}
function on_discover_callback(peripheral)
{
  console.log('on_discover_callback uuid = ' + peripheral.uuid);

  if (peripheral.advertisement.manufacturerData) {
    var md = peripheral.advertisement.manufacturerData;
    if( (md[0] == 0x92) && (md[1] == 0x03))
    {
      var vdata = { id: peripheral.id , manufacturerData : md };
      var data = JSON.stringify( vdata );
      //console.log('data = ' + data);
      socket.emit(SCANDATA_REM, data);
    }
  }

/*
  console.log('peripheral discovered (' + peripheral.id +
             ' with address <' + peripheral.address +  ', ' + peripheral.addressType + '>,' +
             ' connectable ' + peripheral.connectable + ',' +
             ' RSSI ' + peripheral.rssi + ':');
  console.log('\thello my local name is:');
  console.log('\t\t' + peripheral.advertisement.localName);
  console.log('\tcan I interest you in any of the following advertised services:');
  console.log('\t\t' + JSON.stringify(peripheral.advertisement.serviceUuids));

  var serviceData = peripheral.advertisement.serviceData;
  if (serviceData && serviceData.length) {
    console.log('\there is my service data:');
    for (var i in serviceData) {
      console.log('\t\t' + JSON.stringify(serviceData[i].uuid) + ': ' + JSON.stringify(serviceData[i].data.toString('hex')));
    }
  }
  if (peripheral.advertisement.manufacturerData) {
    console.log('\there is my manufacturer data:');
    console.log('\t\t' + JSON.stringify(peripheral.advertisement.manufacturerData.toString('hex')));
  }
  if (peripheral.advertisement.txPowerLevel !== undefined) {
    console.log('\tmy TX power level is:');
    console.log('\t\t' + peripheral.advertisement.txPowerLevel);
  }

  console.log();

  console.log('on_discover_callback uuid = ' + peripheral.uuid);
  socket.emit(SCANDATA_REM, peripheral.uuid);
  */
}

function do_startScanning(data) {
  noble.startScanning();
}
function do_stopScanning(data) {
  noble.stopScanning();
}


function attach_scanRelated() {
    socket.on(SCANSTART_REM, do_startScanning );
    socket.on(SCANSTOP_REM, do_stopScanning );

    noble.on('scanStart', on_scanStart_callback);
    noble.on('scanStop', on_scanStop_callback);
    noble.on('discover', on_discover_callback);    
}
function detach_scanRelated() {
    socket.removeListener(SCANSTART_REM, do_startScanning );
    socket.removeListener(SCANSTOP_REM, do_stopScanning );

    noble.removeListener('scanStart', on_scanStart_callback);
    noble.removeListener('scanStop', on_scanStop_callback);
    noble.removeListener('discover', on_discover_callback);    
}


//#############################################################################
//#############################################################################
//#############################################################################
//#############################################################################
//#############################################################################

var CONNECT_REM          = 'connect:rem';           // Down
var DISCONNECT_REM       = 'disconnect:rem';        // Down
var DISCONNECTED_DEV     = 'disconnected:dev';      // Up (from noble ...)
var CONNECTIONSTATUS_REM = 'connectionStatus:rem';  // Up


let devArray = [];
/*
class UpBridge {

    constructor(id) {
        this.id = id;
        //console.log("UpBridge constructor: this.id =", this.id);
        this.OnTR4_upPacket_Binded = this.OnTR4_upPacket.bind(this);
        this.OnTR4_Connected_Binded = this.OnTR4_Connected.bind(this);
        this.OnTR4_Disconnected_Binded = this.OnTR4_Disconnected.bind(this);
    }

    OnTR4_upPacket ( status, id_pkt ) {
        console.log('OnTR4_upPacket (id = ' + id_pkt.id + ') pkt.len = ' + id_pkt.pkt.length);
        socket.emit(UPPKT_REM, id_pkt);
    }

    OnTR4_Connected( id ) {
        var id_status = { id : this.id, status : true };
        console.log("OnTR4_Connected: id_status =", id_status);
        socket.emit(CONNECTIONSTATUS_REM, id_status);    
    }

    OnTR4_Disconnected( id ) {
        //console.log("OnTR4_Disconnected");
        //var id_status = { id : this.id, status : false };
        var id_status = { id : id, status : false };
        console.log("OnTR4_Disconnected: id_status =", id_status);
        socket.emit(CONNECTIONSTATUS_REM, id_status);    
        devArray[this.id] = null; //{}
    }

}
*/

G_OnTR4_upPacket = function( status, id_pkt ) {    
    console.log('OnTR4_upPacket (id = ' + id_pkt.id + ') pkt.len = ' + id_pkt.pkt.length);
    if(plug_sio == null)
        socket.emit(UPPKT_REM, id_pkt);
    else
        plug_sio.on_UPPKT_callback( id_pkt );
}

G_OnTR4_Connected = function( id ) {
    var id_status = { id : id, status : true };
    console.log("OnTR4_Connected: id_status =", id_status);
    if(plug_sio == null)
        socket.emit(CONNECTIONSTATUS_REM, id_status);    
    else
        plug_sio.up_connectionStatus(id_status);
}

G_OnTR4_Disconnected = function( id ) {
    var id_status = { id : id, status : false };
    console.log("OnTR4_Disconnected: id_status =", id_status);
    if(plug_sio == null)
        socket.emit(CONNECTIONSTATUS_REM, id_status);
    else
        plug_sio.up_connectionStatus(id_status);

    devArray[this.id] = null; //{}
}

function do_connect(id) {
    console.log("[CONNECT_REM] ...");
    
    let that_id = id;
    BleAdapter.ScanForDevice(id, (error, device) => {
        if(error){
            console.log('Error during ScanForDevice: ', error)
            //TODO callback(error);
            return;
        }

console.log('')
console.log('')
console.log('do_connect        id =', id)
console.log('do_connect   that_id =', that_id)
console.log('do_connect device.id =', device.id)

        var id = device.id;

        devArray[id] = {}
        devArray[id].device = device;
        devArray[id].tr4 = new TdTR4(device, id);
        //devArray[id].upBridge = new UpBridge(id);

        var _tr4 = devArray[id].tr4;
        //var _upBridge = devArray[id].upBridge;
        
        _tr4.on('tr4:connected', G_OnTR4_Connected ) // _upBridge.OnTR4_Connected_Binded

        _tr4.connect( (error) => {
            //console.log('tr4.connect callback()')
            if(error) {
                console.log('do_connect Connection Failed =', id)
                devArray[id] = {}
                callback(error);
            } else {
                console.log('do_connect Connection OK =', id)
                /*
                _tr4.on('tr4:disconnected', _upBridge.OnTR4_Disconnected_Binded )
                _tr4.on('tr4:upPacket', _upBridge.OnTR4_upPacket_Binded )
                */
                _tr4.on('tr4:disconnected', G_OnTR4_Disconnected )
                _tr4.on('tr4:upPacket', G_OnTR4_upPacket )
                //callback(null, 'Connected');
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

    var id_status = { id : id, status : false };
    socket.emit(CONNECTIONSTATUS_REM, id_status);    
}

function attach_connectRelated() {
    socket.on(CONNECT_REM, do_connect );
    socket.on(DISCONNECT_REM, do_disconnect );

    // e.g. noble.on('scanStart', on_scanStart_callback);
    socket.on(DNPKT_REM, do_DNPKT_REM );
}

function detach_connectRelated() {
    socket.removeListener(CONNECT_REM, do_connect );
    socket.removeListener(DISCONNECT_REM, do_disconnect );

    // e.g. noble.removeListener('scanStart', on_scanStart_callback);
    socket.removeListener(DNPKT_REM, do_DNPKT_REM );
}






var DNPKT_REM            = 'dnPkt:rem';             // Down
var DNPKTSENTCFM_REM     = 'dnPktSentCfm:rem';      // Up
var UPPKTRDY_DEV         = 'upPktRdy:dev';          // Up (from noble ...)
var UPPKT_REM            = 'upPkt:rem';             // Up

// DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN
// DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN
// DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN

function do_DNPKT_REM(id_pkt) {
    var id = id_pkt.id;
    var pkt = id_pkt.pkt;
    console.log('do_DNPKT_REM (id = ' + id + ') pkt.len = ' + pkt.length);
    
    if(!devArray[id])
        return;
    var _tr4 = devArray[id].tr4;
    if( _tr4 ) {
        if(plug_sio == null)
            socket.emit(DNPKTSENTCFM_REM, id);
        _tr4.SendPacket( pkt, (error) => {            

        });
    }
}



var RB = function()
{
    this.adapter = BleAdapter;
    this.tr4 = null;
}
/*
RB.prototype.SendTr4Packet = function( pkt )
{
    this.tr4.SendPacket( pkt, (error) => {
    });
}
*/

/*
RB.prototype.OnTR4_Connected = function( id )
{
    var id_status = { id : id, status : true };
    console.log("OnTR4_Connected: id_status =", id_status);
    socket.emit(CONNECTIONSTATUS_REM, id_status);    
}

RB.prototype.OnTR4_Disconnected = function( id ) {
        //console.log("OnTR4_Disconnected");
        //var id_status = { id : this.id, status : false };
        var id_status = { id : id, status : false };
        console.log("OnTR4_Disconnected: id_status =", id_status);
        socket.emit(CONNECTIONSTATUS_REM, id_status);    
        devArray[this.id] = null; //{}
}

RB.prototype.OnTR4_upPacket = function( status, id_pkt ) {
    //console.log("OnTR4_upPacket");
    console.log('OnTR4_upPacket (id = ' + id_pkt.id + ') pkt.len = ' + id_pkt.pkt.length);
    socket.emit(UPPKT_REM, id_pkt);
}
*/
RB.prototype.processCmd = function( procId, data )
{

    switch(procId){
        case 'proc_Start':
        if(plug_sio == null) {
            attach_scanRelated();
            attach_connectRelated();
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
