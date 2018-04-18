

var Bear = require('./bear.js').Bear;

var bearA = [];

const machineIdSync = require('node-machine-id').machineIdSync;
let id2 = machineIdSync({original: true})
// id = 98912984-c4e9-5ceb-8000-03882a0485e4

console.log('machineIdSync id2 ', id2);
var id3 = id2.substr(0, id2.length-2) + '_' + '0';
console.log('machineIdSync id3 ', id3);

var s = "this is a test string.".substr(19, 3);
var s1 = "this is a test string.".slice(15, 21);
console.log(s);
console.log(s1);

var b = new Bear(id2);
bearA.push(b)
b = new Bear(id3);
bearA.push(b)

console.log('--------------------------------------------------------------------------------');
bearA[0].GET_print();
bearA[0].check_me();
console.log('--------------------------------------------------------------------------------');
bearA[1].GET_print();
bearA[1].check_me();
bearA[1].jesus_2();
