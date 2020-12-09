from sqlalchemy import create_engine, Table, Column, Integer, String, MetaData

engine = create_engine("sqlite://social_interactions.db", echo = True)
meta = MetaData()

# Contains general Objects that can be part of an interaction, eg. a Person or a Superintelligence
nodes = Table(
   "nodes", meta, 
   Column("id", Integer, primary_key=True), 
   Column("name", String), 
)

# Contains the data about a single interaction between two nodes
edges = Table(
	"edges", meta,
	Column("id", Integer, primary_key=True),
	Column("node_1", Integer),
	Column("node_2", Integer),
	Column("weight", Integer)
)

meta.create_all(engine)
conn = engine.connect()