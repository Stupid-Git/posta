// https://www.npmjs.com/package/request
// https://github.com/request/request
// https://stackoverflow.com/questions/35473265/how-to-post-data-in-node-js-with-content-type-application-x-www-form-urlencode

const request = require('request');


var HostAndPort = 'http://localhost:8080';

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

    createUser_me() {
        //console.log('req.body.name: this.myName = ', this.myName);   
        request.post(HostAndPort + '/api/uzas', {
            form: {
                name : this.myName
            }
        }, function (err, httpResponse, body) {
            if(err) {
                console.log('request.post:   error =', err);
                return;
            }

            var data = JSON.parse( body );
            console.log('createUser_me rsp =', data);
        
            request.get(HostAndPort + '/api/uzas/'+data.name, function (err, httpResponse, body) {
                console.log('request.get   data =', JSON.parse( body ) );
                console.log('--------------------------------------------------------------------------------');
            });
        
        });
        
    }

    deleteUser_me()
    {        
        request.delete(HostAndPort + '/api/uzas/'+this.myName, function (err, httpResponse, body) {
        //request.delete(HostAndPort + '/api/uzas/5add45ac88e11e2e9034fa6a', function (err, httpResponse, body) {
            if(err) {
                console.log('request.delete:   error =', err);
                return;
            }
            var data = JSON.parse(body);
            console.log('request.delete:   data =', data);
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

