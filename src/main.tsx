import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { BankingProvider } from './state/BankingContext'
import './index.css'

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root not found')

createRoot(container).render(
  <StrictMode>
    <BankingProvider>
      <App />
    </BankingProvider>
  </StrictMode>,
)
