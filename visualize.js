document.addEventListener("DOMContentLoaded", function() {
	$.getJSON("data/cytoscape_graph.json", function(data){
		data.container = $('#cy');
		data.style = [ // the stylesheet for the graph
		    {
		      selector: 'node',
		      style: {
		        'background-color': '#666',
		        'label': 'data(name)',
		        'width': 'mapData(weight, 30, 80, 20, 50)',
    			'height': 'mapData(height, 0, 200, 10, 45)'
		      }
		    },

		    {
		      selector: 'edge',
		      style: {
		        'width': 3,
		        'line-color': '#ccc',
		        'curve-style': 'bezier',
		        "label": "data(weight)",
		        "text-rotation":"autorotate"
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
});