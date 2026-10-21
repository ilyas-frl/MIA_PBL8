# 🔵 Exercice 4 — Les templates

⏱️ ~15 minutes · [⬅️ Exercice précédent](03-html.md) · [Exercice suivant ➡️](05-css-et-liens.md)

## 🎯 Ce que vous allez découvrir

Écrire du HTML au milieu du code Python, ça devient vite illisible. Les développeurs **séparent** :
- le **code** (Python, dans `flask_app.py`) qui décide *quoi* afficher,
- la **présentation** (HTML, dans des fichiers à part appelés **templates**) qui décide *comment* l'afficher.

Bonus : un template peut contenir des **trous** `{{ ... }}` que Python remplit au dernier moment. C'est ce qui permet à un même site d'afficher « Bonjour Léa » ou « Bonjour Tom » selon la personne connectée.

## 🛠️ À faire

1. Créez un nouveau fichier : **Add file → Create new file**, et tapez comme nom `templates/presentation.html` (le dossier `templates` sera créé automatiquement). Collez-y une **vraie page HTML complète** :
   ```html
   <!DOCTYPE html>
   <html lang="fr">
   <head>
       <meta charset="utf-8">
       <title>Présentation</title>
   </head>
   <body>
       <h1>{{ prenom }} {{ nom }}</h1>
       <p>Je suis étudiant(e) en <strong>première année d'informatique</strong>.</p>
   </body>
   </html>
   ```
   Notez la structure : la partie `<head>` contient des informations **sur** la page (le titre de l'onglet…), la partie `<body>` contient ce qui **s'affiche**.

2. Dans `flask_app.py`, modifiez la **première ligne** pour importer l'outil `render_template` :
   ```python
   from flask import Flask, render_template
   ```

3. Remplacez votre route `/presentation` par :
   ```python
   @app.get("/presentation")
   def presentation():
       return render_template("presentation.html", prenom="Léa", nom="Martin")
   ```
4. *Commit* (les deux fichiers), puis visitez `/presentation`.

## 👀 À observer

- Regardez l'onglet de votre navigateur : il affiche maintenant le titre défini dans `<title>`.
- Faites **Ctrl + U** : les `{{ prenom }}` ont disparu ! Ils ont été remplacés **sur le serveur**, avant l'envoi. Le navigateur ne voit jamais le template original.
- Changez la valeur de `prenom` dans `flask_app.py` (sans toucher au HTML) et faites un *commit*. La page change.

## 📝 Questions (à noter dans `CARNET.md`)

1. Pourquoi est-ce une bonne idée de séparer le code Python et le HTML ? (Pensez à une équipe avec un développeur et un graphiste.)
2. Les `{{ prenom }}` sont-ils remplacés par le serveur ou par le navigateur ? Comment l'avez-vous vérifié ?

## 🧩 Défi

Les templates savent faire des **boucles**. Envoyez une liste de loisirs depuis Python :
```python
return render_template("presentation.html", prenom="Léa", nom="Martin",
                       loisirs=["Jeux vidéo", "Musique", "Escalade"])
```
et affichez-la dans le template :
```html
<ul>
{% for loisir in loisirs %}
    <li>{{ loisir }}</li>
{% endfor %}
</ul>
```
Ajoutez un loisir dans la liste Python : le HTML s'adapte tout seul !
