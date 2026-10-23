# 📒 Mon carnet de bord

**Nom : Afryad** 

**Prénom : Ilyas** 

**Adresse de mon site :** https://ilyasafr.pythonanywhere.com

> Modifiez ce fichier directement sur GitHub (icône crayon ✏️) pour répondre aux questions de chaque exercice.
> Écrivez avec vos propres mots : une réponse courte et juste vaut mieux qu'un long copier-coller ! 🙂

---

## 🟢 Exercice 1 — Mon premier déploiement

1. Où se trouve physiquement le code qui fabrique votre page : sur votre ordinateur, sur GitHub ou sur PythonAnywhere ?

   > _Ma réponse : Le code qui fabrique la page se trouve sur le serveur PythonAnywhere._

2. Pourquoi votre voisin(e) peut-il voir votre site, alors que vous n'avez rien installé sur son ordinateur ?

   > _Ma réponse : Le site est hébergé sur un serveur accessible par Internet, donc n'importe quel navigateur peut l'afficher avec le lien._

---

## 🟢 Exercice 2 — Les URL et les routes

1. Dans l'URL `https://www.google.com/maps`, quel est le nom de domaine ? Quel est le chemin ?

   > _Ma réponse : Le nom de domaine est www.google.com et le chemin est /maps._

2. Que veut dire le message *Not Found* ? Qui l'a envoyé : votre navigateur ou le serveur ?

   > _Ma réponse : Not Found signifie que la page demandée n'existe pas, et c'est le serveur qui envoie ce message._

