# 🔴 Exercice 11 — Le Web des machines : API et JSON

⏱️ ~20 minutes · [⬅️ Exercice précédent](10-ce-que-le-serveur-sait.md) · [🏁 Retour au sommaire](../README.md#-séquence-4--les-exercices)

## 🎯 Ce que vous allez découvrir

Le Web ne sert pas qu'à afficher des pages pour les humains. Des programmes s'échangent aussi des données entre eux : l'application météo de votre téléphone, par exemple, interroge un serveur qui lui répond avec **des données brutes**, pas avec une page HTML. Un tel service s'appelle une **API**, et le format le plus utilisé est le **JSON**.

```json
{ "ville": "Paris", "temperature": 18, "ciel": "nuageux" }
```

Vous allez aussi découvrir **JavaScript** : un langage exécuté **dans le navigateur** (et non sur le serveur), qui peut mettre à jour une page **sans la recharger**.

## 🛠️ À faire

### Partie A — Observer une vraie API

Visitez dans votre navigateur : `https://api.github.com/users/octocat`
C'est l'API de GitHub. Elle renvoie les informations d'un utilisateur en JSON. Remplacez `octocat` par votre propre nom d'utilisateur GitHub !

### Partie B — Créer votre propre API

1. Modifiez la **première ligne** de `flask_app.py` et ajoutez deux imports juste en dessous :
   ```python
   from flask import Flask, render_template, request, redirect, abort, jsonify
   from datetime import datetime
   from zoneinfo import ZoneInfo
   ```
2. Ajoutez la route :
   ```python
   @app.get("/api/heure")
   def api_heure():
       maintenant = datetime.now(ZoneInfo("Europe/Paris"))
       return jsonify({
           "heure": maintenant.strftime("%H:%M:%S"),
           "date": maintenant.strftime("%d/%m/%Y"),
           "message": "Bonjour depuis mon API !",
       })
   ```
3. *Commit*, puis visitez `/api/heure`. Rechargez plusieurs fois.

### Partie C — Une page qui utilise votre API

1. Créez le template `templates/horloge.html` :
   ```html
   <!DOCTYPE html>
   <html lang="fr">
   <head>
       <meta charset="utf-8">
       <title>Horloge</title>
       <link rel="stylesheet" href="/static/style.css">
   </head>
   <body>
       <h1>Il est <span id="heure">...</span></h1>
       <p id="message"></p>

       <script>
           // Ce code s'exécute dans le NAVIGATEUR, pas sur le serveur
           async function mettreAJour() {
               const reponse = await fetch("/api/heure");   // envoie une requête à l'API
               const donnees = await reponse.json();         // lit le JSON reçu
               document.getElementById("heure").textContent = donnees.heure;
               document.getElementById("message").textContent = donnees.message;
           }
           mettreAJour();
           setInterval(mettreAJour, 1000);  // recommence toutes les secondes
       </script>
   </body>
   </html>
   ```
2. Ajoutez la route qui affiche cette page :
   ```python
   @app.get("/horloge")
   def horloge():
       return render_template("horloge.html")
   ```
3. *Commit*, puis visitez `/horloge`. L'heure défile toute seule !

## 👀 À observer

- Sur `/api/heure`, faites **Ctrl + U** : il n'y a **aucune** balise HTML. Dans **F12 → Réseau**, quel est le `Content-Type` de la réponse ?
- Sur `/horloge`, ouvrez **F12 → Réseau** : que se passe-t-il toutes les secondes ? La page entière est-elle rechargée ?

## 📝 Questions (à noter dans `CARNET.md`)

1. Quelle est la différence entre une page HTML et une réponse JSON ? À qui chacune est-elle destinée ?
2. Dans la page `/horloge`, quel code s'exécute sur le **serveur** et quel code s'exécute dans le **navigateur** ?
3. Citez une application de votre téléphone qui, selon vous, utilise une API. Quelles données échange-t-elle ?

## 🏁 Bravo !

Vous avez fait le tour des grandes notions du Web : **URL, HTML, CSS, HTTP, paramètres, formulaires, codes de statut, en-têtes, API et JavaScript**. Ce sont exactement les briques qui font fonctionner les sites que vous utilisez tous les jours. 🎉

Relisez votre `CARNET.md` : en une phrase, comment expliqueriez-vous maintenant à un ami ce qui se passe quand on tape une adresse dans un navigateur ?
