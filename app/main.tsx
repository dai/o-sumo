import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import { useTranslation } from 'react-i18next'
import './lib/i18n'
import { i18n } from './lib/i18n'
import BanzukePage from './banzuke/page'
import HomePage from './page'
import TorikumiHubPage from './torikumi/page'
import TopLevelSlugPage from './TopLevelSlugPage'
import ArchivesPage from './archives/page'
import RikishiPage from './rikishi/page'
import RikishiProfilePage from './rikishi/RikishiProfilePage'
import ThemeToggle from './components/ThemeToggle'
import LanguageToggle from './components/LanguageToggle'
import {
  MAY2026_BANDUKE_PATH,
  MAY2026_RESULT_PATH,
  MAY2026_SCHEDULE_PATH,
  MARCH2026_RESULT_PATH,
  MARCH2026_SCHEDULE_PATH,
  MARCH2026_BANDUKE_PATH,
} from './lib/torikumi-routes'
import { torikumiArchive } from './lib/torikumi-data'
import { getMay2026NoticeParams } from './lib/may2026-notice'
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

function AppShell() {
  const { t } = useTranslation('common')
  const { day: scheduleDay } = getMay2026NoticeParams(torikumiArchive);

  return (
    <BrowserRouter>
      <div className="global-notice-banner" role="status" aria-live="polite">
        {t('global.may2026UpdateNotice', { day: scheduleDay })}
      </div>
      <div className="top-right-controls">
        <ThemeToggle />
        <LanguageToggle />
      </div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/archives/" element={<ArchivesPage />} />
        <Route path="/archives" element={<Navigate to="/archives/" replace />} />
        <Route path="/rikishi/" element={<RikishiPage />} />
        <Route path="/rikishi" element={<Navigate to="/rikishi/" replace />} />
        <Route path="/rikishi/:id/" element={<RikishiProfilePage />} />
        <Route path="/rikishi/:id" element={<RikishiProfilePage />} />
        {/* May 2026 routes */}
        <Route path={`${MAY2026_BANDUKE_PATH}/`} element={<BanzukePage />} />
        <Route path={MAY2026_BANDUKE_PATH} element={<Navigate to={`${MAY2026_BANDUKE_PATH}/`} replace />} />
        <Route path={`${MAY2026_RESULT_PATH}/`} element={<TorikumiHubPage mode="result" />} />
        <Route path={MAY2026_RESULT_PATH} element={<Navigate to={`${MAY2026_RESULT_PATH}/`} replace />} />
        <Route path={`${MAY2026_SCHEDULE_PATH}/`} element={<TorikumiHubPage mode="schedule" />} />
        <Route path={MAY2026_SCHEDULE_PATH} element={<Navigate to={`${MAY2026_SCHEDULE_PATH}/`} replace />} />
        {/* March 2026 routes */}
        <Route path={`${MARCH2026_BANDUKE_PATH}/`} element={<BanzukePage />} />
        <Route path={MARCH2026_BANDUKE_PATH} element={<Navigate to={`${MARCH2026_BANDUKE_PATH}/`} replace />} />
        <Route path={`${MARCH2026_RESULT_PATH}/`} element={<TorikumiHubPage mode="result" />} />
        <Route path={MARCH2026_RESULT_PATH} element={<Navigate to={`${MARCH2026_RESULT_PATH}/`} replace />} />
        <Route path={`${MARCH2026_SCHEDULE_PATH}/`} element={<TorikumiHubPage mode="schedule" />} />
        <Route path={MARCH2026_SCHEDULE_PATH} element={<Navigate to={`${MARCH2026_SCHEDULE_PATH}/`} replace />} />
        {/* Legacy redirect */}
        <Route path="/202603-o-sumo" element={<Navigate to={`${MARCH2026_BANDUKE_PATH}/`} replace />} />
        {/* Day pages (8-digit slugs) */}
        <Route path="/:slug" element={<TopLevelSlugPage />} />
        <Route path="/:slug/" element={<TopLevelSlugPage />} />
      </Routes>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppShell />
  </React.StrictMode>,
)
