from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

app.config.from_object("config")

db = SQLAlchemy(app)

# Sample HTTP error handling
@app.errorhandler(404)
def not_found(error):
    return render_template("404.html"), 404
    
# Import Modules
from app.api.views import api
from app.frontend.views import frontend

# Register blueprints
app.register_blueprint(api)
app.register_blueprint(frontend)

db.create_all()