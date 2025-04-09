from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .User import User
from .Meeting import Meeting
from .AdditionalCost import AdditionalCost
