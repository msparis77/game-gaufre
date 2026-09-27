// Service worker minimal : sert uniquement à afficher la notification « Commande prête »
// (sur Android, une page ne peut pas afficher de notification sans lui).
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((l) => (l[0] ? l[0].focus() : self.clients.openWindow("/"))));
});
