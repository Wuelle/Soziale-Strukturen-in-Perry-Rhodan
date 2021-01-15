from flask import Blueprint, render_template

# Define the blueprint
frontend = Blueprint('frontend', __name__, url_prefix='')

@frontend.route("/visualization")
def visualization():
	return render_template("visualize.html")

@frontend.route("/statistics", methods=["GET"])
def statistics():
	return render_template("statistics.html")

@frontend.route("/cycles", methods=["GET"])
def cycles():
	return render_template("cycles.html")
	
@frontend.route("/")
def home():
	return "Hello World!"

@frontend.route("/favicon.ico")
def favicon():
	# TODO: Add some kind of icon here
	return ""

