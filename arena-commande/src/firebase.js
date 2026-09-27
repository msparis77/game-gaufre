import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged, connectAuthEmulator } from "firebase/auth";
import { initializeFirestore, connectFirestoreEmulator } from "firebase/firestore";

const env = import.meta.env;
export const firebaseConfigure = !!env.VITE_FB_PROJECT_ID;

const app = initializeApp({
  apiKey: env.VITE_FB_API_KEY || "demo",
  authDomain: env.VITE_FB_AUTH_DOMAIN,
  projectId: env.VITE_FB_PROJECT_ID || "demo-arena-commande",
  appId: env.VITE_FB_APP_ID,
});

export const auth = getAuth(app);
// Long polling auto : plus fiable sur les réseaux mobiles lents.
export const db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true });

if (env.VITE_FB_EMULATEUR === "1") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}

// Chaque téléphone reçoit un identifiant anonyme, gardé d'une visite à l'autre.
let pret = null;
export function utilisateur() {
  if (!pret)
    pret = new Promise((resolve, reject) => {
      let demande = false;
      const stop = onAuthStateChanged(auth, (u) => {
        if (u) { stop(); resolve(u); }
        else if (!demande) {
          demande = true;
          signInAnonymously(auth).catch((e) => { stop(); pret = null; reject(e); });
        }
      });
    });
  return pret;
}
