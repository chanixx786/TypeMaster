from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from app.extension import db, migrate
from app.routes.typing import typing_bp
import app.models

load_dotenv()


def create_app():
    app = Flask(__name__)

    app.config.from_object("config.Config")

    CORS(app)

    app.register_blueprint(typing_bp)

    db.init_app(app)
    migrate.init_app(app, db)

    return app