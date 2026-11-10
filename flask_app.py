# ---------------------------------------------------------------
#  Mon premier site Web avec Flask
# ---------------------------------------------------------------
#  Ce fichier est le "cerveau" de votre site : c'est lui qui
#  reçoit les demandes des navigateurs et qui fabrique les réponses.
#
#  Version 2 : le site se regarde fonctionner. En plus des routes
#  des exercices, il mesure son propre temps de réponse et peut
#  montrer son code (les "coulisses", touche C sur n'importe quelle page).
# ---------------------------------------------------------------

import inspect
import os
import time
from datetime import datetime
from urllib.parse import urlencode
from zoneinfo import ZoneInfo

from flask import (Flask, abort, before_render_template, g, jsonify, redirect,
                   render_template, request)

app = Flask(__name__)

# Le dossier où Flask range les templates (sert aux coulisses)
DOSSIER_TEMPLATES = os.path.join(app.root_path, "templates")


# ---------------------------------------------------------------
#  Les données du site
#  (des listes de dictionnaires, parcourues avec {% for %} comme à l'exercice 4)
# ---------------------------------------------------------------

LOISIRS = ["Le tennis", "La musique", "Les jeux vidéo", "Le code"]

LANGUES = [
    {"langue": "Français", "code": "fr", "niveau": "langue maternelle", "salut": "Bonjour"},
    {"langue": "Polski", "code": "pl", "niveau": "bilingue", "salut": "Dzień dobry"},
    {"langue": "English", "code": "en", "niveau": "C2, TOEIC 940/990", "salut": "Hello"},
    {"langue": "Español", "code": "es", "niveau": "B2", "salut": "Hola"},
    {"langue": "Português", "code": "pt", "niveau": "en apprentissage", "salut": "Olá"},
    {"langue": "中文", "code": "zh", "niveau": "quelques bases", "salut": "你好"},
]

# Chaque projet a un code de statut HTTP qui dit où il en est
PROJETS = [
    {
        "statut": 200, "texte_statut": "OK", "nom": "Frelia",
        "phrase": "Mon agence web : sites vitrines, référencement par les IA et état des lieux.",
        "lien": "/frelia",
        "sous_liens": [
            {"nom": "pizzeria", "lien": "https://frelia.fr/concepts/pizzeria/"},
            {"nom": "coiffure", "lien": "https://frelia.fr/concepts/coiffure/"},
            {"nom": "auto", "lien": "https://frelia.fr/concepts/auto/"},
        ],
        "explication": "200 OK : la requête a réussi, la ressource est là. Le projet est en ligne et tourne.",
    },
    {
        "statut": 200, "texte_statut": "OK", "nom": "Ce site",
        "phrase": "Le PBL 8 « Découvrir le Web » de la MIA, poussé jusqu'au bout : il se regarde répondre.",
        "lien": "/",
        "sous_liens": [],
        "explication": "200 OK : la requête a réussi. Vous êtes dessus.",
    },
    {
        "statut": 102, "texte_statut": "Processing", "nom": "Athena",
        "phrase": "Un assistant vocal façon Jarvis qui pilote mon agent IA à la voix.",
        "lien": "",
        "sous_liens": [],
        "explication": "102 Processing : le serveur a bien reçu la demande et travaille dessus, mais la réponse n'est pas encore prête. Le projet est en cours de construction.",
    },
    {
        "statut": 202, "texte_statut": "Accepted", "nom": "Hermes",
        "phrase": "Un agent IA auto-hébergé qui prépare mon brief du matin et le planning de la semaine.",
        "lien": "",
        "sous_liens": [],
        "explication": "202 Accepted : la demande est acceptée et sera traitée en arrière-plan. L'agent tourne déjà, il continue d'apprendre de nouvelles tâches.",
    },
    {
        "statut": 206, "texte_statut": "Partial Content", "nom": "Jeu Roblox",
        "phrase": "Un FPS réaliste sur Roblox, codé en Luau.",
        "lien": "",
        "sous_liens": [],
        "explication": "206 Partial Content : le serveur n'envoie qu'une partie de la ressource (c'est ce qui permet d'avancer dans une vidéo). Une partie du jeu tourne déjà, le reste arrive.",
    },
    {
        "statut": 200, "texte_statut": "OK", "nom": "Projets Icam",
        "phrase": "Un ampli micro réparé (PBL 3, EEE), des matériaux composites (PBL 10) et le Projet Bateau (ESE).",
        "lien": "",
        "sous_liens": [],
        "explication": "200 OK : la requête a réussi. Ces projets sont terminés et rendus.",
    },
]

