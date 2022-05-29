module.exports = function (req,res){
	if(req.cookies._id){
		userExists(req.cookies._id, function (result){
			result ? res.render("pages/hub", {page: "",clearCookies: false}) : res.render("pages/landing", {page: "",clearCookies: true});
		})
	}else{
		res.render("pages/landing", {page: "",clearCookies: false});
	}
}