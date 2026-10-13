import { render } from "preact";
import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { doc, getDoc, onSnapshot, collection, runTransaction, serverTimestamp, Timestamp } from "firebase/firestore";
import { db, utilisateur } from "./firebase.js";
import { fcfa, faireLigne, prixUnitaire, estBoisson, prixSimple, aChoixPain, painsDuMenu, aChoixJus, jusDuMenu, nbAccomps, accompsDuMenu, supPain } from "./shared/prix.js";
import { boissonsParFamille, iconeBoisson } from "./shared/boissons.js";
import { prochainsCreneaux, hhmm, compteurId } from "./shared/creneaux.js";
import { passerCommande, nettoyerTelephone, telephoneValide } from "./shared/commander.js";
import { activerAlertes, alerterPrete, notificationsPossibles, enregistrerSW } from "./alerte.js";
import "./style.css";

const fs = { doc, collection, runTransaction, serverTimestamp, Timestamp };

// ─── Petits outils de stockage local (jamais bloquants) ───
const lire = (k, def) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; } };
const ecrire = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

// ─── Navigation par #/page ───
function useRoute() {
  const [h, setH] = useState(location.hash || "#/");
  useEffect(() => {
    const f = () => { setH(location.hash || "#/"); window.scrollTo(0, 0); };
    addEventListener("hashchange", f);
    return () => removeEventListener("hashchange", f);
  }, []);
  return h.slice(1).split("/").filter(Boolean);
}
const aller = (p) => { location.hash = p; };

// ─── Menu et créneaux en temps réel (avec copie locale pour s'afficher vite en 3G) ───
function useDoc(chemin, cle) {
  const [val, setVal] = useState(() => lire(cle, null));
  const [erreur, setErreur] = useState(false);
  useEffect(() =>
    onSnapshot(doc(db, chemin), (s) => {
      const d = s.exists() ? s.data() : null;
      setVal(d); ecrire(cle, d); setErreur(false);
    }, () => setErreur(true)), [chemin]);
  return [val, erreur];
}

const STATUTS = [
  { id: "recue", nom: "Reçue", detail: "La boutique a bien reçu ta commande." },
  { id: "preparation", nom: "En préparation", detail: "On prépare ta commande." },
  { id: "prete", nom: "Prête", detail: "Ta commande t'attend au comptoir !" },
  { id: "recuperee", nom: "Récupérée", detail: "Bon appétit !" },
];
const STATUTS_LIVRAISON = [
  { id: "recue", nom: "Reçue", detail: "La boutique a bien reçu ta commande." },
  { id: "preparation", nom: "En préparation", detail: "On prépare ta commande." },
  { id: "en_route", nom: "En route", detail: "Ton livreur arrive !" },
  { id: "livree", nom: "Livrée", detail: "Bon appétit !" },
];
// Zones de livraison ouvertes, dans l'ordre (z1, z2…)
const zonesOuvertes = (liv) => Object.entries(liv?.zones || {}).filter(([, z]) => z.actif).sort(([a], [b]) => a.localeCompare(b, "fr", { numeric: true })).map(([id, z]) => ({ id, ...z }));

function Entete({ nbCommandes }) {
  return (
    <header class="entete">
      <a href="#/" class="marque">
        <img src="/logo-256.webp" width="52" height="52" alt="Arena Café" />
        <div>
          <div class="nom">ARENA CAFÉ</div>
          <div class="slogan">PLAY • EAT • CHILL</div>
        </div>
      </a>
      {nbCommandes > 0 && <a class="mes" href="#/commandes">Mes commandes</a>}
    </header>
  );
}

function Photo({ article, grande }) {
  if (article.photo) return <img class={grande ? "photo grande" : "photo"} src={article.photo} alt="" loading="lazy" />;
  return <div class={grande ? "photo grande ph" : "photo ph"} aria-hidden="true">{estBoisson(article) ? iconeBoisson(article) : article.emoji || "🍽️"}</div>;
}