# Frelia, mon agence : chaque lettre du nom est un service
SERVICES_FRELIA = [
    {"lettre": "F", "nom": "Façade : sites web", "statut": 200, "texte_statut": "OK",
     "phrase": "Votre vitrine, ouverte même quand la boutique est fermée. Un site rapide, beau, pensé pour votre commerce.",
     "lien": "https://frelia.fr/creation-site"},
    {"lettre": "R", "nom": "Référencement IA", "statut": 200, "texte_statut": "OK",
     "phrase": "Quand on demande à une IA la meilleure adresse du coin, on travaille pour que ce soit votre nom qui sorte, et aussi sur Google.",
     "lien": "https://frelia.fr/referencement"},
    {"lettre": "E", "nom": "État des lieux", "statut": 200, "texte_statut": "OK",
     "phrase": "On passe au crible votre site, votre fiche Google et ce que les IA disent de vous, puis on vous dit quoi corriger, dans l'ordre.",
     "lien": "https://frelia.fr/etat-des-lieux"},
    {"lettre": "L", "nom": "Logiciels sur mesure", "statut": 200, "texte_statut": "OK",
     "phrase": "Commandes, réservations, stocks : des outils pensés pour votre façon de travailler.",
     "lien": ""},
    {"lettre": "I", "nom": "IA et automatisations", "statut": 102, "texte_statut": "Processing",
     "phrase": "Un assistant qui répond à vos clients quand vous n'êtes pas là. Bientôt.",
     "lien": ""},
    {"lettre": "A", "nom": "Accessibilité", "statut": 102, "texte_statut": "Processing",
     "phrase": "Un site que tout le monde peut utiliser, quels que soient sa vue, ses mains ou son écran. Bientôt.",
     "lien": ""},
]

# Les prix de lancement (réservés aux 10 premiers clients), repris de frelia.fr
TARIFS_FRELIA = [
    {"type": "Site vitrine", "des": "500 €", "maintenance": "30 à 60 € par mois",
     "detail": "D'une page à sept pages : formulaire de contact, carte Google Maps, galerie, réservation ou blog."},
    {"type": "E-commerce", "des": "1 200 €", "maintenance": "60 à 150 € par mois",
     "detail": "Une boutique Shopify : paiement en ligne, livraison, collections, avis clients."},
    {"type": "Site conceptuel", "des": "1 500 €", "maintenance": "50 à 100 € par mois",
     "detail": "Un site immersif pour marquer les esprits : direction artistique, animations, scène 3D."},
    {"type": "Application web", "des": "2 000 €", "maintenance": "100 à 300 € par mois",
     "detail": "Réservation, espace client, tableau de bord : sur devis, après un atelier de cadrage."},
]

ETAPES_FRELIA = [
    {"nom": "Échange", "phrase": "On parle de votre commerce et on dessine le plan du site."},
    {"nom": "Maquette", "phrase": "Vous recevez une maquette gratuite sous 5 jours, sans engagement."},
    {"nom": "Construction", "phrase": "Le site prend vie et s'adapte à chaque écran : ordinateur, tablette, téléphone."},
    {"nom": "Mise en ligne", "phrase": "De 2 semaines à 2 mois selon le projet. Vous payez à la réception du site."},
]

