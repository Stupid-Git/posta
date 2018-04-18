let jsonfile = require('jsonfile')
let tshistfile = 'C:/home/karel/tooling/github/Stupid-Git/posta/tshist.json'
let itparamsfile = 'C:/home/karel/tooling/github/Stupid-Git/posta/itparams.json'
let it = {}
let historyJs = {};
//let P = {}

var Pit = class {

    
    constructor()
    {        
        this.P = {};
    }

    Pit_Load()
    {
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
        console.log(process.cwd())
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
        console.log(__dirname);
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
        console.log('historyJs  =', historyJs)
        historyJs = jsonfile.readFileSync(tshistfile)
        console.log('historyJs  =', historyJs)

        try {
            historyJs = jsonfile.readFileSync(tshistfile)
        }
        catch(error)
        {
            console.log('jsonfile.readFileSync(tshistfile) Failed: tshistfile =', tshistfile)
            console.dir('error = ', error);
            historyJs = {"TS_history": 0};
        }

        
        try {
            it = jsonfile.readFileSync(itparamsfile)
        }
        catch(error)
        {
            console.log('jsonfile.readFileSync(itparamsfile) Failed: itparamsfile =', itparamsfile)
            console.dir('error = ', error);
            it = {};
        }

        this.P.TS_history = historyJs.TS_history;
        //console.log(' Pit_Load ' ,this.P.TS_history,  historyJs.TS_history);
    }


    Pit_Process(rData)
    {
        it.base = {};

        it.base.serial    = this.P.serial;  //0x5e2e0205;
        it.base.model     = 'TR41';    //'TR42';
        it.base.name      = this.P.devName; //'TR42_5E2E0205春';
        it.base.time_diff = 540;       //local_time = UTC + time_diff + std_bias(標準時間中）
                                    //local_time = UTC + time_diff + dst_bias(夏時間中）

        it.ch1 = {};
        it.ch1.current = {};

        it.ch1.current.unix_time = this.P.TS_current; //1499062406; // S += indent + lInd + '<unix_time>1499062406</unix_time>' + '\r\n';
        it.ch1.current.time_str  = '';           //'2017/07/03 15:13:26'; //  S += indent + lInd + '<time_str>2017/07/03 15:13:26</time_str>' + '\r\n';
        it.ch1.current.value     = (this.P.ch1Raw - 1000) / 10.0;     //28.3;    //S += indent + lInd + '<value valid="true">27.3</value>' + '\r\n';
        it.ch1.current.unit      = 'C';          //S += indent + lInd + '<unit>C</unit>' + '\r\n';
        it.ch1.current.batt      = this.P.battLevel;  //S += indent + lInd + '<batt>5</batt>' + '\r\n';                                
        console.log('it.ch1.current.value = ' + it.ch1.current.value);

        it.ch1.record = {};
        it.ch1.record.type      = 13;            //0x48[42]CH1 Type      = 13
        it.ch1.record.unix_time = this.P.TS_recStart; //1498792352;
        it.ch1.record.data_id   = 16005;         // What should this be?
        it.ch1.record.interval  = this.P.interval;
        it.ch1.record.count     = this.P.nSamples;             // length of samples in data below.
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

    Pit_Save()
    {
        //-------------------------------------------------------------------------
        historyJs.TS_history =  this.P.TS_last;
        console.log('--------------------------------------------------')
        console.log('jsonfile.writeFileSync(tshistfile) file = ', tshistfile);
        console.log('--------------------------------------------------')
        jsonfile.writeFileSync(tshistfile, historyJs);
        //console.log('--------------------------------------------------')
        //console.log(jsonfile.readFileSync(tshistfile))
        //console.log('--------------------------------------------------')

        //-------------------------------------------------------------------------
        
        console.log('--------------------------------------------------')
        console.log('jsonfile.writeFileSync(itparamsfile) file = ', itparamsfile);
        console.log('--------------------------------------------------')
        jsonfile.writeFileSync(itparamsfile, it);
        //console.log('--------------------------------------------------')
        //console.log(jsonfile.readFileSync(itparamsfile))
        //console.log('--------------------------------------------------')

    }

}

module.exports = { Pit };
