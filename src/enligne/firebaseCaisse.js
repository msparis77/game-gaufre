// Connexion de la caisse au projet Firebase de la commande en ligne.
// La caisse se connecte avec le compte « caisse » (email fixe + mot de passe),
// le seul compte autorisé par les règles à voir toutes les commandes.
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, connectAuthEmulator } from "firebase/auth";
import { initializeFirestore, connectFirestoreEmulator } from "firebase/firestore";

const env = import.meta.env;
// Clés Web du projet Firebase « game-gaufre-dakar ». Elles ne sont pas secrètes
// (elles sont visibles dans tout site Firebase) : la sécurité vient des règles
// Firestore. Les variables VITE_FB_* permettent de pointer ailleurs (tests).
const DEFAUT = {
  apiKey: "AIzaSyDQOPBJOCa0aXmoEraHIYy-xrxFxCLO_IM",
  authDomain: "game-gaufre-dakar.firebaseapp.com",
  projectId: "game-gaufre-dakar",
  appId: "1:1024631169979:web:bdbcd88af774587be05a9e",
};
export const EMAIL_CAISSE = "caisse@arenacafe.sn";
export const firebaseConfigure = true;

const app = initializeApp(env.VITE_FB_PROJECT_ID ? {
  apiKey: env.VITE_FB_API_KEY || "demo",
  authDomain: env.VITE_FB_AUTH_DOMAIN,
  projectId: env.VITE_FB_PROJECT_ID,
  appId: env.VITE_FB_APP_ID,
} : DEFAUT, "arena-commande");

export const auth = getAuth(app);
export const db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true });
if (env.VITE_FB_EMULATEUR === "1") {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}

export const connecterCaisse = (motDePasse) => signInWithEmailAndPassword(auth, EMAIL_CAISSE, motDePasse);
export const deconnecterCaisse = () => signOut(auth);
export const surConnexion = (f) => onAuthStateChanged(auth, (u) => f(u && u.email === EMAIL_CAISSE ? u : null));
