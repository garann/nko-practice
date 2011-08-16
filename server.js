const express = require('express'),
        connect = require('connect'),
        config = require('./config.js').config,
        User = require('./lib/User.js').User,
	app = express.createServer(),
        redisStore = require('connect-redis')(express);
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

var getSID = function(client) {
    var clientCookies = connect.utils.parseCookie(client.handshake.headers.cookie);
    return clientCookies['connect.sid'];
}

/* SOCKETS */
io.sockets.on('connection', function(client) {

    /* Handle session reconnect, page reloads, etc. */
    client.sId = getSID(client);
    if (users[client.sId]) {
	client.emit('authPassed', {username: users[client.sId].username});
    } else {
	console.log("No user for session: "+client.sId);
    }

    client.on('browserid', function(data) {
	rest.post("https://browserid.org/verify", 
		  { data: {assertion: data.assertion, audience: host} }).on('complete', function(bData, response) {
		      if (bData.status == "okay" && bData.audience == host) {
			  users[client.sId] = new User(client.sId, bData.email, data.username);
			  client.emit('authPassed', {username: data.username});
		      } else {
			  console.log("auth error");
		      }
		  });
    });

    client.on('chatMsg', function(data) {
	if (users[client.sId] != "") {
	    client.broadcast.emit('chatMsg', {nick: users[client.sId].username, msg: data.chatMsg});
	} else {
	    console.log("user not logged in");
	}
    });

});