3. Que se passe-t-il si deux fonctions portent le même nom dans `flask_app.py` ? (Indice : essayez, puis lisez l'Error log.)

   > _Ma réponse : Le site ne démarre plus et l'Error log affiche une AssertionError, car deux routes ne peuvent pas avoir le même nom de fonction._

---

## 🔵 Exercice 3 — Le langage HTML

1. Quelle est la différence entre ce que le serveur **envoie** et ce que le navigateur **affiche** ?

   > _Ma réponse : Le serveur envoie du texte avec des balises, et le navigateur interprète ces balises pour afficher une page mise en forme._

2. À quoi servent les balises `<h1>`, `<p>`, `<ul>` et `<li>` ?

   > _Ma réponse : La balise h1 sert au titre principal, p à un paragraphe, ul à une liste à puces et li à chaque élément de cette liste._

3. Pourquoi l'image s'affiche-t-elle alors qu'elle n'est pas sur votre serveur ?

   > _Ma réponse : Le navigateur télécharge lui-même l'image depuis le serveur de Wikimedia grâce à l'adresse indiquée dans la balise img._

---

## 🔵 Exercice 4 — Les templates

1. Pourquoi est-ce une bonne idée de séparer le code Python et le HTML ? (Pensez à une équipe avec un développeur et un graphiste.)

   > _Ma réponse : La séparation rend le code plus lisible et permet au développeur et au graphiste de travailler chacun sur leurs fichiers sans se gêner._

2. Les `{{ prenom }}` sont-ils remplacés par le serveur ou par le navigateur ? Comment l'avez-vous vérifié ?

   > _Ma réponse : Ils sont remplacés par le serveur, ce qui se vérifie avec Ctrl + U puisque le code source affiche directement le prénom._

---

## 🔵 Exercice 5 — Le CSS et les liens

1. Quelle est la différence de rôle entre le HTML et le CSS ?

   > _Ma réponse : Le HTML définit la structure de la page alors que le CSS définit son apparence._

2. Pour afficher votre page `/presentation`, combien de fichiers le navigateur doit-il télécharger ? (Vous pourrez le vérifier à l'exercice suivant !)

   > _Ma réponse : Le navigateur télécharge trois fichiers, à savoir la page HTML, la feuille de style CSS et l'image._

3. Pourquoi faut-il parfois faire **Ctrl + F5** pour voir les changements de CSS ?

   > _Ma réponse : Le navigateur garde l'ancien fichier CSS en mémoire dans son cache, et Ctrl + F5 l'oblige à le télécharger à nouveau._

---

## 🟣 Exercice 6 — Espionner le navigateur

1. Que signifie HTTP ? Qui envoie la **requête** et qui envoie la **réponse** ?

   > _Ma réponse : HTTP signifie HyperText Transfer Protocol, le navigateur envoie la requête et le serveur envoie la réponse._

2. Combien de requêtes votre page `/presentation` a-t-elle déclenchées ? Lesquelles ?

   > _Ma réponse : La page a déclenché quatre requêtes, à savoir presentation, style.css, l'image du logo Python et favicon.ico._

3. Que signifie le code `200` ? Et le code `404` de la favicon ?

   > _Ma réponse : Le code 200 signifie que la requête a réussi, et le code 404 signifie que la favicon n'existe pas sur le serveur._

4. Pourquoi les modifications faites dans l'onglet Éléments ne sont-elles pas visibles par les autres visiteurs ?

   > _Ma réponse : Les modifications changent seulement la copie de la page dans le navigateur, et non le code sur le serveur._

---

## 🟣 Exercice 7 — Envoyer des informations dans l'URL

1. Dans l'URL `https://www.youtube.com/results?search_query=chat`, quel est le nom du paramètre ? Quelle est sa valeur ?

   > _Ma réponse : Le nom du paramètre est search_query et sa valeur est chat._

2. Pourquoi le serveur plante-t-il avec `a=bonjour` ? Que faudrait-il faire pour l'éviter ?

   > _Ma réponse : Le serveur plante car « bonjour » ne peut pas être converti en nombre, il faut donc vérifier la valeur avant de la convertir._

3. Pourquoi est-il dangereux d'afficher **tel quel** ce que l'utilisateur envoie ?

   > _Ma réponse : Un visiteur peut injecter du HTML ou un script malveillant qui s'exécute dans le navigateur des autres visiteurs._

---

## 🟣 Exercice 8 — Les formulaires

1. Quelle est la différence visible entre GET et POST ?

   > _Ma réponse :_ 

2. Pour un formulaire de **recherche**, quelle méthode choisiriez-vous ? Et pour un formulaire de **connexion avec mot de passe** ? Pourquoi ?

   > _Ma réponse :_ 

3. Les données envoyées en POST sont-elles vraiment « secrètes » ? (Pensez à ce que vous avez vu dans l'onglet Réseau.)

   > _Ma réponse :_ 

---

## 🔴 Exercice 9 — Les codes de statut

1. Quelle est la différence entre une erreur `4xx` et une erreur `5xx` ? Qui est « fautif » dans chaque cas ?

   > _Ma réponse :_ 

2. Comment fonctionne une redirection ? Qui fait la deuxième requête : le serveur ou le navigateur ?

   > _Ma réponse :_ 

3. Donnez un exemple de situation où un vrai site utilise une redirection.

   > _Ma réponse :_ 

---

## 🔴 Exercice 10 — Ce que le serveur sait de vous

1. Citez trois informations que le serveur connaît sur vous, sans que vous ayez rien rempli.

   > _Ma réponse :_ 

2. À quoi peut servir l'en-tête `Accept-Language` pour un site comme Wikipédia ?

   > _Ma réponse :_ 

3. Dans l'Access log, retrouvez une requête qui a reçu un code `404`. Quelle page était demandée ?

   > _Ma réponse :_ 

4. Après cet exercice, que pensez-vous de la notion de « navigation anonyme » ?

   > _Ma réponse :_ 

---

## 🔴 Exercice 11 — Le Web des machines : API et JSON

1. Quelle est la différence entre une page HTML et une réponse JSON ? À qui chacune est-elle destinée ?

   > _Ma réponse :_ 

2. Dans la page `/horloge`, quel code s'exécute sur le **serveur** et quel code s'exécute dans le **navigateur** ?

   > _Ma réponse :_ 

3. Citez une application de votre téléphone qui, selon vous, utilise une API. Quelles données échange-t-elle ?

   > _Ma réponse :_ 

---

## 🏁 Pour conclure

En quelques phrases, expliquez à un ami ce qui se passe entre le moment où il tape une adresse dans son navigateur et celui où la page s'affiche :

> _Ma réponse :_ 
