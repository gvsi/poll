/*jshint node:true*/
var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var redis = require('redis');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.cookieParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    store: new MongoStore({
    	url: 'mongodb://gvsi:edinbros@dogen.mongohq.com:10001/app31163915'
    }),
    secret: 'keyboard cat'
}));
app.use(express.session({secret: 'keyboard cat'}));

app.use(app.router);

// Handle Errors gracefully
app.use(function(err, req, res, next) {
	if(!err) return next();
	console.log(err.stack);
	res.json({error: true});
});

// Main App Page
//app.get('/', routes.index);

app.get('/', routes.index);

// MongoDB API Routes
app.get('/polls/polls', routes.list);
app.get('/polls/:id', routes.poll);
app.post('/polls', routes.create);
app.post('/vote', routes.vote);

io.sockets.on('connection', routes.vote);

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});