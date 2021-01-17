let initial_values = {
	id: 1,
	label: "Die dritte Macht"
}
var groups;
$(document).ready(async() => {
	// Set global Chart.js Variables
	Chart.defaults.global.responsive = true;
	Chart.defaults.global.plugins.colorschemes.scheme = 'tableau.HueCircle19'
	Chart.defaults.global.layout.padding = {left: 50, right: 50, top: 0, bottom: 0}
	Chart.defaults.global.defaultFontColor = "#E0E0E0";

	selectElement(initial_values, $("#select2_cycleselector"))


	cycle_evc_ranking = new Chart($("#cycle_evc_ranking"), {
		type: "bar",
		data: {
			datasets: [] // data takes a while to load, is added later
		},
		options: {
			scales: {
				yAxes: [{
					ticks: {
						min: 0
					}
				}]
			}
		}
	});
	community_evc_ranking = new Chart($("#community_ranking"), {
		type: "bar",
		data: {
			datasets: [] // data takes a while to load, is added later
		},
		options: {
			scales: {
				yAxes: [{
					ticks: {
						min: 0
					}
				}]
			}
		}
	});
	$("#select2_cycleselector").on("select2:select", (e) => {updateStats(e.params.data);})

	// Trigger the initial Update manually
	updateStats(initial_values);
});

function updateStats(data){
	/*
	Updates the whole page to display the stats of the newly selected cycle
	*/

	updateInfoTable(data.id);
	updateCycleEVC(data.id);
	updateCommunityInfo(data.id)
};

function updateInfoTable(cycle_id){
	$.ajax({
		method: "GET",
		url: "/api/getcycleinfo",
		data: {id: cycle_id}
	}).then((response) => {
		$("#cycle_name").html(response.name);
		$("#cycle_num_persons").html(response.num_persons);
		$("#cycle_num_relations").html(response.num_relations);
		$("#cycle_clustering").html(response.clustering);
	});
}


function updateCycleEVC(cycle_id){
	// delete the old dataset
	cycle_evc_ranking.data.datasets.splice(0, 1);
	
	$.ajax({
		method: "GET",
		url: "/api/getCycleEVC",
		data: {id: cycle_id}
	}).then((response) => {
		current_ranking_values = [...response.data];
		// take the top ten characters (maybe dont hardcode this limit later...)
		let items = response.data.slice(0, 10);
		let labels = [];
		let values = [];
		for(var item of items){
			labels.push(item.name);
			values.push(item.value);
		}
		// Update the chart
		cycle_evc_ranking.data.labels = labels;
		cycle_evc_ranking.data.datasets.push({
			label: "Eigenvektorzentralität",
			data: values
		})
		cycle_evc_ranking.update()
	})
	.fail(() => {flash("Fehler beim Kontaktieren des Servers")});
}

async function updateCommunityInfo(cycle_id){
	$("#community_list").empty()

	let response = await $.ajax({
		url: "/api/getClusters",
		data: {"cycle": cycle_id},
		method: "GET"
	})
	.fail(() => {flash("Fehler beim Kontaktieren des Servers")});
	groups = group(response.data);
	let colors = generate({num: size_dict(groups), lum: 50, sat: 100, alpha: 1})
	let colors_transparent = generate({num: size_dict(groups), lum: 50, sat: 100, alpha: 0.2})

	for(var g_id in groups){
		let chars = groups[g_id]

		// Add the Group to the list of Groups
		let li = $("<li></li>").attr("id", g_id);
		let color_block = $("<span></span>").addClass("color_block").css({"background-color": colors[g_id]});
		li.append(color_block);
		li.append(" " + chars.length + " Mitglieder");
		li.click(selectGroup);
		$("#community_list").append(li);
	}
}

function selectGroup(e){
	let target = $(e.target)

	// Highlight the targeted item
	for (var i of $("#community_list li"))$(i).removeClass("selected")
	target.addClass("selected");
	g_id = $(e.target).attr("id");

	// List the characters in #community_members
	$.ajax({
		method: "GET",
		url: "/api/search_characters",
		data: {id: groups[g_id]}
	}).then((e) => {
		$("#community_members").empty()
		for(var id of groups[g_id]){
			let char = $("<span></span>").text(e[id]).addClass("member");
			$("#community_members").append(char);
		}
	})
	.fail(() => {flash("Fehler beim Kontaktieren des Servers")});

	// Update the Ranking Graph
	community_evc_ranking.data.datasets.splice(0, 1);

	// get all characters in the current group
	characters = [...current_ranking_values].filter(char => groups[g_id].includes(char.id))

	// Sort the characters by value
	characters.sort((a, b) => (a.value < b.value) ? 1 : -1)

	// only take top 5 since tha graph is kinda small
	characters = characters.splice(0, 5);

	let labels = [];
	let values = [];

	for(char of characters){
		labels.push(char.name);
		values.push(char.value);
	}
	community_evc_ranking.data.labels = labels;
	community_evc_ranking.data.datasets.push({
		label: "Eigenvektorzentralität",
		data: values
	})
	community_evc_ranking.update()
}


function group(groups) {
	new_groups = {}
	for(var char in groups){
		let group_id = groups[char]
		if(group_id in new_groups){
			new_groups[group_id].push(char);
		}
		else{
			new_groups[group_id] = [char];
		}
	}
	return new_groups
}

function size_dict(d){c=0; for (i in d) ++c; return c}
