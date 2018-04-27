
var Bear = require('./bear.js').Bear;
var Uza = require('./uza.js').Uza;

const machineIdSync = require('node-machine-id').machineIdSync;
let mid = machineIdSync({original: true})
// mid = 98912984-c4e9-5ceb-8000-03882a0485e4

console.log('T: machineIdSync mid =', mid);
//var mid3 = mid.substr(0, mid.length-2) + '_' + '0';
//console.log('machineIdSync mid3 ', mid3);

console.log('T: --------------------------------------------------------------------------------');
var b;
b = new Bear(mid);

b.getOrCreateBear( (err, data) => {

    if(err) {
        console.log('T: loadFullData   err =', err);
        return;
    }
    console.log('T: getOrCreateBear returned data.bear._id =', data.bear._id);

    console.log('T: --------------------------------------------------------------------------------');

    var offer = { 
        quote: 'No one fucks with The Jesus ', 
        mqttofferin : '/de543deac2398cb8def/offerin',
        mqttanswerout : '/de543deac2398cb8def/answerout',
    };

    b.putDataBear( null, offer, (err, data) => {

        console.log('T: putDataBear.data.bear._id =', data.bear._id);
        
        b.getDataBear( (err, bear) => {
            console.log('T: getDataBear.offer =', bear.offer);
            /*
            b.loadFullData( (err, data) => {
                if(err) {
                    console.log('T: loadFullData return error =', err);
                    return;
                }
                console.log('T: loadFullData returned data.bear._id =', data.bear._id);

                doDeleteBears();

            });
            */
        });
    })
})

//b.getPrint();


/* ------------------------------------------------------------------------

function doDeleteBears()
{
    console.log('T: --------------------------------------------------------------------------------');
    b.deleteBear( (err, data) => {
        if( err ) {
            console.log('T: deleteBear returned err =', err);
            return;            
        }
        console.log('T: deleteBear returned data =', data); //{ message: 'OK Successfully deleted' }
        //b.getPrint();

        b.deleteBear( (err, data) => {
            if( err ) {
                console.log('T: deleteBear returned err =', err);
                return;            
            }
            console.log('T: deleteBear returned data =', data); //{ message: 'OK No entry existed' }
        })
    })
    //u0.deleteUser_me( (err) => {} );
    //u1.deleteUser_me( (err) => {} );
}
setTimeout( doDeleteBears, 3000);



//console.log('--------------------------------------------------------------------------------');

b.getOrCreateBear( (err, data) => {

    if(err) {
        console.log('T: loadFullData   err =', err);
        return;
    }
    console.log('T: getOrCreateBear returned data.bear._id =', data.bear._id);

    console.log('T: --------------------------------------------------------------------------------');


    b.getPrint();
    //b.jesus_2();
------------------------------------------------------------------------*/
/*
    b.jesus_n(111, (err, data) => {
        console.log('[ CB ] data = ', data);

        b.loadFullData( (err, data) => {
            if(err)
                return;
            console.log('[...] data.name', data.name);
            console.log('[...] data.offer.quote', data.offer.quote);
        
            b.jesus_n(110, (err, data) => {
                console.log('[ CB ] data = ', data);
                b.loadFullData( (err, data) => {
                    if(err)
                        return;
                    console.log('[...] data.name', data.name);
                    console.log('[...] data.offer.quote', data.offer.quote);            
                });
            });
        
        });
    });
*/
/*------------------------------------------------------------------------

    function doGetPutBear() {
        console.log('T: doGetPutBear');
        b.getDataBear( (err, bear) => {

            if(!bear.offer) {
                bear.offer = { quote:'', xxx: '', zzz: ''}
            }

            console.log('T:      bear.offer.quote =', bear.offer.quote);
            bear.offer.quote += '!';
            b.putDataBear(null, bear.offer, (err, data) => {
                //data = { message: 'OK Entry updated', bear: { _id: '5ae18caa60377420023f55cf', ....
                //console.log('T: putDataBear -> data =', data);
                console.log('T: data.bear.offer.quote =', data.bear.offer.quote);
            });
        });
    }
    setTimeout( doGetPutBear, 2000);

});


//b.getAllPrint();

//var u0 = new Uza('karel');
var u0 = new Uza('fred');
u0.getOrCreateUser( (err, data) => {
    if(err) {
        console.log('T: getOrCreateUser   err =', err);
        return;
    }
    console.log('T: getOrCreateUser returned data.uza._id =', data.uza._id);
    console.log('T: getOrCreateUser returned data =', data);

    
    function doGetPutUza() {
        console.log('T: doGetPutUza');
        u0.getDataUza( (err, uza) => {

            //uza.bears.push('teddyBear');
            uza.bears[0] = mid;
            //console.log('T: uza =', uza);
            //console.log('T: uza.name =', uza.name);
            console.log('T: uza.bears =', uza.bears);
            u0.putDataUza(null, uza.bears, (err, data) => {

            });
        });
    }
    setTimeout(doGetPutUza, 100);
});

var u1 = new Uza('john');
u1.getOrCreateUser( (err, data) => {
    if(err) {
        console.log('T: getOrCreateUser   err =', err);
        return;
    }
    console.log('T: getOrCreateUser returned data.uza._id =', data.uza._id);
    console.log('T: getOrCreateUser returned data =', data);
});

function doDeleteUsers()
{
    u0.deleteUser( (err, data) => {
        if( err ) {
            console.log('T: deleteUser returned err =', err);
            return;            
        }
        console.log('T: deleteUser returned data =', data); //{ message: 'OK No entry existed' }
    })

    u1.deleteUser( (err, data) => {
        if( err ) {
            console.log('T: deleteUser returned err =', err);
            return;            
        }
        console.log('T: deleteUser returned data =', data); //{ message: 'OK No entry existed' }
    })
}
//setTimeout( doDeleteUsers, 3000);

------------------------------------------------------------------------*/


/*
u0.getBears( (err, bears) => {

    console.log('bears =', bears)
    //bears = [ '9ee278a8-c068-4934-a2d7-9e8a977f44_0' ];
    bears = [ mid ];

    u0.setBears('fake_tdid', bears, (err, data) => {
        console.log('data =', data)

    });
    
});

u0.getBears( (err, bears) => {

    console.log('bears =', bears)
    b = new Bear( bears[0] );
    b.getPrint();
    
});
*/

/*
function sayHi(phrase, who) {
    console.log( phrase + ', ' + who );
    u.getAllPrint();
}
  
setTimeout(sayHi, 1000, "Hello", "John"); // Hello, John
*/


var uzaKarel = new Uza('karel');
uzaKarel.getOrCreateUser( (err, data) => {
    if(err) {
        console.log('T: getOrCreateUser   err =', err);
        return;
    }
    console.log('T: KKKgetOrCreateUser returned data.uza._id =', data.uza._id);
    console.log('T: KKKgetOrCreateUser returned data =', data);

    
    function doGetPutUza() {
        console.log('T: KKKdoGetPutUza');
        uzaKarel.getDataUza( (err, uza) => {

            //uza.bears.push('teddyBear');
            uza.bears[0] = '9ee278a8-c068-4934-a2d7-9e8a977f44b3'; // local vscodeconsole ID
            //uza.bears[0] = '9ee278a8-c068-4934-a2d7-9e8a977f44_0';
            //console.log('T: uza =', uza);
            //console.log('T: uza.name =', uza.name);
            console.log('T: KKKuza.bears =', uza.bears);
            uzaKarel.putDataUza(null, uza.bears, (err, data) => {

            });
        });
    }
    setTimeout(doGetPutUza, 100);
});

