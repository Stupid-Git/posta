var express = require('express');
var bodyparser = require('body-parser');
var path = require('path');

var app = express();

var logger = function(res, req, next) {
	console.log('Logging...');
	next();
}

app.use(logger);

// BodtParser Middleware
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: false}));

// Set Static Path
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '')));
//app.use(express.static('./mqServer.html'));

//app.get('/', function(req, res){
//	res.send('Hello World');
//});

app.listen(9100, function(){
	console.log('Started Server on Port 9100...');
})


