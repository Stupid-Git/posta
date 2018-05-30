/* Copyright (c) 2010 - 2017, Nordic Semiconductor ASA
 *
 * All rights reserved.
 *
 * Use in source and binary forms, redistribution in binary form only, with
 * or without modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions in binary form, except as embedded into a Nordic
 *    Semiconductor ASA integrated circuit in a product or a software update for
 *    such product, must reproduce the above copyright notice, this list of
 *    conditions and the following disclaimer in the documentation and/or other
 *    materials provided with the distribution.
 *
 * 2. Neither the name of Nordic Semiconductor ASA nor the names of its
 *    contributors may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * 3. This software, with or without modification, must only be used with a Nordic
 *    Semiconductor ASA integrated circuit.
 *
 * 4. Any software provided in binary form under this license must not be reverse
 *    engineered, decompiled, modified and/or disassembled.
 *
 * THIS SOFTWARE IS PROVIDED BY NORDIC SEMICONDUCTOR ASA "AS IS" AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY, NONINFRINGEMENT, AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL NORDIC SEMICONDUCTOR ASA OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR
 * TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

/*
 * Uses the first found adapter to perform DFU. Target address and path to DFU zip
 * file (created by pc-nrfutil) must be given as command line parameters.
 *
 * In order for this to work, the the target device must have the Secure DFU
 * service. To program the target device, nrfjprog can be used:
 * nrfjprog -e -s <serial>
 * nrfjprog --program ./dfu/secure_dfu_secure_dfu_ble_s132_pca100040_debug.hex -s <serial>
 * nrfjprog -r -s <serial>
 *
 * Usage: node dfu.js <targetAddress> <pathToZip>
 */

//const api = require('../index');
const path = require('path');



var NobleBeef = require('./nobleBeef');
const EventEmitter = require('events');

class nobleAdapter extends EventEmitter {

    constructor()
    {
        super();
    }
    open( options, callback) { 
        
        var baudRate = options.baudRate; //unused
        var logLevel = options.logLevel; 
        console.log('[4] nobleAdapter: open baudRate =', baudRate + ', logLevel =', logLevel );
        
        var err = null; // return null if no error
        if(callback)
            callback( err );
    }
}


'use strict';

function splitArray(data, chunkSize) {
    if (chunkSize < 1) {
        throw new Error(`Invalid chunk size: ${chunkSize}`);
    }
    const chunks = [];
    for (let i = 0; i < data.length; i += chunkSize) {
        if (i + chunkSize >= data.length) {
            chunks.push(data.slice(i));
        } else {
            chunks.push(data.slice(i, i + chunkSize));
        }
    }
    return chunks;
}

//module.exports = {
//    splitArray,
//};

class BleTransport extends EventEmitter {
    constructor(transportParameters) //        (this._transportParameters);
    {
        super();
        this._transportParameters = transportParameters;
    }

    init() {     
        return Promise.resolve();   
    }

    destroy() {        
    }

    waitForControlNotify() {
        return new Promise((resolve, reject) => {

            //console.log('[3] bleTransport: waitForControlNotify()');
            //return Promise.resolve(); //TODO
            /* TODO */
            //this._debug('Waiting for target device to send a notification.');
            const TIMEOUT_MS = 10000;
    
    
            let timeout;
            const controlNotificationHandler = (PaRaM) => {
                console.log('[3] Got Notification PaRaM =', PaRaM);
                //this._debug('[3] Got Notification PaRaM =', PaRaM);

                clearTimeout(timeout);
                this./*_adapter.*/removeListener('controlNotification', controlNotificationHandler);
//console.log('[3] waitForControlNotify resolve()');
                resolve();
            };

            timeout = setTimeout(() => {
//console.log('[3] waitForControlNotify timeOut');
                this./*_adapter.*/removeListener('controlNotification', controlNotificationHandler);
                reject(createError(ErrorCode.NOTIFICATION_TIMEOUT,
                    'Timed out when waiting for Notification.'));
            }, TIMEOUT_MS);

            this./*_adapter.*/on('controlNotification', controlNotificationHandler);
        });
        /* */
    }

