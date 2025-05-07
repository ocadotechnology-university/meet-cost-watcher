from __future__ import print_function
import datetime
import os.path

from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from googleapiclient.discovery import build


SCOPES = ['https://www.googleapis.com/auth/calendar.readonly']



def main():
    creds = None
    # Token zapisany lokalnie
    if os.path.exists('token.json'):
        creds = Credentials.from_authorized_user_file('token.json', SCOPES)

    # Logowanie przez przeglądarkę jeśli nie ma tokena
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'credentials.json', SCOPES)
            creds = flow.run_local_server(port=0)
        # Zapis tokena
        with open('token.json', 'w') as token:
            token.write(creds.to_json())

    # Połączenie z API
    service = build('calendar', 'v3', credentials=creds)

    # Zakres czasu: teraz do +30 dni
    now = datetime.datetime.utcnow().isoformat() + 'Z'
    future = (datetime.datetime.utcnow() + datetime.timedelta(days=30)).isoformat() + 'Z'

    print('Pobieranie wydarzeń z linkiem Google Meet...')
    events_result = service.events().list(
        calendarId='primary',
        timeMin=now,
        timeMax=future,
        maxResults=100,
        singleEvents=True,
        orderBy='startTime'
    ).execute()

    events = events_result.get('items', [])

    print()

    if not events:
        print('Brak nadchodzących wydarzeń z linkiem Google Meet.')
        return

    for event in events:
        hangout_link = event.get('hangoutLink')
        if hangout_link:
            summary = event.get('summary', 'Brak tytułu')
            start = event['start'].get('dateTime', event['start'].get('date'))
            end = event['end'].get('dateTime', event['end'].get('date'))
            attendees = [att['email'] for att in event.get('attendees', []) if 'email' in att]

            print(f'Tytuł: {summary}')
            print(f'Od: {start}')
            print(f'Do: {end}')
            print(f'Link do Google Meet: {hangout_link}')
            print(f'Uczestnicy: {", ".join(attendees) if attendees else "Brak"}\n')

        
            

if __name__ == '__main__':
    main()
