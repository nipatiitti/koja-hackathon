import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Routes, Route, BrowserRouter } from 'react-router'
import Instructions from './Instructions.tsx'
import Navigation from './Navigation.tsx'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <StrictMode>
      <Navigation/>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/about" element={<Instructions />} />
      </Routes>
    </StrictMode>
  </BrowserRouter>
)
