



/*
// Must be lower case for noble
//ref: var TUDS_SERVICE_UUID                = '6e400001b5a3f393e0a9e50e24dcca42';
var UUID_DFU_SERVICE_2                      = "00001530767d48f2864cd13aca6cc1aa"; //old 000015301212EFDE1523785FEABCD124
var UUID_DFU_PACKET_CHARACTERISTIC_2        = "00001532767d48f2864cd13aca6cc1aa"; //old 000015321212EFDE1523785FEABCD124
var UUID_DFU_CONTROL_STATE_CHARACTERISTIC_2 = "00001531767d48f2864cd13aca6cc1aa"; //old 000015311212EFDE1523785FEABCD124
var UUID_DFU_ID_BOGUS_CHARACTERISTIC_2      = "00001534767d48f2864cd13aca6cc1aa"; //old 000015311212EFDE1523785FEABCD124
// 1532 WriteWithoutResponse
// 1531 Write, Notify
// 1534 Read
*/

var UUID_DFU_SERVICE_2                      = "000015301212efde1523785feabcd123"; //old 000015301212EFDE1523785FEABCD124
var UUID_DFU_PACKET_CHARACTERISTIC_2        = "000015321212efde1523785feabcd123"; //old 000015321212EFDE1523785FEABCD124
var UUID_DFU_CONTROL_STATE_CHARACTERISTIC_2 = "000015311212efde1523785feabcd123"; //old 000015311212EFDE1523785FEABCD124
var UUID_DFU_ID_BOGUS_CHARACTERISTIC_2      = "000015341212efde1523785feabcd123"; //old 000015311212EFDE1523785FEABCD124



function TandD_DfuService() {
}

//-----------------------------------------------------------------------------
//----- DFU_PACKET -----
TandD_DfuService.prototype.write_DFU_PACKET = function(data20, callback) {
    //THIN console.log('....>>>> WRITE DFU PACKET data20 =', data20);
    this.writeDataCharacteristic(UUID_DFU_SERVICE_2, UUID_DFU_PACKET_CHARACTERISTIC_2, data20, function( status) {
        callback(status);
    });
};

//-----------------------------------------------------------------------------
//----- DFU_CONTROL -----
TandD_DfuService.prototype.write_DFU_CONTROL = function(data20, callback) {
    //THIN console.log('....>>>> WRITE DFU CONTROL data20 =', data20);
    this.writeDataCharacteristic(UUID_DFU_SERVICE_2, UUID_DFU_CONTROL_STATE_CHARACTERISTIC_2, data20, function( status) {
        callback(status);
    });
};

//----- DFU_CONTROL -----
TandD_DfuService.prototype.notify_DFU_CONTROL = function(callback) {
    this.on_DFU_CONTROL_Binded = this.on_DFU_CONTROL.bind(this);
    this.notifyCharacteristic(UUID_DFU_SERVICE_2, UUID_DFU_CONTROL_STATE_CHARACTERISTIC_2, true, this.on_DFU_CONTROL_Binded, callback);
};
TandD_DfuService.prototype.unnotify_DFU_CONTROL = function(callback) {
    this.on_DFU_CONTROL_Binded = this.on_DFU_CONTROL.bind(this);
    this.notifyCharacteristic(UUID_DFU_SERVICE_2, UUID_DFU_CONTROL_STATE_CHARACTERISTIC_2, false, this.on_DFU_CONTROL_Binded, callback);
};
TandD_DfuService.prototype.on_DFU_CONTROL = function(data) {
    var blk = { data : data, device : this};
    //console.log('TandD_DfuService on_DFU_CONTROL Notification')
    this.emit('dfu_control_Change', blk);
};

//-----------------------------------------------------------------------------
//----- DFU_ID_BOGUS -----

//UUID_DFU_ID_BOGUS_CHARACTERISTIC_2
TandD_DfuService.prototype.read_DFU_ID_BOGUS = function(callback) {
    this.readDataCharacteristic(UUID_DFU_SERVICE_2, UUID_DFU_ID_BOGUS_CHARACTERISTIC_2, function(error, data) {
        if (error) {
            return callback(error);
        }
        //var systemId = data.toString('hex').match(/.{1,2}/g).reverse().join(':');      
        //callback(null, systemId);
        callback(null, data);
    });
};

  
module.exports = TandD_DfuService;
