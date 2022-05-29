module.exports = function(username, password, callback){
    Users.find({
        username: username
    }, null, {limit: 1}, function(err, doc){
        if(err) throw err;
        if(doc.length == 0){
            var user = new Users({
                username: username,
                password: hash(password)
            });
            user.save().then(function (){
                callback(true, user._id)
            });
        }else{
            callback(false, "Account with that username already exists")
        }
    });
}