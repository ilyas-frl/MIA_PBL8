// ---------------------------------------------------------------
//  calcul.js : les paramètres a, b et op modifiables en direct
//  À chaque modification : l'URL se reconstruit, puis on demande
//  le résultat à /api/calcul (qui répond en JSON).
// ---------------------------------------------------------------
(function () {
    "use strict";

    const C = window.Coeur;
    const formulaire = document.querySelector("[data-form-calcul]");
    const zoneUrl = document.querySelector("[data-url-calcul]");
    const zoneResultat = document.querySelector("[data-resultat]");
    const zoneDetail = document.querySelector("[data-detail-requete]");
    const SYMBOLES = { plus: "+", moins: "-", fois: "×", divise: "÷" };
    let attente = null;
    let numeroRequete = 0;

    function lireParametres() {
        return new URLSearchParams(new FormData(formulaire));
    }

    // Reconstruit l'URL affichée, avec les valeurs en bleu
    function afficherUrl(params) {
        zoneUrl.textContent = "";
        const hote = document.createElement("span");
        hote.className = "gris";
        hote.textContent = location.host;
        zoneUrl.append(hote, "/calcul?");
        let premier = true;
        params.forEach(function (valeur, nom) {
            if (!premier) zoneUrl.append("&");
            premier = false;
            const variable = document.createElement("span");
            variable.className = "variable";
            variable.textContent = encodeURIComponent(valeur);
            zoneUrl.append(nom + "=", variable);
        });
    }

    async function calculer() {
        const params = lireParametres();
        afficherUrl(params);
        // L'URL de la barre d'adresse suit aussi, sans recharger la page
        history.replaceState(null, "", "/calcul?" + params.toString());

        const numero = ++numeroRequete;
        const adresse = "/api/calcul?" + params.toString();
        const debut = performance.now();
        try {
            const reponse = await fetch(adresse, { cache: "no-store" });
            const donnees = await reponse.json();
            if (numero !== numeroRequete) return; // une réponse plus récente est déjà arrivée
            const duree = C ? C.formaterMs(performance.now() - debut) : "";
            if (reponse.ok) {
                zoneResultat.classList.remove("erreur");
                zoneResultat.textContent = donnees.a + " " + SYMBOLES[donnees.op] + " " + donnees.b + " = " + donnees.resultat;
            } else {
                zoneResultat.classList.add("erreur");
                zoneResultat.textContent = "Erreur " + reponse.status + " : " + donnees.erreur;
            }
            zoneDetail.textContent = "GET " + adresse + " → " + reponse.status + " " + (C ? C.texteStatut(reponse.status) : "") + " en " + duree;
        } catch (erreur) {
            zoneDetail.textContent = "Le serveur ne répond pas.";
        }
    }

    formulaire.addEventListener("input", function () {
        clearTimeout(attente);
        attente = setTimeout(calculer, 160);
    });
    formulaire.addEventListener("submit", function (e) {
        e.preventDefault();
        calculer();
    });
})();
