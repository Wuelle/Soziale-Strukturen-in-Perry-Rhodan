# Soziale Strukturen im Perryversum
Dieses Repository enthält eine soziale Netzwerksanalyse der Charaktere nach Daten des ![Perrypedias](https://www.perrypedia.de)
Derzeit experimentiere ich noch herum aber das Endziel ist es, einen Interaktiven Netzwerksgraphen auf ![meiner Website](https://wuelle.github.io/Soziale-Strukturen-in-Perry-Rhodan/) zu haben.
Dieses Repository ist öffentlich damit ich die Seite mithilfe von Github hosten kann, ist aber noch nicht fertig.

## Disclaimer
Aus offensichtlichen Gründen enthält dieses Repository Spoiler für die gesamte Perry-Rhodan Heftserie. Der Inhalt von
Nebenserien wie zb. Perry-Rhodan-Neo oder den Blaubänden wird nicht behandelt und die Charaktere sind nicht in der Analyse enthalten.

## TODO:
* Maybe dont quote around Link.link, not really necessary
* rename Link.link to Link.url
* speed up getMainCharacters by breaking out of for loop if characters are found

## Useful SQL Queries:
* SELECT nodes_1.name, nodes_2.name, relations.weight FROM 'relations', "nodes" as nodes_1, "nodes" as nodes_2 where relations.node_1=nodes_1.id and relations.node_2=nodes_2.id order by nodes_1.name

## Important Links
![https://js.cytoscape.org/#style/mappers](https://js.cytoscape.org/#style/mappers) 
http://www.aymerick.com/2014/07/22/jekyll-github-pages-bower-bootstrap.html

## Copyright
Ich habe dieses Projekt mit guten Intentionen aber ohne Anwalt gestartet. Sämtliche benutzten Daten stammen
vom ![Perrypedia](https://www.perrypedia.de) das eine Weiterverbreitung der enthaltenen Informationen
unter der ![GNU freie Dokumentationslizenz](https://www.perrypedia.de/wiki/Perrypedia:FDL) ausdrücklich gestattet(siehe ![Hilfe:Urheberrecht](https://www.perrypedia.de/wiki/Hilfe:Urheberrecht)) Sollten dennoch Urheberrechtsverletzungen 
auftreten können sie mich jederzeit unter ```simon.wuelker@arcor.de``` anschreiben und ich werde die betroffenen Sektionen sofort 
entfernen.