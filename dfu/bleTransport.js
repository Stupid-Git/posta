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

const logLevel = require('./util/logLevel');
/*
const ObjectWriter = require('./bleTransport/objectWriter');
const DeviceInfoService = require('./bleTransport/deviceInfoService');
const ControlPointService = require('./bleTransport/controlPointService');
const ButtonlessControlPointService = require('./bleTransport/buttonlessControlPointService');
const InitPacketState = require('./dfuModels').InitPacketState;
const FirmwareState = require('./dfuModels').FirmwareState;
const ObjectType = require('./dfuConstants').ObjectType;
*/
const ErrorCode = require('./dfuConstants').ErrorCode;
/*
const ResultCode = require('./dfuConstants').ResultCode;
const ButtonlessControlPointOpcode = require('./dfuConstants').ButtonlessControlPointOpcode;
const ButtonlessResponseCode = require('./dfuConstants').ButtonlessResponseCode;
*/
const createError = require('./dfuConstants').createError;

const EventEmitter = require('events');
/*
const numberToHexString = require('../util/hexConv').numberToHexString;
const addressToInt = require('../util/addressConv').addressToInt;
const intToAddress = require('../util/addressConv').intToAddress;
*/
const MAX_RETRIES = 3;

const DFU_SERVICE_UUID = 'FE59';
const DFU_CONTROL_POINT_UUID = '8EC90001F3154F609FB8838830DAEA50';
const DFU_PACKET_UUID = '8EC90002F3154F609FB8838830DAEA50';
const DFU_BUTTONLESS_UNBONDED_UUID = '8EC90003F3154F609FB8838830DAEA50';
const DFU_BUTTONLESS_BONDED_UUID = '8EC90004F3154F609FB8838830DAEA50';

const DEFAULT_CONNECTION_PARAMS = {
    min_conn_interval: 7.5,
    max_conn_interval: 7.5,
    slave_latency: 0,
    conn_sup_timeout: 4000,
};
const DEFAULT_SCAN_PARAMS = {
    active: true,
    interval: 100,
    window: 50,
    timeout: 20,
};
const ATT_WRITE_COMMAND_HEADER_SIZE = 3;
const MAX_SUPPORTED_MTU_SIZE = 247;
const DEFAULT_PRN = 0;


/**
 * Implementation of Secure DFU transport according to the following specification:
 * https://infocenter.nordicsemi.com/index.jsp?topic=%2Fcom.nordic.infocenter.sdk5.v12.0.0%2Flib_dfu_transport_ble.html
 *
 * This transport requires an open adapter instance, and the BLE address for the
 * target device.
 *
 * After using init() for initialization, sendInitPacket() and sendFirmware() can
 * be invoked to perform DFU. The target disconnects after sending firmware is
 * finished. Waiting for the disconnect is done through waitForDisconnection().
 * When done with the transport, destroy() should be invoked to free up resources.
 *
 * In the future, other DFU transports may be needed. In that case it is probably
 * a good idea to introduce a transport factory that is responsible for creating
 * transports. The transports must then implement the same public methods and events.
 */
class DfuTransport extends EventEmitter {

    constructor(transportParameters) {
        super();

        if (!transportParameters.adapter) {
            throw new Error('Required transport parameter "adapter" was not provided');
        }
        if (!transportParameters.targetAddress) {
            throw new Error('Required transport parameter "targetAddress" was not provided');
        }
        if (!transportParameters.targetAddressType) {
            throw new Error('Required transport parameter "targetAddressType" was not provided');
        }

        this._adapter = transportParameters.adapter;
        this._transportParameters = transportParameters;

        console.log('[3] bleTransport: TODO _handleConnParamUpdateRequest setup if needed')
        //TODO this._handleConnParamUpdateRequest = this._handleConnParamUpdateRequest.bind(this);
        //TODO this._adapter.on('connParamUpdateRequest', this._handleConnParamUpdateRequest);
        this._isInitialized = false;
    }

    
    /**
     * Initializes the transport. Connects to the target device and sets up the transport
     * according to the configured transport parameters.
     *
     * @returns Promise that resolves when initialized
     */
    init() { //ref : nobleDFU.js this._transport.init();

        if (this._isInitialized) {
            return Promise.resolve();
        }

        const targetAddress = this._transportParameters.targetAddress;
        const targetAddressType = this._transportParameters.targetAddressType;
        //NU 
        const prnValue = this._transportParameters.prnValue || DEFAULT_PRN;
        //NU
        const mtuSize = this._transportParameters.mtuSize || MAX_SUPPORTED_MTU_SIZE;

        this._debug(`Initializing DFU transport with targetAddress: ${targetAddress}, ` +
            `targetAddressType: ${targetAddressType}, prnValue: ${prnValue}, mtuSize: ${mtuSize}.`);

        var BogusReConnect = false;
        return this._connectIfNeeded(targetAddress, targetAddressType, BogusReConnect)
            .then(device => this._enterDfuMode(device))
            /*TODO
            .then(device => this._getCharacteristicIds(device))
            .then(characteristicIds => {
                const controlPointId = characteristicIds.controlPointId;
                const packetId = characteristicIds.packetId;
                this._controlPointService = new ControlPointService(this._adapter, controlPointId);
                this._objectWriter = new ObjectWriter(this._adapter, controlPointId, packetId);
                this._objectWriter.on('packetWritten', progress => {
                    this._emitTransferEvent(progress.offset, progress.type);
                });
                return this._startCharacteristicsNotifications(controlPointId);
            })
            //NU .then(() => this._setPrn(prnValue))
            //NU .then(() => this._setMtuSize(mtuSize))
            TODO*/
            .then( device => this._startControlPointNotifications(device) ) //karel
            .then(() => this._isInitialized = true);
    }

