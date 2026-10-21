# 🟣 Exercice 8 — Les formulaires

⏱️ ~20 minutes · [⬅️ Exercice précédent](07-parametres-url.md) · [Exercice suivant ➡️](09-codes-de-statut.md)

## 🎯 Ce que vous allez découvrir

Personne ne tape `?a=3&b=4` à la main ! Sur le Web, ce sont les **formulaires** qui construisent la requête pour l'utilisateur. Vous allez découvrir les deux grandes **méthodes** d'envoi :
- **GET** : les données voyagent **dans l'URL** (visible, on peut la copier, la mettre en favori) ;
- **POST** : les données voyagent **dans le corps de la requête** (invisibles dans l'URL).

## 🛠️ À faire

### Partie A — Un formulaire en GET

1. Créez le template `templates/formulaire.html` :
   ```html
   <!DOCTYPE html>
   <html lang="fr">
   <head>
       <meta charset="utf-8">
       <title>Formulaire</title>
       <link rel="stylesheet" href="/static/style.css">
   </head>
   <body>
       <h1>Faisons connaissance</h1>
       <form action="/salut" method="get">
           <label>Votre prénom : <input type="text" name="prenom"></label>
           <label>Votre ville : <input type="text" name="ville"></label>
           <button type="submit">Envoyer</button>
       </form>
   </body>
   </html>
   ```
   - `action="/salut"` : l'URL où le formulaire envoie les données.
   - `name="prenom"` : le **nom du paramètre** qui sera envoyé.
2. Ajoutez ces deux routes dans `flask_app.py` :
   ```python
   @app.get("/formulaire")
   def formulaire():
       return render_template("formulaire.html")


   @app.get("/salut")
   def salut():
       prenom = request.args.get("prenom", "inconnu")
       ville = request.args.get("ville", "nulle part")
       return f"Bonjour {prenom}, qui vient de {ville} !"
   ```
3. *Commit*, visitez `/formulaire`, remplissez-le et envoyez-le. **Regardez bien la barre d'adresse.**

### Partie B — Le même formulaire en POST

1. Dans `formulaire.html`, remplacez `method="get"` par `method="post"`.
2. Dans `flask_app.py`, modifiez la route `/salut` :
   ```python
   @app.route("/salut", methods=["GET", "POST"])
   def salut():
       if request.method == "POST":
           prenom = request.form.get("prenom", "inconnu")
           ville = request.form.get("ville", "nulle part")
       else:
           prenom = request.args.get("prenom", "inconnu")
           ville = request.args.get("ville", "nulle part")
       return f"Bonjour {prenom}, qui vient de {ville} ! (reçu en {request.method})"
   ```
   Pour une requête POST, les données se lisent dans `request.form` au lieu de `request.args`.
3. *Commit*, puis renvoyez le formulaire. **Regardez à nouveau la barre d'adresse.**

## 👀 À observer

- En **GET**, l'URL ressemble à quoi après l'envoi ? Et en **POST** ?
- En POST, ouvrez **F12 → Réseau**, envoyez le formulaire, cliquez sur la requête `salut` puis sur l'onglet **Charge utile** (*Payload*). Vos données sont là !
- En POST, rechargez la page résultat avec **F5**. Le navigateur vous pose une question… laquelle ? Pourquoi ?

## 📝 Questions (à noter dans `CARNET.md`)

1. Quelle est la différence visible entre GET et POST ?
2. Pour un formulaire de **recherche**, quelle méthode choisiriez-vous ? Et pour un formulaire de **connexion avec mot de passe** ? Pourquoi ?
3. Les données envoyées en POST sont-elles vraiment « secrètes » ? (Pensez à ce que vous avez vu dans l'onglet Réseau.)

## 🧩 Défi

Ajoutez au formulaire une liste déroulante pour choisir une couleur préférée, et affichez la réponse dans la couleur choisie :
```html
<select name="couleur">
    <option value="tomato">Rouge</option>
    <option value="teal">Vert</option>
    <option value="royalblue">Bleu</option>
</select>
```
