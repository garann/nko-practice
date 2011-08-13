var express = require('express').createServer(),
	redis = require('redis-client'),
	db = redis.createClient();
 
express.get('/', function(req, res) {
	res.send("I need like 17 clones.");
});
 
express.listen(80);