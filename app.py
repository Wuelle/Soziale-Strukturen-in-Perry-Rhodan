from download.Database import Node, Relation, Link, Zyklus, new_session
import download.analyse
from flask_sqlalchemy_session import flask_scoped_session
from flask import Flask, render_template, url_for, jsonify, request
import config
from math import ceil

app = Flask(__name__)
session = flask_scoped_session(new_session, app)

@app.route("/")
def home():
	return "Hello World!"

@app.route("/search_characters", methods=["GET"])
def search():
	pages = []
	query = request.args["query"]
	
	num_characters = session.query(Node).filter(Node.name.like(f"%{query}%")).count()
	min_index = int(request.args["page"]) * config.SELECT2_PAGESIZE
	max_index = min(min_index + config.SELECT2_PAGESIZE, num_characters)

	characters = session.query(Node).filter(Node.name.like(f"%{query}%")).all()[min_index:max_index]
	results = [{"id":char.id, "text":char.name} for char in characters]

	return jsonify(results=results, pagination={"more":num_characters > config.SELECT2_PAGESIZE})

@app.route("/visualization")
def visualization():
	return render_template("visualize.html")

@app.route("/statistics", methods=["GET", "POST"])
def statistics():
	cycles = [cycle.name for cycle in session.query(Zyklus).all()]

	return render_template("stats.html", labels=cycles, data=download.analyse.eigenvector_centrality("EJ-OFZ2G2I6plm7cYkxkey7oXBTcbef9WjV7RzJfFH4"))

if __name__ == "__main__":
	app.run(debug=True)

