document.addEventListener("DOMContentLoaded", (event) => {
	// Loop through elements with the class "pretty_select"
	var select_elements = document.getElementsByClassName("pretty_select");
	console.log(select_elements, "löl");
	for (var i = 0; i < select_elements.length; i++) {
		// get the original (hidden) select element
		var html_select = select_elements[i].getElementsByTagName("select")[0];

		// Create a div that contains the new select element (the "real" one is hidden)
		var selected_item = document.createElement("DIV");
		selected_item.setAttribute("class", "select-selected");
		selected_item.innerHTML = html_select.getAttribute("placeholder");
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
				var y, i, k, s, h, sl, yl;
				s = this.parentNode.parentNode.getElementsByTagName("select")[0];
				sl = s.length;
				h = this.parentNode.previousSibling;
				for (i = 0; i < sl; i++) {
					if (s.options[i].innerHTML == this.innerHTML) {
						s.selectedIndex = i;
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
