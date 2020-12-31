from download.Database import Node, Relation, Link, Zyklus, new_session
from flask_sqlalchemy_session import flask_scoped_session
from flask import Flask, render_template

app = Flask(__name__)
session = flask_scoped_session(new_session, app)

@app.route("/")
def home():
	return "Hello World!"

@app.route("/visualization")
def visualization():
	return render_template("visualize.html")

@app.route("/statistics")
def statistics():
	return render_template("stats.html")

if __name__ == "__main__":
	app.run(debug=True)

