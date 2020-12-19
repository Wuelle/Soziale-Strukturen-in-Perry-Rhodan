import networkx as nx
from Database import Node, Relation, Link, new_session
from sqlalchemy import desc
import matplotlib.pyplot as plt
import IPython
import py4cytoscape as p4c
import json

# print(f'Loading Javascript client ... {p4c.get_browser_client_channel()} on {p4c.get_jupyter_bridge_url()}')
# browser_client_js = p4c.get_browser_client_js()
# IPython.display.Javascript(browser_client_js) # Start browser client

# # Open Cytoscape session
# p4c.sandbox_send_to("BasicDataVizDemo.cys")
# p4c.open_session(file_location="BasicDataVizDemo.cys")

# p4c.export_image(filename="BasicDataVizDemo.png")
# p4c.sandbox_get_from("BasicDataVizDemo.png")
# from IPython.display import Image
# Image('BasicDataVizDemo.png')
# assert False

session = new_session()

# Construct Network Graph
G = nx.Graph()

# Add Nodes
relations = session.query(Relation).order_by(desc(Relation.weight)).limit(50).all()
nodes = session.query(Node).filter(Node.id.in_(set([r.node_1 for r in relations] + [r.node_2 for r in relations])))
for node in nodes:
	print(node.name)
	G.add_node(node.id,
		name=node.name, 
		species=node.species,
		description=node.description,
		source=node.source, 
		artificial=node.artificial, 
		appearance=node.appearance)

# Add Edges
for edge in relations:
	G.add_edge(edge.node_1, edge.node_2, weight=edge.weight)

# Save the data in json format for use in cytoscape.js
with open("cytoscape_graph.json", "w") as outfile:
	json.dump(nx.readwrite.json_graph.cytoscape_data(G), outfile)
