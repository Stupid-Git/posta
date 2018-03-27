
var async = require('async');
var NobleDevice = require('noble-device');


var RemoteBle2 = function(device) {
  NobleDevice.call(this, device);
};


var NoDevs = [];
var AnyDevs = [];
var rbstate = {};
rbstate.idOrLocalName = 'aabbccddeeff';

RemoteBle2.get_NobleDevFromID = function(id)
{
    //console.log('RemoteBle2.get_NobleDevFromID: id = ' + id + " device = " + NoDevs[id]);
    return(NoDevs[id]);
}

// this is an override. return true if device id or localname matches what we defined
RemoteBle2.is = function(device) {
  AnyDevs[device.id] = device;
  var localName = device.advertisement.localName;
  //console.log('RemoteBle2.is: DevId = ' + device.id + " LocalName = " + localName);
  return (device.id === rbstate.idOrLocalName || localName === rbstate.idOrLocalName);
  //return (device.id === idOrLocalName || localName === idOrLocalName);
};

NobleDevice.Util.inherits(RemoteBle2, NobleDevice);
NobleDevice.Util.mixin(RemoteBle2, NobleDevice.DeviceInformationService);
NobleDevice.Util.mixin(RemoteBle2, NobleDevice.HeartRateMeasumentService);
//NobleDevice.Util.mixin(RemoteBle2, NobleDevice.TandDUpDnService);
var _TandDUpDnService = require('./remble-tuds');
NobleDevice.Util.mixin(RemoteBle2, _TandDUpDnService);







//==================================================================
RemoteBle2.prototype.getData9E01 = function()
{

    //console.log('---------------------------------------');
    var d = new Uint8Array(7);
    d[0] = 0x01;
    d[1] = 0x9e;
    d[2] = 0x00;
    d[3] = 0x00;
    d[4] = 0x00;
 /*
    var output = crcCCITT(d, 5, 0x0000); // we use a 0x0000 seed

    var b0 = ((output >> 0) & 0xFF);
    var b1 = ((output >> 8) & 0xFF);
    var b2 = ((output >>16) & 0xFF);
    var b3 = ((output >>32) & 0xFF);

    d[5] = b1; //crc MSB
    d[6] = b0; //crc LSB

    console.log('getData9E01: crc = ' + output.toString(16)
                                      + ", b3: " + b3.toString(16)
                                      + ", b2: " + b2.toString(16)
                                      + ", b1: " + b1.toString(16)
                                      + ", b0: " +b0.toString(16) );
*/
    return(d);
}


var RembleBufs = require ('./remble-bufs.js');

var dBuf = new RembleBufs.Dbuf();
var uBuf = new RembleBufs.Ubuf();

D_pkt_raw = RemoteBle2.prototype.getData9E01();
dBuf.fromPkt(D_pkt_raw);
var D_DAT_Array = [];
var D_CMD_pkt = dBuf.get_D_CMD();
D_DAT_Array.push(dBuf.get_D_DAT(0));



U_DAT_len = 0; //len + cs
U_DAT_blocks = 0;

RemoteBle2.from_U_DAT_Array = function(theArray, lenthWithCS)
{
    var blocks = theArray.length;
    var len = lenthWithCS - 2;
    var pos = 0;

    //var upkt_raw = new Uint8Array(len);
    this.upkt_raw = new Uint8Array(len);
    for(var b=0; b<blocks; b++)
    {
        for(var i=4; i<20; i++)
        {
            pos =  b*16 + (i-4);
            if( pos >= len)
                break;
            this.upkt_raw[pos] = theArray[b][i];
            //console.log('data20[' + i + '] = ' + data20[i].toString(16) );
        }
    }
    return(this.upkt_raw);
}

