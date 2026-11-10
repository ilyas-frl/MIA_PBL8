// ---------------------------------------------------------------
//  voyage.js : le voyage de la requête qui vient d'afficher l'accueil
//  Toutes les valeurs viennent de PerformanceNavigationTiming :
//  ce sont les vraies mesures de la visite en cours.
// ---------------------------------------------------------------
(function () {
    "use strict";

    const C = window.Coeur;
    if (!C) return;

    const nav = C.entreeNavigation();
    const $ = function (sel) { return document.querySelector(sel); };

    function ms(valeur) { return C.formaterMs(valeur) || "?"; }

    // Une durée entre deux instants, ou null si le navigateur ne la donne pas
    function ecart(debut, fin) {
        if (!nav || !(fin > 0) || !(debut >= 0) || fin < debut) return null;
        return fin - debut;
    }

    // ---------- La ligne de requête du hero ----------

    const ligneHero = $("[data-ligne-requete]");
    if (ligneHero) {
        const statut = C.statutPage();
        let texte = "GET " + location.pathname + location.search + " " + C.nomProtocole(nav && nav.nextHopProtocol);
        texte += "  →  " + statut + " " + C.texteStatut(statut);
        const total = nav ? ecart(nav.startTime, nav.responseEnd) : null;
        if (total !== null) texte += " en " + ms(total);
        ligneHero.textContent = texte;
    }

    // ---------- Étape 1 : l'adresse découpée ----------

    const EXPLICATIONS = {
        protocole: "Le protocole : la langue que parlent le navigateur et le serveur. Le « s » de https veut dire que la conversation est chiffrée.",
        domaine: "Le nom de domaine : le nom du serveur. Il faut d'abord le traduire en adresse IP (étape 2).",
        chemin: "Le chemin : la page demandée. Flask s'en sert pour choisir la fonction Python à exécuter (étape 4).",
        parametres: "Les paramètres : des informations en plus, après le « ? », sous forme de paires nom=valeur.",
        ancre: "L'ancre, après le « # » : elle reste dans votre navigateur, le serveur ne la reçoit jamais."
    };

    const urlDecoupee = $("[data-url-decoupee]");
    const urlExplication = $("[data-url-explication]");
    if (urlDecoupee) {
        const morceaux = [
            ["protocole", location.protocol + "//"],
            ["domaine", location.host],
            ["chemin", location.pathname]
        ];
        if (location.search) morceaux.push(["parametres", location.search]);
        if (location.hash) morceaux.push(["ancre", location.hash]);
        morceaux.forEach(function (m) {
            const span = document.createElement("span");
            span.className = "u-" + m[0];
            span.textContent = m[1];
            span.tabIndex = 0;
            const expliquer = function () { urlExplication.textContent = EXPLICATIONS[m[0]]; };
            span.addEventListener("mouseenter", expliquer);
            span.addEventListener("focus", expliquer);
            urlDecoupee.appendChild(span);
        });
    }
    if (nav && nav.redirectCount > 0) $("[data-redirection]").hidden = false;

    // ---------- Étape 4 : la fonction Python ----------

    const codeAccueil = $("[data-code-accueil]");
    if (codeAccueil) codeAccueil.innerHTML = C.colorierPython(C.donneesPage.code_route || "");

    // ---------- Les mesures (une fois la page complètement chargée) ----------

    function premierDessin() {
        const e = performance.getEntriesByName ? performance.getEntriesByName("first-contentful-paint")[0] : null;
        return e ? e.startTime : null;
    }

    function nomCourt(url) {
        try {
            const u = new URL(url);
            const nom = u.pathname.split("/").pop() || u.pathname;
            return u.origin === location.origin ? nom : u.host + "/" + nom;
        } catch (e) { return url; }
    }

    function remplirMesures() {
        if (!nav) {
            document.querySelectorAll(".etape .mesure").forEach(function (el) {
                el.textContent = "Votre navigateur ne donne pas ces mesures.";
            });
            return;
        }

        // Étape 2 : DNS
        const dns = ecart(nav.domainLookupStart, nav.domainLookupEnd);
        $("[data-mesure-dns]").textContent = dns === null ? "Mesure indisponible dans votre navigateur."
            : dns < 0.05 ? "0 ms : déjà en mémoire, aucune recherche nécessaire."
            : ms(dns) + " pour trouver l'adresse IP.";

        // Étape 3 : la connexion
        const connexion = ecart(nav.connectStart, nav.connectEnd);
        const tls = nav.secureConnectionStart > 0 ? ecart(nav.secureConnectionStart, nav.connectEnd) : null;
        const protocole = C.nomProtocole(nav.nextHopProtocol);
        $("[data-mesure-connexion]").textContent = connexion === null ? "Mesure indisponible dans votre navigateur."
            : connexion < 0.05 ? "0 ms : connexion déjà ouverte, réutilisée."
            : ms(connexion) + " pour ouvrir la connexion.";
        let detail;
        if (location.protocol === "http:") {
            detail = "Ici, aucun chiffrement : la page est servie en http, sans doute depuis votre propre ordinateur. Le protocole utilisé est " + protocole + ".";
        } else if (tls !== null && connexion > 0.05) {
            detail = "Dont " + ms(tls) + " pour se mettre d'accord sur le chiffrement (TLS) : plus personne entre vous et le serveur ne peut lire la conversation. Le protocole utilisé est " + protocole + ".";
        } else {
            detail = "Une connexion déjà ouverte (et déjà chiffrée) a servi à nouveau : pas besoin de refaire la poignée de main. Le protocole utilisé est " + protocole + ".";
        }
        $("[data-detail-connexion]").textContent = detail;

        // Étape 4 : le temps de Flask
        const flask = C.dureeFlask(nav);
        $("[data-mesure-flask]").textContent = flask === null
            ? "Votre navigateur ne transmet pas le temps du serveur (l'en-tête Server-Timing)."
            : "Elle a fabriqué la page en " + ms(flask) + ".";

        // Étape 5 : la réponse
        const ttfb = ecart(nav.requestStart, nav.responseStart);
        $("[data-mesure-reponse]").textContent = ttfb === null ? "Mesure indisponible."
            : "Premier octet reçu " + ms(ttfb) + " après la demande.";
        let poids;
        if (nav.transferSize > 0) {
            poids = C.formaterOctets(nav.transferSize) + " ont voyagé sur le réseau pour un HTML de " + C.formaterOctets(nav.decodedBodySize) + " (le reste, ce sont les en-têtes et la compression). Code de statut : " + C.statutPage() + " " + C.texteStatut(C.statutPage()) + ".";
        } else if (nav.decodedBodySize > 0) {
            poids = "Rien n'a voyagé : la page venait du cache de votre navigateur (" + C.formaterOctets(nav.decodedBodySize) + " de HTML).";
        } else {
            poids = "Votre navigateur ne donne pas le poids de la réponse.";
        }
        $("[data-detail-reponse]").textContent = poids;

        // Étape 6 : le rendu
        const fcp = premierDessin();
        $("[data-mesure-rendu]").textContent = fcp === null ? "Votre navigateur ne mesure pas le premier dessin."
            : "Premier dessin à " + ms(fcp) + ".";
        const ressources = performance.getEntriesByType("resource").filter(function (r) {
            return r.initiatorType !== "fetch" && r.initiatorType !== "xmlhttprequest";
        });
        const liste = $("[data-liste-fichiers]");
        liste.textContent = "";
        let externes = 0;
        ressources.forEach(function (r) {
            const li = document.createElement("li");
            const nom = document.createElement("span");
            nom.textContent = nomCourt(r.name);
            const taille = document.createElement("span");
            taille.textContent = r.transferSize > 0 ? C.formaterOctets(r.transferSize) : (r.decodedBodySize > 0 ? "en cache" : "?");
            li.append(nom, taille);
            liste.appendChild(li);
            try { if (new URL(r.name).origin !== location.origin) externes++; } catch (e) { /* rien */ }
        });
        const phrase = externes === 0
            ? "Il a lu le HTML, puis demandé ces " + ressources.length + " fichiers, tous à " + location.host + " :"
            : "Il a lu le HTML, puis demandé ces " + ressources.length + " fichiers, dont " + externes + " à d'autres domaines :";
        $("[data-detail-rendu]").textContent = phrase;

        construireCascade(ressources, fcp, flask);
    }

    // ---------- La cascade ----------

    let lignes = [];

    function construireCascade(ressources, fcp, flask) {
        const boite = $("[data-cascade]");
        if (!boite) return;
        const segments = [];
        const ajouter = function (nom, debut, fin, etapes, classe) {
            if (!(fin >= debut) || !(debut >= 0)) return;
            segments.push({ nom: nom, debut: debut, fin: fin, etapes: etapes, classe: classe || "" });
        };

        ajouter("requête", nav.startTime, nav.responseEnd, ["adresse"]);
        if (nav.redirectCount > 0 && nav.redirectEnd > 0) ajouter("redirection", nav.redirectStart, nav.redirectEnd, ["adresse"]);
        ajouter("DNS", nav.domainLookupStart, nav.domainLookupEnd, ["dns"]);
        if (nav.secureConnectionStart > 0) {
            ajouter("connexion", nav.connectStart, nav.secureConnectionStart, ["connexion"]);
            ajouter("TLS", nav.secureConnectionStart, nav.connectEnd, ["connexion"]);
        } else {
            ajouter("connexion", nav.connectStart, nav.connectEnd, ["connexion"]);
        }
        ajouter("attente", nav.requestStart, nav.responseStart, ["flask", "reponse"]);
        if (flask !== null && nav.responseStart > 0) {
            ajouter("Flask", Math.max(nav.requestStart, nav.responseStart - flask), nav.responseStart, ["flask"]);
        }
        ajouter("réception", nav.responseStart, nav.responseEnd, ["reponse"]);
        if (fcp !== null) ajouter("dessin", nav.responseEnd, fcp, ["rendu"]);

        let premiereRessource = true;
        ressources.forEach(function (r) {
            ajouter(nomCourt(r.name), r.startTime, r.responseEnd, ["rendu"], "ressource" + (premiereRessource ? " separateur" : ""));
            premiereRessource = false;
        });

        // Sur mobile, les fichiers sont cachés : l'échelle s'arrête au dessin de la page
        const mobile = window.matchMedia("(max-width: 980px)").matches;
        const visibles = segments.filter(function (s) { return !mobile || s.classe.indexOf("ressource") === -1; });
        const total = Math.max.apply(null, visibles.map(function (s) { return s.fin; }).concat([1]));
        $("[data-cascade-total]").textContent = ms(total);
        boite.textContent = "";
        lignes = segments.map(function (s) {
            const li = document.createElement("li");
            li.className = s.classe;
            const nom = document.createElement("span");
            nom.className = "nom";
            nom.textContent = s.nom;
            const piste = document.createElement("span");
            piste.className = "piste";
            const segment = document.createElement("span");
            segment.className = "segment";
            segment.style.left = (s.debut / total * 100).toFixed(2) + "%";
            segment.style.width = (Math.min(s.fin - s.debut, total - s.debut) / total * 100).toFixed(2) + "%";
            piste.appendChild(segment);
            const duree = document.createElement("span");
            duree.className = "duree";
            duree.textContent = ms(s.fin - s.debut);
            li.append(nom, piste, duree);
            boite.appendChild(li);
            return { element: li, etapes: s.etapes };
        });
        allumer(etapeActive);
    }

    // ---------- Quelle étape est à l'écran ? ----------

    let etapeActive = "adresse";
    const etapes = Array.from(document.querySelectorAll("[data-etape]"));

    function allumer(nom) {
        etapeActive = nom;
        etapes.forEach(function (e) { e.classList.toggle("actif", e.dataset.etape === nom); });
        lignes.forEach(function (l) { l.element.classList.toggle("actif", l.etapes.indexOf(nom) !== -1); });
    }

    if ("IntersectionObserver" in window) {
        const observateur = new IntersectionObserver(function (entrees) {
            entrees.forEach(function (e) { if (e.isIntersecting) allumer(e.target.dataset.etape); });
        }, { rootMargin: "-45% 0px -50% 0px" });
        etapes.forEach(function (e) { observateur.observe(e); });
    } else {
        etapes.forEach(function (e) { e.classList.add("actif"); });
    }
    allumer("adresse");

    // ---------- Les vrais en-têtes de la réponse (requête HEAD) ----------

    const zoneEntetes = $("[data-entetes-reponse]");
    C.enTetes().then(function (r) {
        let html = "<span class=\"c-statut\" data-famille=\"" + C.familleStatut(r.statut) + "\">"
            + C.echapper(C.nomProtocole(nav && nav.nextHopProtocol) + " " + r.statut + " " + C.texteStatut(r.statut)) + "</span>\n";
        r.entetes.forEach(function (paire) {
            const important = paire[0] === "server-timing" || paire[0] === "x-fait-par";
            html += (important ? "<span class=\"c-route\">" : "") + "<span class=\"c-entete\">" + C.echapper(paire[0]) + "</span>: "
                + C.echapper(paire[1]) + (important ? "</span>" : "") + "\n";
        });
        zoneEntetes.innerHTML = html;
    }).catch(function () {
        zoneEntetes.textContent = "Impossible de rejouer la requête pour lire les en-têtes.";
    });

    if (document.readyState === "complete") setTimeout(remplirMesures, 0);
    else window.addEventListener("load", function () { setTimeout(remplirMesures, 0); });

    // Le premier dessin arrive parfois après le chargement : on refait les mesures à ce moment-là
    if ("PerformanceObserver" in window) {
        try {
            new PerformanceObserver(function (liste) {
                if (liste.getEntries().some(function (e) { return e.name === "first-contentful-paint"; })) {
                    setTimeout(remplirMesures, 0);
                }
            }).observe({ type: "paint", buffered: true });
        } catch (e) { /* navigateur trop ancien */ }
    }

    // ---------- Les codes de statut des projets (infobulles) ----------

    document.querySelectorAll(".projet-statut").forEach(function (bouton) {
        bouton.addEventListener("click", function () {
            const ouvert = bouton.getAttribute("aria-expanded") === "true";
            bouton.setAttribute("aria-expanded", ouvert ? "false" : "true");
            document.getElementById(bouton.getAttribute("aria-controls")).hidden = ouvert;
        });
    });
})();
