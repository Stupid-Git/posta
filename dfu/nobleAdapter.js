

var NobleBeef = require('./nobleBeef');
const EventEmitter = require('events');

class nobleAdapter extends EventEmitter {

    constructor()
    {
        super();

        this.nb = new NobleBeef.NB();

        this._init();
    }

    _init() {
        this._devices = {};
        this._services = {};
        this._characteristics = {};
        this._descriptors = {};

        //this._converter = new Converter(this._bleDriver, this._adapter);

        this._gapOperationsMap = {};
        this._gattOperationsMap = {};

        this._preparedWritesMap = {};

        this._pendingNotificationsAndIndications = {};


        this.callback_onConnected = null;
        this._devices = [];


        this.oneTwo = 1;
        this._onDfuNotify_binded = this._onDfuNotify.bind(this);
    }
    
    //adapter.on('logMessage', (severity, message) => { if (severity > 3) console.log(`${message}`); });
    //adapter.on('error', error => console.log(`error: ${JSON.stringify(error)}`));
    //adapter.on('deviceDisconnected', device => console.log(`Device ${device.address}/${device.addressType} disconnected.`));
    //adapter.on('deviceDiscovered', device => console.log(`Discovered device ${device.address}/${device.addressType}.`));
    //adapter.on('deviceConnected', device => console.log(`Device ${device.address}/${device.addressType} connected.`));

    init() {
        noble.on('stateChange', onstateChange );
    }
    
    onstateChange (state) {
        console.log('[4] nobleAdapter: noble onstateChange', state );
    }

    // This is call by dfu.js like this  adapter.open({ baudRate, logLevel: 'error' }, err => {
    open( options, callback) { 
        
        var baudRate = options.baudRate; //unused
        var logLevel = options.logLevel; 
        console.log('[4] nobleAdapter: open baudRate =', baudRate + ', logLevel =', logLevel );
        
        var err = null; // return null if no error
        if(callback)
            callback( err );
    }

    close(callback) {
        console.log('[4] nobleAdapter: close');
        
        var err = null; // return null if no error
        if(callback)
            callback( err );
    }



    _fakeOnConnectionReceived() {
        console.log('[4] nobleAdapter: _fakeOnConnectionReceived');

        const dummyDevice = {};
        dummyDevice.instanceId = 42;

        var err = null;
        var device = dummyDevice;
        this.callback_onConnected(err, device);
    }


    _onServiceChange( data_id) {
        console.log('[4] nobleAdapter: _onServiceChange: data_id =', data_id);
    }

    //-------------------------------------------------------------------------
    //----- vnbv -----
    _onDfuNotify( data_id) {
        //THIN console.log('[4] nobleAdapter: _onDfuNotify: data_id =', data_id);
        this.emit('controlNotification', data_id.data );
    }
    Adapter_TurnOnControl_Notifications( callback ) {
        var error;
        error = { message: 'Adapter_TurnOnControl_Notifications failed'}
        error = null;
        this.nb.removeListener('nb_dfuCtrlNotify', this._onDfuNotify_binded );
        this.nb.notify_on_dfu((status) => {
            this.nb.on('nb_dfuCtrlNotify', this._onDfuNotify_binded );
            callback( error );
        });
    }

    Adapter_WriteControl_Packet( pkt, callback ) {
        //THIN console.log('[4] nobleAdapter: Adapter_WriteControl_Packet: pkt =', pkt);
        var error;
        //var pkt = new Buffer( [0x01, 0x04]);
        this.nb.write_dfu_control( pkt, (status) => {
            if(status) {
                console.log('[4] nobleAdapter: write_dfu_control: (bad) status =', status);
                error = { message: 'Adapter_WriteControl_Packet failed. Status = ' + status};
            } else {
                //THIN console.log('[4] nobleAdapter: write_dfu_control: OK');
                error = null;
            }
            callback( error );
        } );
    }
    Adapter_WriteData_Packet( pkt, callback ) {
        //THIN console.log('[4] nobleAdapter: Adapter_WriteData_Packet: pkt =', pkt);
        var error;
        //var pkt = new Buffer( [0x01, 0x04]);
        this.nb.write_dfu_packet( pkt, (status) => {
            if(status) {
                console.log('[4] nobleAdapter: write_dfu_data: (bad) status =', status);
                error = { message: 'Adapter_WriteData_Packet failed. Status = ' + status};
            } else {
                //THIN console.log('[4] nobleAdapter: write_dfu_data: OK');
                error = null;
            }
            callback( error );
        } );
    }
    

