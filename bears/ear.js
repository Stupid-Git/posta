
const request = require('request');

//var cors = require('cors');
//var app = express();
//app.use(cors());
//NG request.use(cors());

//var 
//HostAndPort = 'http://localhost:8080';
HostAndPort = 'http://ocn.cloudns.org:6565';

var myId = 'FakeId';

HelloWorld = function()
{
    console.log('Hello World. I am Bear with id =', myId);
}

getPrint = function() {
    request.get(HostAndPort + '/api/bears', function (err, httpResponse, body) {
        console.log('request.get   err =',err);
        console.log('request.get   body =', body);
    });
}
