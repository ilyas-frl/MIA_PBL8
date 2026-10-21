# 🟣 Exercice 7 — Envoyer des informations dans l'URL

⏱️ ~15 minutes · [⬅️ Exercice précédent](06-outils-developpement.md) · [Exercice suivant ➡️](08-formulaires.md)

## 🎯 Ce que vous allez découvrir

Jusqu'ici, vos pages affichaient toujours la même chose. Mais une URL peut aussi **transporter des informations** vers le serveur, qui fabrique alors une page **sur mesure**. Il existe deux façons courantes :

```
1) Dans le chemin :            /bonjour/Léa
2) Dans les paramètres :       /calcul?a=3&b=4
                                      └──┬──┘
                         après le « ? », des paires nom=valeur séparées par « & »
```

Vous en croisez tout le temps : regardez l'URL après une recherche sur Google ou YouTube !

## 🛠️ À faire

### Partie A — Une information dans le chemin

1. Ajoutez cette route dans `flask_app.py` :
   ```python
   @app.get("/bonjour/<prenom>")
   def bonjour(prenom):
       return f"<h1>Bonjour {prenom} !</h1>"
   ```
   Les chevrons `<prenom>` indiquent à Flask : « cette partie de l'URL est variable, range-la dans `prenom` ».
2. *Commit*, puis visitez `/bonjour/Léa`, `/bonjour/Tom`, `/bonjour/le monde`…

### Partie B — Des paramètres après le `?`

1. Modifiez la **première ligne** de `flask_app.py` pour importer `request` :
   ```python
   from flask import Flask, render_template, request
   ```
2. Ajoutez cette route :
   ```python
   @app.get("/calcul")
   def calcul():
       a = int(request.args.get("a", 0))
       b = int(request.args.get("b", 0))
       return f"{a} + {b} = {a + b}"
   ```
   `request` contient **toute la requête** envoyée par le navigateur. `request.args` contient les paramètres situés après le `?`.
3. *Commit*, puis visitez `/calcul?a=3&b=4`. Changez les nombres directement dans la barre d'adresse.

## 👀 À observer

- Visitez `/calcul` **sans** paramètres. Que se passe-t-il ? (Regardez le `0` dans le code.)
- Visitez `/calcul?a=bonjour&b=4`. Que se passe-t-il ? Allez lire l'Error log.
- 🕵️ Visitez `/bonjour/<i>Léa` puis, plus inquiétant, `/bonjour/<button>Cliquez-moi`. Le visiteur a réussi à **injecter du HTML** dans votre page ! Imaginez s'il injectait un script malveillant…

## 📝 Questions (à noter dans `CARNET.md`)

1. Dans l'URL `https://www.youtube.com/results?search_query=chat`, quel est le nom du paramètre ? Quelle est sa valeur ?
2. Pourquoi le serveur plante-t-il avec `a=bonjour` ? Que faudrait-il faire pour l'éviter ?
3. Pourquoi est-il dangereux d'afficher **tel quel** ce que l'utilisateur envoie ?

## 🧩 Défi

1. Corrigez la faille de la partie A : au lieu d'un `f"..."`, utilisez un template (comme à l'exercice 4) qui affiche `{{ prenom }}`. Refaites le test `/bonjour/<button>Cliquez-moi` et regardez le code source (**Ctrl + U**). Que constatez-vous ? Les templates **protègent** automatiquement votre page.
2. Ajoutez un paramètre `op` à `/calcul` pour choisir l'opération : `/calcul?a=6&b=3&op=fois`.
