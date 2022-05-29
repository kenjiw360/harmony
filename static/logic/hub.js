const socket = io();
var cardindex = 0;

function notification(text,time){
	document.querySelector("notification h1").innerText = text;
	document.querySelector("notification").setAttribute("enabled","true");
	setTimeout(function (){
		document.querySelector("notification").setAttribute("enabled","false");
	},time);
}

function getGroups(){
	cardindex = 0;
    document.querySelector("#addgroup").setAttribute("active","0");
	document.querySelectorAll("groupbar card").forEach(function(card){
		if(card.id != "addcard"){
            card.remove();
		}
	});
    socket.emit("groupslist", document.cookie.split("=")[1], function (list){
        for(i=list.length-1;i>=0;i--){
			function setClick(){
				var card = document.createElement("card");
				card.style.background = list[i].color;
				card.id = list[i]._id;
				var text = document.createElement("h2");
				text.innerText = list[i].name;
				card.append(text);
				card.addEventListener("click", function(){
					document.querySelector("screen #chatcontainer").innerHTML = "";
					document.querySelectorAll("#cardcontainer .carddeck").forEach(function(elem){
						if(elem.id != "cardadd") elem.remove()
					});
					document.querySelector("groupbar").setAttribute("expanded","0");
					document.querySelector(".default").setAttribute("hidden", "true");
                    document.getElementById("page").setAttribute("groupid", card.id);
					document.getElementById("page").focus();
					document.getElementById("chat").value = "";
                    socket.emit("join", card.id);
					socket.emit("getinfo", document.cookie.split("=")[1], card.id, function(content){
						content.chat.forEach(function(message){
							var span = document.createElement("span");
							span.innerText = message[0];
							var p = document.createElement("p");
							p.innerText = message[1];
							document.querySelector("#chatcontainer").append(span);
							document.querySelector("#chatcontainer").append(p);
							document.querySelector("#chatcontainer").scrollTop = document.querySelector("#chatcontainer").scrollHeight;
						})
						document.querySelector("div#contents textarea").value = content.notes;
						content.flashcards.reverse().forEach(function(flashcard, index){
							var amnt = content.flashcards.length-1-index;
							var elem = document.createElement("card");
							elem.setAttribute("flipped",false);
							elem.setAttribute("hide",false);
							elem.className = "carddeck";

							var front = document.createElement("h1");
							front.contentEditable = true;
							front.innerText = flashcard.front;
							front.style.display = "block";
							front.addEventListener("input", function(){
								if(front.innerText.trim().length == 0) front.innerText = "front";
								socket.emit("editcard", card.id, amnt, "front", front.innerText.trim());
							});							

							var back = document.createElement("h3");
							back.contentEditable = true;
							back.style.display = "none";
							back.innerText = flashcard.back;
							back.addEventListener("input", function(){
								if(back.innerText.trim().length == 0) back.innerText = "back";
								socket.emit("editcard", card.id, amnt, "back", back.innerText.trim());
							});

							elem.append(front);
							elem.append(back);

							elem.addEventListener("click", function(e){
								if(e.target == elem){
									document.querySelectorAll(".carddeck[hide='false']").forEach(function (carddeck){
										if(elem != carddeck){
											carddeck.style.display = "none";
											setTimeout(function (){
												carddeck.style.display = "block";
											},1000);
										}
									})
									elem.setAttribute("flipped", elem.getAttribute("flipped") != "true");
									setTimeout(function(){
										front.style.display = "blocknone".replace(front.style.display,"");
										back.style.display = "blocknone".replace(back.style.display,"");
									}, 300);
								}
							});

							document.querySelector("span#cardcontainer").append(elem);
						});
					});
				});
				document.querySelector("groupbar").prepend(card);
			}
			setClick();
            
        }
    });
}

document.querySelector("#addcard").addEventListener("click", function (){
	document.querySelector("#addgroup input").value = "";
	document.querySelector("#addgroup").setAttribute("active","1");
});

