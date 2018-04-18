
    var CONNECT_REM          = 'connect:rem';           // Down
    var DISCONNECT_REM       = 'disconnect:rem';        // Down
    var CONNECTIONSTATUS_REM = 'connectionStatus:rem';  // Up

    var CONNECT_WEB          = 'connect:web';           // Down
    var DISCONNECT_WEB       = 'disconnect:web';        // Down
    var CONNECTIONSTATUS_WEB = 'connectionStatus:web';  // Up


    var DNPKT_REM            = 'dnPkt:rem';             // Down
    var DNPKTSENTCFM_REM     = 'dnPktSentCfm:rem';      // Up
    var UPPKTRDY_DEV         = 'upPktRdy:dev';          // Up (from noble ...)
    var UPPKT_REM            = 'upPkt:rem';             // Up

    var DNPKT_WEB            = 'dnPkt:web';             // Down
    var DNPKTSENTCFM_WEB     = 'dnPktSentCfm:web';      // Up
    var UPPKT_WEB            = 'upPkt:web';             // Up


var mqttParam_1 = { mqttServer : 'mqtt://ocn.cloudns.org',
topic_sendAnswer: 'sendAnswer',
topic_makeOffer:  'makeOffer'
};

// CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC
// CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC
// CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC
var Cm = require('../mqrtc/cm');
var Crtc = require('../mqrtc/crtc');

var cm = new Cm(mqttParam_1);
var crtc = new Crtc('dummyParam');

callbackForConnected = function()
{
    console.log('callbackForConnected ')
}

cm.on('gotOffer', (offer) => {
    console.log('[C ] got offer  from   cm = ')//, offer )
    crtc.setOffer( offer, callbackForConnected );
});

crtc.on('gotAnswer', (answer) => {
    console.log('[C ] got answer from crtc = ')//, answer )
    cm.sendAnswer( answer );
});

// that.emit('gotData', data.message )
crtc.on('gotData', (dataIn) => {
    //console.log('===================================================================');
    //console.log('crtc.on(gotData): dataIn = ', dataIn);
    var cmd = dataIn.cmd;
    //console.log('crtc.on(gotData): cmd = ', cmd);
    var payload = dataIn.payload;
    //console.log('crtc.on(gotData): payload = ', payload);

    if( cmd == DNPKT_REM) {
        //console.log('crtc.on(gotData): payload.pkt = ', payload.pkt);
        //console.log('crtc.on(gotData): payload.pkt.data = ', payload.pkt.data);

        payload.pkt = Buffer.from( payload.pkt );
        //console.log('crtc.on(gotData): payload = ', payload);
    }
    io.emit(cmd, payload); //-> _go_do_DNPKT_REM payload 

});

// OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
// OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO
// OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO

var server = require('http').createServer().listen(8088, '0.0.0.0');
var io = require('socket.io').listen(server);

console.log('Server running ...');

users = [];
connections = [];



io.sockets.on('connection', function(socket) {

    connections.push(socket);
	console.log('Connected: %s sockets connected', connections.length);

	//Disconnect
	socket.on('disconnect', function(data) {
		users.splice(users.indexOf(socket.username), 1);
		updateUsernames();
		connections.splice(connections.indexOf(socket), 1);
		console.log('Disconnected: %s sockets connected' + ' Goodbye ' + socket.username, connections.length);
	});

	// Send Message
	socket.on('send message', function(data) {
		console.log(data);
		io.sockets.emit('new message', {msg:data, user:socket.username});
	});

	// New User
	socket.on('new user', function(data, callback) {
		callback(true);
		console.log('Added User: ' + data);
		socket.username = data;
		users.push(socket.username);
		updateUsernames();
	});

	function updateUsernames(){
		io.sockets.emit('get users', users);
	}


	//test=============================================================================
	//test=============================================================================

    //====================================================================
    // SCAN BLUETOOTH LE
    //====================================================================
    require('./rb2_util'); // const SCANSTART_REM  etc 

    // message passing ----------------------------------------------------
    /*
    socket.on(SCANSTART_WEB, function(data){		// Down
        io.emit(SCANSTART_REM, data);
    })
    socket.on(SCANSTOP_WEB, function(data){		// Down
        io.emit(SCANSTOP_REM, data);
    })
    */
    socket.on(SCANDATA_REM, function(data){		// Up
        //console.log('on - SCANDATA_REM data = ' + data);
        var _cmd = SCANDATA_REM;
        var _payload = data;
        var dataOut = { cmd: _cmd, payload : JSON.parse(_payload) };
        crtc.sendData( dataOut );
    })
    socket.on(SCANSTARTED_REM, function(data){	// Up
        var _cmd = SCANSTARTED_REM;
        var _payload = data;
        var dataOut = { cmd: _cmd, payload : _payload};
        crtc.sendData( dataOut );
    })
    socket.on(SCANSTOPPED_REM, function(data){	// Up
        var _cmd = SCANSTOPPED_REM;
        var _payload = data;
        var dataOut = { cmd: _cmd, payload : _payload};
        crtc.sendData( dataOut );
    })


	// message passing ----------------------------------------------------

    /*
	socket.on(CONNECT_WEB, function(data){			// Down
		console.log('on - CONNECT_WEB data = ' + data);
		io.emit(CONNECT_REM, data);
	})
	socket.on(DISCONNECT_WEB, function(data){			// Down
		console.log('on - DISCONNECT_WEB');
		io.emit(DISCONNECT_REM, data);
    })
    */
    socket.on(CONNECTIONSTATUS_REM, function(data){	// Up
        var text = 'Unknown';
		if(data.status === true) text = 'Connected';
		if(data.status === false) text = 'Disconnected';
		//console.log('on - CONNECTIONSTATUS_REM ' + text);
        var _cmd = CONNECTIONSTATUS_REM;
        var _payload = data;
        var dataOut = { cmd: _cmd, payload : _payload};
        //io.emit(CONNECTIONSTATUS_WEB, data);
        crtc.sendData( dataOut );
	})

    /*
	socket.on(DNPKT_WEB, function(data){			// Down
		console.log('on - DNPKT_WEB');
		io.emit(DNPKT_REM, data);
		//io.sockets.emit(DNPKT_REM, data);
    })
    */

	socket.on(DNPKTSENTCFM_REM, function(id){	// Up
		//console.log('on - DNPKTSENTCFM_REM');
        var _cmd = DNPKTSENTCFM_REM;
        var _payload = { id: id};
        var dataOut = { cmd: _cmd, payload : _payload};
		//io.emit(DNPKTSENTCFM_WEB, data_is_id);
        crtc.sendData( dataOut );
    })
    
	socket.on(UPPKT_REM, function(id_pkt){			// Up
		//console.log('on - UPPKT_REM');
        var _cmd = UPPKT_REM;
        var _payload = id_pkt;
        var dataOut = { cmd: _cmd, payload : _payload};
        //console.log('UPPKT_REM dataOut = ', dataOut)
		//io.emit(UPPKT_WEB, data);
        crtc.sendData( dataOut );
	})

});
