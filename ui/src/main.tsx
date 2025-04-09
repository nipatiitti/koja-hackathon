import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import App from './components/App.tsx'
import Instructions from './components/Instructions.tsx'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <StrictMode>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/about" element={<Instructions />} />
      </Routes>
    </StrictMode>
  </BrowserRouter>,
)
