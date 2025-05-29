import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/login.tsx";
import TokenLoginPage from "./pages/token_login.tsx";
import MultipleMeetingsPage from "./pages/multiple_meetings.tsx";
import AdminPage from "./pages/admin.tsx";
import { LoginProvider } from "./context/LoginProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LoginProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/token_login" element={<TokenLoginPage />} />
          <Route path="/multiple_meetings" element={<MultipleMeetingsPage/>} />
          <Route path="/admin_panel" element={<AdminPage/>} />
        </Routes>
      </Router>
    </LoginProvider>
  </StrictMode>
);
