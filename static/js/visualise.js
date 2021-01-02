var layout;
const species_colors = {
	Terraner: "blue",
	Arkoniden: "red",
	Kunstwesen: "orange",
	Entität: "green",
	Ilts: "brown",
	Haluter: "purple",
	Plophoser: "pink",
	Ertruser: "yellow",
	Tefroder: "gray",
	Siganesen: "magenta",
	Kartanin: "light green",
	Akonen: "dark blue",
	Springer: "dark green",
	Oxtorner: "light brown",
	Andere: "light purple",
	Unbekannt: "turquoise"
}
$(document).ready(() => {
	$.getJSON("data/cytoscape_graph.json", (data) =>{
		data.container = $("#cy");
		data.style = [ // the stylesheet for the graph
			{
				selector: "node.withLabel",
				style: {
					"text-halign":"right",
					"text-valign":"bottom",
					"label": "data(name)",
					"font-size": "mapData(importance, 0, 1, 3, 10)",
					"color":"#fff"
				}
			},
			{
				selector: "node.withBorder",
				style: {
					"border-width": "mapData(importance, 0, 1, 1, 4)",
					"border-style": "solid",
					"border-color": mapSpeciesColor
				}
			},
			{
				selector: "node",
				style: {
					"background-color": "#ddd",
					"width": "mapData(importance, 0, 1, 5, 20)",
					"height": "mapData(importance, 0, 1, 5, 20)"
				}
			},
			{
				selector: "edge.withLabel",
				style: {
					"label": "data(weight)",
					"font-size": "mapData(weight, 0, 100, 3, 10)",
					"text-rotation": "autorotate",
					"color": "#fff"
				}
			},

			{
				selector: "edge",
				style: {
					"width": 0.5,
					"line-color": "#30d5c8",
					"line-opacity": "mapData(weight, 0, 100, 0.2, 1)",
					"curve-style": "bezier"      
				}
			}
			]
		data.layout = {
			name:"grid"
		}
		data.wheelSensitivity = 0.1;
		cy = cytoscape(data);
		cy.ready((e) => {
				const bb = cy.bubbleSets();
				bb.addPath(cy.nodes(), cy.edges(), null);
		});
		cy.panzoom();
 
		// Browser might have saved previous checkbox states
		$("#toggleNodeLabels").trigger("change");
		$("#toggleEdgeLabels").trigger("change");

		// Create default parameters for Cola.js
		var params = {
			name: "cola",
			nodeSpacing: $("#node_spacing_slider").val(),
			edgeLengthVal: $("#edge_length_slider").val(),
			animate: true,
			randomize: false,
			maxSimulationTime: 5000
		};

		// Run Cola Layout
		var layout = makeLayout();
		layout.run();

		function makeLayout(opts){
			// Overwrite parameters
			for(var i in opts){
				params[i] = opts[i];
			}
			params.edgeLength = function(e){ return params.edgeLengthVal / e.data("weight"); };

			return cy.layout(params);
		}

		// The sliders modify nodeSpacing and edgeLengthVal params
		$("#edge_length_slider").bind("change", {layout: layout}, function(e){
			e.data.layout.stop();
			var layout = makeLayout({edgeLengthVal: e.target.value});
			layout.run();
		});
		$("#node_spacing_slider").bind("change", {layout: layout}, function(e){
			e.data.layout.stop();
			var layout = makeLayout({nodeSpacing: e.target.value});
			layout.run();
		});


	});

	$("#toggleEdgeLabels").change((e) =>{
		for(edge of cy.edges()){
			if(e.target.checked){
				edge.addClass("withLabel")
			}
			else{
				edge.removeClass("withLabel")
			}
		}
	});

	$("#toggleNodeLabels").change((e) =>{
		for(node of cy.nodes()){
			if(e.target.checked){
				node.addClass("withLabel")
			}
			else{
				node.removeClass("withLabel")
			}
		}
	});

	$("#toggleBorder").change((e) =>{
		for(node of cy.nodes()){
			if(e.target.checked){
				node.addClass("withBorder")
			}
			else{
				node.removeClass("withBorder")
			}
		}
	});

	// Add Collapsible text to the sidebar
	var coll = document.getElementsByClassName("toggle_collapsible");

	for (var i = 0; i < coll.length; i++) {
	  coll[i].addEventListener("click", function(){
	    this.classList.toggle("active");
	    var content = this.nextElementSibling;
	    if (content.style.display === "block") {
	      content.style.display = "none";
	    } else {
	      content.style.display = "block";
	    }
	  });
	}
});

function downloadGraph(){
	let filetype = $("#fileType").val();
	let mode = $("#option_full").is(":checked");
	console.log(filetype)

	if(filetype === "svg"){
		var image = cy.svg({full:mode, bg:"#000000"});
	}
	else if(filetype === "png"){
		var image = cy.png({full:mode, bg:"#000000", output: "blob"});
	}
	else if(filetype === "jpg"){
		var image = cy.jpg({full:mode, bg:"#000000", output: "blob"});
	}
	let a = document.createElement("a");
	let blob = new Blob([image], {type: "image/"+filetype});
	a.download = "RhodanGraph." + filetype;
	a.href = window.URL.createObjectURL(blob);
	a.click();
}

function formClusters(){
	let num_clusters = $("#numClusters").val();

	// Doesnt really make sense to use importance here, rethink
	let clusters = cy.elements().kMeans({k:2, attributes:[function(node){return node.data("importance")}]})
	
}
function mapSpeciesColor(ele){
	let species = ele.data().species.replace("\n", "");
	if(species in species_colors){
		return species_colors[species]
	}
	else if(species===""){
		return species.Andere
	}
	console.log(species)
	return species_colors.Unbekannt

}
