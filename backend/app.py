from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv
from models import db
load_dotenv()

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+pymysql://{os.getenv("DB_USER", "")}:{os.getenv("DB_PASSWORD", "")}@{os.getenv("DB_HOST", "")}/{os.getenv("DB_NAME", "")}'
db.init_app(app)


@app.route('/login', methods=['GET', 'POST'])
def index() -> str:

    
    return "Hello World"


if __name__ == "__main__":
    app.run(debug=True)
