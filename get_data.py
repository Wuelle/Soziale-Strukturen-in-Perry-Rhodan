import requests
from Database import Node, Relation, new_session
import pandas as pd
import requests
from bs4 import BeautifulSoup
from urllib.parse import quote
import re

def getLinksOnPage(titles, plnamespace="*", filter=lambda x:True):
	items = []
	characters = []
	params = {
		"action": "query",
		"prop": "links",
		"titles": titles,
		"plnamespace": plnamespace,
		"pllimit": 500,
		"format": "json"
	}

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

def getCharactersFromPagelist(items):
	for item in items:
		tables = pd.read_html("https://www.perrypedia.de/wiki/"+quote(item))
		for table in tables:
			characters += table["Name"].to_list()
		print(item, " done")
	return characters

def getMainCharacters(url):
	"""
	Gets a list of the main characters from a given link to a PR Edition
	"""
	
	response = requests.get(url)
	soup = BeautifulSoup(response.text, 'html.parser')
	tables = soup.find_all('table')

	characters = []
	for table in tables:
		for tr in table.findAll("tr"):
			trs = tr.findAll("td")
			if trs:
				if trs[0].text == "Hauptpersonen:":
					print("iside tre")
					for each in trs:
						links = each.find_all('a')
						for link in links:
							characters.append(link["href"])
					break
		else:
			continue
		break
	else:
		print("nothing found")
		raise RuntimeError
	return characters


def getRemoteTableColumn(url):
	pr_characters_artificial = []
	tables = pd.read_html(url)
	for table in tables:
		pr_characters_artificial += table["Name"].to_list()
	return pr_characters_artificial


# pages = getLinksOnPage("Personen", plnamespace="0", filter=lambda x: re.match("^Personen [A-Z]$", x))
# pr_characters_natural = getCharactersFromPagelist(pages)
# pr_characters_artificial = getRemoteTableColumn("https://www.perrypedia.de/wiki/K%C3%BCnstliche_Individuen")

# session = new_session()
# for character in pr_characters_artificial:
# 	session.add(Node(name=character, artificial=True))
# for character in pr_characters_natural:
# 	session.add(Node(name=character, artificial=False))
# session.commit()

pr_books = getLinksOnPage("Perry Rhodan-Heftromane", plnamespace="100")
# tables = pd.read_html("https://www.perrypedia.de/wiki/"+pr_books[0])
print(getMainCharacters("https://www.perrypedia.de/wiki/"+pr_books[0]))
