import "../style.css";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import {
  faAngleDown,
  faCalendar,
  faEye,
  faEyeSlash,
  faPenToSquare,
  faSignOutAlt,
  faTrashCan
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from '../assets/logo.png'
import person from '../assets/person.png'
import dolar from '../assets/dolar.png'
import key from '../assets/key.png'
import eye from '../assets/eye.png'
import { getInitials, useUserAdminState } from "../components/userAdminHelpers";
import MobileAdminPanel from "../components/mobileAdmin.tsx";
import {useNavigate} from "react-router-dom";
import React from "react";
export default function AdminPanel() {
  const state = useUserAdminState();
  const navigate = useNavigate();

  return (
    (state.isMobile)?(
    <MobileAdminPanel />
    ) : (
    <div className="w-[100vw] h-[100vh] overflow-hidden">
      <div className="bg-[#f6f6f6] min-h-screen min-w-screen text-gray-900 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-1/6 min-h-screen bg-white float-left rounded-r-xs shadow p-4 border border-gray-200 flex flex-col gap-3">
          <h2 className="font-bold text-center text-[1.5em] text-blue-900">WYSZUKAJ UŻYTKOWNIKÓW</h2>
          <input
            type="text"
            placeholder="Wpisz Imię i Nazwisko"
            className="w-full p-2 mb-4 border border-gray-300 rounded-lg"
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
              onChange={(value: number | number[]) => {
                if (Array.isArray(value)) {
                  state.setCostRange([
                    Math.floor(value[0]),
                    Math.ceil(value[1])
                  ] as [number, number]);
                }
              }}
            />
          </div>
          <div className="mb-4">
            <label className="text-xs xl:text-sm text-gray-700 mt-2">Sortowanie</label>
            <select
              className="text-xs xl:text-sm border border-gray-300 rounded-lg p-1 w-full"
              value={state.sortBy}
              onChange={e => state.setSortBy(e.target.value as "hourly_cost_asc" | "hourly_cost_desc")}
            >
              <option value="hourly_cost_asc">Wypłata (rosnąco)</option>
              <option value="hourly_cost_desc">Wypłata (malejąco)</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="text-xs xl:text-sm text-gray-700 mt-2">Rola</label>
            <select
              className="text-xs xl:text-sm border border-gray-300 rounded-lg p-1 w-full"
              value={state.roleFilter}
              onChange={e => state.setRoleFilter(e.target.value)}
            >
              <option value="">Wybierz</option>
              {[...new Set(state.users.map(u => u.role_name))].map(role =>
                <option key={role} value={role}>{role}</option>
              )}
            </select>
          </div>
          <button className="w-full bg-blue-800 text-white py-2 rounded" onClick={state.handleSearch}>Szukaj</button>
          <button
              className="w-full bg-gray-200 text-gray-800 py-2 rounded mt-2"
              onClick={state.clearFilters}>
                Wyczyść filtry
              </button>
          <div className="absolute p-0 m-0 left-0 bottom-6 align-middle w-1/6">
            <hr className="gray-line" />
            <div
              className="align-middle items-center gap-2 text-sm text-gray-600 w-full pl-5 pt-3 cursor-pointer"
              onClick={() => state.setUserMenuOpen(!state.userMenuOpen)}
            >
              <div className="flex justify-center">
                <div className="bg-gray-900 text-white w-10 h-10 rounded-full float-left flex items-center justify-center text-2xl">
                  {state.initLetter}
                </div>
                <span className="float-left ml-2">
                  <p className="font-bold">{state.username}</p>
                  <p className="text-gray-500 text-xs">Zalogowano</p>
                </span>
                <FontAwesomeIcon
                  icon={faAngleDown}
                  className={`p-2 text-2xl transition-transform ${state.userMenuOpen ? 'transform rotate-180' : ''}`}
                />
              </div>
              {state.userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 bg-blue-100 shadow-lg rounded-md p-2 mb-2 z-10">
                  <button
                      className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center gap-2"
                      onClick={() => {
                        state.setUserMenuOpen(false);
                        navigate("/multiple_meetings");
                      }}
                  >
                    <FontAwesomeIcon icon={faCalendar} />
                    Strona Spotkań
                  </button>
                  <button
                    className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center gap-2"
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
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className="text-center p-6">
          <h1 className="text-6xl font-normal text-blue-main">PANEL ADMINISTRACYJNY</h1>
          <p className="text-lg">Jesteś w: <b>{localStorage.getItem('app_role')}</b></p>
          <div
            style={{ backgroundImage: `url(${logo})` }}
            className="top-6 right-6 absolute object-cover w-[6em] h-[6em] rounded-2xl bg-size-[130%] box-border overflow-hidden bg-center bg-no-repeat ">
          </div>
        </div>
        <hr className="border-gray-300" />
        <main ref={state.mainRef} className="flex-1 px-6 pt-6 h-[80vh] overflow-auto">
          <div className="flex space-x-4 h-full">
            {/* User list */}
            <div className="white-shadow-bordered-div col-span-1 w-[25%] h-full">
              <div className="h-full overflow-y-auto pr-2" ref={state.listContainerRef}>
                <ul>
                <div className=" sticky top-0 bg-white z-10">
                  <li className="pl-2 text-[0.9em] font-bold text-blue-main mb-2">Użytkownicy: {state.filteredUsers.length}</li>
                  <hr className="gray-line mx-2" />
                </div>

                  {state.sortedUsers.map((user, idx) => (
                    <li
                      key={user.id || idx}
                      onClick={() => state.setSelectedUser(user)}
                      className={`p-4 border-b border-gray-300 cursor-pointer hover:bg-blue-100 ${
                        state.selectedUser && state.selectedUser.id === user.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-gray-800 text-white rounded-full h-10 w-10 aspect-square flex items-center justify-center font-semibold">
                          {getInitials(user.username)}
                        </div>
                        <div>
                          <div className="font-medium">{user.username}</div>
                          <div className="text-sm text-gray-500">{user.role_name}</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* User details */}
            <div className="flex-1 space-y-6">
              <div className="bg-white px-6 py-2 rounded-lg shadow">
                <div className="flex w-full justify-between items-center">
                  <h2 className="font-semibold text-lg text-blue-800"> Użytkownik</h2>
                  <div>
                    <FontAwesomeIcon
                      icon={faPenToSquare}
                      className="text-2xl cursor-pointer"
                      onClick={(e) => {
                        if (!state.isAdmin) {
                          e.preventDefault();
                          state.showNoAdmin(e as unknown as React.MouseEvent<HTMLElement>);
                        } else {
                          state.startEditUser();
                        }
                      }}
                    />
                    <span className="mx-2">|</span>
                    <FontAwesomeIcon
                      icon={faTrashCan}
                      className="text-2xl cursor-pointer"
                      onClick={e => {
                        if (!state.isAdmin) {
                          e.preventDefault?.();
                          state.showNoAdmin(e as unknown as React.MouseEvent<HTMLElement>);
                        }  else {
                          state.setShowDeleteConfirm(true);
                        }
                      }}
                    />
                  </div>
                </div>
                <hr className="gray-line md-2" />
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-800 my-4 text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold">
                    {state.selectedUser ? getInitials(state.selectedUser.username) : ""}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-700 float-left mr-6">{state.selectedUser?.username}</div>
                    <div className="text-lg text-gray-500 float-left"> / {state.selectedUser?.email || "temp@mail.xd"}</div>
                  </div>
                </div>
                <hr className="gray-line mb-2 h-0" />
                <div className="col-span-3 grid grid-cols-3 gap-x-4 text-center h-fit">
                  <div className="white-shadow-bordered-div little-grid-box">
                    <img src={dolar} alt="Dolar" className="icon-positioning" />
                    <p className="text-xl font-bold text-custom-teal">{state.selectedUser?.hourly_cost !== undefined && state.selectedUser?.hourly_cost !== null
                      ? `${Number(state.selectedUser.hourly_cost).toFixed(2)}zł /h`
                      : "-"}</p>
                    <p className="text-lg">Wypłata</p>
                  </div>
                  <div className="white-shadow-bordered-div little-grid-box">
                    <img src={person} alt="Dolar" className="icon-positioning" />
                    <p className="text-xl font-bold">{state.selectedUser?.role_name || "-"}</p>
                    <p className="text-lg">Rola</p>
                  </div>
                  <div className="white-shadow-bordered-div little-grid-box">
                    <img src={key} alt="Key" className="icon-positioning" />
                    <p className="text-xl font-bold">{state.selectedUser?.app_role || "-"}</p>
                    <p className="text-lg">Uprawnienia</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-blue-800">{!state.isEditMode ? <>Nowy Użytkownik</> : <>Edytowanie użytkownika</>}</h2>
                <hr className="gray-line my-2" />
                <form className="grid grid-cols-2 gap-4" onSubmit={state.isEditMode ? state.handleEditUser : state.handleAddUser}>
                  <div className="col-span-2">
                    <p className="p-0 md-0">Imię i nazwisko</p>
                    <input
                      type="text"
                      name="username"
                      placeholder="Imię i Nazwisko"
                      className="p-2 border border-gray-300 rounded w-full"
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
                      className="p-2 border border-gray-300 rounded w-full"
                      disabled
                    />
                  </div>
                  <div className="">
                    <p className="p-0 md-0">Hasło
                      <button
                      type="button"
                      onClick={state.togglePassword}
                      style={{ backgroundImage: `url(${eye})` }}
                      className="float-end cursor-pointer"
                    >
                      <FontAwesomeIcon icon={state.passwordVisible?faEye:faEyeSlash}/>
                    </button>
                    </p>
                    <input
                      type={state.passwordVisible?"password":"text"}
                      name="password"
                      placeholder={!state.isEditMode ? "Hasło" : "Takie jak wcześniej"}
                      className="p-2 border border-gray-300 rounded w-full"
                      value={state.newUser.password}
                      onChange={state.handleNewUserChange}
                      required={!state.isEditMode}
                    />
                  </div>
                  <div className="col-span-2">
                    <p className="p-0 md-0">Wypłata godzinowa</p>
                    <input
                      type="number"
                      name="hourly_cost"
                      placeholder="Wypłata"
                      className="p-2 border border-gray-300 rounded w-full"
                      value={state.newUser.hourly_cost}
                      onChange={state.handleNewUserChange}
                      required
                      min={0}
                      step="0.01" // <-- pozwala na 2 miejsca po przecinku
                    />
                  </div>
                  <div className="">
                    <p className="p-0 md-0">Rola</p>
                    <input
                      type="text"
                      name="role_name"
                      placeholder="Wpisz nazwę roli"
                      className="p-2 border border-gray-300 rounded w-full"
                      value={state.newUser.role_name}
                      onChange={state.handleNewUserChange}
                      required
                      pattern="^[\u0000-\uFFFF]*$"
                    />
                  </div>
                  <div className="">
                    <p className="p-0 md-0">Uprawnienia</p>
                    <select
                      name="app_role"
                      className="p-[0.6em] border border-gray-300 rounded w-full"
                      value={state.newUser.app_role}
                      onChange={state.handleNewUserChange}
                      required
                    >
                      <option value="employee">EMPLOYEE</option>
                      <option value="admin">ADMIN</option>
                    </select>
                  </div>
                  {!state.isEditMode ? (
                    <button
                      type="submit"
                      className="bg-blue-800 text-white py-2 rounded col-span-2 w-1/2 mx-auto cursor-pointer"
                      onClick={e => {
                        if (!state.isAdmin) {
                          e.preventDefault();
                          state.showNoAdmin(e);
                        }
                      }}
                    >
                      Dodaj
                    </button>
                  ) : (
                    <>
                      <button
                        type="submit"
                        className="bg-blue-800 text-white py-2 rounded cursor-pointer"
                        onClick={e => {
                        if (!state.isAdmin) {
                          e.preventDefault();
                          state.showNoAdmin(e);
                        }
                      }}
                      >
                        Zapisz zmiany
                      </button>
                      <button
                        type="button"
                        className="bg-red-600 text-white py-2 rounded cursor-pointer"
                        onClick={state.cancelEdit}
                      >
                        Anuluj
                      </button>
                    </>
                  )}
                  {state.formError && (
                    <div className="col-span-2 text-red-600 text-sm mt-2">{state.formError}</div>
                  )}
                </form>
              </div>

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

              {/* Dymek z informacją o braku uprawnień */}
              {state.showNoAdminTooltip && state.noAdminAnchor && (() => {
                const rect = state.noAdminAnchor.getBoundingClientRect();
                return (
                  <div
                    style={{
                      position: "fixed",
                      left: rect.left + rect.width / 2,
                      top: rect.top - 40,
                      transform: "translate(-80%, 0%)",
                      zIndex: 9999
                    }}
                    className="bg-red-600 text-white px-4 py-2 rounded shadow-lg transition-all text-nowrap"
                  >
                    Brak uprawnień administratora
                  </div>
                );
              })()}
            </div>
          </div>
        </main>
      </div>
    </div>
    )
  );
}
