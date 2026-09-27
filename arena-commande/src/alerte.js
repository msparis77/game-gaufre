// Prévenir l'élève quand sa commande passe à « Prête » : sonnerie, vibration et
// notification, tant que la page de suivi est ouverte (même en arrière-plan).
let audio = null;

export const notificationsPossibles = () => typeof Notification !== "undefined";

// À appeler depuis un appui (le navigateur exige un geste pour le son et les notifications).
export function enregistrerSW() {
  try { navigator.serviceWorker?.register("/sw.js").catch(() => {}); } catch (e) {}
}

export async function activerAlertes() {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === "suspended") await audio.resume();
  } catch (e) {}
  if (notificationsPossibles() && Notification.permission === "default") {
    try { await Notification.requestPermission(); } catch (e) {}
  }
  return notificationsPossibles() ? Notification.permission : "indisponible";
}

function sonner() {
  if (!audio) return;
  const t0 = audio.currentTime;
  [0, 0.35, 0.7].forEach((d, i) => {
    const o = audio.createOscillator(), g = audio.createGain();
    o.frequency.value = i === 2 ? 1320 : 880;
    g.gain.setValueAtTime(0.0001, t0 + d);
    g.gain.exponentialRampToValueAtTime(0.4, t0 + d + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + d + 0.3);
    o.connect(g).connect(audio.destination);
    o.start(t0 + d); o.stop(t0 + d + 0.32);
  });
}

export function alerterPrete(c) {
  const route = c.statut === "en_route";
  const titre = route ? `🛵 ${c.prenom}, ta commande est en route !` : `✅ ${c.prenom}, ta commande est prête !`;
  const texte = route
    ? `${c.livreur ? c.livreur + " arrive" : "Le livreur arrive"} avec ta commande ${c.code}.` + (c.codeRetrait ? ` Donne-lui ton code secret : ${c.codeRetrait}` : "")
    : `Ta commande ${c.code} t'attend au comptoir de l'Arena Café, tu peux venir la retirer.` + (c.codeRetrait ? ` Ton code secret : ${c.codeRetrait}` : "");
  sonner();
  try { navigator.vibrate && navigator.vibrate([400, 200, 400, 200, 800]); } catch (e) {}
  document.title = (route ? "🛵 Commande en route !" : "✅ Commande prête !") + " · Arena Café";
  if (!notificationsPossibles() || Notification.permission !== "granted") return;
  const options = { body: texte, icon: "/icon-192.png", tag: "prete-" + c.code, requireInteraction: true, vibrate: [400, 200, 400] };
  // Par le service worker d'abord (obligatoire sur Android), sinon directement.
  const direct = () => { try { const n = new Notification(titre, options); n.onclick = () => { window.focus(); n.close(); }; } catch (e) {} };
  if (navigator.serviceWorker?.getRegistration) {
    navigator.serviceWorker.getRegistration().then((r) => (r ? r.showNotification(titre, options) : direct())).catch(direct);
  } else direct();
}
