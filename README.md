## TODO:
* Maybe dont quote around Link.link, not really necessary
* rename Link.link to Link.url
* speed up getMainCharacters by breaking out of for loop if characters are found

## Useful SQL Queries:
* SELECT nodes_1.name, nodes_2.name, relations.weight FROM 'relations', "nodes" as nodes_1, "nodes" as nodes_2 where relations.node_1=nodes_1.id and relations.node_2=nodes_2.id order by nodes_1.name 