    XXX_FakeNotify(n) {
        let that = this;
        setTimeout( function() {
            that.emit('controlNotification', 'PaRaM ' + n.toString() + ' S = ' + that.S + 'GGGG');
        }, 100);
        return Promise.resolve();
    }

    _send_packet_data(currentPacket) {
        this.S += '.';
        return Promise.resolve()
    }
    XXX_send_firmware_chunk_packets(packets) {
        return packets.reduce((prevPromise, currentPacket) => {
            return prevPromise.then(() => this._send_packet_data(currentPacket));
        }, Promise.resolve());
    }

    XXX_send_firmware_chunk(chunk, idx) { //see sendStartPacket
        return new Promise((resolve, reject) => {
            //console.log("Sending 'Chunk' command");
            const packets = splitArray(chunk, this._packetSize);
            this.S = '';

            this.XXX_send_firmware_chunk_packets(packets)
            .then( () => this.XXX_FakeNotify(idx) )
            .then( () => this.waitForControlNotify( /*this.get_received_response, true, 10.0, 'response for START DFU'*/) )
            .then( () => { /*console.log('$%#&%#&%#%#%#');*/ resolve() }) ////WTFWTFWTF
        });
    }

    sendFirmware(data) {
        //data = data.slice(0, 2020); //BOGUS
        //data = data.slice(0, 420); //BOGUS
        
        this._lumpSize = 200;
        this._packetSize = 20;

        //console.log('[3] bleTransport: TODO sendFirmware(data)');
        //console.log('[3] bleTransport:                   data.length =', data.length);

        const lumps = splitArray(data, this._lumpSize);
        //console.log('[3] bleTransport:                  lumps.length =', lumps.length);

        return lumps.reduce( (prevPromise, currentLump, currentIndex, array) => {
            //console.log('[3] bleTransport:      lump.index =', currentIndex, 'lump.length =', currentLump.length);

            return prevPromise.then(() =>this.XXX_send_firmware_chunk(currentLump, currentIndex) );
            
        }, Promise.resolve() )

        // nothing below here is executed
        
        /*
        //var nums = [0, 1, 2, 3, 4];
        var nums = [ [0,0], [1,1], [2,2], [3,3], [4,4] ];
        //var nums = [ {[0,0]}, {[1,1]}, {[2,2]}, {[3,3]}, {[4,4]}];
        nums.reduce((accumulator, currentValue, currentIndex, array) => {
            console.log('    index =', currentIndex, 'currentValue =', currentValue, 'accumulator =', accumulator);
            //return accumulator + currentValue;
        //}, 10);
        }, 'initval');
        */

        //return Promise.resolve();

        /*TODO
        //TODO this._emitInitializeEvent(ObjectType.DATA);
        return this.getFirmwareState(data)
            .then(state => {
                this._debug(`Sending firmware: ${state.toString()}`);
                const objects = state.remainingObjects;
                if (state.hasResumablePartialObject) {
                    const object = state.remainingPartialObject;
                    return this._resumeWriteObject(object, ObjectType.DATA, state.offset, state.crc32).then(progress =>
                        this._createAndWriteObjects(objects, ObjectType.DATA, progress.offset, progress.crc32));
                }
                return this._createAndWriteObjects(objects, ObjectType.DATA, state.offset, state.crc32);
        });
        */
    }


}


'use strict';

const _ = require('underscore');
//const EventEmitter = require('events');
const fs = require('fs');
const JSZip = require('jszip');

const logLevel = require('./util/logLevel');

class nobleDfu extends EventEmitter {
    constructor(transportType, transportParameters) {
        super();
    }

    
    performDFU(zipFilePath, callback) {

        //if (this._state !== DfuState.READY) {
        //    throw new Error('Not in READY state. DFU in progress or aborting.');
        //}
        if (!zipFilePath) {
            throw new Error('No zipFilePath provided.');
        }
        if (!callback) {
            throw new Error('No callback function provided.');
        }

        this._log(logLevel.INFO, `Performing DFU with file: ${zipFilePath}`);
        //this._setState(DfuState.IN_PROGRESS);

        this._fetchUpdates(zipFilePath)
            .then(updates => this._performUpdates(updates))
            .then(() => {
                this._log(logLevel.INFO, 'DFU completed successfully.');
                //this._setState(DfuState.READY);
                callback();
            })
            .catch(err => {
                if (err.code === 42) { //} ErrorCode.ABORTED) {
                    this._log(logLevel.INFO, 'DFU aborted.');
                    callback(null, true);
                } else {
                    this._log(logLevel.ERROR, `DFU failed with error: ${err.message}.`);
                    callback(err);
                }
                //this._setState(DfuState.READY);
            });
    }

