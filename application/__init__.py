from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_caching import Cache
from flask_assets import Environment, Bundle


application = app = Flask(__name__)

app.config.from_object("config")

db = SQLAlchemy(app)
cache = Cache(app)
assets = Environment(app)

@app.errorhandler(404)
def not_found(error):
	return render_template("404.html"), 404

@app.errorhandler(500)
def internal_server_error(error):
	return render_template("500.html"), 500

# minify static files
visualize_bundle_js = Bundle("js/visualize.js", "js/color_generator.js", "js/pretty_select.js", output="build/js/visualize.js", filters="jsmin")
statistics_bundle_js = Bundle("js/statistics.js", output="build/js/statistics.js", filters="jsmin")
cycles_bundle_js = Bundle("js/cycles.js", "js/color_generator.js", output="build/js/cycles.js", filters="jsmin")


assets.register("visualize.js", visualize_bundle_js)
assets.register("statistics.js", statistics_bundle_js)
assets.register("cycles.js", cycles_bundle_js)

visualize_bundle_css = Bundle("css/visualize.css", "css/pretty_checkbox.css", "css/pretty_select.css", output="build/css/visualize.css", filters="cssmin")
statistics_bundle_css = Bundle("css/statistics.css", output="build/css/statistics.css", filters="cssmin")
cycles_bundle_css = Bundle("css/cycles.css", output="build/css/cycles.css", filters="cssmin")

assets.register("visualize.css", visualize_bundle_css)
assets.register("statistics.css", statistics_bundle_css)
assets.register("cycles.css", cycles_bundle_css)
	
# Import Modules
from application.api.views import api
from application.frontend.views import frontend

# Register blueprints
app.register_blueprint(api)
app.register_blueprint(frontend)

db.create_all()