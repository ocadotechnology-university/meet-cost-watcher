from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
import os
from dotenv import load_dotenv
from flask_httpauth import HTTPBasicAuth
from models import db, User, Meeting
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = (
    f'mysql+pymysql://{os.getenv("DB_USER", "")}:{os.getenv("DB_PASSWORD", "")}@{os.getenv("DB_HOST", "")}/{os.getenv("DB_NAME", "")}'
)
CORS(app)
db.init_app(app)
auth = HTTPBasicAuth()


@auth.verify_password
def verify_password(username, password):
    user = User.query.filter_by(username=username).first()
    if not user or not user.verify_password(password):
        return False
    return True


@app.route("/test", methods=["GET","POST"])
@auth.login_required
def index():
    return jsonify({"message": "Login successful"}), 200


@app.route("/meet/<token>", methods=["GET"])
@auth.login_required
def meet_single(token: str) -> str:
    return jsonify(Meeting.query.filter_by(token=token).first_or_404().to_dict())


if __name__ == "__main__":
    app.run(debug=True)
