var events = require('events');
var util = require('util');

function dn(id) {
    this.id = id;
    this.D_DAT_len = 0;
    this.D_DAT_blocks = 0;
    this.D_DAT_Array = [];
    this.D_currentBlock = 0;

    this.U_REQ_Array = [];

    this.D_timerActive = 0
    this.D_TimerHandle = 0;

    this.D_cmd_send_func = null;
    this.D_dat_send_func = null;
}

util.inherits(dn, events.EventEmitter);


dn.prototype.send_d_cmd = function(data20, callback)
{
    //console.log('send_d_cmd: data20[1] =', data20[1])
    if(this.D_cmd_send_func) {
        this.D_cmd_send_func(data20, callback);
    } else {
        callback(null)
    }
}

dn.prototype.send_d_dat = function(data20, callback)
{
    //console.log('send_d_dat: data20[1] =', data20[1])
    if(this.D_dat_send_func) {
        this.D_dat_send_func(data20, callback);
    } else {
        callback(null)
    }
}

dn.prototype.set_send_d_cmd = function( thefunc )
{
    this.D_cmd_send_func = thefunc;
}
dn.prototype.set_send_d_dat = function( thefunc )
{
    this.D_dat_send_func = thefunc;
}




dn.prototype.on_dn_timer = function()
{
    console.log('on_dn_timer')
    this.D_timerActive = 0;
    //this.kick_dn_timer(1, 222);
}

dn.prototype.kick_dn_timer = function(param, timeout)
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



dn.prototype.Get_on_d_cfm = function()
{
    this.on_d_cfm_binded = this.on_d_cfm.bind(this);
    return( this.on_d_cfm_binded )
}

dn.prototype.on_d_cfm = function(pkt20)
{
    //console.log('on_d_cfm: pkt20 =', pkt20);

    var status = pkt20[1]

    if( status == 0){
        //OK
        this.emit('dn:Status', 'Sent OK');
    }
    if( status == 1){
        //CS ERROR
        this.emit('dn:Status', 'Sent NG');
    }
    if( status == 2){
        //RESEND Request
        this.emit('dn:Status', 'Sent Resend');
        var count = pkt20[2];
        for( var i = 0 ; i<count; i++){
            var idx = pkt[3 + i];
            if(this.D_RESEND_Array.indexOf(idx, 0) < 0) {
                this.D_RESEND_Array.push(idx);
            }
        }

        //if(need to start data send again)
        if( this.D_sendIsIdle == true )
            this.send_data();
    }

}


dn.prototype.send_data = function()
{
    this.D_sendIsIdle = false;
    if(this.D_RESEND_Array.Length > 0) {
        var idx = D_RESEND_Array.pop();
        this.send_d_dat( this.D_DAT_Array[ idx ], (param) => {
            this.send_data();
        })    
    } else {
        if(this.D_currentBlock < this.D_DAT_blocks) {
            this.send_d_dat( this.D_DAT_Array[this.D_currentBlock++], (param) => {
                this.send_data();
            })    
        } else {
            //console.log('No more data to send')
            this.D_sendIsIdle = true;
        }
    }

}


dn.prototype.Send = function(pkt)
{

    var pktLen = pkt.length;
 
    this.D_DAT_len = pktLen + 2;
    this.D_DAT_blocks = 1 + Math.floor((this.D_DAT_len-1)/16);
//console.log('this.D_DAT_blocks =', this.D_DAT_blocks)
    this.D_DAT_Array = [];
    this.D_currentBlock = 0;
    this.D_RESEND_Array = [];

    this.D_sendIsIdle = true;

    var cs = 0;
    for(var b = 0; b<this.D_DAT_blocks; b++)
    {
        var data20 = new Buffer(20);
        var j = 0;
        data20[j++] = b;
        data20[j++] = 0;
        data20[j++] = 0;
        data20[j++] = 0;

        for( var i = (16 * b); i<this.D_DAT_len; i++ ){
            if(i<pktLen){
                data20[j++] = pkt[i];
                cs += pkt[i];
            }
            if(i == (pktLen + 0) ) {
                data20[j++] = (cs>>0) & 0x0ff;
            }
            if(i == (pktLen + 1) ) {
                data20[j++] = (cs>>8) & 0x0ff;
            }
        }
        
        this.D_DAT_Array.push(data20);
    }

    var cmd20 = new Buffer(20);
    cmd20[0] = 1;
    cmd20[1] = 1;
    cmd20[2] = (this.D_DAT_len>>0) & 0x0ff;
    cmd20[3] = (this.D_DAT_len>>8) & 0x0ff;
    this.send_d_cmd( cmd20, (param) => {
        //console.log('send_d_cmd returned param =', param)
        this.send_data();
    })

}

dn.prototype.on_disconnect = function() // set to reset state
{
    console.log('dn.prototype.on_disconnect() - placekeeper')
}

module.exports = dn;
