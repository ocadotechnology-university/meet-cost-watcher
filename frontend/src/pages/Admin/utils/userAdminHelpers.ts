import { useState, useRef, useEffect } from "react";
import { appConstants } from "../../../constants";
import { useNavigate } from "react-router-dom";
import type { User } from "../../../types/user";
import { userValidator } from "./user-validator";

// @review do not use Polish comments in code, use English instead

// Funkcja pomocnicza do inicjałów
export function getInitials(username: string) {
  if (!username) return "?";
  return username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);
}

// Hook do wszystkich stanów i referencji używanych w admin.tsx i mobileAdmin.tsx
export function useUserAdminState() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [sortedUsers, setSortedUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const [costRange, setCostRange] = useState<[number, number]>([0, 5000]);
  const mainRef = useRef<HTMLDivElement>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const username = localStorage.getItem('username') || '';
  const initLetter = getInitials(username);
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
    app_role: "employee"
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editUserId, setEditUserId] = useState<number | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showNoAdminTooltip, setShowNoAdminTooltip] = useState(false);
  const [noAdminAnchor, setNoAdminAnchor] = useState<HTMLElement | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const [mobileView, setMobileView] = useState<"list" | "search" | "add" | "edit" | "details">("list");
  // Pobieranie użytkowników (brak paginacji, bo backend zwraca wszystkich)
  const fetchUsers = async () => {
    try {
      const credentials = localStorage.getItem('credentials');
      const response = await fetch(`${appConstants.backendURL}/users/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${credentials}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const newUsers: User[] = data.value || [];
        setUsers(newUsers);
        setFilteredUsers(newUsers);

        // Odśwież pole użytkownik (selectedUser)
        if (newUsers.length > 0) {
          setSelectedUser((prev) =>
            prev && newUsers.some((u) => u.id === prev.id)
              ? newUsers.find((u) => u.id === prev.id) || null
              : newUsers[0]
          );
        } else {
          setSelectedUser(null);
        }
      }
    } finally {
      // obsługa błędów opcjonalna
    }
  };

  const togglePassword = () => {
    setPasswordVisible(!passwordVisible);
  };

  useEffect(() => {
    fetchUsers();
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
    const filtered = users
      .filter(u =>
        (!searchName || u.username.toLowerCase().includes(searchName.toLowerCase())) &&
        (!roleFilter || u.role_name === roleFilter) &&
        (u.hourly_cost >= costRange[0] && u.hourly_cost <= costRange[1])
      );
    setFilteredUsers(filtered);
    setSelectedUser(filtered.length > 0 ? filtered[0] : null);
  };

  // sortowanie zawsze na podstawie filteredUsers i sortBy
  useEffect(() => {
    const sorted = [...filteredUsers];
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

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function onLogout() {
    // @review do not store password in localStorage
    localStorage.removeItem('credentials');
    localStorage.removeItem('username');
    navigate("/");
  }

  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const utf8Pattern = /^[\u0020-\uFFFF]*$/;
    const isFieldCorrect = (name === "username" || name === "role_name") && !utf8Pattern.test(value);
    if (!isFieldCorrect) {
      return;
    }
    setNewUser(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!userValidator.isNewUserValid(newUser)) {
      setFormError("Wszystkie pola są wymagane.");
      return;
    }

    try {
      const credentials = localStorage.getItem('credentials');
      const response = await fetch(`${appConstants.backendURL}/users/`, {
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
        await fetchUsers();
        // Ustaw nowo dodanego użytkownika jako wybranego
        const addedUser = users.find(
          u =>
            u.username === newUser.username &&
            u.role_name === newUser.role_name &&
            Number(u.hourly_cost) === Number(newUser.hourly_cost)
        );
        if (addedUser) {
          setSelectedUser(addedUser);
        } else if (users.length > 0) {
          setSelectedUser(users[users.length - 1]);
        }
        setNewUser({
          username: "",
          password: "",
          role_name: "",
          hourly_cost: "",
          app_role: "employee"
        });
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
      const response = await fetch(`${appConstants.backendURL}/users/${editUserId}`, {
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
        const selectCopy = selectedUser ? selectedUser.id : null;
        cancelEdit();
        fetchUsers();
        setSelectedUser(selectCopy ? users.find(u => u.id === selectCopy) || null : null);
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
      const response = await fetch(`${appConstants.backendURL}/users/${selectedUser.id}`, {
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

  const clearFilters = () => {
    setSearchName('');
    setRoleFilter('');
    setSortBy('hourly_cost_asc');
    setCostRange([minCost, maxCost]);
    setFilteredUsers(users);
  };

  return {
    users, setUsers,
    filteredUsers, setFilteredUsers,
    sortedUsers, setSortedUsers,
    selectedUser, setSelectedUser,
    listContainerRef,
    costRange, setCostRange,
    mainRef,
    userMenuOpen, setUserMenuOpen,
    username,
    initLetter,
    searchName, setSearchName,
    roleFilter, setRoleFilter,
    sortBy, setSortBy,
    minCost, setMinCost,
    maxCost, setMaxCost,
    newUser, setNewUser,
    formError, setFormError,
    isEditMode, setIsEditMode,
    editUserId, setEditUserId,
    passwordVisible, setPasswordVisible,
    showDeleteConfirm, setShowDeleteConfirm,
    showNoAdminTooltip, setShowNoAdminTooltip,
    noAdminAnchor, setNoAdminAnchor,
    isMobile, setIsMobile,
    mobileView, setMobileView,
    fetchUsers,
    togglePassword,
    handleSearch,
    handleNewUserChange,
    handleAddUser,
    startEditUser,
    cancelEdit,
    handleEditUser,
    handleDeleteUser,
    isAdmin,
    showNoAdmin,
    clearFilters,
    onLogout,
    navigate
  };
}