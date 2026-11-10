// ---------------------------------------------------------------
//  introuvable.js : la page 404, « paquet perdu »
//  Un traceroute en animation avec les vraies mesures de la visite,
//  puis les vraies routes du site comme destinations possibles.
// ---------------------------------------------------------------
(function () {
    "use strict";

    const C = window.Coeur;
    const zone = document.querySelector("[data-traceroute]");
    const destinations = document.querySelector("[data-destinations]");
    if (!zone || !C) return;

    const nav = C.entreeNavigation();

    // Une durée mesurée par le navigateur, ou "?" s'il ne la donne pas
    function duree(debut, fin) {
        if (!nav || !(fin > 0) || fin < debut) return "? ms";
        return C.formaterMs(fin - debut) || "? ms";
    }

    function saut(numero, etape, temps) {
        return String(numero).padStart(2) + "  " + etape.padEnd(40) + (temps || "");
    }

    const sauts = [
        saut(1, "votre navigateur", "0 ms"),
        saut(2, "annuaire DNS", duree(nav && nav.domainLookupStart, nav && nav.domainLookupEnd)),
        saut(3, "connexion à " + location.host, duree(nav && nav.connectStart, nav && nav.connectEnd)),
        saut(4, "Flask : aucune route pour ce chemin", C.formaterMs(C.dureeFlask(nav)) || "? ms"),
        saut(5, "* * *"),
        saut(6, "* * *"),
        saut(7, "* * *")
    ];
    const fin = "abandon : 404 Not Found";

    function ecrireLigne(texte, perdu) {
        zone.append("\n");
        const span = document.createElement("span");
        if (perdu) span.className = "trace-perdu";
        span.textContent = texte;
        zone.appendChild(span);
    }

    if (C.mouvementReduit.matches) {
        sauts.forEach(function (s) { ecrireLigne(s); });
        ecrireLigne(fin, true);
    } else {
        let i = 0;
        const minuteur = setInterval(function () {
            if (i < sauts.length) { ecrireLigne(sauts[i], sauts[i].indexOf("*") !== -1); i++; return; }
            ecrireLigne(fin, true);
            clearInterval(minuteur);
        }, 420);
    }

    // Les vraies routes du site, lues par le serveur dans app.url_map
    fetch("/api/routes")
        .then(function (r) { return r.json(); })
        .then(function (routes) {
            destinations.textContent = "";
            routes.forEach(function (route) {
                const li = document.createElement("li");
                const lien = document.createElement("a");
                lien.href = route;
                lien.textContent = route;
                li.appendChild(lien);
                destinations.appendChild(li);
            });
        })
        .catch(function () { /* on garde le lien vers l'accueil */ });
})();
