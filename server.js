const express = require('express'),
        app = express.createServer(),
	redis = require('redis-client'),
	db = redis.createClient(),
	io = require('socket.io'),
	sock = io.listen(app);


app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set("view options", {layout: false});
    app.use(express.static(__dirname + '/public'));
});

app.register('.html', {
    compile: function(str, options){
	return function(locals){
            return str;
	};
    }
});
 
app.get('/', function(req, res) {
	res.render("index.html");
});

sock.on("connection",function(c) {
	c.on("message",function(m) {
		sock.broadcast(m);
	});
});
 
app.listen(8000);