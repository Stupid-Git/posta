var async = require('async');

//var NobleDevice = require('NobleDevice');
var NobleDevice = require('noble-device');

var idOrLocalName = 'd81e6c802446';
/*
if (!idOrLocalName) {
  console.log("NB  node hrm-device.js [ID or local name]");
  process.exit(1);
}
*/

var NobleBeef = function(device) {
  NobleDevice.call(this, device);
};

NobleDevice.Util.inherits(NobleBeef, NobleDevice);
NobleDevice.Util.mixin(NobleBeef, NobleDevice.DeviceInformationService);

NobleBeef.TUDService = require('../rembleD/remble-tuds.js');
NobleDevice.Util.mixin(NobleBeef, NobleBeef.TUDService);

NobleBeef.DFUService = require('./remble-dfu.js');
NobleDevice.Util.mixin(NobleBeef, NobleBeef.DFUService);

NobleBeef.GATService = require('./remble-1801.js');
NobleDevice.Util.mixin(NobleBeef, NobleBeef.GATService);

NobleBeef.is = function(device) {
    console.log("NB  NobleBeef.is: device.id =", device.id );
    var localName = device.advertisement.localName;
    return (device.id === idOrLocalName || localName === idOrLocalName);
};


NobleBeef.ScanForDevice = function(id, callback)
{
    //console.log('NB  NobleBeef.ScanForDevice: id =', id)
    idOrLocalName = id; // used in 'NobleBeef.is' above

    NobleBeef.discover( function(device) {
        //console.log('NB  discovered: ' + device);
        //console.log('NB  discovered: ', device);
      
/*
        console.log('NB  XXXXtd.prototype.connect()');

        device.connectAndSetUp(function(error) {
            console.log('NB  XXXXXconnectAndSetUp');
            if(error)
                callback(error)
            else
                callback(null, device);
        });
*/
        callback( null, device );
    });

}



//=============================================================================
//========== TdTR4 ============================================================
//=============================================================================

var TdUp = require('../rembleD/up');
var TdDn = require('../rembleD/dn');

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

        //console.log('NB  TdTR4: FOR DEBUGGING GOT disconnect. Edit this to allow Auto Exit');
/*
        console.log('NB  TdTR4: FOR DEBUGGING GOT disconnect. Shutting down soon');

        setTimeout(function() {
            console.log('NB  Shutting Down ...  Bye')
            console.log('NB  ');
            process.exit(0)
        }, 5000);
*/        
    });

   
    //========== DN ==========
    //device.on('d_cfm_Change', (buffer) => { console.log('NB  GOT D_CFM', buffer); });
    device.on('d_cfm_Change', this.dn.Get_on_d_cfm() ); // .on -> addListener    //device.removeListener('d_cfm_Change', Remble.On_D_CFM_0 ); //.off = X removeListener
    //========== UP ==========
    //device.on('u_cmd_Change', (buffer) => { console.log('NB  GOT U_CMD', buffer); });
    //device.on('u_dat_Change', (databufferAndDevice) => { console.log('NB  GOT U_DAT', databufferAndDevice); });
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
        //console.log('NB  up.on(up:packet ...) in TdTR4 funcion contructor: status -> ', status)
        //console.log('NB  ')
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
    //console.log('NB  TdTR4.prototype.connect()');
    //console.log('NB  TdTR4.prototype.connect() this.device =', this.device);
    //var that = this;

    this.device.connectAndSetUp( function(error) {
        //console.log('NB  connectAndSetUp callback');
        if(error)
            callback(error)

        //console.log('NB  connectAndSetUp callback this.device =', this.device);
        
        //========== DN ==========
        this.device.notify_D_CFM(function(error) {
        //that.device.notify_D_CFM(function(error) {
            if(error)
                console.log('NB  set notify D_CFM error : ' + error);
        });
    
        //========== UP ==========
        this.device.notify_U_CMD(function(error) {
        //that.device.notify_U_CMD(function(error) {
            if(error)
                console.log('NB  set notify U_CMD error : ' + error);
        });
        this.device.notify_U_DAT(function(error) {
        //that.device.notify_U_DAT(function(error) {
            if(error)
                console.log('NB  set notify U_DAT error : ' + error);
        });

        this.emit('tr4:connected', this.id );
        callback(null);

    }.bind(this) );
}

TdTR4.prototype.disconnect = function()
{
    this.device.disconnect( (param) => {
        //console.log('NB  device.disconnect returns a param = ',param)
    })
}

