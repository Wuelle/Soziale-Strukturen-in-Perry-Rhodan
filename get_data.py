from Database import Node, Relation, Link, Zyklus, new_session
from sqlalchemy.sql.expression import exists
from urllib.parse import quote, unquote
from sqlalchemy import select
import wikitextparser as wtp
import numpy as np
import requests
import secrets
import re

# config variables
api_endpoint = "https://www.perrypedia.de/mediawiki/api.php"
html_filter = re.compile(r'<[^>]+>')
wikilink_filter = re.compile(r"\[\[[^\|]*\|(?P<link>[^\]]*)\]\]")

def wikilink_to_text(s):
	"""
	Expects a string containing one or more wikilinks(e.g. "[[URL|TEXT]]") and turns that string into a plain
	text representation. Dont bother trying to understand the RegEx behind wikilink_filter
	"""
	return wikilink_filter.sub(r"\g<link>", s)

def get_alternative_links(title):
	"""
	Wikimedia allows multiple urls to point to the same article. This function gets all alternative urls for an article.
	The one provided does not have to be the main one
	"""

	response = requests.get(api_endpoint, params={
		"action": "query",
		"prop": "redirects",
		"titles": title,
		"redirects": True,
		"format": "json"
	}).json()
	page = list(response["query"]["pages"].values())[0]

	if "redirects" in page:
		alt_titles = [redirect["title"] for redirect in page["redirects"]]
	else:
		alt_titles = []	

	return page["title"], alt_titles

def redirectsToFragment(title):
	"""
	Returns a Boolean that indicates whether or not a link redirects to a subsection of a page, eg. #history
	"""
	response = requests.get(api_endpoint, params={
		"action":"query",
		"prop":"info",
		"inprop":"url",
		"titles":title,
		"format":"json",
		"redirects":True
	}).json()
	if "redirects" in response["query"]:
		if "tofragment" in response["query"]["redirects"][-1]:
			print("from", response["query"]["redirects"][-1]["from"], "-->", response["query"]["redirects"][-1]["to"], "is fragment link")
			return True
	return False

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
		response = requests.get(api_endpoint, params=params).json()
		links = response["query"]["pages"]
		for k, v in links.items():
			for l in v["links"]:
				if filter(l["title"]):
					items.append(l["title"])

		if "continue" in response:
			params["plcontinue"] = response["continue"]["plcontinue"]
		else:
			return items

def getCharacters(title, fields):
	"""
	Extracts all the Characters with some extra info from a pages title.
	The parameter 'fields' is used to describe the table columns on the page
	"""

	response = requests.get(api_endpoint, params={
		"action": "parse",
		"page": title,
		"prop": "wikitext",
		"format": "json"
	}).json()["parse"]["wikitext"]["*"]
	tables = wtp.parse(response).tables

	for table in tables:
		for row in table.data()[1:]:
			if fields["species"][0]:
				index = fields["species"][1]
				species = wikilink_to_text(row[index])
			else:
				species = fields["species"][1]

			character = Node(
				id=secrets.token_urlsafe(32),
				name=row[fields["name"][1]] if fields["name"][0] else fields["name"][1],
				species=species
			)

			if re.match(r"\[\[(.*)\]\]", row[0]):
				# Some Characters have multiple links in their name field, eg. '[[Akkarr-Ezibree]] / [[Akkarr-Hall]]'
				wikilinks = wtp.parse(row[0]).wikilinks
				for link in wikilinks:
					if redirectsToFragment(link.title):
						# Check for duplicate characters
						if not session.query(Link).filter(Link.link == link.title).first():
							main_title, alt_titles = get_alternative_links(link.title)
							session.add(Link(character_id=character.id, link=main_title))
							for alt_title in alt_titles:
								session.add(Link(character_id=character.id, link=alt_title))
							character.name = main_title

			session.add(character)
	session.commit()

def getMainCharacters(book_index):
	"""
	Gets a list of the main characters from a given link to a PR Edition.
	Characters are identified by their page title
	"""
	response = requests.get(api_endpoint, params={
		"action": "parse",
		"page": f"Quelle:PR{book_index}",
		"prop": "wikitext",
		"redirects":"true",
		"format": "json"
	}).json()["parse"]["wikitext"]["*"]
	t = wtp.parse(response).templates[0]
	links = wtp.parse(t.get_arg("Hauptpersonen").value).wikilinks

	characters = []
	for link in links:
		title = link.title.replace("&nbsp;", " ")
		# If a character with that link exists in the database
		if row := session.query(Link).filter(Link.link == title).first():
			characters.append(row.character_id)
		else:
			print(link.text, "does not exist in the database, (", url, ")")
	return characters

def adjustRelations(characters, cycle_id):
	"""
	Expects a list of main character ids from one PR Book and adds the
	Relations for everyone.
	"""
	for index, character_1 in enumerate(characters):
		for character_2 in characters[index+1:]:
			# sort the characters
			node_1, node_2 = sorted([character_1, character_2])
			if row := session.query(Relation).filter(Relation.node_1 == node_1, Relation.node_2 == node_2, Relation.cycle == cycle_id).first():
				row.weight += 1
			else:
				session.add(Relation(node_1=node_1, node_2=node_2, weight=1, cycle=cycle_id))
	session.commit()

def getSections(title):
	"""
	Prints a graphical overview of the sections of a given page. Should only be used to determine
	the index parameter for other requests
	"""
	sections = requests.get(api_endpoint, params={
		"action": "parse",
		"prop": "sections",
		"page": title,
		"redirects": "true",
		"format": "json"
	}).json()["parse"]["sections"]

	for section in sections:
		print("	" * (int(section["toclevel"]) - 1) + section["number"] + ": '" + section["line"] + "', index:"+section["index"])

def getZyklen():
	response = requests.get(api_endpoint, params={
		"action": "parse",
		"section": 2,
		"page": "Zyklen",
		"prop": "wikitext",
		"format": "json"
	}).json()["parse"]["wikitext"]["*"]
	t = wtp.Table(response)

	book_index = 1
	for row in t.data()[1:]:
		print(wtp.parse(row[1]).wikilinks[0].text)
		num_books = int(html_filter.sub("", row[6]))
		cycle = Zyklus(name=wtp.parse(row[1]).wikilinks[0].text, num_books=num_books)
		session.add(cycle)

		for book_index_relative in range(num_books):
			main_characters = getMainCharacters(book_index + book_index_relative)
			adjustRelations(main_characters, cycle.id)
			book_index += 1
		
	session.commit()

session = new_session()
pages = getLinksOnPage("Personen", plnamespace="0", filter=lambda x: re.match("^Personen [A-Z]$", x))
for page in pages:
	getCharacters(page, {
		"name": (True, 0),
		"species": (True, 1)
	})

getCharacters("Künstliche Individuen", {
	"name": (True, 0),
	"species": (False, "Kunstwesen")
})

getCharacters("Entitäten", {
	"name": (True, 0),
	"species": (False, "Entität")
})
session.commit()


# pr_books = getLinksOnPage("Perry Rhodan-Heftromane", plnamespace="100")
# progress = tqdm(total=len(pr_books))
# for book in pr_books:
# 	print(book)
# 	adjustRelations(getMainCharacters(f"https://www.perrypedia.de/wiki/{book}"))
# 	# progress.update(1)


# session.commit()
# getZyklen()
# getSections("Quelle:PR1008")
