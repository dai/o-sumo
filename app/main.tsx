import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import HomePage from './page'
import BanzukePage from './202603-o-sumo/page'
import TorikumiHubPage from './202603-torikumi/page'
import TopLevelSlugPage from './TopLevelSlugPage'
import './globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/202603-banduke" element={<BanzukePage />} />
        <Route path="/202603-o-sumo" element={<Navigate to="/202603-banduke" replace />} />
        <Route path="/202603-torikumi" element={<TorikumiHubPage mode="result" />} />
        <Route path="/202603-yotei" element={<TorikumiHubPage mode="schedule" />} />
        <Route path="/:slug" element={<TopLevelSlugPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
