module.exports = function (io, sid, uid, groupid, score){
	groupstates[groupid][sid] = score+10;
    if(!sidtousername[sid]){
        Users.find({_id: uid}, null, {limit: 1}, function(err, user){
            if(err) throw err;
            sidtousername[sid] = user[0].username;
            if(!Object.values(groupstates[groupid]).includes(2)){
				var sendthem = {};
                Object.keys(groupstates[groupid]).forEach(function(key){
                    if(groupstates[groupid][key] >= 10){
                        sendthem[sidtousername[key]] = groupstates[groupid][key] - 10
                    }
                })
                io.to(`group${groupid}`).emit("testscores", sendthem);
                Object.keys(groupstates[groupid]).forEach(function(key){
                    groupstates[groupid][key] = 0;
                })
            }
            io.to(`group${groupid}`).emit("userstates", groupstates[groupid]);
        });
    }else{
        if(!Object.values(groupstates[groupid]).includes(2)){
            var sendthem = {};
            Object.keys(groupstates[groupid]).forEach(function(key){
                if(groupstates[groupid][key] >= 10){
                    sendthem[sidtousername[key]] = groupstates[groupid][key] - 10;
                }
            });
            io.to(`group${groupid}`).emit("testscores", sendthem);
            Object.keys(groupstates[groupid]).forEach(function(key){
                groupstates[groupid][key] = 0
            });
        }
        io.to(`group${groupid}`).emit("userstates", groupstates[groupid]); 
    }
}