    //this._startCharacteristicsNotifications(controlPointId);
    _startControlPointNotifications( device ) {
        console.log('[3] bleTransport: _startControlPointNotifications');
        return new Promise((resolve, reject) => {
            this._adapter.Adapter_TurnOnControl_Notifications( error => {
                if (error) {
                    const errorCode = ErrorCode.NOTIFICATION_START_ERROR;
                    reject(createError(errorCode , error.message));
                } else {
                    resolve();
                }
            });
        });
    }

    _enterBootloader() {
        console.log('[3] bleTransport: _enterBootloader');
        return new Promise((resolve, reject) => {
            var pkt = new Buffer( [0x01, 0x04]);
            this._adapter.Adapter_WriteControl_Packet( pkt, error => {
                if (error) {
                    const errorCode = ErrorCode.NOTIFICATION_START_ERROR;
                    reject(createError(errorCode , error.message));
                } else {
                    resolve();
                }
            });
        });
    }

    /**
     * Get the target to enter DFU mode.
     *
     * @param device the DFU target device
     * @returns Promise: the DFU target device in DFU mode.
     * @private
     */
    _enterDfuMode(device) {
        console.log('[3] bleTransport: _enterDfuMode');
       
        return this._startControlPointNotifications( device )
        .then(() => this._enterBootloader())
        .then(() => this.waitForDisconnection())
        .then(() => {
            //if (!bonded) {
            //    this._addOneToAddress();
            //}
            var BogusReConnect = true;
            return this._connectIfNeeded(this._transportParameters.targetAddress, this._transportParameters.targetAddressType, BogusReConnect );
        });

/*TODO
        const deviceInfoService = new DeviceInfoService(this._adapter, device.instanceId);
        const findCharacteristic = ((serviceUuid, characteristicUuid) => {
            return new Promise((resolve, reject) => {
                deviceInfoService.getCharacteristicId(serviceUuid, characteristicUuid)
                    .then(characteristicId => {
                        this._debug(`findCharacteristic: Found characteristic ID ${characteristicId}`);
                        resolve(characteristicId);
                    })
                    .catch(err => {
                        this._debug(`findCharacteristic: Did not find characteristic ID. Error ${err}`);
                        if (err.code === ErrorCode.NO_DFU_CHARACTERISTIC) {
                            resolve(null);
                        } else {
                            reject(err);
                        }
                    });
            });
        });

        return findCharacteristic(DFU_SERVICE_UUID, DFU_BUTTONLESS_BONDED_UUID)
            .then(characteristicId => {
                if (characteristicId) {
                    this._debug(`Found bonded buttonless characteristic: ${characteristicId}`);
                    const bonded = true;
                    return this._triggerButtonlessDfu(characteristicId, bonded);
                } else {
                    return findCharacteristic(DFU_SERVICE_UUID, DFU_BUTTONLESS_UNBONDED_UUID)
                        .then(characteristicId => {
                            if (characteristicId) {
                                this._debug(`Found unbonded buttonless characteristic: ${characteristicId}`);
                                const bonded = false;
                                return this._triggerButtonlessDfu(characteristicId, bonded);
                            } else {
                                this._debug(`Found no buttonless characteristic.`);
                                return Promise.resolve(device);
                            }
                        });
                }
            });
        */
    }

