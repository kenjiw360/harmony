module.exports = function(userToken, groupname, color, callback){
	var group = new Groups({
		name: groupname,
		users: [userToken],
		color: color,
		notes: {},
        flashcards: [{
            front: `${groupname.split(" ").map((word) => word.slice(0,1).toUpperCase() + word.slice(1, word.length)).join(" ")} Deck`,
            back: `A deck where you can practice ${groupname}.`
        }]
	});
    group.notes[userToken] = "";
    group.markModified("notes")

	group.save().then(function(){
        Users.find({_id: userToken}, null, {limit: 1}, function(err, user){
			if(err) throw err;
            user[0].groups.push(group._id);
            user[0].save().then(function(){
                if(err) throw err;
                callback(group._id);
            }).catch(function(err){
                throw err;
            });
        });
    })
	.catch(function (err){
		throw err
	});
}