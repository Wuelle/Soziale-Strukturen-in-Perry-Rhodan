from flask import Blueprint, request, render_template, flash, g, session, redirect, url_for

# Define the blueprint
frontend = Blueprint('frontend', __name__, url_prefix='')

@frontend.route("/visualization")
def visualization():
	return render_template("visualize.html")

@frontend.route("/statistics", methods=["GET"])
def statistics():
	return render_template("statistics.html")

@frontend.route("/")
def home():
	return "Hello World!"

@frontend.route("/favicon.ico")
def favicon():
	# TODO: Add some kind of icon here
	return ""