    /**
     * Use the given characteristic to trigger buttonless DFU and reconnect
     * to the target (which is now in DFU mode).
     *
     * @param characteristic the buttonless DFU characteristic to use.
     * @param bonded {boolean} is it the "bonded" characteristic?
     * @returns Promise: The device in DFU mode.
     * @private
     */
    /* Reference
    _triggerButtonlessDfu(characteristicId, bonded) {
        let buttonlessControlPointService = new ButtonlessControlPointService(this._adapter, characteristicId);

        return this._startCharacteristicsIndications(characteristicId)
            .then(() => buttonlessControlPointService.enterBootloader())
            .then(() => this.waitForDisconnection())
            .then(() => {
                if (!bonded) {
                    this._addOneToAddress();
                }
                return this._connectIfNeeded(this._transportParameters.targetAddress, this._transportParameters.targetAddressType);
            });
    }
    Reference */

    /**
     * Destroys the transport. Removes all listeners, so that the transport can
     * be garbage collected.
     */
    destroy() {
        console.log('[3] bleTransport: TODO destroy()');
        /*TODO
        if (this._objectWriter) {
            this._objectWriter.removeAllListeners();
        }
        this._adapter.removeListener('connParamUpdateRequest', this._handleConnParamUpdateRequest);
        */
    }


    /**
     * Find the DFU control point and packet characteristic IDs.
     *
     * @param device the device to find characteristic IDs for
     * @returns { controlPointId, packetId }
     * @private
     */
    _getCharacteristicIds(device) {
        const deviceInfoService = new DeviceInfoService(this._adapter, device.instanceId);
        return deviceInfoService.getCharacteristicId(DFU_SERVICE_UUID, DFU_CONTROL_POINT_UUID)
            .then(controlPointCharacteristicId => {
                return deviceInfoService.getCharacteristicId(DFU_SERVICE_UUID, DFU_PACKET_UUID)
                    .then(packetCharacteristicId => {
                        this._debug(`Found controlPointCharacteristicId: ${controlPointCharacteristicId}, ` +
                            `packetCharacteristicId: ${packetCharacteristicId}`);
                        return {
                            controlPointId: controlPointCharacteristicId,
                            packetId: packetCharacteristicId
                        };
                    });
            });
    }


    /**
     * Connect to the target device if not already connected.
     *
     * @param targetAddress the address to connect to
     * @param targetAddressType the target address type
     * @returns Promise that resolves with device when connected
     * @private
     */
    _connectIfNeeded(targetAddress, targetAddressType, BogusReConnect) {
        // TODO: Enable Service Change Indications if available and not enabled.
        const device = this._getConnectedDevice(targetAddress);
        if (device) {
            return Promise.resolve(device);
        } else {
            this._debug(`Connecting to address: ${targetAddress}, type: ${targetAddressType}.`);
            return this._connect(targetAddress, targetAddressType, BogusReConnect)
                .then(device => this._encrypt(device))
                .then(device => this._enableServiceChanged(device));
        }
    }

    
    /**
     * Add one to the BLE address.
     * Needed for unbonded buttonless DFU, which can not use service changed
     * indications to prevent ATT table caching.
     *
     * @param address the address to add one to
     * @returns address + 1
     * @private
     */
    _addOneToAddress() {
        this._transportParameters.targetAddress = intToAddress(addressToInt(this._transportParameters.targetAddress) + 1);
        this._debug(`New address for DFU target: ${this._transportParameters.targetAddress}`);
        return this._transportParameters.targetAddress;
    }

    /**
     * Returns connected device for the given address. If there is no connected
     * device for the address, then null is returned.
     *
     * @param targetAddress the address to get connected device for
     * @returns connected device
     * @private
     */
    _getConnectedDevice(targetAddress) {
        const devices = this._adapter.getDevices();
        const deviceId = Object.keys(devices).find(deviceId => {
            return devices[deviceId].address === targetAddress;
        });
        if (deviceId && devices[deviceId].connected) {
            return devices[deviceId];
        }
        return null;
    }


    /**
     * Connect to the target device.
     *
     * @param targetAddress the address to connect to
     * @param targetAddressType the target address type
     * @returns Promise that resolves with device when connected
     * @private
     */
    _connect(targetAddress, targetAddressType, BogusReConnect) {
        console.log('[3] bleTransport: _connect: BogusReConnect =', BogusReConnect)
        const options = {
            scanParams: DEFAULT_SCAN_PARAMS,
            connParams: DEFAULT_CONNECTION_PARAMS,
        };

        const addressParams = {
            address: targetAddress,
            type: targetAddressType,
        };

        return new Promise((resolve, reject) => {
            if(BogusReConnect) {
                this._adapter.bogusreconnect(addressParams, options, (err, device) => { // ref _fakeOnConnectionReceived
                    err ? reject(err) : resolve(device);
                });
            } else { //original code
                this._adapter.connect(addressParams, options, (err, device) => { // ref _fakeOnConnectionReceived
                    err ? reject(err) : resolve(device);
                });
            }
        });
    }

