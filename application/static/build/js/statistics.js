console.log("\
	                                 _               _             \n\
	                                | |             | |            \n\
	 _ __   ___ _ __ _ __ _   _ _ __| |__   ___   __| | __ _ _ __  \n\
	| '_ \\ / _ \\ '__| '__| | | | '__| '_ \\ / _ \\ / _` |/ _` | '_ \ \n\
	| |_) |  __/ |  | |  | |_| | |  | | | | (_) | (_| | (_| | | | |\n\
	| .__/ \\___|_|  |_|   \\__, |_|  |_| |_|\\___/ \\__,_|\\__,_|_| |_|\n\
	| |                    __/ |                                   \n\
	|_|                   |___/                                    ");function flash(msg){let div=$("<div></div>").text(msg).addClass("flashed_message");div.delay(10000).fadeOut(500).promise().then((e)=>{$(e).remove()
if($("#flashed_messages").children().length==0)$("#flashed_messages").css("display","none")});div.hover((e)=>{$(e.target).fadeOut(500).remove();if($("#flashed_messages").children().length==0)$("#flashed_messages").css("display","none")})
$("#flashed_messages").append(div);$("#flashed_messages").css("display","initial")}
function chartjs_colorscheme(scheme){scheme.splice(0,scheme.length,"rgba(0,204,255,1)","rgba(51,0,255,1)","rgba(255,0,204,1)","rgba(255,51,0,1)","rgba(204,255,0,1)","rgba(0,255,51,1)")
return scheme}
let initial_values={id:"EJ-OFZ2G2I6plm7cYkxkey7oXBTcbef9WjV7RzJfFH4",label:"Perry Rhodan"}
let cycles_prom=$.ajax({method:"GET",url:"/api/getCycles"}).fail(()=>{flash("Fehler beim Kontaktieren des Servers")});$("document").ready(async()=>{Chart.defaults.global.responsive=true;Chart.defaults.global.plugins.colorschemes.scheme='tableau.HueCircle19'
Chart.defaults.global.layout.padding={left:50,right:50,top:0,bottom:0}
Chart.defaults.global.defaultFontColor="#E0E0E0";selectElement(initial_values,$("#select2_eigenvector_centrality"));cycles=await cycles_prom;var evc_chart=new Chart($("#eigenvector_centrality"),{type:'line',data:{labels:cycles.titles,datasets:[]},options:{scales:{yAxes:[{ticks:{max:1,min:0}}]}}});var connectedness_chart=new Chart($("#connectedness"),{type:'line',data:{labels:cycles.titles,datasets:[]},options:{scales:{yAxes:[{ticks:{min:0}}]}}});$("#select2_eigenvector_centrality").on("select2:select",(e)=>{addLine(e.params.data,evc_chart)});$("#select2_eigenvector_centrality").on("select2:unselect",(e)=>{removeLine(e.params.data,evc_chart)});addLine({id:initial_values.id,text:initial_values.label},evc_chart)
$.ajax({url:"/api/getCycleConnectedness",method:"GET"}).then((response)=>{connectedness_chart.data.datasets.push({label:"Verbundenheit",data:response.data})
connectedness_chart.update();}).fail(()=>{flash("Fehler beim Kontaktieren des Servers")});});async function addLine(character,evc_chart){$.ajax({url:"/api/EVC_Analysis",method:"GET",data:{id:character.id}}).then((response)=>{evc_chart.data.datasets.push({id:character.id,fill:false,label:character.text,data:response.data})
evc_chart.update();}).fail(()=>{flash("Fehler beim Kontaktieren des Servers")});}
function removeLine(data,evc_chart){index=evc_chart.data.datasets.findIndex(dataset=>dataset.id==data.id);if(index!=-1){evc_chart.data.datasets.splice(index,1);evc_chart.update();}}