import {AdditionalCost, Meeting} from "../types/responseTypes.ts";
import dolar from "../assets/dolar.png";
import people from "../assets/people.png";
import clock from "../assets/clock.png";
import info from "../assets/info.png";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faCalendarDays,
    faClock, faEllipsisV,
    faLink,
    faLocationDot,
    faPlusCircle,
} from "@fortawesome/free-solid-svg-icons";

import React, {useState} from "react";
import {formatDate, getTimeRange} from "../utils/formatFunctions.ts";
import {EditCostModal} from "./AdditionalCostsModal.tsx";


type MeetingDetailsProperties = {
    meeting:Meeting;
    onNewCost:(meetingId: number, name: string, cost: number) => Promise<void>;
    onEditCost:(name: string, cost: number, id?: number) => Promise<void>;
    onDeleteCost:(id:number) => Promise<void>;
    refreshMeeting:() => void;
    isMobile?: boolean;
};

export const MeetingDetails: React.FC<MeetingDetailsProperties> = ({ meeting, onNewCost,onEditCost,onDeleteCost,refreshMeeting,isMobile = false }) => {
    const [editingCost, setEditingCost] = useState<AdditionalCost | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<"costs" | "participants" | "details">("details");

    const handleNewCost = async (name:string, cost:number) => {
        await onNewCost(meeting.id,name,cost);
        await refreshMeeting();
        setEditingCost(null);
        setIsAddModalOpen(false);
    }

    const handleEditCost = async (name:string, cost:number ,id?: number) => {
            await onEditCost(name,cost,id);
            await refreshMeeting();
            setEditingCost(null);
            setIsAddModalOpen(false);
    };

    const handleDeleteCost = async (costId: number) => {
            await onDeleteCost(costId);
            await refreshMeeting();
            setEditingCost(null);
            setIsAddModalOpen(false);
    };

    const owner = meeting.participants.find(p => p.is_owner);
    const canEdit = true;
    // return(
    //     <div className="col-span-3 grid grid-cols-3 auto-rows-min gap-y-4 gap-x-4 white-shadow-bordered-div h-full items-start ">
    //         <div className="col-span-3 h-fit" >
    //             <p className="text-[1.2em] font-bold text-blue-main">{meeting.title}</p>
    //             <hr className="gray-line h-0 mt-2" />
    //         </div>
    //
    //         {/* Upper Section */}
    //         <div className="col-span-3 grid grid-cols-3 gap-x-4 text-center h-fit">
    //             <div className="white-shadow-bordered-div little-grid-box">
    //                 <img src={dolar} alt="Dolar" className="icon-positioning" />
    //                 <p className="text-xl font-bold text-custom-teal">{meeting.cost.toFixed(2)} zł</p>
    //                 <p className="text-lg">Koszt</p>
    //             </div>
    //             <div className="white-shadow-bordered-div little-grid-box">
    //                 <img src={people} alt="Dolar" className="icon-positioning" />
    //                 <p className="text-xl font-bold">{meeting.participants.length}</p>
    //                 <p className="text-lg">Uczestnicy</p>
    //             </div>
    //             <div className="white-shadow-bordered-div little-grid-box">
    //                 <img src={clock} alt="Dolar" className="icon-positioning" />
    //                 <p className="text-xl font-bold">{meeting.duration} min</p>
    //                 <p className="text-lg">Czas</p>
    //             </div>
    //         </div>
    //
    //         {/* Details Section */}
    //         <hr className="gray-line mx-2 h-0 col-span-3 flex flex-col" />
    //         <div className="white-shadow-bordered-div h-[52vh]">
    //             <h2 className="text-lg font-semibold mb-2 text-blue-main">Szczegóły spotkania</h2>
    //             <hr className="gray-line my-3" />
    //             <div className="flex flex-col gap-y-3 overflow-y-auto">
    //                 <p><FontAwesomeIcon icon={faLink} />&nbsp;&nbsp;<strong> Kod:</strong> <span className="inline float-end">{meeting.token}</span></p>
    //                 <hr className="gray-line" />
    //                 <p><FontAwesomeIcon icon={faCalendarDays} />&nbsp;&nbsp;<strong> Data:</strong> <span className="inline float-end">{formatDate(meeting.date)}</span></p>
    //                 <p><FontAwesomeIcon icon={faClock} />&nbsp;&nbsp;<strong> Czas:</strong> <span className="inline float-end">{getTimeRange(meeting.date, meeting.duration)}</span></p>
    //                 <p><FontAwesomeIcon icon={faLocationDot} />&nbsp;&nbsp;<strong> Miejsce:</strong> <span className="inline float-end">{meeting.room_name}</span></p>
    //             </div>
    //             <hr className="gray-line my-2" />
    //             <p className="mt-2 text-sm text-gray-600">
    //                 {meeting.description}
    //             </p>
    //         </div>
    //         {/* Participants section */}
    //         <div className="white-shadow-bordered-div h-[52vh] flex flex-col">
    //             <h2 className="text-lg font-semibold mb-2 text-blue-main">Uczestnicy</h2>
    //             <hr className="gray-line mx-2" />
    //             <div className="overflow-y-auto">
    //                 <ul className="space-y-1">
    //                     {owner && (
    //                     <li className="flex flex-row justify-between ">
    //                         <div className="flex flex-row items-left gap-2">
    //                             <div className="bg-gray-900 text-white h-[2em] aspect-square rounded-full float-left flex items-center justify-center text-2xl">{owner.username.charAt(0).toUpperCase()}</div>
    //                             <span><b>{owner.username}</b><p className="text-sm text-gray-500">{owner.role_name}</p></span>
    //                         </div>
    //                         <span className="text-custom-teal">{owner.hourly_cost.toFixed(2)} zł/h</span>
    //                     </li>
    //                     )}
    //                     <hr className="gray-line mx-2" />
    //
    //                     {meeting.participants.filter(p => !p.is_owner).map((participant) => (
    //                         <li key ={participant.id} className="flex flex-row justify-between ">
    //                             <div className="flex flex-row items-left gap-2">
    //                                 <div className="bg-gray-900 text-white h-[2em] aspect-square rounded-full float-left flex items-center justify-center text-2xl">{participant.username.charAt(0).toUpperCase()}</div>
    //                                 <span><b>{participant.username}</b><p className="text-sm text-gray-500">{participant.role_name}</p></span>
    //                             </div>
    //                             <span className="text-custom-teal">{participant.hourly_cost.toFixed(2)} zł/h</span>
    //                         </li>
    //                     ))}
    //                 </ul>
    //             </div>
    //         </div>
    //
    //         {/* Additional Cost Section */}
    //         <div className="white-shadow-bordered-div h-[52vh] flex flex-col">
    //             <h2 className="text-lg font-semibold mb-2 text-blue-main">Dodatkowe koszty
    //                 {canEdit && (
    //                     <button
    //                         onClick={() => {
    //                             setEditingCost(null);
    //                             setIsAddModalOpen(true);
    //                         }}
    //                         className="float-end text-white bg-blue-500 border-blue-500 border-2 rounded-full ml-4 cursor-pointer w-6 h-6 flex items-center justify-center"
    //                     >
    //                         <FontAwesomeIcon icon={faPlusCircle} className=" text-white bg-black border-black border-2 rounded-full  cursor-pointer" />
    //                     </button>
    //                 )}
    //             </h2>
    //             <hr className="gray-line mx-2" />
    //             <div className="overflow-y-auto">
    //                 <ul className="space-y-3 pt-3">
    //                     {meeting.additional_costs.map((cost) => (
    //                         <li key={cost.id} className="flex justify-between">{cost.name}
    //                             <span className="text-custom-teal">
    //                                 {cost.cost.toFixed(2)} zł
    //                                 <FontAwesomeIcon icon={faEllipsisV} className="text-black align-right pl-4 cursor-pointer" onClick={() => setEditingCost(cost)}/>
    //                             </span>
    //                         </li>
    //                     ))}
    //                     {!meeting.additional_costs.length && (
    //                         <li className="text-center text-gray-500 py-4">
    //                             Brak dodatkowych kosztów
    //                         </li>
    //                     )}
    //                 </ul>
    //             </div>
    //         </div>
    //         {isAddModalOpen && (
    //             <EditCostModal
    //                 onSave={handleNewCost}
    //                 onClose={() => setIsAddModalOpen(false)}
    //                 canEdit={canEdit}
    //             />
    //         )}
    //         {editingCost && (
    //             <EditCostModal
    //                 cost={editingCost}
    //                 onSave={handleEditCost}
    //                 onClose={() => setEditingCost(null)}
    //                 onDelete={() => handleDeleteCost(editingCost.id)}
    //                 canEdit={canEdit}
    //             />
    //         )}
    //     </div>
    // );

    if (isMobile) {
        return (
            <div className="flex flex-col gap-4 p-4">
                {/*/!* Header *!/*/}
                {/*<div>*/}
                {/*    <h1 className="text-2xl font-bold text-blue-main">{meeting.title}</h1>*/}
                {/*    <p className="text-sm text-gray-500">{meeting.token}</p>*/}
                {/*</div>*/}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                    <button
                        onClick={() => setActiveSection("details")}
                        className={`bg-white flex flex-col p-2 rounded-lg shadow text-center ${activeSection === "details" ? "ring-2 ring-blue-400" : ""}`}
                    >
                        <img src={info} alt="Dolar" className="icon-positioning" />
                        <p className="text-lg mt-5 font-bold">{meeting.duration} min</p>

                    </button>
                    <button
                        onClick={() => setActiveSection("participants")}
                        className={`bg-white flex flex-col p-2 rounded-lg shadow text-center ${activeSection === "participants" ? "ring-2 ring-blue-400" : ""}`}
                    >
                        <img src={people} alt="Dolar" className="icon-positioning" />
                        <p className="text-lg mt-5  font-bold">{meeting.participants.length}</p>

                    </button>

                    <button
                        onClick={() => setActiveSection("costs")}
                        className={`bg-white flex flex-col p-2 rounded-lg shadow text-center ${activeSection === "costs" ? "ring-2 ring-blue-400" : ""}`}
                    >
                        <img src={dolar} alt="Dolar" className="icon-positioning" />
                        <p className="text-lg mt-5  font-bold text-custom-teal">{meeting.cost.toFixed(2)} zł</p>
                    </button>

                </div>

                <hr className="border-gray-300" />

                {/* Meeting Details */}
                {activeSection === "costs" && (
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg font-semibold text-blue-main">Dodatkowe koszty</h2>
                            {canEdit && (
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="text-white bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center"
                                >
                                    <FontAwesomeIcon icon={faPlusCircle} size="xs" />
                                </button>
                            )}
                        </div>
                        <ul className="space-y-3">
                            {meeting.additional_costs.length > 0 ? (
                                meeting.additional_costs.map((cost) => (
                                    <li key={cost.id} className="flex justify-between items-center">
                                        <span>{cost.name}</span>
                                        <div className="flex items-center">
                                            <span className="text-custom-teal mr-2">{cost.cost.toFixed(2)} zł</span>
                                            <button onClick={() => setEditingCost(cost)} className="text-gray-500">
                                                <FontAwesomeIcon icon={faEllipsisV} />
                                            </button>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="text-center text-gray-500 py-2">Brak dodatkowych kosztów</li>
                            )}
                        </ul>
                    </div>
                )}

                {activeSection === "participants" && (
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg font-semibold text-blue-main">Uczestnicy</h2>
                            <span className="text-sm text-gray-500">{meeting.participants.length} osób</span>
                        </div>
                        <ul className="space-y-3">
                            {owner && (
                                <li className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-gray-900 text-white h-8 w-8 rounded-full flex items-center justify-center">
                                            {owner.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium">{owner.username}</p>
                                            <p className="text-xs text-gray-500">{owner.role_name}</p>
                                        </div>
                                    </div>
                                    <span className="text-custom-teal">{owner.hourly_cost.toFixed(2)} zł/h</span>
                                </li>
                            )}
                            <hr className="gray-line mx-2" />
                            {meeting.participants.filter(p => !p.is_owner).map((participant) => (
                                <li key={participant.id} className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-gray-900 text-white h-8 w-8 rounded-full flex items-center justify-center">
                                            {participant.username.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-medium">{participant.username}</p>
                                            <p className="text-xs text-gray-500">{participant.role_name}</p>
                                        </div>
                                    </div>
                                    <span className="text-custom-teal">{participant.hourly_cost.toFixed(2)} zł/h</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {activeSection === "details" && (
                    <div className="bg-white p-4 rounded-lg shadow">
                        <h2 className="text-lg font-semibold mb-2 text-blue-main">{meeting.title}</h2>
                        <hr className="gray-line mb-2" />
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600"><FontAwesomeIcon icon={faLink} />Kod: </span>
                                <span className="truncate max-w-[150px] block">{meeting.token}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600"><FontAwesomeIcon icon={faCalendarDays} /> Data:</span>
                                <span>{formatDate(meeting.date)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600"><FontAwesomeIcon icon={faClock} /> Czas:</span>
                                <span>{getTimeRange(meeting.date, meeting.duration)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600"><FontAwesomeIcon icon={faLocationDot} /> Miejsce:</span>
                                <span>{meeting.room_name}</span>
                            </div>
                        </div>
                        {meeting.description && (
                            <>
                                <hr className="my-3 border-gray-200" />
                                <p className="text-sm text-gray-600">{meeting.description}</p>
                            </>
                        )}
                    </div>
                )}
                {/* Modals */}
                {isAddModalOpen && (
                    <EditCostModal
                        onSave={handleNewCost}
                        onClose={() => setIsAddModalOpen(false)}
                        canEdit={canEdit}
                    />
                )}
                {editingCost && (
                    <EditCostModal
                        cost={editingCost}
                        onSave={handleEditCost}
                        onClose={() => setEditingCost(null)}
                        onDelete={() => handleDeleteCost(editingCost.id)}
                        canEdit={canEdit}
                    />
                )}
            </div>
        );
    }

    // Desktop version
    return (
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
                                <span className="text-custom-teal">{owner.hourly_cost.toFixed(2)} zł/h</span>
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
                    {canEdit && (
                        <button
                            onClick={() => {
                                setEditingCost(null);
                                setIsAddModalOpen(true);
                            }}
                            className="float-end text-white bg-blue-500 border-blue-500 border-2 rounded-full ml-4 cursor-pointer w-6 h-6 flex items-center justify-center"
                        >
                            <FontAwesomeIcon icon={faPlusCircle} className=" text-white bg-black border-black border-2 rounded-full  cursor-pointer" />
                        </button>
                    )}
                </h2>
                <hr className="gray-line mx-2" />
                <div className="overflow-y-auto">
                    <ul className="space-y-3 pt-3">
                        {meeting.additional_costs.map((cost) => (
                            <li key={cost.id} className="flex justify-between">{cost.name}
                                <span className="text-custom-teal">
                                    {cost.cost.toFixed(2)} zł
                                    <FontAwesomeIcon icon={faEllipsisV} className="text-black align-right pl-4 cursor-pointer" onClick={() => setEditingCost(cost)}/>
                                </span>
                            </li>
                        ))}
                        {!meeting.additional_costs.length && (
                            <li className="text-center text-gray-500 py-4">
                                Brak dodatkowych kosztów
                            </li>
                        )}
                    </ul>
                </div>
            </div>
            {isAddModalOpen && (
                <EditCostModal
                    onSave={handleNewCost}
                    onClose={() => setIsAddModalOpen(false)}
                    canEdit={canEdit}
                />
            )}
            {editingCost && (
                <EditCostModal
                    cost={editingCost}
                    onSave={handleEditCost}
                    onClose={() => setEditingCost(null)}
                    onDelete={() => handleDeleteCost(editingCost.id)}
                    canEdit={canEdit}
                />
            )}
        </div>
    );

};
export default MeetingDetails;