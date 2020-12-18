import requests
from Database import Node, Relation, Link, new_session
from sqlalchemy import select
from sqlalchemy.sql.expression import exists
import requests
from bs4 import BeautifulSoup
from urllib.parse import quote, unquote
from tqdm import tqdm
import re
import numpy as np
import secrets

# config variables
api_endpoint = "https://www.perrypedia.de/mediawiki/api.php"

def link_to_title(link):
	return unquote(re.findall(r"(?:/wiki)/+(.*)", link)[-1])

def title_to_link(title):
	return "/wiki/" + title.replace(" ", "_")

def get_alternative_links(link):
	"""
	Wikimedia allows multiple urls to point to the same article. This function gets all alternative urls for an article.
	The one provided does not have to be the main one
	"""

	response = requests.get(api_endpoint, params={
		"action":"query",
		"prop":"redirects",
		"format":"json",
		"titles":link_to_title(link),
		"redirects":True
	}).json()
	page = list(response["query"]["pages"].values())[0]

	if "redirects" in page:
		alt_links = [title_to_link(redirect["title"]) for redirect in page["redirects"]]
	else:
		alt_links = []

	# Get the title of the 'main' page that all other urls redirect to
	response = requests.get(api_endpoint, params={
		"action":"query",
		"prop":"info",
		"format":"json",
		"pageids":page["pageid"],
		"inprop":"displaytitle"
	}).json()

	main_title = response["query"]["pages"][str(page["pageid"])]["displaytitle"]
	alt_links.append(title_to_link(main_title))

	return main_title, alt_links

def redirectsToFragment(link):
	"""
	Returns a Boolean that indicates whether or not a link redirects to a subsection of a page, eg. #history
	"""
	response = requests.get(api_endpoint, params={
		"action":"query",
		"prop":"info",
		"inprop":"url",
		"titles":link_to_title(link),
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

def getCharactersFromPagelist(items):
	"""
	Extracts all the Characters with some extra info from a list of links to the pages
	"""

	progress = tqdm(total=len(items))
	for item in items:
		response = requests.get("https://www.perrypedia.de/wiki/"+quote(item))
		soup = BeautifulSoup(response.text, 'html.parser')
		tables = soup.find_all('table')
		print(item)

		for table in tables:
			if table:
				for tr in table.findAll("tr"):
					if fields := tr.findAll("td"):
						if len(fields) == 4:
							character = Node(
								id=secrets.token_urlsafe(32),
								name=fields[0].text,
								species=fields[1].text,
								description=fields[2].text,
								source=fields[3].text,
								artificial=False,
							)

							if link := fields[0].find("a"):
								dest = link.get("href")
								# the RegEx filters red links(links to pages that dont exist)
								if re.match("/wiki/(.*)", dest) and not redirectsToFragment(dest):
									# Check for duplicate characters
									if session.query(Link).filter(Link.link==dest).first():
										print(dest, "is a duplicate")
										continue
		
									main_title, alt_links = get_alternative_links(dest)
									for alt_link in alt_links:
										session.add(Link(character_id=character.id, link=alt_link))

									character.name = main_title
							session.add(character)
		progress.update(1)
		session.commit()

def loadCharactersFromTable(url, field_values, num_fields):
	response = requests.get(url)
	soup = BeautifulSoup(response.text, 'html.parser')
	tables = soup.find_all('table')

	for table in tables:
		if table:
			for tr in tqdm(table.findAll("tr"), ascii=True):
				if fields := tr.findAll("td"):
					# Some characters dont have all fields set, nobody cares about them
					if len(fields) == num_fields:
						params = {
							"id": secrets.token_urlsafe(32),
						}
						for key, value in field_values.items():
							params[key] = fields[value[1]].text if value[0] else value[1]

						character = Node(**params)

						if link := fields[field_values["name"][1]].find("a"):
							dest = link.get("href")
							# the RegEx filters red links(links to pages that dont exist)
							if re.match("/wiki/(.*)", dest) and not redirectsToFragment(dest):
								# Check for duplicate characters
								if session.query(Link).filter(Link.link==dest).first():
									continue

								# Register all the urls to the character
								main_title, alt_links = get_alternative_links(dest)
								for alt_link in alt_links:
									session.add(Link(character_id=character.id, link=alt_link))

								# If possible, use the main title as its more descriptive
								character.name = main_title

						session.add(character)
	session.commit()

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
			fields = tr.findAll("td")
			if fields:
				if fields[0].text == "Hauptpersonen:":
					links = fields[1].find_all('a')
					for link in links:
						url = link.get("href")

						# If a character with that link exists in the database
						if row := session.query(Link).filter(Link.link == unquote(url)).first():
							characters.append(row.character_id)
						else:
							print(link.text, "does not exist in the database, (", url, ")")
			

	return characters

def adjustRelations(characters):
	"""
	Expects a list of main characters from one PR Book
	"""
	for index, character_1 in enumerate(characters):
		for character_2 in characters[index+1:]:
			# sort the characters
			node_1, node_2 = sorted([character_1, character_2])
			if row := session.query(Relation).filter(Relation.node_1 == node_1, Relation.node_2 == node_2).first():
				row.weight += 1
			else:
				session.add(Relation(node_1=node_1, node_2=node_2, weight=1))

session = new_session()
# pages = getLinksOnPage("Personen", plnamespace="0", filter=lambda x: re.match("^Personen [A-Z]$", x))
# getCharactersFromPagelist(pages)
# session.commit()
# print("now loading artificial characters")
# loadCharactersFromTable("https://www.perrypedia.de/wiki/K%C3%BCnstliche_Individuen", {
# 	"name": (True, 0),
# 	"species": (False, "Kunstwesen"),
# 	"description": (True, 3),
# 	"source": (True, 4),
# 	"artificial": (False, True),
# 	"appearance": (True, 1),
# 	"constructed_by": (True, 2)
# }, num_fields=5)
# print("entitiy")
# session.commit()
# loadCharactersFromTable("https://www.perrypedia.de/wiki/Entit%c3%a4ten", {
# 	"name": (True, 0),
# 	"species": (False, "Entität"),
# 	"description": (True, 1),
# 	"source": (True, 2)
# }, num_fields=3)
# session.commit()


pr_books = getLinksOnPage("Perry Rhodan-Heftromane", plnamespace="100")
progress = tqdm(total=len(pr_books))
for book in pr_books:
	print(book)
	adjustRelations(getMainCharacters(f"https://www.perrypedia.de/wiki/{book}"))
	# progress.update(1)


session.commit()
