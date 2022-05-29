module.exports = function(userToken,callback){
	Users.find({
		_id: userToken
	}, function(err, doc){
        if(err) throw err;
        callback(doc.length > 0);
    });
};