from flask import Blueprint, render_template, redirect, url_for

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

@frontend.route("/contact", methods=["GET"])
def contact():
	return render_template("contact.html")

@frontend.route("/info", methods=["GET"])
def info():
	return render_template("info.html")

@frontend.route("/")
def home():
	return redirect(url_for("frontend.info"))

@frontend.route("/favicon.ico")
def favicon():
	# TODO: Add some kind of icon here
	return ""

