import React, {useEffect, useMemo, useRef, useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import magnifier from '../assets/magnifier.png'
import logo from '../assets/logo.png'
import arrowLeft from '../assets/arrowLeft.png'
import "../style.css";

import "rc-slider/assets/index.css";
import {Meeting, MeetingRequest, MeetingResponse, Participant} from "../types/responseTypes.ts";
import {MeetingFilters} from "../components/MeetingFilters.tsx"
import MeetingDetails from "../components/MeetingDetails.tsx";
import {formatDate, formatDuration, formatTime} from "../utils/formatFunctions.ts";
import {useContainerScroll} from "../hooks/infiniteScroll.ts";


export default function MultipleMeetingsPage(){

  const perPage = 50;

  const [filterVisibility, setFilterVisibility] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState<number|null>(null);
  const [meetingsData, setMeetingsData] = useState<MeetingResponse|null>(null);
  let [meetingsList, setMeetingsList] = useState<Meeting[]|[]>([]);
  const [currentRequest, setCurrentRequest] = useState<MeetingRequest>({
    per_page: perPage,
    page: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const listContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const initialData = location.state as MeetingResponse;
  const backendURL = "http://127.0.0.1:5000";


  useEffect(() => {
    if (initialData) {
      setMeetingsData(initialData);
      setHasMore(initialData.value.meetings.length >= perPage);
    } else {
      fetchMeetings(currentRequest
      , true);
    }
  }, []);

  const fetchMeetings = async (request: MeetingRequest, initialLoad = false) => {
    if(isFetching || !hasMore) return;

    setIsFetching(true);
    setIsLoading(true);
    setError(null);
    console.log(JSON.stringify({
      ...request,
      page: initialLoad ? 1 : page,
      per_page:perPage
    }))
    try{
      const credentials = localStorage.getItem('credentials');

      const response = await fetch(backendURL+"/meetings/all", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${credentials}`
        },

        body: JSON.stringify({
          ...request,
          page: initialLoad ? 1 : page,
          per_page:perPage
        })
      });

      if(!response.ok) {
        throw new Error(`Error status : ${response.status}`);
      }

      const data: MeetingResponse = await response.json();
      console.log(data);
      const newMeetings = data.value.meetings;

      if(initialLoad) {
        setMeetingsData(data);
        setMeetingsList(data.value.meetings);
      }
      else
      {
        setMeetingsList(meetingsList = [...meetingsList, ...data.value.meetings] )
        setMeetingsData(data);
      }

      setHasMore(newMeetings?.length >= perPage);
      setPage(prevState => initialLoad ? 2 : prevState + 1);

      if(initialLoad && newMeetings.length) {
        setSelectedMeetingId(meetingsList[0].id);
      }

      // if(selectedMeetingId && !data.value.meetings.some(m => m.id === selectedMeetingId)) {
      //   setSelectedMeetingId(data.value.meetings[0]?.id || null);
      // }
    } catch (error) {
      setError('Failed to fetch! ');
      console.error("Error to fetch: ", error);
    } finally {
      setIsFetching(false);
      setIsLoading(false);
    }
  };

  // @ts-ignore
  useContainerScroll(listContainerRef, fetchMeetings(currentRequest,false), isFetching);




  const handleSearch = (request: MeetingRequest) => {
    setPage(1);
    setHasMore(true);
    setCurrentRequest(request);
    setMeetingsList([]);
    fetchMeetings(request, true);
  };

  const handleLogout = () => {
    // 1. Wyczyść dane uwierzytelniające
    localStorage.removeItem('credentials');
    sessionStorage.removeItem('credentials');

    // 2. Wyczyść stan aplikacji
    setMeetingsData(null);
    setSelectedMeetingId(null);

    // 3. Przekieruj do strony logowania
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

  // const handleSearch = (request: MeetingRequest) => {
  //   fetchMeetings(request);
  // };

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



  if(!meetingsData) {
    return <div>Loading data ...</div>;
  }

  return (
    <div className="bg-[#f6f6f6] min-h-screen min-w-screen text-gray-900 overflow-hidden">
      <MeetingFilters
        visible = {filterVisibility}
        onClose={() => setFilterVisibility(false)}
        onSearch={handleSearch}
        initialParticipants={getUniqueParticipants(meetingsData.value.meetings)}
        onLogout={handleLogout}/>



      {/* Central part of the page */}
      <div className="text-center p-6">
        <h1 className="text-6xl font-normal text-blue-main">{meetingsData.value.total_cost.toFixed(2)} zł</h1>
        <p className="text-lg">CAŁKOWITY KOSZT WYBRANYCH SPOTKAŃ</p>
        <div
            style={{ backgroundImage: `url(${logo})` }}
            className="top-6 right-6 absolute object-cover w-[6em] h-[6em] rounded-2xl bg-size-[130%] box-border overflow-hidden bg-center bg-no-repeat ">
        </div>
      </div>
      <hr className="border-gray-300" />
      {!filterVisibility && (
        <div className="w-fit h-fit float-left p-0 pt-4">
          <button
        className="p-1 w-fit h-fit bg-blue-main rounded-[0.5em] items-center flex flex-row cursor-pointer"
        onClick={() => setFilterVisibility(true)}
          >
        <img src={arrowLeft} alt="arrowLeft" className="h-[1.3em] inline-block pr-1" />
        <img src={magnifier} alt="Magnifier" className="h-[2em] inline-block" />
          </button>
        </div>
      )}

      {/*List of meetings*/}
      <div className="grid grid-cols-4 gap-x-4 p-4 h-[80vh] max-h-[80vh]">
        <div className="h-full flex flex-col">



          {isLoading ? (
              <div className="white-shadow-bordered-div col-span-1 h-full flex items-center justify-center">
                <p>Loading meetings...</p>
              </div>
          ) : error ? (
              <div className="white-shadow-bordered-div col-span-1 h-full flex items-center justify-center text-red-500">
                <p>{error}</p>
              </div>
          ) : (
          <div className="white-shadow-bordered-div col-span-1 h-full">
            <div ref={listContainerRef} className="h-full max-h-[80vh] overflow-y-auto pr-2">
              <ul>
              <li className="text-[0.9em] font-bold text-blue-main mb-2">Znalezionych wyników: {filteredMeetings.length}</li>
              <hr className="gray-line mx-2" />
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
                {isFetching && (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                )}

                {!hasMore && !isFetching && (
                    <div className="text-center py-4 text-gray-500">
                      To już wszystkie spotkania
                    </div>
                )}
              </ul>
            </div>
          </div>
          )}
        </div>

        {/* Details of selected meeting */}
        {selectedMeeting && (
            <MeetingDetails meeting={selectedMeeting} />

        )}
      </div>
    </div>
  );
};
