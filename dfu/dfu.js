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
        const nobleDfu = require('./nobleDfu');
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
    const nobleAdapter = require('./nobleAdapter');
    var adapter = new nobleAdapter();

    openAdapter(adapter).then(() => {
        console.log(`[1] Starting DFU process towards ${targetAddress}`);
        return performDfu(adapter, targetAddress, pathToDfuZip)
               .then( () => { process.exit(0); } ); //karel added this to kill noble process
    }).catch(error => {
        console.log('[1] ' + error);
        process.exit(-1);
    });
}
