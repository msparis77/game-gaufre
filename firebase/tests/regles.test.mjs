// Tests des règles de sécurité sur un Firestore de simulation (émulateur).
import { test, before, after, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import * as fs from "firebase/firestore";
import { passerCommande } from "../../arena-commande/src/shared/commander.js";
import { MENU_DEPART, CRENEAUX_DEPART } from "../../arena-commande/src/shared/menuDepart.js";
import { prochainsCreneaux } from "../../arena-commande/src/shared/creneaux.js";
import { faireLigne } from "../../arena-commande/src/shared/prix.js";

const { doc, getDoc, setDoc, updateDoc, getDocs, collection, query, where, deleteDoc, Timestamp, serverTimestamp } = fs;
let env;
const CAISSE = { email: "caisse@arenacafe.sn", firebase: { sign_in_provider: "password" } };

// Un créneau toujours ouvert dans 3 heures, quel que soit le moment du test.
function configTest(max = 25) {
  const dans3h = new Date(Date.now() + 3 * 3600000);
  const minutes = dans3h.getUTCHours() * 60 + (dans3h.getUTCMinutes() - (dans3h.getUTCMinutes() % 30));
  return { ...CRENEAUX_DEPART, creneaux: { ...CRENEAUX_DEPART.creneaux, ctest: { code: "T", minutes, max, actif: true } } };
}
function creneauTest(cfg) {
  return prochainsCreneaux(cfg).find((c) => c.id === "ctest");
}
const art = MENU_DEPART.articles.find((a) => a.id === "omelette_poulet");
const ligne = faireLigne(MENU_DEPART, art, { formule: true, boissonId: "cafe_lait", fromage: true, sauce: "Mayo" }, 2);
const commandeOk = (creneau) => ({ prenom: "Awa", telephone: "771234567", lignes: [ligne], total: ligne.prixUnitaire * 2, creneau });

async function preparer(cfg = configTest()) {
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "config/menu"), MENU_DEPART);
    await setDoc(doc(db, "config/creneaux"), cfg);
  });
  return cfg;
}

before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-arena-commande",
    firestore: { rules: readFileSync(new URL("../firestore.rules", import.meta.url), "utf8"), host: "127.0.0.1", port: 8080 },
  });
});
after(async () => { await env.cleanup(); });
beforeEach(async () => { await env.clearFirestore(); });

test("prix : omelette poulet fromage + café au lait = 1100 + 300 + 250", () => {
  assert.equal(ligne.prixUnitaire, 1650);
});

test("un élève lit le menu et les créneaux, pas sans connexion aux commandes", async () => {
  await preparer();
  const anon = env.unauthenticatedContext().firestore();
  await assertSucceeds(getDoc(doc(anon, "config/menu")));
  await assertSucceeds(getDoc(doc(anon, "config/creneaux")));
  await assertFails(getDocs(collection(anon, "commandes_en_ligne")));
  await assertFails(getDoc(doc(anon, "config/autre")));
});

test("un élève passe une commande valide et reçoit le numéro T1", async () => {
  const cfg = await preparer();
  const db = env.authenticatedContext("eleve1").firestore();
  const r = await passerCommande(fs, db, "eleve1", commandeOk(creneauTest(cfg)));
  assert.equal(r.code, "T1");
  const snap = await assertSucceeds(getDoc(doc(db, "commandes_en_ligne", r.id)));
  assert.equal(snap.data().statut, "recue");
  assert.match(snap.data().codeRetrait, /^[0-9]{4}$/);
});

test("code secret de retrait : 4 chiffres exigés, et la caisse ne peut pas le changer", async () => {
  const cfg = await preparer();
  const c = creneauTest(cfg);
  for (const [u, mauvais] of [["m1", "12a4"], ["m2", "123"], ["m3", 1234]])
    await assert.rejects(passerCommande(fs, env.authenticatedContext(u).firestore(), u, { ...commandeOk(c), codeRetrait: mauvais }));
  const r = await passerCommande(fs, env.authenticatedContext("e1").firestore(), "e1", { ...commandeOk(c), codeRetrait: "0042" });
  const caisse = env.authenticatedContext("caisseUid", CAISSE).firestore();
  assert.equal((await getDoc(doc(caisse, "commandes_en_ligne", r.id))).data().codeRetrait, "0042");
  await assertFails(updateDoc(doc(caisse, "commandes_en_ligne", r.id), { codeRetrait: "1111" }));
});

test("un élève ne peut pas lire la commande d'un autre, ni lister toutes les commandes", async () => {
  const cfg = await preparer();
  const db1 = env.authenticatedContext("eleve1").firestore();
  const r = await passerCommande(fs, db1, "eleve1", commandeOk(creneauTest(cfg)));
  const db2 = env.authenticatedContext("eleve2").firestore();
  await assertFails(getDoc(doc(db2, "commandes_en_ligne", r.id)));
  await assertFails(getDocs(collection(db2, "commandes_en_ligne")));
  await assertSucceeds(getDocs(query(collection(db1, "commandes_en_ligne"), where("uid", "==", "eleve1"))));
});

