// http://www.informit.com/articles/article.aspx?p=2265406&seqNum=2
var async = require('async');


test_series = function() {
  async.series([
    function(callback) {
      setTimeout(function() {
        console.log('Task1 1');
        callback(null, '1 Banana');
      }, 300);
    },
    function(callback) {
      setTimeout(function() {
        console.log('Task1 2');
        callback(null, 2);
      }, 200);
    },
    function(callback) {
      setTimeout(function() {
        console.log('Task1 3');
        callback(null, 3);
      }, 100);
    }
  ], function(error, results) {
    console.log(results);
  });      
}

test_parallel = function() {
  async.parallel([       //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    function(callback) {
      setTimeout(function() {
        console.log('Task2 1');
        callback(null, 1);
      }, 300);
    },
    function(callback) {
      setTimeout(function() {
        console.log('Task2 2');
        callback(null, 2);
      }, 200);
    },
    function(callback) {
      setTimeout(function() {
        console.log('Task2 3');
        callback(null, 3);
      }, 100);
    }
  ], function(error, results) {
    console.log(results);
  });
}

test_parallelLimit = function() {
  async.parallelLimit([
    function(callback) {
      setTimeout(function() {
        console.log('Task3 1');
        callback(null, 1);
      }, 300);
    },
    function(callback) {
      setTimeout(function() {
        console.log('Task3 2');
        callback(null, 2);
      }, 200);
    },
    function(callback) {
      setTimeout(function() {
        console.log('Task3 3');
        callback(null, 3);
      }, 100);
    }
  ], 2, function(error, results) {
    console.log(results);
  });
}

test_waterfall = function() {
  async.waterfall([
    function(callback) {
      console.log('Task4-1 Generate 12 and 15');
      callback(null, 12, 15);
    },
    function(a, b, callback) {
      console.log('Task4-2 return( (12+15)*10 ) ');
      callback('null2', (a + b) * 10);
    },
    function(cc, callback) {
      console.log('Task4-3 return( Sqrt(n) ) ');
      callback('null3', Math.sqrt(cc));
    }
  ], function(error, c) {
    console.log(error);
    console.log(c);
  });
}


//=============================================================================
//=============================================================================
//=============================================================================
//=============================================================================

function requireFromString(src, filename) {
  var Module = module.constructor;
  var m = new Module();
  m._compile(src, filename);
  return m.exports;
}

var Module = require('module');
var path = require('path');

//https://github.com/floatdrop/require-from-string
// note: parent - child problems when I just copy the code and
//       use it as shown here, rather than require it.
function requireFromString2(code, filename, opts) {
  if (typeof filename === 'object') {
		opts = filename;
		filename = undefined;
	}

	opts = opts || {};
	filename = filename || '';

	opts.appendPaths = opts.appendPaths || [];
	opts.prependPaths = opts.prependPaths || [];

	if (typeof code !== 'string') {
		throw new Error('code must be a string, not ' + typeof code);
	}
 // var Module = module.constructor; //kkk
	var paths = Module._nodeModulePaths(path.dirname(filename));

	var parent = module.parent;
	var m = new Module(filename, parent);
	m.filename = filename;
	m.paths = [].concat(opts.prependPaths).concat(paths).concat(opts.appendPaths);
	m._compile(code, filename);

	var exports = m.exports;
//kkk	parent.children && parent.children.splice(parent.children.indexOf(m), 1);

return exports;
}

console.log('module.exports = { test: 1}');
console.log(requireFromString2('module.exports = { test: 1}', ''));
console.log('module.exports = { test: 1}');
//=============================================================================

test_readandcall = function()
{
  var fs = require('fs');
  fs.readFile('test_readmeandcall.js','utf-8', function(err,src){
        if (err) {
          throw err;
        }
        console.log('I am executed from the file finishes reading');
        console.log('File content: ');
        //console.log(src);


        console.log('---------- requireFromString( src, ... ) ----------');
        var testclass = requireFromString( src, '');
        console.log('testclass = ' , testclass);
        var tt = new testclass.testClass();
        tt.test();
        console.log('---------- requireFromString( src, ... ) ----------');

        // https://github.com/floatdrop/require-from-string
        console.log('requireFromString2( src, )');
        var testclass = requireFromString2( src, '');
        console.log('testclass = ' , testclass);
        var tt = new testclass.testClass();
        tt.test();
        console.log('requireFromString2( src, )');

        //NG src();
        // https://github.com/substack/lexical-scope
        ///var _context = require('repl').start({prompt: '$> '}).context;
     //   var detect = require('lexical-scope');
     //   var scope = detect(src);
        //console.log(JSON.stringify(scope,null,2));
        ///for (var name in scope.locals[''] )
        ///    _context[scope.locals[''][name]] = eval(scope.locals[''][name]);
        ///for (name in scope.globals.exported)
        ///    _context[scope.globals.exported[name]] = eval(scope.globals.exported[name]);
  });
}

//=============================================================================
//=============================================================================
//=============================================================================

//test_series();
//test_parallel();
//test_parallelLimit();
//test_waterfall();

test_readandcall();
