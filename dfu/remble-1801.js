var GENERIC_ATTRIBUTE_UUID         = '1801';
var SERVICE_CHANGED_UUID           = '2a05';

function GenericAttributeService() {
}

//----- GAT_SERVICE_CHANGED -----
GenericAttributeService.prototype.notify_GAT_SERVICE_CHANGED = function(callback) {
    this.on_GAT_SERVICE_CHANGED_Binded = this.on_GAT_SERVICE_CHANGED.bind(this);
    this.notifyCharacteristic(GENERIC_ATTRIBUTE_UUID, SERVICE_CHANGED_UUID, true, this.on_GAT_SERVICE_CHANGED_Binded, callback);
};
GenericAttributeService.prototype.unnotify_GAT_SERVICE_CHANGED = function(callback) {
    this.notifyCharacteristic(GENERIC_ATTRIBUTE_UUID, SERVICE_CHANGED_UUID, false, this.on_GAT_SERVICE_CHANGED_Binded, callback);
};
GenericAttributeService.prototype.on_GAT_SERVICE_CHANGED = function(data) {
    var blk = { data : data, device : this};
    this.emit('gat_service_Change', blk);
};

/* Examples
GenericAttributeService.prototype.readSystemId = function(callback) {
  this.readDataCharacteristic(GENERIC_ATTRIBUTE_UUID, SERVICE_CHANGED_UUID, function(error, data) {
    if (error) {
      return callback(error);
    }

    var systemId = data.toString('hex').match(/.{1,2}/g).reverse().join(':');

    callback(null, systemId);
  });
};

GenericAttributeService.prototype.readManufacturerName = function(callback) {
  this.readStringCharacteristic(GENERIC_ATTRIBUTE_UUID, MANUFACTURER_NAME_UUID, callback);
};
*/

module.exports = GenericAttributeService;
