import React, { useState, useEffect, useRef } from "react";
import "../style.css";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { faAngleDown, faEye, faEyeSlash, faPenToSquare, faSignOutAlt, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import logo from '../assets/logo.png'
import person from '../assets/person.png'
import dolar from '../assets/dolar.png'
import key from '../assets/key.png'
import eye from '../assets/eye.png'
import { useNavigate } from "react-router-dom";

const backendURL = "http://127.0.0.1:5000"; // lub Twój backend

function getInitials(username: string) {
  if (!username) return "?";
  return username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [sortedUsers, setSortedUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const [costRange, setCostRange] = useState<[number, number]>([0, 5000]);
  const mainRef = useRef<HTMLDivElement>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const username = localStorage.getItem('username') || '';
  const initLetter = username ? username.charAt(0).toUpperCase() : '';
  const [searchName, setSearchName] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState<'hourly_cost_asc' | 'hourly_cost_desc'>('hourly_cost_asc');
  const [minCost, setMinCost] = useState(0);
  const [maxCost, setMaxCost] = useState(5000);
  const [newUser, setNewUser] = useState({
    username: "",
    password: "",
    role_name: "",
    hourly_cost: "",
    app_role: "employee" // zamiast "EMPLOYEE"
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showNoAdminTooltip, setShowNoAdminTooltip] = useState(false);
  const [noAdminAnchor, setNoAdminAnchor] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();

  // Pobieranie użytkowników (brak paginacji, bo backend zwraca wszystkich)
  const fetchUsers = async () => {
    try {
      const credentials = localStorage.getItem('credentials');
      const response = await fetch(`${backendURL}/users/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${credentials}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const newUsers = data.value || [];
        setUsers(newUsers);
        setFilteredUsers(newUsers);
        if (newUsers.length) setSelectedUser(newUsers[0]);
      }
    } catch (e) {
      // obsługa błędów opcjonalna
    }
  };

  const togglePassword = () => {
    setPasswordVisible(!passwordVisible);
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (users.length > 0) {
      const costs = users.map(u => u.hourly_cost);
      const min = Math.min(...costs);
      const max = Math.max(...costs);
      setMinCost(min);
      setMaxCost(max);
      setCostRange([min, max]);
    }
  }, [users]);

  const handleSearch = () => {
    let filtered = users
      .filter(u =>
        (!searchName || u.username.toLowerCase().includes(searchName.toLowerCase())) &&
        (!roleFilter || u.role_name === roleFilter) &&
        (u.hourly_cost >= costRange[0] && u.hourly_cost <= costRange[1])
      );
    setFilteredUsers(filtered);
  };

  // sortowanie zawsze na podstawie filteredUsers i sortBy
  useEffect(() => {
    let sorted = [...filteredUsers];
    if (sortBy === 'hourly_cost_asc') {
      sorted.sort((a, b) => a.hourly_cost - b.hourly_cost);
    } else {
      sorted.sort((a, b) => b.hourly_cost - a.hourly_cost);
    }
    setSortedUsers(sorted);
  }, [filteredUsers, sortBy]);

  useEffect(() => {
    setFilteredUsers(users);
  }, [users]);

  function onLogout() {
    localStorage.removeItem('credentials');
    localStorage.removeItem('username');
    navigate("/");
  }

  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Pozwól tylko na znaki UTF-8 (czyli nie blokuj żadnych znaków, ale możesz zablokować np. emoji jeśli chcesz)
    // Przykład: blokuj znaki spoza zakresu podstawowego Unicode BMP (bez emoji)
    const utf8Pattern = /^[\u0000-\uFFFF]*$/;
    if (
      (name === "username" || name === "role_name") &&
      !utf8Pattern.test(value)
    ) {
      return; // ignoruj niedozwolone znaki
    }
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Walidacja
    if (
      !newUser.username.trim() ||
      !newUser.password.trim() ||
      !newUser.role_name.trim() ||
      !newUser.hourly_cost ||
      !newUser.app_role
    ) {
      setFormError("Wszystkie pola są wymagane.");
      return;
    }

    try {
      const credentials = localStorage.getItem('credentials');
      const response = await fetch(`${backendURL}/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${credentials}`
        },
        body: JSON.stringify({
          username: newUser.username,
          password: newUser.password,
          role_name: newUser.role_name,
          hourly_cost: Number(newUser.hourly_cost),
          app_role: newUser.app_role
        })
      });
      if (response.ok) {
        setNewUser({
          username: "",
          password: "",
          role_name: "",
          hourly_cost: "",
          app_role: "employee" // zamiast "EMPLOYEE"
        });
        fetchUsers(); // odśwież listę użytkowników
      } else {
        setFormError("Błąd dodawania użytkownika.");
      }
    } catch {
      setFormError("Błąd sieci.");
    }
  };

  const startEditUser = () => {
    if (!selectedUser) return;
    setIsEditMode(true);
    setEditUserId(selectedUser.id);
    setNewUser({
      username: selectedUser.username || "",
      password: "",
      role_name: selectedUser.role_name || "",
      hourly_cost: selectedUser.hourly_cost?.toString() || "",
      app_role: selectedUser.app_role || "employee",
    });
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    setEditUserId(null);
    setNewUser({
      username: "",
      password: "",
      role_name: "",
      hourly_cost: "",
      app_role: "employee"
    });
    setFormError(null);
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (
      !newUser.username.trim() ||
      !newUser.role_name.trim() ||
      !newUser.hourly_cost ||
      !newUser.app_role
    ) {
      setFormError("Wszystkie pola są wymagane.");
      return;
    }

    try {
      const credentials = localStorage.getItem('credentials');
      const response = await fetch(`${backendURL}/users/${editUserId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${credentials}`
        },
        body: JSON.stringify({
          username: newUser.username,
          password: newUser.password, // jeśli puste, backend powinien zignorować zmianę hasła
          role_name: newUser.role_name,
          hourly_cost: Number(newUser.hourly_cost),
          app_role: newUser.app_role
        })
      });
      if (response.ok) {
        cancelEdit();
        fetchUsers();
      } else {
        setFormError("Błąd zapisu zmian.");
      }
    } catch {
      setFormError("Błąd sieci.");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      const credentials = localStorage.getItem('credentials');
      const response = await fetch(`${backendURL}/users/${selectedUser.id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Basic ${credentials}`
        }
      });
      if (response.ok) {
        setShowDeleteConfirm(false);
        setSelectedUser(null);
        fetchUsers();
      } else {
        alert("Błąd usuwania użytkownika.");
      }
    } catch {
      alert("Błąd sieci.");
    }
  };

  // Sprawdź czy aktualny użytkownik to admin
  const isAdmin = localStorage.getItem("app_role") === "admin";

  // Funkcja do pokazywania dymka
  const showNoAdmin = (e: React.MouseEvent<HTMLElement>) => {
    setNoAdminAnchor(e.currentTarget);
    setShowNoAdminTooltip(true);
    setTimeout(() => {
      setShowNoAdminTooltip(false);
      setNoAdminAnchor(null);
    }, 1500);
  };

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
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
          />
          <div>
            <label className="text-sm text-gray-700">Wypłata
              <span className="float-end">{`${Math.floor(costRange[0])}-${Math.ceil(costRange[1])} zł`}</span>
            </label>
            <Slider
              range
              min={minCost}
              max={maxCost}
              value={[
                Math.floor(costRange[0]),
                Math.ceil(costRange[1])
              ]}
              onChange={(value: number[]) => setCostRange([
                Math.floor(value[0]),
                Math.ceil(value[1])
              ] as [number, number])}
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1">Sortowanie</label>
            <select
              className="w-full p-2 border rounded"
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
            >
              <option value="hourly_cost_asc">Wypłata (rosnąco)</option>
              <option value="hourly_cost_desc">Wypłata (malejąco)</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1">Rola</label>
            <select
              className="w-full p-2 border rounded"
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
            >
              <option value="">Wybierz</option>
              {[...new Set(users.map(u => u.role_name))].map(role =>
                <option key={role} value={role}>{role}</option>
              )}
            </select>
          </div>
          <button className="w-full bg-blue-800 text-white py-2 rounded" onClick={handleSearch}>Szukaj</button>

          <div className="absolute p-0 m-0 left-0 bottom-6 align-middle w-1/6">
            <hr className="gray-line" />
            <div
              className="align-middle items-center gap-2 text-sm text-gray-600 w-full pl-5 pt-3 cursor-pointer"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className="flex justify-center">
                <div className="bg-gray-900 text-white w-10 h-10 rounded-full float-left flex items-center justify-center text-2xl">
                  {initLetter}
                </div>
                <span className="float-left ml-2">
                  <p className="font-bold">{username}</p>
                  <p className="text-gray-500 text-xs">Zalogowano</p>
                </span>
                <FontAwesomeIcon
                  icon={faAngleDown}
                  className={`p-2 text-2xl transition-transform ${userMenuOpen ? 'transform rotate-180' : ''}`}
                />
              </div>
              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 bg-blue-100 shadow-lg rounded-md p-2 mb-2 z-10">
                  <button
                    className="w-full text-left p-2 hover:bg-gray-100 rounded flex items-center gap-2"
                    onClick={() => {
                      setUserMenuOpen(false);
                      onLogout();
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
          <h1 className="text-6xl font-bold text-blue-main">PANEL ADMINISTRACYJNY</h1>
          <p className="text-lg">Jesteś w: <b>{localStorage.getItem('app_role')}</b></p>
          <div
            style={{ backgroundImage: `url(${logo})` }}
            className="top-6 right-6 absolute object-cover w-[6em] h-[6em] rounded-2xl bg-size-[130%] box-border overflow-hidden bg-center bg-no-repeat ">
          </div>
        </div>
        <hr className="border-gray-300" />
        <main ref={mainRef} className="flex-1 px-6 pt-6 h-[80vh] overflow-auto">
          <div className="flex space-x-4 h-full">
            {/* User list */}
            <div className="w-1/3 bg-white shadow rounded-lg overflow-y-auto h-full" ref={listContainerRef}>
              <div className="p-4 border-b font-semibold sticky top-0 bg-white z-10">
                Użytkownicy: {filteredUsers.length}
              </div>
              <ul>
                {sortedUsers.map((user, idx) => (
                  <li
                    key={user.id || idx}
                    onClick={() => setSelectedUser(user)}
                    className={`p-4 border-b cursor-pointer hover:bg-blue-100 ${
                      selectedUser && selectedUser.id === user.id ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-800 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
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

            {/* User details */}
            <div className="flex-1 space-y-6">
              <div className="bg-white px-6 py-2 rounded-lg shadow">
                <div className="flex w-full justify-between items-center">
                  <h2 className="font-semibold text-blue-800"> Użytkownik</h2>
                  <div>
                    <FontAwesomeIcon
                      icon={faPenToSquare}
                      className="text-2xl cursor-pointer"
                      onClick={e => {
                        if (!isAdmin) {
                          e.preventDefault?.();
                          showNoAdmin(e);
                        } else {
                          startEditUser();
                        }
                      }}
                    />
                    <span className="mx-2">|</span>
                    <FontAwesomeIcon
                      icon={faTrashCan}
                      className="text-2xl cursor-pointer"
                      onClick={e => {
                        if (!isAdmin) {
                          e.preventDefault?.();
                          showNoAdmin(e);
                        }  else {
                          setShowDeleteConfirm(true);
                        }
                      }}
                    />
                  </div>
                </div>
                <hr className="gray-line md-2" />
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-800 text-white rounded-full w-18 h-18 flex items-center justify-center text-[2em] font-bold">
                    {selectedUser ? getInitials(selectedUser.username) : ""}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-700 float-left mr-6">{selectedUser?.username}</div>
                    <div className="text-lg text-gray-500 float-left"> / {selectedUser?.email || "temp@mail.xd"}</div>
                  </div>
                </div>
                <hr className="gray-line mb-2 h-0" />
                <div className="col-span-3 grid grid-cols-3 gap-x-4 text-center h-fit">
                  <div className="white-shadow-bordered-div little-grid-box">
                    <img src={dolar} alt="Dolar" className="icon-positioning" />
                    <p className="text-xl font-bold text-custom-teal">{selectedUser?.hourly_cost !== undefined && selectedUser?.hourly_cost !== null
                      ? `${Number(selectedUser.hourly_cost).toFixed(2)}zł /h`
                      : "-"}</p>
                    <p className="text-lg">Wypłata</p>
                  </div>
                  <div className="white-shadow-bordered-div little-grid-box">
                    <img src={person} alt="Dolar" className="icon-positioning" />
                    <p className="text-xl font-bold">{selectedUser?.role_name || "-"}</p>
                    <p className="text-lg">Rola</p>
                  </div>
                  <div className="white-shadow-bordered-div little-grid-box">
                    <img src={key} alt="Key" className="icon-positioning" />
                    <p className="text-xl font-bold">{selectedUser?.app_role || "-"}</p>
                    <p className="text-lg">Uprawnienia</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-lg font-semibold text-blue-800">{!isEditMode ? <>Nowy Użytkownik</> : <>Edytowanie użytkownika</>}</h2>
                <hr className="gray-line my-2" />
                <form className="grid grid-cols-2 gap-4" onSubmit={isEditMode ? handleEditUser : handleAddUser}>
                  <div className="col-span-2">
                    <p className="p-0 md-0">Imię i nazwisko</p>
                    <input
                      type="text"
                      name="username"
                      placeholder="Imię i Nazwisko"
                      className="p-2 border rounded w-full"
                      value={newUser.username}
                      onChange={handleNewUserChange}
                      required
                      pattern="^[\u0000-\uFFFF]*$"
                    />
                  </div>
                  <div className="">
                    <p className="p-0 md-0">Email</p>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      className="p-2 border rounded w-full"
                      // Email nie jest wysyłany do backendu, możesz dodać obsługę jeśli backend to obsługuje
                      disabled
                    />
                  </div>
                  <div className="">
                    <p className="p-0 md-0">Hasło
                      <button
                      type="button"
                      onClick={togglePassword}
                      style={{ backgroundImage: `url(${eye})` }}
                      className="float-end cursor-pointer"
                    >
                      <FontAwesomeIcon icon={passwordVisible?faEye:faEyeSlash}/>
                    </button>
                    </p>
                    <input
                      type={passwordVisible?"password":"text"}
                      name="password"
                      placeholder={!isEditMode ? "Hasło" : "Takie jak wcześniej"}
                      className="p-2 border rounded w-full"
                      value={newUser.password}
                      onChange={handleNewUserChange}
                      required={!isEditMode}
                    />
                  </div>
                  <div className="col-span-2">
                    <p className="p-0 md-0">Wypłata godzinowa</p>
                    <input
                      type="number"
                      name="hourly_cost"
                      placeholder="Wypłata"
                      className="p-2 border rounded w-full"
                      value={newUser.hourly_cost}
                      onChange={handleNewUserChange}
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
                      className="p-2 border rounded w-full"
                      value={newUser.role_name}
                      onChange={handleNewUserChange}
                      required
                      pattern="^[\u0000-\uFFFF]*$"
                    />
                  </div>
                  <div className="">
                    <p className="p-0 md-0">Uprawnienia</p>
                    <select
                      name="app_role"
                      className="p-[0.6em] border rounded w-full"
                      value={newUser.app_role}
                      onChange={handleNewUserChange}
                      required
                    >
                      <option value="employee">EMPLOYEE</option>
                      <option value="admin">ADMIN</option>
                    </select>
                  </div>
                  {!isEditMode ? (
                    <button
                      type="submit"
                      className="bg-blue-800 text-white py-2 rounded col-span-2 w-1/2 mx-auto cursor-pointer"
                      onClick={e => {
                        if (!isAdmin) {
                          e.preventDefault();
                          showNoAdmin(e);
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
                        if (!isAdmin) {
                          e.preventDefault();
                          showNoAdmin(e);
                        }
                      }}
                      >
                        Zapisz zmiany
                      </button>
                      <button
                        type="button"
                        className="bg-red-600 text-white py-2 rounded cursor-pointer"
                        onClick={cancelEdit}
                      >
                        Anuluj
                      </button>
                    </>
                  )}
                  {formError && (
                    <div className="col-span-2 text-red-600 text-sm mt-2">{formError}</div>
                  )}
                </form>
              </div>

              {showDeleteConfirm && selectedUser && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                  <div className="bg-white p-6 rounded shadow-lg text-center">
                    <p className="mb-4">Czy na pewno chcesz usunąć użytkownika: <b>{selectedUser.username}</b>?</p>
                    <div className="flex justify-center gap-4">
                      <button
                        className="bg-red-600 text-white px-4 py-2 rounded"
                        onClick={handleDeleteUser}
                      >
                        Tak
                      </button>
                      <button
                        className="bg-gray-300 px-4 py-2 rounded"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Nie
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Dymek z informacją o braku uprawnień */}
              {showNoAdminTooltip && noAdminAnchor && (() => {
  const rect = noAdminAnchor.getBoundingClientRect();
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
  );
}
