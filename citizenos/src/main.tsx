import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { InsforgeProvider } from '@insforge/react'
import { insforge } from '@/lib/insforge'
import App from './App'
import '@/styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <InsforgeProvider client={insforge}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </InsforgeProvider>
  </React.StrictMode>,
)
