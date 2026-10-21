# ---------------------------------------------------------------
#  Mon premier site Web avec Flask
# ---------------------------------------------------------------
#  Ce fichier est le "cerveau" de votre site : c'est lui qui
#  reçoit les demandes des navigateurs et qui fabrique les réponses.
#
#  Vous allez le compléter petit à petit, exercice après exercice.
#  Les consignes sont dans le dossier "exercices/".
# ---------------------------------------------------------------

from flask import Flask

app = Flask(__name__)


# Une "route" associe une adresse (URL) à une fonction Python.
# Ici : quand quelqu'un visite la page d'accueil "/",
# Flask exécute la fonction accueil() et renvoie son résultat au navigateur.
@app.get("/")
def accueil():
    return "Tranquil mon frere, bienvenue sur le site a Lea"


# ---------------------------------------------------------------
#  Ajoutez vos nouvelles routes ci-dessous 👇
# ---------------------------------------------------------------

@app.get("/presentation")
def presentation():
    return """
    <h1>Ilyas Afryad</h1>
    <img src="https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg" width="100">
    <p>Je suis étudiant à l'<strong>Icam</strong> et je découvre le fonctionnement du Web.</p>
    <h2>Ce que j'aime</h2>
    <ul>
        <li>Le sport</li>
        <li>La musique</li>
        <li>Les jeux vidéo</li>
        <li>Le code</li>
    </ul>
    """


@app.get("/loisirs")
def loisirs():
    return "Mes loisirs : le sport, la musique, les jeux vidéo et le code."


# ---------------------------------------------------------------
#  Ne pas modifier : utile seulement pour lancer le site
#  sur votre propre ordinateur (python flask_app.py)
# ---------------------------------------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
