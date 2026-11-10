// ---------------------------------------------------------------
//  loisirs.js : une balle de tennis à frapper sur le court
//  Gravité, rebonds, et on la frappe en passant la souris (ou en
//  touchant du doigt) dessus. Deux rebonds de suite : fin de l'échange.
// ---------------------------------------------------------------
(function () {
    "use strict";

    const court = document.querySelector("[data-court]");
    const toile = document.querySelector("[data-balle]");
    if (!court || !toile) return;

    const zoneEchanges = document.querySelector("[data-echanges]");
    const zoneRecord = document.querySelector("[data-record]");
    const zoneConsigne = document.querySelector("[data-consigne]");
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = toile.getContext("2d");
    const ratio = Math.min(2, window.devicePixelRatio || 1);

    const GRAVITE = 1900;       // pixels par seconde au carré
    const REBOND = 0.78;        // la balle garde 78 % de sa vitesse au rebond
    let largeur = 0, hauteur = 0, rayon = 16;
    const balle = { x: 0, y: 0, vx: 0, vy: 0, rebonds: 0, rotation: 0 };
    let echanges = 0;
    let record = 0;
    let derniereFrappe = 0;
    let dernierPointeur = null;

    try { record = Number(sessionStorage.getItem("record-tennis")) || 0; } catch (e) { record = 0; }
    zoneRecord.textContent = record;

    function redimensionner() {
        largeur = court.clientWidth;
        hauteur = court.clientHeight;
        toile.width = Math.round(largeur * ratio);
        toile.height = Math.round(hauteur * ratio);
        rayon = Math.max(14, Math.min(largeur, hauteur) * 0.045);
    }

    function lancer() {
        balle.x = largeur * 0.5;
        balle.y = rayon * 2;
        balle.vx = (Math.random() - 0.5) * 300;
        balle.vy = 0;
        balle.rebonds = 0;
    }

    function finEchange() {
        if (echanges > record) {
            record = echanges;
            zoneRecord.textContent = record;
            try { sessionStorage.setItem("record-tennis", String(record)); } catch (e) { /* rien */ }
        }
        if (echanges > 0) zoneConsigne.textContent = "Deux rebonds : fin de l'échange à " + echanges + ". Refrappez la balle.";
        echanges = 0;
        zoneEchanges.textContent = 0;
    }

    function frapper(px, py, vitesseX, vitesseY) {
        const maintenant = performance.now();
        if (maintenant - derniereFrappe < 180) return;
        if (Math.hypot(px - balle.x, py - balle.y) > rayon + 22) return;
        derniereFrappe = maintenant;
        // La balle part à l'opposé du point d'impact, plus la vitesse du geste
        balle.vx = (balle.x - px) * 14 + vitesseX * 0.5;
        balle.vy = Math.min(-900, vitesseY * 0.5 - 1050);
        balle.vx = Math.max(-1400, Math.min(1400, balle.vx));
        balle.rebonds = 0;
        echanges++;
        zoneEchanges.textContent = echanges;
        zoneConsigne.textContent = "L'échange s'arrête si la balle rebondit deux fois.";
        relancer();
    }

    function position(e) {
        const cadre = toile.getBoundingClientRect();
        return { x: e.clientX - cadre.left, y: e.clientY - cadre.top, t: performance.now() };
    }

    toile.addEventListener("pointermove", function (e) {
        const p = position(e);
        if (dernierPointeur) {
            const dt = Math.max(1, p.t - dernierPointeur.t) / 1000;
            frapper(p.x, p.y, (p.x - dernierPointeur.x) / dt, (p.y - dernierPointeur.y) / dt);
        }
        dernierPointeur = p;
    });
    toile.addEventListener("pointerdown", function (e) {
        const p = position(e);
        frapper(p.x, p.y, 0, -400);
        dernierPointeur = p;
    });
    toile.addEventListener("pointerleave", function () { dernierPointeur = null; });

    // ---------- La physique ----------

    function avancer(dt) {
        balle.vy += GRAVITE * dt;
        balle.x += balle.vx * dt;
        balle.y += balle.vy * dt;
        balle.rotation += balle.vx * dt / rayon;

        // Les murs et le plafond
        if (balle.x < rayon) { balle.x = rayon; balle.vx = Math.abs(balle.vx) * 0.85; }
        if (balle.x > largeur - rayon) { balle.x = largeur - rayon; balle.vx = -Math.abs(balle.vx) * 0.85; }
        if (balle.y < rayon) { balle.y = rayon; balle.vy = Math.abs(balle.vy) * 0.6; }

        // Le sol
        const sol = hauteur - rayon;
        if (balle.y > sol) {
            balle.y = sol;
            if (balle.vy > 140) {
                balle.vy = -balle.vy * REBOND;
                balle.rebonds++;
                if (balle.rebonds >= 2) finEchange();
            } else {
                balle.vy = 0;
                balle.vx *= 0.96; // la balle roule et ralentit
            }
        }
    }

    function dessinerBalle() {
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        ctx.clearRect(0, 0, largeur, hauteur);

        // L'ombre sur le sol
        const altitude = Math.min(1, (hauteur - rayon - balle.y) / (hauteur * 0.8));
        ctx.fillStyle = "rgba(0, 0, 0, " + (0.18 * (1 - altitude)).toFixed(3) + ")";
        ctx.beginPath();
        ctx.ellipse(balle.x, hauteur - 4, rayon * (1.1 - altitude * 0.5), rayon * 0.22, 0, 0, Math.PI * 2);
        ctx.fill();

        // La balle et ses coutures
        ctx.save();
        ctx.translate(balle.x, balle.y);
        ctx.rotate(balle.rotation);
        ctx.fillStyle = "#D8EE2C";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, rayon, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = Math.max(2, rayon * 0.14);
        ctx.beginPath();
        ctx.arc(-rayon * 1.05, 0, rayon * 0.78, -0.95, 0.95);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(rayon * 1.05, 0, rayon * 0.78, Math.PI - 0.95, Math.PI + 0.95);
        ctx.stroke();
        ctx.restore();
    }

    let enCours = false;
    let precedent = 0;
    let visible = true;

    function boucle(maintenant) {
        if (!enCours) return;
        const dt = Math.min(0.033, (maintenant - precedent) / 1000);
        precedent = maintenant;
        // Plusieurs petits pas : plus précis qu'un grand
        for (let i = 0; i < 3; i++) avancer(dt / 3);
        dessinerBalle();
        const auRepos = balle.vy === 0 && Math.abs(balle.vx) < 2 && balle.y >= hauteur - rayon - 0.5;
        if (auRepos || !visible) { enCours = false; return; }
        requestAnimationFrame(boucle);
    }

    function relancer() {
        if (reduit || enCours) return;
        enCours = true;
        precedent = performance.now();
        requestAnimationFrame(boucle);
    }

    if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entrees) {
            visible = entrees[0].isIntersecting;
            if (visible) relancer();
        }).observe(court);
    }

    window.addEventListener("resize", function () {
        redimensionner();
        balle.x = Math.min(balle.x, largeur - rayon);
        balle.y = Math.min(balle.y, hauteur - rayon);
        dessinerBalle();
    });

    redimensionner();
    if (reduit) {
        // Mouvement réduit : la balle reste posée, sans animation
        balle.x = largeur * 0.5;
        balle.y = hauteur - rayon;
        zoneConsigne.textContent = "Animation désactivée (mouvement réduit) : la balle reste posée.";
        dessinerBalle();
    } else {
        lancer();
        dessinerBalle();
        relancer();
    }
})();
