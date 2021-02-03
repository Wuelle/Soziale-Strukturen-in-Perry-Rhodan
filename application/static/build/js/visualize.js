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
var layout,bb,use_cola;$(document).ready(async()=>{let initial_values={id:1,label:"Die dritte Macht"};selectElement(initial_values,$('#cycle_selector'))
let data=await getCycleData(initial_values.id);data.container=$("#cy");data.style=[{selector:"node.withLabel",style:{"text-halign":"right","text-valign":"bottom","label":"data(name)","font-size":"mapData(importance, 0, 1, 3, 10)","color":"#fff"}},{selector:"node",style:{"background-color":"#ddd","width":"mapData(importance, 0, 1, 5, 20)","height":"mapData(importance, 0, 1, 5, 20)"}},{selector:"edge.withLabel",style:{"label":"data(weight)","font-size":"mapData(weight, 0, 100, 3, 10)","text-rotation":"autorotate","color":"#fff"}},{selector:"edge",style:{"width":0.5,"line-color":"#30d5c8","line-opacity":"mapData(weight, 0, 100, 0.2, 1)","curve-style":"bezier"}}]
data.layout={name:"circle"}
data.wheelSensitivity=0.1;cy=cytoscape(data);cy.on("render",(e)=>{console.log("I am ready")})
cy.panzoom();var layout=makeLayout();layout.run();function makeLayout(opts){if(use_cola){return cy.layout({name:"cola",nodeSpacing:50,edgeLengthVal:50,animate:true,randomize:false,edgeLength:function(e){return 50/e.data("weight");},maxSimulationTime:5000});}
else{return cy.layout({name:"circle"})}}
$("#toggleEdgeLabels").change((e)=>{for(edge of cy.edges()){if(e.target.checked){edge.addClass("withLabel")}
else{edge.removeClass("withLabel")}}}).trigger("change");$("#toggleNodeLabels").change((e)=>{for(node of cy.nodes()){if(e.target.checked){node.addClass("withLabel")}
else{node.removeClass("withLabel")}}}).trigger("change");$("#toggleLayout").change((e)=>{use_cola=e.target.checked;makeLayout().run();}).trigger("change");$("#cycle_selector").on("select2:select",async(e)=>{$("#communities").empty()
let data=await getCycleData(e.params.data.id);cy.json({elements:data.elements});makeLayout().run();$("#toggleNodeLabels").trigger("change");$("#toggleEdgeLabels").trigger("change");});});function downloadGraph(){let filetype=$("#fileType").val();let mode=$("#download_option").is(":checked");if(filetype==="svg"){var image=cy.svg({full:mode,bg:"#000000"});}
else if(filetype==="png"){var image=cy.png({full:mode,bg:"#000000",output:"blob"});}
else if(filetype==="jpg"){var image=cy.jpg({full:mode,bg:"#000000",output:"blob"});}
let a=document.createElement("a");let blob=new Blob([image],{type:"image/"+filetype});a.download="RhodanGraph."+filetype;a.href=window.URL.createObjectURL(blob);a.click();}
async function formClusters(){$("#communities").empty()
let cycle_id=$("#cycle_selector").s2_value()
let response=await $.ajax({url:"/api/getClusters",data:{"cycle":cycle_id},method:"GET"}).fail(()=>{flash("Fehler beim Kontaktieren des Servers")});let groups=group(response.data);let colors=generate({num:size_dict(groups),lum:50,sat:100,alpha:1})
let colors_transparent=generate({num:size_dict(groups),lum:50,sat:100,alpha:0.2})
for(var g_id in groups){let chars=groups[g_id]
let li=$("<li></li>").attr("id",g_id);let color_block=$("<span></span>").addClass("color_block").css({"background-color":colors[g_id]});li.append(color_block);li.append(" "+chars.length+" Mitglieder");$("#communities").append(li);}}
async function getCycleData(id){let response=await $.ajax({url:"/api/getCytoscapeGraph",data:{"cycle":id},method:"GET"}).fail(()=>{flash("Fehler beim Kontaktieren des Servers")});;return response.data}
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
document.addEventListener("DOMContentLoaded",(event)=>{var select_elements=document.getElementsByClassName("pretty_select");for(var i=0;i<select_elements.length;i++){var html_select=select_elements[i].getElementsByTagName("select")[0];var selected_item=document.createElement("DIV");selected_item.setAttribute("class","select-selected");selected_item.innerHTML=html_select.options[0].innerHTML;select_elements[i].appendChild(selected_item);var option_list=document.createElement("DIV");option_list.setAttribute("class","select-items select-hide");for(var option_index=0;option_index<html_select.length;option_index++){var option=document.createElement("DIV");option.innerHTML=html_select.options[option_index].innerHTML;option.addEventListener("click",function(e){var y,i,k,parent_select,h,num_options,yl;parent_select=this.parentNode.parentNode.getElementsByTagName("select")[0];num_options=parent_select.length;h=this.parentNode.previousSibling;for(i=0;i<num_options;i++){if(parent_select.options[i].innerHTML==this.innerHTML){parent_select.selectedIndex=i;h.innerHTML=this.innerHTML;y=this.parentNode.getElementsByClassName("same-as-selected");yl=y.length;for(k=0;k<yl;k++){y[k].removeAttribute("class");}
this.setAttribute("class","same-as-selected");break;}}
h.click();});if(option_index==0){option.setAttribute("class","same-as-selected")}
option_list.appendChild(option);}
select_elements[i].appendChild(option_list);selected_item.addEventListener("click",function(e){e.stopPropagation();closeAllSelect(this);this.nextSibling.classList.toggle("select-hide");this.classList.toggle("select-arrow-active");});}
function closeAllSelect(element){var x,y,i,xl,yl,arrNo=[];x=document.getElementsByClassName("select-items");y=document.getElementsByClassName("select-selected");xl=x.length;yl=y.length;for(i=0;i<yl;i++){if(element==y[i]){arrNo.push(i)}else{y[i].classList.remove("select-arrow-active");}}
for(i=0;i<xl;i++){if(arrNo.indexOf(i)){x[i].classList.add("select-hide");}}}
document.addEventListener("click",closeAllSelect);})