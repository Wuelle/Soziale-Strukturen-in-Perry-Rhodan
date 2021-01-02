$("document").ready(() => {
	// Create Chart
	var chart = new Chart($("#eigenvector_centrality"), {
		type: 'line',
		responsive: true,
		data: {
			labels: {{ labels }},
			datasets: [{
				fill: false,
				label: "{{ label }}",
				data: {{ data }}
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
		console.log("Selecting", e.params.data.text)
		addLine(e.params.data, chart)
	});
	$("#select2_eigenvector_centrality").on("select2:unselect", (e) => {
		console.log("Unselecting", e.params.data.text)
		removeLine(e.params.data, chart)
	});
})

async function addLine(character, chart){
	let data = await getEVCData(character.id);
	let color = "rgba("+Math.random()*255+", "+Math.random()*255+", "+Math.random()*255+", 0.5)";
	console.log(data)
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
	chart.data.datasets.forEach((dataset) => {
		console.log(dataset.label)
		if(dataset.label == data.text){
			console.log("found thingy to remove")
		}
	});
}

async function getEVCData(id){
	let r = await $.ajax({
		url: "/EVC_Analysis",
		data: {ID: id},
		method: "GET"
	});
	console.log(r);
	return r.data
}


