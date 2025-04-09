import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import './index.css'
import LoginPage from './login.tsx'
import SingleTokenPage from './login_single_token.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/single_token" element={<SingleTokenPage />} />
      </Routes>
    </Router>
  </StrictMode>,
)
