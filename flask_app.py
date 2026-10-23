# ---------------------------------------------------------------
#  Mon premier site Web avec Flask
# ---------------------------------------------------------------
#  Ce fichier est le "cerveau" de votre site : c'est lui qui
#  reçoit les demandes des navigateurs et qui fabrique les réponses.
#
#  Vous allez le compléter petit à petit, exercice après exercice.
#  Les consignes sont dans le dossier "exercices/".
# ---------------------------------------------------------------

from flask import Flask, render_template, request

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


# ---------------------------------------------------------------
#  Ne pas modifier : utile seulement pour lancer le site
#  sur votre propre ordinateur (python flask_app.py)
# ---------------------------------------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
