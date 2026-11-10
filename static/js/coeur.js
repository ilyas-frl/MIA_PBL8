// ---------------------------------------------------------------
//  coeur.js : chargé sur toutes les pages
//  - le HUD (les mesures de la requête, en bas à droite)
//  - les coulisses (touche C)
//  - le compteur de requêtes du pied de page
//  - le texte élastique (.elastique)
//  Il expose aussi quelques outils aux autres scripts : window.Coeur
// ---------------------------------------------------------------
(function () {
    "use strict";

    const corps = document.body;
    const mouvementReduit = window.matchMedia("(prefers-reduced-motion: reduce)");
    const donneesPage = lireJson("donnees-page");

    function lireJson(id) {
        const element = document.getElementById(id);
        try { return JSON.parse(element ? element.textContent : "{}"); } catch (e) { return {}; }
    }

    // ---------- Petits outils de formatage ----------

    const TEXTES_STATUT = {
        102: "Processing", 200: "OK", 201: "Created", 202: "Accepted", 204: "No Content",
        206: "Partial Content", 301: "Moved Permanently", 302: "Found", 304: "Not Modified",
        400: "Bad Request", 403: "Forbidden", 404: "Not Found", 405: "Method Not Allowed",
        418: "I'm a teapot", 500: "Internal Server Error"
    };

    function texteStatut(code) { return TEXTES_STATUT[code] || ""; }

    // La "famille" d'un code : 1xx, 2xx, 3xx, 4xx ou 5xx
    function familleStatut(code) {
        const c = Number(code);
        if (c >= 400) return "erreur";
        if (c >= 300) return "redirection";
        if (c >= 200) return "succes";
        return "info";
    }

    function formaterMs(ms) {
        if (ms === null || ms === undefined || !isFinite(ms)) return null;
        if (ms < 10) return ms.toFixed(1).replace(".", ",") + " ms";
        return Math.round(ms) + " ms";
    }

    function formaterOctets(octets) {
        if (!octets && octets !== 0) return null;
        if (octets < 1024) return octets + " o";
        return (octets / 1024).toFixed(1).replace(".", ",") + " ko";
    }

    function nomProtocole(p) {
        if (!p) return "HTTP/1.1";
        if (p === "h2") return "HTTP/2";
        if (p === "h3") return "HTTP/3";
        return p.toUpperCase();
    }

    function entreeNavigation() {
        const entrees = performance.getEntriesByType ? performance.getEntriesByType("navigation") : [];
        return entrees[0] || null;
    }

    // Lit le temps "flask" de l'en-tête Server-Timing d'une entrée de performance
    function dureeFlask(entree) {
        if (!entree || !entree.serverTiming) return null;
        const mesure = entree.serverTiming.find(function (m) { return m.name === "flask"; });
        return mesure ? mesure.duration : null;
    }

    function statutPage() {
        const nav = entreeNavigation();
        return (nav && nav.responseStatus) || Number(corps.dataset.statut) || 200;
    }

    function cheminDe(url) {
        try { const u = new URL(url, location.href); return u.pathname + u.search; } catch (e) { return url; }
    }

    // La requête HEAD rejouée sur l'adresse de la page (une seule fois, partagée)
    let promesseEnTetes = null;
    function enTetes() {
        if (!promesseEnTetes) {
            promesseEnTetes = fetch(location.href, { method: "HEAD", cache: "no-store" })
                .then(function (reponse) {
                    const liste = [];
                    reponse.headers.forEach(function (valeur, nom) { liste.push([nom, valeur]); });
                    return { statut: reponse.status, entetes: liste };
                });
        }
        return promesseEnTetes;
    }

    // ---------- Coloration syntaxique (maison, minimale) ----------

    function echapper(texte) {
        return String(texte).replace(/[&<>"]/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" }[c];
        });
    }

    // regles : liste de [expression régulière sans groupe capturant, nom de classe]
    function colorier(texte, regles) {
        const motif = new RegExp(regles.map(function (r) { return "(" + r[0].source + ")"; }).join("|"), "g");
        let sortie = "";
        let dernier = 0;
        let m;
        while ((m = motif.exec(texte)) !== null) {
            if (m[0] === "") { motif.lastIndex++; continue; }
            sortie += echapper(texte.slice(dernier, m.index));
            const i = m.slice(1).findIndex(function (x) { return x !== undefined; });
            sortie += "<span class=\"c-" + regles[i][1] + "\">" + echapper(m[0]) + "</span>";
            dernier = m.index + m[0].length;
        }
        return sortie + echapper(texte.slice(dernier));
    }

    const REGLES_PYTHON = [
        [/#[^\n]*/, "commentaire"],
        [/"""[\s\S]*?"""|'''[\s\S]*?'''/, "chaine"],
        [/@[\w.]+(?:\([^\n]*\))?/, "route"],
        [/[fFrRbB]?"(?:\\.|[^"\\\n])*"|[fFrRbB]?'(?:\\.|[^'\\\n])*'/, "chaine"],
        [/\b(?:def|return|if|elif|else|for|in|not|and|or|import|from|try|except|with|as|None|True|False|lambda|is|while|pass)\b/, "mot"],
        [/\b\d+(?:\.\d+)?\b/, "nombre"]
    ];

    const REGLES_TEMPLATE = [
        [/\{#[\s\S]*?#\}/, "commentaire"],
        [/\{\{[\s\S]*?\}\}|\{%[\s\S]*?%\}/, "jinja"],
        [/<!--[\s\S]*?-->/, "commentaire"],
        [/<\/?[a-zA-Z][\w-]*|\/?>/, "balise"],
        [/"[^"\n]*"/, "chaine"]
    ];

    function colorierPython(texte) { return colorier(texte, REGLES_PYTHON); }
    function colorierTemplate(texte) { return colorier(texte, REGLES_TEMPLATE); }

    // ---------- Le HUD ----------

    const hudStatut = document.querySelector("[data-hud-statut]");
    const hudDetail = document.querySelector("[data-hud-detail]");

    function afficherHud(statut, flask, octets, chemin) {
        if (!hudStatut) return;
        hudStatut.textContent = statut;
        hudStatut.dataset.famille = familleStatut(statut);
        const morceaux = [];
        if (chemin) morceaux.push(chemin);
        const ms = formaterMs(flask);
        morceaux.push(ms ? "Flask " + ms : "Flask ?");
        morceaux.push(octets);
        hudDetail.textContent = morceaux.join(" · ");
    }

    function poidsEntree(entree) {
        if (!entree) return "?";
        if (entree.transferSize > 0) return formaterOctets(entree.transferSize);
        if (entree.decodedBodySize > 0 || entree.encodedBodySize > 0) return "en cache";
        return "poids inconnu";
    }

    function hudInitial() {
        const nav = entreeNavigation();
        afficherHud(statutPage(), dureeFlask(nav), poidsEntree(nav), "");
    }

    // ---------- Le compteur de requêtes du pied de page ----------

    const compteur = document.querySelector("[data-compte-requetes]");
    let nombreRequetes = 1; // la page HTML elle-même
    let nombreExternes = 0;

    function compterEntree(entree) {
        nombreRequetes++;
        try { if (new URL(entree.name).origin !== location.origin) nombreExternes++; } catch (e) { /* rien */ }
    }

    function afficherCompteur() {
        if (!compteur) return;
        const pluriel = nombreRequetes > 1 ? "requêtes" : "requête";
        let texte = "Cette page a fait " + nombreRequetes + " " + pluriel + ", ";
        if (nombreExternes === 0) {
            texte += nombreRequetes > 1 ? "toutes vers " + location.host + "." : "vers " + location.host + ".";
        } else {
            texte += "dont " + nombreExternes + " vers d'autres domaines que " + location.host + ".";
        }
        compteur.textContent = texte;
    }

    if (performance.getEntriesByType) {
        performance.getEntriesByType("resource").forEach(compterEntree);
    }

    // Chaque nouvelle requête (un fetch d'une démo, une image…) met à jour le HUD et le compteur
    if ("PerformanceObserver" in window) {
        try {
            const observateur = new PerformanceObserver(function (liste) {
                liste.getEntries().forEach(function (entree) {
                    compterEntree(entree);
                    // (on ignore la requête HEAD qui rejoue la page elle-même pour les coulisses)
                    const estLaPage = entree.name === location.href;
                    if (!estLaPage && (entree.initiatorType === "fetch" || entree.initiatorType === "xmlhttprequest")) {
                        afficherHud(entree.responseStatus || "·", dureeFlask(entree), poidsEntree(entree), cheminDe(entree.name));
                    }
                });
                afficherCompteur();
            });
            observateur.observe({ type: "resource", buffered: false });
        } catch (e) { /* navigateur trop ancien */ }
    }

    // ---------- Les coulisses ----------

    const dialogue = document.getElementById("coulisses");
    const onglets = Array.from(document.querySelectorAll("[data-onglet]"));
    const codeTemplate = document.querySelector("[data-code-template]");
    const codeRoute = document.querySelector("[data-code-route]");
    const codeReponse = document.querySelector("[data-code-reponse]");
    const nomTemplate = document.querySelector("[data-nom-template]");
    const boutonBase = document.querySelector("[data-voir-base]");
    let dernierFocus = null;
    let dejaCharge = false;
    let templateAffiche = corps.dataset.template;

    function choisirOnglet(nom, donnerFocus) {
        onglets.forEach(function (onglet) {
            const actif = onglet.dataset.onglet === nom;
            onglet.setAttribute("aria-selected", actif ? "true" : "false");
            onglet.tabIndex = actif ? 0 : -1;
            document.getElementById(onglet.getAttribute("aria-controls")).hidden = !actif;
            if (actif && donnerFocus) onglet.focus();
        });
    }

    function chargerTemplate(nom) {
        templateAffiche = nom;
        nomTemplate.textContent = nom;
        boutonBase.textContent = nom === "base.html" ? "Revenir à " + corps.dataset.template : "Voir base.html, dont il hérite";
        codeTemplate.textContent = "Chargement…";
        fetch("/api/coulisses?template=" + encodeURIComponent(nom))
            .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
            .then(function (d) { codeTemplate.innerHTML = colorierTemplate(d.template_source); })
            .catch(function () { codeTemplate.textContent = "Impossible de lire le template (le serveur a refusé ou ne répond pas)."; });
    }

    function chargerReponse() {
        const introPost = document.querySelector("[data-intro-reponse]");
        if (corps.dataset.methode === "POST") {
            introPost.textContent = "Cette page est la réponse à une requête POST. Une réponse POST ne peut pas être rejouée sans renvoyer le formulaire : voici les en-têtes que donne la même adresse demandée en HEAD (donc comme un GET, sans les données).";
        }
        enTetes().then(function (r) {
            const nav = entreeNavigation();
            const ligne = nomProtocole(nav && nav.nextHopProtocol) + " " + r.statut + " " + texteStatut(r.statut);
            let html = "<span class=\"c-statut\" data-famille=\"" + familleStatut(r.statut) + "\">" + echapper(ligne) + "</span>\n";
            r.entetes.forEach(function (paire) {
                html += "<span class=\"c-entete\">" + echapper(paire[0]) + "</span>: " + echapper(paire[1]) + "\n";
            });
            codeReponse.innerHTML = html;
        }).catch(function () {
            codeReponse.textContent = "La requête HEAD a échoué : le serveur ne répond pas.";
        });
    }

    function charger() {
        if (dejaCharge) return;
        dejaCharge = true;
        if (corps.dataset.template) {
            chargerTemplate(corps.dataset.template);
        } else {
            codeTemplate.textContent = "Cette réponse n'a pas utilisé de template.";
            boutonBase.hidden = true;
        }
        if (donneesPage.code_route) {
            codeRoute.innerHTML = colorierPython(donneesPage.code_route);
        } else {
            codeRoute.textContent = "Aucune fonction Python n'a été trouvée pour cette adresse.";
        }
        chargerReponse();
    }

    function ouvrirCoulisses(onglet) {
        if (!dialogue || dialogue.open) return;
        dernierFocus = document.activeElement;
        charger();
        choisirOnglet(onglet || "template");
        dialogue.showModal();
        const actif = onglets.find(function (o) { return o.getAttribute("aria-selected") === "true"; });
        if (actif) actif.focus();
    }

    function fermerCoulisses() { if (dialogue && dialogue.open) dialogue.close(); }

    if (dialogue) {
        // showModal() rend le reste de la page inerte : le focus reste dans le panneau.
        // À la fermeture, on rend le focus au bouton qui l'a ouvert.
        dialogue.addEventListener("close", function () {
            if (dernierFocus && typeof dernierFocus.focus === "function") dernierFocus.focus();
        });

        document.querySelectorAll("[data-ouvrir-coulisses]").forEach(function (bouton) {
            bouton.addEventListener("click", function () { ouvrirCoulisses(bouton.dataset.ouvrirCoulisses || "template"); });
        });
        document.querySelector("[data-fermer-coulisses]").addEventListener("click", fermerCoulisses);

        boutonBase.addEventListener("click", function () {
            chargerTemplate(templateAffiche === "base.html" ? corps.dataset.template : "base.html");
        });

        onglets.forEach(function (onglet, i) {
            onglet.addEventListener("click", function () { choisirOnglet(onglet.dataset.onglet); });
            onglet.addEventListener("keydown", function (e) {
                let cible = null;
                if (e.key === "ArrowRight") cible = onglets[(i + 1) % onglets.length];
                if (e.key === "ArrowLeft") cible = onglets[(i - 1 + onglets.length) % onglets.length];
                if (e.key === "Home") cible = onglets[0];
                if (e.key === "End") cible = onglets[onglets.length - 1];
                if (cible) { e.preventDefault(); choisirOnglet(cible.dataset.onglet, true); }
            });
        });

        // Touche C : ouvre ou ferme, sauf si on écrit dans un champ
        document.addEventListener("keydown", function (e) {
            if (e.key !== "c" && e.key !== "C") return;
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            const cible = e.target;
            if (cible && cible.closest && cible.closest("input, textarea, select, [contenteditable]")) return;
            e.preventDefault();
            if (dialogue.open) fermerCoulisses(); else ouvrirCoulisses();
        });
    }

    // ---------- Texte élastique ----------
    // Chaque lettre devient un <span> dont la largeur (axe wdth) s'étire près du curseur.

    const elastiques = [];
    const pointeurFin = window.matchMedia("(hover: hover) and (pointer: fine)");

    function preparerElastique(element) {
        const texte = element.textContent.trim();
        const base = Number(element.dataset.base || 112);
        const max = Number(element.dataset.max || 150);
        element.textContent = "";

        const pourLecteur = document.createElement("span");
        pourLecteur.className = "visuellement-cache";
        pourLecteur.textContent = texte;
        const visuel = document.createElement("span");
        visuel.setAttribute("aria-hidden", "true");

        const lettres = [];
        texte.split(/(\s+)/).forEach(function (morceau) {
            if (/^\s+$/.test(morceau)) { visuel.appendChild(document.createTextNode(" ")); return; }
            if (!morceau) return;
            const mot = document.createElement("span");
            mot.className = "mot";
            Array.from(morceau).forEach(function (caractere) {
                const lettre = document.createElement("span");
                lettre.className = "lettre";
                lettre.textContent = caractere;
                lettre.style.fontStretch = base + "%";
                mot.appendChild(lettre);
                lettres.push({ element: lettre, actuel: base });
            });
            visuel.appendChild(mot);
        });
        element.append(pourLecteur, visuel);
        elastiques.push({ element: element, lettres: lettres, base: base, max: max });
    }

    document.querySelectorAll(".elastique").forEach(preparerElastique);

    let souris = null;
    let animationEnCours = false;

    function animerElastiques() {
        let encoreEnMouvement = false;
        elastiques.forEach(function (bloc) {
            const cadre = bloc.element.getBoundingClientRect();
            if (cadre.bottom < 0 || cadre.top > innerHeight) return;
            bloc.lettres.forEach(function (l) {
                let cible = bloc.base;
                if (souris) {
                    const r = l.element.getBoundingClientRect();
                    const dx = souris.x - (r.left + r.width / 2);
                    const dy = souris.y - (r.top + r.height / 2);
                    const proximite = Math.max(0, 1 - Math.hypot(dx, dy) / 260);
                    cible = bloc.base + (bloc.max - bloc.base) * proximite * proximite;
                }
                const suivant = l.actuel + (cible - l.actuel) * 0.18;
                if (Math.abs(suivant - l.actuel) > 0.05) encoreEnMouvement = true;
                l.actuel = suivant;
                l.element.style.fontStretch = suivant.toFixed(1) + "%";
            });
        });
        if (encoreEnMouvement) requestAnimationFrame(animerElastiques);
        else animationEnCours = false;
    }

    function relancerElastiques() {
        if (!animationEnCours) { animationEnCours = true; requestAnimationFrame(animerElastiques); }
    }

    if (elastiques.length) {
        document.addEventListener("pointermove", function (e) {
            if (mouvementReduit.matches || !pointeurFin.matches) return;
            souris = { x: e.clientX, y: e.clientY };
            relancerElastiques();
        }, { passive: true });
        document.addEventListener("pointerleave", function () { souris = null; relancerElastiques(); });
    }

    // ---------- Démarrage ----------

    hudInitial();
    afficherCompteur();
    window.addEventListener("load", function () {
        // Au chargement, les polices et les scripts ont fini : on recompte
        hudInitial();
        afficherCompteur();
    });

    window.Coeur = {
        mouvementReduit: mouvementReduit,
        donneesPage: donneesPage,
        texteStatut: texteStatut,
        familleStatut: familleStatut,
        formaterMs: formaterMs,
        formaterOctets: formaterOctets,
        nomProtocole: nomProtocole,
        entreeNavigation: entreeNavigation,
        dureeFlask: dureeFlask,
        statutPage: statutPage,
        enTetes: enTetes,
        echapper: echapper,
        colorierPython: colorierPython,
        colorierTemplate: colorierTemplate,
        preparerElastique: preparerElastique,
        ouvrirCoulisses: ouvrirCoulisses
    };
})();
