const express = require('express'),
        config = require('./config.js').config,
        app = express.createServer(),
        redisStore = require('connect-redis')(express);
	redis = require('redis-client'),
	db = redis.createClient(),
        rest = require('restler'),
        io = require('socket.io').listen(app);

/* CONFIG STUFF */

var users = [];
var port = config[config.build].port;
var host = config[config.build].host + ':' + port;

console.log("running build: %s", config.build);

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set("view options", {layout: false});
    app.use(express.logger());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    app.use(express.session({ store: new redisStore, secret: "sekrit" }));
    app.use(app.router);
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler());
});

app.register('.html', {
    compile: function(str, options) {
	return function(locals){
            return str;
	};
    }
});

app.listen(port);


/* ROUTES */
 
app.get('/', function(req, res) {
    console.log("session: " + req.session.id);
    res.render("index.html");
});

/* SOCKETS */
io.sockets.on('connection', function(client) {

    /* Handle session reconnect, page reloads, etc. */

    client.on('browserid', function(data) {
	rest.post("https://browserid.org/verify", 
		  { data: {assertion: data.assertion, audience: host} }).on('complete', function(bData, response) {
		      if (bData.status == "okay") {
			  users[client.id] = data.username;
			  client.emit('authPassed', {username: data.username});
		      } else {
			  console.log("auth error");
		      }
		  });
    });

    client.on('chatMsg', function(data) {
	if (users[client.id] != "") {
	    client.broadcast.emit('chatMsg', {nick: users[client.id], msg: data.chatMsg});
	} else {
	    console.log("user not logged in");
	}
    });

});
