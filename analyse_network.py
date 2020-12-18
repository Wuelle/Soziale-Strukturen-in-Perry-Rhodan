import networkx as nx
from Database import Node, Relation, Link, new_session
import matplotlib.pyplot as plt

session = new_session()

# Construct Network Graph
G_weighted = nx.Graph()

# Add Edges
for edge in session.query(Relation).filter(Relation.weight > 40).all():
	node_1 = session.query(Node).filter(Node.id==edge.node_1).first()
	node_2 = session.query(Node).filter(Node.id==edge.node_2).first()

	G_weighted.add_edge(node_1.name,  node_2.name, weight=edge.weight)

eigenvector_centrality = nx.eigenvector_centrality(G_weighted)
print(max(eigenvector_centrality, key=eigenvector_centrality.get))

# Style edges based on their weight
elarge = [(u, v) for (u, v, d) in G_weighted.edges(data=True) if d['weight'] > 60]
esmall = [(u, v) for (u, v, d) in G_weighted.edges(data=True) if d['weight'] <= 60]

# Display the Graph
pos = nx.kamada_kawai_layout(G_weighted)  
nx.draw_networkx_nodes(G_weighted, pos)
nx.draw_networkx_edges(G_weighted, pos, edgelist=elarge, width=3)
nx.draw_networkx_edges(G_weighted, pos, edgelist=esmall, width=2, style='dashed')
nx.draw_networkx_labels(G_weighted, pos, font_size=10, font_family='sans-serif')

plt.axis("off")
plt.show()

# Save stuff
plt.savefig("graph.png")
nx.write_graphml(G_weighted, "graph.gml") 