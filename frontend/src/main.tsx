import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LoginPage from "./login.tsx";
import TokenLoginPage from "./token_login.tsx";
import MultipleMeetingsPage from "./multiple_meetings.tsx";
import { LoginProvider } from "./context/LoginProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LoginProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/token_login" element={<TokenLoginPage />} />
          <Route path="/multiple_meetings" element={<MultipleMeetingsPage />} />
        </Routes>
      </Router>
    </LoginProvider>
  </StrictMode>
);
