import datetime
import os.path

from app.models import Meeting
from app import db

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build

credentails_path = 'app\\meet\\credentials.json'
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
        # Zapis tokena
        with open(token_path, 'w') as token:
            token.write(creds.to_json())
    print("Zautoryzowano!")
    return creds

def save_meetings_from_calendar():

    creds = authorize()
    service = build('calendar', 'v3', credentials=creds)

    # Meetings from last 30 days
    now = datetime.datetime.utcnow().isoformat() + 'Z'
    future = (datetime.datetime.utcnow() + datetime.timedelta(days=30)).isoformat() + 'Z'

    print('Pobieranie wydarzeń z linkiem Google Meet...')
    events_result = service.events().list(
        calendarId='primary',
        timeMax=now,
        maxResults=100,
        singleEvents=True,
    ).execute()

    events = events_result.get('items', [])

    print()

    if not events:
        print('Brak nadchodzących wydarzeń z linkiem Google Meet.')
        return
    else:
        print(f'Znalezionych wydarzeń: {len(events)}\n')


    duplicate_num = 0

    for event in events:
        hangout_link = event.get('hangoutLink')
        if hangout_link:

            # Google Meet
            name = event.get('summary', 'Brak tytułu')
            start = event['start'].get('dateTime', event['start'].get('date'))
            end = event['end'].get('dateTime', event['end'].get('date'))
            # TODO: attendees = [att['email'] for att in event.get('attendees', []) if 'email' in att]

            # Parsing
            start = datetime.datetime.fromisoformat(start)
            end = datetime.datetime.fromisoformat(end)

            # Option 1: Finding duplicates in database

            existing_meeting = Meeting.query.filter_by(
                token=hangout_link,
                name=name,
                start_datetime=start
                ).first()
                
            
            if existing_meeting:
                print(f'{hangout_link}')
                duplicate_num += 1
                continue

            # Option 2: Reload all future meetings
            # Meeting.query.filter(
            #     Meeting.start_datetime >= start,
            # ).delete()
            # db.session.commit()
            
            # print(f'Załadowano ponownie')

            # Saving to database
            meeting = Meeting(
                name=name,
                token=hangout_link,
                start_datetime=start,
                duration=(end - start).seconds // 60,
                room_name='Google Meet',
                cost=0.0 
            )
            db.session.add(meeting)
            db.session.commit()

            print(f'Dodano "{name}"')

    print(f'Pominięto {duplicate_num} spotkań.\n')
