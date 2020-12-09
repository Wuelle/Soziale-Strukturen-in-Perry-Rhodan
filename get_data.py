import requests
import re

def getLinksOnPage(titles, plnamespace="*", filter=lambda x:True):
	params = {
		"action": "query",
		"prop": "links",
		"titles": titles,
		"plnamespace": plnamespace,
		"pllimit": 500,
		"format": "json"
	}

	items = []
	while True:
		response = requests.get("https://www.perrypedia.de/mediawiki/api.php", params=params).json()
		links = response["query"]["pages"]
		for k, v in links.items():
		    for l in v["links"]:
		    	if filter(l["title"]):
		        	items.append(l["title"])

		if "continue" in response:
			params["plcontinue"] = response["continue"]["plcontinue"]
		else:
			return items
	


# re.match("^Personen [A-Z]$", "Personen A")

# pr_books = getLinksOnPage("Perry Rhodan-Heftromane", plnamespace="100")
# pr_characters_natural = getLinksOnPage("Personen", plnamespace="0", filter=lambda x: re.match("^Personen [A-Z]$", x))
# pr_characters_artificial = getLinksOnPage("Künstliche Individuen")


# print(pr_characters_artificial)
response = requests.get("https://www.perrypedia.de/mediawiki/api.php", params={
	"action":"parse",
	"prop":"sections",
	"page":"Künstliche Individuen",
	"format":"json"
}).json()["parse"]["sections"]
for element in response:
	print(element["line"], element["index"])
