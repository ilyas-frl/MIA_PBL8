// ---------------------------------------------------------------
//  bonjour.js : le champ « un autre prénom » va vers /bonjour/<prénom>
//  (un formulaire classique mettrait le prénom après le « ? »,
//  or ici il doit être DANS le chemin)
// ---------------------------------------------------------------
(function () {
    "use strict";

    const formulaire = document.querySelector("[data-form-bonjour]");
    if (!formulaire) return;
    formulaire.addEventListener("submit", function (e) {
        e.preventDefault();
        const prenom = formulaire.elements.prenom.value.trim();
        if (prenom) location.href = "/bonjour/" + encodeURIComponent(prenom);
    });
})();