var circles = document.querySelectorAll("#addgroup circle");
circles.forEach(function (circle){
	circle.addEventListener("click", function (){

		circles.forEach(function (circ){
			circ.setAttribute("selected","false");
		})
		circle.setAttribute("selected","true");
	})
});

document.querySelector("#addgroup").addEventListener("click", function (e){
	if(e.target == document.querySelector("#addgroup")){
		document.querySelector("#addgroup").setAttribute("active","0");
		circles.forEach(function (circ){
			circ.setAttribute("selected","false")
		})
        document.getElementById("groupname").value = "";
	}
});

document.getElementById("addgroupbtn").addEventListener("click", function(){
    var color = document.querySelectorAll(`circle[selected="true"]`);
	var groupname = document.getElementById("groupname").value;
    if(!Boolean(color.length) || !Boolean(groupname.length)){
        alert("no");
	}else{
        color = color[0].style.background;
		socket.emit("creategroup", document.cookie.split("=")[1], groupname, color, getGroups);
    }
});

document.querySelector("#invite").addEventListener("click", function(){
	navigator.clipboard.writeText(`http://localhost:8888/invite?id=${document.getElementById("page").getAttribute("groupid")}`);
	notification("Copied text to clipboard",5000);
});

document.getElementById("chat").addEventListener("keypress", function(e){
    if(e.keyCode == 13){
        socket.emit("message", document.cookie.split("=")[1], document.getElementById("page").getAttribute("groupid"), document.getElementById("chat").value)
        document.getElementById("chat").value = ""
    }
});

document.querySelector("#contents textarea").addEventListener("input", function(){
	socket.emit("savenotes", document.cookie.split("=")[1], document.querySelector("#contents textarea").value, document.getElementById("page").getAttribute("groupid"));
});

document.querySelector("#cardadd").addEventListener("click", function (){
	socket.emit("addcard", document.getElementById("page").getAttribute("groupid"));
	var index = document.querySelectorAll(".carddeck").length - 1;
	var card = document.createElement("card");
	card.className = "carddeck";
	card.setAttribute("flipped","false");
	card.setAttribute("hide","false");
	
	var front = document.createElement("h1");
	front.contentEditable = true;
	front.innerText = "front";
	front.style.display = "block";
	front.addEventListener("input", function(){
		if(front.innerText.trim().length == 0) front.innerText = "front";
		socket.emit("editcard", document.querySelector("#page").getAttribute("groupid"), index, "front", front.innerText.trim());
	});							

	var back = document.createElement("h3");
	back.contentEditable = true;
	back.style.display = "none";
	back.innerText = "back";
	back.addEventListener("input", function(){
		if(back.innerText.trim().length == 0) back.innerText = "back";
		socket.emit("editcard", document.querySelector("#page").getAttribute("groupid"), index, "back", back.innerText.trim());
	});

	card.appendChild(front);
	card.appendChild(back);

	card.addEventListener("click", function(e){
		if(e.target == card){
			document.querySelectorAll(".carddeck[hide='false']").forEach(function (carddeck){
				if(card != carddeck){
					carddeck.style.display = "none";
					setTimeout(function (){
						carddeck.style.display = "block";
					},1000);
				}
			})
			card.setAttribute("flipped", card.getAttribute("flipped") != "true");
			setTimeout(function(){
				front.style.display = "blocknone".replace(front.style.display,"");
				back.style.display = "blocknone".replace(back.style.display,"");
			}, 300);
		}
	});

	document.querySelector("#cardcontainer").insertBefore(card, document.querySelector('#cardadd').nextSibling);
});

