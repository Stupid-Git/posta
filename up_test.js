

var TdUp = require('./rembleD/up')

var dummyId = 'aabbccddeeff';
var up = new TdUp(dummyId);

up.on('xxx', (param) => { 
    console.log('up.on(xxx ...) -> ', param)
    console.log('')
})

var async = require('async');


test_series1 = function() {
    async.series([
      function(callback) {
        setTimeout(function() {
          up.on_u_cmd([1,1,10,0]);
          callback(null, 1);
        }, 2000);
      },
      function(callback) {
        setTimeout(function() {
          up.on_u_dat([0,0,0,0, 1,1,1,1,1,1,1,1, 0,0]);
          callback(null, 2);
        }, 20);
      }
    ], function(error, results) {
      //console.log(results);
    });      
  }
  
  test_series2 = function() {
    async.series([
      function(callback) {
        setTimeout(function() {
            up.on_u_cmd([1,1,34,0]);
          callback(null, 1);
        }, 200);
      },
      function(callback) {
        setTimeout(function() {
            up.on_u_dat([0,0,0,0, 1,1,1,1,1,1,1,1,  1,1,1,1,1,1,1,1]);
          callback(null, 2);
        }, 20);
      },
      function(callback) {
        setTimeout(function() {
            up.on_u_dat([1,0,0,0, 1,1,1,1,1,1,1,1,  1,1,1,1,1,1,1,1]);
          callback(null, 2);
        }, 20);
      },
      function(callback) {
        setTimeout(function() {
            up.on_u_dat([2,0,0,0, 32,0]);
          callback(null, 2);
        }, 20);
      }
    ], function(error, results) {
      //console.log(results);
    });      
  }
  
  /* 
up.on_u_cmd([1,1,10,0]);
up.on_u_dat([0,0,0,0, 1,1,1,1,1,1,1,1, 0,0]);

up.on_u_cmd([1,1,10,0]);
up.on_u_dat([0,0,0,0, 1,1,1,1,1,1,1,1, 8,0]);

up.on_u_cmd([1,1,34,0]);
up.on_u_dat([0,0,0,0, 1,1,1,1,1,1,1,1,  1,1,1,1,1,1,1,1]);
up.on_u_dat([1,0,0,0, 1,1,1,1,1,1,1,1,  1,1,1,1,1,1,1,1]);
up.on_u_dat([2,0,0,0, 32,0]);
/* */
/*
up.on_u_cmd([1,1,34,0]);
up.on_u_dat([0,0,0,0, 1,1,1,1,1,1,1,1,  1,1,1,1,1,1,1,1]);
//up.on_u_dat([1,0,0,0, 1,1,1,1,1,1,1,1,  1,1,1,1,1,1,1,1]);
up.on_u_dat([2,0,0,0, 32,0]);

setTimeout( () =>{
    up.on_u_dat([1,0,0,0, 1,1,1,1,1,1,1,1,  1,1,1,1,1,1,1,1]);
} , 4000);
*/

test_series3 = function() {
    async.series([
      function(callback) {
        setTimeout(function() {
            up.on_u_cmd([1,1,34,0]);
          callback(null, 1);
        }, 2000);
      },
      function(callback) {
        setTimeout(function() {
            up.on_u_dat([0,0,0,0, 1,1,1,1,1,1,1,1,  1,1,1,1,1,1,1,1]);
          callback(null, 2);
        }, 20);
      },
      function(callback) {
        setTimeout(function() {
            up.on_u_dat([2,0,0,0, 32,0]);
          callback(null, 2);
        }, 20);
      },
      function(callback) {
        setTimeout(function() {
            up.on_u_dat([1,0,0,0, 1,1,1,1,1,1,1,1,  1,1,1,1,1,1,1,1]);
          callback(null, 2);
        }, 500);
      }
    ], function(error, results) {
      //console.log(results);
    });      
  }
  

  test_seriesAll = function() {
    async.series([
      function(callback) {
        setTimeout(function() {
            test_series1()
          callback(null, 1);
        }, 2000);
      },
      function(callback) {
        setTimeout(function() {
            test_series2()
          callback(null, 2);
        }, 20);
      },
      function(callback) {
        setTimeout(function() {
            test_series3()
          callback(null, 2);
        }, 20);
      }
    ], function(error, results) {
      //console.log(results);
    });      
  }
  
  test_seriesAll();
