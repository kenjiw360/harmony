module.exports = function (io, sid, groupid, state){
	groupstates[groupid][sid] = state;
	io.to(`group${groupid}`).emit("userstates", groupstates[groupid]);
	if(Object.values(groupstates[groupid]).filter((x) => x == 1).length == Object.values(groupstates[groupid]).length){
		for(i=0;i<Object.keys(groupstates[groupid]).length;i++){
            groupstates[groupid][Object.keys(groupstates[groupid])[i]] = 2;
        }
        
		io.to(`group${groupid}`).emit("userstates", groupstates[groupid]);
        var questions = [];

		Groups.find({_id: groupid}, null, {limit: 1}, function (err,group){
			if(err) throw err;
			var cards = group[0].flashcards;
			var taken = [];
            var amount = Math.min(10,cards.length);

			for(i=0;i<amount;i++){
				var o = Math.round(Math.random() * (cards.length - 1));
				while(taken.includes(o)){
					o = Math.round(Math.random() * (cards.length - 1));
				}

                var dir = ["front", "back"][Math.round(Math.random())];
				var filler = [];
				var fillerdict = JSON.parse(JSON.stringify(cards));
				fillerdict.splice(o,1);

				for(u=0;u<3;u++){
					var rand = Math.round(Math.random() * (fillerdict.length - 1));
					filler.push(fillerdict[rand]["frontback".replace(dir, "")]);
                    fillerdict.splice(rand, 1);
				}

				questions.push({
                    prompt: cards[o][dir],
                    answer: cards[o]["frontback".replace(dir, "")],
					direction: dir,
                    filler: filler
                });
				taken.push(o);
			}
			io.to(`group${groupid}`).emit(`questions`, questions);
		});
	}
}
