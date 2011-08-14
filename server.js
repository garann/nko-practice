const express = require('express'),
	app = express.createServer(),
	redis = require('redis-client'),
	db = redis.createClient(),
	io = require('socket.io'),
	sock = io.listen(app);
var connectedUsers = [];


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
	c.on("chatmsg",function(m) {
		sock.broadcast(m);
	});
	c.on("changenick",function(n) {
		if (n.prev == "") {
			connectedUsers.push(n.new);
		} else {
			var i = connectUsers.indexOf("n.prev");
			connectedUsers.splice(i,1,n.new);
		}
		sock.broadcast.emit("userlist",{users: connectedUsers});
	});
});
 
app.listen(8000);