from flask import Flask
from flask_cors import CORS
from .routes.typing import typing
import os
from dotenv import load_dotenv
from app.extension import db
import app.models
load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(typing)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    db.init_app(app)

    with app.app_context():
        db.create_all()

    return app