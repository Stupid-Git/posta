
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




//b.getAllPrint();

var u0 = new Uza('karel');
//u0.createUser_me( (err) => {} );
u0.getOrCreateUser( (err, data) => {} );

var u1 = new Uza('john');
//u1.createUser_me( (err) => {} );
u1.getOrCreateUser( (err, data) => {} );

function doDeleteUsers()
{
    //u0.deleteUser_me( (err) => {} );
    //u1.deleteUser_me( (err) => {} );
}

setTimeout( doDeleteUsers, 3000);

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