CONCEPTS_FRELIA = [
    {"nom": "Tonton Forno", "metier": "Pizzeria, brut et chaleureux", "lien": "https://frelia.fr/concepts/pizzeria/"},
    {"nom": "Maison Orvane", "metier": "Salon de coiffure, minimal et luxueux", "lien": "https://frelia.fr/concepts/coiffure/"},
    {"nom": "Altène Automobiles", "metier": "Concession auto, technique et précis", "lien": "https://frelia.fr/concepts/auto/"},
]

# Les expériences du labo : une requête = une notion du Web
EXPERIENCES = [
    {"methode": "GET", "chemin": "/bonjour/Ilyas", "statut": "", "lien": "/bonjour/Ilyas",
     "notion": "Une information dans le chemin : Flask range « Ilyas » dans la variable prenom."},
    {"methode": "GET", "chemin": "/calcul?a=6&b=3&op=fois", "statut": "", "lien": "/calcul?a=6&b=3&op=fois",
     "notion": "Des paramètres après le « ? » : des paires nom=valeur séparées par « & »."},
    {"methode": "POST", "chemin": "/salut", "statut": "", "lien": "/formulaire",
     "notion": "Un formulaire envoie ses données dans le corps de la requête, pas dans l'URL."},
    {"methode": "GET", "chemin": "/home", "statut": "302", "lien": "/home",
     "notion": "Une redirection : le serveur répond « va voir ailleurs » et le navigateur refait une requête."},
    {"methode": "GET", "chemin": "/secret", "statut": "403", "lien": "/secret",
     "notion": "Accès interdit : la page existe, mais le serveur refuse de la donner."},
    {"methode": "GET", "chemin": "/nimportequoi", "statut": "404", "lien": "/nimportequoi",
     "notion": "Rien à cette adresse : le serveur répond 404, avec une jolie page quand même."},
    {"methode": "GET", "chemin": "/teapot", "statut": "418", "lien": "/teapot",
     "notion": "Le code le plus inutile du Web, né d'un poisson d'avril en 1998."},
    {"methode": "GET", "chemin": "/moi", "statut": "", "lien": "/moi",
     "notion": "Tout ce que votre navigateur raconte au serveur sans que vous ayez rien rempli."},
    {"methode": "GET", "chemin": "/horloge", "statut": "", "lien": "/horloge",
     "notion": "Une page qui se met à jour toute seule grâce à JavaScript et à une API."},
    {"methode": "GET", "chemin": "/api/heure", "statut": "", "lien": "/api/heure",
     "notion": "Une réponse pour les machines : du JSON, aucune balise HTML."},
]


# ---------------------------------------------------------------
#  Le chronomètre du serveur
#  Avant chaque requête on note l'heure, après on calcule la durée
#  et on l'envoie au navigateur dans l'en-tête "Server-Timing".
# ---------------------------------------------------------------

@app.before_request
def demarrer_chronometre():
    g.debut = time.perf_counter()


@app.after_request
def ajouter_entetes(reponse):
    duree_ms = (time.perf_counter() - g.get("debut", time.perf_counter())) * 1000
    reponse.headers["Server-Timing"] = f'flask;desc="Flask";dur={duree_ms:.1f}'
    reponse.headers["X-Fait-Par"] = "Ilyas Afryad"
    return reponse


# Quand Flask s'apprête à remplir un template, il envoie un "signal".
# On l'écoute pour savoir quel fichier a servi à fabriquer la page.
def noter_template(expediteur, template, context, **autres):
    g.template = template.name


before_render_template.connect(noter_template, app)


# Ces variables sont disponibles dans TOUS les templates
@app.context_processor
def variables_communes():
    # La fonction Python qui a fabriqué la page (ou le gestionnaire d'erreur)
    fonction = g.get("gestionnaire")
    if fonction is None and request.endpoint in app.view_functions:
        fonction = app.view_functions[request.endpoint]
    return {"code_route": lire_code(fonction)}


def lire_code(fonction):
    """Renvoie le code source d'une fonction Python, ou une chaîne vide."""
    if fonction is None:
        return ""
    try:
        return inspect.getsource(fonction)
    except (OSError, TypeError):
        return ""