    /**
     * Encrypt the connection (if bonding data is provided)
     */
    _encrypt(device) {
        console.log('[3] bleTransport: _encrypt: TODO or Not Neededright now')
        return Promise.resolve();
        /*TODO
        return new Promise((resolve, reject) => {
            if (!this._transportParameters.bondingData) {
                resolve(device);
            }

            const masterId = this._transportParameters.bondingData.masterId;
            const encInfo = this._transportParameters.bondingData.encInfo;
            this._adapter.encrypt(device.instanceId, masterId, encInfo, error => {
                if (error) {
                    reject(error);
                } else {
                    resolve(device);
                }
            });
        });
        TODO*/
    }

    /**
     * Enable Service Changed Indications (if available)
     */
    _enableServiceChanged(device) {
        console.log('[3] bleTransport: _enableServiceChanged: TODO')
        return Promise.resolve(device);
        /*TODO
        return new Promise((resolve, reject) => {
            const deviceInfoService = new DeviceInfoService(this._adapter, device.instanceId);
            deviceInfoService.getCharacteristicId(this._adapter.driver.BLE_UUID_GATT, this._adapter.driver.BLE_UUID_GATT_CHARACTERISTIC_SERVICE_CHANGED)
              .then(characteristicId => {
                  this._debug(`Found service changed: ${characteristicId}`);
                  let ack = true;
                  _startCharacteristicsNotificationsOrIndications(characteristicId, ack)
                      .then(() => resolve(device));
              })
              .catch(err => {
                  this._debug(`Did not find service changed. Error: ${err}`);
                  resolve(device);
              });
        });
        TODO*/
    }

    /**
     * Wait for the connection to the DFU target to break. Times out with an
     * error if the target is not disconnected within 10 seconds.
     *
     * Used to ensure that the next update does not start using the old
     * connection. Losing the connection is expected behaviour after the call
     * to sendFirmware(), as the DFU target should reset after the last
     * firmware object is successfully executed.
     *
     * @returns Promise resolving when the target device is disconnected
     */
    waitForDisconnection() {
        console.log('[3] bleTransport: waitForDisconnection()');
        
        //return Promise.resolve(); //TODO

        /* TODO */
        this._debug('Waiting for target device to disconnect.');
        const TIMEOUT_MS = 10000;

        return new Promise((resolve, reject) => {
            const connectedDevice = this._getConnectedDevice(this._transportParameters.targetAddress);
            if (!connectedDevice) {
                this._debug('Already disconnected from target device.');
                return resolve();
            }

            let timeout;
            const disconnectionHandler = device => {
                this._debug('### device.instanceId, connectedDevice.instanceId =', device.instanceId, connectedDevice.instanceId);
                if (device.instanceId === connectedDevice.instanceId) {
                    clearTimeout(timeout);
                    this._debug('Received disconnection event for target device.');
                    this._adapter.removeListener('deviceDisconnected', disconnectionHandler);
                    resolve();
                }
            };

            timeout = setTimeout(() => {
                this._adapter.removeListener('deviceDisconnected', disconnectionHandler);
                reject(createError(ErrorCode.DISCONNECTION_TIMEOUT,
                    'Timed out when waiting for target device to disconnect.'));
            }, TIMEOUT_MS);

            this._adapter.on('deviceDisconnected', disconnectionHandler);
        });
        /* */
    }

    //&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&
    //ref _enterBootloader() {
    waitForControlNotify() {
        return new Promise((resolve, reject) => {

            //THIN console.log('[3] bleTransport: waitForControlNotify()');
            //return Promise.resolve(); //TODO
            /* TODO */
            //THIN this._debug('Waiting for target device to send a notification.');
            const TIMEOUT_MS = 10000;
    
    
            let timeout;
            const controlNotificationHandler = (PaRaM) => {
                //THIN console.log('[3] Got Notification PaRaM =', PaRaM);
                //this._debug('[3] Got Notification PaRaM =', PaRaM);

                clearTimeout(timeout);
                this._adapter.removeListener('controlNotification', controlNotificationHandler);
//console.log('[3] waitForControlNotify resolve()');
                resolve();
            };

            timeout = setTimeout(() => {
console.log('[3] waitForControlNotify timeOut');
                this._adapter.removeListener('controlNotification', controlNotificationHandler);
                reject(createError(ErrorCode.NOTIFICATION_TIMEOUT,
                    'Timed out when waiting for Notification.'));
            }, TIMEOUT_MS);

            this._adapter.on('controlNotification', controlNotificationHandler);
        });
        /* */
    }
    
// Adapter_TurnOnControl_Notifications ->     
    //_waitForNotifyRsp() {
    //    this._adapter.on('controlNotification', controlNotificationHandler);
    //}
    
