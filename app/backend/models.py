from app import db

# Define a base model for other database tables to inherit
class Base(db.Model):
	__abstract__ = True

	id = db.Column(db.String, primary_key=True)
	date_created = db.Column(db.DateTime, default=db.func.current_timestamp())
	date_modified = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

class Node(db.Model):
	__tablename__ = 'nodes'

	id = db.Column(db.String, primary_key=True)
	name = db.Column(db.String)
	species = db.Column(db.String)

class Link(db.Model):
	__tablename__ = "links"

	id = db.Column(db.Integer, primary_key=True)
	character_id = db.Column(db.String)
	link = db.Column(db.String)


class Relation(db.Model):
	__tablename__ = "relations"

	id = db.Column(db.Integer, primary_key=True)
	node_1 = db.Column(db.String)
	node_2 = db.Column(db.String)
	weight = db.Column(db.Integer)
	cycle = db.Column(db.Integer)

class Zyklus(db.Model):
	__tablename__ = "cycle"

	id = db.Column(db.Integer, primary_key=True)
	name = db.Column(db.String)
	num_books = db.Column(db.Integer)
