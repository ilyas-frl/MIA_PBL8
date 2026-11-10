// ---------------------------------------------------------------
//  frelia.js : le dégradé « Halo » de frelia.fr, en WebGL2
//  Trois gris (#999999 → #000000 → #888888) qui ondulent lentement,
//  avec un grain de pellicule, comme sur le site de Frelia.
// ---------------------------------------------------------------
(function () {
    "use strict";

    const toile = document.getElementById("degrade-frelia");
    if (!toile) return;
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gl = toile.getContext("webgl2", { antialias: false, alpha: false });
    if (!gl) return; // le fond CSS de secours reste visible

    const SOURCE_VS = `#version 300 es
        in vec2 aPos;
        void main() { gl_Position = vec4(aPos, 0.0, 1.0); }`;

    const SOURCE_FS = `#version 300 es
        precision highp float;
        uniform vec2 uTaille;
        uniform float uTemps;
        out vec4 couleur;

        const vec3 COULEUR_1 = vec3(0.600);   // #999999
        const vec3 COULEUR_2 = vec3(0.000);   // #000000
        const vec3 COULEUR_3 = vec3(0.533);   // #888888

        // Bruit de valeur lissé : des collines douces et aléatoires
        float hasard(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float bruit(vec2 p) {
            vec2 i = floor(p), f = fract(p);
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(mix(hasard(i), hasard(i + vec2(1, 0)), u.x),
                       mix(hasard(i + vec2(0, 1)), hasard(i + vec2(1, 1)), u.x), u.y);
        }
        float vagues(vec2 p) {
            float somme = 0.0, force = 0.5;
            for (int i = 0; i < 4; i++) { somme += force * bruit(p); p = p * 2.03 + 11.7; force *= 0.5; }
            return somme;
        }

        void main() {
            vec2 uv = gl_FragCoord.xy / uTaille;
            vec2 p = uv * vec2(uTaille.x / uTaille.y, 1.0);
            float t = uTemps * 0.06;

            // Le plan est incliné à 50° : le dégradé de base va en diagonale
            float diagonale = dot(uv - 0.5, vec2(0.643, 0.766)) + 0.5;
            vec2 deformation = vec2(vagues(p * 1.1 + vec2(t, -t * 0.7)), vagues(p * 1.1 + vec2(-t * 0.8, t) + 5.2));
            float onde = vagues(p * 1.4 + deformation * 1.6 + t);

            vec3 c = mix(COULEUR_1, COULEUR_2, smoothstep(0.15, 0.85, diagonale + (onde - 0.5) * 0.9));
            c = mix(c, COULEUR_3, smoothstep(0.55, 0.95, onde) * 0.75);

            // Le halo : le centre s'éclaire, les bords s'assombrissent
            float distance = length((uv - vec2(0.5, 0.55)) * vec2(uTaille.x / uTaille.y, 1.0));
            c *= mix(1.15, 0.55, smoothstep(0.1, 1.1, distance));

            // Le grain de pellicule
            float grain = hasard(gl_FragCoord.xy + fract(uTemps) * 100.0) - 0.5;
            c += grain * 0.12;

            couleur = vec4(clamp(c, 0.0, 1.0), 1.0);
        }`;

    function compiler(type, source) {
        const s = gl.createShader(type);
        gl.shaderSource(s, source);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
        return s;
    }

    let programme;
    try {
        programme = gl.createProgram();
        gl.attachShader(programme, compiler(gl.VERTEX_SHADER, SOURCE_VS));
        gl.attachShader(programme, compiler(gl.FRAGMENT_SHADER, SOURCE_FS));
        gl.linkProgram(programme);
        if (!gl.getProgramParameter(programme, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(programme));
    } catch (erreur) {
        console.warn("WebGL : shader refusé", erreur);
        return;
    }

    // Un grand triangle qui couvre tout l'écran
    const tampon = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tampon);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const emplacement = gl.getAttribLocation(programme, "aPos");
    gl.enableVertexAttribArray(emplacement);
    gl.vertexAttribPointer(emplacement, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(programme);
    const uTaille = gl.getUniformLocation(programme, "uTaille");
    const uTemps = gl.getUniformLocation(programme, "uTemps");

    // Le dégradé est flou : on le calcule à mi-résolution, c'est quatre fois moins de travail
    function redimensionner() {
        const ratio = Math.min(1, (window.devicePixelRatio || 1) * 0.5);
        toile.width = Math.max(1, Math.round(toile.clientWidth * ratio));
        toile.height = Math.max(1, Math.round(toile.clientHeight * ratio));
        gl.viewport(0, 0, toile.width, toile.height);
        gl.uniform2f(uTaille, toile.width, toile.height);
    }

    function dessiner(temps) {
        gl.uniform1f(uTemps, temps);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    let enCours = false;
    let visible = true;
    const debut = performance.now();

    function boucle(maintenant) {
        if (!enCours) return;
        dessiner((maintenant - debut) / 1000);
        requestAnimationFrame(boucle);
    }

    function demarrer() {
        if (reduit) { dessiner(12); return; }
        if (enCours || !visible || document.hidden) return;
        enCours = true;
        requestAnimationFrame(boucle);
    }

    if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entrees) {
            visible = entrees[0].isIntersecting;
            if (visible) demarrer(); else enCours = false;
        }).observe(toile);
    }
    document.addEventListener("visibilitychange", function () {
        if (document.hidden) enCours = false; else demarrer();
    });
    window.addEventListener("resize", function () { redimensionner(); if (reduit) dessiner(12); });

    redimensionner();
    toile.classList.add("pret");
    demarrer();
})();
