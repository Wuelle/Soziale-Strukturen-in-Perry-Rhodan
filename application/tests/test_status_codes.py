from app import app
import unittest


class StatusTests(unittest.TestCase):
	# executed prior to each test
	def setUp(self):
		app.config['TESTING'] = True
		app.config['DEBUG'] = False
		self.app = app.test_client()
		self.assertEqual(app.debug, False)

	# executed after each test
	def tearDown(self):
		pass

	def test_statistics(self):
		response = self.app.get('/statistics', follow_redirects=True)
		self.assertEqual(response.status_code, 200)

	def test_visualization(self):
		response = self.app.get('/visualization', follow_redirects=True)
		self.assertEqual(response.status_code, 200)

	def test_favicon(self):
		response = self.app.get('/favicon.ico', follow_redirects=True)
		self.assertEqual(response.status_code, 200)

	def test_home(self):
		response = self.app.get('/', follow_redirects=True)
		self.assertEqual(response.status_code, 200)
 
 
if __name__ == "__main__":
	unittest.main()