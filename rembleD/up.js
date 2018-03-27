var events = require('events');
var util = require('util');

function TdUp(id) {
    this.id = id;

    this.U_DAT_len = 0;
    this.U_DAT_blocks = 0;
    this.U_DAT_checked = 0;
    this.U_DAT_Array = [];
    this.U_DAT_Checks = [];

    this.U_REQ_Array = [];

    this.U_timerActive = 0
    this.U_seqNum = 0;
    this.U_seqNumBeforeTimer = 0;
    this.U_TimerHandle = 0;

    this.U_cfm_send_func = null;
}

util.inherits(TdUp, events.EventEmitter);


TdUp.prototype.send_u_cfm = function(data20, callback)
{
    //console.log('send_u_cfm: data20[1] =', data20[1])
    if(this.U_cfm_send_func) {
        this.U_cfm_send_func(data20, callback);
    } else {
        callback(null)
    }
}

TdUp.prototype.set_send_u_cfm = function( thefunc )
{
    this.U_cfm_send_func = thefunc;
}


const UP_ALL_NOT_YET = 0;
const UP_BLK_MISSING = 2;
const UP_CS_OK = 1;
const UP_CS_ERROR = 3;

TdUp.prototype.check_u_dat = function()
{
    var i;

    //if(this.U_DAT_checked < this.U_DAT_blocks) {
    //    for(i=0; i<this.U_DAT_blocks; i++){
    //        if(U_DAT_Checks[i] == 0)
    //            return(UP_ALL_NOT_YET);
    //    }
    //}

    //up_data_raw = Remble.from_U_DAT_Array(U_DAT_Array, U_DAT_len);

    if(this.U_DAT_checked < this.U_DAT_blocks){
        return(UP_ALL_NOT_YET);
    } else {
        var blocks = this.U_DAT_Array.length;
        var len = this.U_DAT_len - 2; // less two to through away checksum
        var pos = 0;
        var cs = 0;
        var cs0;
        var cs1;
    
        this.U_PKT = new Uint8Array(len);
        for(var idx=0; idx<blocks; idx++)
        {
            for(var i=4; i<20; i++)
            {
                var b = this.U_DAT_Array[idx][i];
                pos =  idx*16 + (i-4);
                if( pos < len){
                    this.U_PKT[pos] = b;
                    cs += b;
                } else {
                    if(pos==len)
                        cs0 = b;
                    if(pos==(len+1)) {
                        cs1 = b;
                        cs = cs & 0x0ffff; // cutoff upper bits
                        var csCheck = (cs1<<8) + cs0;
                        if( cs != csCheck)
                            return(UP_CS_ERROR);
                        else
                            break;
                    }
                }
                //console.log('data20[' + i + '] = ' + data20[i].toString(16) );
            }
        }        
        return(UP_CS_OK); //return(this.U_PKT);
    }
    
}

TdUp.prototype.push_resend = function( max )
{
    var newly_pushed = 0;
    var idx = 0;
    if(this.U_DAT_checked == this.U_DAT_blocks)
        return;
    
    for(idx = 0; idx < this.U_DAT_blocks; idx++ )
    {
        if(this.U_DAT_Checks[idx]==0)
        {
            if(this.U_REQ_Array.indexOf(idx, 0) < 0) {
                this.U_REQ_Array.push(idx);
                newly_pushed++;
                if(newly_pushed>=max)
                    break;
            }
        }
    }
    return(newly_pushed);
}

TdUp.prototype.on_up_timer = function()
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


TdUp.prototype.kick_up_timer = function(param, timeout)
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

TdUp.prototype.Get_on_u_cmd = function()
{
    this.on_u_cmd_binded = this.on_u_cmd.bind(this);
    return( this.on_u_cmd_binded )
}
TdUp.prototype.Get_on_u_dat = function()
{
    this.on_u_dat_binded = this.on_u_dat.bind(this);
    return( this.on_u_dat_binded )
}
//TdUp.prototype.on_u_dat = function(pkt20)
TdUp.prototype.on_u_dat = function(blk)
{
    var pkt20 = blk.data;
    var device = blk.device;
//console.log('on_u_dat: pkt20 =', pkt20);
    var idx = pkt20[0];

    if(idx >= this.U_DAT_blocks)
        return; //Oops!
    
    this.U_DAT_Array[idx] = pkt20;
    this.U_DAT_Checks[idx]++;
    if(this.U_DAT_Checks[idx]==1)
        this.U_DAT_checked++;

//console.log('D: this.U_DAT_Checks =', this.U_DAT_Checks)
//console.log('D: this.U_DAT_checked =', this.U_DAT_checked)
    
    var idx1 = this.U_REQ_Array.indexOf(idx, 0);
    if( idx1 >= 0) {
        this.U_DAT_Array.splice(idx1, 1);
    }

    var upStatus = this.check_u_dat();

    if(upStatus==UP_ALL_NOT_YET){
        this.kick_up_timer(1, 222);
        return
    }

    this.U_seqNum++; 
    this.kick_up_timer(0); // kill timer

    if(upStatus==UP_CS_OK){
        // send cfm OK
        var u_cfm20 = new Buffer(20);
        u_cfm20[0] = 1;
        u_cfm20[1] = 0; // 0 is OK
        this.send_u_cfm( u_cfm20, () => {} ); // u_cfm on OK (1,0)

        this.emit('up:packet', 'Packet OK', { id: this.id, pkt : this.U_PKT} );
        /* TODO
        var idAndPkt = { id : rbstate.idOrLocalName, pkt : this.U_PKT };
        device.emit(UPPKTRDY_DEV, idAndPkt);
        TODO */
    }
    if(upStatus==UP_CS_ERROR){
        // send cfm error
        var u_cfm20 = new Buffer(20);
        u_cfm20[0] = 1;
        u_cfm20[1] = 1; // 1 is Error
        this.send_u_cfm( u_cfm20, () => {} ); // u_cfm on Error (1,1)

        this.emit('up:packet', 'Packet NG', { id: this.id, pkt : null});
    }
}


TdUp.prototype.on_u_cmd = function(pkt20)
{
//console.log('on_u_cmd: pkt20 =', pkt20);
    var len = (pkt20[3]*256) + pkt20[2];
 
    this.U_DAT_len = len;
    this.U_DAT_blocks = 1 + Math.floor((len-1)/16);
//console.log('this.U_DAT_blocks =', this.U_DAT_blocks)
    this.U_DAT_Array = [];
    this.U_DAT_Checks = [];
    this.U_DAT_checked = 0;
    this.U_DAT_checkedBeforeTimer = 0;
    
    for(var b = 0; b<this.U_DAT_blocks; b++)
    {
        var data20 = new Buffer(20);
        this.U_DAT_Array.push(data20);
        var count = 0;
        this.U_DAT_Checks.push(count);
    }
//console.log('this.U_DAT_Checks.length =', this.U_DAT_Checks.length)
//console.log('this.U_DAT_Checks =', this.U_DAT_Checks)
    this.U_seqNum++;
}

TdUp.prototype.on_disconnect = function() // set to reset state
{
    console.log('TdUp.prototype.on_disconnect() - placekeeper')
}

module.exports = TdUp;