    _send_control_data(opcode, data) {
        //THIN console.log('[3] bleTransport: _send_control_data');
        return new Promise((resolve, reject) => {
            var pkt = Buffer.alloc( 1 + data.length);
            pkt[0] = opcode;
            for(var i=0; i<data.length; i++) {
                pkt[i+1] = data[i];
            }
            this.last_sent_opcode = opcode;
            this._adapter.Adapter_WriteControl_Packet( pkt, error => {
                if (error) {
                    const errorCode = ErrorCode.NOTIFICATION_START_ERROR;
                    reject(createError(errorCode , error.message));
                } else {
                    resolve();
                }
            });
        });
    }

    _send_packet_data( pkt ) {
        //THIN console.log('[3] bleTransport: _send_packet_data');
        return new Promise((resolve, reject) => {
            this._adapter.Adapter_WriteData_Packet( pkt, error => {
                if (error) {
                    const errorCode = ErrorCode.NOTIFICATION_START_ERROR;
                    reject(createError(errorCode , error.message));
                } else {
                    resolve();
                }
            });
        });
    }
    
    
    //ref var DfuOpcodesBle = new CDfuOpcodesBle( 0 );

    /*
    *    program_mode:      1,2,3,4 -> 4 = application
    *    image_size_packet: [0,0,0,0, 0,0,0,0, L,L,L,L ] LLLL is length of bin file
    */
   XXX_start_dfu(program_mode , image_size_packet) { //see sendStartPacket
        return new Promise((resolve, reject) => {
            var BAprogram_mode = Buffer.alloc( 1, [ (program_mode & 0x000000ff) ]);
            console.log("Sending 'START DFU' command");
            this._send_control_data(/*DfuOpcodesBle.START_DFU*/ 0x01, BAprogram_mode) // 0x01 0x04
            .then( () => this._send_packet_data(image_size_packet) )
            .then( () => this.waitForControlNotify( /*this.get_received_response, true, 10.0, 'response for START DFU'*/) )
            .then( () => {/*console.log('$%#&%#&%#%#%#');*/ resolve() }) ////WTFWTFWTF
            //TODO .then( () => this._clear_received_response() )
        });
    }

    promiseTO( toms ) {
        return new Promise((resolve, reject) => {
            console.log('');
            console.log('Start of promiseTO');
            setTimeout( function() {
                console.log('End of promiseTO');
                console.log('');
                resolve();
            }, toms)
        });        
    }
    XXX_send_init_packet(init_packet)
    {
        //return Promise.resolve();

        return new Promise((resolve, reject) => {
            const init_packet_start = Buffer.from( [0x00] ); //chr(0x00);
            const image_size_packet = Buffer.from( [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0xFE, 0xFF, 0x96, 0xA7] );
            const init_packet_end = Buffer.from( [0x01] ); //chr(0x01);
            const between_notif = Buffer.from( [0x0A, 0x00] ); //chr(0x01);
    
          //this.promiseTO( 2000 ) //0x02 0x00 //DfuOpcodesBle.INITIALIZE_DFU
          //.then( () => this._startControlPointNotifications( null ) ) //karel
          //.then( () => this._send_control_data(0x02, init_packet_start) ) //0x02 0x00 //DfuOpcodesBle.INITIALIZE_DFU
                         this._send_control_data(0x02, init_packet_start)   //0x02 0x00 //DfuOpcodesBle.INITIALIZE_DFU
            .then( () => this._send_packet_data(image_size_packet) )
            .then( () => this._send_control_data(0x02, init_packet_end) ) //0x02 0x01) //DfuOpcodesBle.INITIALIZE_DFU
            .then( () => this.waitForControlNotify( ) )

            .then( () => this._send_control_data(0x08, between_notif) ) //0x02 0x0A 0x00) //DfuOpcodesBle.REQ_PKT_RCPT_NOTIFICATION
            .then( () => {console.log('XXX_send_init_packet [[END]]'); resolve() }) ////WTFWTFWTF

        });

    }
    
