socket = io();

function run(){
	socket.emit("signup", document.querySelector("#username").value,document.querySelector("#password").value, function(tf, data){
        if(tf){
            document.cookie = `_id=${data};`;
			return location = "/";
        }
        return alert(data);
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