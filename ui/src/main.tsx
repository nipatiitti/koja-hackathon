import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './components/App.tsx'
import { Routes, Route, BrowserRouter } from 'react-router'
import Instructions from './components/Instructions.tsx'
import Navigation from './components/Navigation.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <StrictMode>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <Navigation />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/about" element={<Instructions />} />
        </Routes>
      </div>
    </StrictMode>
  </BrowserRouter>,
)
