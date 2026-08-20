from flask import Flask
from flask_cors import CORS
from .routes.typing import typing

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.register_blueprint(typing)

    return app