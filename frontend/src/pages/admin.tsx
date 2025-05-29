import React, { useState } from "react";
import "../style.css";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { faAngleDown, faPenToSquare} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from '../assets/logo.png'
import person from '../assets/person.png'
import dolar from '../assets/dolar.png'
import key from '../assets/key.png'

const users = new Array(10).fill({
  name: "Jan Kowalski",
  role: "Programista Java",
  initials: "JK",
});

export default function AdminPanel() {
  const [selectedUser, setSelectedUser] = useState(users[0]);
    const [costRange, setCostRange] = useState<[number, number]>([0, 5000]);
  return (
    <div className="w-[100vw] h-[100vh] overflow-hidden">
      <div className="bg-[#f6f6f6] min-h-screen min-w-screen text-gray-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-1/6 min-h-screen bg-white float-left rounded-r-2xl shadow p-4 border border-gray-200 flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-center mb-4">WYSZUKAJ UŻYTKOWNIKÓW</h2>
        <input
          type="text"
          placeholder="Wpisz Imię i Nazwisko"
          className="w-full p-2 mb-4 border rounded"
        />
        <div>
            <label className="text-sm text-gray-700">Wypłata
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
        <div className="mb-4">
          <label className="block mb-1">Sortowanie</label>
          <select className="w-full p-2 border rounded">
            <option>Wypłata (rosnąco)</option>
            <option>Wypłata (malejąco)</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block mb-1">Rola</label>
          <select className="w-full p-2 border rounded">
            <option>Wybierz</option>
          </select>
        </div>
        <button className="w-full bg-blue-800 text-white py-2 rounded">Szukaj</button>

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
      </aside>

      {/* Main */}
      <div className="text-center p-6">
        <h1 className="text-6xl font-bold text-blue-main">PANEL ADMINISTRACYJNY</h1>
        <p className="text-lg">Jesteś w: <b>Użytkownicy</b></p>
        <div 
            style={{ backgroundImage: `url(${logo})` }}
            className="top-6 right-6 absolute object-cover w-[6em] h-[6em] rounded-2xl bg-size-[130%] box-border overflow-hidden bg-center bg-no-repeat ">
        </div>
      </div>
      <hr className="border-gray-300" />
      <main className="flex-1 px-6 pt-6 h-[80vh] overflow-auto">
        
        <div className="flex space-x-4 h-full">
          {/* User list */}
          <div className="w-1/3 bg-white shadow rounded-lg overflow-y-auto h-full">
            <div className="p-4 border-b font-semibold">Użytkownicy: 100</div>
            <ul>
              {users.map((user, idx) => (
                <li
                  key={idx}
                  onClick={() => setSelectedUser(user)}
                  className={`p-4 border-b cursor-pointer hover:bg-blue-100 ${
                    selectedUser === user ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
                      {user.initials}
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.role}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* User details */}
          <div className="flex-1 space-y-6">
            <div className="bg-white px-6 py-2 rounded-lg shadow">
                <div className="flex w-full justify-between items-center">
                    <h2 className="font-semibold text-blue-800"> Użytkownik</h2>
                    <FontAwesomeIcon icon={faPenToSquare} className="text-2xl"/>
                </div>
                    <hr className="gray-line md-2" />
              <div className="flex items-center space-x-4">
                <div className="bg-gray-800 text-white rounded-full w-18 h-18 flex items-center justify-center text-[2em] font-bold">
                  {selectedUser.initials}
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-700 float-left mr-6">{selectedUser.name}</div>
                  <div className="text-lg text-gray-500 float-left"> / jan.kowalski@gmail.com</div>
                </div>
              </div>
              <hr className="gray-line mb-2 h-0" />
              <div className="col-span-3 grid grid-cols-3 gap-x-4 text-center h-fit">
              <div className="white-shadow-bordered-div little-grid-box">
              <img src={dolar} alt="Dolar" className="icon-positioning" />
              <p className="text-xl font-bold text-custom-teal">50zł /h</p>
              <p className="text-lg">Wypłata</p>
            </div>
            <div className="white-shadow-bordered-div little-grid-box">
              <img src={person} alt="Dolar" className="icon-positioning" />
              <p className="text-xl font-bold">Developer</p>
              <p className="text-lg">Rola</p>
            </div>
            <div className="white-shadow-bordered-div little-grid-box">
              <img src={key} alt="Key" className="icon-positioning" />
              <p className="text-xl font-bold">Admin</p>
              <p className="text-lg">Uprawnienia</p>
            </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 text-blue-800">Nowy Użytkownik</h2>
                <hr className="gray-line my-2" />
              <form className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                <p className="p-0 md-0">Imię i nazwisko</p>
                <input
                  type="text"
                  placeholder="Imię i Nazwisko"
                  className="p-2 border rounded w-full"
                />
                </div>
                <div className="">
                <p className="p-0 md-0">Email</p>
                <input
                  type="email"
                  placeholder="Email"
                  className="p-2 border rounded w-full"
                />
                </div>
                <div className="">
                <p className="p-0 md-0">Hasło</p>
                <input
                  type="password"
                  placeholder="Hasło"
                  className="p-2 border rounded w-full"
                />
                </div>
                <div className="col-span-2">
                <p className="p-0 md-0">Wypłata godzinowa</p>
                <input
                  type="number"
                  placeholder="Wypłata"
                  className="p-2 border rounded w-full"
                />
                </div>
                <div className="">
                <p className="p-0 md-0">Rola</p>
                <input
                  type="text"
                  placeholder="Wpisz nazwę roli"
                  className="p-2 border rounded w-full"
                />
                </div>
                <div className="">
                <p className="p-0 md-0">Uprawnienia</p>
                <select className="p-[0.6em] border rounded w-full">
                  <option>Wybierz</option>
                </select>
                </div>
                <button
                  type="submit"
                  className="bg-blue-800 text-white py-2 rounded col-span-2"
                >
                  Dodaj
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
    </div>
  );
}
