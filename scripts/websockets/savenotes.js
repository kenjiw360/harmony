module.exports = function (userToken, notes, id){
	Groups.find({_id: id}, null, {limit:1}, function(err, group){
		if(err) throw err;
		group = group[0];
		group.notes[userToken] = notes;
		group.markModified("notes");
		group.save().catch((err) => { if(err) throw err });
	});
}