    dummy_Start( oneTwo )
    {
        var opcode = 0x01; //start_dfu
        var pgmMode = 0x04;
        //var pkt = new Uint8Array( [0x01, 0x04]);
        var pkt;
        let that = this;

        setTimeout( function() {

            that.nb.notify_on_serviceChanged();
            that.nb.notify_on_dfu( () => {} );
            if( oneTwo == 1) {
                //that.nb.on('nb_dfuCtrlNotify', that._onDfuNotify.bind(that) );
                that.nb.on('nb_dfuCtrlNotify', that._onDfuNotify_binded );
                that.nb.on('nb_serviceChangeNotify', that._onServiceChange.bind(that) );
            }
            if( oneTwo == 2) {
                that.nb.removeListener('nb_dfuCtrlNotify', that._onDfuNotify_binded );
                that.nb.on('nb_dfuCtrlNotify', that._onDfuNotify_binded );
            }


            setTimeout( function() {
                pkt = new Buffer( [0x01, 0x04]);
                that.nb.write_dfu_control( pkt, (status) => {
                    if(status) {
                        console.log('[4] nobleAdapter: write_dfu_control: (bad) status =', status)
                    }
                } );

                if( oneTwo == 2) {
                    setTimeout( function() {
                        pkt = new Buffer( [0x00, 0x00, 0x00, 0x00,   0x00, 0x00, 0x00, 0x00,  0x58, 0x7D, 0x00, 0x00]);
                        that.nb.write_dfu_packet( pkt, (status) => {
                            if(status) {
                                console.log('[4] nobleAdapter: write_dfu_packet: (bad) status =', status)
                            }
                        } );
                        
                    }, 1000 );
                }
        
            }, 1000 );
    
        }, 1000 );



    }

    // 0x1801, 0x2a05
    _on_nb_disconnect() {
        console.log('[4] nobleAdapter: _on_nb_disconnect');
        if(this.oneTwo == 1) {
            this.oneTwo = 2;
            this.connect2();
        }
    };

    connect2() {
        console.log('');
        console.log('[4] nobleAdapter: Going to reconnect. Please wait ....');
        console.log('');
        let that = this;
        setTimeout( function() {
            console.log('[4] nobleAdapter: Trying to reconnect.');
            console.log('');
            that.nb.reconnect('notused'); //Nordic Dev Board
            //that.nb.connect('dcb326b6e893'); //Nordic Dev Board
            //that.nb.connect('dcb326b6e894'); //Nordic Dev Board PLUS ONE
        }, 2000 );
    }

    connect_testing(addressParams, options, callback) {

        console.log('[4] nobleAdapter: connecting');

       this.nb.on('nb_connected', () => {
            console.log('[4] nobleAdapter: connected');

            if(this.oneTwo == 1) {
                this._fakeOnConnectionReceived();
            }

            this.dummy_Start(this.oneTwo);
            /*
            this.nb.dummy_test_readDeviceName( () => {
                console.log('[4] nobleAdapter: 111 &&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
                this.nb.disconnect();
            });
            */
        });

        this.nb.on('nb_disconnected', this._on_nb_disconnect.bind(this) );
        

        this.nb.print_hello();
        this.nb.connect('dcb326b6e893'); //Nordic Dev Board
        //this.nb.connect('d81e6c802446'); //My Tr41
        
        //this.nb.deadSimple('d81e6c802446');

        //setTimeout( this._fakeOnConnectionReceived.bind(this), 2000);
        this.callback_onConnected = callback; //.bind(this); // => this.callback_onConnected(err, device)
    }

