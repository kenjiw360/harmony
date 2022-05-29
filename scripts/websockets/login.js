module.exports = function (username, password, callback){
    Users.find({
        username: username,
        password: hash(password)
    }, null, {limit: 1}, function(err, doc){
        if(err) throw err;
        if(doc.length == 1){
            callback(true, doc[0]._id);
        }else{
            callback(false,"That account does not exist");
        }
    });
}