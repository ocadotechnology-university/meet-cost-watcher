import React, {useState} from "react";
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

const meetings = new Array(7).fill({
  code: "abc-mnop-xyz",
  title: "Nazwa spotkania",
  date: "13 kwi 2025, 13:00",
  duration: "120min",
  cost: "500zł",
});
meetings[0] = {
  ...meetings[0],
  title: "Meet Cost Watcher - Spotkanie PWR",
  cost: "950zł",
};
export default function MultipleMeetingsPage(){
  const [filterVisibility, setFilterVisibility] = useState(false);
  const [durationRange, setDurationRange] = useState<[number, number]>([0, 300]);
  const [costRange, setCostRange] = useState<[number, number]>([0, 5000]);

  return (
    <div className="bg-[#f6f6f6] min-h-screen min-w-screen text-gray-900 overflow-hidden">
      {filterVisibility && (
        <div 
          className="w-1/6 min-h-screen bg-white float-left pt-4 rounded-r-2xl shadow p-4 border border-gray-200 flex flex-col gap-3"
          onMouseLeave={() => setFilterVisibility(false)}
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
      <div className="text-center p-6">
        <h1 className="text-6xl font-normal text-blue-main">5050 zł</h1>
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
      <div className="grid grid-cols-4 gap-x-4 p-4 h-[80vh]">
        <div className="h-full flex flex-col">
          <input
            type="text"
            placeholder="Wpisz kod lub nazwę spotkania"
            className="mb-4 w-full bg-white rounded-xl shadow border-1 border-gray-200 text-[1em] text-center p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 h-fit"
          />
          <div className="white-shadow-bordered-div col-span-1 h-full">
            <div className="h-full overflow-y-auto pr-2">
              <ul>
              <li className="text-[0.9em] font-bold text-blue-main mb-2">Znalezionych wyników: 7</li>
              <hr className="gray-line mx-2" />
                {meetings.map((m, i) => (
            <React.Fragment key={i}>
              <li
                className={`flex justify-between items-center px-2 py-2 rounded-2xl hover:bg-gray-200 cursor-pointer ${i === 0 ? "bg-blue-100" : ""}`}
              >
                <div className="whitespace-nowrap overflow-hidden w-full">
                  <div className="font-medium max-h-min flex flex-row justify-between">
                    <span className="mr-2">{m.code}</span>
                    <span >{m.title}</span>
                  </div>
                  <div className="text-[1em] text-gray-600 flex justify-between">
                    <span>{m.date}</span>
                    <span> {m.duration}</span>
                    <span className="text-custom-teal font-semibold">{m.cost}</span>
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

        <div className="col-span-3 grid grid-cols-3 auto-rows-min gap-y-4 gap-x-4 white-shadow-bordered-div h-full items-start ">
          <div className="col-span-3 h-fit" >
            <p className="text-[1.2em] font-bold text-blue-main">Meet Cost Watcher - Spotkanie PWR</p>
            <hr className="gray-line h-0 mt-2" />
          </div>
          <div className="col-span-3 grid grid-cols-3 gap-x-4 text-center h-fit">
            <div className="white-shadow-bordered-div little-grid-box">
              <img src={dolar} alt="Dolar" className="icon-positioning" />
              <p className="text-xl font-bold text-custom-teal">950 zł</p>
              <p className="text-lg">Koszt</p>
            </div>
            <div className="white-shadow-bordered-div little-grid-box">
              <img src={people} alt="Dolar" className="icon-positioning" />
              <p className="text-xl font-bold">7</p>
              <p className="text-lg">Uczestnicy</p>
            </div>
            <div className="white-shadow-bordered-div little-grid-box">
              <img src={clock} alt="Dolar" className="icon-positioning" />
              <p className="text-xl font-bold">1h 30 min</p>
              <p className="text-lg">Czas</p>
            </div>
          </div>
          <hr className="gray-line mx-2 h-0 col-span-3 flex flex-col" />
          <div className="white-shadow-bordered-div h-[52vh]">
            <h2 className="text-lg font-semibold mb-2 text-blue-main">Szczegóły spotkania</h2>
            <hr className="gray-line my-3" />        
            <div className="flex flex-col gap-y-3 overflow-y-auto">
            <p><FontAwesomeIcon icon={faLink} />&nbsp;&nbsp;<strong> Kod:</strong> <span className="inline float-end">abc-mnop-xyz</span></p>
            <hr className="gray-line" />
            <p><FontAwesomeIcon icon={faCalendarDays} />&nbsp;&nbsp;<strong> Data:</strong> <span className="inline float-end">09.04.2025</span></p>
            <p><FontAwesomeIcon icon={faClock} />&nbsp;&nbsp;<strong> Czas:</strong> <span className="inline float-end">12:00 - 13:15</span></p>
            <p><FontAwesomeIcon icon={faLocationDot} />&nbsp;&nbsp;<strong> Miejsce:</strong> <span className="inline float-end">Sala 20.2A</span></p>
            </div>
            <hr className="gray-line my-2" />
            <p className="mt-2 text-sm text-gray-600">
              Spotkanie projektowe ze studentami w celu dopracowania UI do perfekcji
            </p>
          </div>

          <div className="white-shadow-bordered-div h-[52vh] flex flex-col">
            <h2 className="text-lg font-semibold mb-2 text-blue-main">Uczestnicy</h2>
            <hr className="gray-line mx-2" />
            <div className="overflow-y-auto">
              <ul className="space-y-1">
                <li className="flex flex-row justify-between ">
                  <div className="flex flex-row items-left gap-2">
                  <div className="bg-gray-900 text-white h-[2em] aspect-square rounded-full float-left flex items-center justify-center text-2xl">K</div>
                    <span><b>Janina Kowalska</b><p className="text-sm text-gray-500">Senior Dev</p></span>
                  </div>
                  <span className="text-custom-teal">50 zł/h</span>
                </li>
                <hr className="gray-line mx-2" />
                {Array(6).fill("Jan Kowalski").map((text, idx) => (
                  <li key={idx} className="flex flex-row justify-between ">
                  <div className="flex flex-row items-left gap-2">
                  <div className="bg-gray-900 text-white h-[2em] aspect-square rounded-full float-left flex items-center justify-center text-2xl">JK</div>
                    <span><b>{text}</b><p className="text-sm text-gray-500">Programista Java</p></span>
                  </div>
                  <span className="text-custom-teal">50 zł/h</span>
                </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="white-shadow-bordered-div h-[52vh] flex flex-col">
            <h2 className="text-lg font-semibold mb-2 text-blue-main">Dodatkowe koszty
            <FontAwesomeIcon icon={faPlusCircle} className="float-end text-white bg-black border-black border-2 rounded-full ml-4 cursor-pointer" onClick={()=>void 0}/>
            </h2>
            <hr className="gray-line mx-2" />
            <div className="overflow-y-auto">
              <ul className="space-y-3 pt-3">
                <li className="flex justify-between">Katering <span className="text-custom-teal">300 zł<FontAwesomeIcon icon={faEllipsisV} className="text-black pl-4 cursor-pointer" onClick={()=>void 0}/></span></li>
                <li className="flex justify-between">Sala <span className="text-custom-teal">100 zł<FontAwesomeIcon icon={faEllipsisV} className="text-black pl-4 cursor-pointer" onClick={()=>void 0}/></span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
