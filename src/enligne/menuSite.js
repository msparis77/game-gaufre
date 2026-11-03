import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebaseCaisse.js";
import { MENU_DEPART } from "../../arena-commande/src/shared/menuDepart.js";

// Le menu du site (config/menu dans Firebase) dans l'onglet Encaissement.
// Même menu, mêmes prix que le site : on le modifie une seule fois dans 🌐 → Menu & prix.
const CACHE = "gg3-menu-site";

export function useMenuSite() {
  const [menu, setMenu] = useState(() => {
    try { const m = JSON.parse(localStorage.getItem(CACHE) || "null"); if (m && m.articles) return m; } catch (e) {}
    return MENU_DEPART;
  });
  useEffect(() => onSnapshot(doc(db, "config/menu"), (s) => {
    if (!s.exists()) return;
    const m = s.data();
    setMenu(m);
    try { localStorage.setItem(CACHE, JSON.stringify(m)); } catch (e) {}
  }, () => {}), []);
  return menu;
}

