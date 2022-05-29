//Setting up database
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/harmony");

//Group schema & model
var groups = new mongoose.Schema({
	name: String,
	users: [String],
	color: String,
	notes: Object,
	flashcards: {
		type: [Object],
		default: []
	},
	chat: {
		type: [Array],
		default: []
	}
}, {versionKey: false});
global.Groups = mongoose.model("groups", groups);


//Users schema & model
var users = new mongoose.Schema({
	username: String,
	password: String,
	groups: {
		type: [String],
		default: []
	}
}, {versionKey: false});
global.Users = mongoose.model("users", users);