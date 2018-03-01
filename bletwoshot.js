
var async = require('async');


test_series = function() {
    async.series([
        function(callback) {
            require('./blechug')
            callback(null, 1);
        },

        function(callback) {
            require('./blepost')
            callback(null, 2);
        }
      ], function(error, results) {      
             console.log(results);
         }
    );      
}
  

test_series();
