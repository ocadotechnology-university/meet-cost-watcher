[//]: <> (// Ctr + Shift + V)

# Flow API

## Działanie google meet rest API (skrót)

Działanie aplikacji można podsumować następująco:

1.  Autoryzacja przez użytkownika lub konto usługi
2.  Wysłanie żądania do API
3.  Przesłanie odpowiedzi w postaci JSON

Istnieją dwa sposoby na zidentyfikowanie pokoju:

- space (ID po stronie serwera), np. `jQCFfuBOdN5z`.
- meetingCode (część Uri), np. `abc-mnop-xyz`

W 99% kody spotkań wygasają po 365 dniach od ostatniego użycia i mogą być wykorzystywane wielokrotnie, co pozwala na łatwe monitorowanie np. spotkań cyklicznych. Teoretycznie `space` jest trwałe.

Będą nas interesować głównie te zasoby REST:

- [conferenceRecords](https://developers.google.com/workspace/meet/api/reference/rest/v2/conferenceRecords?hl=pl#resource:-conferencerecord) - m.in. początek i koniec spotkania
- [conferenceRecords.participants](https://developers.google.com/workspace/meet/api/reference/rest/v2/conferenceRecords.participants?hl=pl) - informacje o uczestnikach spotkania (`.list()` wyświetli wszystkie teoretycznie)
- [space](https://developers.google.com/workspace/meet/api/reference/rest/v2/spaces?hl=pl#SpaceConfig) - identyfikatory wirtualnych przestrzeni

## Google Cloud Project

Aby uzyskać wgl dostęp do takich usług, potrzebny jest projekt w Google Cloud, gdzie można nim zarządzać i uzyskiwać dane wrażliwe (klucze, konta usług itp). [[link]](https://console.cloud.google.com/)

W skrócie:

- Utwórz konto
- Utwórz projekt
- Interfejsy API i usługi -> Biblioteka -> (wyszukać i aktywować Google Meet API)
- Utworzyć konto usługi, które będzie działać w imieniu projektu oraz przyznać uprawnienia (jak?)
- pobrać `credentials.json` i dodać go do projektu (UWAGA: dane wrażliwe)

> Jak dodać role kont usługi, tak by działały?

Ważna sprawa, mogą istnieć dwa oddzielne `credentials.json`:

- konto usługi (bez interakcji użytkownika)
- oAuth 2.0 (użytkownik przyznaje aplikacji dostęp do swojego konta Google)

## Google Workspace

Będzie wygamane do uzyskania informacji o wszystkim, co się dzieje w firmie, w tym o aktywności w Google Meet i pracownikach.

Administrator będzie musiał nam udzielić dostępu, zwłaszcza `https://www.googleapis.com/auth/meetings.readonly`.

> Poczytać o [Domain-Wide Delegation](https://support.google.com/a/answer/162106?hl=en_), bo będzie wymagane

## Q&A 1

### Jakich potrzebujemy kluczy do połączenia się?

Wszystkie informacje powinny być w wygenerowanym pliku `credentials.json`


~~Prawdopodobnie ID klienta i Client_Secret [https://developers.google.com/meet/api/guides/tutorial-events-python?hl=pl&utm_source=chatgpt.com#set-up-auth-desktop-client]~~

~~Inną możliwością jest użycie tego [https://cloud.google.com/docs/authentication/api-keys?visit_id=638785173387956679-3476802915&rd=1]~~

### Jaką metodą jest autoryzacja (Oauth2, BasicAuth czy coś innego)

[OAuth 2.0](https://developers.google.com/meet/api/guides/authenticate-authorize?hl=pl#:~:text=Interfejs%20Meet%20REST%20obs%C5%82uguje%20te%20zakresy%20OAuth%C2%A02.0%3A)


### W jakiej formie zczytujemy dane o spotkaniu, aktywnie czy pasywnie z webhooka?

Poprzez żądania HTTPS (czyli chyba aktywnie) [[link]](https://developers.google.com/meet/api/guides/tutorial-events-python?hl=pl&utm_source=chatgpt.com#:~:text=response%20%3D%20session.post(%22https%3A//workspaceevents.googleapis.com/v1/subscriptions%22%2C%20json%3Dbody))

### Jak pobrać listę osób + pokój z konkretnego spotkania
Użyć `conferenceRecords.participants` oraz `spaces` na podstawie kodu spotkania.

~~TODO: Wciąż szukane, prawdpodobnie trzeba będzie ciągle nasłuchiwać i zapisywać odpowiedzi. Demo prostej apki na kompie~~

## Linki

- https://developers.google.com/meet/api/guides/quickstart/python?hl=pl
- https://developers.google.com/meet/api/guides/tutorial-events-python?hl=pl
- https://docs.google.com/document/d/1wOffkXVUK38-baNzRLZW85Mt11Q6YhdNS55hTigXh_w/edit?pli=1&hl=pl&tab=t.0#heading=h.7eebh571khfm
- \*\*\*https://github.com/googleapis/google-api-python-client/blob/main/docs/api-keys.md (może sie przydać)

## Q&A 2

### Jak wyciągnąć informacje o odbytych spotkaniach danego użytkownika?

Korzystając z Google Meet API używając `conferenceRecords().list()`

Możliwe alternatywy / dodatkowe technologie:

- [ ZALECANE ] Google Workspace, też korzystamy z `conferenceRecords().list()` + filtrujemy po mailu 
- Calendar API posiada [`events.list`](https://developers.google.com/workspace/calendar/api/v3/reference/events?hl=pl), wydaje się prostsze i mamy pewność danych co do zapisanych spotkań ale brak informacji o niezaplanowanych spotkaniach


### Czy da się wyciągnąć info o wszystkich odbytych spotkaniach w firmie? Jak to wtedy wygląda z prawami dostępu?

Teoretycznie tak, jak wyżej. Będzie trzeba ogarnąć Google Workspace i sprawdzić jak działa.

### Czy da się wyciągnąć i jak nadchodzące spotkania?

Możliwe że conferenceRecords().list() będzie zawierało też informacje o spotkaniach które się nie odbyły, trzeba będzie filtrować po czasie (coś w rodzaju `time>{currentTime}`)

Alternatywnie będzie konieczna integracja dodatkowo z Google Calendar API i użyć `events.list` z odpowiednio ustawionym `timeMin1` 



### Jaki jest sposób na autoryzację do API bez wyskakujących okienek z prośbą o potwierdzenie?

Należy stworzyć konto usługi i potrafić sie nim obsługiwać.

## Linki

- https://developers.google.com/workspace/meet/api/guides/authenticate-authorize?hl=pl#domain-wide-delegation
- https://googleapis.github.io/google-api-python-client/docs/epy/index.html
