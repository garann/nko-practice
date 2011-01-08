var express = require('express').createServer();
 
express.get('/', function(req, res) {
	res.send("I need like 17 clones.");
});
 
express.listen(80);