test("un élève ne peut ni modifier le menu, ni changer le statut, ni supprimer", async () => {
  const cfg = await preparer();
  const db = env.authenticatedContext("eleve1").firestore();
  const r = await passerCommande(fs, db, "eleve1", commandeOk(creneauTest(cfg)));
  await assertFails(setDoc(doc(db, "config/menu"), { articles: [] }));
  await assertFails(updateDoc(doc(db, "commandes_en_ligne", r.id), { statut: "recuperee" }));
  await assertFails(deleteDoc(doc(db, "commandes_en_ligne", r.id)));
  // Un faux compte avec un autre email n'est pas la caisse
  const faux = env.authenticatedContext("pirate", { email: "pirate@x.com", firebase: { sign_in_provider: "password" } }).firestore();
  await assertFails(getDocs(collection(faux, "commandes_en_ligne")));
});

test("écriture directe sans passer par le compteur : refusée", async () => {
  const cfg = await preparer();
  const c = creneauTest(cfg);
  const db = env.authenticatedContext("eleve1").firestore();
  await assertFails(setDoc(doc(db, "commandes_en_ligne/x1"), {
    uid: "eleve1", prenom: "A", telephone: "771234567", lignes: [ligne], total: 100, statut: "recue",
    paiement: { mode: "retrait", statut: "a_payer" }, createdAt: serverTimestamp(), venteEnregistree: false,
    creneauId: "ctest", creneauCode: "T", retraitAt: Timestamp.fromDate(c.retraitAt), numero: 1, code: "T1",
  }));
});

test("champs invalides refusés : téléphone, statut, champ en trop", async () => {
  const cfg = await preparer();
  const c = creneauTest(cfg);
  const db = env.authenticatedContext("eleve1").firestore();
  await assert.rejects(passerCommande(fs, db, "eleve1", { ...commandeOk(c), telephone: "123" }));
  await env.clearFirestore(); await preparer(cfg);
  await assert.rejects(passerCommande(fs, db, "eleve1", { ...commandeOk(c), lignes: [] }));
  await env.clearFirestore(); await preparer(cfg);
  await assert.rejects(passerCommande(fs, db, "eleve1", { ...commandeOk(c), total: 0 }));
});

test("créneau plein : la commande suivante est refusée", async () => {
  const cfg = await preparer(configTest(2));
  const c = creneauTest(cfg);
  for (const u of ["e1", "e2"]) await passerCommande(fs, env.authenticatedContext(u).firestore(), u, commandeOk(c));
  // même en contournant la vérification du téléphone (max ignoré), les règles refusent
  await assert.rejects(passerCommande(fs, env.authenticatedContext("e3").firestore(), "e3", commandeOk({ ...c, max: 99 })));
});

test("créneau qui ferme dans moins de 15 minutes : refusé", async () => {
  const bientot = new Date(Date.now() + 10 * 60000);
  const cfg = await preparer({ ...CRENEAUX_DEPART, creneaux: { cb: { code: "Z", minutes: bientot.getUTCHours() * 60 + bientot.getUTCMinutes(), max: 5, actif: true } } });
  const at = new Date(Date.UTC(bientot.getUTCFullYear(), bientot.getUTCMonth(), bientot.getUTCDate(), bientot.getUTCHours(), bientot.getUTCMinutes()));
  const db = env.authenticatedContext("e1").firestore();
  await assert.rejects(passerCommande(fs, db, "e1", commandeOk({ id: "cb", code: "Z", max: 5, retraitAt: at })));
});

test("commandes fermées depuis la caisse : refusé", async () => {
  const cfg = await preparer({ ...configTest(), ouvert: false });
  const c = prochainsCreneaux({ ...cfg, ouvert: true }).find((x) => x.id === "ctest");
  await assert.rejects(passerCommande(fs, env.authenticatedContext("e1").firestore(), "e1", commandeOk(c)));
});

test("anti-abus : deux commandes en moins de 2 minutes du même téléphone", async () => {
  const cfg = await preparer();
  const c = creneauTest(cfg);
  const db = env.authenticatedContext("e1").firestore();
  await passerCommande(fs, db, "e1", commandeOk(c));
  await assert.rejects(passerCommande(fs, db, "e1", commandeOk(c)), /2 minutes/);
});

test("la caisse voit tout, change le statut, modifie le menu et les créneaux", async () => {
  const cfg = await preparer();
  const r = await passerCommande(fs, env.authenticatedContext("e1").firestore(), "e1", commandeOk(creneauTest(cfg)));
  const caisse = env.authenticatedContext("caisseUid", CAISSE).firestore();
  await assertSucceeds(getDocs(collection(caisse, "commandes_en_ligne")));
  await assertSucceeds(updateDoc(doc(caisse, "commandes_en_ligne", r.id), { statut: "preparation", majAt: serverTimestamp() }));
  await assertFails(updateDoc(doc(caisse, "commandes_en_ligne", r.id), { statut: "nimporte" }));
  await assertFails(updateDoc(doc(caisse, "commandes_en_ligne", r.id), { total: 1 }));
  await assertSucceeds(setDoc(doc(caisse, "config/menu"), MENU_DEPART));
  await assertSucceeds(setDoc(doc(caisse, "config/creneaux"), cfg));
});
