var async = require('async');

var NobleDevice = require('noble-device');

var TestDevice = function(peripheral) {
  NobleDevice.call(this, peripheral);
};

NobleDevice.Util.inherits(TestDevice, NobleDevice);

var idOrLocalName = 'd81e6c802446';

TestDevice.is = function(device) {
    console.log("TdDevice.is: device.id =", device.id );
    var localName = device.advertisement.localName;
    return (device.id === idOrLocalName || localName === idOrLocalName);
};


TestDevice.startScanning(); //noble.startScanning();
var delay = 5;
setTimeout(function(){

    TestDevice.stopScanning(); //noble.stopScanning();

    delay = 1;
    setTimeout(function(){

        console.log('GO GO GO');
        console.log('GO GO GO');
        console.log('GO GO GO');


        TestDevice.discover(function(testDevice) {
        // 1 utils.js (72)  constructor.discover = function(callback) {
        // 2 utils.js (48)  constructor.discoverAll = function(callback) {

        // n. util.js (26) hci->gap->noble [add to peripheral array] -> this
        // x    constructor.onDiscover = function(peripheral) {
        //          if (constructor.is(peripheral)) {                   -> calls our TestDevice.is overide
        //              var device = new constructor(peripheral);       -> true -> create a new TestDevice(peripheral)
        //              constructor.emitter.emit('discover', device);   -> inform of dicovery
        //          }
        //      };
        console.log('found ' + testDevice.id);

        console.log('=============================================================================')
        console.log('=============================================================================')
        console.log('TestDevice =', TestDevice);
        console.log('=============================================================================')
        console.log('=============================================================================')
        console.log('testDevice =', testDevice);
        console.log('=============================================================================')
        console.log('=============================================================================')

        testDevice.on('disconnect', function() {
            console.log('disconnected!');
            process.exit(0);
        });

        async.series([
            function(callback) {
                console.log('connect');
                testDevice.connect(callback);
            },
            function(callback) {
                console.log('discoverServicesAndCharacteristics');
                testDevice.discoverServicesAndCharacteristics(callback);
            },
            function(callback) {
                console.log('readDeviceName');
                testDevice.readDeviceName(function(error, deviceName) {
                console.log('\tdevice name = ' + deviceName);
                callback();
                });
            },
            function(callback) {
                console.log('=============================================================================')
                console.log('testDevice =', testDevice);
                console.log('=============================================================================')
                console.log('=============================================================================')
                        console.log('disconnect');
                testDevice.disconnect(callback);
            }
            ]
        );
        });



    }, delay*1000);

}, delay*1000);
  
