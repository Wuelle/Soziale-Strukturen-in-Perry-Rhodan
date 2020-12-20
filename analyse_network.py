import networkx as nx
import networkx.algorithms.community as nxcom
from Database import Node, Relation, Link, new_session
from sqlalchemy import desc
import matplotlib.pyplot as plt
import json
import random

session = new_session()

# Construct Network Graph
G = nx.Graph()


# Add Nodes
relations = session.query(Relation).order_by(desc(Relation.weight)).limit(50).all()
nodes = session.query(Node).filter(Node.id.in_([r.node_1 for r in relations] + [r.node_2 for r in relations])).distinct()
for node in nodes:
	G.add_node(node.id,
		name=node.name, 
		species=node.species,
		description=node.description,
		source=node.source, 
		artificial=node.artificial, 
		appearance=node.appearance
		)

# Add Edges
for edge in relations:
	G.add_edge(edge.node_1, edge.node_2, weight=edge.weight)

# Detect Clusters
# communities = sorted(nxcom.greedy_modularity_communities(G), key=len, reverse=True)

# Add some more node attributes
nx.set_node_attributes(G, nx.eigenvector_centrality(G), "importance")

# Save the data in json format for use in cytoscape.js
with open("data/cytoscape_graph.json", "w") as outfile:
	json.dump(nx.readwrite.json_graph.cytoscape_data(G), outfile)