    XXX_send_0x03()
    {
        return new Promise((resolve, reject) => {
            const null_packet = Buffer.from( [] );
                         this._send_control_data(0x03, null_packet)
            .then( () => {console.log('XXX_send_0x03 [[END]]'); resolve() }) ////WTFWTFWTF

        });

    }
/*
    ZZZ_send_init_packet(init_packet)
    {
        return new Promise((resolve, reject) => {


        });
        const NUM_OF_PACKETS_BETWEEN_NOTIF = 10;
        const DATA_PACKET_SIZE = 20;

        //super(DfuTransportBle, this).send_init_packet(init_packet);
        init_packet_start = Buffer.from( [0x00] ); //chr(0x00);
        init_packet_end = Buffer.from( [0x01] ); //chr(0x01);

        console.log("Sending 'INIT DFU' command");
        this.send_control_data(DfuOpcodesBle.INITIALIZE_DFU, init_packet_start); //0x02 0x00

        console.log("Sending init data");
        for(var i=0; i<init_packet.Length; i+=DATA_PACKET_SIZE)
        {
            //data_to_send = init_packet[i:i + DATA_PACKET_SIZE];
            var jSize = DATA_PACKET_SIZE;
            if (jSize > init_packet.Length - i)
                jSize = init_packet.Length - i;
            data_to_send = Buffer.alloc(jSize);
            for (var j = 0; j < jSize; j++)
            {
                data_to_send[j] = init_packet[i + j];
            }

            this.send_packet_data(data_to_send); // 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x01 0x00 0xFE 0xFF 0x92 0xD7
        }

        console.log("Sending 'Init Packet Complete' command");
        this.send_control_data(DfuOpcodesBle.INITIALIZE_DFU, init_packet_end); // 0x02 0x01 
        this._wait_for_condition(this.get_received_response, true, timeout=60.0, waiting_for="response for INITIALIZE DFU");
        this.clear_received_response();

        if (NUM_OF_PACKETS_BETWEEN_NOTIF != 0)
        {
            Byte [] packet = dfu_util.int16_to_bytes(NUM_OF_PACKETS_BETWEEN_NOTIF);
            console.log("Send number of packets before device sends notification");
            this.send_control_data(DfuOpcodesBle.REQ_PKT_RCPT_NOTIFICATION, packet); // 0x08 0x0A 0x00
        }
    }
*/
    
    XXX_send_validate_firmware() {        
        return new Promise((resolve, reject) => {
            console.log("Sending 'VALIDATE FIRMWARE IMAGE' command");
            const nullPacket = Buffer.from( [] );
                         this._send_control_data( 0x04 , nullPacket ) //DfuOpcodesBle.VALIDATE_FIRMWARE_IMAGE, new Byte[0]);
            .then( () => this.waitForControlNotify( ) ) // waiting_for="response for VALIDATE FIRMWARE IMAGE");
            .then( () => {console.log('XXX_send_validate_firmware [[END]]'); resolve() }) ////WTFWTFWTF
            //console.log("Firmware validated OK.");
        });
    }

    XXX_send_activate_firmware() {
        return new Promise((resolve, reject) => {
            console.log("Sending 'ACTIVATE FIRMWARE AND RESET' command");
            const nullPacket = Buffer.from( [] );
            this._send_control_data( 0x05 , nullPacket ) // this.send_control_data(DfuOpcodesBle.ACTIVATE_FIRMWARE_AND_RESET, new Byte[0]);
            .then( () => {console.log('XXX_send_activate_firmware [[END]]'); resolve() }) ////WTFWTFWTF
        });
    }

/*
    public void tbs_data_received_handler(Object sender, Nordicsemi.PipeDataEventArgs data_event)  // ITBS
    {
        logger.info("DfuMaster.data_received_handler");
        if (data_event.PipeNumber == this.pipe_dfu_control_point_notify)
        {
            Byte op_code = (data_event.PipeData[0]);

            if (op_code == DfuOpcodesBle.RESPONSE)
            {
                Byte request_op_code = (data_event.PipeData[1]);
                Byte response_value = (data_event.PipeData[2]);
                this.response_callback(request_op_code, response_value);
            }

            if (op_code == DfuOpcodesBle.PKT_RCPT_NOTIF)
            {
                logger.debug(String.Format("Number of bytes LSB = {0}", data_event.PipeData[1]));
                logger.debug(String.Format("Number of bytes MSB = {0}", data_event.PipeData[2]));
                this.notification_callback();
                //if (data_event.PipeData[2] == 71)
                //{
                //    logger.debug("hjkhjhjhkjhkjhjhjhjkhjkhkjh");
                //    logger.debug("hjkhjhjhkjhkjhjhjhjkhjkhkjh");
                //    logger.debug("hjkhjhjhkjhkjhjhjhjkhjkhkjh");
                //}
            }

        }
        else
        {
            logger.debug(String.Format("Received data on unexpected pipe {0}", data_event.PipeNumber));
        }

        if data_event.PipeNumber == this.pipe_dfu_control_point_notify:
            op_code = int(data_event.PipeData[0])

            if op_code == DfuOpcodesBle.RESPONSE:
                request_op_code = int(data_event.PipeData[1])
                response_value = int(data_event.PipeData[2])
                this.response_callback(request_op_code, response_value)

            if op_code == DfuOpcodesBle.PKT_RCPT_NOTIF:
                logging.debug("Number of bytes LSB = {0}".format(data_event.PipeData[1]))
                logging.debug("Number of bytes MSB = {0}".format(data_event.PipeData[2]))
                this.notification_callback()

        else:
            logging.debug("Received data on unexpected pipe {0}".format(e.PipeNumber))

    }
    */

