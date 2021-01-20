from flask import current_app, request

def unless():
	"""
	Used by flask-caching extension. Determines whether or not the cached result should be used
	"""
	return current_app.config["DEBUG"]

def make_cache_key(*args, **kwargs):
	"""
	Used to determine the cache key for flask-caching (Is this response the same as another previous one?)
	based on the url and the arguments provided in request.args
	"""
	path = request.path
	args = str(hash(frozenset(request.args.items())))
	return (path + args).encode('utf-8')