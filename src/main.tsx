import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import './refinement.css'
import './shop-experience.css'
import './final-tweaks.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
