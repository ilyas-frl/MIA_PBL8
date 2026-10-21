# 🔴 Exercice 10 — Ce que le serveur sait de vous

⏱️ ~15 minutes · [⬅️ Exercice précédent](09-codes-de-statut.md) · [Exercice suivant ➡️](11-api-json.md)

## 🎯 Ce que vous allez découvrir

À chaque requête, votre navigateur envoie **bien plus** que l'URL demandée. Il joint des **en-têtes** (*headers*) : quel navigateur vous utilisez, votre système d'exploitation, vos langues préférées… Et le serveur, lui, **note chaque visite** dans un journal.

## 🛠️ À faire

1. Ajoutez cette route dans `flask_app.py` :
   ```python
   @app.get("/moi")
   def moi():
       return render_template(
           "moi.html",
           ip=request.headers.get("X-Real-IP", request.remote_addr),
           navigateur=request.headers.get("User-Agent"),
           langues=request.headers.get("Accept-Language"),
           entetes=request.headers,
       )
   ```
2. Créez le template `templates/moi.html` :
   ```html
   <!DOCTYPE html>
   <html lang="fr">
   <head>
       <meta charset="utf-8">
       <title>Ce que je sais de vous</title>
       <link rel="stylesheet" href="/static/style.css">
   </head>
   <body>
       <h1>Ce que je sais de vous 🔍</h1>
       <p><strong>Votre adresse IP :</strong> {{ ip }}</p>
       <p><strong>Votre navigateur :</strong> {{ navigateur }}</p>
       <p><strong>Vos langues :</strong> {{ langues }}</p>

       <h2>Tous les en-têtes reçus</h2>
       <ul>
       {% for nom, valeur in entetes %}
           <li><strong>{{ nom }}</strong> : {{ valeur }}</li>
       {% endfor %}
       </ul>
   </body>
   </html>
   ```
3. *Commit*, puis visitez `/moi`.

## 👀 À observer

- Ouvrez `/moi` depuis **votre téléphone** puis depuis **l'ordinateur**. Qu'est-ce qui change ?
- Comparez avec votre voisin(e) : avez-vous la même adresse IP ? (Si vous êtes sur le même Wi-Fi, c'est normal !)
- Sur PythonAnywhere, onglet **Web** → **Log files** → ouvrez l'**Access log**. Retrouvez vos propres visites : on y voit l'heure, l'IP, la page demandée, le code de statut et le navigateur.

## 📝 Questions (à noter dans `CARNET.md`)

1. Citez trois informations que le serveur connaît sur vous, sans que vous ayez rien rempli.
2. À quoi peut servir l'en-tête `Accept-Language` pour un site comme Wikipédia ?
3. Dans l'Access log, retrouvez une requête qui a reçu un code `404`. Quelle page était demandée ?
4. Après cet exercice, que pensez-vous de la notion de « navigation anonyme » ?
