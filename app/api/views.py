from flask import Blueprint, jsonify, request, current_app
from app.backend.models import Node, Relation, Zyklus, Link, Information, Community
from sqlalchemy import desc, func, distinct, or_
import app.backend.analyse as analyse
import networkx as nx
from app import db
import secrets

# Define the blueprint
api = Blueprint('api', __name__, url_prefix='/api')

@api.route("/getCycles", methods=["GET"])
def getCycles():
	"""
	Returns a list with all Cycle names
	"""
	return jsonify(titles=[c.name for c in db.session.query(Zyklus).all()])

def characters_in_cycle(cycle):
	return db.session.query(Node, Information).join(Relation, or_(Node.id==Relation.node_1, Node.id==Relation.node_2)).filter(Relation.cycle==cycle, Information.cycle==cycle, Node.id==Information.node)

def relations_in_cycle(cycle):
	return db.session.query(Relation).filter(Relation.cycle==cycle)

@api.route("getcycleinfo", methods=["GET"])
def getcycleinfo():
	cycle_id = request.args["id"]
	cycle = db.session.query(Zyklus).filter(Zyklus.id == cycle_id).first()

	relations = db.session.query(Relation).filter(Relation.cycle == cycle_id).all()
	num_persons = len(set([r.node_1 for r in relations] + [r.node_2 for r in relations]))

	G = analyse.build_graph_from_cycle(cycle_id)
	clustering_coefficient = round(nx.average_clustering(G, weight="weight"), 3)
	return jsonify(name=cycle.name, num_relations=len(relations), num_persons=num_persons, clustering=clustering_coefficient)

@api.route("/getCytoscapeGraph", methods=["GET"])
def getCytoscapeGraph():
	cycle = request.args["cycle"]

	# Contains the graph in exported (cytoscape.js) form
	graph = {
		"data": [], 
		"directed": False,
		"multigraph": False,
		"elements": {"nodes": [], "edges": []}
		}

	characters = characters_in_cycle(cycle)
	relations =  relations_in_cycle(cycle)

	for char, info in characters:
		graph["elements"]["nodes"].append({"data":{"id": char.id, "value": char.id, "name": char.name, "importance":info.value}})

	for rel in relations:
		graph["elements"]["edges"].append({"data":{"id": rel.id, "source": rel.node_1, "target": rel.node_2, "weight": rel.weight}})

	return jsonify(data=graph)

@api.route("/getCycleEVC", methods=["GET"])
def getCycleEVC():
	G = analyse.build_graph_from_cycle(int(request.args["id"]))
	evc_values = nx.eigenvector_centrality(G, max_iter=200, weight="weight")
	nx.set_node_attributes(G, evc_values, "importance")
	result = [{"id": node[0], "name":node[1]["name"], "value":node[1]["importance"]} for node in G.nodes(data=True)]
	return jsonify(data=sorted(result, key=lambda x: x["value"], reverse=True))

@api.route("/EVC_Analysis", methods=["GET"])
def evc_analysis():
	"""
	Performs an Eigenvectorcentrality Analysis of the Character on every cycle.
	Expects the Characters ID as parameter "id".
	"""
	data = analyse.eigenvector_centrality(request.args["id"])
	return jsonify(data=data)

@api.route("/closeness", methods=["GET"])
def closeness():
	data = analyse.closeness(request.args["id_1"], request.args["id_2"])
	return jsonify(data=data)

@api.route("/getClusters", methods=["GET"])
def getClusters():
	"""
	Returns a dict of shape {character_id: group_id}
	"""
	cycle = request.args["cycle"]
	characters = characters_in_cycle(cycle)

	data = {char.id: info.community for (char, info) in characters}

	return jsonify(data=data)

@api.route("/search_characters", methods=["GET"])
def search_characters():
	if "id" in request.args:
		# Query for one specific Character
		char = db.session.query(Node).filter(Node.id == request.args["id"]).first()
		return jsonify(name=char.name, id=char.id)
	else:
		# TODO: SPLIT IN MAIN/SIDE CHARACTERS
		# # Perform a normal Select2 Search using pagination
		# query = request.args["query"]
		
		# # Characters are split into two groups, "main" and "side"
		# num_characters = db.session.query(Node).filter(Node.name.like(f"%{query}%")).count()
		# min_index = int(request.args["page"]) * config.SELECT2_PAGESIZE
		# max_index = min(min_index + config.SELECT2_PAGESIZE, num_characters)
		# all_characters = ....order_by()

		# characters = db.session.query(Node).filter(Node.name.like(f"%{query}%")).all()[min_index:max_index]

		# # Convert to select2 format
		# main_characters = {"id":char.id, "text":char.name} for char in main_characters
		# side_characters = {"id":char.id, "text":char.name} for char in side_characters
		# results = [{text: "Hauptcharaktere", children: main_characters}, {text: "Nebencharaktere", children: side_characters}]

		# return jsonify(results=results, pagination={"more":max_index < num_characters})
		# Perform a normal Select2 Search using pagination
		query = request.args["query"]
		
		num_characters = db.session.query(Node).filter(Node.name.like(f"%{query}%")).count()
		min_index = int(request.args["page"]) * current_app.config["SELECT2_PAGESIZE"]
		max_index = min(min_index + current_app.config["SELECT2_PAGESIZE"], num_characters)

		characters = db.session.query(Node).filter(Node.name.like(f"%{query}%")).all()[min_index:max_index]
		results = [{"id":char.id, "text":char.name} for char in characters]

		return jsonify(results=results, pagination={"more":max_index < num_characters})

@api.route("/search_cycles", methods=["GET"])
def search_cycles():
	if "id" in request.args:
		# Query for one specific Character
		cycle = db.session.query(Zyklus).filter(Zyklus.id == request.args["id"]).first()
		return jsonify(name=cycle.name, id=cycle.id)
	else:
		query = request.args["query"]

		num_cycles = db.session.query(Zyklus).filter(Zyklus.name.like(f"%{query}%")).count()
		min_index = int(request.args["page"]) * current_app.config["SELECT2_PAGESIZE"]
		max_index = min(min_index + current_app.config["SELECT2_PAGESIZE"], num_cycles)

		cycles = db.session.query(Zyklus).filter(Zyklus.name.like(f"%{query}%")).all()[min_index:max_index]
		results = [{"id":c.id, "text":c.name} for c in cycles]
		return jsonify(results=results, pagination={"more":max_index < num_cycles})