import { initializeApp } from 'firebase/app'
import { getFirestore, doc, setDoc, getDoc, collection } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyDQOPBJOCa0aXmoEraHIYy-xrxFxCLO_IM",
  authDomain: "game-gaufre-dakar.firebaseapp.com",
  projectId: "game-gaufre-dakar",
  storageBucket: "game-gaufre-dakar.firebasestorage.app",
  messagingSenderId: "1024631169979",
  appId: "1:1024631169979:web:bdbcd88af774587be05a9e"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// ── Sauvegarde Firebase (non-bloquante) ──────────────────────────────────────
export const fbSave = async (key, data) => {
  try {
    await setDoc(doc(db, 'game-gaufre-dakar', key), { data: JSON.stringify(data), ts: Date.now() })
  } catch (e) {
    // Firebase indisponible → pas grave, localStorage prend le relais
  }
}

// ── Chargement Firebase ──────────────────────────────────────────────────────
export const fbLoad = async (key) => {
  try {
    const snap = await getDoc(doc(db, 'game-gaufre-dakar', key))
    if (snap.exists()) return JSON.parse(snap.data().data)
  } catch (e) {}
  return null
}
