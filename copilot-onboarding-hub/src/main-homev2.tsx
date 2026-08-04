import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './styles/app.css'
import { StoreProvider } from './lib/store'
import { AppReusable } from './reusable/AppReusable'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <StoreProvider>
        <AppReusable />
      </StoreProvider>
    </HashRouter>
  </React.StrictMode>,
)
