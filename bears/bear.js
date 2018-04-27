// https://www.npmjs.com/package/request
// https://github.com/request/request
// https://stackoverflow.com/questions/35473265/how-to-post-data-in-node-js-with-content-type-application-x-www-form-urlencode

const request = require('request');

/*
request.put('http://localhost:8080/api/bears/5a9f52df6504ce4ea08682c3', {
  form: {
    name : 'Klaus Flourider Dude',
    offer : 'No one fks with the Jesus'
  }
}, function (err, httpResponse, body) {
    
    //console.log('=====================================================================');
    //console.log( err );
    //console.log('=====================================================================');
    //console.log( httpResponse );
    console.log('=====================================================================');
    console.log( body);
    console.log('=====================================================================');

    // direct way
    client.get("http://localhost:8080/api/bears", function (data, response) {
        // parsed response body as js object
        console.log(data);
        // raw response
        //console.log(response);
    });

});
*/

/*
request.post('http://localhost:8080/api/bears', {
    form: {
        name : 'A Bear has a name'
    }
}, function (err, httpResponse, body) {
    
    console.log('=====================================================================');
    console.log( err );
    //console.log('=====================================================================');
    //console.log( httpResponse );
    console.log('=====================================================================');
    console.log( body);
    console.log('=====================================================================');

    // direct way
    client.get("http://localhost:8080/api/bears", function (data, response) {
        // parsed response body as js object
        console.log(data);
        // raw response
        //console.log(response);
    });

});
*/

// https://www.npmjs.com/package/node-machine-id
// https://github.com/automation-stack/node-machine-id
const machineId = require('node-machine-id').machineId;
const machineIdSync = require('node-machine-id').machineIdSync;
// Syncronous call
let id1 = machineIdSync()
// id = c24b0fe51856497eebb6a2bfcd120247aac0d6334d670bb92e09a00ce8169365
let id2 = machineIdSync({original: true})
// id = 98912984-c4e9-5ceb-8000-03882a0485e4
//console.log('machineIdSync 1 ', id1);
//console.log('machineIdSync 2 ', id2);

//var HostAndPort = 'http://localhost:8080';
var HostAndPort = 'http://ocn.cloudns.org:6565';

var Bear = class {

    constructor(bearNo)
    {        
        this.myId = bearNo; //TODO  machineIdSync + Alpha
    }

    HelloWorld()
    {
        console.log('Hello World. I am Bear with id =', this.myId);
    }

    getPrint() {
        request.get(HostAndPort + '/api/bears/'+this.myId, function (err, httpResponse, body) {
            var data = JSON.parse(body);
            console.log('request.get   data =', data);
            console.log('--------------------------------------------------------------------------------');
        });
    }

    getAllPrint() {
        request.get(HostAndPort + '/api/bears/', function (err, httpResponse, body) {
            //console.log('request.get   err =',err);
            //console.log('request.get   body =', body);
            var data = JSON.parse(body);
            data.forEach( function(element) {
                console.log('--------------------------------------------------------------------------------');
                console.log(element);
            });
            console.log('--------------------------------------------------------------------------------');
        });
    }

    loadFullData( cb ) {
        request.get(HostAndPort + '/api/bears/'+this.myId, function (err, httpResponse, body) {
            if( err ) {
                cb( err);
                return;
            }
            var data = JSON.parse(body);
            cb( err, data ); // note: err == null at this point
        });
    }

    getDataBear( cb ) {
        request.get(HostAndPort + '/api/bears/'+this.myId, function (err, httpResponse, body) {
            if( err ) {
                cb( err );
                return;
            }
            var data = JSON.parse(body);
            //console.log('request.get   data =', data );
            cb( err, data.bear ); // note: err == null at this point
        });
    }
    
    putDataBear(tdid, offer, cb) {
        request.get(HostAndPort + '/api/bears/'+this.myId, function (err, httpResponse, body) {
            if( err ) {
                cb( err );
                return;
            }
            var data = JSON.parse(body);
            var bear = data.bear;
            if( !bear ) {
                cb( null, { message: 'NG Entry not found', bear: data.bear} );
                return;
            }

            request.put(HostAndPort + '/api/bears/'+bear._id, {
                form: {
                    tdid : tdid,
                    offer : offer
                }
                }, function (err, httpResponse, body) {
                    if(err) {
                        cb(err);
                        return;
                    }
                    var data = JSON.parse(body);   //{"message":"Bear updated!","bear":{"_id":"5ae1813f60377420023f55cb","name":"9ee278a8-c068-4934-a2d7-9e8a977f44b3","__v":0,"dateStamp":"Thu Apr 26 2018 16:51:56 GMT+0900 (JST)","offer":{"quote":"No one fucks with The Jesus ","mqttofferin":"/de543deac2398cb8def/offerin","mqttanswerout":"/de543deac2398cb8def/answerout"},"timeStamp":1524729116718}}

                    var bear = data.bear;
                    cb( null, { message: 'OK Entry updated', bear: data.bear} );
            });                      
        });

    }

    getOrCreateBear( cb ) {
        var that = this;
        //console.log('req.body.name: this.myId = ', this.myId);   

        request.get(HostAndPort + '/api/bears/'+this.myId, function (err, httpResponse, body) {
            if(err) {
                console.log('getOrCreateBear: request.get:   error =', err);
                cb( err );
                return;
            }
            var data = JSON.parse( body );
            var bear = data.bear;

            if( bear ) {
                cb( null, { message: 'OK Entry already exists', bear: data.bear} );
                return;
            }
            else //if( data.message == 'NG Entry not found') // create new
            {
                request.post(HostAndPort + '/api/bears', {
                    form: {
                        name : that.myId
                    }
                }, function (err, httpResponse, body) {
                    if(err) {
                        console.log('request.post:   error =', err);
                        cb(err);
                        return;
                    }
                    var data = JSON.parse( body ); //{ message: 'OK Bear created', bear : bear }
                    cb( null, { message: 'OK Entry created', bear: data.bear });
                });        
            }
        });
    }

    deleteBear( cb )
    {        
        request.get(HostAndPort + '/api/bears/'+this.myId, function (err, httpResponse, body) {
            if(err) {
                console.log('deleteBear: request.get:   error =', err);
                cb( err );
                return;
            }

            var data = JSON.parse( body );
            var bear = data.bear;
            //console.log('deleteBear: request.get:   data =', data );            

            if(!bear) // e.g. data = { message: 'Bear not found!', id: '9ee278a8-c068-4934-a2d7-9e8a977f44b3' }
            {
                //console.log('deleteBear: request.get:   err: no data._id');
                cb( null, { message: 'OK No entry existed' } );
                return;
            }
            request.delete(HostAndPort + '/api/bears/'+bear._id, function (err, httpResponse, body) {
                if(err) {
                    console.log('deleteBear: request.delete:   error =', err);
                    cb( err );
                    return;
                }
                var data = JSON.parse(body);
                //console.log('deleteBear: request.delete:   data =', data); //data = { message: 'OK Successfully deleted' }
                cb( null, { message: 'OK Successfully deleted' } );
            });

        });
    }






    /*
    var tsL = Date.now().toLocaleString();
    //var tsU = Date.now().toUTCString();
    var utcDate2 = new Date(Date.now());

    console.log('tsL =', tsL);
    //console.log('tsU =', tsU);
    console.log('tsU =', utcDate2);
    console.log('tsU =', utcDate2.toUTCString());
    console.log('tsU =', new Date(Date.now()).toUTCString());
    */

}


module.exports = { Bear };