document.querySelector("#page").addEventListener("keydown", function(e){
	if((e.keyCode == 39 || e.keyCode == 37) && !(e.target == document.querySelector("textarea") || e.target == document.querySelector("#chat") || Array.prototype.slice.call(document.querySelectorAll("[contenteditable='true']")).includes(e.target))){
		var list = Array.prototype.slice.call(document.querySelectorAll("#cardcontainer card"));
		var direction = e.keyCode - 38;
		cardindex = (cardindex+direction)%(list.length);
		list.reverse().forEach(function (card,index){
			if(index<cardindex){
				card.setAttribute("hide",true);
			}else{
				var secamnt = 0;
				setTimeout(function (){
					card.setAttribute("hide",false);
				},secamnt)
			}
		});
	}
});

document.querySelector(".testbutton").addEventListener("click", function(){
	var deck = document.querySelectorAll(".carddeck");
	if(deck.length < 5) return notification(`You need ${5-deck.length} more flashcard${deck.length == 4 ? "" : "s"} to start a test`, 5000);
	socket.emit("statechange", document.querySelector("#page").getAttribute("groupid"), document.querySelector(".testbutton h1").innerText == "leave test" ? 0 : 1);
})

getGroups();

socket.on("message", function(name, message){
    var span = document.createElement("span");
    span.innerText = name;
	var p = document.createElement("p");
	p.innerText = message;
    document.querySelector("#chatcontainer").append(span);
	document.querySelector("#chatcontainer").append(p);
	document.querySelector("#chatcontainer").scrollTop = document.querySelector("#chatcontainer").scrollHeight;
})

socket.on("cardchange", function(index, direction, data){
	var deck = document.querySelectorAll(`.carddeck`)
	deck[deck.length-1-index].querySelector(direction == "front" ? "h1" : "h3").innerText = data;
});

socket.on("cardadded", function (){
	var index = document.querySelectorAll(".carddeck").length - 1;
	var card = document.createElement("card");
	card.className = "carddeck";
	card.setAttribute("flipped","false");
	card.setAttribute("hide","false");
	
	var front = document.createElement("h1");
	front.contentEditable = true;
	front.innerText = "front";
	front.style.display = "block";
	front.addEventListener("input", function(){
		if(front.innerText.trim().length == 0) front.innerText = "front";
		socket.emit("editcard", document.querySelector("#page").getAttribute("groupid"), index, "front", front.innerText.trim());
	});							

	var back = document.createElement("h3");
	back.contentEditable = true;
	back.style.display = "none";
	back.innerText = "back"; 9
	back.addEventListener("input", function(){;
		if(back.innerText.trim().length == 0) back.innerText = "back";
		socket.emit("editcard", document.querySelector("#page").getAttribute("groupid"), index, "back", back.innerText.trim());
	});

	card.appendChild(front);
	card.appendChild(back);

	card.addEventListener("click", function(e){
		if(e.target == card){
			document.querySelectorAll(".carddeck[hide='false']").forEach(function (carddeck){
				if(card != carddeck){
					carddeck.style.display = "none";
					setTimeout(function (){
						carddeck.style.display = "block";
					},1000);
				}
			})
			card.setAttribute("flipped", card.getAttribute("flipped") != "true");
			setTimeout(function(){
				front.style.display = "blocknone".replace(front.style.display,"");
				back.style.display = "blocknone".replace(back.style.display,"");
			}, 300);
		}
	});
	document.querySelector("#cardcontainer").insertBefore(card, document.querySelector('#cardadd').nextSibling);
})

socket.on("userstates", function(states){
	document.querySelector("button.testbutton").disabled = false;
	if(Object.values(states).includes(1)){
		document.querySelector("button #limbocounter").innerText = `${Object.values(states).filter((x) => x==1).length}/${Object.values(states).length} users queued`;
		if(states[socket.id] == 0){
			document.querySelector("button.testbutton div h1").innerText = "join test";
		}else{
			document.querySelector("button.testbutton div h1").innerText = "leave test";
		}
	}else{
		document.querySelector("button.testbutton div h1").innerText = "start test";
		document.querySelector("button #limbocounter").innerText = ``;
	}
	if(Object.values(states).includes(2)){
		document.querySelector("button.testbutton div h1").innerText = "test ongoing";
		document.querySelector("button #limbocounter").innerText = `${Object.values(states).filter((x) => x>=10).length}/${Object.values(states).filter((x) => (x==2 || x>=10)).length} users finished test`;
		document.querySelector("button.testbutton").disabled = true;
	}
})