    getDevices() { //Official
        /*
        const device = new Device(deviceAddress, deviceRole);

        device.connectionHandle = event.conn_handle;
        device.minConnectionInterval = connectionParameters.min_conn_interval;
        device.maxConnectionInterval = connectionParameters.max_conn_interval;
        device.slaveLatency = connectionParameters.slave_latency;
        device.connectionSupervisionTimeout = connectionParameters.conn_sup_timeout;

        device.connected = true;
        this._devices[device.instanceId] = device;
        */
        /*
        // FAKE
        var devices = [];
        var device = {};
        device.address = '00:11:22:33:44:55';
        device.connected = true;
        devices.push( device );
        return( devices );
        */
        return( this._devices );
    }

    _Official_on_nb_connected() {


        var device = {};
        device.instanceId = 42;
        device.address = '00:11:22:33:44:55';
        device.connected = true;

        this._devices = [];
        this._devices[device.instanceId] = device;

        var err = null;
        //console.log('[4] nobleAdapter: on_nb_connected')
        this.callback_onConnected(err, device);
    }
    
    _Official_on_nb_disconnect() {
        this._devices = [];
        
        var device = { address : '00:11:22:33:44:55', addressType : 'bogusaddressType', instanceId: 42} ;

        this.emit('deviceDisconnected', device );
    }
    

    connect(addressParams, options, callback) { //Official (err, device) => { // ref _fakeOnConnectionReceived
        /*
        const options = {
            scanParams: DEFAULT_SCAN_PARAMS,
            connParams: DEFAULT_CONNECTION_PARAMS,
        };
        const addressParams = {
            address: targetAddress,
            type: targetAddressType,
        };
        */

       // console.log('[4] nobleAdapter: connect');

        this.nb.on('nb_connected', this._Official_on_nb_connected.bind(this) );

        this.nb.on('nb_disconnected', this._Official_on_nb_disconnect.bind(this) );
        

        this.nb.connect('dcb326b6e893'); //Nordic Dev Board
        //this.nb.connect('d81e6c802446'); //My Tr41
        
        this.callback_onConnected = callback; //.bind(this); // => this.callback_onConnected(err, device)
        //callback( err, device );
    };

    bogusreconnect(addressParams, options, callback) { //Official (err, device) => { // ref _fakeOnConnectionReceived
        /*
        const options = {
            scanParams: DEFAULT_SCAN_PARAMS,
            connParams: DEFAULT_CONNECTION_PARAMS,
        };
        const addressParams = {
            address: targetAddress,
            type: targetAddressType,
        };
        */

        //console.log('[4] nobleAdapter: bogusreconnect');

        //console.log('');
        //console.log('[4] nobleAdapter: Going to reconnect. Please wait ....');
        //console.log('');
        let that = this;
        setTimeout( function() {
            //console.log('[4] nobleAdapter: Trying to reconnect.');
            console.log('');
            that.nb.reconnect('notused'); //Nordic Dev Board
            //that.nb.connect('dcb326b6e893'); //Nordic Dev Board
            //that.nb.connect('dcb326b6e894'); //Nordic Dev Board PLUS ONE
        }, 2000 );

/*
        this.nb.on('nb_connected', this._Official_on_nb_connected.bind(this) );
        this.nb.on('nb_disconnected', this._Official_on_nb_disconnect.bind(this) );
        this.nb.connect('dcb326b6e893'); //Nordic Dev Board
        //this.nb.connect('d81e6c802446'); //My Tr41
*/        
        this.callback_onConnected = callback; //.bind(this); // => this.callback_onConnected(err, device)
        //callback( err, device );
    };

}


module.exports = nobleAdapter;