function process_U_pkt(upkt)
{
    var cmd = upkt[1];
    var sts = upkt[2];
    var len = upkt[4]*256 + upkt[3];

    var crc = 0x0000; //crcCCITT(upkt, 5 + len, 0x0000); // we use a 0x0000 seed

    var crcb0 = ((crc >> 0) & 0xFF);
    var crcb1 = ((crc >> 8) & 0xFF);

    var pktb0 = upkt[5+len+1];
    var pktb1 = upkt[5+len+0];
/*
    switch( cmd )
    {
        default:
            console.log('cmd = ' + cmd);
            console.log('sts = ' + sts);
            console.log('len = ' + len);

            console.log('cb0 = ' + crcb0);
            console.log('pb0 = ' + pktb0);
            console.log('cb1 = ' + crcb1);
            console.log('pb1 = ' + pktb1);

            break;
    }
*/
}


RemoteBle2.On_U_CMD = function(data) {
    //console.log("got u_cmd_Change event: ");
    //printData20( data);
    U_CMD_pkt = data;

    var len = U_CMD_pkt[3] * 256 + U_CMD_pkt[2];
    U_DAT_len = len;
    var blocks = 1 + Math.floor((len-1)/16);
    U_DAT_blocks = blocks;
    var theArray = [];
    for(var b = 0; b<blocks; b++)
    {
        var data20 = new Buffer(20);
        theArray.push(data20);
    }

    U_DAT_Array = theArray;
}


var UPPKTRDY_DEV         = 'upPktRdy:dev';          // Up (from noble ...)
var DISCONNECTED_DEV     = 'disconnected:dev';      // Up (from noble ...)

RemoteBle2.On_U_DAT = function(blk) {

    var data = blk.data;
    var device = blk.device;

    //console.log('data = ' + data);
    //console.log('device = ' + device);
    //console.log("got u_dat_Change event: ");
    //printData20( data);

    var idx = data[0];
    U_DAT_Array[idx] = data;
    if( (idx + 1) === U_DAT_blocks) //last one
    {
        up_data_raw = RemoteBle2.from_U_DAT_Array(U_DAT_Array, U_DAT_len);

        var idAndPkt = { id : rbstate.idOrLocalName, pkt : up_data_raw };
        device.emit(UPPKTRDY_DEV, idAndPkt);

        //printData20(up_data_raw);
        //process_U_pkt(up_data_raw);

        var u_cfm20 = new Buffer(20);
        u_cfm20[0] = 1;
        u_cfm20[1] = 0;

        device.write_U_CFM( u_cfm20, function(null_status) {
            //console.log('write_U_CFM null_status = ' + null_status);

            //for testing device.disconnect(); // disconnect after sending u\cfm
        });

        //NOT HERE DUMB DUMB
        //device.disconnect(); // disconnect after sending u\cfm
    }
    //TODO
    // push data
    // check if all there -> ( send U_CFM -> emit to app got UpPacket )
    // not all there, return
    // has holes (send U_CFM resend please)
}



RemoteBle2.On_D_CFM_0 = function(data) {
        //console.log("On_D_CFM_0 got d_cfm_Change event: ");
        //dBuf.printData20(data);
}
//RemoteBle2.On_D_CFM_1 = function(data) {
//        console.log("On_D_CFM_1 got d_cfm_Change event: ");
//        //printData20( data);
//}


//==============================================================================
//==============================================================================
//==============================================================================
//==============================================================================
//==============================================================================
//==============================================================================


//RemoteBle2.prototype.consoleHello = function(text)
RemoteBle2.consoleHello = function(text)
{
    console.log('RemoteBle2: Hello %s', text);
}

RemoteBle2.print_bleid = function()
{
  //console.log('ble id = ' + idOrLocalName);
  console.log('ble id = ' + rbstate.idOrLocalName);
}


// CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT
// CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT
// CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT CONNECT

RemoteBle2.doDisconnect = function(id, callback)
{
  NoDevs[id].disconnect(callback);
}



