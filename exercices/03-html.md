# 🔵 Exercice 3 — Le langage HTML

⏱️ ~15 minutes · [⬅️ Exercice précédent](02-urls-et-routes.md) · [Exercice suivant ➡️](04-templates.md)

## 🎯 Ce que vous allez découvrir

Le serveur n'envoie **que du texte** au navigateur. Mais si ce texte contient des **balises HTML** (`<h1>`, `<p>`, `<ul>`…), le navigateur les **interprète** pour afficher des titres, des paragraphes, des listes, des images…

HTML signifie *HyperText Markup Language* : un langage de **balisage**, pas un langage de programmation. Il décrit la **structure** d'une page.

## 🛠️ À faire

1. Modifiez votre route `/presentation` pour qu'elle renvoie du HTML :
   ```python
   @app.get("/presentation")
   def presentation():
       return """
       <h1>Léa Martin</h1>
       <p>Je suis étudiante en <strong>première année d'informatique</strong>.</p>
       <h2>Ce que j'aime</h2>
       <ul>
           <li>Les jeux vidéo</li>
           <li>La musique</li>
           <li>Le code (bientôt !)</li>
       </ul>
       """
   ```
   💡 Les triples guillemets `"""` permettent d'écrire un texte sur plusieurs lignes en Python.
2. *Commit*, puis visitez `/presentation`.
3. Personnalisez la page avec vos informations. Ajoutez une image avec la balise :
   ```html
   <img src="https://upload.wikimedia.org/wikipedia/commons/c/c3/Python-logo-notext.svg" width="100">
   ```

## 👀 À observer

- Faites un clic droit sur la page → **Afficher le code source de la page** (ou **Ctrl + U**). Vous voyez **exactement** le texte envoyé par votre serveur. Le navigateur, lui, l'a transformé en page mise en forme.
- Faites la même chose (**Ctrl + U**) sur le site de votre choix (Wikipédia, un journal…). C'est aussi du HTML !
- Oubliez volontairement de fermer une balise (supprimez un `</strong>`). Le navigateur affiche-t-il une erreur ?

## 📝 Questions (à noter dans `CARNET.md`)

1. Quelle est la différence entre ce que le serveur **envoie** et ce que le navigateur **affiche** ?
2. À quoi servent les balises `<h1>`, `<p>`, `<ul>` et `<li>` ?
3. Pourquoi l'image s'affiche-t-elle alors qu'elle n'est pas sur votre serveur ?

## 📚 Pour aller plus loin

[Les bases du HTML — MDN](https://developer.mozilla.org/fr/docs/Learn_web_development/Getting_started/Your_first_website/Creating_the_content)
