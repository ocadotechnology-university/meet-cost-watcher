import React, {useEffect, useMemo, useState} from "react";
import { useLocation } from "react-router-dom";
import clock from './assets/clock.png'
import people from './assets/people.png'
import dolar from './assets/dolar.png'
import magnifier from './assets/magnifier.png'
import logo from './assets/logo.png'
import arrowLeft from './assets/arrowLeft.png'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLink, faCalendarDays, faClock, faLocationDot, faEllipsisV, faPlusCircle, faPlus, faAngleDown } from "@fortawesome/free-solid-svg-icons";
import "./style.css";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import {MeetingResponse} from "./types/responseTypes.ts";

export default function MultipleMeetingsPage(){
  const [filterVisibility, setFilterVisibility] = useState(false);
  const [durationRange, setDurationRange] = useState<[number, number]>([0, 300]);
  const [costRange, setCostRange] = useState<[number, number]>([0, 5000]);
  const [selectedMeetingId, setSelectedMeetingId] = useState<number|null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const responseData = location.state as MeetingResponse;

  {/* Function handling meeting selection on list - gets id of chosen meeting and sets state */}
  const handleMeetingSelection = (id: number) => {
    setSelectedMeetingId(id === selectedMeetingId ? null : id);
  }

  {/* Function that handles filtering by name or by token dynamically */}
  const filteredMeetings = useMemo(() => {
    return responseData.meetings.filter( meeting =>
    meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    meeting.token.toLowerCase().includes(searchTerm.toLowerCase())
    );

  }, [responseData.meetings,searchTerm]);

  {/* Function that calculates sum of filtered meetings */}
  const totalCost = useMemo(() => {
    return filteredMeetings.reduce((sum, meeting) => sum + meeting.cost, 0);
  }, [filteredMeetings]);

  {/* Function that finds currently selected meeting - works with filtering */}
  const selectedMeeting = useMemo(() => {
    return filteredMeetings.find(m => m.id === selectedMeetingId) ||
        filteredMeetings[0] || null;
  }, [filteredMeetings, selectedMeetingId]);

  {/* Sets first meeting on list by deafault */}
  useEffect(() => {
    if (filteredMeetings.length > 0 && !selectedMeetingId) {
      setSelectedMeetingId(filteredMeetings[0].id);
    }
  }, [filteredMeetings,selectedMeetingId]);


  {/* Function for formating time duration of the meeting */}
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins}min`;
  };

  {/* Function for formating date of the meeting */}
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };
    return new Date(dateString).toLocaleString('pl-PL', options);
  };
  {/* Function for formating time of the meeting */}
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };
  {/* Function for calculating start and end time of the meeting */}
  const getTimeRange = (startDate: string, durationMinutes: number) => {
    const start = new Date(startDate);
    const end = new Date(start.getTime() + durationMinutes * 60000);
    return `${formatTime(start)} - ${formatTime(end)}`;
  };

  return (
    <div className="bg-[#f6f6f6] min-h-screen min-w-screen text-gray-900 overflow-hidden">
      {filterVisibility && (
        <div 
          className="w-1/6 min-h-screen bg-white float-left pt-4 rounded-r-2xl shadow p-4 border border-gray-200 flex flex-col gap-3"
          onDoubleClick={() => setFilterVisibility(false)}
          // onMouseLeave={() => setFilterVisibility(false)}
        >
          <h2 className="text-center font-bold text-[1.5em] text-blue-900">WYSZUKAJ SPOTKANIA</h2>

          <input 
            type="text" 
            placeholder="Wpisz kod lub nazwę spotkania" 
            className="text-sm text-gray-600 text-center border border-gray-300 rounded-lg p-1 focus:outline-none"
          />
        
          <div className="flex gap-2">
            <label>od:</label>
            <input type="date" className="w-1/2 text-xs border border-gray-300 rounded-lg p-1" />
            <input type="time" className="w-1/2 text-xs border border-gray-300 rounded-lg p-1" />
          </div>
          <div className="flex gap-2">
            <label>od:</label>
            <input type="date" className="w-1/2 text-xs border border-gray-300 rounded-lg p-1" />
            <input type="time" className="w-1/2 text-xs border border-gray-300 rounded-lg p-1" />
          </div>
        
          {/* Suwak dla czasu trwania */}
          <div>
            <label className="text-sm text-gray-700">Czas trwania 
              <span className="float-end">{` ${durationRange[0]}-${durationRange[1]} min`}</span>
            </label>
            <Slider
              range
              min={0}
              max={300}
              value={durationRange}
              onChange={(value: number[]) => setDurationRange(value as [number, number])}
            />
          </div>

          {/* Suwak dla kosztu spotkania */}
          <div>
            <label className="text-sm text-gray-700">Koszt spotkania
              <span className="float-end">{`${costRange[0]}-${costRange[1]} zł`}</span>
            </label>
            <Slider
              range
              min={0}
              max={5000}
              value={costRange}
              onChange={(value: number[]) => setCostRange(value as [number, number])}
            />
          </div>
        
          <label className="text-sm text-gray-700">Osoby</label>
          <div className="">
            <span className="bg-purple-400 text-white self-center rounded px-2 py-1 mr-2 text-sm">Osoba 1 ×</span>
            <span className="bg-purple-400 text-white self-center rounded px-2 py-1 mr-2 text-sm">Osoba 2 ×</span>
            <button className="float-end w-[2em] h-[2em] rounded-full bg-blue-700 text-white flex items-center justify-center text-sm"><FontAwesomeIcon icon={faPlus}/></button>
        </div>
      
        <label className="text-sm text-gray-700 mt-2">Sortowanie</label>
        <select className="text-sm border border-gray-300 rounded-lg p-1 w-full">
          <option>Data (malejąco)</option>
          <option>Data (rosnąco)</option>
          <option>Koszt (malejąco)</option>
          <option>Koszt (rosnąco)</option>
        </select>
      
        <button className="mt-2 bg-blue-800 text-white rounded-md p-2 text-sm">Szukaj</button>
      
        <div className="absolute p-0 m-0 left-0 bottom-6 w-1/6">
          <hr className="gray-line" />
          <div className=" align-middle gap-2 text-sm text-gray-600 w-full pl-5 pt-3">
            <div className="bg-gray-900 text-white w-10 h-10 rounded-full float-left flex items-center justify-center text-2xl">JN</div>
              <span className="float-left ml-2">
                <p className=" font-bold">Janusz Nowak</p>
                <p className="text-gray-500 text-xs">Zalogowano</p>
              </span>
              <FontAwesomeIcon icon={faAngleDown} className="float-right mr-5 mt-3"/>
            </div>
        </div>
      </div>
      
      )}

      {/* Central part of the page */}
      <div className="text-center p-6">
        <h1 className="text-6xl font-normal text-blue-main">{totalCost.toFixed(2)} zł</h1>
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

          {/*Filter Input*/}
          <input
            type="text"
            placeholder="Wpisz kod lub nazwę spotkania"
            className="mb-4 w-full bg-white rounded-xl shadow border-1 border-gray-200 text-[1em] text-center p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-fit"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="white-shadow-bordered-div col-span-1 h-full">
            <div className="h-full max-h-[80vh] overflow-y-auto pr-2">
              <ul>
              <li className="text-[0.9em] font-bold text-blue-main mb-2">Znalezionych wyników: {filteredMeetings.length}</li>
              <hr className="gray-line mx-2" />

                {/* List Section */}
                {filteredMeetings.map((m) => (
            <React.Fragment key={m.id}>
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
              </ul>
            </div>
          </div>
        </div>

        {/* Details of selected meeting */}
        {selectedMeeting && (
        <div className="col-span-3 grid grid-cols-3 auto-rows-min gap-y-4 gap-x-4 white-shadow-bordered-div h-full items-start ">
          <div className="col-span-3 h-fit" >
            <p className="text-[1.2em] font-bold text-blue-main">{selectedMeeting.title}</p>
            <hr className="gray-line h-0 mt-2" />
          </div>

          {/* Upper Section */}
          <div className="col-span-3 grid grid-cols-3 gap-x-4 text-center h-fit">
            <div className="white-shadow-bordered-div little-grid-box">
              <img src={dolar} alt="Dolar" className="icon-positioning" />
              <p className="text-xl font-bold text-custom-teal">{selectedMeeting.cost.toFixed(2)} zł</p>
              <p className="text-lg">Koszt</p>
            </div>
            <div className="white-shadow-bordered-div little-grid-box">
              <img src={people} alt="Dolar" className="icon-positioning" />
              <p className="text-xl font-bold">{selectedMeeting.participants.length}</p>
              <p className="text-lg">Uczestnicy</p>
            </div>
            <div className="white-shadow-bordered-div little-grid-box">
              <img src={clock} alt="Dolar" className="icon-positioning" />
              <p className="text-xl font-bold">{selectedMeeting.duration} min</p>
              <p className="text-lg">Czas</p>
            </div>
          </div>

          {/* Details Section */}
          <hr className="gray-line mx-2 h-0 col-span-3 flex flex-col" />
          <div className="white-shadow-bordered-div h-[52vh]">
            <h2 className="text-lg font-semibold mb-2 text-blue-main">Szczegóły spotkania</h2>
            <hr className="gray-line my-3" />        
            <div className="flex flex-col gap-y-3 overflow-y-auto">
            <p><FontAwesomeIcon icon={faLink} />&nbsp;&nbsp;<strong> Kod:</strong> <span className="inline float-end">{selectedMeeting.token}</span></p>
            <hr className="gray-line" />
            <p><FontAwesomeIcon icon={faCalendarDays} />&nbsp;&nbsp;<strong> Data:</strong> <span className="inline float-end">{formatDate(selectedMeeting.date)}</span></p>
            <p><FontAwesomeIcon icon={faClock} />&nbsp;&nbsp;<strong> Czas:</strong> <span className="inline float-end">{getTimeRange(selectedMeeting.date, selectedMeeting.duration)}</span></p>
            <p><FontAwesomeIcon icon={faLocationDot} />&nbsp;&nbsp;<strong> Miejsce:</strong> <span className="inline float-end">{selectedMeeting.room_name}</span></p>
            </div>
            <hr className="gray-line my-2" />

            {/*TODO Ask backend for description from database - no data provided*/}

            <p className="mt-2 text-sm text-gray-600">
              Spotkanie projektowe ze studentami w celu dopracowania UI do perfekcji
            </p>
          </div>

          {/* Participants section */}
          <div className="white-shadow-bordered-div h-[52vh] flex flex-col">
            <h2 className="text-lg font-semibold mb-2 text-blue-main">Uczestnicy</h2>
            <hr className="gray-line mx-2" />
            <div className="overflow-y-auto">
              <ul className="space-y-1">
                <li className="flex flex-row justify-between ">
                  <div className="flex flex-row items-left gap-2">
                  <div className="bg-gray-900 text-white h-[2em] aspect-square rounded-full float-left flex items-center justify-center text-2xl">K</div>

                    {/* TODO: Ask backend for Meeting Owner - no data for now*/}

                    <span><b>Janina Kowalska</b><p className="text-sm text-gray-500">Senior Dev</p></span>
                  </div>
                  <span className="text-custom-teal">50 zł/h</span>
                </li>
                <hr className="gray-line mx-2" />
                {selectedMeeting.participants.map((participant, idx) => (
                  <li key={idx} className="flex flex-row justify-between ">
                  <div className="flex flex-row items-left gap-2">
                  <div className="bg-gray-900 text-white h-[2em] aspect-square rounded-full float-left flex items-center justify-center text-2xl">{participant.username.charAt(0).toUpperCase()}</div>
                    <span><b>{participant.username}</b><p className="text-sm text-gray-500">{participant.role_name}</p></span>
                  </div>
                  <span className="text-custom-teal">{participant.hourly_cost.toFixed(2)} zł/h</span>
                </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Additional Cost Section */}
          <div className="white-shadow-bordered-div h-[52vh] flex flex-col">
            <h2 className="text-lg font-semibold mb-2 text-blue-main">Dodatkowe koszty
            <FontAwesomeIcon icon={faPlusCircle} className="float-end text-white bg-black border-black border-2 rounded-full ml-4 cursor-pointer" onClick={()=>void 0}/>
            </h2>
            <hr className="gray-line mx-2" />
            <div className="overflow-y-auto">
              <ul className="space-y-3 pt-3">
                {selectedMeeting.additional_costs.map((cost,id) => (
                  <li key={id} className="flex justify-between">{cost.name} <span className="text-custom-teal">{cost.cost.toFixed(2)} zł<FontAwesomeIcon icon={faEllipsisV} className="text-black pl-4 cursor-pointer" onClick={()=>void 0}/></span></li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};
