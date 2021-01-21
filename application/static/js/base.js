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

document.addEventListener("DOMContentLoaded", (event) => {
	// Loop through elements with the class "pretty_select"
	var select_elements = document.getElementsByClassName("pretty_select");
	for (var i = 0; i < select_elements.length; i++) {
		// get the original (hidden) select element
		var html_select = select_elements[i].getElementsByTagName("select")[0];

		// Create a div that contains the new select element (the "real" one is hidden)
		var selected_item = document.createElement("DIV");
		selected_item.setAttribute("class", "select-selected");
		selected_item.innerHTML = html_select.options[0].innerHTML;
		select_elements[i].appendChild(selected_item);

		// Create a div that contains the list of available options
		var option_list = document.createElement("DIV");
		option_list.setAttribute("class", "select-items select-hide");
		for (var option_index = 0; option_index < html_select.length; option_index++) {
			/* For each option in the original select element,
			create a new DIV that will act as an option item: */
			var option = document.createElement("DIV");
			option.innerHTML = html_select.options[option_index].innerHTML;
			option.addEventListener("click", function(e) {
				/* When an item is clicked, update the original select box,
				and the selected item: */
				var y, i, k, parent_select, h, num_options, yl;
				parent_select = this.parentNode.parentNode.getElementsByTagName("select")[0];
				num_options = parent_select.length;
				h = this.parentNode.previousSibling;
				for (i = 0; i < num_options; i++) {
					if (parent_select.options[i].innerHTML == this.innerHTML) {
						parent_select.selectedIndex = i;
						h.innerHTML = this.innerHTML;
						y = this.parentNode.getElementsByClassName("same-as-selected");
						yl = y.length;
						for (k = 0; k < yl; k++) {
							y[k].removeAttribute("class");
						}
						this.setAttribute("class", "same-as-selected");
						break;
					}
				}
				h.click();
			});
			if (option_index == 0){
				option.setAttribute("class", "same-as-selected")
			}
			option_list.appendChild(option);
		}
		// Add the Option list to the original element
		select_elements[i].appendChild(option_list);
		selected_item.addEventListener("click", function(e) {
			/* When the select box is clicked, close any other select boxes,
			and open/close the current select box: */
			e.stopPropagation();
			closeAllSelect(this);
			this.nextSibling.classList.toggle("select-hide");
			this.classList.toggle("select-arrow-active");
		});
	}

	function closeAllSelect(element) {
		/* A function that will close all select boxes in the document,
		except the current select box: */
		var x, y, i, xl, yl, arrNo = [];
		x = document.getElementsByClassName("select-items");
		y = document.getElementsByClassName("select-selected");
		xl = x.length;
		yl = y.length;
		for (i = 0; i < yl; i++) {
			if (element == y[i]) {
				arrNo.push(i)
			} else {
				y[i].classList.remove("select-arrow-active");
			}
		}
		for (i = 0; i < xl; i++) {
			if (arrNo.indexOf(i)) {
				x[i].classList.add("select-hide");
			}
		}
	}

	/* If the user clicks anywhere outside the select box,
	then close all select boxes: */
	document.addEventListener("click", closeAllSelect); 
})

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