    _performUpdates(updates) {
        console.log('updates =', updates)
        return updates.reduce((prevPromise, update) => {
            return prevPromise.then(() => this._performSingleUpdate(update.datFile, update.binFile));
        }, Promise.resolve());
    }

    _performSingleUpdate(datFile, binFile) {
        //return Promise.resolve();

        return this._createBleTransport()
            .then(() => this._transferFirmware(binFile))
            .catch(err => {
                console.log('[2] _performSingleUpdate got an error =', err );
                //TODO this._destroyBleTransport();
                throw err;
            });
        /*
        return this._createBleTransport()
            .then(() => this._checkAbortState())
            .then(() => this._transferStartPacket(binFile)) //karel
            .then(() => this._transferInitPacket(datFile))
            .then(() => this._transferFirmware(binFile))
            .then(() => this._transferValidate())
            .then(() => this._transferActivate())
            .then(() => this._transport.waitForDisconnection())
            .then(() => this._destroyBleTransport())
            .catch(err => {
                console.log('[2] _performSingleUpdate got an error =', err );
                this._destroyBleTransport();
                throw err;
            });
            */
    }


    _transferFirmware(file) {
        this.emit('transferStart', file.name);
        /*
        return file.loadData().then(data => {
            return this._transport.getFirmwareState(data)
                .then(state => {
                    this._speedometer = new DfuSpeedometer(data.length, state.offset);
                    return this._transport.sendFirmware(data);
                })

                // * DFU transfer complete event.
                // *
                // * @event Dfu#transferComplete
                // * @type {Object}
                // * @property {string} file.name - The name of the file that was transferred.
                .then(() => this.emit('transferComplete', file.name));
        });
        */
       return file.loadData().then(data => {
            return this._transport.sendFirmware(data)
            // * DFU transfer complete event.
            // *
            // * @event Dfu#transferComplete
            // * @type {Object}
            // * @property {string} file.name - The name of the file that was transferred.
            .then(() => this.emit('transferComplete', file.name));
        });
    }
    



    
    _createBleTransport() {
        return Promise.resolve()
            .then(() => {
                this._log(logLevel.DEBUG, 'Creating DFU transport.');
                this._transport = new BleTransport(this._transportParameters);
                this._setupTransportListeners();
                return this._transport.init();
            });
    }

    _destroyBleTransport() {
        if (this._transport) {
            this._log(logLevel.DEBUG, 'Destroying DFU transport.');
            this._removeTransportListeners();
            this._transport.destroy();
            this._transport = null;
        } else {
            this._log(logLevel.DEBUG, 'No DFU transport exists, so nothing to clean up.');
        }
    }

    _setupTransportListeners() {
        const progressInterval = 1000;
        const onProgressUpdate = _.throttle(progressUpdate => {
            this._handleProgressUpdate(progressUpdate);
        }, progressInterval);

        const onLogMessage = (level, message) => {
            this._log(level, message);
        };

        this._transport.on('progressUpdate', onProgressUpdate);
        this._transport.on('logMessage', onLogMessage);
    }

    _removeTransportListeners() {
        this._transport.removeAllListeners('progressUpdate');
        this._transport.removeAllListeners('logMessage');
    }
















   /**
    * Get promise for manifest.json from the given zip file.
    * This function is a wrapper for getManifest().
    *
    * @param {string} zipFilePath Path of the zip file.
    * @returns {Promise} For manifest.json
    * @private
    */
   _getManifestAsync(zipFilePath) {
        return new Promise((resolve, reject) => {
            this.getManifest(zipFilePath, (err, manifest) => {
                err ? reject(err) : resolve(manifest);
            });
        });
    }

