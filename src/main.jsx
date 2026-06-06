import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.jsx'

const savedTheme = localStorage.getItem('gemb-theme') || 'light'
document.documentElement.dataset.theme = savedTheme

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
