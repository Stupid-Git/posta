// https://www.npmjs.com/package/jsonfile
// https://www.npmjs.com/package/config

var jsonfile = require('jsonfile')
var settingsfile = './config/default1.json'
/*
var config = require('config');
 
if (config.has('optionalFeature.detail')) {
    var detail = config.get('optionalFeature.detail');
}

console.log('--------------------------------------------------')
if (config.has('Customer.credit')) {
    var credit = config.get('Customer.credit');
    console.log('Customer.credit = ', credit);
}
*/
console.log('--------------------------------------------------')
var settings = {}
try {
    settings = jsonfile.readFileSync(settingsfile)
}
catch(error)
{
    console.dir('error = ', error);
    settings = {"Dog":{"dbConfig":{"host":"localhost","port":5984,"dbName":"customers"},"credit":{"initialLimit":100,"initialDays":6}}}
}
console.log(settings)

settings.Dog.credit.initialDays++;

//jsonfile.writeFileSync(settingsfile, settings);
//console.log('--------------------------------------------------')
//console.dir(jsonfile.readFileSync(settingsfile))
//console.log('--------------------------------------------------')

var lastPsecs = settings.Dog.Psecs;
if( lastPsecs == undefined)
{
    settings.Dog.Psecs = 0;    
    lastPsecs = settings.Dog.Psecs;    
}

const tBufCOUNT = 0;
const _Interval = 20;
var Psecs = Math.round(Date.now()/1000); // Current Time in seconds since 1970
//Psecs = Psecs - (Psecs % 20);
//Psecs -= (tBufCOUNT * 20); //fix to pint to 1st data in set

var diff = Psecs - lastPsecs;
var samplesToSend;
//samplesToSend = Math.round(diff / _Interval);
samplesToSend = Math.floor(diff / _Interval);
samplesToSend += 5;

console.log('Psecs         = ', Psecs);
console.log('lastPsecs     = ', lastPsecs);
console.log('diff          = ', diff);
console.log('samplesToSend = ', samplesToSend);


settings.Dog.Psecs = Psecs; 
jsonfile.writeFileSync(settingsfile, settings);
console.log('--------------------------------------------------')
//console.log(jsonfile.readFileSync(settingsfile))
//console.log('--------------------------------------------------')
