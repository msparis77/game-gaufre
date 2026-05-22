import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { firebaseStorage } from './firebase.js'

// ============================================================
// INJECTION FIREBASE → window.storage
// L'application utilise window.storage comme avant,
// mais maintenant les données vont sur Firebase (Google)
// Sauvegarde automatique, accessible depuis n'importe où
// ============================================================
window.storage = firebaseStorage;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
