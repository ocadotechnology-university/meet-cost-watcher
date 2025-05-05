from flask import Flask
from flask_restx import Api
from app.extensions import db
from .routes import register_namespaces
import os
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()


def create_app():
    app = Flask(__name__)

    api = Api(app, title="Meet Cost Watcher", version="1.0")

    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f'mysql+pymysql://{os.getenv("DB_USER", "")}:{os.getenv("DB_PASSWORD", "")}@{os.getenv("DB_HOST", "")}/{os.getenv("DB_NAME", "")}'
    )

    CORS(app)

    db.init_app(app)

    register_namespaces(api)

    return app
