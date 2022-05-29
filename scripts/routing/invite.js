var ObjectId = require('mongoose').Types.ObjectId;

module.exports = function(req,res){
	if(!req.cookies._id){
		res.redirect("/");
	}else if(!ObjectId.isValid(req.query.id)){
		res.render("pages/invite", {symbol: "×", color: "#FC8181",reason: "The group doesn't exist", page: " - invitation",clearCookies: false});
	}else{
		Groups.find({_id: req.query.id}, null, {limit: 1}, function(err, group){
			if(err) throw err;
			if(group.length > 0){
				if(group[0].users.includes(req.cookies._id)){
					res.render("pages/invite", {symbol: "-", color: "#81D0FC",reason: "You were already in the group", page: " - invitation",clearCookies: false});
				}else{
                    Users.find({_id: req.cookies._id}, null, {limit: 1}, function(err, user){
                        if(err) throw err;
                        if(user.length == 0) return res.redirect("/");
                        user[0].groups.push(req.query.id);
                        group[0].users.push(req.cookies._id);
						group[0].notes[req.cookies._id] = "";
						group[0].markModified("notes");
                        user[0].save().then(function(){
                            group[0].save().then(function(){
                                res.render("pages/invite", {symbol: "✓", color: "#B0EEA6",reason: "You are now in the group", page: " - invitation",clearCookies: false});
                            }).catch(function(err){
								if(err) throw err;
							})
                        }).catch(function(err){
							if(err) throw err;
						})
                    })
				}
			}
			if(group.length == 0) res.render("pages/invite", {symbol: "×", color: "#FC8181",reason: "The group doesn't exist", page: " - invitation",clearCookies: false});
		})
	}
}