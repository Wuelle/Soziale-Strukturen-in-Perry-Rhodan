$("document").ready(() => {
	var ctx = $("#eigenvector_centrality");
	var myChart = new Chart(ctx, {
		type: 'line',
		data: {
			labels: {{ labels }},
			datasets: [{data: {{ data }}}]
		},
		options: {
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
})