RemoteBle2.doConnectAndSetup = function(device, callback)
{
    _new_ondisconnect = function()
    {
        var id = device.uuid;
        console.log('_new_ondisconnect from id = ' + id + ', device = ' + device);
        device.emit(DISCONNECTED_DEV);
        //console.log('_new_ondisconnect : DISCONNECTED_DEV emitted');

        //NoDevs[id] = null;
        //delete NoDevs[id];

    }
    device.on('disconnect', _new_ondisconnect );

    //========== DN ==========
    device.on('d_cfm_Change', RemoteBle2.On_D_CFM_0 ); // .on -> addListener
    //device.removeListener('d_cfm_Change', RemoteBle2.On_D_CFM_0 ); //.off = X removeListener
    //device.on('d_cfm_Change', RemoteBle2.On_D_CFM_1 );

    //========== UP ==========
    device.on('u_cmd_Change', RemoteBle2.On_U_CMD );
    device.on('u_dat_Change', RemoteBle2.On_U_DAT );

    // lib/noble-device.js/connectAndSetUp
    device.connectAndSetUp( function(error) {
        //console.log('device.connectAndSetUp callback error = ' + error);
        if(error) {
            //console.log('connectAndSetUp error? = ' + error);
            // e.g. "connectAndSetUp error? = Error: Command Disallowed (0xc)"
            device.removeListener('disconnect', _new_ondisconnect );
        }

        //========== DN ==========
        device.notify_D_CFM(function(error) {
          if(error)
              console.log('set notify D_CFM error : ' + error);
        });

        //========== UP ==========
        device.notify_U_CMD(function(error) {
          if(error)
              console.log('set notify U_CMD error : ' + error);
        });
        device.notify_U_DAT(function(error) {
          if(error)
              console.log('set notify U_DAT error : ' + error);
        });
/*
        //printData20(D_CMD_pkt);
        device.write_D_CMD( D_CMD_pkt, function(status) {
            console.log('write_D_CMD status = ' + status);

            //printData20(D_DAT_Array[0]);
            device.write_D_DAT( D_DAT_Array[0], function(status) {
                console.log('write_D_DAT status = ' + status);
            });
        });
*/
        callback(true);
    });

}

/*
var AA = [];

console.log('AA = ' + AA);
console.log('AA[0] = ' + AA[0]);
console.log('AA[1] = ' + AA[1]);

console.log('AA.length = ' + AA.length);

AA['k1'] = 'one';
AA['k2'] = 'two';
AA['k3'] = 'three';
AA['k4'] = 'four';
AA['k5'] = 'five';
console.log('AA.length = ' + AA.length);

for(var a in AA)
{
    console.log('a = ' + a + ' AA[a] = ' + AA[a]);
}

//AA['k3'] = null;
delete AA['k3'];

for(var a in AA)
{
    console.log('a = ' + a + ' AA[a] = ' + AA[a]);
}

a='112233445566';
AA[0] = 'ZERO';
AA[1] = 'ONE';
console.log('AA.length = ' + AA.length);
console.log('a = ' + a + ' AA[a] = ' + AA[a]);
AA[a] = 'SIX';
console.log('a = ' + a + ' AA[a] = ' + AA[a]);
console.log('AA.length = ' + AA.length);

console.log('AA = ' + AA);
console.log('AA[0] = ' + AA[0]);
console.log('AA[1] = ' + AA[1]);
*/

RemoteBle2.doDiscover = function(id, callback)
{
    rbstate.idOrLocalName = id;
    NoDevs[id] = null; // device is NobleDevice
    delete NoDevs[id]; // device is NobleDevice
    //console.log('rbstate.idOrLocalName  = ' + rbstate.idOrLocalName);

    AnyDevs = [];
    //console.log('calling: noble-device/lib/utils.js/constructor.discover()');
    RemoteBle2.discover( function(device) { // constructor.discover
        NoDevs[id] = device; // device is NobleDevice
        //console.log('RemoteBle2.discover returned device = ' + device);

        //console.log('');
        //console.log('id = ' + id + ' NoDevs[id] = ' + NoDevs[id]);
        //console.log('id = ' + id + ' NoDevs[id]._peripheral = ' + NoDevs[id]._peripheral);
        //console.log('id = ' + id + ' AnyDevs[id] = ' + AnyDevs[id]);
/*
        for(var a in AnyDevs) {
            console.log('a = ' + a + ' AnyDevs[a] = ' + AnyDevs[a]);
        }
        //delete NoDevs[id];
*/
        callback(NoDevs[id]);
    });
}