/*
TdTR4.prototype.dummySend = function()
{
    console.log('NB  TdTR4.prototype.dummySend()');
    var D_CMD_pkt = new Buffer([1,1,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
    var D_DAT_pkt = new Buffer([0,0,0,0, 0x01, 0x9e,0x00, 0x00,0x00 ,0xce,0x94, 0x01,0x02, 0,0,0,0,0,0,0 ]);

    this.device.write_D_CMD( D_CMD_pkt, function(status) {
        console.log('NB  write_D_CMD status = ' + status);
        this.device.write_D_DAT( D_DAT_pkt, function(status) {
            console.log('NB  write_D_DAT status = ' + status);
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
    console.log('NB  TdTR4.prototype.properSend()');
    var pkt = new Buffer( [0x01, 0x9e,0x00, 0x00,0x00 ,0xce,0x94] );

    this.canSend = false;
    this.canSendCount++;
    console.log('NB  properSend: canSend =', this.canSend)
    console.log('NB  properSend: canSendCount =', this.canSendCount)
    this.dn.Send(pkt);
   
    let theUp = this.up;
    console.log('NB  [[[P]]] 0')
    var eventBHappened = new Promise( function( resolve ){

        console.log('NB  [[[P]]] Start')

        theUp.once('up:packet',(status, id_pkt) => { 
            console.log('NB  [[[P]]] up.on(up:packet ...) -> ', status)
            console.log('NB  [[[P]]] ')
            this.canSend = true;
            //this.canSendCount++;
            if(status) resolve(status, id_pkt)
            else reject("error")
        })
    })
    console.log('NB  [[[P]]] 1')
    
    //eventBHappened.then( function(){ 
    //    console.log('NB  [[[P]]] 2')
    //})

    async function f1(that) {
        var x = await eventBHappened;
        console.log('NB  awaited, and got -> ', x); // 10
        //this.canSendCount++;
        console.log('NB  f1: canSend =', that.canSend)
        console.log('NB  f1: canSendCount =', that.canSendCount)
        if(that.canSendCount < 3)
            that.properSend();
        else {
            that.disconnect();
            console.log('NB  this = ' + this + 'that = ' + that );
            //console.log('NB  this = ', this );
            //console.log('NB  that = ', that );
        }
        return(x);
    }

    console.log('NB  [[[P]]] 3')
    var wtf_rv = f1(this);
    console.log('NB  [[[P]]] 4 // wtf_rv =', wtf_rv)
}
*/
//=============================================================================
//========== TdTR4 ============================================================
//=============================================================================



//=============================================================================
//========== DFU ==============================================================
//=============================================================================
/*
//# Service UUID. 
        public const String UUID_DFU_SERVICE_2 = "00001530767D48F2864CD13ACA6CC1AA"; //old 000015301212EFDE1523785FEABCD124
        //# Characteristic UUID
        public const String UUID_DFU_PACKET_CHARACTERISTIC_2 = "00001532767D48F2864CD13ACA6CC1AA"; //old 000015321212EFDE1523785FEABCD124
        public const String UUID_DFU_CONTROL_STATE_CHARACTERISTIC_2 = "00001531767D48F2864CD13ACA6CC1AA"; //old 000015311212EFDE1523785FEABCD124
*/
util.inherits(TdDFU, events.EventEmitter);

function TdDFU( device, id )
{
    this.id = id;
    this.device = device;

    this.canSendCount = 0;
    this.canSend = true;


    this.device.on('disconnect', () => {
        this.emit('dfu:disconnected', this.id);

        console.log('NB  TdDFU: FOR DEBUGGING GOT disconnect. Edit this to allow Auto Exit');
/*
        console.log('NB  TdDFU: FOR DEBUGGING GOT disconnect. Shutting down soon');

        setTimeout(function() {
            console.log('NB  Shutting Down ...  Bye')
            console.log('NB  ');
            process.exit(0)
        }, 5000);
*/        
    });

   
    device.on('dfu_control_Change', (blk) => { console.log('TdDFU - .on dfu_control_Change') } ) ; //this.dn.Get_on_d_cfm() ); // .on -> addListener    //device.removeListener('d_cfm_Change', Remble.On_D_CFM_0 ); //.off = X removeListener
    device.on('dfu_packet_Change', (blk) => {console.log('TdDFU - .on dfu_packet_Change')} ) ; //this.dn.Get_on_d_cfm() ); // .on -> addListener    //device.removeListener('d_cfm_Change', Remble.On_D_CFM_0 ); //.off = X removeListener


    this.write_DFU_CONTROL_Binded =  this.write_DFU_CONTROL.bind(this);
    this.write_DFU_PACKET_Binded =  this.write_DFU_PACKET.bind(this);
/*
    this.up.on('up:packet', (status, id_pkt) => { 
        //console.log('NB  up.on(up:packet ...) in TdDFU funcion contructor: status -> ', status)
        //console.log('NB  ')
        this.emit('dfu:upPacket', status, id_pkt );
        //this.disconnect(); // to terminate
    })
*/
}

