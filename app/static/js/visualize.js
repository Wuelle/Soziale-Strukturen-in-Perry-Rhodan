var layout, bb;
$(document).ready(async() => {
	// Preselect "Die Dritte Macht" in select2 element
	let initial_id = 1;
	let initial_label = "Die dritte Macht";

	// Fetch the preselected item, and add to the control
	var cycleSelect = $('#cycle_selector');
	$.ajax({
		type: 'GET',
		url: '/api/search_cycles',
		data: {id: initial_id}
	}).then(function (data) {
		// create the option and append to Select2
		var option = new Option(data.name, data.id, true, true);
		cycleSelect.append(option).trigger('change');
	});


	let data = await getCycleData(initial_id);
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
		name:"circle"
	}
	data.wheelSensitivity = 0.1;

	// Initialize cytoscape stuff
	cy = cytoscape(data);
	cy.ready((e) => {
			bb = cy.bubbleSets();
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
	// layout.run();  // Commented out for debugging

	function makeLayout(opts){
		// Overwrite parameters
		for(var i in opts){
			params[i] = opts[i];
		}
		params.edgeLength = function(e){ return params.edgeLengthVal / e.data("weight"); };

		return cy.layout(params);
	}

	$("#toggleEdgeLabels").change((e) =>{
		for(edge of cy.edges()){
			if(e.target.checked){
				edge.addClass("withLabel")
			}
			else{
				edge.removeClass("withLabel")
			}
		}
	}).trigger("change");

	$("#toggleNodeLabels").change((e) =>{
		for(node of cy.nodes()){
			if(e.target.checked){
				node.addClass("withLabel")
			}
			else{
				node.removeClass("withLabel")
			}
		}
	}).trigger("change");

	$("#cycle_selector").on("select2:select", async(e) => {
		removeBubblesets();
		let data = await getCycleData(e.params.data.id);
		cy.json({elements: data.elements});

		// Re-run the layout
		cy.layout({name: "circle"}).run()
		// makeLayout().run();

		// Trigger a change event so labels are displayed even on new nodes
		$("#toggleNodeLabels").trigger("change");
	});
});

function downloadGraph(){
	let filetype = $("#fileType").val();
	let mode = $("#option_full").is(":checked");

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

function removeBubblesets(){
	console.log("removing all bubblesets")
	// Destroys all displayed bubblesets, eg when the cycle changes
	for (var path of bb.getPaths()){
		bb.removePath(path);
	}
}

async function formClusters(){
	let cycle_id = $("#cycle_selector").val()

	let response = await $.ajax({
		url: "/api/getClusters",
		data: {"cycle": cycle_id},
		method: "GET"
	});
	let groups = group(response.data);
	for(var g_id in groups){
		let chars = groups[g_id]

		let cy_nodes = cy.collection();
		for(var char of chars){
			cy_nodes = cy_nodes.union(cy.nodes("#" + char)[0]);
		}
		const bbStyle = {
        	fillStyle: 'red',
      	};
		bb.addPath(cy_nodes, null, null, bbStyle);
	}
}
async function getCycleData(id){
	let response = await $.ajax({
		url: "/api/getCytoscapeGraph",
		data: {"cycle": id},
		method: "GET"
	});
	return response.data
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