

var Bear = require('./bear.js').Bear;
var Uza = require('./uza.js').Uza;

var bearA = [];

const machineIdSync = require('node-machine-id').machineIdSync;
let id2 = machineIdSync({original: true})
// id = 98912984-c4e9-5ceb-8000-03882a0485e4

console.log('machineIdSync id2 ', id2);
var id3 = id2.substr(0, id2.length-2) + '_' + '0';
console.log('machineIdSync id3 ', id3);
/*
var s = "this is a test string.".substr(19, 3);
var s1 = "this is a test string.".slice(15, 21);
console.log(s);
console.log(s1);
*/

/**/
var b;
b = new Bear(id2);
bearA.push(b)
b = new Bear(id3);
bearA.push(b)

//console.log('--------------------------------------------------------------------------------');
bearA[0].getPrint();
bearA[0].check_me();
//console.log('--------------------------------------------------------------------------------');
bearA[1].getPrint();
bearA[1].check_me();
bearA[1].jesus_2();
/**/

/*
b = bearA[1];
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

/*
b = bearA[1];
b.getOffer( (err, offer) => {

    var quote = offer.quote;
    quote += '7';
    offer.quote = quote;

    b.setOffer(null, offer, (err, data) => {

    });
});
*/

//b.getAllPrint();

var u0 = new Uza('karel');
//u0.createUser_me();

var u1 = new Uza('john');
//u1.createUser_me();

function doDeletes()
{
    //u0.deleteUser_me();
    //u1.deleteUser_me();
}

setTimeout( doDeletes, 3000);

u0.getBears( (err, bears) => {

    console.log('bears =', bears)
    bears = [ '9ee278a8-c068-4934-a2d7-9e8a977f44_0' ];

    u0.setBears('fake_tdid', bears, (err, data) => {
        console.log('data =', data)

    });
    
});

u0.getBears( (err, bears) => {

    console.log('bears =', bears)
    b = new Bear( bears[0] );
    b.getPrint();
    
});

/*
function sayHi(phrase, who) {
    console.log( phrase + ', ' + who );
    u.getAllPrint();
}
  
setTimeout(sayHi, 1000, "Hello", "John"); // Hello, John
*/