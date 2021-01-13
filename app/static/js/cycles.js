let initial_values = {
	id: 1,
	label: "Die dritte Macht"
}
$(document).ready(async() => {
	// Set global Chart.js Variables
	Chart.defaults.global.responsive = true;
	Chart.defaults.global.plugins.colorschemes.scheme = 'tableau.HueCircle19'
	Chart.defaults.global.layout.padding = {left: 50, right: 50, top: 0, bottom: 0}

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
	$("#select2_cycleselector").on("select2:select", (e) => {updateStats(e.params.data);})

	// Trigger the intial Update manually
	updateStats(initial_values);
});

function updateStats(data){
	/*
	Updates the whole page to display the stats of the newly selected cycle
	*/

	updateInfoTable(data.id);
	updateCycleEVC(data.id);
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
		// take the top ten characters (maybe dont hardcode this limit later...)
		let items = response.data.slice(0, 10)
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
	});;
}