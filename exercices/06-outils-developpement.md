# 🟣 Exercice 6 — Espionner le navigateur

⏱️ ~15 minutes · [⬅️ Exercice précédent](05-css-et-liens.md) · [Exercice suivant ➡️](07-parametres-url.md)

## 🎯 Ce que vous allez découvrir

Le navigateur et le serveur communiquent avec un protocole appelé **HTTP** (*HyperText Transfer Protocol*). C'est une conversation très simple :

```
Navigateur  ──── REQUÊTE  : « GET /presentation, s'il te plaît » ───▶  Serveur
Navigateur  ◀─── RÉPONSE  : « 200 OK, voici le HTML »  ─────────────  Serveur
```

Tous les navigateurs contiennent des **outils de développement** qui permettent d'espionner cette conversation. Aujourd'hui, vous ne codez pas : vous **observez**.

## 🛠️ À faire

1. Ouvrez votre page `/presentation`.
2. Appuyez sur **F12** (ou clic droit → **Inspecter**), puis ouvrez l'onglet **Réseau** (*Network*).
3. Rechargez la page (**F5**). Des lignes apparaissent : chacune est **une requête** envoyée par le navigateur.
4. Cliquez sur la ligne `presentation`, puis explorez les onglets **En-têtes** (*Headers*) et **Réponse** (*Response*).

## 👀 À observer

Pour chaque ligne du tableau, repérez :

| Colonne | Signification |
|---|---|
| **Nom** / *Name* | Le fichier demandé |
| **Méthode** / *Method* | Le type de demande (`GET` = « donne-moi ») |
| **État** / *Status* | Le code de réponse du serveur (`200` = tout va bien) |
| **Type** | La nature du fichier (document HTML, feuille de style CSS…) |
| **Temps** / *Time* | Le temps mis pour recevoir la réponse |

Puis :
- Combien de requêtes ont été nécessaires pour afficher **une seule** page ?
- Voyez-vous une requête vers `favicon.ico` ? Quel est son code d'état ? (Indice : le navigateur cherche tout seul la petite icône de l'onglet… que votre site n'a pas !)
- Ouvrez l'onglet **Éléments** (*Elements*) : vous pouvez modifier le texte de la page directement (double-clic). Rechargez la page : vos modifications ont disparu. Pourquoi ?
- Faites la même observation sur un « gros » site (un journal, un réseau social). Combien de requêtes pour une seule page ?

## 📝 Questions (à noter dans `CARNET.md`)

1. Que signifie HTTP ? Qui envoie la **requête** et qui envoie la **réponse** ?
2. Combien de requêtes votre page `/presentation` a-t-elle déclenchées ? Lesquelles ?
3. Que signifie le code `200` ? Et le code `404` de la favicon ?
4. Pourquoi les modifications faites dans l'onglet Éléments ne sont-elles pas visibles par les autres visiteurs ?

## 🧩 Défi

Dans l'onglet **En-têtes** de la requête `presentation`, trouvez l'en-tête `Content-Type` de la **réponse**. Que vaut-il ? Comparez avec celui de `style.css`. À quoi sert cette information, selon vous ?
