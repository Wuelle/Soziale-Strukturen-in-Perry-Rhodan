SELECT2_PAGESIZE = 10 # Number of elements to be displayed as one page
DEBUG = True
SQLALCHEMY_DATABASE_URI = 'sqlite:///social_interactions.db'
SQLALCHEMY_TRACK_MODIFICATIONS = False
THREADS_PER_PAGE = 2

# Enable protection agains *Cross-site Request Forgery (CSRF)*
CSRF_ENABLED = True

# Use a secure, unique and absolutely secret key for
# signing the data. 
CSRF_SESSION_KEY = "secret"

# Secret key for signing cookies
SECRET_KEY = "secret"

# flask-caching
CACHE_TYPE = "simple"
CACHE_DEFAULT_TIMEOUT = 300

# flask-assets
ASSETS_DEBUG = False