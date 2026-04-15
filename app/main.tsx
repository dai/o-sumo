import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import './lib/i18n'
import { i18n } from './lib/i18n'
import BanzukePage from './banzuke/page'
import HomePage from './page'
import TorikumiHubPage from './torikumi/page'
import TopLevelSlugPage from './TopLevelSlugPage'
import ArchivesPage from './archives/page'
import ThemeToggle from './components/ThemeToggle'
import LanguageToggle from './components/LanguageToggle'
import {
  banzukePath,
  MAY2026_RESULT_PATH,
  MAY2026_SCHEDULE_PATH,
  MARCH2026_RESULT_PATH,
  MARCH2026_SCHEDULE_PATH,
  MARCH2026_BANDUKE_PATH,
} from './lib/torikumi-routes'
import { bootstrapTheme } from './lib/theme'
import './globals.css'

bootstrapTheme()

const updateSW = registerSW({
  onNeedRefresh() {
    if (window.confirm(i18n.t('pwa.updateDialogTitle'))) {
      void updateSW(true)
    }
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <div className="top-right-controls">
        <ThemeToggle />
        <LanguageToggle />
      </div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/archives" element={<ArchivesPage />} />
        {/* May 2026 routes */}
        <Route path={banzukePath} element={<BanzukePage />} />
        <Route path={MAY2026_RESULT_PATH} element={<TorikumiHubPage mode="result" />} />
        <Route path={MAY2026_SCHEDULE_PATH} element={<TorikumiHubPage mode="schedule" />} />
        {/* March 2026 routes */}
        <Route path={MARCH2026_BANDUKE_PATH} element={<BanzukePage />} />
        <Route path={MARCH2026_RESULT_PATH} element={<TorikumiHubPage mode="result" />} />
        <Route path={MARCH2026_SCHEDULE_PATH} element={<TorikumiHubPage mode="schedule" />} />
        {/* Legacy redirect */}
        <Route path="/202603-o-sumo" element={<Navigate to={MARCH2026_BANDUKE_PATH} replace />} />
        {/* Day pages (8-digit slugs) */}
        <Route path="/:slug" element={<TopLevelSlugPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
