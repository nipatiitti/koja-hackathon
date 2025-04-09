import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import './index.css'
import App from './routes/App.tsx'
import Instructions from './routes/Instructions.tsx'

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
