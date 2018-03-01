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

function TdTR4( device )
{
    this.device = device;

    this.canSendCount = 0;
    this.canSend = true;

    this.up = new TdUp();
    this.dn = new TdDn();

    this.device.on('disconnect', () => {
        this.up.on_disconnect();
        this.dn.on_disconnect();
        this.emit('tr4:disconnected', 'dummyParam');

        console.log('GOT disconnect. Shutting down soon');

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

    this.up.on('up:packet', (status, pkt) => { 
        //console.log('up.on(up:packet ...) in TdTR4 funcion contructor: status -> ', status)
        //console.log('')
        this.emit('tr4:upPacket', status, pkt );
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

        this.emit('tr4:connected', 'dummyData' );
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

        theUp.once('up:packet',(status, pkt) => { 
            console.log('[[[P]]] up.on(up:packet ...) -> ', status)
            console.log('[[[P]]] ')
            this.canSend = true;
            //this.canSendCount++;
            if(status) resolve(status, pkt)
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




//=============================================================================
//=============================================================================
//=============================================================================
//=============================================================================
//=============================================================================
//---------- Proc01 ----------
let Proc01 = require('./proc01').Proc01;
var proc01 = new Proc01();


process.on("SIGINT", function(){
  console.log("SIGINT - Exiting ...");
  process.exit();
});


//#############################################################################
var jsonfile = require('jsonfile')
var tshistfile = './tshist.json'
var itparamsfile = './itparams.json'
let it = {}
let historyJs = {};
let P = {}

Pit_Load = function()
{
    try {
        historyJs = jsonfile.readFileSync(tshistfile)
    }
    catch(error)
    {
        console.dir('error = ', error);
        historyJs = {"TS_history": 0};
    }

    
    try {
        it = jsonfile.readFileSync(itparamsfile)
    }
    catch(error)
    {
        console.dir('error = ', error);
        it = {};
    }

    P.TS_history = historyJs.TS_history;
    //console.log(' Pit_Load ' ,P.TS_history,  historyJs.TS_history);
}


Pit_Process = function(rData)
{
    it.base = {};

    it.base.serial    = P.serial;  //0x5e2e0205;
    it.base.model     = 'TR41';    //'TR42';
    it.base.name      = P.devName; //'TR42_5E2E0205春';
    it.base.time_diff = 540;       //local_time = UTC + time_diff + std_bias(標準時間中）
                                   //local_time = UTC + time_diff + dst_bias(夏時間中）

    it.ch1 = {};
    it.ch1.current = {};

    it.ch1.current.unix_time = P.TS_current; //1499062406; // S += indent + lInd + '<unix_time>1499062406</unix_time>' + '\r\n';
    it.ch1.current.time_str  = '';           //'2017/07/03 15:13:26'; //  S += indent + lInd + '<time_str>2017/07/03 15:13:26</time_str>' + '\r\n';
    it.ch1.current.value     = (P.ch1Raw - 1000) / 10.0;     //28.3;    //S += indent + lInd + '<value valid="true">27.3</value>' + '\r\n';
    it.ch1.current.unit      = 'C';          //S += indent + lInd + '<unit>C</unit>' + '\r\n';
    it.ch1.current.batt      = P.battLevel;  //S += indent + lInd + '<batt>5</batt>' + '\r\n';                                
    console.log('it.ch1.current.value = ' + it.ch1.current.value);

    it.ch1.record = {};
    it.ch1.record.type      = 13;            //0x48[42]CH1 Type      = 13
    it.ch1.record.unix_time = P.TS_recStart; //1498792352;
    it.ch1.record.data_id   = 16005;         // What should this be?
    it.ch1.record.interval  = P.interval;
    it.ch1.record.count     = P.nSamples;             // length of samples in data below.
    it.ch1.record.data      = 0;

    const buf = Buffer.from(rData);
    var len = (buf[4]<<8) + buf[3];
    var count = len >> 1;
    //console.log('Pit_Process len   = ' + len);
    //console.log('Pit_Process count = ' + count + 'it.ch1.record.count = ' + it.ch1.record.count);

    var D = new Int8Array(len);
    for (var i=0; i< len; i++){
        D[i] = buf[5 + i];
    }

    S = new Buffer( D ).toString('base64');

    it.ch1.record.data = S;

}

Pit_Save = function()
{
    //-------------------------------------------------------------------------
    historyJs.TS_history =  P.TS_last;
    jsonfile.writeFileSync(tshistfile, historyJs);
    //console.log('--------------------------------------------------')
    //console.log(jsonfile.readFileSync(tshistfile))
    //console.log('--------------------------------------------------')

    //-------------------------------------------------------------------------
    
    jsonfile.writeFileSync(itparamsfile, it);
    //console.log('--------------------------------------------------')
    //console.log(jsonfile.readFileSync(itparamsfile))
    //console.log('--------------------------------------------------')

}
//#############################################################################
//#############################################################################
//#############################################################################
//#############################################################################
//#############################################################################

var tr4postit = require('./tr4post')

var DL = function()
{
    this.adapter = BleAdapter;
    this.tr4 = null;
}

DL.prototype.SendTr4Packet = function( pkt )
{
    this.tr4.SendPacket( pkt, (error) => {
    });
}

DL.prototype.OnTR4_Connected = function()
{
    console.log('OnTR4_Connected')
    dl.processCmd('proc_Send0x9e', null )
}
DL.prototype.OnTR4_Disconnected = function()
{
    console.log('OnTR4_Disconnected')
}
DL.prototype.OnTR4_upPacket = function( status, packet )
{
    console.log('OnTR4_upPacket')
    dl.processCmd('proc_OnUpPkt', packet )
}



DL.prototype.Start = function(id, callback)
{
    this.adapter.ScanForDevice(id, (error, device) => {
        if(error){
            console.log('Error during ScanForDevice: ', error)
            callback(error);
            return;
        }

        this.tr4 = new TdTR4(device);
        this.tr4.on('tr4:connected', this.OnTR4_Connected.bind(this) )
        this.tr4.on('tr4:disconnected', this.OnTR4_Disconnected.bind(this) )
        this.tr4.on('tr4:upPacket', this.OnTR4_upPacket.bind(this) )
        
        this.tr4.connect( (error) => {
            //console.log('tr4.connect callback()')
            if(error)
                callback(error);
            else
                callback(null, 'Connected');
        });
    })

}


DL.prototype.processCmd = function( procId, data )
{

    switch(procId){
        case 'proc_Start':
            this.TT_0 = Date.now();
            this.Start(data.id, (error, param) => {
                if(!error)
                {
                    // TODO Start Sending data
                }
            });
            break;

        case 'proc_Send0x9e':
            this.TT_1 = Date.now();
            var pkt = new Buffer( [0x01, 0x9e,0x00, 0x00,0x00 ,0xce,0x94] );
            this.SendTr4Packet( pkt );            
            break;
        
        case 'proc_OnUpPkt':
            this.TT_3 = Date.now();
            var pkt = data;
            if( pkt[1] == 0x9e)
            {
                P.TS_current = Math.round(Date.now()/1000); // To match P.ch1Raw 
                //proc01.dump_9e(pkt);
                const buf = Buffer.from(pkt);

                P.security  = buf.readUInt32LE(5 + 0); //    [00]BLE Security Code = 26243047
                P.devName   = buf.toString('utf8', 5 + 4, 5 + 4 + 16); //[04]Name              = "TR41_582C0206振 "
                console.log('devName = ' + P.devName);
                P.grpName   = buf.toString('utf8', 5 + 4 + 16, 5 + 4 + 16 + 10); //[20]Group             = "           "
                P.serial    = buf.readUInt32LE(5 + 32); // 582c0206
                P.ch1Raw    = buf.readUInt16LE(5 + 38); //[38] Ch1 Raw          = 1253
                P.ch2Raw    = buf.readUInt16LE(5 + 40); //[40] Ch2 Raw          = 61166
                P.battLevel = buf.readUInt8   (5 + 42);

                var sData = proc01.getPkt_69(); // Use this to get the interval
                var sPkt = proc01.makePkt_9f(sData, 0x26243047);

                this.SendTr4Packet( sPkt );
            }
            else
            if( pkt[1] == 0x9f )
            {
                var rData = proc01.fromPkt_9f(pkt);
                //proc01.dumpHex(rData);
                
                if( rData[1] == 0x69)
                {
                    const buf = Buffer.from(rData);
                    P.interval    = buf.readUInt16LE(5 + 0);  // [00]record_int    = 10
                    //proc01.dump_69(rData);
                    
                    // We now know the interval, so we can estimate the No of samples we need to download
                    if( P.TS_history == 0){
                        P.nSamples = 512;
                    } else {
                        P.TS_0 = Date.now();
                        P.TS_0 = Math.round(P.TS_0/1000);   // The time right now. Round to seconds
                        var delta = P.TS_0 - P.TS_history;
                        P.nSamples = Math.floor(delta/P.interval);
                        P.nSamples += 5; // some extras won't hurt
                        if(P.nSamples > 512)
                            P.nSamples = 512;
                    }
                    /*
                    console.log('P.nSamples    = ', P.nSamples );
                    console.log('======================================================================');
                    console.log('P  = ', P );
                    */

                    var sData = proc01.getPkt_48('bytes', P.nSamples * 2);
                    var sPkt = proc01.makePkt_9f(sData, 0x26243047);
                    P.TS_0 = Date.now();

                    this.SendTr4Packet( sPkt );
                }
                else
                if( rData[1] == 0x48)
                {
                    P.TS_1 = Date.now();
                    //console.log('Delta TS = ', P.TS_1 - P.TS_0)

                    const buf = Buffer.from(rData);
                    //P.interval    = buf.readUInt16LE(5 + 0);  // [00]record_int    = 10
                    P.rsvTime     = buf.readUInt32LE(5 + 12); // [12]rsv_time      = 9
                    P.lastDataNo  = buf.readUInt32LE(5 + 26); // [26]last_data_no  = 181
                    P.dataSize    = buf.readUInt16LE(5 + 30); // [30]data_size     = 64
                    P.allDataSize = buf.readUInt16LE(5 + 32); // [32]all_data_size = 362
                    P.endDataSize = buf.readUInt16LE(5 + 34); // [34]end_data_size = 181
                    // Show 48 result
                    //proc01.dump_48(rData);

                    P.TS_now = Math.floor(P.TS_0/1000); //P.TS_1
                    P.TS_last = P.TS_now - P.rsvTime;
                    P.TS_recStart =  P.TS_last - (P.nSamples * P.interval);
                    /*
                    console.log('P.TS_now      = ', P.TS_now );
                    console.log('P.rsvTime     = ', P.rsvTime );
                    console.log('P.TS_last     = ', P.TS_last );
                    console.log('P.nSamples    = ', P.nSamples );
                    console.log('P.TS_recStart = ', P.TS_recStart );
                    */
                    console.log('Should be an integer = ', (P.TS_recStart - P.TS_history)/P.interval );

                    P.TS_history = P.TS_last; // to be saved
            
                    // Send 41 pkt
                    var sData = proc01.getPkt_41(0);
                    var sPkt = proc01.makePkt_9f(sData, 0x26243047);
                    //proc01.dumpHex(sPkt);

                    this.SendTr4Packet( sPkt );            
                }
                else
                {
                    //proc01.dump_41(rData);
                    Pit_Process(rData);
                    Pit_Save();
                    
                    this.tr4.disconnect();
                    this.processCmd('proc_post', 'dummy Data');
                   // device.disconnect(); //just for testing
                }
            }
            else
            {
                // Not a 9e or 9f packet
                console.log('ERROR? Invalid (Not 0x9e or 0x9f) packet received. Bye....');
               // device.disconnect();
            }
            break;
            
        case 'proc_post':
            this.TT_4 = Date.now();
            tr4postit();
            this.TT_5 = Date.now();
            console.log('TT_0 =', this.TT_0)
            console.log('TT_1 =', this.TT_1)
            console.log('TT_2 =', this.TT_2)
            console.log('TT_3 =', this.TT_3)
            console.log('TT_4 =', this.TT_4)
            console.log('TT_5 =', this.TT_5)
            console.log('TT_5-0 =', this.TT_5 - this.TT_0)
            console.log('TT_5-1 =', this.TT_5 - this.TT_1)
            console.log('TT_4-1 =', this.TT_4 - this.TT_1)
        break;

        default:
            break;
    }

}


// Using noble.on('stateChange', ... is a work around so that the 
// state (initialized) of noble is suitable to allow scanning to be
// started by the NobleDevice within the program

var dl = new DL();

var noble = require('noble') //NobleDevice.noble;
noble.on('stateChange', function(state) {
    console.log('noble.on(-stateChange-): (state, initialized) =', state, noble.initialized) ;
    if (state === 'poweredOn') {
        //console.log('noble.on(-stateChange-):     poweredOn state =', state)

        Pit_Load();
        dl.processCmd('proc_Start', { id: 'd81e6c802446' })

        //noble.startScanning();
    } else {
        console.log('noble.on(-stateChange-): NOT poweredOn state =', state)
        //noble.stopScanning();
    }
});

//debug noble.on('scanStart', () => {console.log('noble.on(scanStart)')})