// ─── Page menu ───
function PageMenu({ menu, panier, setPanier, ouvert }) {
  const [cat, setCat] = useState(menu.categories[0]?.id);
  const [choisi, setChoisi] = useState(null);
  const articles = menu.articles.filter((a) => a.dispo !== false && !a.caisseSeulement);
  return (
    <main>
      {!ouvert && <div class="bandeau">Les commandes sont fermées pour le moment. Tu peux regarder le menu.</div>}
      <nav class="cats">
        {menu.categories.map((c) => (
          <a key={c.id} href={"#cat-" + c.id} class={cat === c.id ? "on" : ""}
             onClick={(e) => { e.preventDefault(); setCat(c.id); document.getElementById("cat-" + c.id)?.scrollIntoView({ behavior: "smooth" }); }}>
            {c.emoji} {c.nom}
          </a>
        ))}
      </nav>
      {menu.categories.map((c) => {
        const liste = c.id === "boissons" ? boissonsParFamille(articles.filter((a) => a.categorie === c.id)).flatMap((g) => g.articles) : articles.filter((a) => a.categorie === c.id);
        if (!liste.length) return null;
        return (
          <section key={c.id} id={"cat-" + c.id} class="section">
            <h2>{c.emoji} {c.nom}</h2>
            {liste.some((a) => !prixSimple(a)) && <p class="formule-info"><span class="tag-formule">🥤 FORMULE</span> = sandwich + boisson (café Touba ou thé inclus). Sandwich seul : {menu.options.remiseSansBoisson} F de moins.</p>}
            {liste.map((a) => (
              <button key={a.id} class="carte" onClick={() => setChoisi(a)}>
                <Photo article={a} />
                <div class="infos">
                  <div class="titre">{a.nom}</div>
                  {a.nomWolof && <div class="wolof">{a.nomWolof}</div>}
                  {a.description && <div class="desc">{a.description}</div>}
                  <div class="prix">
                    {prixSimple(a) ? fcfa(a.prix) : <><span class="tag-formule">🥤 FORMULE</span> {fcfa(a.prixFormule)} <span>· seul {fcfa(a.prixFormule - menu.options.remiseSansBoisson)}</span></>}
                  </div>
                </div>
                <span class="plus" aria-hidden="true">+</span>
              </button>
            ))}
          </section>
        );
      })}
      {choisi && <FicheArticle menu={menu} article={choisi} fermer={() => setChoisi(null)}
        ajouter={(ligne) => { setPanier([...panier, ligne]); setChoisi(null); }} />}
    </main>
  );
}

