import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import { useTranslation } from 'react-i18next'
import './lib/i18n'
import { i18n } from './lib/i18n'
import HomePage from './page'
import ThemeToggle from './components/ThemeToggle'
import LanguageToggle from './components/LanguageToggle'
import ScrollToHash from './components/ScrollToHash'
import CanonicalUrl from './components/CanonicalUrl'
import MetaHead from './components/MetaHead'
import TrailingSlashRoute from './components/TrailingSlashRoute'
import HashPreservingRedirect from './components/HashPreservingRedirect'
import WebMcpProvider from './components/WebMcpProvider'
import PrimaryNavigation from './components/PrimaryNavigation'
import { getArchiveHubRouteDefinitions } from './lib/torikumi-routes'
import { bootstrapTheme } from './lib/theme'
import './globals.css'

const BanzukePage = React.lazy(() => import('./banzuke/page'))
const TorikumiHubPage = React.lazy(() => import('./torikumi/page'))
const TopLevelSlugPage = React.lazy(() => import('./TopLevelSlugPage'))
const ArchivesPage = React.lazy(() => import('./archives/page'))
const RikishiPage = React.lazy(() => import('./rikishi/page'))
const RikishiProfilePage = React.lazy(() => import('./rikishi/RikishiProfilePage'))
const MyRikishiPage = React.lazy(() => import('./rikishi/MyRikishiPage'))
const CompareRikishiPage = React.lazy(() => import('./rikishi/CompareRikishiPage'))
const KimaritePage = React.lazy(() => import('./kimarite/page'))
const AnalyticsDashboardPage = React.lazy(() => import('./analytics/page'))
const AboutPage = React.lazy(() => import('./about/page'))
const OfficialListPage = React.lazy(async () => {
  const module = await import('./officials/page')
  return { default: module.OfficialListPage }
})
const OfficialProfilePage = React.lazy(async () => {
  const module = await import('./officials/page')
  return { default: module.OfficialProfilePage }
})

bootstrapTheme()

const updateSW = registerSW({
  onNeedRefresh() {
    if (window.confirm(i18n.t('pwa.updateDialogTitle'))) {
      void updateSW(true)
    }
  },
})

function RouteLoadingFallback() {
  const { t } = useTranslation('common')
  return <div className="route-loading" role="status" aria-live="polite">{t('global.pageLoading')}</div>
}

function AppShell() {
  const { t } = useTranslation('common')
  const archiveHubRoutes = getArchiveHubRouteDefinitions()

  return (
    <BrowserRouter>
      <WebMcpProvider />
      <CanonicalUrl />
      <MetaHead>
        <ScrollToHash />
        <div className="global-notice-banner" role="status" aria-live="polite">
          {t('global.officialDirectoryReleaseNotice')}
        </div>
        <a className="skip-to-main" href="#main-content">{t('bashoStatus.skipToMain')}</a>
        <div className="top-right-controls">
          <ThemeToggle />
          <LanguageToggle />
        </div>
        <PrimaryNavigation />
        <div id="main-content" tabIndex={-1}>
          <Suspense fallback={<RouteLoadingFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/archives/" element={<ArchivesPage />} />
              <Route path="/archives" element={<HashPreservingRedirect to="/archives/" />} />
              <Route path="/rikishi/" element={<RikishiPage />} />
              <Route path="/rikishi" element={<HashPreservingRedirect to="/rikishi/" />} />
              <Route path="/my-rikishi/" element={<MyRikishiPage />} />
              <Route path="/my-rikishi" element={<HashPreservingRedirect to="/my-rikishi/" />} />
              <Route path="/compare/" element={<CompareRikishiPage />} />
              <Route path="/compare" element={<HashPreservingRedirect to="/compare/" />} />
              <Route path="/gyoji/" element={<OfficialListPage kind="gyoji" />} />
              <Route path="/gyoji" element={<HashPreservingRedirect to="/gyoji/" />} />
              <Route path="/gyoji/:id" element={<TrailingSlashRoute><OfficialProfilePage kind="gyoji" /></TrailingSlashRoute>} />
              <Route path="/yobidashi/" element={<OfficialListPage kind="yobidashi" />} />
              <Route path="/yobidashi" element={<HashPreservingRedirect to="/yobidashi/" />} />
              <Route path="/yobidashi/:id" element={<TrailingSlashRoute><OfficialProfilePage kind="yobidashi" /></TrailingSlashRoute>} />
              <Route path="/kimarite/" element={<KimaritePage />} />
              <Route path="/kimarite" element={<HashPreservingRedirect to="/kimarite/" />} />
              <Route path="/analytics/" element={<AnalyticsDashboardPage />} />
              <Route path="/analytics" element={<HashPreservingRedirect to="/analytics/" />} />
              <Route path="/about/" element={<AboutPage />} />
              <Route path="/about" element={<HashPreservingRedirect to="/about/" />} />
              <Route
                path="/rikishi/:id"
                element={(
                  <TrailingSlashRoute>
                    <RikishiProfilePage />
                  </TrailingSlashRoute>
                )}
              />
              {archiveHubRoutes.flatMap((route) => [
                <Route
                  key={route.canonicalPath}
                  path={route.canonicalPath}
                  element={route.page === 'banzuke' ? <BanzukePage /> : <TorikumiHubPage mode={route.page} />}
                />,
                <Route
                  key={route.path}
                  path={route.path}
                  element={<HashPreservingRedirect to={route.canonicalPath} />}
                />,
              ])}
              <Route path="/:slug" element={<TopLevelSlugPage />} />
              <Route path="/:slug/" element={<TopLevelSlugPage />} />
            </Routes>
          </Suspense>
        </div>
      </MetaHead>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppShell />
  </React.StrictMode>,
)
