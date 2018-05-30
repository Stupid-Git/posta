


    //# BLE DFU OpCodes :
function CDfuOpcodesBle ( a )
{
    this.a = a;
    //""" DFU opcodes used during DFU communication with bootloader
    //
    //    See http://developer.nordicsemi.com/nRF51_SDK/doc/7.2.0/s110/html/a00949.html#gafa9a52a3e6c43ccf00cf680f944d67a3
    //    for further information
    //"""
    this.INVALID_OPCODE = 0;
    this.START_DFU = 1;
    this.INITIALIZE_DFU = 2;
    this.RECEIVE_FIRMWARE_IMAGE = 3;
    this.VALIDATE_FIRMWARE_IMAGE = 4;
    this.ACTIVATE_FIRMWARE_AND_RESET = 5;
    this.SYSTEM_RESET = 6;
    this.REQ_PKT_RCPT_NOTIFICATION = 8;
    this.RESPONSE = 16;
    this.PKT_RCPT_NOTIF = 17;

    //this.toStringX = function( opCode)
    function toStringX( opCode)
    {
            console.log('DfuOpcodesBle toStringX', opCode)
    }
}

CDfuOpcodesBle.prototype.toStringY = function( opCode)
{
    var s = '';
    if( opCode == this.INVALID_OPCODE ) s = 'INVALID_OPCODE';
    if( opCode == this.START_DFU ) s = 'START_DFU';
    if( opCode == this.INITIALIZE_DFU ) s = 'INITIALIZE_DFU';
    if( opCode == this.RECEIVE_FIRMWARE_IMAGE ) s = 'RECEIVE_FIRMWARE_IMAGE';
    if( opCode == this.VALIDATE_FIRMWARE_IMAGE ) s = 'VALIDATE_FIRMWARE_IMAGE';
    if( opCode == this.ACTIVATE_FIRMWARE_AND_RESET ) s = 'ACTIVATE_FIRMWARE_AND_RESET';
    if( opCode == this.SYSTEM_RESET  ) s = 'SYSTEM_RESET';
    if( opCode == this.REQ_PKT_RCPT_NOTIFICATION ) s = 'REQ_PKT_RCPT_NOTIFICATION';
    if( opCode == this.RESPONSE ) s = 'RESPONSE';
    if( opCode == this.PKT_RCPT_NOTIF ) s = 'PKT_RCPT_NOTIF';
    console.log('DfuOpcodesBle toStringY =', opCode, '\''+s+'\'')
    
}

var DfuOpcodesBle = new CDfuOpcodesBle( 0 );

/*
    public class DfuErrorCodeBle
    {
        //""" DFU error code used during DFU communication with bootloader
        //
        //    See http://developer.nordicsemi.com/nRF51_SDK/doc/7.2.0/s110/html/a00949.html#gafa9a52a3e6c43ccf00cf680f944d67a3
        //    for further information
        //"""

        public static int SUCCESS = 1;
        public static int INVALID_STATE = 2;
        public static int NOT_SUPPORTED = 3;
        public static int DATA_SIZE_EXCEEDS_LIMIT = 4;
        public static int CRC_ERROR = 5;
        public static int OPERATION_FAILED = 6;

        //@staticmethod
        public static String error_code_lookup(int error_code)
        {
            //"""
            //Returns a description lookup table for error codes received from peer.
            //
            //:param int error_code: Error code to parse
            //:return str: Textual description of the error code
            //"""
            //String code_lookup;

            if (error_code == DfuErrorCodeBle.SUCCESS) return ("SUCCESS");
            if (error_code == DfuErrorCodeBle.INVALID_STATE) return ("Invalid State");
            if (error_code == DfuErrorCodeBle.NOT_SUPPORTED) return ("Not Supported");
            if (error_code == DfuErrorCodeBle.DATA_SIZE_EXCEEDS_LIMIT) return ("Data Size Exceeds Limit");
            if (error_code == DfuErrorCodeBle.CRC_ERROR) return ("CRC Error");
            if (error_code == DfuErrorCodeBle.OPERATION_FAILED) return ("Operation Failed");
            return ("UNKOWN ERROR CODE");
*/            
            /*
            code_lookup = {DfuErrorCodeBle.SUCCESS: "SUCCESS",
                           DfuErrorCodeBle.INVALID_STATE: "Invalid State",
                           DfuErrorCodeBle.NOT_SUPPORTED: "Not Supported",
                           DfuErrorCodeBle.DATA_SIZE_EXCEEDS_LIMIT: "Data Size Exceeds Limit",
                           DfuErrorCodeBle.CRC_ERROR: "CRC Error",
                           DfuErrorCodeBle.OPERATION_FAILED: "Operation Failed"}

            return code_lookup.get(error_code, "UNKOWN ERROR CODE")
            */