    /**
     * Sends init packet to the device. If parts of the same init packet has
     * already been sent, then the transfer is resumed.
     *
     * @param data byte array to send to the device
     * @return Promise with empty response
     */
    printdata(data) {
        //data = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]);
        var len = data.length;
        console.log('---------- hex dump ---------');
        for(var i=0; i<len; i += 16) {
            var s = '';
            var st = '    ';
            for(var j=0; j<16; j++) {
                var pos = i+j;
                if( pos >= len) {
                    s += '   ';
                } else {
                    var d = data[pos];
                    st += String.fromCharCode(d);
                    if( d < 0x10)
                        s += ' 0' + data[pos].toString(16);
                    else
                        s += ' ' + data[pos].toString(16);
                }            
            }
            console.log( s + st );
        }
    }

    sendStartPacket( data ) {
        console.log('[3] bleTransport: sendStartPacket(data) TODO');
        console.log('                  sendStartPacket(data.length) =', data.length,  data.length.toString(16)  );

        var program_mode = 0x04; // application
        var image_size_packet = Buffer.from( [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x4F, 0x56, 0x00, 0x00] );
        var file_length = data.length; //.toString(16);
        image_size_packet.writeInt16LE(file_length, 8); // 0=>softdevice, 4=>DFU, 8=>Applcation
        return this.XXX_start_dfu( program_mode, image_size_packet )
        .then( () => {/*console.log('$%#&%#&%#%#%#');*/})

        //return Promise.resolve();
    }

    sendInitPacket(data) {
        //THIN console.log('[3] bleTransport: sendInitPacket(data) TODO');
        //THIN console.log('                  sendInitPacket(data) =', data );
        //var X = Array.prototype.map.call(new Uint8Array(data), x => ('00' + x.toString(16)).slice(-2)).join('').match(/[a-fA-F0-9]{2}/g).reverse().join('');
        //console.log('                  sendInitPacket(data) =', X );
        
        //this.printdata(data);
        const init_packet = Buffer.from( [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x00, 0xFE, 0xFF, 0x96, 0xA7] );
        //this.printdata(init_packet);

        //console.log('                  TODO send control 0x02 0x00');
        //console.log('                  TODO send packet  0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x00 0x01 0x00 0xFE 0xFF 0x96 0xA7');
        //console.log('                       wait for     0x10 0x02 0x01');
        //console.log('                  TODO send control 0x02 0x01');
        //console.log('                  TODO send control 0x08 0x0a 0x00');

        return this.XXX_send_init_packet( init_packet ).then( () => this.XXX_send_0x03() )        
        //return Promise.resolve();

        /*TODO
        this._emitInitializeEvent(ObjectType.COMMAND);
        return this.getInitPacketState(data)
            .then(state => {
                this._debug(`Sending init packet: ${state.toString()}`);
                if (state.hasResumablePartialObject) {
                    const object = state.remainingData;
                    return this._resumeWriteObject(object, ObjectType.COMMAND, state.offset, state.crc32);
                }
                return this._createAndWriteObject(state.remainingData, ObjectType.COMMAND);
            });
        */
    }

    XXX_toBuffer( pkt) {
        return new Promise((resolve, reject) => {

            setTimeout( function () {
                let buf;
                buf = Buffer.from( pkt );
                resolve(buf)
            }, 1); //50);
        });
    }

