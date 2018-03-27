
var async = require('async');

//var NobleDevice = require('NobleDevice');
var NobleDevice = require('noble-device');

//var idOrLocalName = process.argv[2];
var idOrLocalName = 'd81e6c802446';

if (!idOrLocalName) {
  console.log("node hrm-device.js [ID or local name]");
  process.exit(1);
}

var BleAdapter = function(device) {
  NobleDevice.call(this, device);
};

NobleDevice.Util.inherits(BleAdapter, NobleDevice);
NobleDevice.Util.mixin(BleAdapter, NobleDevice.DeviceInformationService);
BleAdapter.TUDService = require('./rembleD/remble-tuds.js');
NobleDevice.Util.mixin(BleAdapter, BleAdapter.TUDService);

BleAdapter.is = function(device) {
    console.log("BleAdapter.is: device.id =", device.id );
    var localName = device.advertisement.localName;
    return (device.id === idOrLocalName || localName === idOrLocalName);
};


BleAdapter.ScanForDevice = function(id, callback)
{
    console.log('BleAdapter.ScanForDevice: id =', id)
    idOrLocalName = id; // used in 'BleAdapter.is' above

    BleAdapter.discover( function(device) {
        //console.log('discovered: ' + device);
        //console.log('discovered: ', device);
      
/*
        console.log('XXXXtd.prototype.connect()');

        device.connectAndSetUp(function(error) {
            console.log('XXXXXconnectAndSetUp');
            if(error)
                callback(error)
            else
                callback(null, device);
        });
*/
        callback( null, device );
    });

}

var TdUp = require('./rembleD/up');
var TdDn = require('./rembleD/dn');

var events = require('events');
var util = require('util');
util.inherits(TdTR4, events.EventEmitter);

function TdTR4( device, id )
{
    this.id = id;
    this.device = device;

    this.canSendCount = 0;
    this.canSend = true;

    this.up = new TdUp(id);
    this.dn = new TdDn(id);

    this.device.on('disconnect', () => {
        this.up.on_disconnect();
        this.dn.on_disconnect();
        this.emit('tr4:disconnected', this.id);

        console.log('TdTR4: FOR DEBUGGING GOT disconnect. Shutting down soon');

        setTimeout(function() {
            console.log('Shutting Down ...  Bye')
            console.log('');
            process.exit(0)
        }, 5000);
    });

   
    //========== DN ==========
    //device.on('d_cfm_Change', (buffer) => { console.log('GOT D_CFM', buffer); });
    device.on('d_cfm_Change', this.dn.Get_on_d_cfm() ); // .on -> addListener    //device.removeListener('d_cfm_Change', Remble.On_D_CFM_0 ); //.off = X removeListener
    //========== UP ==========
    //device.on('u_cmd_Change', (buffer) => { console.log('GOT U_CMD', buffer); });
    //device.on('u_dat_Change', (databufferAndDevice) => { console.log('GOT U_DAT', databufferAndDevice); });
    device.on('u_cmd_Change', this.up.Get_on_u_cmd() ); //this.up.on_u_cmd.bind(this) ); //.On_U_CMD );
    device.on('u_dat_Change', this.up.Get_on_u_dat() ); //this.up.on_u_dat.bind(this) ); //On_U_DAT );

    //========== DN ==========
    this.write_D_CMD_Binded =  this.write_D_CMD.bind(this);
    this.write_D_DAT_Binded =  this.write_D_DAT.bind(this);
    this.dn.set_send_d_cmd( this.write_D_CMD_Binded );
    this.dn.set_send_d_dat( this.write_D_DAT_Binded );
    //========== UP ==========
    this.write_U_CFM_Binded = this.write_U_CFM.bind(this);
    //this.write_U_CFM_binded = this.device.write_U_CFM.bind(this);
    this.up.set_send_u_cfm( this.write_U_CFM_Binded );

    this.up.on('up:packet', (status, id_pkt) => { 
        //console.log('up.on(up:packet ...) in TdTR4 funcion contructor: status -> ', status)
        //console.log('')
        this.emit('tr4:upPacket', status, id_pkt );
        //this.disconnect(); // to terminate
    })
}