// ─── Fenêtre de choix d'un article ───
function FicheArticle({ menu, article, fermer, ajouter }) {
  const o = menu.options;
  const boisson = prixSimple(article);
  const [formule, setFormule] = useState(true);
  const [boissonId, setBoissonId] = useState(o.boissonsFormule[0]?.id);
  const [fromage, setFromage] = useState(false);
  const [sauce, setSauce] = useState("");
  const [pain, setPain] = useState("");
  const [jus, setJus] = useState("");
  const nAcc = nbAccomps(article);
  const [accomps, setAccomps] = useState(() => Array(nAcc).fill(""));
  const [qte, setQte] = useState(1);
  const choix = { formule, boissonId, fromage, sauce, pain, jus, accomps };
  const pu = prixUnitaire(menu, article, choix);
  const choixPain = aChoixPain(menu, article);
  const manquePain = choixPain && !pain;
  const manqueSauce = article.omelette && !sauce;
  const manqueJus = aChoixJus(article) && !jus;
  const manqueAccomp = nAcc > 0 && accomps.some((x) => !x);
  const choisirAccomp = (i, x) => setAccomps(accomps.map((y, j) => (j === i ? x : y)));
  return (
    <div class="voile" onClick={fermer}>
      <div class="fiche" role="dialog" aria-label={article.nom} onClick={(e) => e.stopPropagation()}>
        <button class="fermer" onClick={fermer} aria-label="Fermer">×</button>
        <Photo article={article} grande />
        <h3>{article.nom}</h3>
        {article.nomWolof && <div class="wolof">{article.nomWolof}</div>}
        {article.description && <p class="desc">{article.description}</p>}

        {aChoixJus(article) && (
          <div class="groupe">
            <div class="label">Ton jus local <em>(obligatoire)</em></div>
            {jusDuMenu(menu).map((j) => (
              <label key={j} class="radio">
                <input type="radio" name="jus" checked={jus === j} onChange={() => setJus(j)} />
                <span>{j}</span><b>inclus</b>
              </label>
            ))}
          </div>
        )}

        {nAcc > 0 && accomps.map((a, i) => (
          <div class="groupe" key={i}>
            <div class="label">{nAcc > 1 ? `Accompagnement ${i + 1}` : "Ton accompagnement"} <em>(obligatoire)</em></div>
            <div class="puces">
              {accompsDuMenu(menu).map((x) => (
                <button key={x} class={a === x ? "on" : ""} onClick={() => choisirAccomp(i, x)}>{x}</button>
              ))}
            </div>
          </div>
        ))}

        {!boisson && (
          <>
            <div class="groupe">
              <div class="label">Comment tu le veux ?</div>
              <div class="choix2">
                <button class={formule ? "on" : ""} onClick={() => setFormule(true)}>🥤 Formule<br /><small>sandwich + boisson</small></button>
                <button class={!formule ? "on" : ""} onClick={() => setFormule(false)}>Sandwich seul<br /><small>−{o.remiseSansBoisson} F</small></button>
              </div>
            </div>
            {choixPain && (
              <div class="groupe">
                <div class="label">Ton pain <em>(obligatoire)</em></div>
                {painsDuMenu(menu).map((p) => (
                  <label key={p} class="radio">
                    <input type="radio" name="pain" checked={pain === p} onChange={() => setPain(p)} />
                    <span>{p === "Baguette" ? "🥖 " : "🍞 "}{p}</span><b>{supPain(menu, p) ? "+" + fcfa(supPain(menu, p)) : "inclus"}</b>
                  </label>
                ))}
              </div>
            )}
            {formule && (
              <div class="groupe">
                <div class="label">Ta boisson</div>
                {o.boissonsFormule.map((b) => (
                  <label key={b.id} class="radio">
                    <input type="radio" name="boisson" checked={boissonId === b.id} onChange={() => setBoissonId(b.id)} />
                    <span>{b.nom}</span><b>{b.sup ? "+" + fcfa(b.sup) : "inclus"}</b>
                  </label>
                ))}
              </div>
            )}
            <div class="groupe">
              <label class="radio">
                <input type="checkbox" checked={fromage} onChange={(e) => setFromage(e.currentTarget.checked)} />
                <span>Version fromage</span><b>+{fcfa(o.supplementFromage)}</b>
              </label>
            </div>
            {article.omelette && (
              <>
                <div class="groupe">
                  <div class="label">Ta sauce <em>(obligatoire)</em></div>
                  {o.sauces.map((s) => (
                    <label key={s} class="radio">
                      <input type="radio" name="sauce" checked={sauce === s} onChange={() => setSauce(s)} />
                      <span>{s}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        <div class="qte">
          <button onClick={() => setQte(Math.max(1, qte - 1))} aria-label="Moins">−</button>
          <b>{qte}</b>
          <button onClick={() => setQte(Math.min(10, qte + 1))} aria-label="Plus">+</button>
        </div>
        <button class="gros" disabled={manquePain || manqueSauce || manqueJus || manqueAccomp || pu == null}
          onClick={() => ajouter(faireLigne(menu, article, choix, qte))}>
          {manquePain ? "Choisis ton pain" : manqueJus ? "Choisis ton jus" : manqueAccomp ? "Choisis ton accompagnement" : manqueSauce ? "Choisis ta sauce" : `Ajouter · ${fcfa(pu * qte)}`}
        </button>
      </div>
    </div>
  );
}

// ─── Page panier + infos + créneau ───
function PagePanier({ menu, config, livraisonCfg, panier, setPanier, ajouterCommande }) {
  const [prenom, setPrenom] = useState(() => lire("ac-prenom", ""));
  const [tel, setTel] = useState(() => lire("ac-tel", ""));
  const [creneauId, setCreneauId] = useState(null);
  const zones = zonesOuvertes(livraisonCfg);
  const livraisonPossible = !!livraisonCfg?.actif && zones.length > 0;
  const [mode, setMode] = useState("retrait");
  const [zoneId, setZoneId] = useState(() => lire("ac-zone", ""));
  const [adresse, setAdresse] = useState(() => lire("ac-adresse", ""));
  const [places, setPlaces] = useState({});
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [maintenant, setMaintenant] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setMaintenant(new Date()), 30000); return () => clearInterval(t); }, []);
  const creneaux = useMemo(() => prochainsCreneaux(config, maintenant), [config, maintenant]);

  // Places restantes par créneau
  useEffect(() => {
    let fini = false;
    Promise.all(creneaux.map((c) =>
      getDoc(doc(db, "compteurs", compteurId(c.id, c.retraitAt)))
        .then((s) => [c.id, c.max - (s.exists() ? s.data().count : 0)])
        .catch(() => [c.id, null])))
      .then((r) => { if (!fini) setPlaces(Object.fromEntries(r)); });
    return () => { fini = true; };
  }, [creneaux.map((c) => c.id + c.retraitAt.getTime()).join()]);

  const total = panier.reduce((s, l) => s + l.prixUnitaire * l.qte, 0);
  const telNet = nettoyerTelephone(tel);
  const creneau = creneaux.find((c) => c.id === creneauId);
  const livrer = livraisonPossible && mode === "livraison";
  const zone = livrer ? zones.find((z) => z.id === zoneId) : null;
  const frais = zone ? zone.frais : 0;
  const minimum = livraisonCfg?.minimum || 0;
  const changerQte = (i, d) => setPanier(panier.map((l, j) => (j === i ? { ...l, qte: l.qte + d } : l)).filter((l) => l.qte > 0));

  if (!panier.length)
    return <main class="vide"><p>Ton panier est vide.</p><a class="gros" href="#/">Voir le menu</a></main>;

  const valider = async () => {
    setErreur("");
    if (!prenom.trim()) return setErreur("Écris ton prénom.");
    if (!telephoneValide(telNet)) return setErreur("Numéro de téléphone invalide (ex. 77 123 45 67).");
    if (livrer && !zone) return setErreur("Choisis ta zone de livraison.");
    if (livrer && adresse.trim().length < 5) return setErreur("Écris ton adresse de livraison (quartier, rue, un repère).");
    if (livrer && total < minimum) return setErreur(`Minimum ${fcfa(minimum)} de commande pour la livraison.`);
    if (!creneau) return setErreur(livrer ? "Choisis une heure de livraison." : "Choisis une heure de retrait.");
    setEnvoi(true);
    try {
      ecrire("ac-prenom", prenom.trim()); ecrire("ac-tel", tel);
      if (livrer) { ecrire("ac-zone", zone.id); ecrire("ac-adresse", adresse.trim()); }
      activerAlertes(); // son + notification pour « Prête » (profite du geste de l'élève)
      const u = await utilisateur();
      const r = await passerCommande(fs, db, u.uid, { prenom, telephone: telNet, lignes: panier, total, creneau,
        livraison: livrer ? { zone: zone.id, nom: zone.nom, adresse, frais: zone.frais } : null });
      ajouterCommande(r);
      setPanier([]);
      aller("/suivi/" + r.id);
    } catch (e) {
      setErreur(e.message || "Erreur, réessaie.");
    }
    setEnvoi(false);
  };

  return (
    <main class="panier">
      <h2>Ton panier</h2>
      {panier.map((l, i) => (
        <div class="ligne" key={i}>
          <div class="nomligne">{l.nom}</div>
          <div class="qte petit">
            <button onClick={() => changerQte(i, -1)} aria-label="Moins">−</button>
            <b>{l.qte}</b>
            <button onClick={() => changerQte(i, 1)} aria-label="Plus">+</button>
          </div>
          <div class="pl">{fcfa(l.prixUnitaire * l.qte)}</div>
        </div>
      ))}
      {livrer && zone && <div class="ligne"><div class="nomligne">🛵 Livraison · {zone.nom}</div><div class="pl">{fcfa(frais)}</div></div>}
      <div class="total"><span>Total</span><b>{fcfa(total + frais)}</b></div>
      <a href="#/" class="lien">+ Ajouter autre chose</a>

      <h2>Tes infos</h2>
      <label class="champ">Prénom
        <input value={prenom} maxLength={30} autocomplete="given-name" onInput={(e) => setPrenom(e.currentTarget.value)} />
      </label>
      <label class="champ">Téléphone
        <input value={tel} type="tel" inputMode="numeric" placeholder="77 123 45 67" autocomplete="tel"
          onInput={(e) => setTel(e.currentTarget.value)} />
      </label>

      {livraisonPossible && <>
        <h2>Retrait ou livraison ?</h2>
        <div class="modes">
          <button class={mode === "retrait" ? "on" : ""} onClick={() => setMode("retrait")}><b>🏃 Je viens chercher</b><small>au comptoir</small></button>
          <button class={mode === "livraison" ? "on" : ""} onClick={() => setMode("livraison")}><b>🛵 Livraison</b><small>chez toi</small></button>
        </div>
        {livrer && <>
          <div class="zones">
            {zones.map((z) => <button key={z.id} class={zoneId === z.id ? "on" : ""} onClick={() => setZoneId(z.id)}><b>{z.nom}</b><small>+ {fcfa(z.frais)}</small></button>)}
          </div>
          <label class="champ">Adresse de livraison
            <textarea value={adresse} maxLength={200} rows={2} placeholder="Quartier, rue, maison… et un repère (ex. près de la pharmacie)" onInput={(e) => setAdresse(e.currentTarget.value)} />
          </label>
          {minimum > 0 && <p class="aide">Minimum {fcfa(minimum)} de commande pour la livraison.</p>}
        </>}
      </>}

      <h2>{livrer ? "Heure de livraison" : "Heure de retrait"}</h2>
      {!creneaux.length && <p class="bandeau">Aucun créneau ouvert pour le moment.</p>}
      <div class="creneaux">
        {creneaux.map((c) => {
          const p = places[c.id];
          const complet = p != null && p <= 0;
          return (
            <button key={c.id} disabled={complet} class={creneauId === c.id ? "on" : ""} onClick={() => setCreneauId(c.id)}>
              <b>{hhmm(c.minutes)}</b>
              <small>{c.demain ? "demain" : "aujourd'hui"}</small>
              <small>{complet ? "complet" : p != null && p <= 5 ? `${p} place${p > 1 ? "s" : ""}` : ""}</small>
            </button>
          );
        })}
      </div>
      <p class="aide">Les commandes ferment {config?.delaiFermetureMin ?? 15} min avant chaque créneau.</p>

      <h2>Paiement</h2>
      <div class="paiement">{livrer ? "💵 Paiement au livreur, à la livraison." : "💵 Paiement sur place, au retrait de ta commande."}</div>

      {erreur && <div class="erreur" role="alert">{erreur}</div>}
      <button class="gros" disabled={envoi} onClick={valider}>
        {envoi ? "Envoi…" : `Commander · ${fcfa(total + frais)}`}
      </button>
    </main>
  );
}

// ─── Page de suivi en temps réel ───
function PageSuivi({ id }) {
  const [c, setC] = useState(null);
  const [erreur, setErreur] = useState(false);
  const [alerte, setAlerte] = useState(() => notificationsPossibles() && Notification.permission === "granted" ? "granted" : "");
  const avant = useRef(null);
  // Sonnerie + vibration + notification quand la boutique passe la commande à « Prête »
  useEffect(() => {
    if (!c) return;
    if ((c.statut === "prete" || c.statut === "en_route") && avant.current && avant.current !== c.statut) alerterPrete(c);
    avant.current = c.statut;
  }, [c && c.statut]);
  useEffect(() => {
    let stop = () => {};
    utilisateur().then(() => {
      stop = onSnapshot(doc(db, "commandes_en_ligne", id), (s) => setC(s.exists() ? s.data() : false), () => setErreur(true));
    }).catch(() => setErreur(true));
    // Quand l'élève revient sur la page (écran rallumé, retour d'une autre appli),
    // on relit la commande tout de suite : le téléphone a pu mettre la page en pause.
    const relire = () => { if (document.visibilityState === "visible") getDoc(doc(db, "commandes_en_ligne", id)).then((s) => s.exists() && setC(s.data())).catch(() => {}); };
    document.addEventListener("visibilitychange", relire);
    window.addEventListener("focus", relire);
    return () => { stop(); document.removeEventListener("visibilitychange", relire); window.removeEventListener("focus", relire); };
  }, [id]);
  if (erreur) return <main class="vide"><p>Impossible d'afficher cette commande sur ce téléphone.</p><a class="gros" href="#/">Menu</a></main>;
  if (c === null) return <main class="vide"><p>Chargement…</p></main>;
  if (c === false) return <main class="vide"><p>Commande introuvable.</p></main>;
  const at = c.retraitAt.toDate();
  const annulee = c.statut === "annulee";
  const liv = c.livraison;
  const etapes = liv ? STATUTS_LIVRAISON : STATUTS;
  const idx = etapes.findIndex((s) => s.id === c.statut);
  return (
    <main class="suivi">
      {c.statut === "prete" && <div class="prete">
        <b>✅ {c.prenom}, ta commande est prête !</b>
        <span>Tu peux venir la retirer au comptoir{c.codeRetrait ? " avec ton code secret" : ""}.</span>
      </div>}
      {c.statut === "en_route" && <div class="prete">
        <b>🛵 {c.prenom}, ta commande est en route !</b>
        <span>{c.livreur ? `${c.livreur} arrive` : "Le livreur arrive"}. Prépare ton code secret et {fcfa(c.total + (liv?.frais || 0))}.</span>
        {c.livreurTel && <a class="appel" href={"tel:+221" + c.livreurTel}>📞 Appeler {c.livreur || "le livreur"} · {c.livreurTel.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4")}</a>}
      </div>}
      <p class="merci">Merci {c.prenom} !</p>
      <div class="numero">
        <small>Ton numéro de commande</small>
        <b>{c.code}</b>
        <small>{liv ? "Livraison vers" : "Retrait à"} <strong>{hhmm(at.getUTCHours() * 60 + at.getUTCMinutes())}</strong> · {at.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })}</small>
      </div>
      {c.codeRetrait && <div class="secret">
        <small>🔑 Ton code secret{liv ? "" : " de retrait"}</small>
        <b>{c.codeRetrait}</b>
        <small>{liv ? "Donne ce code au livreur quand il te remet ta commande." : "Donne ce code au comptoir pour récupérer ta commande."} Ne le partage avec personne.</small>
      </div>}
      {(c.statut === "recue" || c.statut === "preparation") && (alerte
        ? <p class="alerte-ok">🔔 Ton téléphone sonnera quand ta commande sera {liv ? "en route" : "prête"}. Garde cette page ouverte.</p>
        : <button class="gros alerte" onClick={async () => setAlerte(await activerAlertes())}>🔔 Me prévenir quand c'est prêt</button>)}
      {liv && <p class="aide centre">🛵 Livraison à <b>{liv.nom}</b> : {liv.adresse}</p>}
      <p class="aide centre">{liv ? `Donne ton code secret au livreur${c.livreur ? " (" + c.livreur + ")" : ""} quand il arrive.` : `Montre ton numéro ${c.codeRetrait ? "et ton code secret " : ""}au comptoir.`} Garde cette page ouverte : elle se met à jour toute seule.</p>
      {annulee ? <div class="erreur">Cette commande a été annulée par la boutique.</div> : (
        <ol class="etapes">
          {etapes.map((s, i) => (
            <li key={s.id} class={i < idx ? "fait" : i === idx ? "actuel" : ""}>
              <b>{s.nom}</b>{i === idx && <span>{s.detail}</span>}
            </li>
          ))}
        </ol>
      )}
      <div class="recap">
        {c.lignes.map((l, i) => <div key={i} class="ligne"><span>{l.qte} × {l.nom}</span><span>{fcfa(l.prixUnitaire * l.qte)}</span></div>)}
        {liv && <div class="ligne"><span>🛵 Livraison · {liv.nom}</span><span>{fcfa(liv.frais)}</span></div>}
        <div class="total"><span>{liv ? "À payer au livreur" : "À payer au retrait"}</span><b>{fcfa(c.total + (liv?.frais || 0))}</b></div>
      </div>
      <a href="#/" class="lien">Retour au menu</a>
    </main>
  );
}

function PageMesCommandes({ ids }) {
  if (!ids.length) return <main class="vide"><p>Aucune commande sur ce téléphone.</p></main>;
  return (
    <main class="panier">
      <h2>Mes commandes</h2>
      {[...ids].reverse().map((c) => (
        <a key={c.id} class="carte lien-cmd" href={"#/suivi/" + c.id}>
          <b>{c.code}</b><span>{new Date(c.le).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</span><span>Voir →</span>
        </a>
      ))}
    </main>
  );
}

function App() {
  const route = useRoute();
  const [menu, erreurMenu] = useDoc("config/menu", "ac-menu");
  const [config] = useDoc("config/creneaux", "ac-creneaux");
  const [livraisonCfg] = useDoc("config/livraison", "ac-livraison");
  const [panier, setPanierBrut] = useState(() => lire("ac-panier", []));
  const [mesCommandes, setMesCommandes] = useState(() => lire("ac-mes-commandes", []));
  const setPanier = (p) => { setPanierBrut(p); ecrire("ac-panier", p); };
  const ajouterCommande = (r) => { const l = [...mesCommandes, { id: r.id, code: r.code, le: Date.now() }].slice(-10); setMesCommandes(l); ecrire("ac-mes-commandes", l); };
  // On prépare l'identifiant anonyme dès l'ouverture, pour gagner du temps au moment de commander.
  useEffect(() => { utilisateur().catch(() => {}); }, []);

  const nb = panier.reduce((s, l) => s + l.qte, 0);
  const total = panier.reduce((s, l) => s + l.prixUnitaire * l.qte, 0);
  const ouvert = prochainsCreneaux(config).length > 0;
  const page = route[0] || "";

  let contenu;
  if (page === "suivi" && route[1]) contenu = <PageSuivi id={route[1]} />;
  else if (page === "commandes") contenu = <PageMesCommandes ids={mesCommandes} />;
  else if (!menu) contenu = <main class="vide"><p>{erreurMenu ? "Connexion impossible. Vérifie ta connexion internet." : "Chargement du menu…"}</p></main>;
  else if (page === "panier") contenu = <PagePanier menu={menu} config={config} livraisonCfg={livraisonCfg} panier={panier} setPanier={setPanier} ajouterCommande={ajouterCommande} />;
  else contenu = <PageMenu menu={menu} panier={panier} setPanier={setPanier} ouvert={ouvert} />;

  return (
    <>
      <Entete nbCommandes={mesCommandes.length} />
      {contenu}
      {nb > 0 && page === "" && (
        <a class="barre" href="#/panier"><span>Voir le panier ({nb})</span><b>{fcfa(total)}</b></a>
      )}
    </>
  );
}

enregistrerSW();
render(<App />, document.getElementById("app"));
