# ---------------------------------------------------------------
#  test_routes.py : vérifie que chaque route répond comme prévu
#  À lancer sur votre ordinateur : python test_routes.py
#  (ce fichier n'est pas envoyé sur PythonAnywhere)
# ---------------------------------------------------------------

import sys

from flask_app import app

sys.stdout.reconfigure(encoding="utf-8")

client = app.test_client()
erreurs = []


def verifier(description, condition):
    print(("  OK   " if condition else "  ÉCHEC ") + description)
    if not condition:
        erreurs.append(description)


def statut(chemin, attendu, methode="GET", **options):
    reponse = client.open(chemin, method=methode, **options)
    verifier(f"{methode} {chemin} -> {attendu} (reçu {reponse.status_code})", reponse.status_code == attendu)
    verifier(f"{methode} {chemin} : en-tête Server-Timing présent", "Server-Timing" in reponse.headers)
    return reponse


print("Pages des exercices")
statut("/", 200)
r = statut("/presentation", 200)
verifier("/presentation affiche le prénom et le nom", "Ilyas" in r.text and "Afryad" in r.text)
statut("/loisirs", 200)
r = statut("/bonjour/Ilyas", 200)
verifier("/bonjour/Ilyas affiche Bonjour Ilyas", "Bonjour Ilyas" in r.text)
r = statut("/bonjour/<script>alert(1)</script>", 200)
verifier("/bonjour/<script>… est échappé par Jinja", "<script>alert(1)" not in r.text and "&lt;script&gt;alert(1)&lt;/script&gt;" in r.text)
r = statut("/calcul?a=6&b=3&op=fois", 200)
verifier("6 × 3 = 18", "6 × 3 = 18" in r.text)
statut("/calcul", 200)
statut("/calcul?a=x", 400)
statut("/calcul?a=1&b=0&op=divise", 400)
statut("/calcul?a=1&b=2&op=puissance", 400)

print("Formulaires")
statut("/formulaire", 200)
r = statut("/salut?prenom=Léa&ville=Lyon&couleur=teal", 200)
verifier("GET /salut lit request.args", "Léa" in r.text and "Lyon" in r.text and "reçu en GET" in r.text)
r = statut("/salut", 200, methode="POST", data={"prenom": "Tom", "ville": "Paris", "couleur": "tomato"})
verifier("POST /salut lit request.form", "Tom" in r.text and "reçu en POST" in r.text)
verifier("POST /salut reconstitue le corps", "prenom=Tom&amp;ville=Paris&amp;couleur=tomato" in r.text)
r = statut("/salut", 200, methode="POST", data={"prenom": "Tom", "couleur": "red;background:url(x)"})
verifier("couleur hors liste blanche refusée", "red;background" not in r.text)

print("Codes de statut")
r = statut("/home", 302)
verifier("/home redirige vers /", r.headers.get("Location", "").endswith("/"))
statut("/secret", 403)
statut("/nimportequoi", 404)
statut("/teapot", 418)

print("Ce que le serveur sait, API")
r = statut("/moi", 200, headers={"User-Agent": "TestNavigateur/1.0", "Accept-Language": "fr-FR"})
verifier("/moi affiche le User-Agent", "TestNavigateur/1.0" in r.text)
r = statut("/api/heure", 200)
verifier("/api/heure est du JSON", r.mimetype == "application/json")
verifier("/api/heure contient heure, date, message", set(r.get_json()) == {"heure", "date", "message"})
statut("/horloge", 200)
r = statut("/api/calcul?a=6&b=3&op=fois", 200)
verifier("/api/calcul renvoie le résultat", r.get_json()["resultat"] == 18)
r = statut("/api/calcul?a=1&b=0&op=divise", 400)
verifier("/api/calcul renvoie une erreur en JSON", "erreur" in r.get_json())

print("Coulisses")
r = statut("/api/coulisses?template=accueil.html&endpoint=accueil", 200)
verifier("/api/coulisses renvoie le template et la route", "{% extends" in r.get_json()["template_source"] and "def accueil" in r.get_json()["code_route"])
statut("/api/coulisses?template=../flask_app.py", 404)
statut("/api/coulisses?template=..%2Fflask_app.py", 404)
statut("/api/coulisses?endpoint=nexistepas", 404)
r = statut("/api/routes", 200)
verifier("/api/routes liste /horloge", "/horloge" in r.get_json())
r = client.get("/presentation")
verifier("le body indique le template", 'data-template="presentation.html"' in r.text)
verifier("la page contient le code de sa route", "def presentation" in r.text)
r = client.get("/nimportequoi")
verifier("la 404 montre son gestionnaire", "def page_introuvable" in r.text)
statut("/static/favicon.svg", 200)
statut("/static/css/site.css", 200)

print()
if erreurs:
    print(f"{len(erreurs)} vérification(s) en échec.")
    raise SystemExit(1)
print("Tout est vert.")
