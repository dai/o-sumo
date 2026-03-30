import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import BanzukePage from './banzuke/page'
import HomePage from './page'
import TorikumiHubPage from './torikumi/page'
import TopLevelSlugPage from './TopLevelSlugPage'
import RikishiProfilePage from './rikishi/[id]/page'
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
        <Route path="/rikishi/:id" element={<RikishiProfilePage />} />
        <Route path="/:slug" element={<TopLevelSlugPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
