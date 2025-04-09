import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import './index.css'
import LoginPage from './login.tsx'
import TokenLoginPage from './token_login.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/token_login" element={<TokenLoginPage />} />
      </Routes>
    </Router>
  </StrictMode>,
)
