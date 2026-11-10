// ---------------------------------------------------------------
//  moi.js : ce que la page peut deviner en JavaScript,
//  sans rien demander au serveur ni à vous
// ---------------------------------------------------------------
(function () {
    "use strict";

    const fiche = document.querySelector("[data-devinettes]");
    if (!fiche) return;

    function oui(valeur) { return valeur ? "oui" : "non"; }

    const sombre = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const tactile = (navigator.maxTouchPoints || 0) > 0 || window.matchMedia("(pointer: coarse)").matches;
    let fuseau = "inconnu";
    try { fuseau = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { /* rien */ }

    const devinettes = [
        ["Taille de l'écran", screen.width + " × " + screen.height + " pixels"],
        ["Taille de la fenêtre", window.innerWidth + " × " + window.innerHeight + " pixels"],
        ["Densité de l'écran", "× " + (window.devicePixelRatio || 1)],
        ["Fuseau horaire", fuseau],
        ["Heure de votre appareil", new Date().toLocaleTimeString("fr-FR")],
        ["Cœurs du processeur", navigator.hardwareConcurrency ? String(navigator.hardwareConcurrency) : "non communiqué"],
        ["Mémoire", navigator.deviceMemory ? "environ " + navigator.deviceMemory + " Go" : "non communiquée"],
        ["Mode sombre", oui(sombre)],
        ["Écran tactile", oui(tactile)],
        ["Mouvement réduit", oui(window.matchMedia("(prefers-reduced-motion: reduce)").matches)],
        ["Langues du système", (navigator.languages || [navigator.language]).join(", ")],
        ["Connexion", navigator.connection && navigator.connection.effectiveType ? navigator.connection.effectiveType : "non communiquée"]
    ];

    fiche.textContent = "";
    devinettes.forEach(function (paire) {
        const ligne = document.createElement("div");
        const nom = document.createElement("dt");
        nom.textContent = paire[0];
        const valeur = document.createElement("dd");
        valeur.textContent = paire[1];
        ligne.append(nom, valeur);
        fiche.appendChild(ligne);
    });
})();
