$(document).ready(() => {
	$("#select2_cycleselector").on("select2:select", (e) => {
		console.log("chanignngngng")
		updateStats(e.params.data);

	});
});

function updateStats(data){
	/*
	Updates the whole page to display the stats of the newly selected cycle
	*/
	console.log("Updating stats for: " + data.text);

	// Update stats table
	getBasicData(data.id).then((response) => {
		$("#cycle_name").html(response.name);
		$("#cycle_num_persons").html(response.num_persons);
		$("#cycle_num_relations").html(response.num_relations);
		$("#cycle_clustering").html(response.clustering);

	});
};

function getBasicData(cycle_id){
	return $.ajax({
		method: "GET",
		url: "/api/getcycleinfo",
		data: {id: cycle_id}
	})
}