//RemoteBle2.prototype.doDiscover_ConnectAndSetup = function(id, statusCallback)
RemoteBle2.doDiscover_ConnectAndSetup = function(id, statusCallback)
{
    RemoteBle2.doDiscover(id, function(device){
        //console.log('RemoteBle2.doDiscover Callback device = ' + device);
        if(device)
        {
            //rbstate.idOrLocalName = id;
            RemoteBle2.doConnectAndSetup( device, function(status) {
                //console.log('doConnectAndSetup returned status = ' + status);
                //console.log('device = ' + device);
                //console.log('NoDevs[id] = ' + NoDevs[id] );
                //console.log('AnyDevs[id] = ' + AnyDevs[id] );
                var id_status = { id : id, status : status};
                statusCallback(id_status);
            });
        }
        else
        {
            var id_status = { id : id, status : false};
            statusCallback(id_status);
        }
    });
}



// DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN
// DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN
// DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN DN
/*
RemoteBle2.doSendpkt = function(idAndPkt) { //, callback) {
    var id = idAndPkt.id;
    var pkt = idAndPkt.pkt;
    RemoteBle2.doSend(id, pkt, function(id_status){
        console.log('doSend (id = ' + id_status.id + ') status = ' + id_status.status);
        //callback(id_status);
    });
}

socket.on('doSend', RemoteBle2.doSendpkt);
*/

//RemoteBle2.prototype.doSend = function(id, pkt, statusCallback)
RemoteBle2.doSend = function(id, pkt, statusCallback)
{
    var device = NoDevs[id];
    
    //D_pkt_raw = RemoteBle2.prototype.getData9E01();
    //dBuf.fromPkt(D_pkt_raw);
    //var D_DAT_Array = [];
    //var D_CMD_pkt = dBuf.get_D_CMD();
    //D_DAT_Array.push(dBuf.get_D_DAT(0));

    //console.log(' RemoteBle2.doSend pkt = ', pkt );
    //console.log(' RemoteBle2.doSend pkt len = ', pkt.length );

    dBuf.fromPkt(pkt);
    var D_DAT_Array = [];
    D_CMD_pkt = dBuf.get_D_CMD();
    //dBuf.printData20(D_CMD_pkt);

    D_DAT_Array.push(dBuf.get_D_DAT(0));
    //dBuf.printData20(D_DAT_Array[0]);
    
    var count = dBuf.get_D_DAT_count();
    if(count == 2) {
        D_DAT_Array.push(dBuf.get_D_DAT(1));
        //dBuf.printData20(D_DAT_Array[1]);
    }

    //console.log('>>>>> RemoteBle2.doSend >>>>>');

    //console.log('-> write_D_CMD');
    //dBuf.printData20(D_CMD_pkt);
    device.write_D_CMD( D_CMD_pkt, function(status) {

        //console.log('write_D_CMD status = ' + status);
        //console.log('-> write_D_DAT');
        //D_DAT_Array[0][12]=42;
        //dBuf.printData20(D_DAT_Array[0]);
        device.write_D_DAT( D_DAT_Array[0], function(status) {
            //console.log('write_D_DAT status = ' + status);

            if(count == 2) {
                device.write_D_DAT( D_DAT_Array[1], function(status) {
                    //console.log('write_D_DAT status = ' + status);    
                    var id_status = { id : id, status : true};
                    statusCallback(id_status);
                });
            } else {
                var id_status = { id : id, status : true};
                statusCallback(id_status);
            }
        });
    });

}

// UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP
// UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP
// UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP UP


// TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST
// TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST
// TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST TEST



module.exports = RemoteBle2;
