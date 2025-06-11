import React, {RefObject, useEffect, useMemo, useRef, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {toast, ToastContainer} from 'react-toastify';
import logo from '../assets/logo.png'

import "../style.css";

import "rc-slider/assets/index.css";
import {Meeting, MeetingRequest, MeetingResponse, Participant} from "../types/responseTypes.ts";
import {MeetingFilters} from "../components/MeetingFilters.tsx"
import MeetingDetails from "../components/MeetingDetails.tsx";
import {formatDate, formatDuration, formatTime, toISODateTime} from "../utils/formatFunctions.ts";
import {useContainerScroll} from "../hooks/infiniteScroll.ts";
import { backendURL } from "../main.tsx";

export default function MultipleMeetingsPage(){

  const perPage = 20;
  const [initialLoading, setInitialLoading] = useState(true);
  const today = new Date();
  const monthAgo = new Date();
  monthAgo.setDate(today.getDate() - 30);
  const [searchVersion, setSearchVersion] = useState(0);
  const [selectedMeetingId, setSelectedMeetingId] = useState<number|null>(null);
  const [meetingsCost, setMeetingsCost] = useState<number>(0);
  const [meetingsList, setMeetingsList] = useState<Meeting[]|[]>([]);
  const [currentRequest, setCurrentRequest] = useState<MeetingRequest>({
    per_page: perPage,
    page: 1,
    start_min: toISODateTime(monthAgo.toISOString().split('T')[0], '00:00'),
    start_max: toISODateTime(today.toISOString().split('T')[0],today.toTimeString().substring(0,5)),
    sort_by: {
      field: 'start_datetime',
      order: 'desc'
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const listContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const hasFetchedInitialData = useRef(false);

  useEffect(() => {
    if (!hasFetchedInitialData.current) {
      hasFetchedInitialData.current = true;
      fetchMeetings(1, true);
      return;
    }

    if(hasFetchedInitialData || searchVersion > 0)
    {
      setPage(1);
      setHasMore(true);
      fetchMeetings(1, true);
    }
// eslint-disable-next-line react-hooks/exhaustive-deps
  },[searchVersion]);

  const fetchMeetings = async (pageNum: number = 1, reset = false) => {
    console.log(`Fetching meetings (page: ${pageNum}, reset: ${reset})`);
    if(isLoading || (!hasMore && !reset)) return;

    setIsLoading(true);
    if (reset) {
      setInitialLoading(true);
    }
    setError(null);
    try{
      const credentials = localStorage.getItem('credentials');

      const response = await fetch(backendURL+"/meetings/all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${credentials}`
        },

        body: JSON.stringify({
          ...currentRequest,
          page: pageNum,
          per_page:perPage
        })
      });

      if(response.ok) {
        const data: MeetingResponse = await response.json();
        setMeetingsCost(data.value.total_cost);
        const newMeetings = data.value.meetings;
        setMeetingsList(prevState => reset ? newMeetings : [...prevState, ...newMeetings]);

        if(newMeetings.length<perPage)
        {
          setHasMore(false);
        }
        setPage(pageNum);
      } else {
        console.error('Błąd pobierania spotkań');
      }

    } catch (error) {
      setError('Failed to fetch! ');
      console.error("Error to fetch: ", error);
    } finally {
      setIsLoading(false);
      if (reset) {
        setInitialLoading(false);
      }

    }
  };



  useContainerScroll(listContainerRef  as RefObject<HTMLElement>,() => {
    if(!isLoading && hasMore) {
      fetchMeetings(page+1,)
    }
  }, isLoading);

  const handleNewCost = async (meetingId: number, name: string, cost: number) => {

    try {
      const credentials = localStorage.getItem('credentials');

      const response = await fetch(backendURL+"/costs/", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        },
        body: JSON.stringify({
          meeting_id: meetingId ,
          name:name,
          cost:cost
        })
      });

      if(response.ok)
      {
        toast.success("Koszt dodany pomyślnie");

      } else {
        toast.error("Nie udało się dodać nowego kosztu!");
      }

    } catch (error) {

      console.error('Error adding cost:', error);
    }

  }

  const handleEditCost = async (name:string, cost:number ,id?: number,) => {
    try {
      if (id === undefined) {
        toast.error("Nieprawidłowe ID kosztu!");
        console.error('Error: Item id is undefined');
        return;
      }
      const credentials = localStorage.getItem('credentials');

      const response = await fetch(backendURL+"/costs/", {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        },
        body: JSON.stringify({
          id: id ,
          name:name,
          cost:cost})
      });

      if(response.ok)
      {
        toast.success("Pomyślnie zedytowano koszt!");

      } else {
        toast.error("Nie udało się zedytować kosztu!");
      }


    } catch (error) {
      console.error('Error saving cost:', error);
    }
  };

  const handleDeleteCost = async (costId: number) => {
    try {
      const credentials = localStorage.getItem('credentials');
      const response = await fetch(backendURL+"/costs/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${credentials}`
        },
        body: JSON.stringify({
          id: costId
        })
      });

      if(response.ok)
      {
        toast.success("Koszt usunięty pomyślnie!");

      } else {
        toast.error("Nie udało się usunąć kosztu!");
      }


    } catch (error) {
      console.error('Error deleting cost:', error);
    }
  };

  const refreshCurrentRange = () => {
    const pagesToReload = Math.ceil(meetingsList.length / perPage);
    setHasMore(true);
    setPage(pagesToReload);


    const promises = [];
    for (let i = 1; i <= pagesToReload; i++) {
      promises.push(fetchMeetings(i, i === 1));
    }
    Promise.all(promises);
  };

  const handleSearch = (request: MeetingRequest) => {
    setCurrentRequest(request);
    setSearchVersion(prev => prev + 1);
  };

  const handleLogout = () => {
    localStorage.removeItem('credentials');
    sessionStorage.removeItem('credentials');
    setSelectedMeetingId(null);
    navigate('/', {
      state: {
        from: location.pathname,
        message: 'Wylogowano pomyślnie'
      },
      replace: true
    });

  };
  function getUniqueParticipants(meetings: Meeting[]): Participant[] {
    const uniqueMap = new Map<number, Participant>();
    meetings.forEach(meeting => {
      meeting.participants.forEach(participant => {
        if (!uniqueMap.has(participant.id)) {
          uniqueMap.set(participant.id, participant);
        }
      });
    });
    return Array.from(uniqueMap.values());
  }


  const handleMeetingSelection = (id: number) => {
    setSelectedMeetingId(id === selectedMeetingId ? null : id);
  };

  const filteredMeetings = useMemo(() => {
    return meetingsList || [];
  }, [meetingsList]);


  const selectedMeeting = useMemo(() => {
    return filteredMeetings.find(m => m.id === selectedMeetingId) ||
        filteredMeetings[0] || null;
  }, [filteredMeetings, selectedMeetingId]);


  useEffect(() => {
    if (filteredMeetings.length && !selectedMeetingId) {
      setSelectedMeetingId(filteredMeetings[0].id);
    }
  }, [filteredMeetings,selectedMeetingId]);

  if (initialLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-white text-blue-main">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-xl font-semibold">Ładowanie spotkań...</p>
          </div>
        </div>
    );
  }

  return (
    <div className="bg-[#f6f6f6] min-h-screen min-w-screen text-gray-900 overflow-hidden">
      <ToastContainer position="bottom-right" autoClose={3000} />
      <MeetingFilters
        onSearch={handleSearch}
        initialParticipants={getUniqueParticipants(meetingsList)}
        onLogout={handleLogout}
        filterRequest={currentRequest}
      />

      {/* Central part of the page */}
      <div className="text-center p-6">
        <h1 className="text-6xl font-normal text-blue-main">{meetingsCost.toFixed(2)} zł</h1>
        <p className="text-lg">CAŁKOWITY KOSZT WYBRANYCH SPOTKAŃ</p>
        <p className="text-md">{new Date(currentRequest.start_min ? currentRequest.start_min : '').toLocaleDateString()} - {new Date(currentRequest.start_max ? currentRequest.start_max : '').toLocaleDateString()}</p>
        <div
            style={{ backgroundImage: `url(${logo})` }}
            className="top-6 right-6 absolute object-cover w-[6em] h-[6em] rounded-2xl bg-size-[130%] box-border overflow-hidden bg-center bg-no-repeat ">
        </div>
      </div>
      <hr className="border-gray-300" />

      {/*List of meetings*/}
      <div className="grid grid-cols-4 gap-x-4 p-4 h-[80vh] max-h-[80vh]">
        <div className="h-full flex flex-col">
          <div className="white-shadow-bordered-div col-span-1 h-full">
            <div ref={listContainerRef} className="h-full max-h-[80vh] overflow-y-auto pr-2">
              <ul>
                <div className="sticky top-0 bg-white z-10">
                  <li className="pl-2 text-[0.9em] font-bold text-blue-main mb-2">Znalezionych wyników: {filteredMeetings.length}</li>
                  <hr className="gray-line mx-2" />
                </div>
                {filteredMeetings.map((m) => (
                  <React.Fragment key={`${m.id}-${new Date(m.date).getTime()}`}>
                    <li
                      className={`flex justify-between items-center px-2 py-2 rounded-2xl hover:bg-gray-200 cursor-pointer ${m.id === selectedMeetingId ? "bg-blue-100" : ""}`}
                      onClick={() => handleMeetingSelection(m.id)}
                    >
                      <div className="whitespace-nowrap overflow-hidden w-full">
                        <div className="font-medium max-h-min flex flex-row justify-between">
                          <span className="mr-2">{m.token}</span>
                          <span >{m.title}</span>
                        </div>
                        <div className="text-[1em] text-gray-600 flex justify-between">
                          <span>{formatDate(m.date)}, {formatTime(new Date(m.date))}</span>
                          <span> {formatDuration(m.duration)}</span>
                          <span className="text-custom-teal font-semibold">{m.cost.toFixed(2)} zł</span>
                        </div>

                      </div>
                    </li>
                    <hr className="gray-line mx-2" />
                  </React.Fragment>
                ))}
                {isLoading && (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                )}
                {!hasMore && !isLoading && (
                    <div className="text-center py-4 text-gray-500">
                      To już wszystkie spotkania
                    </div>
                )}
                {error && (
                    <div className="text-center py-4 text-gray-500">
                      Błąd ładowania, spróbuj później!
                    </div>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Details of selected meeting */}
        {selectedMeeting ? (
            <MeetingDetails
                meeting={selectedMeeting}
                onNewCost={handleNewCost}
                onEditCost={handleEditCost}
                onDeleteCost={handleDeleteCost}
                refreshMeeting = {() => refreshCurrentRange()}
          />

        ): (
            <div className="col-span-3 white-shadow-bordered-div flex items-center justify-center">
              <p className="text-gray-500">Brak spotkań do wyświetlenia</p>
            </div>
        )}
      </div>
    </div>
  );
};