# ---------------------------------------------------------------
#  Les pages
# ---------------------------------------------------------------

# Une "route" associe une adresse (URL) à une fonction Python.
# Ici : quand quelqu'un visite la page d'accueil "/",
# Flask exécute la fonction accueil() et renvoie son résultat au navigateur.
@app.get("/")
def accueil():
    return render_template("accueil.html", projets=PROJETS, langues=LANGUES,
                           experiences=EXPERIENCES)


# Exercices 2 à 5 : une page de présentation (template + boucle)
@app.get("/presentation")
def presentation():
    return render_template("presentation.html", prenom="Ilyas", nom="Afryad",
                           loisirs=LOISIRS, langues=LANGUES, projets=PROJETS)


# Frelia : la page qui décrit les services de mon agence
@app.get("/frelia")
def frelia():
    return render_template("frelia.html", services=SERVICES_FRELIA, tarifs=TARIFS_FRELIA,
                           etapes=ETAPES_FRELIA, concepts=CONCEPTS_FRELIA)


@app.get("/loisirs")
def loisirs():
    return render_template("loisirs.html", loisirs=LOISIRS)


# Exercice 7 : une information dans le chemin
# (le template échappe le HTML : /bonjour/<button>... ne s'injecte plus)
# "path:" accepte aussi les "/", pour que /bonjour/<b>test</b> arrive bien ici
@app.get("/bonjour/<path:prenom>")
def bonjour(prenom):
    return render_template("bonjour.html", prenom=prenom)


# Exercice 7 : des paramètres après le "?"
OPERATIONS = {
    "plus": ("+", lambda a, b: a + b),
    "moins": ("-", lambda a, b: a - b),
    "fois": ("×", lambda a, b: a * b),
    "divise": ("÷", lambda a, b: a / b),
}


def calculer(a_texte, b_texte, op):
    """Fait le calcul. Renvoie (resultat, erreur) : l'un des deux vaut None."""
    try:
        a = int(a_texte)
        b = int(b_texte)
    except ValueError:
        return None, "a et b doivent être des nombres entiers."
    if op not in OPERATIONS:
        return None, f"opération inconnue. Choisissez parmi {', '.join(OPERATIONS)}."
    if op == "divise" and b == 0:
        return None, "division par zéro impossible."
    symbole, fonction = OPERATIONS[op]
    return {"a": a, "b": b, "op": op, "symbole": symbole, "resultat": fonction(a, b)}, None


@app.get("/calcul")
def calcul():
    a = request.args.get("a", "0")
    b = request.args.get("b", "0")
    op = request.args.get("op", "plus")
    resultat, erreur = calculer(a, b, op)
    if erreur:
        # Même page, mais avec le code 400 : "ta demande est mal formée"
        return render_template("calcul.html", a=a, b=b, op=op, erreur=erreur,
                               operations=OPERATIONS, statut=400), 400
    return render_template("calcul.html", a=a, b=b, op=op, calcul=resultat,
                           operations=OPERATIONS)


# Le même calcul, mais la réponse est du JSON (pour la démo en direct)
@app.get("/api/calcul")
def api_calcul():
    a = request.args.get("a", "0")
    b = request.args.get("b", "0")
    op = request.args.get("op", "plus")
    resultat, erreur = calculer(a, b, op)
    if erreur:
        return jsonify({"erreur": erreur}), 400
    return jsonify({"a": resultat["a"], "b": resultat["b"], "op": op,
                    "resultat": resultat["resultat"]})


# Exercice 8 : les formulaires
COULEURS = {"tomato": "Rouge", "teal": "Vert", "royalblue": "Bleu"}


@app.get("/formulaire")
def formulaire():
    return render_template("formulaire.html", couleurs=COULEURS)


