import React, { useState } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faSignOutAlt, faEye, faEyeSlash, faPlusCircle, faArrowLeft, faXmark } from "@fortawesome/free-solid-svg-icons";
import person from '../assets/person.png';
import dolar from '../assets/dolar.png';
import key from '../assets/key.png';
import { getInitials, useUserAdminState } from "../components/userAdminHelpers";

export default function MobileAdminPanel() {
  const state = useUserAdminState();

  return (
    <>
      {/* Panel: Lista użytkowników */}
      {state.mobileView === "list" && (
        <div className="bg-[#f6f6f6] min-h-screen flex flex-col">
            {topMenu(state)}
          <ul className="flex-1 overflow-y-auto">
            {state.sortedUsers.map((user, idx) => (
              <li
                key={user.id || idx}
                className={`flex items-center justify-between px-4 py-3 border-b border-gray-200 cursor-pointer ${state.selectedUser && state.selectedUser.id === user.id ? "bg-blue-50" : ""}`}
                onClick={() => { state.setSelectedUser(user); state.setMobileView("details"); }}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">{getInitials(user.username)}</div>
                  <div>
                    <div className="font-medium">{user.username}</div>
                    <div className="text-xs text-gray-500">{user.role_name}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Panel: Wyszukiwarka */}
      {state.mobileView === "search" && (
        <div className="bg-[#f6f6f6] min-h-screen flex flex-col">
          {topMenu(state)}
          <div className="p-4">
            <input
              type="text"
              placeholder="Wpisz Imię i Nazwisko"
              className="w-full p-2 mb-4 border rounded"
              value={state.searchName}
              onChange={e => state.setSearchName(e.target.value)}
            />
            <div>
              <label className="text-sm text-gray-700">Wypłata
                <span className="float-end">{`${Math.floor(state.costRange[0])}-${Math.ceil(state.costRange[1])} zł`}</span>
              </label>
              <Slider
                range
                min={state.minCost}
                max={state.maxCost}
                value={[
                  Math.floor(state.costRange[0]),
                  Math.ceil(state.costRange[1])
                ]}
                onChange={(value: number[]) => state.setCostRange([
                  Math.floor(value[0]),
                  Math.ceil(value[1])
                ] as [number, number])}
              />
            </div>
            <div className="mb-4">
              <label className="block mb-1">Sortowanie</label>
              <select
                className="w-full p-2 border rounded"
                value={state.sortBy}
                onChange={e => state.setSortBy(e.target.value as any)}
              >
                <option value="hourly_cost_asc">Wypłata (rosnąco)</option>
                <option value="hourly_cost_desc">Wypłata (malejąco)</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block mb-1">Rola</label>
              <select
                className="w-full p-2 border rounded"
                value={state.roleFilter}
                onChange={e => state.setRoleFilter(e.target.value)}
              >
                <option value="">Wybierz</option>
                {[...new Set(state.users.map(u => u.role_name))].map(role =>
                  <option key={role} value={role}>{role}</option>
                )}
              </select>
            </div>
            <button className="w-full bg-blue-800 text-white py-2 rounded" onClick={() => { state.handleSearch(); state.setMobileView("list"); }}>Szukaj</button>
            <button
              className="w-full bg-gray-200 text-gray-800 py-2 rounded mt-2"
              onClick={() => {
                state.clearFilters();
                state.setMobileView("list");
              }} >
              Wyczyść filtry
            </button>
          </div>
        </div>
      )}

      {/* Panel: Dodaj użytkownika */}
      {state.mobileView === "add" && (
        <div className="bg-[#f6f6f6] min-h-screen flex flex-col">
          {topMenu(state)}
          <div className="p-4">
            <form className="space-y-4" onSubmit={async (e) => {
              await state.handleAddUser(e);
              if (!state.formError) state.setMobileView("list");
            }}>
              <div>
                <label className="block mb-1">Imię i nazwisko</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Imię i Nazwisko"
                  className="p-2 border rounded w-full"
                  value={state.newUser.username}
                  onChange={state.handleNewUserChange}
                  required
                  pattern="^[\u0000-\uFFFF]*$"
                />
              </div>
              <div className="">
                    <p className="p-0 md-0">Email</p>
                    <input
                      type="email"
                      name="email"
                      placeholder="Funkcja Niedostępna"
                      className="p-2 border rounded w-full"
                      disabled
                    />
                  </div>
              <div>
                <label className="block mb-1">Hasło
                  <button
                    type="button"
                    onClick={state.togglePassword}
                    className="float-end cursor-pointer ml-2"
                  >
                    <FontAwesomeIcon icon={state.passwordVisible ? faEye : faEyeSlash} />
                  </button>
                </label>
                <input
                  type={state.passwordVisible ? "password" : "text"}
                  name="password"
                  placeholder="Hasło"
                  className="p-2 border rounded w-full"
                  value={state.newUser.password}
                  onChange={state.handleNewUserChange}
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Wypłata godzinowa</label>
                <input
                  type="number"
                  name="hourly_cost"
                  placeholder="Wypłata"
                  className="p-2 border rounded w-full"
                  value={state.newUser.hourly_cost}
                  onChange={state.handleNewUserChange}
                  required
                  min={0}
                  step="0.01"
                />
              </div>
              <div>
                <label className="block mb-1">Rola</label>
                <input
                  type="text"
                  name="role_name"
                  placeholder="Wpisz nazwę roli"
                  className="p-2 border rounded w-full"
                  value={state.newUser.role_name}
                  onChange={state.handleNewUserChange}
                  required
                  pattern="^[\u0000-\uFFFF]*$"
                />
              </div>
              <div>
                <label className="block mb-1">Uprawnienia</label>
                <select
                  name="app_role"
                  className="p-2 border rounded w-full"
                  value={state.newUser.app_role}
                  onChange={state.handleNewUserChange}
                  required
                >
                  <option value="employee">EMPLOYEE</option>
                  <option value="admin">ADMIN</option>
                </select>
              </div>
              <button
                type="submit"
                className="bg-blue-800 text-white py-2 rounded w-full"
                onClick={e => {
                  if (!state.isAdmin) {
                    e.preventDefault();
                    state.showNoAdmin(e);
                  }
                }}
              >
                Dodaj
              </button>
              {state.formError && (
                <div className="text-red-600 text-sm mt-2">{state.formError}</div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Panel: Edytuj użytkownika */}
      {state.mobileView === "edit" && state.selectedUser && (
        <div className="bg-[#f6f6f6] min-h-screen flex flex-col">
          {topMenu(state)}
          <div className="p-4">
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                await state.handleEditUser(e);
                if (!state.formError) state.setMobileView("details");
              }}
            >
              <div>
                <label className="block mb-1">Imię i nazwisko</label>
                <input
                  type="text"
                  name="username"
                  placeholder="Imię i Nazwisko"
                  className="p-2 border rounded w-full"
                  value={state.newUser.username}
                  onChange={state.handleNewUserChange}
                  required
                  pattern="^[\u0000-\uFFFF]*$"
                />
              </div>

              <div className="">
                    <p className="p-0 md-0">Email</p>
                    <input
                      type="email"
                      name="email"
                      placeholder="Funkcja Niedostępna"
                      className="p-2 border rounded w-full"

                  value={state.newUser.username}
                      disabled
                    />
              </div>
              <div>
                <label className="block mb-1">
                  Hasło
                  <button
                    type="button"
                    onClick={state.togglePassword}
                    className="float-end cursor-pointer ml-2"
                  >
                    <FontAwesomeIcon icon={state.passwordVisible ? faEye : faEyeSlash} />
                  </button>
                </label>
                <input
                  type={state.passwordVisible ? "password" : "text"}
                  name="password"
                  placeholder="Pozostaw puste, jeśli bez zmiany"
                  className="p-2 border rounded w-full"
                  value={state.newUser.password}
                  onChange={state.handleNewUserChange}
                  required={false}
                />
              </div>
              <div>
                <label className="block mb-1">Wypłata godzinowa</label>
                <input
                  type="number"
                  name="hourly_cost"
                  placeholder="Wypłata"
                  className="p-2 border rounded w-full"
                  value={state.newUser.hourly_cost}
                  onChange={state.handleNewUserChange}
                  required
                  min={0}
                  step="0.01"
                />
              </div>
              <div>
                <label className="block mb-1">Rola</label>
                <input
                  type="text"
                  name="role_name"
                  placeholder="Wpisz nazwę roli"
                  className="p-2 border rounded w-full"
                  value={state.newUser.role_name}
                  onChange={state.handleNewUserChange}
                  required
                  pattern="^[\u0000-\uFFFF]*$"
                />
              </div>
              <div>
                <label className="block mb-1">Uprawnienia</label>
                <select
                  name="app_role"
                  className="p-2 border rounded w-full"
                  value={state.newUser.app_role}
                  onChange={state.handleNewUserChange}
                  required
                >
                  <option value="employee">EMPLOYEE</option>
                  <option value="admin">ADMIN</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-800 text-white py-2 rounded w-full"
                  onClick={e => {
                    if (!state.isAdmin) {
                      e.preventDefault();
                      state.showNoAdmin(e);
                    }
                  }}
                >
                  Potwierdź
                </button>
                <button
                  type="button"
                  className="bg-gray-300 text-gray-800 py-2 rounded w-full"
                  onClick={() => state.setMobileView("details")}
                >
                  Anuluj
                </button>
              </div>
              {state.formError && (
                <div className="text-red-600 text-sm mt-2">{state.formError}</div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Panel: Szczegóły użytkownika */}
      {state.mobileView === "details" && state.selectedUser && (
        <div className="bg-[#f6f6f6] min-h-screen flex flex-col">
          {topMenu(state)}
          <div className="flex flex-col items-center p-6">
            <div className="bg-gray-800 text-white rounded-full w-20 h-20 flex items-center justify-center text-3xl font-bold mb-4">
              {getInitials(state.selectedUser.username)}
            </div>
            <div className="text-xl font-bold">{state.selectedUser.username}</div>
            <div className="text-gray-500 mb-4">{state.selectedUser.email || "temp@mail.xd"}</div>
            <div className="w-full grid grid-cols-1 gap-4">
              <div className="bg-white rounded shadow p-4 flex items-center gap-4">
                <img src={dolar} alt="Dolar" className="w-6 h-6" />
                <span className="text-blue-700 font-bold">{Number(state.selectedUser.hourly_cost).toFixed(2)} zł / h</span>
                <span className="ml-auto text-gray-500">Wypłata</span>
              </div>
              <div className="bg-white rounded shadow p-4 flex items-center gap-4">
                <img src={person} alt="Person" className="w-6 h-6" />
                <span className="font-bold">{state.selectedUser.role_name}</span>
                <span className="ml-auto text-gray-500">Rola</span>
              </div>
              <div className="bg-white rounded shadow p-4 flex items-center gap-4">
                <img src={key} alt="Key" className="w-6 h-6" />
                <span className="font-bold">{state.selectedUser.app_role?.toUpperCase()}</span>
                <span className="ml-auto text-gray-500">Uprawnienia</span>
              </div>
            </div>
            { state.isAdmin && (
                <div className="w-full">
                    <button
                    className="w-full bg-blue-800 text-white py-2 rounded mt-6"
                    onClick={() => { state.startEditUser(); state.setMobileView("edit") }}
                    >
                    Edytuj
                    </button>
                    <button
                    className="w-full bg-red-500 text-white py-2 rounded mt-6"
                    onClick={() => { state.setShowDeleteConfirm(true); state.setMobileView("list") }}
                    >
                    Usuń użytkownika
                    </button>
                </div>
            )}
          </div>
        </div>
      )}
      {state.showDeleteConfirm && state.selectedUser && (
            <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white p-6 rounded shadow-lg text-center">
                <p className="mb-4">Czy na pewno chcesz usunąć użytkownika: <b>{state.selectedUser.username}</b>?</p>
                <div className="flex justify-center gap-4">
                <button
                    className="bg-red-600 text-white px-4 py-2 rounded"
                    onClick={state.handleDeleteUser}
                >
                    Tak
                </button>
                <button
                    className="bg-gray-300 px-4 py-2 rounded"
                    onClick={() => state.setShowDeleteConfirm(false)}
                >
                    Nie
                </button>
                </div>
            </div>
            </div>
        )}
    </>
  );
}

function topMenu(state: any) {
    return(
        <div className="sticky top-0 bg-white">
            <div className="flex justify-between items-center p-4 border-b ">
                {state.mobileView === "list" ? (
                    <FontAwesomeIcon icon={faMagnifyingGlass} className="text-5xl" onClick={() => state.setMobileView("search")} />
                ) : (state.mobileView === "search" || state.mobileView === "details") ? (
                    <FontAwesomeIcon icon={faArrowLeft} className="text-5xl" onClick={() => state.setMobileView("list")} />
                ) : (state.mobileView === "add") ? (
                    <FontAwesomeIcon icon={faXmark} className="text-6xl" onClick={() => state.setMobileView("list")} />
                ) : (state.mobileView === "edit") ? (
                    <FontAwesomeIcon icon={faXmark} className="text-6xl" onClick={() => state.setMobileView("details")} />
                ) : ("")}
                <div className="text-center">
                <span className="text-4xl font-semibold text-blue-800">
                    {state.mobileView === "list" || state.mobileView === "details"
                        ? "PRZEGLĄDAJ"
                        : state.mobileView === "search"
                        ? "WYSZUKAJ UŻYTKOWNIKÓW"
                        : state.mobileView === "edit"
                        ? "EDYTUJ"
                        : state.mobileView === "add"
                        ? "DODAJ"
                        : ""}
                </span>
                {state.mobileView !== "search" && (
                <p className="text-center text-lg">Jesteś w: <b>{localStorage.getItem("app_role")}</b></p>
                )}
                </div>
                <span
                className="text-4xl rounded-full bg-gray-800 text-white min-w-16 min-h-16 flex items-center justify-center cursor-pointer relative"
                onClick={() => state.setUserMenuOpen(!state.userMenuOpen)}
                >
                {state.initLetter}
                {state.userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 bg-blue-400 shadow-lg rounded-md p-2 z-10 min-w-[140px]">
                    <button
                        className="w-full text-left p-2 rounded flex items-center gap-2 text-nowrap"
                        onClick={() => {
                        state.setUserMenuOpen(false);
                        state.onLogout();
                        }}
                    >
                        <FontAwesomeIcon icon={faSignOutAlt} />
                        Wyloguj się
                    </button>
                    </div>
                )}
                </span>
            </div>
            {state.mobileView === "list" && (
                <div>
                    <div className="flex justify-between">
                        <div className="p-2 text-m font-semibold text-blue-600">Użytkownicy: {state.filteredUsers.length}</div>

                        {state.isAdmin && (
                            <button
                                onClick={() => { state.setMobileView("add"); state.setSelectedUser(null); 
                                }}
                                className="float-end text-white bg-blue-500 border-blue-500 border-2 rounded-full mr-2 my-auto cursor-pointer w-6 h-6 flex items-center justify-center">
                                <FontAwesomeIcon icon={faPlusCircle} className=" text-white bg-black border-black border-2 rounded-full  cursor-pointer" />
                            </button>
                        )}
                    </div>
                    <hr className="gray-line md-2" />
                </div>
            )}
        </div>
    )
}