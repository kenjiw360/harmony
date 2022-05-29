module.exports = function(groupid, socket){
    Groups.find({_id: groupid}, null, {limit: 1}, function(err, group){
        if(err) throw err;
        group[0].flashcards.push({ front: "front", back: "back" });
        group[0].markModified("flashcards");
        group[0].save();
        socket.broadcast.to("group"+groupid).emit("cardadded");
    });
}