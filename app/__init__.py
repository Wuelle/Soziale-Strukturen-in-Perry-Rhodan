from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_caching import Cache

application = app = Flask(__name__)

app.config.from_object("config")

db = SQLAlchemy(app)
cache = Cache(app)

@app.errorhandler(404)
def not_found(error):
	return render_template("404.html"), 404

@app.errorhandler(500)
def internal_server_error(error):
	return render_template("500.html"), 500
    
# Import Modules
from app.api.views import api
from app.frontend.views import frontend

# Register blueprints
app.register_blueprint(api)
app.register_blueprint(frontend)

db.create_all()