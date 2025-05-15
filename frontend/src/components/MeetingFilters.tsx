import {MeetingRequest, Participant} from "../types/responseTypes.ts";
// @ts-ignore
import React, {useState} from "react";
import Slider from "rc-slider";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAngleDown, faSignOutAlt, faTimes} from "@fortawesome/free-solid-svg-icons";
import "../style.css";
interface MeetingFiltersProperties {
    visible: boolean;
    onClose: () => void;
    onSearch: (request: MeetingRequest) => void;
    onLogout: () => void;
    initialParticipants: Participant[];
}

export const MeetingFilters = ({visible,onClose,onSearch,initialParticipants,onLogout}: MeetingFiltersProperties) => {
    const [durationRange, setDurationRange] = useState<[number,number]>([0,300]);
    const [costRange, setCostRange] = useState<[number, number]>([0, 5000]);
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('');
    const [sortOption, setSortOption] = useState('Data (malejąco)');
    const [selectedParticipants, setSelectedParticipants] = useState<Participant[]>([]);
    const [availableParticipants, setAvailableParticipants] = useState<Participant[]>(
        Array.from(new Map(initialParticipants.map(p => [p.id, p])).values()).sort((a, b) => a.username.localeCompare(b.username)));
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const username = localStorage.getItem('username');
    const initLetter = username ? username.charAt(0).toUpperCase() : '';
    const handleSearch = () => {
        let sortField = 'name';
        let sortOrder = 'desc';

        switch (sortOption) {
            case 'Data (rosnąco)':
                sortField = 'start_datetime';
                sortOrder = 'asc';
                break;
            case 'Data (malejąco)':
                sortField = 'start_datetime';
                sortOrder = 'desc';
                break;
            case 'Koszt (malejąco)':
                sortField = 'cost';
                sortOrder = 'desc';
                break;
            case 'Koszt (rosnąco)':
                sortField = 'cost';
                sortOrder = 'asc';
                break;
            case 'Czas trwania (malejąco)':
                sortField = 'duration';
                sortOrder = 'desc';
                break;
            case 'Czas trwania (rosnąco)':
                sortField = 'duration';
                sortOrder = 'asc';
                break;
            case 'Nazwa (malejąco)':
                sortField = 'name';
                sortOrder = 'desc';
                break;
            case 'Nazwa (rosnąco)':
                sortField = 'name';
                sortOrder = 'asc';
                break;
        }

        // const startMin = startDate && startTime ? `${startDate}T${startTime}:00` : '';
        // const startMax = endDate && endTime ? `${endDate}T${endTime}:00` : '';

        const request: MeetingRequest = {
            per_page: 20,
            page: 1,
            name: searchTerm,
            duration_min: durationRange[0],
            duration_max: durationRange[1],
            cost_min: costRange[0],
            cost_max: costRange[1],
            // participants_ids: selectedParticipants.map(p => p.id),
            // start_min: startMin,
            // start_max: startMax,
            sort_by: {
                field: sortField,
                order: sortOrder
            }
        }
        onSearch(request);
    };

        const resetFilters = () => {
            setSearchTerm('');
            setStartDate('');
            setStartTime('');
            setEndDate('');
            setEndTime('');
            setDurationRange([0,300]);
            setCostRange([0,5000]);
            setSelectedParticipants([]);
            setSortOption('Data (malejąco)');

            onSearch({
                per_page: 20,
                page: 1
            });
        };

        const addParticipant = (participant: Participant) => {
            setSelectedParticipants([...selectedParticipants, participant]);
            setAvailableParticipants(availableParticipants.filter(p => p.id !== participant.id));
        };

        const removeParticipant = (participantId:number) => {
            const person = selectedParticipants.find(p => p.id === participantId);
            if (person) {
                setSelectedParticipants(selectedParticipants.filter(p => p.id !== participantId));
                setAvailableParticipants([...availableParticipants, person]);
            }
        };

        if(!visible) return null;

        // @ts-ignore
    // @ts-ignore
    // @ts-ignore
    return (
            <div
                className="w-1/6 min-h-screen bg-white float-left pt-4 rounded-r-2xl shadow p-4 border border-gray-200 flex flex-col gap-3"
                onDoubleClick={onClose}
            >
                <div className="flex justify-between items-center">
                    <h2 className="font-bold text-[1.5em] text-blue-900">WYSZUKAJ SPOTKANIA</h2>
                    <button
                        onClick={onClose}
                        className="md:hidden text-gray-500 hover:text-gray-700"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <input
                    type="text"
                    placeholder="Wpisz kod lub nazwę spotkania"
                    className="text-sm text-gray-600 text-center border border-gray-300 rounded-lg p-1 focus:outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                <div className="flex gap-2">
                    <label>Od:</label>
                    <input type="date" className="w-1/2 text-xs border border-gray-300 rounded-lg p-1"
                           value={startDate}
                           onChange={(e) => setStartDate(e.target.value)}
                    />
                    <input type="time" className="w-1/2 text-xs border border-gray-300 rounded-lg p-1"
                           value={startTime}
                           onChange={(e) => setStartTime(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <label>Do:</label>
                    <input type="date" className="w-1/2 text-xs border border-gray-300 rounded-lg p-1"
                           value={endDate}
                           onChange={(e) => setEndDate(e.target.value)}
                    />
                    <input type="time" className="w-1/2 text-xs border border-gray-300 rounded-lg p-1"
                           value={endTime}
                           onChange={(e) => setEndTime(e.target.value)}
                    />
                </div>

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
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value)}
                    >
                        <option>Nazwa (malejąco)</option>
                        <option>Nazwa (rosnąco)</option>
                        <option>Data (malejąco)</option>
                        <option>Data (rosnąco)</option>
                        <option>Koszt (malejąco)</option>
                        <option>Koszt (rosnąco)</option>
                        <option>Czas trwania (malejąco)</option>
                        <option>Czas trwania (rosnąco)</option>
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
                            className="align-middle items-center gap-2 text-sm text-gray-600 w-full pl-5 pt-3"
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                        >
                        <div className="bg-gray-900 text-white w-10 h-10 rounded-full float-left flex items-center justify-center text-2xl">{initLetter}</div>
                        <span className="float-left ml-2">
                <p className=" font-bold">{username}</p>
                <p className="text-gray-500 text-xs">Zalogowano</p>
              </span>
                    <FontAwesomeIcon icon={faAngleDown} className={`transition-transform ${userMenuOpen ? 'transform rotate-180' : ''}`}/>
                        {userMenuOpen && (
                            <div className="absolute bottom-full left-0 right-0 bg-white shadow-lg rounded-md p-2 mb-2 z-10">
                                <button className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center gap-2"
                                onClick={() => {
                                    setUserMenuOpen(false);
                                    onLogout();
                                }}
                                >
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

export default MeetingFilters;