// Display secret message in console
console.log("\
	                                 _               _             \n\
	                                | |             | |            \n\
	 _ __   ___ _ __ _ __ _   _ _ __| |__   ___   __| | __ _ _ __  \n\
	| '_ \\ / _ \\ '__| '__| | | | '__| '_ \\ / _ \\ / _` |/ _` | '_ \ \n\
	| |_) |  __/ |  | |  | |_| | |  | | | | (_) | (_| | (_| | | | |\n\
	| .__/ \\___|_|  |_|   \\__, |_|  |_| |_|\\___/ \\__,_|\\__,_|_| |_|\n\
	| |                    __/ |                                   \n\
	|_|                   |___/                                    ");

function flash(msg){
	let div = $("<div></div>").text(msg).addClass("flashed_message");
	div.delay(10000).fadeOut(500).promise().then((e) => {
		$(e).remove()
		if($("#flashed_messages").children().length==0)$("#flashed_messages").css("display", "none")

	});
	div.hover((e) => {
		$(e.target).fadeOut(500).remove();
		if($("#flashed_messages").children().length==0)$("#flashed_messages").css("display", "none")
	})
	$("#flashed_messages").append(div);
	$("#flashed_messages").css("display", "initial")
}
