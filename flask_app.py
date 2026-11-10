# ---------------------------------------------------------------
#  Mon premier site Web avec Flask
# ---------------------------------------------------------------
#  Ce fichier est le "cerveau" de votre site : c'est lui qui
#  reçoit les demandes des navigateurs et qui fabrique les réponses.
#
#  Vous allez le compléter petit à petit, exercice après exercice.
#  Les consignes sont dans le dossier "exercices/".
# ---------------------------------------------------------------

from flask import Flask, render_template, request, redirect, abort, jsonify
from datetime import datetime
from zoneinfo import ZoneInfo

app = Flask(__name__)


# Une "route" associe une adresse (URL) à une fonction Python.
# Ici : quand quelqu'un visite la page d'accueil "/",
# Flask exécute la fonction accueil() et renvoie son résultat au navigateur.
@app.get("/")
def accueil():
    return render_template("accueil.html")


# ---------------------------------------------------------------
#  Ajoutez vos nouvelles routes ci-dessous 👇
# ---------------------------------------------------------------

# Exercices 2 à 5 : une page de présentation (template + boucle)
@app.get("/presentation")
def presentation():
    return render_template("presentation.html", prenom="Ilyas", nom="Afryad",
                           loisirs=["Le sport", "La musique", "Les jeux vidéo", "Le code"])


@app.get("/loisirs")
def loisirs():
    return render_template("loisirs.html",
                           loisirs=["Le sport", "La musique", "Les jeux vidéo", "Le code"])


# Exercice 7 : une information dans le chemin
# (le template échappe le HTML : /bonjour/<button>... ne s'injecte plus)
@app.get("/bonjour/<prenom>")
def bonjour(prenom):
    return render_template("bonjour.html", prenom=prenom)


# Exercice 7 : des paramètres après le "?"
OPERATIONS = {
    "plus": ("+", lambda a, b: a + b),
    "moins": ("-", lambda a, b: a - b),
    "fois": ("×", lambda a, b: a * b),
    "divise": ("÷", lambda a, b: a / b),
}


@app.get("/calcul")
def calcul():
    try:
        a = int(request.args.get("a", 0))
        b = int(request.args.get("b", 0))
    except ValueError:
        return "Erreur : a et b doivent être des nombres entiers.", 400

    op = request.args.get("op", "plus")
    if op not in OPERATIONS:
        return f"Erreur : opération inconnue. Choisissez parmi {', '.join(OPERATIONS)}.", 400
    if op == "divise" and b == 0:
        return "Erreur : division par zéro impossible.", 400

    symbole, fonction = OPERATIONS[op]
    return f"{a} {symbole} {b} = {fonction(a, b)}"


# Exercice 8 : les formulaires (GET et POST)
COULEURS = {"tomato": "Rouge", "teal": "Vert", "royalblue": "Bleu"}


@app.get("/formulaire")
def formulaire():
    return render_template("formulaire.html", couleurs=COULEURS)


@app.route("/salut", methods=["GET", "POST"])
def salut():
    if request.method == "POST":
        donnees = request.form
    else:
        donnees = request.args
    prenom = donnees.get("prenom") or "inconnu"
    ville = donnees.get("ville") or "nulle part"
    couleur = donnees.get("couleur")
    if couleur not in COULEURS:
        couleur = "inherit"
    return render_template("salut.html", prenom=prenom, ville=ville,
                           couleur=couleur, methode=request.method)


# Exercice 9 : les codes de statut
# 3xx : une redirection
@app.get("/home")
def home():
    return redirect("/")


# 4xx : un accès interdit
@app.get("/secret")
def secret():
    abort(403)


# 418 : « I'm a teapot », un code humoristique (RFC 2324)
@app.get("/the")
def the():
    abort(418)


# Des pages d'erreur personnalisées
@app.errorhandler(404)
def page_introuvable(erreur):
    return render_template("404.html"), 404


@app.errorhandler(403)
def acces_interdit(erreur):
    return render_template("403.html"), 403


@app.errorhandler(418)
def theiere(erreur):
    return render_template("418.html"), 418


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


# Exercice 11 : une API qui renvoie du JSON
@app.get("/api/heure")
def api_heure():
    maintenant = datetime.now(ZoneInfo("Europe/Paris"))
    return jsonify({
        "heure": maintenant.strftime("%H:%M:%S"),
        "date": maintenant.strftime("%d/%m/%Y"),
        "message": "Bonjour depuis mon API !",
    })


# Exercice 11 : une page qui utilise l'API
@app.get("/horloge")
def horloge():
    return render_template("horloge.html")


# ---------------------------------------------------------------
#  Ne pas modifier : utile seulement pour lancer le site
#  sur votre propre ordinateur (python flask_app.py)
# ---------------------------------------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
