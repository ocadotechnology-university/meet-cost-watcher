import {DateTimeState, Meeting, MeetingRequest, Participant} from "../types/responseTypes.ts";

import { useState} from "react";
import Slider from "rc-slider";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleDown, faSignOutAlt} from "@fortawesome/free-solid-svg-icons";
import "../style.css";
import {toISODateTime} from "../utils/formatFunctions.ts";
interface MeetingFiltersProperties {
    onSearch: (request: MeetingRequest) => void;
    onLogout: () => void;
    initialParticipants: Participant[];
    filterRequest:MeetingRequest;
}

export const MeetingFilters = ({onSearch,initialParticipants,onLogout,filterRequest}: MeetingFiltersProperties) => {

    const todayDate = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(todayDate.getDate() - 30);

    const defaultStartDate = thirtyDaysAgo.toISOString().split('T')[0];
    const defaultEndDate = todayDate.toISOString().split('T')[0];
    const defaultTime = todayDate.toTimeString().substring(0, 5);


    const [filterData, setFilterData] = useState<MeetingRequest>(filterRequest || {
        per_page: 20,
        page: 1,
        name:'',
        duration_min: 0,
        duration_max: 300,
        cost_min:0,
        cost_max: 5000,
        participant_ids:[],
        start_min: toISODateTime(defaultStartDate, '00:00'),
        start_max: toISODateTime(defaultEndDate,defaultTime),
        sort_by: {
            field: 'start_datetime',
            order: 'desc'
        }
    });

    const [selectedParticipants, setSelectedParticipants] = useState<Participant[]>(() =>
        filterRequest.participant_ids
            ? initialParticipants.filter(p => filterRequest.participant_ids?.includes(p.id))
            : []
    );

    const [availableParticipants, setAvailableParticipants] = useState<Participant[]>(() => {
        const selectedIds = new Set(filterRequest.participant_ids ?? []);
        return initialParticipants
            .filter(p => !selectedIds.has(p.id))
            .sort((a, b) => a.username.localeCompare(b.username));
    });

    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const username = localStorage.getItem('username');
    const initLetter = username ? username.charAt(0).toUpperCase() : '';

    const [startDateTime, setStartDateTime] = useState<DateTimeState>({
        date: filterRequest.start_min?.split('T')[0] || defaultStartDate,
        time: filterRequest.start_min?.split('T')[1] || '00:00'
    });
    const [endDateTime, setEndDateTime] = useState<DateTimeState>({
        date: filterRequest.start_max?.split('T')[0] || defaultEndDate,
        time: filterRequest.start_max?.split('T')[1] || defaultTime
    });


    const updateParticipantsInFilter = (participants: Participant[]) => {
        setFilterData({
            ...filterData,
            participant_ids: participants.length > 0 ? participants.map(p => p.id) : null
        });
    };

    const addParticipant = (participant: Participant) => {
        const newSelected = [...selectedParticipants, participant];
        setSelectedParticipants(newSelected);
        setAvailableParticipants(availableParticipants.filter(p => p.id !== participant.id));
        updateParticipantsInFilter(newSelected);
    };

    const removeParticipant = (participantId:number) => {
        const person = selectedParticipants.find(p => p.id === participantId);
        if (person) {
            const newSelected = selectedParticipants.filter(p => p.id !== participantId);
            setSelectedParticipants(newSelected);
            setAvailableParticipants([...availableParticipants, person]
                .sort((a, b) => a.username.localeCompare(b.username)));
            updateParticipantsInFilter(newSelected);
        }
    };

    const handleSearch = () => {
        const updatedData = {
            ...filterData,
            start_min: toISODateTime(startDateTime.date, startDateTime.time),
            start_max: toISODateTime(endDateTime.date, endDateTime.time),
            page: 1
        };
        onSearch(updatedData);
    };


    const resetFilters = () => {
        setAvailableParticipants([
            ...availableParticipants,
            ...selectedParticipants
        ].sort((a, b) => a.username.localeCompare(b.username)));

        setSelectedParticipants([]);

        setFilterData({
            ...filterData,
            name: '',
            duration_min: 0,
            duration_max: 300,
            cost_min: 0,
            cost_max: 5000,
            participant_ids: null,
            start_min: toISODateTime(defaultStartDate, '00:00'),
            start_max: toISODateTime(defaultEndDate, defaultTime),
            sort_by: {
                field: 'start_datetime',
                order: 'desc'
            }
        });

        onSearch({
            per_page: 20,
            page: 1,
            start_min: toISODateTime(defaultStartDate, '00:00'),
            start_max: toISODateTime(defaultEndDate, defaultTime),
            sort_by: {
                field: 'start_datetime',
                order: 'desc'
            }
        });
    }

    return (
            <div
                className="w-1/6 min-h-screen bg-white float-left pt-4 rounded-r-2xl shadow p-4 border border-gray-200 flex flex-col gap-3"
            >
                <div className="flex justify-center items-center">
                    <h2 className="font-bold text-[1.5em] text-blue-900">WYSZUKAJ SPOTKANIA</h2>
                </div>

                <input
                    type="text"
                    placeholder="Wpisz kod lub nazwę spotkania"
                    className="text-sm text-gray-600 text-center border border-gray-300 rounded-lg p-1 focus:outline-none"
                    value={filterData.name|| ''}
                    onChange={(e) => setFilterData({...filterData,name: e.target.value})}
                />

                <div className="flex gap-2">
                    <label>Od:</label>
                    <input type="date" className="w-1/2 text-xs border border-gray-300 rounded-lg p-1"
                           value={startDateTime.date}
                           onChange={(e) => setStartDateTime(prev => ({ ...prev, date: e.target.value }))}
                    />
                    <input type="time" className="w-1/2 text-xs border border-gray-300 rounded-lg p-1"
                           value={startDateTime.time.substring(0,5)}
                           onChange={(e) => setStartDateTime(prev => ({ ...prev, time: e.target.value }))}
                    />
                </div>
                <div className="flex gap-2">
                    <label>Do:</label>
                    <input type="date" className="w-1/2 text-xs border border-gray-300 rounded-lg p-1"
                           value={endDateTime.date}
                           onChange={(e) => setEndDateTime(prev => ({ ...prev, date: e.target.value }))}
                    />
                    <input type="time" className="w-1/2 text-xs border border-gray-300 rounded-lg p-1"
                           value={endDateTime.time.substring(0,5)}
                           onChange={(e) => setEndDateTime(prev => ({ ...prev, time: e.target.value }))}
                    />
                </div>

                <div>
                    <label className="text-sm text-gray-700">Czas trwania
                        <span className="float-end">{` ${filterData.duration_min|| 0}-${filterData.duration_max|| 300} min`}</span>
                    </label>
                    <Slider
                        range
                        min={0}
                        max={300}
                        value={[filterData.duration_min || 0, filterData.duration_max || 300]}
                        onChange={(value: number | number[]) => {
                            const [min,max] = value as [number,number];
                            setFilterData({
                                ...filterData,
                                duration_min:min,
                                duration_max:max
                            })
                        }}
                    />
                </div>

                <div>
                    <label className="text-sm text-gray-700">Koszt spotkania
                        <span className="float-end">{`${filterData.cost_min || 0}-${filterData.cost_max || 5000} zł`}</span>
                    </label>
                    <Slider
                        range
                        min={0}
                        max={5000}
                        value={[filterData.cost_min || 0, filterData.cost_max || 5000]}
                        onChange={(value: number | number[]) => {
                            const [min,max] = value as [number,number];
                            setFilterData({
                                ...filterData,
                                cost_min:min,
                                cost_max:max
                            })
                        }}
                    />
                </div>
                <div>
                    <label className="text-sm text-gray-700">Osoby</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {selectedParticipants.map(participant => (
                            <span
                                key={participant.id}
                                className="bg-purple-400 text-white rounded px-2 py-1 text-sm flex items-center"
                            >
                                {participant.username}

                                <button
                                    onClick={() => removeParticipant(participant.id)}
                                    className="ml-1 hover:text-purple-200"
                                >
                                ×
                                </button>
                            </span>
                        ))}
                    </div>
                    {availableParticipants.length && (
                        <select
                            className="w-full text-sm border border-gray-300 rounded-lg p-1"
                            onChange={(e) => {
                                const participant = availableParticipants.find(p => p.id === parseInt(e.target.value));
                                if (participant)
                                    addParticipant(participant);
                            }}
                        >
                            <option value="">Dodaj uczestnika...</option>
                            {availableParticipants.map(participant => (
                                <option key={participant.id} value={participant.id}>
                                    {participant.username} ({participant.role_name})
                                </option>
                            ))}
                        </select>
                    )}
                </div>
                <div>
                    <label className="text-sm text-gray-700 mt-2">Sortowanie</label>
                    <select className="text-sm border border-gray-300 rounded-lg p-1 w-full"
                            value={`${filterData.sort_by?.field}|${filterData.sort_by?.order}`}
                            onChange={(e) => {
                                const [field, order] = e.target.value.split('|');
                                setFilterData({
                                    ...filterData,
                                    sort_by: {
                                        field: field as keyof Meeting,
                                        order: order as 'asc' | 'desc'
                                    }
                                });
                            }}
                    >
                        <option value="start_datetime|desc">Data (malejąco)</option>
                        <option value="start_datetime|asc">Data (rosnąco)</option>
                        <option value="name|desc">Nazwa (malejąco)</option>
                        <option value="name|asc">Nazwa (rosnąco)</option>
                        <option value="cost|desc">Koszt (malejąco)</option>
                        <option value="cost|asc">Koszt (rosnąco)</option>
                        <option value="duration|desc">Czas trwania (malejąco)</option>
                        <option value="duration|asc">Czas trwania (rosnąco)</option>
                    </select>
                </div>

                <div className="flex gap-2">
                    <button
                        className="flex-1 bg-blue-800 text-white rounded-md p-2 text-sm hover:bg-blue-900 transition-colors"
                        onClick={handleSearch}
                    >
                        Szukaj
                    </button>
                    <button
                        className="flex-1 bg-gray-300 text-gray-800 rounded-md p-2 text-sm hover:bg-gray-400 transition-colors"
                        onClick={resetFilters}
                    >
                        Resetuj
                    </button>
                </div>

                <div className="absolute p-0 m-0 left-0 bottom-6 align-middle w-1/6">
                    <hr className="gray-line" />
                    {/*<div className=" align-middle gap-2 text-sm text-gray-600 w-full pl-5 pt-3">*/}
                        <div
                            className="align-middle items-center gap-2 text-sm text-gray-600 w-full pl-5 pt-3 cursor-pointer"
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                        >
                            <div className="flex justify-center">
                                <div className="bg-gray-900 text-white w-10 h-10 rounded-full float-left flex items-center justify-center text-2xl">{initLetter}</div>
                                    <span className="float-left ml-2">
                                        <p className=" font-bold">{username}</p>
                                        <p className="text-gray-500 text-xs">Zalogowano</p>
                                    </span>
                                <FontAwesomeIcon icon={faAngleDown} className={`p-2 text-2xl transition-transform ${userMenuOpen ? 'transform rotate-180' : ''}`}/>
                            </div>
                        {userMenuOpen && (
                            <div className="absolute bottom-full left-0 right-0 bg-blue-100 shadow-lg rounded-md p-2 mb-2 z-10">
                                <button className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center gap-2"
                                onClick={() => {
                                    setUserMenuOpen(false);
                                    onLogout();
                                }} >
                                    <FontAwesomeIcon icon={faSignOutAlt}/>
                                    Wyloguj się
                                </button>
                            </div>
                            )}
                    </div>
                </div>
            </div>
        )
};
