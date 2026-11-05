import React from 'react'
import ReactDOM from 'react-dom/client'
import '@fontsource-variable/inter/wght.css'
import './index.css'
import App from './App'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Elemen #root tidak ditemukan di index.html')
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