TdDFU.prototype.write_DFU_PACKET = function(pkt, callback) {
    this.device.write_DFU_PACKET( pkt, function(status) {
        callback(null, status);
    });
};
TdDFU.prototype.write_DFU_CONTROL = function(pkt, callback) {
    this.device.write_DFU_CONTROL( pkt, function(status) {
        callback(null, status);
    });
};


TdDFU.prototype.connect = function(callback)
{
    //console.log('NB  TdDFU.prototype.connect()');
    //console.log('NB  TdDFU.prototype.connect() this.device =', this.device);
    //var that = this;

    this.device.connectAndSetUp( function(error) {
        //console.log('NB  connectAndSetUp callback');
        if(error)
            callback(error)

        //console.log('NB  connectAndSetUp callback this.device =', this.device);
        
        this.device.notify_DFU_CONTROL(function(error) {
            if(error)
                console.log('NB  set notify DFU_CONTROL error : ' + error);
        });
    
        this.emit('dfu:connected', this.id );
        callback(null);

    }.bind(this) );
}
TdDFU.prototype.afterDeviceConnected = function(callback)
{
    this.device.notify_DFU_CONTROL(function(error) {
        if(error)
            console.log('NB  set notify DFU_CONTROL error : ' + error);
    });

    this.device.read_DFU_ID_BOGUS(function(error, data) {
        if(error) {
            console.log('NB  read_DFU_ID_BOGUS error : ' + error);
            return;
        }

        console.log('NB  ================================================================================');
        console.log('NB  ');
        console.log('NB  read_DFU_ID_BOGUS data.length : ', data.length );
        console.log('NB  read_DFU_ID_BOGUS data : ', JSON.stringify(data) );
        console.log('NB  ');
        console.log('NB  ================================================================================');
        
    });
    
    this.emit('dfu:connected', this.id );
    callback(null);

}



TdDFU.prototype.disconnect = function()
{
    this.device.disconnect( (param) => {
        console.log('NB  device.disconnect returns a param = ',param)
    })
}

/*
TdDFU.prototype.dummySend = function()
{
    console.log('NB  TdDFU.prototype.dummySend()');
    var D_CMD_pkt = new Buffer([1,1,9,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
    var D_DAT_pkt = new Buffer([0,0,0,0, 0x01, 0x9e,0x00, 0x00,0x00 ,0xce,0x94, 0x01,0x02, 0,0,0,0,0,0,0 ]);

    this.device.write_D_CMD( D_CMD_pkt, function(status) {
        console.log('NB  write_D_CMD status = ' + status);
        this.device.write_D_DAT( D_DAT_pkt, function(status) {
            console.log('NB  write_D_DAT status = ' + status);
        });
    });
}
*/

TdDFU.prototype.SendPacket = function(pkt, callback)
{
    this.dn.Send(pkt);
    callback(null);
}

//=============================================================================
//========== DFU ==============================================================
//=============================================================================

const EventEmitter = require('events');

class NB extends EventEmitter {

    constructor() {
        super();

        this.device = null;
        this.device__connected = false;

        this.bogusNobleStateChangeThing();
    }

    print_hello() {
        console.log('NB  ');
        console.log('NB                     Hello');
        console.log('NB  ');
    }


    //-------------------------------------------------------------------------
    //----- Connect to a device ------
    _onConnect( error ) {
        console.log('NB  ##### _onConnect ########################################## error =', error);
        //if(!error) {
            this.device__connected = true;
            this.device.discoverServicesAndCharacteristics( (error) => {       
                //console.log('NB  ##### discoverServicesAndCharacteristics ################## error =', error);
                //if(!error) {
                    this.device.removeListener('disconnect', this._onDisconnect.bind(this) );
                    this.device.on('disconnect', this._onDisconnect.bind(this) );
                    this.emit('nb_connected', {id : this.device.id} );
                //}
            });
        //}
    }
    _onDiscover(device) {
        //console.log('NB  ###########################################################');
        this.device = device;
        this.device.connect( this._onConnect.bind(this) );
    }

