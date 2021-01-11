![Python Linting with flake8](https://github.com/Wuelle/Soziale-Strukturen-in-Perry-Rhodan/workflows/Python%20Linting%20with%20flake8/badge.svg?branch=main)
![CodeQL](https://github.com/Wuelle/Soziale-Strukturen-in-Perry-Rhodan/workflows/CodeQL/badge.svg)

# Soziale Strukturen im Perryversum
Dieses Repository enthält eine soziale Netzwerksanalyse der Charaktere nach Daten des ![Perrypedias](https://www.perrypedia.de)
Derzeit experimentiere ich noch herum aber das Endziel ist es, einen Interaktiven Netzwerksgraphen auf ![meiner Website](https://wuelle.github.io/Soziale-Strukturen-in-Perry-Rhodan/) zu haben.
Dieses Repository ist öffentlich damit ich die Seite mithilfe von Github hosten kann, ist aber noch nicht fertig.

## Disclaimer
Aus offensichtlichen Gründen enthält dieses Repository Spoiler für die gesamte Perry-Rhodan Heftserie. Der Inhalt von
Nebenserien wie zb. Perry-Rhodan-Neo oder den Blaubänden wird nicht behandelt und die Charaktere sind nicht in der Analyse enthalten.

## TODO:
* Open issue in select2-bootstrap repo, if position is set to absolute the select2-container-bootstrap element overlaps appended buttons in input-group

## Useful SQL Queries:
* SELECT nodes_1.name, nodes_2.name, relations.weight FROM 'relations', "nodes" as nodes_1, "nodes" as nodes_2 where relations.node_1=nodes_1.id and relations.node_2=nodes_2.id order by nodes_1.name

* SELECT nodes_1.name, nodes_2.name, sum(relations.weight) FROM 'relations', "nodes" as nodes_1, "nodes" as nodes_2 where relations.node_1=nodes_1.id and relations.node_2=nodes_2.id group by nodes_1.name, nodes_2.name order by sum(relations.weight) desc limit 0, 30

* SELECT relations.node_1, relations.node_2, sum(relations.weight) FROM 'relations' group by relations.node_1, relations.node_2 order by sum(relations.weight) desc limit 0, 30

## Important Links
https://exploreflask.com/en/latest/views.html#caching

## Konzept Graphen
Eigenvektorzentralität einer Figuren während einem Zyklus und overall.

Zusammenarbeit zweier Figuren während der Hefte

## Copyright
Ich habe dieses Projekt mit guten Intentionen aber ohne Anwalt gestartet. Sämtliche benutzten Daten stammen
vom ![Perrypedia](https://www.perrypedia.de) das eine Weiterverbreitung der enthaltenen Informationen
unter der ![GNU freie Dokumentationslizenz](https://www.perrypedia.de/wiki/Perrypedia:FDL) ausdrücklich gestattet(siehe ![Hilfe:Urheberrecht](https://www.perrypedia.de/wiki/Hilfe:Urheberrecht)) Sollten dennoch Urheberrechtsverletzungen 
auftreten können sie mich jederzeit unter ```simon.wuelker@arcor.de``` anschreiben und ich werde die betroffenen Sektionen sofort 
entfernen.