/*           
        }
*/        
        /*
        static void error_code_lookup(DfuErrorCodeBle error_code)
        {
            //"""
            //Returns a description lookup table for error codes received from peer.
            //
            //:param int error_code: Error code to parse
            //:return str: Textual description of the error code
            //"""
            
            code_lookup = {DfuErrorCodeBle.SUCCESS: "SUCCESS",
                           DfuErrorCodeBle.INVALID_STATE: "Invalid State",
                           DfuErrorCodeBle.NOT_SUPPORTED: "Not Supported",
                           DfuErrorCodeBle.DATA_SIZE_EXCEEDS_LIMIT: "Data Size Exceeds Limit",
                           DfuErrorCodeBle.CRC_ERROR: "CRC Error",
                           DfuErrorCodeBle.OPERATION_FAILED: "Operation Failed"}

            return code_lookup.get(error_code, "UNKOWN ERROR CODE")
            
        }
        */
/*
    }
*/


var events = require('events');
var util = require('util');
util.inherits(BIF, events.EventEmitter);

function BIF( device, id )
{
    this.id = id;
    this.device = device;

    this.D_timerActive = 0
    this.D_TimerHandle = 0;

    this.U_timerActive = 0
    this.U_TimerHandle = 0;
}

BIF.prototype.write_ctl = function( code, data, callback) {
    console.log('write_ctl');
    this.kick_dn_timer(1, 1000);
    callback(null, 'OK');
}

BIF.prototype.write_pkt = function( code, data, callback) {
    console.log('write_pkt');
    callback(null, 'OK');
}

BIF.prototype.read_info = function( callback) {
    console.log('read_info');
    callback(null, 'OK');
}

//-----------------------------------------------------------------------------
BIF.prototype.on_dn_timer = function()
{
    console.log('on_dn_timer')
    this.D_timerActive = 0;
    this.emit('bif_notify', { data: 'OK'});
    //this.kick_dn_timer(1, 222);
}

BIF.prototype.kick_dn_timer = function(param, timeout)
{
    if(this.D_TimerHandle != 0) {
        clearTimeout(this.D_TimerHandle);
        this.D_timerActive = 0; 
    }

    if(param==0) 
        return;

    if( this.D_timerActive == 1)
        return;
    this.D_timerActive = 1;

    this.D_TimerHandle = setTimeout( this.on_dn_timer.bind(this) , timeout);
}



//-----------------------------------------------------------------------------
BIF.prototype.on_up_timer = function()
{
    this.U_timerActive = 0;
//console.log('on_up_timer')
    // If the sequence number is no longer valid for
    // this timer operation just return
//console.log('this.U_seqNumBeforeTimer, this.U_seqNum', this.U_seqNumBeforeTimer, this.U_seqNum);
    if(this.U_seqNumBeforeTimer != this.U_seqNum)
        return;
//console.log('on_up_timer - 0')

    // If we have all the data, just return
//console.log('this.U_DAT_checked ,this.U_DAT_blocks', this.U_DAT_checked,this.U_DAT_blocks);
    if(this.U_DAT_checked == this.U_DAT_blocks)
        return;
//console.log('on_up_timer - 1')

    // If progress has been made restart the timer
    // and return
    if(this.U_DAT_checkedBeforeTimer < this.U_DAT_checked)
    {
        this.kick_up_timer(1, 222);
        return;
    }

//console.log('on_up_timer - 2')

    // If we get here, then we are stuck
    var newly_pushed = this.push_resend(4);
    if( newly_pushed == 0)
    {
        // start to panic
        console.log('on_up_timer - panic')
        var u_cfm20 = new Buffer(20);
        u_cfm20[0] = 1;
        u_cfm20[1] = 1; // 1 is Error
        u_cfm20[2] = 0;
        this.send_u_cfm( u_cfm20, () => {} ); // u_cfm on Error (1,1)
        this.U_seqNum++;
        return
    }
    
    var u_cfm20 = new Buffer(20);
    u_cfm20[0] = 1;
    u_cfm20[1] = 2; // 2 is Missing
    u_cfm20[2] = 0;
    var i;
    for(i = 0; i < 4; i++)
    {
        if( i < this.U_REQ_Array.length) {
            var idx = this.U_REQ_Array[i];
            u_cfm20[2]++;
            u_cfm20[3+i] = idx;
        }
    }
    this.send_u_cfm( u_cfm20, () => {} ); // u_cfm on Missing (1,2)

    this.kick_up_timer(1, 222);

//console.log('on_up_timer - end')
}

