import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Navigate, Routes, Route, useLocation } from 'react-router-dom'
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
import KimaritePage from './kimarite/page'
import AnalyticsDashboardPage from './analytics/page'
import ThemeToggle from './components/ThemeToggle'
import LanguageToggle from './components/LanguageToggle'
import ScrollToHash from './components/ScrollToHash'
import {
  MAY2026_BANDUKE_PATH,
  MAY2026_RESULT_PATH,
  MAY2026_SCHEDULE_PATH,
  MARCH2026_RESULT_PATH,
  MARCH2026_SCHEDULE_PATH,
  MARCH2026_BANDUKE_PATH,
} from './lib/torikumi-routes'
import {
  CURRENT_BANZUKE_PATH,
  CURRENT_RESULT_PATH,
  CURRENT_SCHEDULE_PATH,
} from './lib/archive-basho-data'
import { bootstrapTheme } from './lib/theme'
import './globals.css'

bootstrapTheme()

function HashPreservingRedirect({ to }: { to: string }) {
  const { hash } = useLocation()
  return <Navigate to={`${to}${hash}`} replace />
}

const updateSW = registerSW({
  onNeedRefresh() {
    if (window.confirm(i18n.t('pwa.updateDialogTitle'))) {
      void updateSW(true)
    }
  },
})

function AppShell() {
  const { t } = useTranslation('common')

  return (
    <BrowserRouter>
      <ScrollToHash />
      <div className="global-notice-banner" role="status" aria-live="polite">
        {t('global.july2026UpdateNotice')}
      </div>
      <div className="top-right-controls">
        <ThemeToggle />
        <LanguageToggle />
      </div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/archives/" element={<ArchivesPage />} />
        <Route path="/archives" element={<HashPreservingRedirect to="/archives/" />} />
        <Route path="/rikishi/" element={<RikishiPage />} />
        <Route path="/rikishi" element={<HashPreservingRedirect to="/rikishi/" />} />
        <Route path="/kimarite/" element={<KimaritePage />} />
        <Route path="/kimarite" element={<HashPreservingRedirect to="/kimarite/" />} />
        <Route path="/analytics/" element={<AnalyticsDashboardPage />} />
        <Route path="/analytics" element={<HashPreservingRedirect to="/analytics/" />} />
        <Route path="/rikishi/:id/" element={<RikishiProfilePage />} />
        <Route path="/rikishi/:id" element={<RikishiProfilePage />} />
        {/* Current basho routes */}
        <Route path={`${CURRENT_BANZUKE_PATH}/`} element={<BanzukePage />} />
        <Route path={CURRENT_BANZUKE_PATH} element={<HashPreservingRedirect to={`${CURRENT_BANZUKE_PATH}/`} />} />
        <Route path={`${CURRENT_RESULT_PATH}/`} element={<TorikumiHubPage mode="result" />} />
        <Route path={CURRENT_RESULT_PATH} element={<HashPreservingRedirect to={`${CURRENT_RESULT_PATH}/`} />} />
        <Route path={`${CURRENT_SCHEDULE_PATH}/`} element={<TorikumiHubPage mode="schedule" />} />
        <Route path={CURRENT_SCHEDULE_PATH} element={<HashPreservingRedirect to={`${CURRENT_SCHEDULE_PATH}/`} />} />
        {/* May 2026 archive routes */}
        <Route path={`${MAY2026_BANDUKE_PATH}/`} element={<BanzukePage />} />
        <Route path={MAY2026_BANDUKE_PATH} element={<HashPreservingRedirect to={`${MAY2026_BANDUKE_PATH}/`} />} />
        <Route path={`${MAY2026_RESULT_PATH}/`} element={<TorikumiHubPage mode="result" />} />
        <Route path={MAY2026_RESULT_PATH} element={<HashPreservingRedirect to={`${MAY2026_RESULT_PATH}/`} />} />
        <Route path={`${MAY2026_SCHEDULE_PATH}/`} element={<TorikumiHubPage mode="schedule" />} />
        <Route path={MAY2026_SCHEDULE_PATH} element={<HashPreservingRedirect to={`${MAY2026_SCHEDULE_PATH}/`} />} />
        {/* March 2026 routes */}
        <Route path={`${MARCH2026_BANDUKE_PATH}/`} element={<BanzukePage />} />
        <Route path={MARCH2026_BANDUKE_PATH} element={<HashPreservingRedirect to={`${MARCH2026_BANDUKE_PATH}/`} />} />
        <Route path={`${MARCH2026_RESULT_PATH}/`} element={<TorikumiHubPage mode="result" />} />
        <Route path={MARCH2026_RESULT_PATH} element={<HashPreservingRedirect to={`${MARCH2026_RESULT_PATH}/`} />} />
        <Route path={`${MARCH2026_SCHEDULE_PATH}/`} element={<TorikumiHubPage mode="schedule" />} />
        <Route path={MARCH2026_SCHEDULE_PATH} element={<HashPreservingRedirect to={`${MARCH2026_SCHEDULE_PATH}/`} />} />
        {/* Legacy redirect */}
        <Route path="/202603-o-sumo" element={<HashPreservingRedirect to={`${MARCH2026_BANDUKE_PATH}/`} />} />
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
