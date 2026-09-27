// Prévenir l'élève quand sa commande passe à « Prête » : sonnerie, vibration et
// notification, tant que la page de suivi est ouverte (même en arrière-plan).
let audio = null;

export const notificationsPossibles = () => typeof Notification !== "undefined";

// À appeler depuis un appui (le navigateur exige un geste pour le son et les notifications).
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
  const texte = `${c.prenom}, ta commande ${c.code} est prête !` + (c.codeRetrait ? ` Ton code : ${c.codeRetrait}` : "");
  sonner();
  try { navigator.vibrate && navigator.vibrate([400, 200, 400, 200, 800]); } catch (e) {}
  document.title = "✅ Commande prête ! · Arena Café";
  if (notificationsPossibles() && Notification.permission === "granted") {
    try {
      const n = new Notification("✅ Ta commande est prête !", { body: texte, icon: "/icon-192.png", tag: "prete-" + c.code, requireInteraction: true });
      n.onclick = () => { window.focus(); n.close(); };
    } catch (e) {
      // Android : les notifications passent par le service worker s'il y en a un
      navigator.serviceWorker?.ready?.then((r) => r.showNotification("✅ Ta commande est prête !", { body: texte, icon: "/icon-192.png", tag: "prete-" + c.code })).catch(() => {});
    }
  }
}
