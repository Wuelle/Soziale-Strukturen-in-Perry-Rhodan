![Flake8](https://github.com/Wuelle/Soziale-Strukturen-in-Perry-Rhodan/workflows/Python%20Linting%20with%20flake8/badge.svg?branch=main)
![CodeQL](https://github.com/Wuelle/Soziale-Strukturen-in-Perry-Rhodan/workflows/CodeQL/badge.svg)

# Soziale Strukturen im Perryversum
Dieses Repository enthält den Quellcode für eine soziale Netzwerkanalyse der Charaktere der Heftserie 'Perry Rhodan'.

## Disclaimer
Aus offensichtlichen Gründen enthält dieses Repository Spoiler für die gesamte Perry-Rhodan Serie. Der Inhalt von
Nebenserien wie zb. Perry-Rhodan-Neo oder den Blaubänden wird nicht behandelt und die Charaktere sind nicht in der Analyse enthalten.

## Copyright
Sämtliche benutzten Daten stammen
vom ![Perrypedia](https://www.perrypedia.de) das eine Weiterverbreitung der enthaltenen Informationen
unter der ![GNU freie Dokumentationslizenz](https://www.perrypedia.de/wiki/Perrypedia:FDL) ausdrücklich gestattet(siehe ![Hilfe:Urheberrecht](https://www.perrypedia.de/wiki/Hilfe:Urheberrecht)). Alles bis zum v1.1 Release im Februar 2021 wurde außerdem ausdrücklich vom
Verlag genehmigt.

## Notes
`qa is not a function`
SELECT nodes.name, sum(relations.weight), relations.node_1, relations.node_2 FROM nodes, relations where nodes.id=relations.node_1 or nodes.id=relations.node_2 group by relations.node_1 order by sum(relations.weight) desc LIMIT 0,30
sql.js

darkmode inloop viewer!

https://github.com/nagix/chartjs-plugin-colorschemes colorwheel