module.exports = function(groupid,index,direction,data,socket){
	Groups.find({_id: groupid}, null, { limit: 1 }, function(err, group){
		if(err) throw err;
		group[0].flashcards[index][direction] = data;
		group[0].markModified("flashcards");
		group[0].save().catch((err)=>{throw err});
		socket.broadcast.to("group"+groupid).emit("cardchange", index, direction, data);
	})
}