    reconnect( id ) {
/**/        
        var uuid = 'dcb326b6e893';
        var address = 'dc:b3:26:b6:e8:93';
        var addressType = 'random';
        var connectable = true;
        var advertisement = {   localName: 'Nordic_HRM',
                                txPowerLevel: undefined,
                                manufacturerData: undefined,
                                serviceData: [],
                                serviceUuids: [ '180d', '180f', '180a' ],
                                solicitationServiceUuids: [],
                                serviceSolicitationUuids: [] };
        var  rssi = -43;
        //console.log('');
        //console.log('');
        //console.log('this =', this);
        //console.log('');
        //console.log('');

        var _noble = this.device._peripheral._noble;
        //var _noble = this.noble;
        _noble._peripherals[id] = null; //uuid
        _noble._discoveredPeripheralUUids = [];
        
        NobleBeef.discover( this._onDiscover.bind(this) );

        _noble.onDiscover(uuid, address, addressType, connectable, advertisement, rssi);
          
/**/
/*
        this._events = {};
        this._eventsCount = 0;
        //idOrLocalName = id;
        this._onDiscover(this.device);
*/
    }
    connect( id ) {
        idOrLocalName = id;
        //console.log('NB  ###########################################################');
        NobleBeef.discover( this._onDiscover.bind(this) );
    }

    //-------------------------------------------------------------------------
    //----- Disconnect from a device ------
    _onDisconnect() {
        console.log('NB  ##### _onDisconnect #######################################');
        this.emit('nb_disconnected', {id : this.device.id} );
        //this.device = null;
        // can't call this here, gives 'noble warning: unknown peripheral dcb326b6e893'    this.notify_off_dfu();
        this.device__connected = false;
    }
    disconnect( id ) { //id not used at present
        if(this.device__connected == true) {
            this.device.disconnect( () => {} );
        }
    }

    

    //-------------------------------------------------------------------------
    //----- DFU Notify On/Off ------
    _onServiceChangedNotify( blk ) {
        //var blk = { data : data, device : this};
        var data = blk.data;
        var device = blk.device;
        // TODO Send to upper layers
        this.emit('nb_serviceChangeNotify', { data: data, id : this.device.id} );
    }

    notify_on_serviceChanged() {
        const that = this;
        this.device.notify_GAT_SERVICE_CHANGED(function(error) {
            if(error) {
                console.log('NB  set notify GAT_SERVICE_CHANGED error : ' + error);
            } else {
                console.log('NB  set notify GAT_SERVICE_CHANGED OK');
                //var blk = { data : data, device : this};
                //this.device.on('gat_service_Change', this._onServiceChangedNotify.bind(this) );        
                that.device.on('gat_service_Change', that._onServiceChangedNotify.bind(that) );        
            }            
        });
    }
    notify_off_serviceChanged() {
        this.device.unnotify_GAT_SERVICE_CHANGED(function(error) {
            if(error) {
                console.log('NB  set unnotify GAT_SERVICE_CHANGED error : ' + error);
            } else {

            }
        });
    }
    
    //-------------------------------------------------------------------------
    //----- DFU Notify On/Off ------
    _onDfuControlNotify( blk ) {
        //var blk = { data : data, device : this};
        var data = blk.data;
        var device = blk.device;
        //THIN console.log('....<<<< _onDfuControlNotify blk.data =', blk.data);
        this.emit('nb_dfuCtrlNotify', { data: data, id : this.device.id} );
    }

    notify_on_dfu( callback ) {
        this._onDfuControlNotify_binded = this._onDfuControlNotify.bind(this);
        const that = this;
        that.device.notify_DFU_CONTROL(function(error) {
            if(error) {
                console.log('NB  set notify DFU_CONTROL callback error : ' + error);
            } else {
                //console.log('NB  set notify DFU_CONTROL callback OK');
                //var blk = { data : data, device : this};
                that.device.removeListener('dfu_control_Change', that._onDfuControlNotify_binded );
                that.device.on('dfu_control_Change', that._onDfuControlNotify_binded );
            }            
            callback( error );
        })
    }
    notify_off_dfu() {
        this.device.unnotify_DFU_CONTROL(function(error) {
            if(error) {
                console.log('NB  set unnotify DFU_CONTROL error : ' + error);
            } else {
                //console.log('NB  set notify DFU_CONTROL OK');
            }
            //var blk = { data : data, device : this};
            that.device.removeListener('dfu_control_Change', that._onDfuControlNotify_binded );
        });
    }
    
