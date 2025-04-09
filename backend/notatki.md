# Flow API

## Q&A

### Jakich potrzebujemy kluczy do połączenia się?

Prawdopodobnie ID klienta i Client_Secret [https://developers.google.com/meet/api/guides/tutorial-events-python?hl=pl&utm_source=chatgpt.com#set-up-auth-desktop-client]

Inną możliwością jest użycie tego [https://cloud.google.com/docs/authentication/api-keys?visit_id=638785173387956679-3476802915&rd=1]

### Jaką metodą jest autoryzacja (Oauth2, BasicAuth czy coś innego)

OAuth 2.0 [https://developers.google.com/meet/api/guides/authenticate-authorize?hl=pl#:~:text=Interfejs%20Meet%20REST%20obs%C5%82uguje%20te%20zakresy%20OAuth%C2%A02.0%3A]

Logowanie przez Google I uwietrzylnianie przez to ?

### W jakiej formie zczytujemy dane o spotkaniu, aktywnie czy pasywnie z webhooka?

Poprzez żądania HTTPS (czyli aktywnie) [https://developers.google.com/meet/api/guides/tutorial-events-python?hl=pl&utm_source=chatgpt.com#:~:text=response%20%3D%20session.post(%22https%3A//workspaceevents.googleapis.com/v1/subscriptions%22%2C%20json%3Dbody)]

### Jak pobrać listę osób + pokój z konkretnego spotkania

TODO: Wciąż szukane, prawdpodobnie trzeba będzie ciągle nasłuchiwać i zapisywać odpowiedzi. Demo prostej apki na kompie

## Linki
- https://developers.google.com/meet/api/guides/quickstart/python?hl=pl
- https://developers.google.com/meet/api/guides/tutorial-events-python?hl=pl
- https://docs.google.com/document/d/1wOffkXVUK38-baNzRLZW85Mt11Q6YhdNS55hTigXh_w/edit?pli=1&hl=pl&tab=t.0#heading=h.7eebh571khfm
- ***https://github.com/googleapis/google-api-python-client/blob/main/docs/api-keys.md (może sie przydać)
