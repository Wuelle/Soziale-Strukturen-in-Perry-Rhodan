var layout, bb, use_cola;
$(document).ready(async() => {
	let initial_values = {
		id: 1,
		label: "Die dritte Macht"
	};
	// Preselect "Die Dritte Macht" in select2 element
	selectElement(initial_values, $('#cycle_selector'))

	let data = await getCycleData(initial_values.id);
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
	cy.on("render", (e) => {
		console.log("I am ready")
	})
	cy.panzoom();

	var layout = makeLayout();
	layout.run();

	function makeLayout(opts){
		if(use_cola){
			return cy.layout({
				name: "cola",
				nodeSpacing: 50,
				edgeLengthVal: 50,
				animate: true,
				randomize: false,
				edgeLength: function(e){ return 50 / e.data("weight");},
				maxSimulationTime: 5000
			});
		}
		else{
			// Return circular layout - faster, but less fancy
			return cy.layout({name: "circle"})
		}
	}

	$("#toggleEdgeLabels").change((e) => {
		for(edge of cy.edges()){
			if(e.target.checked){
				edge.addClass("withLabel")
			}
			else{
				edge.removeClass("withLabel")
			}
		}
	}).trigger("change");

	$("#toggleNodeLabels").change((e) => {
		for(node of cy.nodes()){
			if(e.target.checked){
				node.addClass("withLabel")
			}
			else{
				node.removeClass("withLabel")
			}
		}
	}).trigger("change");

	$("#toggleLayout").change((e) => {
		use_cola = e.target.checked;
		makeLayout().run();
	}).trigger("change");

	$("#cycle_selector").on("select2:select", async(e) => {
		// Reset Group analysis stuff
		removeBubblesets();
		$("#communities").empty()

		let data = await getCycleData(e.params.data.id);
		cy.json({elements: data.elements});

		// Re-run the layout
		makeLayout().run();

		// Trigger a change event so labels are displayed even on new nodes
		$("#toggleNodeLabels").trigger("change");
		$("#toggleEdgeLabels").trigger("change");
	});
});

function downloadGraph(){
	let filetype = $("#fileType").val();
	let mode = $("#download_option").is(":checked");

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
	// Destroys all displayed bubblesets, eg when the cycle changes
	for (var path of bb.getPaths()){
		bb.removePath(path);
	}
}

async function formClusters(){
	$("#communities").empty()
	removeBubblesets()

	let cycle_id = $("#cycle_selector").s2_value()

	let response = await $.ajax({
		url: "/api/getClusters",
		data: {"cycle": cycle_id},
		method: "GET"
	})
	.fail(() => {flash("Fehler beim Kontaktieren des Servers")});
	let groups = group(response.data);
	let colors = generate({num: size_dict(groups), lum: 50, sat: 100, alpha: 1})
	let colors_transparent = generate({num: size_dict(groups), lum: 50, sat: 100, alpha: 0.2})

	for(var g_id in groups){
		let chars = groups[g_id]

		let cy_nodes = cy.collection();
		for(var char of chars){
			cy_nodes = cy_nodes.union(cy.nodes("#" + char)[0]);
		}
		bb.addPath(cy_nodes, null, null, {
        	style: {fill: colors_transparent[g_id]},
        	stroke: "green"
      	});

		// Add the Group to the list of Groups
		let li = $("<li></li>").attr("id", g_id);
		let color_block = $("<span></span>").addClass("color_block").css({"background-color": colors[g_id]});
		li.append(color_block);
		li.append(" " + chars.length + " Mitglieder");
		$("#communities").append(li);
	}
}
async function getCycleData(id){
	let response = await $.ajax({
		url: "/api/getCytoscapeGraph",
		data: {"cycle": id},
		method: "GET"
	})
	.fail(() => {flash("Fehler beim Kontaktieren des Servers")});;
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

function size_dict(d){c=0; for (i in d) ++c; return c}