    //-------------------------------------------------------------------------
    //----- DFU Control Write ------
    write_dfu_control( pkt, callback ) {
        if(this.device == null) {
            callback('device not connected');
            return;
        }
        if(this.device__connected == false) {
            callback('device not connected');
            return;
        }
        this.device.write_DFU_CONTROL( pkt, function(status) {
            //console.log('NB  write_dfu_control status : ' + status);
            callback( status );
        })
    }


    //-------------------------------------------------------------------------
    //----- DFU Data Write ------
    write_dfu_packet( pkt, callback ) {
        if(this.device == null) {
            callback('device not connected');
            return;
        }
        if(this.device__connected == false) {
            callback('device not connected');
            return;
        }
        this.device.write_DFU_PACKET( pkt, function(status) {
            //console.log('NB  write_dfu_packet status : ' + status);
            callback( status );
        });
    }    

    
    //---------- xxxx ----------
    dummy_test_readDeviceName( callback ) {
        if(this.device) {
            if(this.device__connected == true) {
                console.log('NB  readDeviceName');
                this.device.readDeviceName(function(error, deviceName) {
                    console.log('NB  \tdevice name = ' + deviceName);
                    callback();
                });
            }
        }
    }

    deadSimple( id ) {      

        idOrLocalName = id;

        NobleBeef.startScanning(); //noble.startScanning();
        var delay = 5;
        setTimeout(function(){

            NobleBeef.stopScanning(); //noble.stopScanning();

            delay = 1;
            setTimeout(function(){

                console.log('NB  GO GO GO');
                console.log('NB  GO GO GO');
                console.log('NB  GO GO GO');


                NobleBeef.discover(function(testDevice) {
                // 1 utils.js (72)  constructor.discover = function(callback) {
                // 2 utils.js (48)  constructor.discoverAll = function(callback) {

                // n. util.js (26) hci->gap->noble [add to peripheral array] -> this
                // x    constructor.onDiscover = function(peripheral) {
                //          if (constructor.is(peripheral)) {                   -> calls our NobleBeef.is overide
                //              var device = new constructor(peripheral);       -> true -> create a new NobleBeef(peripheral)
                //              constructor.emitter.emit('discover', device);   -> inform of dicovery
                //          }
                //      };
                console.log('NB  found ' + testDevice.id);

                console.log('NB  =============================================================================')
                console.log('NB  =============================================================================')
                console.log('NB  NobleBeef =', NobleBeef);
                console.log('NB  =============================================================================')
                console.log('NB  =============================================================================')
                console.log('NB  testDevice =', testDevice);
                console.log('NB  =============================================================================')
                console.log('NB  =============================================================================')

                testDevice.on('disconnect', function() {
                    console.log('NB  disconnected!');
                    process.exit(0);
                });

                async.series([
                    function(callback) {
                        console.log('NB  connect');
                        testDevice.connect(callback);
                    },
                    function(callback) {
                        console.log('NB  discoverServicesAndCharacteristics');
                        testDevice.discoverServicesAndCharacteristics(callback);
                    },
                    function(callback) {
                        console.log('NB  readDeviceName');
                        testDevice.readDeviceName(function(error, deviceName) {
                        console.log('NB  \tdevice name = ' + deviceName);
                        callback();
                        });
                    },
                    function(callback) {
                        console.log('NB  =============================================================================')
                        console.log('NB  testDevice =', testDevice);
                        console.log('NB  =============================================================================')
                        console.log('NB  =============================================================================')
                                console.log('NB  disconnect');
                        testDevice.disconnect(callback);
                    }
                    ]
                );
                });

            }, delay*1000);
        }, delay*1000);  
    }

    bogusNobleStateChangeThing() {
        var noble = require('noble') //NobleDevice.noble;
        noble.on('stateChange', function(state) {
            console.log('NB  noble.on(-stateChange-): (state, initialized) =', state, noble.initialized) ;
            if (state === 'poweredOn') {
                console.log('NB  noble.on(-stateChange-):     poweredOn state =', state)
                //rb.processCmd('proc_Start', { id: 'd81e6c802446' })
                //noble.startScanning();
            } else {
                console.log('NB  noble.on(-stateChange-): NOT poweredOn state =', state)
                //noble.stopScanning();
            }
        });
    }

}

module.exports = { NB }
