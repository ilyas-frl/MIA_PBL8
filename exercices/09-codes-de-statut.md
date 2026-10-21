# 🔴 Exercice 9 — Les codes de statut

⏱️ ~15 minutes · [⬅️ Exercice précédent](08-formulaires.md) · [Exercice suivant ➡️](10-ce-que-le-serveur-sait.md)

## 🎯 Ce que vous allez découvrir

Chaque réponse HTTP commence par un **code de statut** à 3 chiffres. Le premier chiffre donne la « famille » :

| Famille | Signification | Exemples |
|---|---|---|
| **2xx** ✅ | Succès | `200 OK` |
| **3xx** ↪️ | Redirection : « va voir ailleurs » | `301 Moved Permanently`, `302 Found` |
| **4xx** 🙅 | Erreur **du client** (mauvaise demande) | `403 Forbidden`, `404 Not Found` |
| **5xx** 💥 | Erreur **du serveur** (bug, panne) | `500 Internal Server Error` |

Vous en avez déjà croisé plusieurs ! Cette fois, c'est **vous** qui allez les envoyer.

## 🛠️ À faire

1. Modifiez la **première ligne** de `flask_app.py` :
   ```python
   from flask import Flask, render_template, request, redirect, abort
   ```
2. Ajoutez ces routes :
   ```python
   # 3xx : une redirection
   @app.get("/home")
   def home():
       return redirect("/")


   # 4xx : un accès interdit
   @app.get("/secret")
   def secret():
       abort(403)


   # Une page d'erreur 404 personnalisée
   @app.errorhandler(404)
   def page_introuvable(erreur):
       return render_template("404.html"), 404
   ```
3. Créez le template `templates/404.html` :
   ```html
   <!DOCTYPE html>
   <html lang="fr">
   <head>
       <meta charset="utf-8">
       <title>Page introuvable</title>
       <link rel="stylesheet" href="/static/style.css">
   </head>
   <body>
       <h1>Oups ! 🧭</h1>
       <p>Cette page n'existe pas (erreur 404).</p>
       <p><a href="/">Retour à l'accueil</a></p>
   </body>
   </html>
   ```
4. *Commit* et testez : `/home`, `/secret`, `/nimportequoi`.

## 👀 À observer

Gardez **F12 → Réseau** ouvert pendant vos tests (cochez **Conserver le journal** / *Preserve log*).
- Sur `/home` : combien de requêtes voyez-vous ? Quels sont leurs codes ? Que contient l'en-tête de réponse `Location` ?
- Sur `/nimportequoi` : la page est jolie… mais quel code voit le navigateur ?
- Dans la route `page_introuvable`, retirez le `, 404` à la fin du `return`, faites un *commit* et retestez. Quel code apparaît maintenant ? Pourquoi est-ce un problème (pensez aux moteurs de recherche) ?

## 📝 Questions (à noter dans `CARNET.md`)

1. Quelle est la différence entre une erreur `4xx` et une erreur `5xx` ? Qui est « fautif » dans chaque cas ?
2. Comment fonctionne une redirection ? Qui fait la deuxième requête : le serveur ou le navigateur ?
3. Donnez un exemple de situation où un vrai site utilise une redirection.

## 🧩 Défi

Personnalisez aussi la page d'erreur **403** avec un template `403.html`. Puis cherchez sur le Web la signification du code **418** 🫖.
