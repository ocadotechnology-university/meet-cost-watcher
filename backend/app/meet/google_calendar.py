import datetime
import os
import json
from dotenv import load_dotenv
from app.models import Meeting, User, meeting_users
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

    print("Authorized!")

    return creds



def calculate_meeting_cost(participiants, duration) -> float:
    total_cost = 0.0
    
    for participant in participiants:
        hours = duration / 60
        participant_cost = hours * participant.hourly_cost
        total_cost += participant_cost
    
    return round(total_cost, 2)




def process_events(events):
    new_meeting_count = 0
    for event in events:
        if event.get("hangoutLink"):
            if save_single_event(event):
                new_meeting_count += 1
    return new_meeting_count




def save_single_event(event):
    hangout_link = event.get("hangoutLink")
    if not hangout_link:
        return False

    # Standaryzuj format linku do spotkania
    meet_token = hangout_link.replace("https://meet.google.com/", "").strip()
    
    name = event.get("summary", "").strip()
    start_str = event["start"].get("dateTime", event["start"].get("date"))
    end_str = event["end"].get("dateTime", event["end"].get("date"))
    participants = [att["email"].lower().strip() for att in event.get("attendees", []) if "email" in att]
    room = event.get("location", "").strip()
    description = event.get("description", "").strip()

    try:
        start = datetime.datetime.fromisoformat(start_str.replace("Z", "+00:00"))
        end = datetime.datetime.fromisoformat(end_str.replace("Z", "+00:00"))
        created_at = datetime.datetime.fromisoformat(event.get("created").replace("Z", "+00:00")) if event.get("created") else datetime.datetime.utcnow()
    except Exception as e:
        print(f"Parse error, event '{name}': {e}")
        return False

    organizer_email = event.get("organizer", {}).get("email", "").strip()
    if not organizer_email:
        print(f"Missing organizer email for event: {name}")
        return False

    owner = User.query.filter_by(username=organizer_email).first()
    if not owner:
        print(f"Organizer not found in database: {organizer_email}")
        return False

    existing_meeting = Meeting.query.filter(
        (Meeting.token == meet_token) &
        (Meeting.start_datetime == start)
    ).first()

    if existing_meeting:
        print(f"Meeting already exists: {name} ({meet_token}) at {start}")
        return False

    meeting_users = get_or_create_users(participants)
    meeting_users.append(owner)

    duration = (end - start).seconds // 60

    meeting = Meeting(
        name=name,
        start_datetime=start,
        duration=duration,
        room_name=room,
        cost=calculate_meeting_cost(meeting_users, duration),
        token=meet_token,
        created_at=created_at,
        description=description,
        owner_id=owner.id,
    )

    for user in meeting_users:
        meeting.users.append(user)

    try:
        db.session.add(meeting)
        db.session.commit()
        print(f'+ Added meeting: "{name}" ({meet_token}) at {start}')
        return True
    except Exception as e:
        db.session.rollback()
        print(f"Error saving meeting {name}: {str(e)}")
        return False


def get_or_create_users(participants_emails):
    users = []
    for email in participants_emails:
        user = User.query.filter_by(username=email).first()
        if not user:
            user = User(
                username=email,
                role_name="unknown",
                hourly_cost=0.0,
                app_role="EMPLOYEE",
            )
            # user.hash_password("123")
            db.session.add(user)
            db.session.commit()
            print(f'* Added user: "{email}"')
        users.append(user)
    print(users)
    return users



def save_meetings_from_calendar():
    creds = authorize()
    service = build("calendar", "v3", credentials=creds)

    now = datetime.datetime.utcnow().isoformat() + "Z"
    print("Getting events with Google Meet link...\n")
    events_result = (
        service.events()
        .list(
            calendarId="primary",
            timeMax=now,
            maxResults=100,
            singleEvents=True,
        )
        .execute()
    )
    events = events_result.get("items", [])

    if not events:
        print("No events with Google Meet.")
        return

    print(f"Get {len(events)} events from Google Calendar. Uploading to database...\n")
    try:
        db.session.execute(meeting_users.delete())
        db.session.query(Meeting).delete()
        db.session.commit()
        print("✔ Usunięto wszystkie spotkania i ich powiązania z użytkownikami.")
    except Exception as e:
        db.session.rollback()
        print(f"❌ Błąd podczas czyszczenia danych: {e}")

    db.session.commit()
    new_num = process_events(events)
    print(f"Added {new_num} meetings. {len(events) - new_num} already exist in the database.\n")
