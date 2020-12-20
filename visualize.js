$(document).ready(function() {
	$.getJSON("data/cytoscape_graph.json", function(data){
		data.container = $('#cy');
		data.style = [ // the stylesheet for the graph
			{
				selector: "node.withLabel",
				style: {
					"text-halign":"right",
					"text-valign":"bottom",
					'label': 'data(name)',
					"font-size": "mapData(importance, 0, 1, 3, 10)",
					"color":"#fff"
				}
			},
			{
			  selector: 'node',
			  style: {
				'background-color': '#ddd',
				'width': "mapData(importance, 0, 1, 5, 20)",
				'height': 'mapData(importance, 0, 1, 5, 20)'
			  }
			},
			{
				selector: "edge.withLabel",
				style: {
					"label": "data(weight)",
					"font-size": "mapData(weight, 0, 100, 3, 10)",
					"text-rotation":"autorotate",
					"color":"#fff"	
				}
			},

			{
			  selector: 'edge',
			  style: {
				'width': 1,
				'line-color': '#30d5c8',
				'curve-style': 'bezier'      
				}
			}
		  ]
		data.layout = {
			name:"cose", 
			animate:"true",
			idealEdgeLength: function( edge ){ return 1; },
		}
		cy = cytoscape(data);
		cy.panzoom();
		var file = new Blob([cy.png({output: 'blob'})]);

	});

	$("#toggleEdgeLabels").change(function(e){
		for(edge of cy.edges()){
			if(e.target.checked){
				edge.addClass("withLabel")
			}
			else{
				edge.removeClass("withLabel")
			}
		}
	});
	$("#toggleNodeLabels").change(function(e){
		for(node of cy.nodes()){
			if(e.target.checked){
				node.addClass("withLabel")
			}
			else{
				node.removeClass("withLabel")
			}
		}
	});
});