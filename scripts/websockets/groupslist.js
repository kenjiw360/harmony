module.exports = function(userToken,callback){
    Users.find({_id: userToken}, null, {limit:1}, async function(err, user){
        if(err) throw err;
        groups = user[0].groups;
		if(groups.length){
			var returnthis = [];
			function runthis(i){
				Groups.find({_id: groups[i]},null,{limit:1}, function(err, group){
					if(err) throw err;
					var group = group[0];
					group = {
						name: group.name,
						_id: group._id.toString(),
						color: group.color
					};
					returnthis.push(group);
					if(i == groups.length - 1){
						callback(returnthis)
					}else{
						runthis(i+1);
					}
				});
			}
			runthis(0);
        }else{
            callback([]);
        }
    });
}