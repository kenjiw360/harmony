module.exports = function(io, userToken, id, message, sid){
    if(sidtousername[sid]){
        io.to("group"+id).emit("message", sidtousername[sid], message);
        Groups.find({_id: id}, null, {limit: 1}, function(err, group){
            if(err) throw err;
            group[0].chat.push([sidtousername[sid], message])
            group[0].markModified("chat");
            group[0].save().catch((err) => { if(err){ throw err } })
        })
    }else{
        Users.find({_id: userToken}, null, {limit:1}, function(err, user){
            if(err) throw error;
            io.to("group"+id).emit("message", user[0].username, message);
            Groups.find({_id: id}, null, {limit: 1}, function(err, group){
                if(err) throw err;
                group[0].chat.push([user[0].username, message])
                group[0].markModified("chat");
                group[0].save().catch((err) => { if(err){ throw err } })
                sidtousername[sid] = user[0].username;
            })
        })
    }
}