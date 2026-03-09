import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import HomePage from './page'
import BanzukePage from './202603-o-sumo/page'
import TorikumiHubPage from './202603-torikumi/page'
import TopLevelSlugPage from './TopLevelSlugPage'
import { banzukePath, getHubPath, legacyBanzukePath } from './lib/torikumi-routes'
import './globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path={banzukePath} element={<BanzukePage />} />
        <Route path={legacyBanzukePath} element={<Navigate to={banzukePath} replace />} />
        <Route path={getHubPath('result')} element={<TorikumiHubPage mode="result" />} />
        <Route path={getHubPath('schedule')} element={<TorikumiHubPage mode="schedule" />} />
        <Route path="/:slug" element={<TopLevelSlugPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
