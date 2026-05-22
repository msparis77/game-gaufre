import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDQOPBJOCa0aXmoEraHIYy-xrxFxCLO_IM",
  authDomain: "game-gaufre-dakar.firebaseapp.com",
  projectId: "game-gaufre-dakar",
  storageBucket: "game-gaufre-dakar.firebasestorage.app",
  messagingSenderId: "1024631169979",
  appId: "1:1024631169979:web:bdbcd88af774587be05a9e"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const firebaseStorage = {
  get: async (key) => {
    try {
      const ref = doc(db, 'gameGaufre', key.replace(/[/]/g, '_'));
      const snap = await getDoc(ref);
      if (snap.exists()) return { key, value: snap.data().value };
      return null;
    } catch(e) { console.error('Firebase get:', e); return null; }
  },
  set: async (key, value) => {
    try {
      const ref = doc(db, 'gameGaufre', key.replace(/[/]/g, '_'));
      await setDoc(ref, { value, key, updatedAt: new Date().toISOString() });
      return { key, value };
    } catch(e) { console.error('Firebase set:', e); return null; }
  },
  delete: async (key) => {
    try {
      const ref = doc(db, 'gameGaufre', key.replace(/[/]/g, '_'));
      await deleteDoc(ref);
      return { key, deleted: true };
    } catch(e) { return null; }
  },
  list: async (prefix) => { return { keys: [] }; }
};