    XXX_send_firmware_chunk_packets(chunk) {
        //THIN console.log("XXX_send_firmware_chunk_packets chunk.length =", chunk.length);
        return chunk.reduce((prevPromise, currentPacket) => {
            //return prevPromise.then(() => this._send_packet_data( currentPacket ) )
            //console.log("XXX_send_firmware_chunk_packets currentPacket.length =", currentPacket.length);
            return prevPromise
                .then(() => { return  this.XXX_toBuffer(currentPacket)
                                       .then( (ppp) => this._send_packet_data( ppp ) )
                //console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% currentPacket =', currentPacket);
                //currentPacket = Buffer.from(currentPacket);
                //console.log('%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% currentPacket =', currentPacket);
            })
            //return prevPromise.then(() => this._send_packet_data( Buffer.from(currentPacket) ) )
        }, Promise.resolve());
    }

    XXX_send_firmware_chunk(chunk, idx) { //see sendStartPacket
        return new Promise((resolve, reject) => {
            //THIN console.log("XXX_send_firmware_chunk chunk.length =", chunk.length, 'idx =', idx);

            const packets = this._splitArray(chunk, this._packetSize);
            this.S = '';

            this.XXX_send_firmware_chunk_packets(packets)
            //.then( () => this.XXX_FakeNotify(idx) )
            .then( () => this.waitForControlNotify( /*this.get_received_response, true, 10.0, 'response for START DFU'*/) )
            .then( () => { /*console.log('$%#&%#&%#%#%#');*/ resolve() }) ////WTFWTFWTF
        });
    }

    
    _splitArray(data, chunkSize) {
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

    sendFirmware(data) {
        //data = data.slice(0, 2020); //BOGUS
        //data = data.slice(0, 420); //BOGUS
        this._lumpSize = 200;
        this._packetSize = 20;

        //console.log('[3] bleTransport:                   data.length =', data.length);
        const lumps = this._splitArray(data, this._lumpSize);
        //console.log('[3] bleTransport:                  lumps.length =', lumps.length);

        return lumps.reduce( (prevPromise, currentLump, currentIndex, array) => {
            //console.log('[3] bleTransport:      lump.index =', currentIndex, 'lump.length =', currentLump.length);
            return prevPromise.then(() =>this.XXX_send_firmware_chunk(currentLump, currentIndex) );
        }, Promise.resolve() )
    }


    /**
     * Sends firmware to the device. If parts of the same firmware has already
     * been sent, then the transfer is resumed.
     *
     * @param data byte array to send to the device
     * @returns Promise with empty response
     */
    OLDsendFirmware(data) {
        console.log('[3] bleTransport: TODO sendFirmware(data)');
        console.log('[3] bleTransport:                   data =', data);
        return Promise.resolve();
        /*TODO
        this._emitInitializeEvent(ObjectType.DATA);
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

    send_validate_firmware() {
        return this.XXX_send_validate_firmware();        
    }
    send_activate_firmware() {
        return this.XXX_send_activate_firmware();
    }
    
    /**
     * Returns the current init packet transfer state.
     *
     * @param data the complete init packet byte array
     * @returns Promise that returns an instance of InitPacketState
     */
    getInitPacketState(data) {
        return this.init()
            .then(() => this._controlPointService.selectObject(ObjectType.COMMAND))
            .then(response => {
                this._debug(`Got init packet state from target. Offset: ${response.offset}, ` +
                    `crc32: ${response.crc32}, maximumSize: ${response.maximumSize}.`);

                return new InitPacketState(data, response);
            });
    }

    /**
     * Returns the current firmware transfer state.
     *
     * @param data the complete firmware byte array
     * @returns Promise that returns an instance of FirmwareState
     */
    getFirmwareState(data) {
        return this.init()
            .then(() => this._controlPointService.selectObject(ObjectType.DATA))
            .then(response => {
                this._debug(`Got firmware state from target. Offset: ${response.offset}, ` +
                    `crc32: ${response.crc32}, maximumSize: ${response.maximumSize}.`);

                return new FirmwareState(data, response);
            });
    }

    /**
     * Specifies that the transfer in progress should be interrupted. This will
     * abort before the next packet is written, and throw an error object with
     * code ABORTED.
     */
    abort() {
        if (this._objectWriter) {
            this._objectWriter.abort();
        } else {
            throw(createError(ErrorCode.ABORTED, 'Abort was triggered.'));
            this.destroy();
        }
    }

    _debug(message) {
        this.emit('logMessage', logLevel.DEBUG, message);
    }

}

module.exports = DfuTransport;
