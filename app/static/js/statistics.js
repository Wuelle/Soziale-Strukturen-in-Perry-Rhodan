$("document").ready(async() => {
	// Set global Chart.js Variables
	Chart.defaults.global.responsive = true;
	Chart.defaults.global.plugins.colorschemes.scheme = 'tableau.HueCircle19'
	Chart.defaults.global.layout.padding = {left: 50, right: 50, top: 0, bottom: 0}

	// Initial data
	initial_values = {
		evc: {
			id: "EJ-OFZ2G2I6plm7cYkxkey7oXBTcbef9WjV7RzJfFH4",
			label: "Perry Rhodan"
		},
		closeness: {
			id_1: "EJ-OFZ2G2I6plm7cYkxkey7oXBTcbef9WjV7RzJfFH4",
			label_1: "Perry Rhodan",
			id_2: "_DgImJtg6FhvnsA7BtCznkWprLKKsvj3SZTCKzQkrvg",
			label_2: "Atlan da Gonozal"
		}
	}
	let cycles = await $.ajax({method:"GET", url:"/api/getCycles"})

	// Select the default objects in the select2 boxes
	selectElement(initial_values.evc.id, $('#select2_eigenvector_centrality'))
	selectElement(initial_values.closeness.id_1, $("#select2_char_1"))
	selectElement(initial_values.closeness.id_2, $("#select2_char_2"))

	// Create Chart
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
	var closeness_chart = new Chart($("#closeness"), {
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
	$("#select2_char_1").on("select2:select", (e) => {
		updateCloseness(closeness_chart);
	});
	$("#select2_char_2").on("select2:select", (e) => {
		updateCloseness(closeness_chart);
	});
	// Add data after Graph has been initialized since this takes a while
	let response = await $.ajax({
		url: "/api/EVC_Analysis",
		method: "GET",
		data: {ID: initial_values.evc.id}
	});

	// Load first dataset
	evc_chart.data.datasets.push({
		fill: false,
		label: initial_values.evc.label,
		data: response.data
	})
	evc_chart.update();

	// Load second dataset
	response = await $.ajax({
		url: "/api/closeness",
		method: "GET",
		data: {id_1: initial_values.closeness.id_1, id_2: initial_values.closeness.id_2}
	});

	closeness_chart.data.datasets.push({
		fill: false,
		label: initial_values.closeness.label_1 + " <-> " + initial_values.closeness.label_2,
		data: response.data
	})
	closeness_chart.update();
})

async function addLine(character, evc_chart){
	let data = await getEVCData(character.id);

	evc_chart.data.datasets.push({
		fill: false,
		label: character.text,
		data: data
	})
	evc_chart.update();
}

function removeLine(data, evc_chart){
	index = evc_chart.data.datasets.findIndex(dataset => dataset.id == data.id);
	evc_chart.data.datasets.splice(index, 1);
	evc_chart.update();
}

async function selectElement(element_id, select2_element){
	// Fetches the requested element from the remote data source and
	// selects it
	$.ajax({
		type: 'GET',
		url: '/api/search_characters',
		data: {id: element_id}
	}).then(function (data) {
		// create the option and append to Select2
		var option = new Option(data.name, data.id, true, true);
		select2_element.append(option).trigger('change');
	});
}

async function updateCloseness(closeness_chart){
	// Remove the old dataset
	closeness_chart.data.datasets.splice(0, 1);

	data_1 = $("#select2_char_1").select2("data")[0]
	data_2 = $("#select2_char_2").select2("data")[0]

	response = await $.ajax({
		url: "/api/closeness",
		method: "GET",
		data: {id_1: data_1.id, id_2: data_2.id}
	});

	closeness_chart.data.datasets.push({
		fill: false,
		label: data_1.text + " <-> " + data_2.text,
		data: response.data
	})
	closeness_chart.update();
}
