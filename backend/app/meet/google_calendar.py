import datetime
import os.path

from app.models import Meeting, User
from app import db

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

credentials_path = 'app\\meet\\credentials.json'
token_path = 'app\\meet\\token.json'

SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']
        
        
        
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
            flow = InstalledAppFlow.from_client_secrets_file(
                credentails_path, SCOPES)
            creds = flow.run_local_server(port=0)
        
        with open(token_path, 'w') as token:
            token.write(creds.to_json())

    print("Zautoryzowano!")

    return creds

def save_meetings_from_calendar():

    creds = authorize()
    service = build('calendar', 'v3', credentials=creds)

    # 100 last meetings

    now = datetime.datetime.utcnow().isoformat() + 'Z'
    meeting_num = 100

    print('Pobieranie wydarzeń z linkiem Google Meet...\n')
    events_result = service.events().list(
        calendarId='primary',
        timeMax=now,
        maxResults=meeting_num,
        singleEvents=True,
    ).execute()

    events = events_result.get('items', [])
    if not events:
        print('Brak wydarzeń z Google Meet.')
        return
    else:
        print(f'Znalezionych wydarzeń: {len(events)}. Wczytywanie do bazy...\n')


    new_num = 0
    

    for event in events:
        hangout_link = event.get('hangoutLink')
        if hangout_link:

            # Google Meet
            name = event.get('summary', 'Brak tytułu')
            start_str = event['start'].get('dateTime', event['start'].get('date'))
            end_str = event['end'].get('dateTime', event['end'].get('date'))
            participants = [att['email'] for att in event.get('attendees', []) if 'email' in att]

            # Parsing
            start = datetime.datetime.fromisoformat(start_str)
            end = datetime.datetime.fromisoformat(end_str)

            # Option 1: Find duplicate meetings in database

            existing_meeting = Meeting.query.filter_by(
                token=hangout_link,
                name=name,
                start_datetime=start
                ).first()
            
            if existing_meeting:
                continue

            # Option 2: Reload all past meetings
            # Meeting.query.filter(
            #     Meeting.start_datetime >= start,
            # ).delete()
            # db.session.commit()
            
            # print(f'Załadowano ponownie')
                

            # Save meeting to database
            meeting = Meeting(
                name=name,
                token=hangout_link,
                start_datetime=start,
                duration=(end - start).seconds // 60,
                room_name='Google Meet',
                cost=0.0 
            )
            new_num += 1
            print(f'+ "{name}"')
            db.session.add(meeting)
            db.session.commit()

            # Save participants to database
            for participant in participants:
                existing_participant = User.query.filter_by(username=participant).first()
                if not existing_participant:
                    user = User(username=participant, role_name='unknown', hourly_cost=0.0)
                    db.session.add(user)
                    db.session.commit()
                    print(f'* Dodano użytkownika "{participant}"')


    print(f'Dodano {new_num} spotkań. W bazie znajdują się: {len(events)-new_num}.\n')
