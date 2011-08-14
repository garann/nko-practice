const express = require('express'),
        app = express.createServer(),
        redisStore = require('connect-redis')(express);
	redis = require('redis-client'),
	db = redis.createClient(),
	io = require('socket.io'),
	sock = io.listen(app);

/* CONFIG STUFF */

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

app.listen(8000);


/* ROUTES */
 
app.get('/', function(req, res) {
    console.log("session: " + req.session.id);
    res.render("index.html");
});


/* SOCKETS */

sock.on("connection",function(c) {
    c.on("message",function(m) {
	sock.broadcast(m);
    });
});
