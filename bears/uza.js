// https://www.npmjs.com/package/request
// https://github.com/request/request
// https://stackoverflow.com/questions/35473265/how-to-post-data-in-node-js-with-content-type-application-x-www-form-urlencode

const request = require('request');

//var HostAndPort = 'http://localhost:8080';
var HostAndPort = 'http://ocn.cloudns.org:6565';

var Uza = class {

    constructor(uzaName)
    {        
        this.myName = uzaName;
    }

    getPrint() {
        //console.log('this.myName = ', this.myName);       
        // direct way
        request.get(HostAndPort + '/api/uzas/'+this.myName, function (err, httpResponse, body) {
            //console.log('request.get   err =',err);
            //console.log('request.get   body =', body);

            var data = JSON.parse(body);
            //console.log('request.get   body._id =', data._id);
            //console.log('request.get   body.name =', data.name);
            //console.log('--------------------------------------------------------------------------------');
        });
    }

    getAllPrint() {
        request.get(HostAndPort + '/api/uzas/', function (err, httpResponse, body) {
            if(err){
                return;
            }
            var data = JSON.parse(body);
            var i = 0;
            data.forEach( function(element) {
                console.log('--------------------------------------------------------------------------------');
                console.log('Entry: ', i++, element);
            });
            console.log('--------------------------------------------------------------------------------');
        });
    }

    loadFullData( cb ) {
        request.get(HostAndPort + '/api/uzas/'+this.myName, function (err, httpResponse, body) {
            if( err ) {
                cb( err);
                return;
            }
            var data = JSON.parse(body);
            cb( err, data ); // note: err == null at this point
        });
    }
    /*
    getBears( cb ) {
        request.get(HostAndPort + '/api/uzas/'+this.myName, function (err, httpResponse, body) {
            if( err ) {
                cb( err);
                return;
            }
            var data = JSON.parse(body);
            var bears = data.bears;
            cb( err, bears ); // note: err == null at this point
        });
    }
    setBears(tdid, bears, cb) {
        request.get(HostAndPort + '/api/uzas/'+this.myName, function (err, httpResponse, body) {
            var data = JSON.parse(body);
            var _id = data._id;
            if( _id == null) {
                cb('Error: ID not found') 
                return;
            }
            request.put(HostAndPort + '/api/uzas/'+_id, {
                form: {
                    tdid : tdid,
                    bears : bears
                }
                }, function (err, httpResponse, body) {                    
                    if(err) {
                        cb(err);
                        return;
                    }
                    cb( null, {message: 'OK'} );
            });                      
        });

    }
    */
    getDataUza( cb ) {
        request.get(HostAndPort + '/api/uzas/'+this.myName, function (err, httpResponse, body) {
            if( err ) {
                cb( err );
                return;
            }
            var data = JSON.parse(body);
            var uza = data.uza;
            cb( err, uza ); // note: err == null at this point
            //var bears = data.azu.bears;
            //cb( err, bears ); // note: err == null at this point
        });
    }
    
    putDataUza(tdid, bears, cb) {
        request.get(HostAndPort + '/api/uzas/'+this.myName, function (err, httpResponse, body) {
            if( err ) {
                cb( err );
                return;
            }
            var data = JSON.parse(body);
            var uza = data.uza;
            if( !uza ) {
                cb( null, { message: 'NG Entry not found', uza: data.uza} );
                return;
            }
            request.put(HostAndPort + '/api/uzas/'+uza._id, {
                form: {
                    tdid : tdid,
                    bears : bears
                }
                }, function (err, httpResponse, body) {                    
                    if(err) {
                        cb(err);
                        return;
                    }
                    var data = JSON.parse(body);   //{"message":"Bear updated!","bear":{"_id":"5ae1813f60377420023f55cb","name":"9ee278a8-c068-4934-a2d7-9e8a977f44b3","__v":0,"dateStamp":"Thu Apr 26 2018 16:51:56 GMT+0900 (JST)","offer":{"quote":"No one fucks with The Jesus ","mqttofferin":"/de543deac2398cb8def/offerin","mqttanswerout":"/de543deac2398cb8def/answerout"},"timeStamp":1524729116718}}

                    var uza = data.uza;
                    cb( null, { message: 'OK Entry updated', uza: data.uza} );
            });                      
        });

    }


    getOrCreateUser( cb ) {
        var that = this;
        //console.log('req.body.name: this.myId = ', this.myId);
        request.get(HostAndPort + '/api/uzas/'+this.myName, function (err, httpResponse, body) {
            if(err) {
                console.log('getOrCreateUser: request.get:   error =', err);
                cb( err );
                return;
            }
            var data = JSON.parse( body );
            var uza = data.uza;

            if( uza ) {
                cb( null, { message: 'OK Entry already exists', uza: data.uza} );
                return;
            }
            else //if( data.message == 'NG Entry not found') // create new
            {
                request.post(HostAndPort + '/api/uzas', {
                    form: {
                        name : that.myName
                    }
                }, function (err, httpResponse, body) {
                    if(err) {
                        console.log('request.post:   error =', err);
                        cb(err);
                        return;
                    }
                    var data = JSON.parse( body ); //{ message: 'OK User created', uza : uza }
                    cb( null, { message: 'OK Entry created', uza: data.uza });
                });        
            }
        });
    }
    /*
    deleteUser_me( cb )
    {        
        request.delete(HostAndPort + '/api/uzas/'+this.myName, function (err, httpResponse, body) {
        //request.delete(HostAndPort + '/api/uzas/5add45ac88e11e2e9034fa6a', function (err, httpResponse, body) {
            if(err) {
                console.log('request.delete:   error =', err);
                cb( err );
                return;
            }
            var data = JSON.parse(body);
            console.log('request.delete:   data =', data);
            cb( err, data );
        });
    }
    */
    deleteUser( cb )
    {        
        request.get(HostAndPort + '/api/uzas/'+this.myName, function (err, httpResponse, body) {
            if(err) {
                console.log('deleteUser: request.get:   error =', err);
                cb( err );
                return;
            }

            var data = JSON.parse( body );
            var uza = data.uza;
            //console.log('deleteUser: request.get:   data =', data );            

            if(!uza) // e.g. data = { message: 'Bear not found!', id: '9ee278a8-c068-4934-a2d7-9e8a977f44b3' }
            {
                //console.log('deleteUser: request.get:   err: no data._id');
                cb( null, { message: 'OK No entry existed' } );
                return;
            }
            request.delete(HostAndPort + '/api/uzas/'+uza._id, function (err, httpResponse, body) {
                if(err) {
                    console.log('deleteUser: request.delete:   error =', err);
                    cb( err );
                    return;
                }
                var data = JSON.parse(body);
                //console.log('deleteUser: request.delete:   data =', data);
                // data = { message: 'Successfully deleted' }
                cb( null, { message: 'OK Successfully deleted' } );
            });

        });
    }



    check_me() {
        //console.log('this.myName = ', this.myName);   
        var that = this;
        request.get(HostAndPort + '/api/uzas/'+this.myName, function (err, httpResponse, body) {
            //console.log('request.get   err =',err);
            //console.log('request.get   body =', body);

            var data = JSON.parse(body);

            //var data = JSON.parse(body);
            //console.log('request.get   body._id =', data._id);
            //console.log('request.get   body.name =', data.name);
            if(data.message) {
                if(data.message == 'Uza not found!') {
                    that.make_me();
                } else {
                    console.log('message != Uza not ..')
                }
            } else {
                console.log('No message')
            }
            //console.log('--------------------------------------------------------------------------------');
        });

        // direct way
        /*
        client.get(HostAndPort + '/api/uzas/'+this.myName, function (data, response) {
            // parsed response body as js object
            console.log(data);
            if(data.message == 'Uza not found!') {
                make_me(this.myName);
            }

            // raw response
            //console.log(response);
        });
        */    
    }


    check_me2(tdid, bears, cb) {
        //console.log('this.myName = ', this.myName);       
        // direct way
        request.get(HostAndPort + '/api/uzas/'+this.myName, function (err, httpResponse, body) {
            //console.log('request.get err =',err);
            //console.log('request.get body =', body);
            var data = JSON.parse(body);
            //console.log('request.get body._id =', data._id);
            var _id = data._id;
            if( _id == null)
                cb('Error: ID not found') //return;

            request.put(HostAndPort + '/api/uzas/'+_id, {
                form: {
                    tdid : tdid,
                    bears : bears
                }
                }, function (err, httpResponse, body) {
                    
                    if(err) {
                        cb(err);
                        return;
                    }

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
        var bears = [ 'Bear called Jesus 1',  'Bear called Jesus 2' ];
        //this.check_me2( '112233445566', bears, (err, data) => {}   );
        this.check_me2( null, bears, (err, data) => {} );
    }
    jesus_2()
    {
        //check_me();
        var bears = [ 'Bear called Jesus 21',  'Bear called Jesus 22'];
        //this.check_me2( '112233445566', bears , (err, data) => {}  );
        this.check_me2( null, bears, (err, data) => {}   );
    }
    jesus_n(n, cb)
    {
        //check_me();
        var bears = [ 'Bear called Jesus 21',  'Bear called Jesus 22'];
        bears.forEach( (value, index, array) => {
            value += n.toString(); 
        });
        //this.check_me2( '112233445566', bears, (err, data) => {}   );
        this.check_me2( null, bears, (err, data) => { cb(err,data)}   );
    }

}


module.exports = { Uza };

