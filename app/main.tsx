import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './page'
import BanzukePage from './202603-o-sumo/page'
import './globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/202603-o-sumo" element={<BanzukePage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
