
function plug_sio()
{
    console.log('plug_sio: construct');

    this.socket = require('socket.io-client')('http://localhost:8088');

    this.do_startScanning = null;
    this.do_stopScanning = null;
    this.attach_scanRelated();

    this.do_connect = null;
    this.do_disconnect = null;
  //this.up_connectionStatus( id_status )
   
    this.do_DNPKT_REM = null;
  //this.up_pkt( id_pkt )
  
    this.attach_connectRelated();
}

require('./rb2_util'); // const SCANSTART_REM  etc 


plug_sio.prototype.on_scanStart_callback = function()
{
  console.log('on_scanStart_callback');
  //this.socket.emit(SCANSTARTED_REM, 'Enter Data..');
}

plug_sio.prototype.on_scanStop_callback = function()
{
    console.log('on_scanStop_callback');
    this.socket.emit(SCANSTOPPED_REM, 'Enter Data..');
}

plug_sio.prototype.on_discover_callback = function(peripheral)
{
  console.log('on_discover_callback uuid = ' + peripheral.uuid);

    if (peripheral.advertisement.manufacturerData) {
        var md = peripheral.advertisement.manufacturerData;
        if( (md[0] == 0x92) && (md[1] == 0x03)) {
            var vdata = { id: peripheral.id , manufacturerData : md };
            var data = JSON.stringify( vdata );
            //console.log('data = ' + data);
            this.socket.emit(SCANDATA_REM, data);
        }
    }
}

plug_sio.prototype._go_do_startScanning = function( param ) {
    //noble.startScanning();
    if(this.do_startScanning)
        this.do_startScanning( param );
}
plug_sio.prototype._go_do_stopScanning = function( param ) {
    //noble.stopScanning();
    if(this.do_stopScanning)
        this.do_stopScanning( param );
}
  
plug_sio.prototype.attach_scanRelated = function() {
    this.socket.on(SCANSTART_REM, this._go_do_startScanning.bind(this) );
    this.socket.on(SCANSTOP_REM, this._go_do_stopScanning.bind(this) );

    //noble.on('scanStart', on_scanStart_callback);
    //noble.on('scanStop', on_scanStop_callback);
    //noble.on('discover', on_discover_callback);    
}

plug_sio.prototype.detach_scanRelated = function() {
    this.socket.removeListener(SCANSTART_REM, this._go_do_startScanning.bind(this) );
    this.socket.removeListener(SCANSTOP_REM, this._go_do_stopScanning.bind(this) );

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

plug_sio.prototype._go_do_connect = function( payload ) {
    var id = payload.id;
    console.log('plug_sio: _go_do_connect: id = ', id);
    if(this.do_connect)
        this.do_connect( id );
}
plug_sio.prototype._go_do_disconnect = function( payload ) {
    var id = payload.id;
    console.log('plug_sio: _go_do_disconnect: id = ', id);
    if(this.do_disconnect)
       this.do_disconnect( id );
}
plug_sio.prototype.up_connectionStatus = function( id_status ) {
    var id = id_status.id;
    var status = id_status.status;
    this.socket.emit(CONNECTIONSTATUS_REM, id_status);    
}


plug_sio.prototype._go_do_DNPKT_REM = function( id_pkt ) {
    console.log('---------------------------------------------------------------')
    console.log('_go_do_DNPKT_REM payload = ', id_pkt)
    console.log('---------------------------------------------------------------')
    
    if(this.do_DNPKT_REM) {
        this.do_DNPKT_REM( id_pkt );
        this.socket.emit(DNPKTSENTCFM_REM, id_pkt.id);
    }
}

plug_sio.prototype.on_UPPKT_callback = function( id_pkt ) {
    //console.log('on_UPPKT_callback id_pkt = ', id_pkt)
    id_pkt.pkt = Buffer.from(id_pkt.pkt);
    console.log('on_UPPKT_callback id_pkt = ', id_pkt)
    this.socket.emit(UPPKT_REM, id_pkt);
}


plug_sio.prototype.attach_connectRelated = function() {
    this.socket.on(CONNECT_REM, this._go_do_connect.bind(this) );
    this.socket.on(DISCONNECT_REM, this._go_do_disconnect.bind(this) );
    this.socket.on(DNPKT_REM, this._go_do_DNPKT_REM.bind(this) );
}
plug_sio.prototype.detach_connectRelated = function() {
    this.socket.removeListener(CONNECT_REM, this._go_do_connect.bind(this) );
    this.socket.removeListener(DISCONNECT_REM, this._go_do_disconnect.bind(this) );

    // e.g. noble.removeListener('scanStart', on_scanStart_callback);
    this.socket.removeListener(DNPKT_REM, this._go_do_DNPKT_REM.bind(this) );
}

module.exports = plug_sio;
