import {Meeting} from "../types/responseTypes.ts";
import dolar from "../assets/dolar.png";
import people from "../assets/people.png";
import clock from "../assets/clock.png";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faCalendarDays,
    faClock,
    faEllipsisV,
    faLink,
    faLocationDot,
    faPlusCircle
} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import {formatDate, getTimeRange} from "../utils/formatFunctions.ts";

interface MeetingDetailsProperties {
    meeting: Meeting;
}

export const MeetingDetails = ({meeting}: MeetingDetailsProperties) => {
    const owner = meeting.participants.find(p => p.is_owner);

    return(
        <div className="col-span-3 grid grid-cols-3 auto-rows-min gap-y-4 gap-x-4 white-shadow-bordered-div h-full items-start ">
            <div className="col-span-3 h-fit" >
                <p className="text-[1.2em] font-bold text-blue-main">{meeting.title}</p>
                <hr className="gray-line h-0 mt-2" />
            </div>

            {/* Upper Section */}
            <div className="col-span-3 grid grid-cols-3 gap-x-4 text-center h-fit">
                <div className="white-shadow-bordered-div little-grid-box">
                    <img src={dolar} alt="Dolar" className="icon-positioning" />
                    <p className="text-xl font-bold text-custom-teal">{meeting.cost.toFixed(2)} zł</p>
                    <p className="text-lg">Koszt</p>
                </div>
                <div className="white-shadow-bordered-div little-grid-box">
                    <img src={people} alt="Dolar" className="icon-positioning" />
                    <p className="text-xl font-bold">{meeting.participants.length}</p>
                    <p className="text-lg">Uczestnicy</p>
                </div>
                <div className="white-shadow-bordered-div little-grid-box">
                    <img src={clock} alt="Dolar" className="icon-positioning" />
                    <p className="text-xl font-bold">{meeting.duration} min</p>
                    <p className="text-lg">Czas</p>
                </div>
            </div>

            {/* Details Section */}
            <hr className="gray-line mx-2 h-0 col-span-3 flex flex-col" />
            <div className="white-shadow-bordered-div h-[52vh]">
                <h2 className="text-lg font-semibold mb-2 text-blue-main">Szczegóły spotkania</h2>
                <hr className="gray-line my-3" />
                <div className="flex flex-col gap-y-3 overflow-y-auto">
                    <p><FontAwesomeIcon icon={faLink} />&nbsp;&nbsp;<strong> Kod:</strong> <span className="inline float-end">{meeting.token}</span></p>
                    <hr className="gray-line" />
                    <p><FontAwesomeIcon icon={faCalendarDays} />&nbsp;&nbsp;<strong> Data:</strong> <span className="inline float-end">{formatDate(meeting.date)}</span></p>
                    <p><FontAwesomeIcon icon={faClock} />&nbsp;&nbsp;<strong> Czas:</strong> <span className="inline float-end">{getTimeRange(meeting.date, meeting.duration)}</span></p>
                    <p><FontAwesomeIcon icon={faLocationDot} />&nbsp;&nbsp;<strong> Miejsce:</strong> <span className="inline float-end">{meeting.room_name}</span></p>
                </div>
                <hr className="gray-line my-2" />
                <p className="mt-2 text-sm text-gray-600">
                    {meeting.description}
                </p>
            </div>
            {/* Participants section */}
            <div className="white-shadow-bordered-div h-[52vh] flex flex-col">
                <h2 className="text-lg font-semibold mb-2 text-blue-main">Uczestnicy</h2>
                <hr className="gray-line mx-2" />
                <div className="overflow-y-auto">
                    <ul className="space-y-1">
                        {owner && (
                        <li className="flex flex-row justify-between ">
                            <div className="flex flex-row items-left gap-2">
                                <div className="bg-gray-900 text-white h-[2em] aspect-square rounded-full float-left flex items-center justify-center text-2xl">{owner.username.charAt(0).toUpperCase()}</div>
                                <span><b>{owner.username}</b><p className="text-sm text-gray-500">{owner.role_name}</p></span>
                            </div>
                            <span className="text-custom-teal">{owner.hourly_cost}</span>
                        </li>
                        )}
                        <hr className="gray-line mx-2" />

                        {meeting.participants.filter(p => !p.is_owner).map((participant) => (
                            <li key ={participant.id} className="flex flex-row justify-between ">
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
                        {meeting.additional_costs.map((cost) => (
                            <li key={cost.id} className="flex justify-between">{cost.name} <span className="text-custom-teal">{cost.cost.toFixed(2)} zł<FontAwesomeIcon icon={faEllipsisV} className="text-black pl-4 cursor-pointer" onClick={()=>void 0}/></span></li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    )};

export default MeetingDetails;