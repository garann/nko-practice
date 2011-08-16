const redis = require('redis'),
        db = redis.createClient();


db.on("error", function (err) {
    console.log("Error " + err);
});


var User = function(sessionId, email, username) {
    this.sessionId = sessionId;
    this.email = email;
    this.username = username;
    db.hmset(this.email, 'sessionId', this.sessionId, 'username', this.username);
}

User.prototype.find = function(emailAddress) {
    db.hgetall(emailAddress, function(err, obj) {
	if (!err) {
	    return obj;
	}
	return false;
    });
}

User.prototype.changeUsername = function(newUsername) {
    db.hmset(this.email, 'username', newUsername);
    this.username = newUsername;
}

// write some pub/sub stuff here..

exports.User = User
