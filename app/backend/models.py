from app import db

# Define Core PR Objects
class Node(db.Model):
	__tablename__ = 'nodes'

	id = db.Column(db.String, primary_key=True)
	name = db.Column(db.String)
	species = db.Column(db.String)
	thumbnail = db.Column(db.String)

class Link(db.Model):
	__tablename__ = "links"

	id = db.Column(db.Integer, primary_key=True)
	character_id = db.Column(db.String, db.ForeignKey("nodes.id"))
	link = db.Column(db.String)

class Zyklus(db.Model):
	__tablename__ = "cycle"

	id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String)
	num_books = db.Column(db.Integer)
	connectedness = db.Column(db.Float)

# This stuff is calculated by NetworkX - stored to save time

# /visualize
class Relation(db.Model):
	"""
	Describes the relation between two characters during a cycle
	using the weight attribute.
	"""
	__tablename__ = "relations"

	id = db.Column(db.Integer, primary_key=True)
	node_1 = db.Column(db.String, db.ForeignKey("nodes.id"))
	node_2 = db.Column(db.String, db.ForeignKey("nodes.id"))
	weight = db.Column(db.Integer)
	cycle = db.Column(db.Integer, db.ForeignKey("cycle.id"))

class Information(db.Model):
	"""
	Stores cycle-specific info about a character, namely
		- their eigenvector-centrality for that cycle
		- their community id
	"""
	__tablename__ = "information"

	id = db.Column(db.Integer, primary_key=True)
	node = db.Column(db.String, db.ForeignKey("nodes.id"))
	value = db.Column(db.Float)
	community = db.Column(db.Integer) 
	cycle = db.Column(db.Integer, db.ForeignKey("cycle.id"))
	appearances = db.Column(db.Integer)

class Community(db.Model):
	"""
	A community of one or more Nodes within a cycle
	"""
	__tablename__ = "communities"

	id = db.Column(db.Integer, primary_key=True)
	cycle = db.Column(db.Integer, db.ForeignKey("cycle.id"))
