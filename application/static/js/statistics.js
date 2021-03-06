function chartjs_colorscheme(scheme){
	scheme.splice(0, scheme.length, "rgba(0,204,255,1)", "rgba(51,0,255,1)", "rgba(255,0,204,1)", "rgba(255,51,0,1)", "rgba(204,255,0,1)", "rgba(0,255,51,1)")
	return scheme
}

// Initial data
let initial_values = {
	id: "EJ-OFZ2G2I6plm7cYkxkey7oXBTcbef9WjV7RzJfFH4",
	label: "Perry Rhodan"

}
let cycles_prom = $.ajax({method:"GET", url:"/api/getCycles"}).fail(() => {flash("Fehler beim Kontaktieren des Servers")});

$("document").ready(async() => {
	// Set global Chart.js Variables
	Chart.defaults.global.responsive = true;
	Chart.defaults.global.plugins.colorschemes.scheme = 'tableau.HueCircle19'
	// Chart.defaults.global.plugins.colorschemes.custom = chartjs_colorscheme;
	Chart.defaults.global.layout.padding = {left: 50, right: 50, top: 0, bottom: 0}
	Chart.defaults.global.defaultFontColor = "#E0E0E0";

	// Select the default objects in the select2 boxes
	selectElement(initial_values, $("#select2_eigenvector_centrality"));

	cycles = await cycles_prom;

	// Create Charts
	var evc_chart = new Chart($("#eigenvector_centrality"), {
		type: 'line',
		data: {
			labels: cycles.titles,
			datasets: [] // data takes a while to load, is added later
		},
		
		options: {
			scales: {
				yAxes: [{
					ticks: {
						max: 1,
						min: 0
					}
				}]
			}
		}
	});
	var connectedness_chart = new Chart($("#connectedness"), {
		type: 'line',
		data: {
			labels: cycles.titles,
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

	// Add event handlers to select2 element
	$("#select2_eigenvector_centrality").on("select2:select", (e) => {
		addLine(e.params.data, evc_chart)
	});
	$("#select2_eigenvector_centrality").on("select2:unselect", (e) => {
		removeLine(e.params.data, evc_chart)
	});
	
	// Add data after Graph has been initialized since this takes a while
	addLine({id: initial_values.id, text: initial_values.label}, evc_chart)

	// Load the data for the second graph (cycle-connectedness)
	$.ajax({
		url: "/api/getCycleConnectedness",
		method: "GET"
	}).then((response) => {
		connectedness_chart.data.datasets.push({
			label: "Verbundenheit",
			data: response.data
		})
		connectedness_chart.update();
	}).fail(() => {flash("Fehler beim Kontaktieren des Servers")});
});

async function addLine(character, evc_chart){
	$.ajax({
		url: "/api/EVC_Analysis",
		method: "GET",
		data: {id: character.id}
	}).then((response) => {
		evc_chart.data.datasets.push({
			id: character.id,
			fill: false,
			label: character.text,
			data: response.data
		})
		evc_chart.update();
	}).fail(() => {flash("Fehler beim Kontaktieren des Servers")});
}

function removeLine(data, evc_chart){
	index = evc_chart.data.datasets.findIndex(dataset => dataset.id == data.id);

	// When connection is closed, ghost datasets may occur.
	if(index != -1){
		evc_chart.data.datasets.splice(index, 1);
		evc_chart.update();
	}
}
