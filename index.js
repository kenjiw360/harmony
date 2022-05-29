const PORT = process.env.PORT || 8888;
global.groupstates = {};
global.sidtousername = {};

//Importing misc dependencies
global.hash = require("hash-anything").sha512;
global.userExists = require("./scripts/misc/userExists.js");

//Setting up MongoDB
require("./scripts/misc/mongo.js");

//Importing server dependencies
const express = require("express");
const http = require("http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const socketio = require("socket.io");

//Setting up HTTP
const app = express();
const server = http.createServer(app);

//HTTP config
app.use("/static",express.static("./static"));
app.set("view engine","ejs")
app.use(cors());
app.use(cookieParser());

//Web socket logic
const io = socketio(server);

//HTTP Routing
app.get("/", require("./scripts/routing/slash.js"));
app.get("/signup", require("./scripts/routing/signup.js"));
app.get("/login", require("./scripts/routing/login.js"));
app.get("/invite", require("./scripts/routing/invite.js"))

//Socket.IO
io.on("connection", function (socket){
	var grouproom = "";
	socket.on("login", require("./scripts/websockets/login.js"));
	socket.on("signup", require("./scripts/websockets/signup.js"));
	socket.on("creategroup", require("./scripts/websockets/creategroup.js"));
	socket.on("groupslist", require("./scripts/websockets/groupslist.js"));
	socket.on("message", (userToken, id, message) => require("./scripts/websockets/message.js")(io, userToken, id, message, socket.id));
	socket.on("savenotes", require("./scripts/websockets/savenotes.js"));
	socket.on("getinfo", require("./scripts/websockets/getinfo.js"));
	socket.on("editcard", (groupid,index,direction,data) => require("./scripts/websockets/editcard.js")(groupid,index,direction,data,socket));
	socket.on("addcard", (groupid) => require("./scripts/websockets/addcard.js")(groupid, socket));
	socket.on("statechange", (groupid, state) => require("./scripts/websockets/statechange.js")(io, socket.id, groupid, state));
	socket.on("testdone", (uid, groupid, score) => require("./scripts/websockets/testdone.js")(io, socket.id, uid, groupid, score));
	socket.on("join", function(id){
		if(grouproom.length > 0) leave(grouproom.replace("group",""),socket.id);
		socket.leaveAll();
		socket.join(`group${id}`);
		grouproom = `group${id}`;
		socket.join(socket.id);
		if(!groupstates[id]) groupstates[id] = {};
		groupstates[id][socket.id] = 0;
		io.to(`group${id}`).emit("userstates",groupstates[id]);
	});
	socket.on("disconnect", function(){
		if(grouproom) leave(grouproom.replace("group",""), socket.id);
	})
});

function leave(room,sid){
	delete groupstates[room][sid];
	if(!Object.keys(groupstates[room]).length){
		delete groupstates[room];
	}else{
		require("./scripts/websockets/statechange.js")(io, Object.keys(groupstates[room])[0], room, groupstates[room][Object.keys(groupstates[room])[0]]);
	}
	io.to(`group${room}`).emit("userstates",groupstates[room]);
}

//Open server to internet
server.listen(PORT, console.log(`listening to port ${PORT}`));