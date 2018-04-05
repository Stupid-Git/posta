/*
    var CONNECT_REM          = 'connect:rem';           // Down
    var DISCONNECT_REM       = 'disconnect:rem';        // Down
    var CONNECTIONSTATUS_REM = 'connectionStatus:rem';  // Up

    var CONNECT_WEB          = 'connect:web';           // Down
    var DISCONNECT_WEB       = 'disconnect:web';        // Down
    var CONNECTIONSTATUS_WEB = 'connectionStatus:web';  // Up


    var DNPKT_REM            = 'dnPkt:rem';             // Down
    var DNPKTSENTCFM_REM     = 'dnPktSentCfm:rem';      // Up
    var UPPKTRDY_DEV         = 'upPktRdy:dev';          // Up (from noble ...)
    var UPPKT_REM            = 'upPkt:rem';             // Up

    var DNPKT_WEB            = 'dnPkt:web';             // Down
    var DNPKTSENTCFM_WEB     = 'dnPktSentCfm:web';      // Up
    var UPPKT_WEB            = 'upPkt:web';             // Up
*/

var mqttParam_1 = { mqttServer : 'mqtt://ocn.cloudns.org',
topic_sendAnswer: 'sendAnswer',
topic_makeOffer:  'makeOffer'
};

// CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC
// CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC
// CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC
var Cm = require('../mqrtc/cm');
var Crtc = require('../mqrtc/crtc');

var cm = new Cm(mqttParam_1);
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



function plug_rtc()
{
    console.log('plug_rtc: construct');

    //this.socket = require('socket.io-client')('http://localhost:8088');

    this.do_startScanning = null;
    this.do_stopScanning = null;
    this.attach_scanRelated();

    this.do_connect = null;
    this.do_disconnect = null;
  //this.up_connectionStatus( id_status )
   
    this.do_DNPKT_REM = null;
  //this.up_pkt( id_pkt )
  
  this.attach_connectRelated();

  this.attach_rtc();
}

const SCANSTART_REM        = 'scanStart:rem';         // Down
const SCANSTOP_REM         = 'scanStop:rem';          // Down
const SCANDATA_REM         = 'scanData:rem';          // Up
const SCANSTARTED_REM      = 'scanStarted:rem';       // Up
const SCANSTOPPED_REM      = 'scanStopped:rem';       // Up


plug_rtc.prototype.on_scanStart_callback = function()
{
  console.log('on_scanStart_callback');
  //this.socket.emit(SCANSTARTED_REM, 'Enter Data..'); // %%%%%%%%%%%%%%%%%%%%%%%%%%%%
}

plug_rtc.prototype.on_scanStop_callback = function()
{
    console.log('on_scanStop_callback');
    var data = 'Enter Data..';
    //this.socket.emit(SCANSTOPPED_REM, 'Enter Data..');  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%
    var _cmd = SCANSTOPPED_REM;
    var _payload = data;
    var dataOut = { cmd: _cmd, payload : _payload};
    crtc.sendData( dataOut );
}

plug_rtc.prototype.on_discover_callback = function(peripheral)
{
  console.log('on_discover_callback uuid = ' + peripheral.uuid);

    if (peripheral.advertisement.manufacturerData) {
        var md = peripheral.advertisement.manufacturerData;
        if( (md[0] == 0x92) && (md[1] == 0x03)) {
            var vdata = { id: peripheral.id , manufacturerData : md };
            var data = JSON.stringify( vdata );
            //console.log('data = ' + data);
            //this.socket.emit(SCANDATA_REM, data); // %%%%%%%%%%%%%%%%%%%%%%%%%%%%
            var _cmd = SCANDATA_REM;
            var _payload = data;
            var dataOut = { cmd: _cmd, payload : JSON.parse(_payload) };
            crtc.sendData( dataOut );
        }
    }
}

plug_rtc.prototype._go_do_startScanning = function( param ) {
    //noble.startScanning();
    if(this.do_startScanning)
        this.do_startScanning( param );
}
plug_rtc.prototype._go_do_stopScanning = function( param ) {
    //noble.stopScanning();
    if(this.do_stopScanning)
        this.do_stopScanning( param );
}
  
plug_rtc.prototype.attach_scanRelated = function() {
    //this.socket.on(SCANSTART_REM, this._go_do_startScanning.bind(this) );
    //this.socket.on(SCANSTOP_REM, this._go_do_stopScanning.bind(this) );
    //noble.on('scanStart', on_scanStart_callback);
    //noble.on('scanStop', on_scanStop_callback);
    //noble.on('discover', on_discover_callback);    
}

plug_rtc.prototype.detach_scanRelated = function() {
    //this.socket.removeListener(SCANSTART_REM, this._go_do_startScanning.bind(this) );
    //this.socket.removeListener(SCANSTOP_REM, this._go_do_stopScanning.bind(this) );
    //noble.removeListener('scanStart', on_scanStart_callback);
    //noble.removeListener('scanStop', on_scanStop_callback);
    //noble.removeListener('discover', on_discover_callback);    
}

  
var CONNECT_REM          = 'connect:rem';           // Down
var DISCONNECT_REM       = 'disconnect:rem';        // Down

