from flask import Blueprint, jsonify, request, current_app
from app.backend.models import Node, Relation, Zyklus, Link
import app.backend.analyse as analyse
import secrets
from app import db

# Define the blueprint
api = Blueprint('api', __name__, url_prefix='/api')

@api.route("/getCycles", methods=["GET"])
def getCycles():
	"""
	Returns a list with all Cycle names
	"""
	return jsonify(titles=[c.name for c in db.session.query(Zyklus).all()])

@api.route("/getCytoscapeGraph", methods=["GET"])
def getCytoscapeGraph():
	cycle = request.args["cycle"]

	data = analyse.analyse_cycles(int(cycle))

	# Assign arbitrary id since networkx doesnt do that...
	for element in data["elements"]["edges"]:
		element["data"]["id"] = secrets.token_urlsafe(32)
	return jsonify(data=data)

@api.route("/EVC_Analysis", methods=["GET"])
def evc_analysis():
	"""
	Performs an Eigenvectorcentrality Analysis of the Character on every cycle.
	Expects the Characters ID as parameter "ID".
	"""
	data = analyse.eigenvector_centrality(request.args["ID"])
	return jsonify(data=data)

@api.route("/closeness", methods=["GET"])
def closeness():
	data = analyse.closeness(request.args["id_1"], request.args["id_2"])
	return jsonify(data=data)

@api.route("/getClusters", methods=["GET"])
def getClusters():
	data = analyse.cluster(int(request.args["cycle"]))
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