from sqlalchemy import create_engine, Table, Column, Integer, String, MetaData, Boolean
from sqlalchemy_utils import database_exists, create_database
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class Node(Base):
	__tablename__ = 'nodes'

	id = Column(String, primary_key=True)
	name = Column(String)
	description = Column(String)
	species = Column(String)
	source = Column(String)
	appearance = Column(String)
	constructed_by = Column(String)
	artificial = Column(Boolean)

class Link(Base):
	__tablename__ = "links"

	id = Column(Integer, primary_key=True)
	character_id = Column(String)
	link = Column(String)


class Relation(Base):
	__tablename__ = "relations"

	id = Column(Integer, primary_key=True)
	node_1 = Column(String)
	node_2 = Column(String)
	weight = Column(Integer)

engine = create_engine("sqlite:///data/social_interactions.db")
if not database_exists(engine.url):
	create_database(engine.url)

Base.metadata.create_all(engine)
 
# Bind the sessionmaker to engine
new_session = sessionmaker()
new_session.configure(bind=engine)

