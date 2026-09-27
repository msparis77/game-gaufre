// Créneaux de retrait. Dakar est à UTC+0 toute l'année : on calcule tout en UTC
// pour que l'heure soit juste même si le téléphone est mal réglé.

export const hhmm = (minutes) =>
  String(Math.floor(minutes / 60)).padStart(2, "0") + "h" + String(minutes % 60).padStart(2, "0");

export const versMinutes = (txt) => {
  const m = /^(\d{1,2})[h:](\d{2})$/.exec(String(txt).trim());
  return m ? Number(m[1]) * 60 + Number(m[2]) : null;
};

export const jourCle = (d) =>
  d.getUTCFullYear() * 10000 + (d.getUTCMonth() + 1) * 100 + d.getUTCDate();

export const compteurId = (creneauId, retraitAt) => `${creneauId}_${jourCle(retraitAt)}`;

// Liste des créneaux proposés maintenant : pour chaque créneau actif, la
// prochaine occurrence (aujourd'hui, sinon demain) encore ouverte.
export function prochainsCreneaux(config, maintenant = new Date()) {
  if (!config || !config.ouvert) return [];
  const delai = (config.delaiFermetureMin ?? 15) * 60000;
  const debutJour = Date.UTC(maintenant.getUTCFullYear(), maintenant.getUTCMonth(), maintenant.getUTCDate());
  const res = [];
  for (const [id, c] of Object.entries(config.creneaux || {})) {
    if (!c.actif) continue;
    for (const j of [0, 1]) {
      const at = new Date(debutJour + j * 86400000 + c.minutes * 60000);
      if (at.getTime() - delai > maintenant.getTime()) {
        res.push({ id, ...c, retraitAt: at, demain: j === 1, fermeA: new Date(at.getTime() - delai) });
        break;
      }
    }
  }
  return res.sort((a, b) => a.retraitAt - b.retraitAt);
}
