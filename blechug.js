
var remble = require('./rembleD/remble');

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
}


Pit_Process = function(rData)
{
    it.base = {};

    it.base.serial    = P.serial;  //0x5e2e0205;
    it.base.model     = 'TR41';    //'TR42';
    it.base.name      = P.devName; //'TR42_5E2E0205春';
    it.base.time_diff = 540;       //local_time = UTC + time_diff + std_bias(標準時間中）
                                   //local_time = UTC + time_diff + dst_bias(夏時間中）
    // gggg
    it.ch1 = {};
    it.ch1.current = {};

    it.ch1.current.unix_time = P.TS_current; //1499062406; // S += indent + lInd + '<unix_time>1499062406</unix_time>' + '\r\n';
    it.ch1.current.time_str  = '';           //'2017/07/03 15:13:26'; //  S += indent + lInd + '<time_str>2017/07/03 15:13:26</time_str>' + '\r\n';
    it.ch1.current.value     = (P.ch1Raw - 1000) / 10.0;     //28.3;    //S += indent + lInd + '<value valid="true">27.3</value>' + '\r\n';
    it.ch1.current.unit      = 'C';          //S += indent + lInd + '<unit>C</unit>' + '\r\n';
    it.ch1.current.batt      = P.battLevel;  //S += indent + lInd + '<batt>5</batt>' + '\r\n';                                

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
    console.log('Pit_Process len   = ' + len);
    console.log('Pit_Process count = ' + count + 'it.ch1.record.count = ' + it.ch1.record.count);

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
    console.log('--------------------------------------------------')
    console.log(jsonfile.readFileSync(tshistfile))
    console.log('--------------------------------------------------')

    //-------------------------------------------------------------------------
    
    jsonfile.writeFileSync(itparamsfile, it);
    console.log('--------------------------------------------------')
    console.log(jsonfile.readFileSync(itparamsfile))
    console.log('--------------------------------------------------')

}


//#############################################################################
let P = {}

onUpPktRdy = function(idAndPkt) {
    var id = idAndPkt.id;
    var pkt = idAndPkt.pkt;

    device = remble.get_NobleDevFromID(id);
    //socket.emit('', idAndPkt);

    /*
    if( pkt[1] == 0x9e)
        console.log('<<<<<  onUpPktRdy   <<<<<  (id = ' + id + ') pkt[1] = ' + pkt[1].toString(16) + ') pkt.len = ' + pkt.length);
    if( pkt[1] == 0x9f)
        console.log('<<<<<  onUpPktRdy   <<<<<  (id = ' + id + ') pkt[6] = ' + pkt[6].toString(16) + ') pkt.len = ' + pkt.length);
    */

    //proc01.dumpHex(pkt);

    if( pkt[1] == 0x9e)
    {
        Pit_Load();
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
        remble.doSend(id, sPkt, function(id_status){
            //console.log('doSend (id = ' + id_status.id + ') status = ' + id_status.status);
        });

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
            console.log('P.nSamples    = ', P.nSamples );

            var sData = proc01.getPkt_48('bytes', P.nSamples * 2);
            var sPkt = proc01.makePkt_9f(sData, 0x26243047);
            P.TS_0 = Date.now();
            remble.doSend(id, sPkt, function(id_status){
                //console.log('doSend (id = ' + id_status.id + ') status = ' + id_status.status);
            });
        }
        else
        if( rData[1] == 0x48)
        {
            P.TS_1 = Date.now();
            console.log('Delta TS = ', P.TS_1 - P.TS_0)

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
            console.log('P.TS_now      = ', P.TS_now );
            console.log('P.rsvTime     = ', P.rsvTime );
            console.log('P.TS_last     = ', P.TS_last );
            console.log('P.nSamples    = ', P.nSamples );
            console.log('P.TS_recStart = ', P.TS_recStart );
            
            console.log('Should be an integer = ', (P.TS_recStart - P.TS_history)/P.interval );

            P.TS_history = P.TS_last; // to be saved
    
            // Send 41 pkt
            var sData = proc01.getPkt_41(0);
            var sPkt = proc01.makePkt_9f(sData, 0x26243047);
            //proc01.dumpHex(sPkt);
            remble.doSend(id, sPkt, function(id_status){
                //console.log('doSend (id = ' + id_status.id + ') status = ' + id_status.status);
                //callback(id_status);
            });
        }
        else
        {
            //proc01.dump_41(rData);
            Pit_Process(rData);
            Pit_Save();
            
            device.disconnect(); //just for testing
        }
    }
    else
    {
        // Not a 9e or 9f packet
        console.log('ERROR? Invalid (Not 0x9e or 0x9f) packet received. Bye....');
        device.disconnect();
    }


}

onDisconnect = function()
{
    console.log('onDisconnect - Exiting ...');
    process.exit();
}



//========== TEST =============================================================
/*
var Name = class {
  
    constructor(firstName, lastName) {
      this.firstName = firstName
      this.lastName = lastName
    }
  
    sayName () {
      console.log(`My name is ${this.firstName}  ${this.lastName}`)
    }
  
}  

var me = new Name('nader', 'dabit')
me.sayName() // "My name is nader dabit"
*/


//========== GO ===============================================================
var id = 'd81e6c802446';
//remble.print_bleid();

remble.startScanning(); //noble.startScanning();
var delay = 5;
setTimeout(function(){

    remble.stopScanning(); //noble.stopScanning();

    delay = 1;
    setTimeout(function(){

        remble.doDiscover_ConnectAndSetup(id, function(id_status) {

            var status = id_status.status;
            //console.log('');
            //console.log('var id = ' + id );
            console.log('ConnectionStatus (id = ' + id_status.id + ') connected? = ' + id_status.status);

            device = remble.get_NobleDevFromID(id_status.id);
            device.on('disconnect', onDisconnect );
            device.on('upPktRdy:dev',onUpPktRdy);
        
            if(status)
            {
                var sPkt = [0x01, 0x9e,0x00, 0x00,0x00 ,0xce,0x94];
                remble.doSend(id_status.id, sPkt, function(id_status){
                    //console.log('doSend (id = ' + id_status.id + ') status = ' + id_status.status);
                    //callback(id_status);
                });
            }
        });

    }, delay*1000);

}, delay*1000);
  

