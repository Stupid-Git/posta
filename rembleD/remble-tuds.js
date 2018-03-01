




//var TUDS_SERVICE_UUID       = '6E400001B5a3F393E0A9E50E24DCCA42';
var TUDS_SERVICE_UUID         = '6e400001b5a3f393e0a9e50e24dcca42';
var D_CMD_UUID                = '6e400002b5a3f393e0a9e50e24dcca42';
var D_DAT_UUID                = '6e400003b5a3f393e0a9e50e24dcca42';
var D_CFM_UUID                = '6e400004b5a3f393e0a9e50e24dcca42';
var U_CMD_UUID                = '6e400005b5a3f393e0a9e50e24dcca42';
var U_DAT_UUID                = '6e400006b5a3f393e0a9e50e24dcca42';
var U_CFM_UUID                = '6e400007b5a3f393e0a9e50e24dcca42';
/*
var SYSTEM_ID_UUID                  = '2a23';
var MODEL_NUMBER_UUID               = '2a24';
var SERIAL_NUMBER_UUID              = '2a25';
var FIRMWARE_REVISION_UUID          = '2a26';
var HARDWARE_REVISION_UUID          = '2a27';
var SOFTWARE_REVISION_UUID          = '2a28';
var MANUFACTURER_NAME_UUID          = '2a29';
*/
function TandDUpDnService() {
}



//============================== DN ==============================//
//----- D_CMD -----
TandDUpDnService.prototype.write_D_CMD = function(data20, callback) {
    this.writeDataCharacteristic(TUDS_SERVICE_UUID, D_CMD_UUID, data20, function( status) {
        callback(status);
    });
};


//----- D_DAT -----
TandDUpDnService.prototype.write_D_DAT = function(data20, callback) {
    this.writeDataCharacteristic(TUDS_SERVICE_UUID, D_DAT_UUID, data20, function( status) {
        callback(status);
    });
};


//----- D_CFM -----
TandDUpDnService.prototype.notify_D_CFM = function(callback) {
    //console.log('TandDUpDnService.prototype.notify_D_CFM');
    this.on_D_CFM_Binded = this.on_D_CFM.bind(this);
    this.notifyCharacteristic(TUDS_SERVICE_UUID, D_CFM_UUID, true, this.on_D_CFM_Binded, callback);
};

TandDUpDnService.prototype.unnotify_D_CFM = function(callback) {
    this.notifyCharacteristic(TUDS_SERVICE_UUID, D_CFM_UUID, false, this.on_D_CFM_Binded, callback);
};

TandDUpDnService.prototype.on_D_CFM = function(data) {
    this.emit('d_cfm_Change', data);
};







//============================== UP ==============================//
//----- U_CMD -----
TandDUpDnService.prototype.notify_U_CMD = function(callback) {
    //console.log('TandDUpDnService.prototype.notify_U_CMD');
    this.on_U_CMD_Binded = this.on_U_CMD.bind(this);
    this.notifyCharacteristic(TUDS_SERVICE_UUID, U_CMD_UUID, true, this.on_U_CMD_Binded, callback);
};

TandDUpDnService.prototype.unnotify_U_CMD = function(callback) {
    this.notifyCharacteristic(TUDS_SERVICE_UUID, U_CMD_UUID, false, this.on_U_CMD_Binded, callback);
};

TandDUpDnService.prototype.on_U_CMD = function(data) {
    this.emit('u_cmd_Change', data);
};


//----- U_DAT -----
TandDUpDnService.prototype.notify_U_DAT = function(callback) {
    this.on_U_DAT_Binded = this.on_U_DAT.bind(this);
    this.notifyCharacteristic(TUDS_SERVICE_UUID, U_DAT_UUID, true, this.on_U_DAT_Binded, callback);
};

TandDUpDnService.prototype.unnotify_U_DAT = function(callback) {
    this.notifyCharacteristic(TUDS_SERVICE_UUID, U_DAT_UUID, false, this.on_U_DAT_Binded, callback);
};

TandDUpDnService.prototype.on_U_DAT = function(data) {
	
	//var blk = { data : data, device : this.peripheral}; //undefined
	//var blk = { data : data, device : this.Peripheral};
	var blk = { data : data, device : this};
	//var blk = { data : data, device : Peripheral}; Peripheral not defined
	//var blk = { data : data, device : this.NobleDevice};
	//var blk = { data : data, device : NobleDevice};

    this.emit('u_dat_Change', blk);
    //this.emit('u_dat_Change', data);
};


//----- U_CFM -----
TandDUpDnService.prototype.write_U_CFM = function(data20, callback) {
    this.writeDataCharacteristic(TUDS_SERVICE_UUID, U_CFM_UUID, data20, function( status) {
        callback(status);
    });
};


module.exports = TandDUpDnService;