    /**
     * Get promise for JSZip zip object of the given zip file.
     * This function is a wrapper for _loadZip().
     *
     * @param {string} zipFilePath path of the zip file
     * @returns {Promise} for JSZip zip object
     * @private
     */
    _loadZipAsync(zipFilePath) {
        return new Promise((resolve, reject) => {
            this._loadZip(zipFilePath, (err, zip) => {
                err ? reject(err) : resolve(zip);
            });
        });
    }

    /**
     * Fetch datFile and binFile for all updates included in the zip.
     * Returns a sorted array of updates, on the format:
     * [{
     *   datFile: {
     *     name: filename.dat,
     *     loadData: <function returning promise with data>
     *   },
     *   binFile: {
     *     name: filename.bin,
     *     loadData: <function returning promise with data>
     *   }
     * }, ... ]
     *
     * The sorting is such that the application update is put last.
     *
     * @param {string} zipFilePath path of the zip file containing the updates
     * @returns {Promise} resolves to an array of updates
     * @returns {void}
     * @private
     */
    _fetchUpdates(zipFilePath) {
        this._log(logLevel.DEBUG, `Loading zip file: ${zipFilePath}`);
        return Promise.all([
            this._loadZipAsync(zipFilePath),
            this._getManifestAsync(zipFilePath),
        ]).then(result => {
            const zip = result[0];
            const manifest = result[1];
            return this._getFirmwareTypes(manifest).map(type => {
                const firmwareUpdate = manifest[type];
                const datFileName = firmwareUpdate.dat_file;
                const binFileName = firmwareUpdate.bin_file;
                this._log(logLevel.DEBUG, `Found ${type} files: ${datFileName}, ${binFileName}`);
                return {
                    datFile: {
                        name: datFileName,
                        loadData: () => zip.file(datFileName).async('array'),
                    },
                    binFile: {
                        name: binFileName,
                        loadData: () => zip.file(binFileName).async('array'),
                    },
                };
            });
        });
    }

    _getFirmwareTypes(manifest) {
        return [
            'softdevice',
            'bootloader',
            'softdevice_bootloader',
            'application',
        ].filter(type => !!manifest[type]);
    }

    /**
     * Get JSZip zip object of the given zip file.
     *
     * @param {string} zipFilePath Path of the zip file.
     * @param {function} callback Signature: (err, zip) => {}.
     * @returns {void}
     * @private
     */
    _loadZip(zipFilePath, callback) {
        fs.readFile(zipFilePath, (err, data) => {
            if (err) {
                return callback(err);
            }

            // Get and return zip object
            JSZip.loadAsync(data)
                .then(zip => {
                    callback(undefined, zip);
                })
                .catch(error => {
                    callback(error);
                });
        });
    }

    /**
     * Get and return manifest object from the given zip file.
     *
     * The manifest object has one or more of the following properties:
     * {
     *   application: {},
     *   bootloader: {},
     *   softdevice: {},
     *   softdevice_bootloader: {},
     * }
     *
     * Each of the above properties have the following:
     * {
     *   bin_file: <string>, // Firmware filename
     *   dat_file: <string>, // Init packet filename
     * }
     *
     * The softdevice_bootloader property also has:
     * info_read_only_metadata: {
     *   bl_size: <integer>, // Bootloader size
     *   sd_size: <integer>, // Softdevice size
     * }
     *
     * @param {string} zipFilePath Path to the zip file.
     * @param {function} callback Signature: (err, manifest) => {}.
     * @returns {void}
     */
    getManifest(zipFilePath, callback) {
        if (!zipFilePath) {
            throw new Error('No zipFilePath provided.');
        }

        // Fetch zip object
        this._loadZip(zipFilePath, (err, zip) => {
            if (err) {
                return callback(err);
            }
            // Read out manifest from zip
            zip.file('manifest.json')
                .async('string')
                .then(data => {
                    let manifest;
                    try {
                        // Parse manifest as JSON
                        manifest = JSON.parse(data).manifest;
                    } catch (error) {
                        return callback(error);
                    }
                    // Return manifest
                    return callback(undefined, manifest);
                });
        });
    }

    _log(level, message) {
        this.emit('logMessage', level, '[2] ' + message);
    }


}


//const adapterFactory = api.AdapterFactory.getInstance(undefined, { enablePolling: false });

