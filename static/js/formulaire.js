// ---------------------------------------------------------------
//  formulaire.js : la requête HTTP brute se construit pendant la frappe
//  GET  : les données sont dans la ligne de requête (l'URL)
//  POST : elles passent dans le corps, avec Content-Type et Content-Length
// ---------------------------------------------------------------
(function () {
    "use strict";

    const formulaire = document.querySelector("[data-formulaire]");
    const zoneRequete = document.querySelector("[data-requete-brute]");
    const legende = document.querySelector("[data-legende-requete]");
    const boutons = Array.from(document.querySelectorAll("[data-choix-methode]"));

    function echapper(texte) {
        return String(texte).replace(/[&<>"]/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c];
        });
    }

    function donnee(texte) { return "<span class=\"donnee\">" + echapper(texte) + "</span>"; }

    function construire() {
        const methode = formulaire.getAttribute("method").toUpperCase();
        // Le navigateur encode les champs exactement comme ça (les espaces deviennent des +)
        const corps = new URLSearchParams(new FormData(formulaire)).toString();
        const hote = "Host: " + location.host;
        let html;
        if (methode === "GET") {
            html = "GET /salut?" + donnee(corps) + " HTTP/1.1\n" + echapper(hote);
            legende.textContent = "En GET, les données voyagent dans l'URL : elles s'afficheront dans la barre d'adresse, l'historique et les journaux du serveur.";
        } else {
            const longueur = new TextEncoder().encode(corps).length;
            html = "POST /salut HTTP/1.1\n" + echapper(hote) + "\n"
                + "Content-Type: application/x-www-form-urlencoded\n"
                + "Content-Length: " + longueur + "\n\n"
                + donnee(corps);
            legende.textContent = "En POST, les données passent dans le corps de la requête, après une ligne vide. L'URL reste propre, mais les données ne sont pas secrètes : l'onglet Réseau les montre.";
        }
        zoneRequete.innerHTML = html;
    }

    boutons.forEach(function (bouton) {
        bouton.addEventListener("click", function () {
            // On change vraiment l'attribut method du formulaire
            formulaire.setAttribute("method", bouton.dataset.choixMethode);
            boutons.forEach(function (b) { b.setAttribute("aria-pressed", b === bouton ? "true" : "false"); });
            construire();
        });
    });

    formulaire.addEventListener("input", construire);
    formulaire.addEventListener("change", construire);
    construire();
})();
