socket = io();

function run(){
	socket.emit("login", document.querySelector("#username").value,document.querySelector("#password").value, function (bool, result){
		if(bool){
			document.cookie = `_id=${result};`;
			return location = "/";
		}
		return alert(result);
	})
}

document.querySelector("span").addEventListener("click", run)
document.querySelectorAll("input").forEach(function (input){
	input.addEventListener("keypress", function (e){
		if(e.keyCode == 13){
			run();
		}
	})
})