from sqlalchemy import create_engine, Table, Column, Integer, String, MetaData, Boolean
from sqlalchemy_utils import database_exists, create_database
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class Node(Base):
	__tablename__ = 'nodes'

	id = Column(Integer, primary_key=True)
	name = Column(String)
	artificial = Column(Boolean)

class Relation(Base):
	__tablename__ = "relations"

	id = Column(Integer, primary_key=True)
	node_1 = Column(Integer)
	node_2 = Column(Integer)
	weight = Column(Integer)




engine = create_engine("sqlite:///social_interactions.db")
if not database_exists(engine.url):
	create_database(engine.url)

Base.metadata.create_all(engine)
 
# Bind the sessionmaker to engine
new_session = sessionmaker()
new_session.configure(bind=engine)

