# Configuration Firebase pour Orbis

## Problème identifié

Les méthodes de création (`createInvoice` et `createQuote`) ne fonctionnent pas car les règles de sécurité Firestore bloquent probablement les opérations d'écriture.

## Solution

### 1. Installer Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Se connecter à Firebase

```bash
firebase login
```

### 3. Initialiser Firebase dans le projet

```bash
cd /Users/stephanezayat/Downloads/orbis
firebase init firestore
```

### 4. Déployer les règles de sécurité

Le fichier `firestore.rules` a été créé avec les règles appropriées. Déployez-le :

```bash
firebase deploy --only firestore:rules
```

### 5. Règles de sécurité expliquées

Les règles permettent :
- Lecture/écriture pour les utilisateurs authentifiés
- Chaque utilisateur ne peut accéder qu'à ses propres données
- Validation que `userId` correspond à l'utilisateur authentifié

### 6. Test temporaire (DÉVELOPPEMENT UNIQUEMENT)

Pour tester rapidement, vous pouvez temporairement utiliser des règles ouvertes :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // ATTENTION: Règles ouvertes!
    }
  }
}
```

**⚠️ IMPORTANT : Ne jamais utiliser ces règles ouvertes en production !**

### 7. Vérification

Après le déploiement des règles :
1. Ouvrez l'application
2. Connectez-vous avec Firebase Auth
3. Essayez de créer un devis ou une facture
4. Vérifiez la console du navigateur pour les logs de débogage

### 8. Logs de débogage ajoutés

J'ai ajouté des logs détaillés dans les modales pour diagnostiquer :
- Statut d'authentification de l'utilisateur
- Données envoyées à Firebase
- Erreurs détaillées avec codes d'erreur Firebase

### 9. Commandes utiles

```bash
# Voir les règles actuelles
firebase firestore:rules:get

# Tester les règles localement
firebase emulators:start --only firestore

# Voir les logs Firebase
firebase functions:log
```

## Diagnostic supplémentaire

Si le problème persiste après le déploiement des règles :

1. Vérifiez que l'utilisateur est bien authentifié
2. Vérifiez que `userId` est correctement défini
3. Consultez les logs Firebase dans la console Firebase
4. Vérifiez les quotas et limites de votre projet Firebase