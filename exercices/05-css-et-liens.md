# 🔵 Exercice 5 — Le CSS et les liens

⏱️ ~20 minutes · [⬅️ Exercice précédent](04-templates.md) · [Exercice suivant ➡️](06-outils-developpement.md)

## 🎯 Ce que vous allez découvrir

- Le **HTML** décrit la **structure** (ceci est un titre, ceci est une liste…).
- Le **CSS** décrit l'**apparence** (couleurs, polices, marges…). Il se range dans un fichier à part, que le navigateur va **télécharger en plus** de la page.
- Les **liens** (`<a href="...">`) permettent de passer d'une page à l'autre : c'est le « H » de HTML, l'**HyperTexte**, l'idée fondatrice du Web !

## 🛠️ À faire

### Partie A — Le style

1. Créez le fichier `static/style.css` (le dossier `static` sert aux fichiers qui ne changent jamais : CSS, images…) :
   ```css
   body {
       font-family: Arial, sans-serif;
       max-width: 700px;
       margin: 40px auto;
       background-color: #f4f6fb;
       color: #222;
   }

   h1 {
       color: #3355cc;
   }

   nav a {
       margin-right: 15px;
   }
   ```
2. Dans `templates/presentation.html`, ajoutez cette ligne dans la partie `<head>`, juste sous le `<title>` :
   ```html
   <link rel="stylesheet" href="/static/style.css">
   ```
3. *Commit*, puis visitez `/presentation`. Si rien ne change, faites **Ctrl + F5**.
4. Changez les couleurs à votre goût (vous pouvez utiliser des noms comme `tomato`, `teal`, `gold`…).

### Partie B — Les liens

1. Créez un template `templates/accueil.html` pour votre page d'accueil, avec un **menu** :
   ```html
   <!DOCTYPE html>
   <html lang="fr">
   <head>
       <meta charset="utf-8">
       <title>Accueil</title>
       <link rel="stylesheet" href="/static/style.css">
   </head>
   <body>
       <nav>
           <a href="/">Accueil</a>
           <a href="/presentation">Présentation</a>
       </nav>
       <h1>Bienvenue sur mon site !</h1>
       <p>Ce site me sert à découvrir le fonctionnement du Web.</p>
       <p>Un lien vers un autre site : <a href="https://fr.wikipedia.org/wiki/World_Wide_Web">l'histoire du Web</a>.</p>
   </body>
   </html>
   ```
2. Modifiez la route `/` dans `flask_app.py` pour qu'elle utilise ce template :
   ```python
   @app.get("/")
   def accueil():
       return render_template("accueil.html")
   ```
3. Copiez le même bloc `<nav>...</nav>` en haut du `<body>` de `presentation.html`.
4. *Commit* et naviguez entre vos pages en cliquant sur les liens.

## 👀 À observer

- Visitez directement `https://votre-username.pythonanywhere.com/static/style.css`. Que voyez-vous ?
- Le lien vers `/presentation` commence par `/` : c'est un lien **interne** (même serveur). Le lien vers Wikipédia commence par `https://` : c'est un lien **externe** (un autre serveur).

## 📝 Questions (à noter dans `CARNET.md`)

1. Quelle est la différence de rôle entre le HTML et le CSS ?
2. Pour afficher votre page `/presentation`, combien de fichiers le navigateur doit-il télécharger ? (Vous pourrez le vérifier à l'exercice suivant !)
3. Pourquoi faut-il parfois faire **Ctrl + F5** pour voir les changements de CSS ?

## 🧩 Défi

Copier le menu dans chaque page n'est pas pratique : si vous ajoutez une page, il faut modifier tous les fichiers ! Cherchez comment fonctionne `{% extends %}` dans les templates Flask (Jinja) pour créer un modèle commun `base.html`.

## 📚 Pour aller plus loin

[Les bases du CSS — MDN](https://developer.mozilla.org/fr/docs/Learn_web_development/Core/Styling_basics)
