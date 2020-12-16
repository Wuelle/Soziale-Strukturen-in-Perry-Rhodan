import requests
from Database import Node, Relation, Link, new_session
from sqlalchemy import select
from sqlalchemy.sql.expression import exists
import pandas as pd
import requests
from bs4 import BeautifulSoup
from urllib.parse import quote
from tqdm import tqdm
import re
import numpy as np
import secrets

def get_alternative_links(link):
	# get all the redirects(This assumes that the given link is the 
	# "main" one)
	params = {
		"action":"query",
		"prop":"redirects",
		"format":"json",
		"titles":link.rsplit("/", 1)[-1]
		}
	response = requests.get("https://www.perrypedia.de/mediawiki/api.php", params=params).json()
	page = list(response["query"]["pages"].values())[0]

	if "redirects" in page:
		for redirect in page["redirects"]:
			title = redirect["title"]
		return [quote("/wiki/"+redirect["title"]) for redirect in page["redirects"]]
	return []

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
	"""
	Extracts all the Characters with some extra info from a list of links to the pages
	"""
	characters = []

	progress = tqdm(total=len(items))
	for item in items:
		response = requests.get("https://www.perrypedia.de/wiki/"+quote(item))
		soup = BeautifulSoup(response.text, 'html.parser')
		tables = soup.find_all('table')

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
							session.add(character)

							if link := fields[0].find("a"):
								dest = link.get("href")
								# Add the direct link
								session.add(Link(character_id=character.id, link=dest))

								# Wikimedia allows multiple urls to redirect to the same page so 
								# those alternatives have to be saved as well
								for alt_link  in get_alternative_links(dest):
									session.add(Link(character_id=character.id, link=alt_link))

		progress.update(1)
		session.commit()
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
			fields = tr.findAll("td")
			if fields:
				if fields[0].text == "Hauptpersonen:":
					links = fields[1].find_all('a')
					for link in links:
						url = link.get("href")
						print(session.query(Node).filter(Node.link == link.get("href")).first())
						print(url)
						input()

						# If a character with that link exists in the database
						if session.query(Node).filter(Node.link == url).first():
							characters.append(url)
							continue
							
						if alt_url := requests.get(url).url != url:
							print(alt_url)
							if session.query(Node).filter(Node.link == alt_url).first():
								characters.append(alt_url)
								continue
						else:
							print(link.text, " -X-")


	return characters


def getArtificialCharacters(url):
	pr_characters_artificial = []

	response = requests.get(url)
	soup = BeautifulSoup(response.text, 'html.parser')
	tables = soup.find_all('table')

	for table in tables:
		if table:
			for tr in table.findAll("tr"):
				if fields := tr.findAll("td"):
					# Some characters dont have all fields set, nobody cares about them
					if len(fields) == 5:
						character = {
							"name": fields[0].text,
							"species": "Kunstwesen",
							"description": fields[3].text,
							"source": fields[4].text,
							"artificial":True,
						}
						if link := fields[0].find("a"):
							character["link"] = link.get("href")
						if not isinstance(fields[1], float):
								character["appearance"] = fields[1].text
						if not isinstance(fields[2], float):
							character["constructed_by"] = fields[2].text
						pr_characters_artificial.append(Node(**character))
	return pr_characters_artificial

session = new_session()
pages = getLinksOnPage("Personen", plnamespace="0", filter=lambda x: re.match("^Personen [A-Z]$", x))
pr_characters_natural = getCharactersFromPagelist(pages)
# pr_characters_artificial = getArtificialCharacters("https://www.perrypedia.de/wiki/K%C3%BCnstliche_Individuen")

# session = new_session()
# for character in pr_characters_artificial:
	# session.add(character)
# for character in pr_characters_natural:
	# session.add(character)
# session.commit()

# pr_books = getLinksOnPage("Perry Rhodan-Heftromane", plnamespace="100")
# print(getMainCharacters("https://www.perrypedia.de/wiki/"+pr_books[0]))
session.commit()
