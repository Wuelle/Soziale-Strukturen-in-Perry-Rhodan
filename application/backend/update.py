"""
This module defines functions used to analyze the networks and calculate the values sent to the Client.
Should be called once a week to handle new books.
Can only handle the values needed for /visualize for now.
"""
from application.backend.models import Node, Link, Relation, Zyklus, Information, Community
from application.backend.download import getMainCharacters, getThumbnailLinks
from sqlalchemy import desc, func, distinct, or_
import community as cm
import networkx as nx
from application import db
import requests
import random
import json

# config variables
api_endpoint = "https://www.perrypedia.de/mediawiki/api.php"

def build_graph_from_cycle(cycle):
	characters = db.session.query(Node).join(Relation, or_(Node.id==Relation.node_1, Node.id==Relation.node_2)).filter(Relation.cycle == cycle)
	relations = db.session.query(Relation, func.sum(Relation.weight)).filter(Relation.cycle == cycle).group_by(Relation.node_1, Relation.node_2)
	
	G = nx.Graph()
	G.add_nodes_from([(c.id, {"name":c.name}) for c in set(characters)])
	G.add_weighted_edges_from([(r[0].node_1, r[0].node_2, r[1]) for r in relations])

	return G, characters, relations

def eigenvector_centrality(id):
	"""
	Given the id of a certain character, returns the overall eigenvector_centrality (ec)
	as well as an Array containing the ec for every single cycle that character appeared in
	"""
	# Get all the Cycles
	cycles = db.session.query(Zyklus).all()

	centralities = []

	for cycle in cycles:
		if db.session.query(Relation).filter(Relation.cycle == cycle.id, Relation.node_1 == id or Relation.node_2 == id).first():
			relations = db.session.query(Relation).filter(Relation.cycle == cycle.id).all()
			# The Database also contains the newest cycle, which doesnt contain characters yet
			if len(relations) != 0:
				edges = [(r.node_1, r.node_2, {"weight":r.weight}) for r in relations]

				G = nx.Graph()
				G.add_edges_from(edges)
				ec = nx.eigenvector_centrality(G, max_iter=200, weight="weight")

				centralities.append(ec[id])
			else:
				centralities.append(0)
		else:
			centralities.append(0)

	return centralities

def closeness(id_1, id_2):
	cycles = db.session.query(Zyklus).all()

	values = []
	for cycle in cycles:
		G = build_graph_from_cycle(cycle.id)
		try:
			values.append(nx.shortest_path_length(G, source=id_1, target=id_2))
		except nx.exception.NodeNotFound:
			values.append(None)
		except nx.exception.NetworkXNoPath:
			values.append(None)
	return values

def analyse_cycles(cycle):
	G = build_graph_from_cycle(cycle)
	nx.set_node_attributes(G, nx.eigenvector_centrality(G), "importance")
	return nx.readwrite.json_graph.cytoscape_data(G)

def cluster(cycle):
	"""
	Calculates a fitting number of Clusters in a cycle.

	Parameters:
		cycle (int): The Cycle ID (starts at 0)
	Returns:
		communities (dict): A dictionary of type {character_id: community_id, ...}
	"""
	G = build_graph_from_cycle(cycle)

	communities = cm.best_partition(G)

	return communities

def recalc_NetworkX():
	"""
	Deletes and recalculates the rows of all tables containing cached NetworkX results.
	Everything else has to be downloaded prior to calling this function!
	"""
	# Delete previous data
	db.session.query(Information).delete()
	db.session.query(Community).delete()

	# Recalculate
	cycles = db.session.query(Zyklus)
	count = 0  # TODO: figure out why this variable has to exist
	for cycle in cycles:
		print(cycle.name)
		G, characters, relations = build_graph_from_cycle(cycle.id)
		if len(G) != 0:
			comm_mapping = cm.best_partition(G)
			communities = set(comm_mapping.values())
			eigenvector_centrality = nx.eigenvector_centrality(G, max_iter=200, weight="weight")
			cycle.connectedness = round(nx.average_clustering(G, weight="weight"), 3)

			local_id_to_global_id = {}
			for index, comm_id in enumerate(communities):
				comm_sql = Community(id=count, cycle=cycle.id)
				db.session.add(comm_sql)
				count += 1

				local_id_to_global_id[comm_id] = comm_sql.id

			# Add an Information object for every character in the cycle
			for character in characters:
				db.session.add(Information(
					node=character.id,
					value=eigenvector_centrality[character.id],
					community=local_id_to_global_id[comm_mapping[character.id]],
					cycle=cycle.id
				))

			# save progress
			db.session.commit()

def addBook(index, cycle):
	"""
	Updates the database with information about a certain book. 
	(Update num_appearances, eigenvector values etc..)
	Parameters:
		index(int): The index of the book (eg. 3100), required
	"""
	print(index)
	ids = getMainCharacters(index)
	result = db.session.query(Node, Information).filter(Node.id==Information.node, Node.id.in_(ids), Information.cycle==cycle)

	# Update number of appearances
	for char, info in result:
		info.appearances += 1
		
	db.session.commit()

# recalc_NetworkX()
# getThumbnailLinks()

for info in db.session.query(Information):
	info.appearances = 0
db.session.commit()

# get the number of appearances for every character
cycles = db.session.query(Zyklus).order_by(Zyklus.id).all()
index = 0
for cycle in cycles:
	for _ in range(cycle.num_books):
		index += 1
		addBook(index, cycle.id)




# Cycles: use start_ix and end_ix instead of num_books