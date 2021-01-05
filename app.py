from download.Database import Node, Relation, Link, Zyklus, new_session
import download.analyse
from flask_sqlalchemy_session import flask_scoped_session
from flask import Flask, render_template, url_for, jsonify, request
import config
import secrets

app = Flask(__name__)
session = flask_scoped_session(new_session, app)

@app.route("/")
def home():
	return "Hello World!"

@app.route("/favicon.ico")
def favicon():
	# TODO: Add some kind of icon here
	return ""

@app.route("/api/search_characters", methods=["GET"])
def search_characters():
	if "id" in request.args:
		# Query for one specific Character
		char = session.query(Node).filter(Node.id == request.args["id"]).first()
		return jsonify(name=char.name, id=char.id)
	else:
		# Perform a normal Select2 Search using pagination
		query = request.args["query"]
		
		num_characters = session.query(Node).filter(Node.name.like(f"%{query}%")).count()
		min_index = int(request.args["page"]) * config.SELECT2_PAGESIZE
		max_index = min(min_index + config.SELECT2_PAGESIZE, num_characters)

		characters = session.query(Node).filter(Node.name.like(f"%{query}%")).all()[min_index:max_index]
		results = [{"id":char.id, "text":char.name} for char in characters]

		return jsonify(results=results, pagination={"more":max_index < num_characters})

@app.route("/api/search_cycles", methods=["GET"])
def search_cycles():
	query = request.args["query"]

	num_cycles = session.query(Zyklus).filter(Zyklus.name.like(f"%{query}%")).count()
	min_index = int(request.args["page"]) * config.SELECT2_PAGESIZE
	max_index = min(min_index + config.SELECT2_PAGESIZE, num_cycles)

	cycles = session.query(Zyklus).filter(Zyklus.name.like(f"%{query}%")).all()[min_index:max_index]
	results = [{"id":c.id, "text":c.name} for c in cycles]
	return jsonify(results=results, pagination={"more":max_index < num_cycles})

@app.route("/visualization")
def visualization():
	return render_template("visualize.html")

@app.route("/statistics", methods=["GET", "POST"])
def statistics():
	return render_template("stats.html")

@app.route("/api/getCycles", methods=["GET"])
def getCycles():
	"""
	Returns a list with all Cycle names
	"""
	return jsonify(titles=[c.name for c in session.query(Zyklus).all()])

@app.route("/api/getCytoscapeGraph", methods=["GET"])
def getCytoscapeGraph():
	cycle = request.args["cycle"]

	data = download.analyse.analyse_cycles(int(cycle))
	for element in data["elements"]["edges"]:
		element["data"]["id"] = secrets.token_urlsafe(32)
	return jsonify(data=data)

@app.route("/api/EVC_Analysis", methods=["GET"])
def evc_analysis():
	"""
	Performs an Eigenvectorcentrality Analysis of the Character on every cycle.
	Expects the Characters ID as parameter "ID".
	"""
	data = download.analyse.eigenvector_centrality(request.args["ID"])
	return jsonify(data=data)

if __name__ == "__main__":
	app.run(debug=True)

