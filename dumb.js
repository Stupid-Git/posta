let jsonfile = require('jsonfile')
let tshistfile = 'C:/home/karel/tooling/github/Stupid-Git/posta/tshist.json'
let itparamsfile = 'C:/home/karel/tooling/github/Stupid-Git/posta/itparams.json'
let it = {}
let historyJs = {};
//let P = {}

var Dumb = class {

    
    constructor()
    {        
        this.P = {};
    }

    Dumb_Load()
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


    Dumb_Save()
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

module.exports = { Dumb };
