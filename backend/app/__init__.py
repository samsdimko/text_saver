from gevent import monkey
monkey.patch_all()

from flask import Flask, request
from flask_cors import CORS
from flask_login import LoginManager
from config import Config


app = Flask(__name__)
app.config.from_object(Config)
login = LoginManager(app)
login.login_view = 'login'
CORS(app)



from app import routes, models, forms