TdTR4.prototype.write_D_CMD = function(D_CMD_pkt, callback) {
    this.device.write_D_CMD( D_CMD_pkt, function(status) {
        callback(null, status);
    });
};
TdTR4.prototype.write_D_DAT = function(D_DAT_pkt, callback) {
    this.device.write_D_DAT( D_DAT_pkt, function(status) {
        callback(null, status);
    });
};
TdTR4.prototype.write_U_CFM = function(U_CFM_pkt, callback) {
    this.device.write_U_CFM( U_CFM_pkt, function(status) {
        callback(null, status);
    });
};




TdTR4.prototype.connect = function(callback)
{
    //console.log('TdTR4.prototype.connect()');
    //console.log('TdTR4.prototype.connect() this.device =', this.device);
    //var that = this;

    this.device.connectAndSetUp( function(error) {
        //console.log('connectAndSetUp callback');
        if(error)
            callback(error)

        //console.log('connectAndSetUp callback this.device =', this.device);
        
        //========== DN ==========
        this.device.notify_D_CFM(function(error) {
        //that.device.notify_D_CFM(function(error) {
            if(error)
                console.log('set notify D_CFM error : ' + error);
        });
    
        //========== UP ==========
        this.device.notify_U_CMD(function(error) {
        //that.device.notify_U_CMD(function(error) {
            if(error)
                console.log('set notify U_CMD error : ' + error);
        });
        this.device.notify_U_DAT(function(error) {
        //that.device.notify_U_DAT(function(error) {
            if(error)
                console.log('set notify U_DAT error : ' + error);
        });

        this.emit('tr4:connected', this.id );
        callback(null);

    }.bind(this) );
}

TdTR4.prototype.disconnect = function()
{
    this.device.disconnect( (param) => {
        console.log('device.disconnect returns a param = ',param)
    })
}

/*
TdTR4.prototype.dummySend = function()
{
    console.log('TdTR4.prototype.dummySend()');
    var D_CMD_pkt = new Buffer([1,1,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
    var D_DAT_pkt = new Buffer([0,0,0,0, 0x01, 0x9e,0x00, 0x00,0x00 ,0xce,0x94, 0x01,0x02, 0,0,0,0,0,0,0 ]);

    this.device.write_D_CMD( D_CMD_pkt, function(status) {
        console.log('write_D_CMD status = ' + status);
        this.device.write_D_DAT( D_DAT_pkt, function(status) {
            console.log('write_D_DAT status = ' + status);
        });
    });
}
*/

TdTR4.prototype.SendPacket = function(pkt, callback)
{
    this.dn.Send(pkt);
    callback(null);
}

/*
TdTR4.prototype.properSend = function()
{
    console.log('TdTR4.prototype.properSend()');
    var pkt = new Buffer( [0x01, 0x9e,0x00, 0x00,0x00 ,0xce,0x94] );

    this.canSend = false;
    this.canSendCount++;
    console.log('properSend: canSend =', this.canSend)
    console.log('properSend: canSendCount =', this.canSendCount)
    this.dn.Send(pkt);
   
    let theUp = this.up;
    console.log('[[[P]]] 0')
    var eventBHappened = new Promise( function( resolve ){

        console.log('[[[P]]] Start')

        theUp.once('up:packet',(status, id_pkt) => { 
            console.log('[[[P]]] up.on(up:packet ...) -> ', status)
            console.log('[[[P]]] ')
            this.canSend = true;
            //this.canSendCount++;
            if(status) resolve(status, id_pkt)
            else reject("error")
        })
    })
    console.log('[[[P]]] 1')
    
    //eventBHappened.then( function(){ 
    //    console.log('[[[P]]] 2')
    //})

    async function f1(that) {
        var x = await eventBHappened;
        console.log('awaited, and got -> ', x); // 10
        //this.canSendCount++;
        console.log('f1: canSend =', that.canSend)
        console.log('f1: canSendCount =', that.canSendCount)
        if(that.canSendCount < 3)
            that.properSend();
        else {
            that.disconnect();
            console.log('this = ' + this + 'that = ' + that );
            //console.log('this = ', this );
            //console.log('that = ', that );
        }
        return(x);
    }

    console.log('[[[P]]] 3')
    var wtf_rv = f1(this);
    console.log('[[[P]]] 4 // wtf_rv =', wtf_rv)
}
*/


module.exports = { BleAdapter, TdTR4 }
