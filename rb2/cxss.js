
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


cm.on('gotOffer', (offer) => {
console.log('[C ] got offer  from   cm = ')//, offer )
crtc.setOffer( offer );
});

crtc.on('gotAnswer', (answer) => {
console.log('[C ] got answer from crtc = ')//, answer )
cm.sendAnswer( answer );
});

// that.emit('gotData', data.message )
crtc.on('gotData', (dataIn) => {
    var cmd = dataIn.cmd;
    var payload = dataIn.payload;
    console.log('===================================================================');
    console.log('got data: cmd = ', cmd);

    io.emit(cmd, payload);

    //console.log('[C ] got dataIn from ortc = ', dataIn )
    //var text = 'And Hello from C side';
    //crtc.sendData( text );
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
    var SCANSTART_WEB        = 'scanStart:web';         // Down
    var SCANSTOP_WEB         = 'scanStop:web';          // Down
    var SCANDATA_WEB         = 'scanData:web';          // Up
    var SCANSTARTED_WEB      = 'scanStarted:web';       // Up
    var SCANSTOPPED_WEB      = 'scanStopped:web';       // Up

    var SCANSTART_REM        = 'scanStart:rem';         // Down
    var SCANSTOP_REM         = 'scanStop:rem';          // Down
    var SCANDATA_REM         = 'scanData:rem';          // Up
    var SCANSTARTED_REM      = 'scanStarted:rem';       // Up
    var SCANSTOPPED_REM      = 'scanStopped:rem';       // Up


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
        console.log('on - SCANDATA_WEB data = ' + data);
        var _cmd = SCANDATA_WEB;
        var _payload = data;
        var dataOut = { cmd: _cmd, payload : _payload};
        //io.emit(SCANDATA_WEB, data);
        crtc.sendData( dataOut );
    })
    socket.on(SCANSTOPPED_REM, function(data){	// Up
        var _cmd = SCANSTOPPED_WEB;
        var _payload = data;
        var dataOut = { cmd: _cmd, payload : _payload};
        //io.emit(SCANSTOPPED_WEB, data);
        crtc.sendData( dataOut );
    })


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
		console.log('on - CONNECTIONSTATUS_REM ' + text);
        var _cmd = CONNECTIONSTATUS_WEB;
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

	socket.on(DNPKTSENTCFM_REM, function(data_is_id){	// Up
		console.log('on - DNPKTSENTCFM_REM');
        var _cmd = DNPKTSENTCFM_REM;
        var _payload = data_is_id;
        var dataOut = { cmd: _cmd, payload : _payload};
		//io.emit(DNPKTSENTCFM_WEB, data_is_id);
        crtc.sendData( dataOut );
    })
    
	socket.on(UPPKT_REM, function(data){			// Up
		console.log('on - UPPKT_REM');
        var _cmd = UPPKT_WEB;
        var _payload = data;
        var dataOut = { cmd: _cmd, payload : _payload};
		//io.emit(UPPKT_WEB, data);
        crtc.sendData( dataOut );
	})

});
