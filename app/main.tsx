import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import BanzukePage from './banzuke/page'
import HomePage from './page'
import TorikumiHubPage from './torikumi/page'
import TopLevelSlugPage from './TopLevelSlugPage'
import ArchivesPage from './archives/page'
import { banzukePath, getHubPath, legacyBanzukePath } from './lib/torikumi-routes'
import './globals.css'

const updateSW = registerSW({
  onNeedRefresh() {
    if (window.confirm('新しい更新があります。再読み込みしますか？')) {
      void updateSW(true)
    }
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/archives" element={<ArchivesPage />} />
        <Route path={banzukePath} element={<BanzukePage />} />
        <Route path={legacyBanzukePath} element={<Navigate to={banzukePath} replace />} />
        <Route path={getHubPath('result')} element={<TorikumiHubPage mode="result" />} />
        <Route path={getHubPath('schedule')} element={<TorikumiHubPage mode="schedule" />} />
        <Route path="/:slug" element={<TopLevelSlugPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
