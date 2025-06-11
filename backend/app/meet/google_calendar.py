import datetime
import os
import json
from dotenv import load_dotenv
from app.models import Meeting, User
from app import db

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

# credentials_path = 'credentials.json'
load_dotenv()
credentials_str = os.getenv("CREDENTIALS")
credentials_json = json.loads(credentials_str)
token_path = "token.json"

SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"]


def authorize():
    creds = None

    # Local token for authorization
    try:
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)
    except Exception as e:
        creds = None

    print(creds)

    # Loggin by browser if token not found
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            # flow = InstalledAppFlow.from_client_secrets_file(credentails_path, SCOPES)
            flow = InstalledAppFlow.from_client_config(
                credentials_json,
                SCOPES)
            creds = flow.run_local_server(port=8080)
            print(creds)

        with open(token_path, "w") as token:
            token.write(creds.to_json())

    print("Zautoryzowano!")

    return creds


def save_meetings_from_calendar():

    creds = authorize()
    service = build("calendar", "v3", credentials=creds)

    # 100 last meetings

    print("Pobieranie wydarzeń z linkiem Google Meet...\n")