var DISCONNECTED_DEV     = 'disconnected:dev';      // Up (from noble ...)
var CONNECTIONSTATUS_REM = 'connectionStatus:rem';  // Up



var DNPKT_REM            = 'dnPkt:rem';             // Down
var DNPKTSENTCFM_REM     = 'dnPktSentCfm:rem';      // Up
//var UPPKTRDY_DEV         = 'upPktRdy:dev';          // Up (from noble ...)
var UPPKT_REM            = 'upPkt:rem';             // Up

plug_rtc.prototype._go_do_connect = function( payload ) {
    var id = payload.id;
    console.log('plug_rtc: _go_do_connect: id = ', id);
    if(this.do_connect)
        this.do_connect( id );
}
plug_rtc.prototype._go_do_disconnect = function( payload ) {
    var id = payload.id;
    console.log('plug_rtc: _go_do_disconnect: id = ', id);
    if(this.do_disconnect)
       this.do_disconnect( id );
}
plug_rtc.prototype.up_connectionStatus = function( id_status ) {
    //var id = id_status.id;
    //var status = id_status.status;    
    //this.socket.emit(CONNECTIONSTATUS_REM, id_status);  // %%%%%%%%%%%%%%%%%%%%%%%%%%%%
    var _cmd = CONNECTIONSTATUS_REM;
    var _payload = id_status;
    var dataOut = { cmd: _cmd, payload : _payload};
    crtc.sendData( dataOut );
}


plug_rtc.prototype._go_do_DNPKT_REM = function( id_pkt ) {
    console.log('---------------------------------------------------------------')
    console.log('_go_do_DNPKT_REM payload = ', id_pkt)
    console.log('---------------------------------------------------------------')
    
    if(this.do_DNPKT_REM) {
        this.do_DNPKT_REM( id_pkt );
        
        //this.socket.emit(DNPKTSENTCFM_REM, id_pkt.id); // %%%%%%%%%%%%%%%%%%%%%%%%%%%%
        var _cmd = DNPKTSENTCFM_REM;
        var _payload = { id: id_pkt.id};
        var dataOut = { cmd: _cmd, payload : _payload};
        crtc.sendData( dataOut );
    }
}

plug_rtc.prototype.on_UPPKT_callback = function( id_pkt ) {
    //console.log('on_UPPKT_callback id_pkt = ', id_pkt)
    id_pkt.pkt = Buffer.from(id_pkt.pkt);
    console.log('on_UPPKT_callback id_pkt = ', id_pkt)
    //this.socket.emit(UPPKT_REM, id_pkt); // %%%%%%%%%%%%%%%%%%%%%%%%%%%%
    var _cmd = UPPKT_REM;
    var _payload = id_pkt;
    var dataOut = { cmd: _cmd, payload : _payload};
    //console.log('UPPKT_REM dataOut = ', dataOut)
    crtc.sendData( dataOut );
}


plug_rtc.prototype.attach_connectRelated = function() {
    //this.socket.on(CONNECT_REM, this._go_do_connect.bind(this) );
    //this.socket.on(DISCONNECT_REM, this._go_do_disconnect.bind(this) );
    //this.socket.on(DNPKT_REM, this._go_do_DNPKT_REM.bind(this) );
}
plug_rtc.prototype.detach_connectRelated = function() {
    //this.socket.removeListener(CONNECT_REM, this._go_do_connect.bind(this) );
    //this.socket.removeListener(DISCONNECT_REM, this._go_do_disconnect.bind(this) );
    // e.g. noble.removeListener('scanStart', on_scanStart_callback);
    //this.socket.removeListener(DNPKT_REM, this._go_do_DNPKT_REM.bind(this) );
}

plug_rtc.prototype._go_do_rtcDataIn = function( dataIn ) {
    console.log('===================================================================');
    console.log('crtc.on(gotData): dataIn = ', dataIn);
    var cmd = dataIn.cmd;
    console.log('crtc.on(gotData): cmd = ', cmd);
    var payload = dataIn.payload;
    console.log('crtc.on(gotData): payload = ', payload);

    switch(cmd) {
        case SCANSTART_REM:
            this._go_do_startScanning( payload ); // (param)
            break;
        case SCANSTOP_REM:
            this._go_do_stopScanning( payload ); // (param)
            break;

        case CONNECT_REM:
            this._go_do_connect(payload);
            break;
        case DISCONNECT_REM:
            this._go_do_disconnect(payload);
            break;
        case DNPKT_REM:
            //console.log('crtc.on(gotData): payload.pkt = ', payload.pkt);
            //console.log('crtc.on(gotData): payload.pkt.data = ', payload.pkt.data);
            payload.pkt = Buffer.from( payload.pkt );
            //console.log('crtc.on(gotData): payload = ', payload);
            this._go_do_DNPKT_REM( payload ); // (id_pkt)
            break;
    }

}

plug_rtc.prototype.attach_rtc = function() {

    // that.emit('gotData', data.message )
    crtc.on('gotData', this._go_do_rtcDataIn.bind(this) );
}


module.exports = plug_rtc;
