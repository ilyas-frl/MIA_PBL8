# 🟢 Exercice 1 — Mon premier déploiement

⏱️ ~10 minutes · [⬅️ Retour au sommaire](../README.md#-séquence-4--les-exercices) · [Exercice suivant ➡️](02-urls-et-routes.md)

## 🎯 Ce que vous allez découvrir

Un site Web, c'est un **programme qui tourne sur un serveur** (un ordinateur allumé en permanence, quelque part dans le monde). Quand vous modifiez ce programme, il faut **le livrer au serveur** pour que les visiteurs voient le changement. C'est le **déploiement**.

## 🛠️ À faire

1. Dans votre dépôt GitHub, ouvrez le fichier `flask_app.py` et cliquez sur le crayon ✏️.
2. Repérez cette ligne :
   ```python
   return "Bonjour le monde ! (Flask on PythonAnywhere)"
   ```
3. Remplacez le texte entre guillemets par une phrase de votre choix, par exemple :
   ```python
   return "Bienvenue sur le site de Léa 🚀"
   ```
4. Cliquez sur **Commit changes…** puis encore sur **Commit changes**.
5. Ouvrez l'onglet **Actions** et regardez le robot travailler (🟡 puis ✅).
6. Rechargez votre site `https://votre-username.pythonanywhere.com`.

## 👀 À observer

- Combien de temps s'écoule entre votre *commit* et l'apparition du changement sur le site ?
- Ouvrez votre site **sur votre téléphone** (en 4G, pas en Wi-Fi). Il fonctionne aussi ! Votre site est accessible depuis **n'importe où dans le monde**.
- Dans GitHub, cliquez sur le lien **Commits** (l'icône d'horloge 🕓 au-dessus de la liste des fichiers) : chaque modification est enregistrée, avec sa date et son auteur.

## 📝 Questions (à noter dans `CARNET.md`)

1. Où se trouve physiquement le code qui fabrique votre page : sur votre ordinateur, sur GitHub ou sur PythonAnywhere ?
2. Pourquoi votre voisin(e) peut-il voir votre site, alors que vous n'avez rien installé sur son ordinateur ?

## 🧩 Défi

Volontairement, cassez votre code : supprimez le guillemet de fin de la phrase, puis faites un *commit*. Que se passe-t-il sur votre site ? Allez lire l'**Error log** sur PythonAnywhere (voir la section [Dépannage](../README.md#-dépannage)) et trouvez la ligne qui explique l'erreur. Puis réparez !