@app.route("/salut", methods=["GET", "POST"])
def salut():
    if request.method == "POST":
        # En POST, les données sont dans le corps de la requête
        donnees = request.form
        emplacement = "le corps de la requête"
        brut = urlencode(request.form)
    else:
        # En GET, elles sont dans l'URL, après le "?"
        donnees = request.args
        emplacement = "l'URL"
        brut = request.query_string.decode("utf-8")

    prenom = donnees.get("prenom") or "inconnu"
    ville = donnees.get("ville") or "nulle part"
    couleur = donnees.get("couleur", "royalblue")
    # Liste blanche : on n'accepte que les couleurs prévues
    if couleur not in COULEURS:
        couleur = "royalblue"

    return render_template("salut.html", prenom=prenom, ville=ville, couleur=couleur,
                           nom_couleur=COULEURS[couleur], methode=request.method,
                           emplacement=emplacement, brut=brut)


# Exercice 9 : les codes de statut
# 3xx : une redirection
@app.get("/home")
def home():
    return redirect("/")


# 4xx : un accès interdit
@app.get("/secret")
def secret():
    abort(403)


# 418 : le serveur refuse de faire du café, c'est une théière
@app.get("/teapot")
def teapot():
    abort(418)


@app.errorhandler(403)
def acces_interdit(erreur):
    g.gestionnaire = acces_interdit
    return render_template("403.html", statut=403), 403


# Une page d'erreur 404 personnalisée (sans le ", 404", le navigateur recevrait 200)
@app.errorhandler(404)
def page_introuvable(erreur):
    g.gestionnaire = page_introuvable
    return render_template("404.html", statut=404), 404


@app.errorhandler(418)
def theiere(erreur):
    g.gestionnaire = theiere
    return render_template("418.html", statut=418), 418


@app.errorhandler(500)
def erreur_serveur(erreur):
    g.gestionnaire = erreur_serveur
    return render_template("500.html", statut=500), 500


# Exercice 10 : ce que le serveur sait de vous
@app.get("/moi")
def moi():
    return render_template(
        "moi.html",
        ip=request.headers.get("X-Real-IP", request.remote_addr),
        navigateur=request.headers.get("User-Agent"),
        langues=request.headers.get("Accept-Language"),
        entetes=request.headers,
    )


# Exercice 11 : une API qui répond en JSON
@app.get("/api/heure")
def api_heure():
    maintenant = datetime.now(ZoneInfo("Europe/Paris"))
    return jsonify({
        "heure": maintenant.strftime("%H:%M:%S"),
        "date": maintenant.strftime("%d/%m/%Y"),
        "message": "Bonjour depuis mon API !",
    })


@app.get("/horloge")
def horloge():
    return render_template("horloge.html")


# ---------------------------------------------------------------
#  Les API des coulisses
# ---------------------------------------------------------------

# Renvoie le code d'un template et d'une route, pour le panneau "Coulisses".
# Sécurité : on n'accepte QUE des noms qui existent vraiment, sinon
# quelqu'un pourrait demander ?template=../flask_app.py et lire n'importe quoi.
@app.get("/api/coulisses")
def api_coulisses():
    nom_template = request.args.get("template", "")
    nom_route = request.args.get("endpoint", "")
    reponse = {"template_source": "", "code_route": ""}

    if nom_template:
        if nom_template not in os.listdir(DOSSIER_TEMPLATES):
            abort(404)
        with open(os.path.join(DOSSIER_TEMPLATES, nom_template), encoding="utf-8") as fichier:
            reponse["template_source"] = fichier.read()

    if nom_route:
        if nom_route not in app.view_functions:
            abort(404)
        reponse["code_route"] = lire_code(app.view_functions[nom_route])

    return jsonify(reponse)


# La liste des pages qu'on peut visiter (utilisée par la page 404)
@app.get("/api/routes")
def api_routes():
    routes = []
    for regle in app.url_map.iter_rules():
        if "GET" in regle.methods and not regle.arguments and regle.endpoint != "static":
            routes.append(regle.rule)
    return jsonify(sorted(routes))


# ---------------------------------------------------------------
#  Ne pas modifier : utile seulement pour lancer le site
#  sur votre propre ordinateur (python flask_app.py)
# ---------------------------------------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