BIF.prototype.kick_up_timer = function(param, timeout)
{
    if(this.U_TimerHandle != 0) {
        clearTimeout(this.U_TimerHandle);
        this.U_timerActive = 0; 
    }

    if(param==0) 
        return;

    if( this.U_timerActive == 1)
        return;
    this.U_timerActive = 1;
    this.U_DAT_checkedBeforeTimer = this.U_DAT_checked;
    this.U_seqNumBeforeTimer = this.U_seqNum;

    this.U_TimerHandle = setTimeout( this.on_up_timer.bind(this) , timeout);
}


BIF.prototype.send_control_data = function(opCode, packet) // (int, byte [])
{
    DfuOpcodesBle.toStringY(opCode);

    'use strict';
    return new Promise(function(resolve, reject) {        
        setTimeout( resolve() , 500);
    })
}
BIF.prototype.send_packet_data = function(packet) // ( byte [])
{
    'use strict';
    return new Promise(function(resolve, reject) {        
        setTimeout( resolve() , 500);
    })
}

BIF.prototype._wait_for_condition = function(a, b) // ( byte [])
{
    'use strict';
    return new Promise(function(resolve, reject) {        
        setTimeout( resolve() , 500);
    })
}

BIF.prototype._start_dfu = function( program_mode, image_size_packet) // (int, byte [])
{
    'use strict';
    var that = this;
    return new Promise(function(resolve, reject) {

        var BAprogram_mode = new Uint8Array(1);
        BAprogram_mode[0] =  (program_mode & 0x000000ff) ;
        console.log('Sending \'START DFU\' command')
        //logger.debug("Sending 'START DFU' command");

        that.send_control_data(DfuOpcodesBle.START_DFU, BAprogram_mode )
        .then( () => {
            that.send_packet_data(image_size_packet)
            .then( () => {
                that._wait_for_condition('aa', 'bb')
                .then( () => {resolve( 0 )} )

            })
        })
        .catch( error => {
            reject();
        })
       
        //this._wait_for_condition(this.get_received_response, true, 10.0F, /*waiting_for=*/"response for START DFU");
        //this.clear_received_response();

        /*
        logger.debug("Sending 'START DFU' command")
        this.send_control_data(DfuOpcodesBle.START_DFU, chr(program_mode))
        logger.debug("Sending image size")
        this.send_packet_data(image_size_packet)
        this._wait_for_condition(this.get_received_response, waiting_for="response for START DFU")
        this.clear_received_response()
        */
    
    })
}





var bif = new BIF();

/** Function for writing array to the read and write characteristic **/
//  Parameters      charVal             Uint8Array, maximum 20 bytes long
//                  characteristic      BLE characteristic object
var writePermission = true;
function prom_1(bif, n) {
    'use strict';
    return new Promise(function(resolve, reject) {
        if(writePermission) {
            writePermission = false;
            setTimeout( () => {
                n++;
                writePermission = true;
                console.log('prom_1: new n =', n)
                if( (n>100) && ( (n%2) !=0))
                    reject('Number > 100 and Odd');
                else
                    resolve( n );
            }, 1000)
        } else {
            reject('No permission to write');
        }
    })
}

function start() {

/*
    bif.read_info( (error, res) => {
        console.log('read_info returns: ', res);        
    })

    bif.once('bif_notify', (param) => {
        console.log('bif_notify returns: ', param);        
        bif.write_ctl( 'code', 'data', (error, res) => {
        })
    })
    bif.write_ctl( DfuOpcodesBle.START_DFU, 'data', (error, res) => {
        bif.write_pkt( 'code', 'data', (error, res) => {
        })
    })
*/

    var program_mode = 0;
    var image_size_packet = new Uint8Array(20);
    bif._start_dfu( program_mode, image_size_packet) // (int, byte [])
    .then( (res) => {
        console.log('_start_dfu returns: ', res);        
    })
    .catch( (error) => {
        console.log('_start_dfu error: ', error);        
    })


    /*
    prom_1(bif, 11)
    .then( n => {
        prom_1(bif, n)
        .then( n => {
            console.log(' n =', n)  
            n = n + 100;
            return( n )
        })
        .catch(error => {
            console.log('CATCH_B ' + error);
        })    
        .then( n => {
            console.log('big n =', n)              
            prom_1( bif, n)
            .then( n => {
                console.log('last n =', n)              
            })
            .catch(error => {
                console.log('CATCH_C ' + error);
            })
        })
    })
    .catch(error => {
        console.log('CATCH_A ' + error);
    });
    */
}




// finally start！＠
start();
