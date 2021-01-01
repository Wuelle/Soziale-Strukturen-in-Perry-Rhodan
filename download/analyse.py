import networkx as nx
import networkx.algorithms.community as nxcom
from download.Database import Node, Relation, Link, Zyklus, new_session
from sqlalchemy import desc
import matplotlib.pyplot as plt
import json
import random

def eigenvector_centrality(id):
	"""
	Given the id of a certain character, returns the overall eigenvector_centrality (ec)
	as well as an Array containing the ec for every single cycle that character appeared in
	"""
	session = new_session()

	# Get all the Cycles
	cycles = session.query(Zyklus).all()

	centralities = []

	for cycle in cycles:
		relations = session.query(Relation).filter(Relation.cycle == cycle.id).all()
		# The Database also contains the newest cycle, which doesnt contain characters yet
		if len(relations) != 0:
			edges = [(r.node_1, r.node_2, {"weight":r.weight}) for r in relations]


			G = nx.Graph()
			G.add_edges_from(edges)
			ec = nx.eigenvector_centrality(G, max_iter=200, weight="weight")

			if id in ec:
				centralities.append(ec[id])
			else:
				centralities.append(0)
		else:
			centralities.append(0)

	return centralities

# print(eigenvector_centrality("EJ-OFZ2G2I6plm7cYkxkey7oXBTcbef9WjV7RzJfFH4"))


# # Save the data in json format for use in cytoscape.js
# with open("data/cytoscape_graph.json", "w") as outfile:
# 	json.dump(nx.readwrite.json_graph.cytoscape_data(G), outfile)
