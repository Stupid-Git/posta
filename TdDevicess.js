// OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
// OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
// OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
var mqttParam_2 = { mqttServer : 'mqtt://ocn.cloudns.org',
              topic_sendAnswer: 'sendAnswer',
              topic_makeOffer:  'makeOffer'
};

var Om = require('./mqrtc/om');
var Ortc = require('./mqrtc/ortc');

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






//var BleAdapter = require ('./ble-adapter').BleAdapter;
//var TdTR4 = require ('./ble-adapter').TdTR4;



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

    var S = new Buffer( D ).toString('base64');

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


//#############################################################################
//#############################################################################
//=============================================================================
// SCAN BLUETOOTH LE
//=============================================================================
require('./rb2/rb2_util'); // const SCANSTART_REM  etc 


ortc.on('gotData', (dataIn) => {
    console.log('[O ] got dataIn from crtc ...')   
    //console.log('[O ] got dataIn from crtc = ', dataIn )   
    cmd = dataIn.cmd;
    switch( dataIn.cmd)
    {
        //---------------------------------------------------------------------
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

        //---------------------------------------------------------------------
        case CONNECTIONSTATUS_REM:
            var _id = dataIn.payload.id;
            var _status = dataIn.payload.status;
            console.log('Connection Status : id = ', _id, 'status = ', _status );
            if(_status == true) {
                dl.OnTR4_Connected( _id )
            }
            if(_status == false) {
                dl.OnTR4_Disconnected( _id )
            }
            break;

        //---------------------------------------------------------------------
        case DNPKTSENTCFM_REM:
            var _id = dataIn.payload.id;
            console.log('Packet Sent : id = ', _id );
            break;

        case UPPKT_REM:
            var _id = dataIn.payload.id;
            var _pkt = dataIn.payload.pkt;

            dataIn.payload.pkt = Buffer.from(dataIn.payload.pkt.data);

            //console.log('Packet received : id = ', _id, 'pkt = ', _pkt );
            dl.OnTR4_upPacket( true, dataIn.payload )
            break;

    }

});


var DL = function()
{
    //this.adapter = BleAdapter;
    //this.tr4 = null;
    this.id = 42;
}

DL.prototype.SendTr4Packet = function( pkt )
{
    var _cmd = DNPKT_REM;
    var _payload = { id: this.id, pkt: pkt};
    //var dataOut = { cmd: _cmd, payload : _payload};
    var dataOut = { cmd: _cmd, payload : _payload };
    //console.log('---------------------------------------------------------------')
    //console.log('DL.prototype.SendTr4Packet _payload = ', _payload)
    //console.log('DL.prototype.SendTr4Packet  dataOut = ', dataOut)
    //console.log('---------------------------------------------------------------')

    ortc.sendData( dataOut );
    //this.tr4.SendPacket( pkt, (error) => {
    //});
}

DL.prototype.OnTR4_Connected = function( id )
{
    console.log('OnTR4_Connected')
    dl.processCmd('proc_Send0x9e', id )
}
DL.prototype.OnTR4_Disconnected = function( id )
{
    console.log('OnTR4_Disconnected')
}
DL.prototype.OnTR4_upPacket = function( status, id_pkt )
{
    console.log('OnTR4_upPacket')
    dl.processCmd('proc_OnUpPkt', id_pkt )
}


DL.prototype.Tr4Disconnect = function()
{
    var _cmd = DISCONNECT_REM;
    var _payload = { id: this.id };
    var dataOut = { cmd: _cmd, payload : _payload};
    //dataOut = JSON.stringify( dataOut)
    ortc.sendData( dataOut );

}

DL.prototype.Start = function(id, callback)
{
    this.id = id;

    var _cmd = CONNECT_REM;
    var _payload = { id: this.id };
    var dataOut = { cmd: _cmd, payload : _payload};
    //dataOut = JSON.stringify( dataOut)
    ortc.sendData( dataOut );

    /*
    this.adapter.ScanForDevice(id, (error, device) => {
        if(error){
            console.log('Error during ScanForDevice: ', error)
            callback(error);
            return;
        }
        console.log('###########  param id = ', id )
        console.log('########### device.id = ', device.id )
        this.tr4 = new TdTR4(device, id);

        this.tr4.on('tr4:connected', this.OnTR4_Connected )       // this.tr4.on('tr4:connected', this.OnTR4_Connected.bind(this) )
        this.tr4.on('tr4:disconnected', this.OnTR4_Disconnected ) // this.tr4.on('tr4:disconnected', this.OnTR4_Disconnected.bind(this) )
        this.tr4.on('tr4:upPacket', this.OnTR4_upPacket )         // this.tr4.on('tr4:upPacket', this.OnTR4_upPacket.bind(this) )
        
        this.tr4.connect( (error) => {
            //console.log('tr4.connect callback()')
            if(error)
                callback(error);
            else
                callback(null, 'Connected');
        });
    })
    */

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
            var id = data.id;
            var pkt = data.pkt;
            //console.log('proc_OnUpPkt: pkt[0]=', pkt[0], ', pkt[1]=', pkt[1]);
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

                var Bpkt = Buffer.from(sPkt);
                this.SendTr4Packet( Bpkt );
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

                    var Bpkt = Buffer.from(sPkt);
                    this.SendTr4Packet( Bpkt );
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

                    var Bpkt = Buffer.from(sPkt);
                    this.SendTr4Packet( Bpkt );
                }
                else
                {
                    //proc01.dump_41(rData);
                    Pit_Process(rData);
                    Pit_Save();
                    
                    //this.tr4.disconnect();
                    this.Tr4Disconnect();
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
Pit_Load();


callbackForConnected = function()
{
    console.log('callbackForConnected ')
    dl.processCmd('proc_Start', { id: 'd81e6c802446' })
}

// Start in rolling
//ortc.fakeOnicecandidate();
delay = 1;
setTimeout(function(){

    //ortc.fakeOnicecandidate();
    ortc.mqtt_makeOffer(callbackForConnected);

    delay = 4;
    setTimeout(function() {
        /*
        var _cmd = SCANSTART_REM;
        var _payload = "";//data;
        var dataOut = { cmd: _cmd, payload : _payload};
        //dataOut = JSON.stringify( dataOut)
        ortc.sendData( dataOut );
        */
        delay = 10;
        console.log('Waiting', delay, 'seconds')
        setTimeout(function() {
            /*
            var _cmd = SCANSTOP_REM;
            var _payload = "";//data;
            var dataOut = { cmd: _cmd, payload : _payload};
            //dataOut = JSON.stringify( dataOut)
            ortc.sendData( dataOut );            
            */

            console.log('Better be connected by now!!!!')
            //dl.processCmd('proc_Start', { id: 'd81e6c802446' })

        }, delay*1000);
    
    
    }, delay*1000);

}, delay*1000);



/*
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
*/