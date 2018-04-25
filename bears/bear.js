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

var HostAndPort = 'http://localhost:8080';

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
            console.log('request.get   err =',err);
            console.log('request.get   body =', body);

            var data = JSON.parse(body);
            data.forEach( function(element) {
                console.log('--------------------------------------------------------------------------------');
                console.log(element);
            });
            console.log('--------------------------------------------------------------------------------');
                        
            //console.log('request.get   body._id =', data._id);
            //console.log('request.get   body.name =', data.name);
            //console.log('--------------------------------------------------------------------------------');
        });
    }

    loadFullData( cb ) {
        request.get(HostAndPort + '/api/bears/'+this.myId, function (err, httpResponse, body) {
            if( err )
                cb( err);

            var data = JSON.parse(body);
            //console.log('request.get   body._id =', data._id);
            //console.log('--------------------------------------------------------------------------------');
            cb( err, data ); // note: err == null at this point
        });
    }

    getOffer( cb ) {
        request.get(HostAndPort + '/api/bears/'+this.myId, function (err, httpResponse, body) {
            if( err )
                cb( err);

            var data = JSON.parse(body);
            var offer = data.offer;
            //console.log('request.get   body._id =', data._id);
            //console.log('--------------------------------------------------------------------------------');
            cb( err, offer ); // note: err == null at this point
        });
    }
    
    setOffer(tdid, offer, cb) {
        //console.log('this.myId = ', this.myId);       
        // direct way
        request.get(HostAndPort + '/api/bears/'+this.myId, function (err, httpResponse, body) {
            //console.log('request.get err =',err);
            //console.log('request.get body =', body);
            var data = JSON.parse(body);
            //console.log('request.get body._id =', data._id);
            var _id = data._id;
            if( _id == null)
                cb('Error: ID not found') //return;

            request.put(HostAndPort + '/api/bears/'+_id, {
                form: {
                    tdid : tdid,
                    offer : offer
                }
                }, function (err, httpResponse, body) {
                    
                    if(err)
                        cb(err)

                    cb( null, 'OK');
                    //console.log('=====================================================================');
                    //console.log('request.put err =', err);
                    //console.log('=====================================================================');
                    //console.log('request.put body =', body);
                    //console.log('=====================================================================');
            });                      
        });

    }

    make_me() {
        console.log('this.myId = ', this.myId);   

        request.post(HostAndPort + '/api/bears', {
            form: {
                name : this.myId
            }
        }, function (err, httpResponse, body) {
            
            //console.log('=====================================================================');
            //console.log( err );
            ////console.log('=====================================================================');
            ////console.log( httpResponse );
            //console.log('=====================================================================');
            //console.log( body); // == {"message":"Bear created!"}
            //console.log('=====================================================================');
        
            // direct way
            request.get(HostAndPort + '/api/bears', function (err, httpResponse, body) {
                console.log('request.get   err =',err);
                console.log('request.get   body =', body);
                console.log('--------------------------------------------------------------------------------');
            });
                //client.get(HostAndPort + '/api/bears', function (data, response) {
            //    console.log(data);
            //});
        
        });
        
    }

    check_me() {
        //console.log('this.myId = ', this.myId);   
        var that = this;
        request.get(HostAndPort + '/api/bears/'+this.myId, function (err, httpResponse, body) {
            //console.log('request.get   err =',err);
            //console.log('request.get   body =', body);

            var data = JSON.parse(body);

            //var data = JSON.parse(body);
            //console.log('request.get   body._id =', data._id);
            //console.log('request.get   body.name =', data.name);
            if(data.message) {
                if(data.message == 'Bear not found!') {
                    that.make_me();
                } else {
                    console.log('message != Bear not ..')
                }
            } else {
                console.log('No message')
            }
            //console.log('--------------------------------------------------------------------------------');
        });

        // direct way
        /*
        client.get(HostAndPort + '/api/bears/'+this.myId, function (data, response) {
            // parsed response body as js object
            console.log(data);
            if(data.message == 'Bear not found!') {
                make_me(this.myId);
            }

            // raw response
            //console.log(response);
        });
        */    
    }


    check_me2(tdid, offer, cb) {
        //console.log('this.myId = ', this.myId);       
        // direct way
        request.get(HostAndPort + '/api/bears/'+this.myId, function (err, httpResponse, body) {
            //console.log('request.get err =',err);
            //console.log('request.get body =', body);
            var data = JSON.parse(body);
            //console.log('request.get body._id =', data._id);
            var _id = data._id;
            if( _id == null)
                cb('Error: ID not found') //return;

            request.put(HostAndPort + '/api/bears/'+_id, {
                form: {
                    tdid : tdid,
                    offer : offer
                }
                }, function (err, httpResponse, body) {
                    
                    if(err)
                        cb(err)

                    cb( null, 'OK');
                    //console.log('=====================================================================');
                    //console.log('request.put err =', err);
                    //console.log('=====================================================================');
                    //console.log('request.put body =', body);
                    //console.log('=====================================================================');
            });                      
        });

    }

    jesus_1()
    {
        //check_me();
        //var offer = JSON.stringify({ quote: 'No one fucks with the Jesus!'});
        var offer = { quote: 'No one fucks with The Jesus 1', mqttofferin : '/de543deac2398cb8def/offerin'};
        //this.check_me2( '112233445566', offer, (err, data) => {}   );
        this.check_me2( null, offer, (err, data) => {} );
    }
    jesus_2()
    {
        //check_me();
        //var offer = JSON.stringify({ quote: 'No one fucks with the Jesus!'});
        var offer = { 
            quote: 'No one fucks with The Jesus 2', 
            mqttofferin : '/de543deac2398cb8def/offerin',
            mqttanswerout : '/de543deac2398cb8def/answerout',
        };
        //this.check_me2( '112233445566', offer , (err, data) => {}  );
        this.check_me2( null, offer, (err, data) => {}   );
    }
    jesus_n(n, cb)
    {
        //check_me();
        //var offer = JSON.stringify({ quote: 'No one fucks with the Jesus!'});
        var offer = { 
            quote: 'No one fucks with The Jesus ' + n.toString(), 
            mqttofferin : '/de543deac2398cb8def/offerin',
            mqttanswerout : '/de543deac2398cb8def/answerout',
        };
        //this.check_me2( '112233445566', offer, (err, data) => {}   );
        this.check_me2( null, offer, (err, data) => { cb(err,data)}   );
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

