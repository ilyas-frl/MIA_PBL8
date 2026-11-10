// ---------------------------------------------------------------
//  globe.js : le hero de l'accueil, en WebGL2
//  Un globe de particules (le Web) traversé par des paquets qui
//  voyagent entre des nœuds. Au défilement, les particules se
//  réassemblent pour écrire « ILYAS ».
// ---------------------------------------------------------------
(function () {
    "use strict";

    const canvas = document.getElementById("globe");
    const hero = document.getElementById("hero");
    if (!canvas || !hero) return;

    const etape1 = document.querySelector('[data-hero-etape="1"]');
    const etape2 = document.querySelector('[data-hero-etape="2"]');
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---------- La progression du défilement (0 en haut, 1 à la fin du hero) ----------

    let progression = 0;

    function lireProgression() {
        const cadre = hero.getBoundingClientRect();
        const course = cadre.height - window.innerHeight;
        return course > 0 ? Math.min(1, Math.max(0, -cadre.top / course)) : 0;
    }

    function majTextes() {
        const deuxieme = progression > 0.52;
        etape1.dataset.cache = deuxieme ? "oui" : "non";
        etape2.dataset.cache = deuxieme ? "non" : "oui";
    }

    function surDefilement() {
        majTextes();
        if (reduit) dessinerFixe();
    }

    if (window.gsap && window.ScrollTrigger) {
        window.gsap.registerPlugin(window.ScrollTrigger);
        window.ScrollTrigger.create({
            trigger: hero, start: "top top", end: "bottom bottom",
            onUpdate: function (s) { progression = s.progress; surDefilement(); }
        });
    } else {
        window.addEventListener("scroll", function () { progression = lireProgression(); surDefilement(); }, { passive: true });
    }
    progression = lireProgression();
    majTextes();

    // ---------- WebGL2 ----------

    const gl = canvas.getContext("webgl2", { antialias: true, alpha: true, premultipliedAlpha: true });
    if (!gl) {
        document.body.classList.add("sans-webgl");
        return;
    }

    const petitAppareil = window.innerWidth < 760 || (navigator.hardwareConcurrency || 8) <= 4;
    const NB_PARTICULES = petitAppareil ? 3500 : 9000;
    const NB_COMETES = 40;
    const POINTS_PAR_COMETE = 12;
    const NB_NOEUDS = 16;

    // Le morceau de shader commun : rotation du globe et projection à l'écran
    const COMMUN = `
        uniform float uTemps;
        uniform float uAspect;
        uniform float uEchelle;
        uniform vec2 uSouris;
        uniform vec2 uCentre;
        uniform float uRatio;

        mat3 rotY(float a) { float c = cos(a), s = sin(a); return mat3(c, 0., -s, 0., 1., 0., s, 0., c); }
        mat3 rotX(float a) { float c = cos(a), s = sin(a); return mat3(1., 0., 0., 0., c, s, 0., -s, c); }

        mat3 rotationGlobe() {
            return rotX(0.32 + uSouris.y * 0.25) * rotY(uTemps * 0.12 + uSouris.x * 0.5);
        }

        const float CAMERA = 4.0;
    `;

    const SOURCE_PARTICULES_VS = `#version 300 es
        in vec3 aGlobe;
        in vec3 aTexte;
        in vec4 aHasard;
        uniform float uMorph;
        uniform float uTaille;
        uniform vec2 uCentreTexte;
        uniform vec3 uCurseur;
        ${COMMUN}
        out float vAlpha;
        out float vVisite;

        void main() {
            // Chaque particule part avec un léger retard : le morph avance en vague
            float delai = aHasard.x;
            float m = smoothstep(delai, delai + 0.4, uMorph);

            // Position sur le globe, qui tourne doucement
            vec3 g = rotationGlobe() * aGlobe;
            g += 0.012 * vec3(sin(uTemps * 1.3 + aHasard.z * 30.), cos(uTemps * 1.1 + aHasard.w * 20.), sin(uTemps * 0.9 + aHasard.y * 40.));

            // Position dans le mot ILYAS, avec un tout petit souffle
            vec3 t = rotY(uSouris.x * 0.12) * rotX(-uSouris.y * 0.08) * aTexte;
            t.xy += 0.004 * vec2(sin(uTemps * 2. + aHasard.z * 50.), cos(uTemps * 1.7 + aHasard.y * 50.));

            // Au milieu du trajet, les particules s'écartent un peu (elles "voyagent")
            float milieu = sin(m * 3.14159);
            vec3 pos = mix(g, t, m) + normalize(aGlobe) * milieu * 0.45 * (0.3 + aHasard.y);

            float persp = CAMERA / (CAMERA - pos.z);
            vec2 ecran = pos.xy * persp * uEchelle;
            ecran.x /= uAspect;
            ecran += mix(uCentre, uCentreTexte, m);

            // En mode texte, le curseur repousse les particules proches
            vec2 ecart = ecran - uCurseur.xy;
            ecart.x *= uAspect;
            float distance = length(ecart);
            float force = uCurseur.z * m * smoothstep(0.22, 0.0, distance);
            vec2 direction = ecart / max(distance, 0.0001);
            direction.x /= uAspect;
            ecran += direction * force * 0.09;

            gl_Position = vec4(ecran, 0.0, 1.0);

            float profondeur = clamp(pos.z * 0.5 + 0.5, 0.0, 1.0);
            float prof = mix(profondeur, 0.85, m);
            gl_PointSize = uTaille * uRatio * (0.65 + aHasard.w * 0.7) * mix(0.6, 1.2, prof) * persp;
            vAlpha = mix(0.14, 0.95, prof);
            vVisite = step(0.92, aHasard.y);
        }`;

    const SOURCE_COMETES_VS = `#version 300 es
        in vec3 aParams;   // x : phase (ou numéro du nœud), y : place dans la traînée (-1 = nœud), z : vitesse
        uniform vec3 uNoeuds[${NB_NOEUDS}];
        uniform float uMorph;
        uniform float uTaille;
        ${COMMUN}
        out float vAlpha;
        out float vVisite;

        float hasard(float n) { return fract(sin(n * 127.1) * 43758.5453); }

        vec3 slerp(vec3 a, vec3 b, float t) {
            float d = clamp(dot(a, b), -0.999, 0.999);
            float angle = acos(d);
            return (sin((1.0 - t) * angle) * a + sin(t * angle) * b) / sin(angle);
        }

        void main() {
            float visible = 1.0 - smoothstep(0.0, 0.3, uMorph);
            vec3 pos;
            float taille;
            float alpha;

            if (aParams.y < 0.0) {
                // Un nœud du réseau
                pos = uNoeuds[int(aParams.x)];
                taille = 4.0;
                alpha = 0.9;
            } else {
                float cycle = uTemps * aParams.z + aParams.x;
                float numero = floor(cycle);
                float avance = fract(cycle) / 0.72 - aParams.y * 0.016;
                int ia = int(hasard(numero + aParams.x * 7.0) * ${NB_NOEUDS}.0);
                int ib = int(hasard(numero * 1.37 + aParams.x * 3.0 + 0.5) * ${NB_NOEUDS}.0);
                vec3 a = uNoeuds[ia];
                vec3 b = uNoeuds[ib];
                float d = dot(a, b);
                float valable = step(-0.75, d) * step(d, 0.95) * step(0.0, avance) * step(avance, 1.0);
                float t = clamp(avance, 0.0, 1.0);
                pos = slerp(a, b, t) * (1.0 + 0.3 * sin(3.14159 * t));
                taille = mix(5.0, 1.2, aParams.y / ${POINTS_PAR_COMETE - 1}.0);
                alpha = valable * (1.0 - aParams.y / ${POINTS_PAR_COMETE}.0) * smoothstep(0.0, 0.06, t) * smoothstep(1.0, 0.94, t);
            }

            pos = rotationGlobe() * pos;
            float persp = CAMERA / (CAMERA - pos.z);
            vec2 ecran = pos.xy * persp * uEchelle;
            ecran.x /= uAspect;
            ecran += uCentre;
            gl_Position = vec4(ecran, 0.0, 1.0);

            float profondeur = clamp(pos.z * 0.5 + 0.5, 0.0, 1.0);
            gl_PointSize = uTaille * uRatio * taille * persp * 0.55;
            vAlpha = alpha * visible * mix(0.25, 1.0, profondeur);
            vVisite = 0.0;
        }`;

    const SOURCE_FS = `#version 300 es
        precision mediump float;
        in float vAlpha;
        in float vVisite;
        uniform vec3 uLien;
        uniform vec3 uCouleurVisite;
        out vec4 couleur;
        void main() {
            vec2 c = gl_PointCoord * 2.0 - 1.0;
            float r = dot(c, c);
            if (r > 1.0) discard;
            float a = smoothstep(1.0, 0.35, r) * vAlpha;
            vec3 teinte = mix(uLien, uCouleurVisite, vVisite);
            couleur = vec4(teinte * a, a);
        }`;

    function compiler(type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(shader));
        }
        return shader;
    }

    function programme(sourceVs, sourceFs) {
        const p = gl.createProgram();
        gl.attachShader(p, compiler(gl.VERTEX_SHADER, sourceVs));
        gl.attachShader(p, compiler(gl.FRAGMENT_SHADER, sourceFs));
        gl.linkProgram(p);
        if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
        const uniformes = {};
        const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < n; i++) {
            const info = gl.getActiveUniform(p, i);
            const nom = info.name.replace("[0]", "");
            uniformes[nom] = gl.getUniformLocation(p, info.name);
        }
        return { p: p, u: uniformes };
    }

    let progParticules, progCometes;
    try {
        progParticules = programme(SOURCE_PARTICULES_VS, SOURCE_FS);
        progCometes = programme(SOURCE_COMETES_VS, SOURCE_FS);
    } catch (erreur) {
        console.warn("WebGL : shader refusé", erreur);
        document.body.classList.add("sans-webgl");
        return;
    }

    function tampon(programmeInfo, nom, donnees, taille, vao) {
        const emplacement = gl.getAttribLocation(programmeInfo.p, nom);
        const t = gl.createBuffer();
        gl.bindVertexArray(vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, t);
        gl.bufferData(gl.ARRAY_BUFFER, donnees, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(emplacement);
        gl.vertexAttribPointer(emplacement, taille, gl.FLOAT, false, 0, 0);
        return t;
    }

    // ---------- Les données des particules ----------

    const ANGLE_D_OR = Math.PI * (3 - Math.sqrt(5));
    const globe = new Float32Array(NB_PARTICULES * 3);
    const hasard = new Float32Array(NB_PARTICULES * 4);
    for (let i = 0; i < NB_PARTICULES; i++) {
        // Sphère de Fibonacci : des points répartis régulièrement sur la sphère
        const y = 1 - ((i + 0.5) / NB_PARTICULES) * 2;
        const rayon = Math.sqrt(1 - y * y);
        const phi = i * ANGLE_D_OR;
        globe[i * 3] = Math.cos(phi) * rayon;
        globe[i * 3 + 1] = y;
        globe[i * 3 + 2] = Math.sin(phi) * rayon;
        hasard[i * 4] = Math.random() * 0.15;
        hasard[i * 4 + 1] = Math.random();
        hasard[i * 4 + 2] = Math.random();
        hasard[i * 4 + 3] = Math.random();
    }
    // En attendant la police, la cible "texte" est le globe lui-même
    const texte = new Float32Array(globe);

    const vaoParticules = gl.createVertexArray();
    tampon(progParticules, "aGlobe", globe, 3, vaoParticules);
    const tamponTexte = tampon(progParticules, "aTexte", texte, 3, vaoParticules);
    const tamponHasard = tampon(progParticules, "aHasard", hasard, 4, vaoParticules);

    // Les nœuds du réseau : quelques points de la sphère
    const noeuds = new Float32Array(NB_NOEUDS * 3);
    for (let i = 0; i < NB_NOEUDS; i++) {
        const k = Math.floor(((i + 0.5) / NB_NOEUDS) * NB_PARTICULES * 0.97 + Math.random() * 40) % NB_PARTICULES;
        noeuds[i * 3] = globe[k * 3];
        noeuds[i * 3 + 1] = globe[k * 3 + 1];
        noeuds[i * 3 + 2] = globe[k * 3 + 2];
    }

    const params = [];
    for (let c = 0; c < NB_COMETES; c++) {
        const phase = Math.random() * 10;
        const vitesse = 0.16 + Math.random() * 0.14;
        for (let k = 0; k < POINTS_PAR_COMETE; k++) params.push(phase, k, vitesse);
    }
    for (let n = 0; n < NB_NOEUDS; n++) params.push(n, -1, 0);
    const NB_POINTS_COMETES = params.length / 3;
    const vaoCometes = gl.createVertexArray();
    tampon(progCometes, "aParams", new Float32Array(params), 3, vaoCometes);
    gl.bindVertexArray(null);

    // ---------- Échantillonnage du mot ILYAS ----------

    let aspect = 1;
    let echelle = 0.58;
    let centre = [0.3, 0.06];
    let centreTexte = [0, 0.12];

    function calculerCadrage() {
        aspect = canvas.width / Math.max(1, canvas.height);
        const etroit = aspect < 1;
        echelle = Math.min(0.56, (0.88 * aspect) / 1.3);
        centre = etroit ? [0, 0.3] : [0.36, 0.04];
        centreTexte = etroit ? [0, 0.32] : [0, 0.14];
    }

    function echantillonnerTexte() {
        const L = 1600, H = 440;
        const toile = document.createElement("canvas");
        toile.width = L;
        toile.height = H;
        const ctx = toile.getContext("2d", { willReadFrequently: true });
        const ecrire = function (taille) {
            ctx.font = "900 " + taille + "px \"Anybody Variable\", sans-serif";
            if ("fontStretch" in ctx) ctx.fontStretch = "extra-expanded";
        };
        ecrire(300);
        const largeurBrute = ctx.measureText("ILYAS").width;
        const taille = Math.min(320, (300 * L * 0.94) / largeurBrute);
        ecrire(taille);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#000";
        ctx.fillText("ILYAS", L / 2, H / 2);
        const largeurTexte = ctx.measureText("ILYAS").width;

        const pixels = ctx.getImageData(0, 0, L, H).data;
        const pleins = [];
        for (let y = 0; y < H; y += 2) {
            for (let x = 0; x < L; x += 2) {
                if (pixels[(y * L + x) * 4 + 3] > 140) pleins.push(x, y);
            }
        }
        if (!pleins.length) return;

        // Largeur voulue à l'écran (en coordonnées -1..1), convertie en unités du monde
        const largeurEcran = aspect < 1 ? 1.84 : 1.6;
        const largeurMonde = (largeurEcran * aspect) / echelle;
        const unite = largeurMonde / largeurTexte;

        const nbPleins = pleins.length / 2;
        for (let i = 0; i < NB_PARTICULES; i++) {
            // On répète des pixels s'il n'y en a pas assez
            const j = i < nbPleins ? Math.floor(Math.random() * nbPleins) : i % nbPleins;
            const px = pleins[j * 2] + (Math.random() - 0.5) * 2;
            const py = pleins[j * 2 + 1] + (Math.random() - 0.5) * 2;
            texte[i * 3] = (px - L / 2) * unite;
            texte[i * 3 + 1] = (H / 2 - py) * unite;
            texte[i * 3 + 2] = (Math.random() - 0.5) * 0.06;
            // Le retard dépend de la position horizontale : la vague va de gauche à droite
            const xNorme = (px - (L - largeurTexte) / 2) / largeurTexte;
            hasard[i * 4] = Math.min(1, Math.max(0, xNorme)) * 0.45 + Math.random() * 0.15;
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, tamponTexte);
        gl.bufferData(gl.ARRAY_BUFFER, texte, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, tamponHasard);
        gl.bufferData(gl.ARRAY_BUFFER, hasard, gl.STATIC_DRAW);
    }

    let policePrete = false;
    const promessePolice = document.fonts && document.fonts.load
        ? document.fonts.load("900 300px \"Anybody Variable\"")
        : Promise.resolve();

    // ---------- Taille du canvas ----------

    const ratio = Math.min(2, window.devicePixelRatio || 1);
    let dernierAspect = 0;

    function redimensionner() {
        const largeur = Math.max(1, Math.round(canvas.clientWidth * ratio));
        const hauteur = Math.max(1, Math.round(canvas.clientHeight * ratio));
        if (canvas.width !== largeur || canvas.height !== hauteur) {
            canvas.width = largeur;
            canvas.height = hauteur;
        }
        calculerCadrage();
        if (policePrete && Math.abs(aspect - dernierAspect) > 0.02) {
            echantillonnerTexte();
            dernierAspect = aspect;
        }
    }

    // ---------- La souris ----------

    const souris = { x: 0, y: 0, cx: 0, cy: 0 };
    const curseur = { x: 0, y: 0, force: 0, cible: 0 };

    window.addEventListener("pointermove", function (e) {
        souris.cx = (e.clientX / window.innerWidth) * 2 - 1;
        souris.cy = -((e.clientY / window.innerHeight) * 2 - 1);
        const cadre = canvas.getBoundingClientRect();
        curseur.x = ((e.clientX - cadre.left) / cadre.width) * 2 - 1;
        curseur.y = -(((e.clientY - cadre.top) / cadre.height) * 2 - 1);
        curseur.cible = 1;
    }, { passive: true });
    document.addEventListener("pointerleave", function () { curseur.cible = 0; });

    // ---------- Le dessin ----------

    const LIEN = [0, 0, 0xEE / 255];
    const VISITE = [0x55 / 255, 0x1A / 255, 0x8B / 255];
    let morph = progression > 0.5 ? 1 : 0;

    function uniformesCommuns(u, temps) {
        gl.uniform1f(u.uTemps, temps);
        gl.uniform1f(u.uAspect, aspect);
        gl.uniform1f(u.uEchelle, echelle);
        gl.uniform2f(u.uSouris, souris.x, souris.y);
        gl.uniform2f(u.uCentre, centre[0], centre[1]);
        gl.uniform1f(u.uRatio, ratio);
        gl.uniform1f(u.uMorph, morph);
        gl.uniform3fv(u.uLien, LIEN);
        gl.uniform3fv(u.uCouleurVisite, VISITE);
    }

    function dessiner(temps) {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        gl.useProgram(progParticules.p);
        uniformesCommuns(progParticules.u, temps);
        gl.uniform1f(progParticules.u.uTaille, petitAppareil ? 2.6 : 2.3);
        gl.uniform2f(progParticules.u.uCentreTexte, centreTexte[0], centreTexte[1]);
        gl.uniform3f(progParticules.u.uCurseur, curseur.x, curseur.y, curseur.force);
        gl.bindVertexArray(vaoParticules);
        gl.drawArrays(gl.POINTS, 0, NB_PARTICULES);

        if (morph < 0.35) {
            gl.useProgram(progCometes.p);
            uniformesCommuns(progCometes.u, temps);
            gl.uniform1f(progCometes.u.uTaille, 2.4);
            gl.uniform3fv(progCometes.u.uNoeuds, noeuds);
            gl.bindVertexArray(vaoCometes);
            gl.drawArrays(gl.POINTS, 0, NB_POINTS_COMETES);
        }
        gl.bindVertexArray(null);
    }

    // Version mouvement réduit : une seule image fixe, redessinée seulement si l'état change
    let dernierEtatFixe = null;
    function dessinerFixe() {
        const etat = progression > 0.5 ? 1 : 0;
        if (etat === dernierEtatFixe && !dessinerFixe.force) return;
        dessinerFixe.force = false;
        dernierEtatFixe = etat;
        morph = etat;
        curseur.force = 0;
        redimensionner();
        dessiner(0);
    }

    let enCours = false;
    let visible = true;
    let debut = performance.now();

    function boucle(maintenant) {
        if (!enCours) return;
        const temps = (maintenant - debut) / 1000;
        const cible = smoothstep(0.16, 0.62, progression);
        morph += (cible - morph) * 0.07;
        souris.x += (souris.cx - souris.x) * 0.05;
        souris.y += (souris.cy - souris.y) * 0.05;
        curseur.force += (curseur.cible - curseur.force) * 0.12;
        dessiner(temps);
        requestAnimationFrame(boucle);
    }

    function smoothstep(a, b, x) {
        const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
        return t * t * (3 - 2 * t);
    }

    function demarrer() {
        if (reduit) { dessinerFixe.force = true; dessinerFixe(); return; }
        if (enCours || !visible || document.hidden) return;
        enCours = true;
        requestAnimationFrame(boucle);
    }

    function arreter() { enCours = false; }

    // Pause quand le hero sort de l'écran ou quand l'onglet est caché
    if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entrees) {
            visible = entrees[0].isIntersecting;
            if (visible) demarrer(); else arreter();
        }).observe(hero);
    }
    document.addEventListener("visibilitychange", function () {
        if (document.hidden) arreter(); else demarrer();
    });
    window.addEventListener("resize", function () {
        redimensionner();
        if (reduit) { dessinerFixe.force = true; dessinerFixe(); }
    });

    redimensionner();
    promessePolice.catch(function () { /* police absente : on dessine quand même */ }).then(function () {
        policePrete = true;
        echantillonnerTexte();
        dernierAspect = aspect;
        if (reduit) { dessinerFixe.force = true; dessinerFixe(); }
    });
    demarrer();
})();
