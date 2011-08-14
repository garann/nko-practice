var express = require('express').createServer(),
	redis = require('redis-client'),
	db = redis.createClient(),
	io = require('socket.io'),
	sock = io.listen(express);
 
express.get('/', function(req, res) {
	res.render("index");
});

sock.on("connection",function(c) {
	c.on("message",function(m) {
		sock.broadcast(m);
	});
});
 
express.listen(80);