function addLogListeners(adapter, dfu) {
    adapter.on('logMessage', (severity, message) => { if (severity > 3) console.log(`${message}`); });
    adapter.on('error', error => console.log(`error: ${JSON.stringify(error)}`));
    adapter.on('deviceDisconnected', device => console.log(`Device ${device.address}/${device.addressType} disconnected.`));
    adapter.on('deviceDiscovered', device => console.log(`Discovered device ${device.address}/${device.addressType}.`));
    adapter.on('deviceConnected', device => console.log(`Device ${device.address}/${device.addressType} connected.`));

    dfu.on('logMessage', (severity, message) => console.log(message));
    dfu.on('transferStart', fileName => console.log('transferStart:', fileName));
    dfu.on('transferComplete', fileName => console.log('transferComplete:', fileName));
    dfu.on('progressUpdate', progressUpdate => {
        let output = `progressUpdate: ${progressUpdate.stage}`;
        if (progressUpdate.percentCompleted) {
            output += `: ${progressUpdate.percentCompleted}%`;
            output += `, completed bytes: ${progressUpdate.completedBytes}, total: ${progressUpdate.totalBytes}`;
            output += `, B/s: ${progressUpdate.bytesPerSecond}, average B/s: ${progressUpdate.averageBytesPerSecond}`;
        }
        console.log('[1] ' + output);
    });
}

function performDfu(adapter, targetAddress, pathToZip) {
    return new Promise((resolve, reject) => {
        const transportParameters = {
            adapter,
            targetAddress,
            targetAddressType: 'BLE_GAP_ADDR_TYPE_RANDOM_STATIC',
        };
        //const nobleDfu = require('./nobleDfu');
        const dfu = new nobleDfu('bleTransport', transportParameters);
      //const dfu = new api.Dfu('bleTransport', transportParameters);
    
        addLogListeners(adapter, dfu);
        dfu.performDFU(pathToZip, err => {
            if (err) {
                reject(err);
                return;
            }

            resolve();
        });
    });
}

/**
 * Opens adapter for use with the default options.
 *
 * @param {Adapter} adapter Adapter to be opened.
 * @returns {Promise} Resolves if the adapter is opened successfully.
 *                    If an error occurs, rejects with the corresponding error.
 */
function openAdapter(adapter) {
    return new Promise((resolve, reject) => {
        const baudRate = process.platform === 'darwin' ? 115200 : 1000000;
        console.log(`[1] Opening adapter with ID: ${adapter.instanceId} and baud rate: ${baudRate}...`);

        adapter.open({ baudRate, logLevel: 'error' }, err => {
            if (err) {
                reject(Error(`Error opening adapter: ${err}.`));
                return;
            }

            resolve();
        });
    });
}

function help() {
    console.log(`Usage: ${path.basename(__filename)} <TARGET_ADDRESS> <PATH_TO_DFU_ZIP>`);
    console.log();
    console.log('TARGET_ADDRESS is the BLE address of the peripheral to upgrade.');
    console.log('PATH_TO_DFU_ZIP is the zip file containing the upgrade firmware.');
    console.log();
    console.log('Example: node dfu.js FF:11:22:33:AA:BF ./dfu/dfu_test_app_hrm_s132.zip');
    console.log();
    console.log('It is assumed that the nRF device has been programmed with the correct connectivity firmware.');
}

/**
 * Application main entry.
 */
if (process.argv.length !== 4) { // node ./xx./dfu.js address zipfile
    help();
    process.exit(-1);
} else {
    const targetAddress = process.argv[2];
    const pathToDfuZip = process.argv[3];

    if (targetAddress == null) {
        console.error('TARGET_ADDRESS must be provided.');
        process.exit(-1);
    }

    if (pathToDfuZip == null) {
        console.error('PATH_TO_DFU_ZIP must be provided.');
        process.exit(-1);
    }

    //const adapter = adapterFactory.createAdapter(apiVersion, port, '');
    //const nobleAdapter = require('./nobleAdapter');
    var adapter = new nobleAdapter();

    openAdapter(adapter).then(() => {
        console.log(`[1] Starting DFU process towards ${targetAddress}`);
        return performDfu(adapter, targetAddress, pathToDfuZip);
    }).catch(error => {
        console.log('[1] ' + error);
        process.exit(-1);
    });
}











