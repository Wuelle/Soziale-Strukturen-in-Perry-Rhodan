![Flake8](https://github.com/Wuelle/Soziale-Strukturen-in-Perry-Rhodan/workflows/Python%20Linting%20with%20flake8/badge.svg?branch=main)
![CodeQL](https://github.com/Wuelle/Soziale-Strukturen-in-Perry-Rhodan/workflows/CodeQL/badge.svg)

# Soziale Strukturen im Perryversum
Dieses Repository enthält eine soziale Netzwerksanalyse der Charaktere nach Daten des ![Perrypedias](https://www.perrypedia.de)
Derzeit experimentiere ich noch herum aber das Endziel ist es, einen Interaktiven Netzwerksgraphen auf ![meiner Website](https://wuelle.github.io/Soziale-Strukturen-in-Perry-Rhodan/) zu haben.
Dieses Repository ist öffentlich damit ich die Seite mithilfe von Github hosten kann, ist aber noch nicht fertig.

## Disclaimer
Aus offensichtlichen Gründen enthält dieses Repository Spoiler für die gesamte Perry-Rhodan Heftserie. Der Inhalt von
Nebenserien wie zb. Perry-Rhodan-Neo oder den Blaubänden wird nicht behandelt und die Charaktere sind nicht in der Analyse enthalten.

## Copyright
Ich habe dieses Projekt mit guten Intentionen aber ohne Anwalt gestartet. Sämtliche benutzten Daten stammen
vom ![Perrypedia](https://www.perrypedia.de) das eine Weiterverbreitung der enthaltenen Informationen
unter der ![GNU freie Dokumentationslizenz](https://www.perrypedia.de/wiki/Perrypedia:FDL) ausdrücklich gestattet(siehe ![Hilfe:Urheberrecht](https://www.perrypedia.de/wiki/Hilfe:Urheberrecht)) Sollten dennoch Urheberrechtsverletzungen 
auftreten können sie mich jederzeit unter ```simon.wuelker@arcor.de``` anschreiben und ich werde die betroffenen Sektionen sofort 
entfernen.

## Notes
`qa is not a function`
SELECT nodes.name, sum(relations.weight), relations.node_1, relations.node_2 FROM nodes, relations where nodes.id=relations.node_1 or nodes.id=relations.node_2 group by relations.node_1 order by sum(relations.weight) desc LIMIT 0,30
sql.js

darkmode inloop viewer!

https://github.com/nagix/chartjs-plugin-colorschemes colorwheel