socket.on("questions", function (questions){
	document.querySelector("span#notes").setAttribute("hidden", "true");
	document.querySelector("span#test").innerHTML = `<h1 style="margin-top:0;">test</h1>`;
	function run(question,i){
		var h3 = document.createElement("h3");
		var precursor = question.direction == "front" ? `What is the definition of the following phrase: ` : `Find the answer that corresponds with this definition: `;
		h3.innerText = `${i+1}) ${precursor}` ;
		h3.className = "nospace";
		
		var italic = document.createElement("i");
		italic.innerText = question.prompt;
		h3.append(italic);

		document.querySelector("span#test").append(h3);
		document.querySelector("span#test").append(document.createElement("br"));
		
		var answers = question.filler.concat(question.answer).sort(() => Math.random() - 0.5);

		for(o=0;o<answers.length;o++){
			var radio = document.createElement("input");
			radio.name = i;
			radio.type = "radio";
			radio.id = `q${i}:${o}`;
			radio.value = answers[o];

			var label = document.createElement("label");
			label.innerText = answers[o];
			label.setAttribute("for",`q${i}:${o}`);
			
			document.querySelector("span#test").append(radio);
			document.querySelector("span#test").append(label);
			document.querySelector("span#test").append(document.createElement("br"));
		}

		document.querySelector("span#test").append(document.createElement("br"));
	}
	for(i=0;i<questions.length;i++){
		run(questions[i],i);
	}
	var submit = document.createElement("h2");
	submit.className = "nospace";
	submit.innerText = "submit";
	submit.style.cursor = "pointer";
	var questions = questions;
	submit.addEventListener("click", function (){
		var score = 0;
		for(i=0;i<questions.length;i++){
			var response = Array.prototype.slice.call(document.querySelectorAll(`input[type="radio"][name="${i}"]:checked`)).map((x) => x.value);
			response.push(true);
			if(response[0] === questions[i].answer){
				score += 1;
			}
		}
		socket.emit("testdone", document.cookie.split("=")[1], document.getElementById("page").getAttribute("groupid"), parseInt(100 * score / questions.length));
		document.querySelector("span#test").innerHTML = `<h1 class="nospace centered" style="text-align:center;width:80%;">waiting for others to finish...</h1>`;
	});
	document.querySelector("span#test").append(submit);
})

socket.on("testscores", function(scores){
	if(document.querySelector("#notes").getAttribute("hidden") == "true"){
		document.querySelector("#test").innerHTML = "";

		var h1 = document.createElement("h1");
		h1.innerText = "results";
		h1.className = "nospace";
		h1.style.textAlign = "center"

		var center = document.createElement("center");
		center.className = "nospace";
		center.id = "barholder";

		var exit = document.createElement("h2");
		exit.innerText = "close";
		exit.id = "exit";
		exit.addEventListener("click", function (){
			document.querySelector("#notes").setAttribute("hidden","false");
		});

		var sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

		var colors = ["#FCE181", "rgb(225,225,240)", "#A18163"];
		
		console.log(sorted);

		for(i=0;i<Math.min(sorted.length, 3);i++){
			console.log("hello", i);
			var bar = document.createElement("bar");
			
			var div = document.createElement("div");
			div.style.background = colors[i];
			div.style.height = `${sorted[i][1]}%`;

			var h2 = document.createElement("h2");
			h2.innerText = `${sorted[i][1]}%`;

			var h3 = document.createElement("h3");
			h3.innerText = `${sorted[i][0]}`

			div.append(h2);
			div.append(h3);
			bar.append(div);
			center.append(bar);
		}

		document.querySelector("#test").append(h1);
		document.querySelector("#test").append(center);
		document.querySelector("#test").append(exit);
	}
});