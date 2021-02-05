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
let initial_values={cycle:{id:1,label:"Die dritte Macht"},closeness_1:{id:"EJ-OFZ2G2I6plm7cYkxkey7oXBTcbef9WjV7RzJfFH4",label:"Perry Rhodan"},closeness_2:{id:"Q1rzWyIepljelu1G1xJFy0AMRxUQl1Y_0kY_cCceHlg",label:"Gucky"}}
var groups;$(document).ready(async()=>{Chart.defaults.global.responsive=true;Chart.defaults.global.plugins.colorschemes.scheme='tableau.HueCircle19'
Chart.defaults.global.layout.padding={left:50,right:50,top:0,bottom:0}
Chart.defaults.global.defaultFontColor="#E0E0E0";selectElement(initial_values.cycle,$("#select2_cycleselector"));selectElement(initial_values.closeness_1,$("#select2_char_1"));selectElement(initial_values.closeness_2,$("#select2_char_2"));cycle_evc_ranking=new Chart($("#cycle_evc_ranking"),{type:"bar",data:{datasets:[]},options:{scales:{yAxes:[{ticks:{min:0}}]}}});community_evc_ranking=new Chart($("#community_ranking"),{type:"bar",data:{datasets:[]},options:{scales:{yAxes:[{ticks:{min:0}}]}}});$("#select2_cycleselector").on("select2:select",(e)=>{updateStats(e.params.data);})
$("#select2_char_1").on("select2:select",(e)=>{updateCloseness();});$("#select2_char_2").on("select2:select",(e)=>{updateCloseness();});updateStats(initial_values.cycle);});function updateStats(data){updateInfoTable(data.id);updateCycleEVC(data.id);updateCommunityInfo(data.id);updateCloseness();};function updateCloseness(){let id_1=$("#select2_char_1").s2_value()
let id_2=$("#select2_char_2").s2_value()
let cycle_id=$("#select2_cycleselector").s2_value()
if(id_1&&id_2&&cycle_id){$.ajax({method:"GET",url:"/api/getCloseness",data:{id_1:id_1,id_2:id_2,cycle:cycle_id}}).then((response)=>{output=$("#relation_output");if(response.distance==-1)output.text("Keine Verbindung in diesem Zyklus");else output.text((response.distance-1)+" Nodes voneinander entfernt")}).fail(()=>{flash("Fehler beim Kontaktieren des Servers")});}}
function updateInfoTable(cycle_id){$.ajax({method:"GET",url:"/api/getcycleinfo",data:{id:cycle_id}}).then((response)=>{$("#cycle_name").html(response.name);$("#cycle_num_persons").html(response.num_persons);$("#cycle_num_relations").html(response.num_relations);$("#cycle_clustering").html(response.clustering);$("#cycle_attributes_container").css("display","block")}).fail(()=>{flash("Fehler beim Kontaktieren des Servers")});}
function updateCycleEVC(cycle_id){cycle_evc_ranking.data.datasets.splice(0,1);$.ajax({method:"GET",url:"/api/getCycleEVC",data:{id:cycle_id}}).then((response)=>{current_ranking_values=[...response.data];let items=response.data.slice(0,10);let labels=[];let values=[];for(var item of items){labels.push(item.name);values.push(item.value);}
cycle_evc_ranking.data.labels=labels;cycle_evc_ranking.data.datasets.push({label:"Eigenvektorzentralität",data:values})
cycle_evc_ranking.update()}).fail(()=>{flash("Fehler beim Kontaktieren des Servers")});}
async function updateCommunityInfo(cycle_id){$("#community_list").empty()
let response=await $.ajax({url:"/api/getClusters",data:{"cycle":cycle_id},method:"GET"}).fail(()=>{flash("Fehler beim Kontaktieren des Servers")});groups=group(response.data);let colors=generate({num:size_dict(groups),lum:50,sat:100,alpha:1});let index=0;for(var g_id in groups){let chars=groups[g_id];let li=$("<li></li>").attr("id",g_id);let color_block=$("<span></span>").addClass("color_block").css({"background-color":colors[index]});li.append(color_block);li.append(" "+chars.length+" Mitglieder");li.click(selectGroup);if(index==0)li.addClass("preselected")
$("#community_list").append(li);index+=1;}
$("#community_list").find(".preselected").click()}
function selectGroup(e){let target=$(e.target)
for(var i of $("#community_list li"))$(i).removeClass("selected")
target.addClass("selected");g_id=$(e.target).attr("id");$.ajax({method:"GET",url:"/api/search_characters",data:{id:groups[g_id]}}).then((e)=>{$("#community_members").empty()
for(var id of groups[g_id]){let char=$("<span></span>").text(e[id]).addClass("member");$("#community_members").append(char);}}).fail(()=>{flash("Fehler beim Kontaktieren des Servers")});community_evc_ranking.data.datasets.splice(0,1);characters=[...current_ranking_values].filter(char=>groups[g_id].includes(char.id))
characters.sort((a,b)=>(a.value<b.value)?1:-1)
characters=characters.splice(0,5);let labels=[];let values=[];for(char of characters){labels.push(char.name);values.push(char.value);}
community_evc_ranking.data.labels=labels;community_evc_ranking.data.datasets.push({label:"Eigenvektorzentralität",data:values})
community_evc_ranking.update()}
function group(groups){new_groups={}
for(var char in groups){let group_id=groups[char]
if(group_id in new_groups){new_groups[group_id].push(char);}
else{new_groups[group_id]=[char];}}
return new_groups}
function size_dict(d){c=0;for(i in d)++c;return c}
function hslToRgb(h,s,l){var r,g,b;if(s==0){r=g=b=l;}
else{var hue2rgb=function hue2rgb(p,q,t){if(t<0)
t+=1;if(t>1)
t-=1;if(t<1/6)
return p+(q-p)*6*t;if(t<1/2)
return q;if(t<2/3)
return p+(q-p)*(2/3-t)*6;return p;};var q=l<0.5?l*(1+s):l+s-l*s;var p=2*l-q;r=hue2rgb(p,q,h+1/3);g=hue2rgb(p,q,h);b=hue2rgb(p,q,h-1/3);}
return[Math.round(r*255),Math.round(g*255),Math.round(b*255)];}
function generate(config){var colors=[];if(!config.offset)config.offset=0;if(!config.alpha)config.alpha=1;for(var i=0;i<config.num;i++){let color=hslToRgb((i/config.num)+config.offset,config.sat/100,config.lum/100)
color.push(config.alpha)
colors.push('rgba('+color.toString()+')');}
return colors;}