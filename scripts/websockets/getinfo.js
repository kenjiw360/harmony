module.exports = function (userToken, id, callback){
	Groups.find({_id: id}, null, {limit: 1}, function(err, group){
        if(err) throw err;
        var content = {
            notes: group[0].notes[userToken],
			flashcards: group[0].flashcards,
            chat: group[0].chat
        };
        callback(content);
    });
}