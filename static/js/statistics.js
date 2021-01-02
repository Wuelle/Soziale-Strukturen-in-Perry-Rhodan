$("document").ready(async() => {
	// Initial data
	let label = "Perry Rhodan";
	let data = await getEVCData("EJ-OFZ2G2I6plm7cYkxkey7oXBTcbef9WjV7RzJfFH4");
	let cycles = await $.ajax({method:"GET", url:"/getCycles"})

	// Create Chart
	var chart = new Chart($("#eigenvector_centrality"), {
		type: 'line',
		responsive: true,
		data: {
			labels: cycles.titles,
			datasets: [{
				fill: false,
				label: label,
				data: data
			}]
		},
		
		options: {
			scales: {
				yAxes: [{
					ticks: {
						max: 1,
						min: 0
					}
				}]
			},
			layout: {
				padding: {
					left: 50,
					right: 50,
					top: 0,
					bottom: 0
				}
			}
		}
	});

	// Add event handlers to select2 element
	$("#select2_eigenvector_centrality").on("select2:select", (e) => {
		addLine(e.params.data, chart)
	});
	$("#select2_eigenvector_centrality").on("select2:unselect", (e) => {
		removeLine(e.params.data, chart)
	});
})

async function addLine(character, chart){
	let data = await getEVCData(character.id);
	let color = "rgba("+Math.random()*255+", "+Math.random()*255+", "+Math.random()*255+", 0.5)";

	dataset = {
		fill: false,
		backgroundColor: color,
		borderColor: color,
		label: character.text,
		data: data
	}
	chart.data.datasets.push(dataset)
	chart.update();
}

function removeLine(data, chart){
	index = chart.data.datasets.findIndex(dataset => dataset.label == data.text);
	chart.data.datasets.splice(index, 1);
	chart.update();
}

async function getEVCData(id){
	let r = await $.ajax({
		url: "/EVC_Analysis",
		data: {ID: id},
		method: "GET"
	});
	return r.data
}


