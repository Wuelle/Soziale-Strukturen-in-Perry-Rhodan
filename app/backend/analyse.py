from app.backend.models import Node, Link, Relation, Zyklus
from sqlalchemy import desc, func, distinct, or_
import matplotlib.pyplot as plt
import networkx as nx
from app import db
import community
import random
import json

def build_graph_from_cycle(cycle):
	characters = db.session.query(Node).join(Relation, or_(Node.id==Relation.node_1, Node.id==Relation.node_2)).filter(Relation.cycle == cycle)
	relations = db.session.query(Relation, func.sum(Relation.weight)).filter(Relation.cycle == cycle).group_by(Relation.node_1, Relation.node_2).order_by(func.sum(Relation.weight).desc())
	
	G = nx.Graph()
	G.add_nodes_from([(c.id, {"name":c.name}) for c in set(characters)])
	G.add_weighted_edges_from([(r[0].node_1, r[0].node_2, r[1]) for r in relations])

	return G

def eigenvector_centrality(id):
	"""
	Given the id of a certain character, returns the overall eigenvector_centrality (ec)
	as well as an Array containing the ec for every single cycle that character appeared in
	"""
	# Get all the Cycles
	cycles = db.session.query(Zyklus).all()

	centralities = []

	for cycle in cycles:
		relations = db.session.query(Relation).filter(Relation.cycle == cycle.id).all()
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

	communities = community.best_partition(G)

	return communities
