# Rapport d'Audit de Modélisation de Données et Permissions (v2)

## Introduction

Ce document présente une analyse des incohérences de modélisation de données, des failles de sécurité et des problèmes de performance identifiés dans le code source du projet EcoleChat. 

**Mise à jour :** L'objectif de cette deuxième version est de se concentrer en priorité sur la **logique du frontend**. Nous allons identifier où l'application demande ou affiche plus de données que ce que le rôle de l'utilisateur ne l'exige, afin de corriger les fuites d'informations potentielles et les comportements inattendus de l'interface, avant de renforcer les règles de sécurité côté serveur.

---

## 1. Analyse Prioritaire : Fuites de Données et Logique Frontend

Cette section identifie les endroits où le frontend récupère ou pourrait afficher des données auxquelles l'utilisateur connecté ne devrait pas avoir accès.

### Failles Identifiées

1.  **Fuite de la Liste Complète des Utilisateurs (Critique)**
    *   **Composant concerné** : `components/dashboard/contacts-tab.tsx`
    *   **Problème** : Ce composant, accessible à tous les utilisateurs, appelle la fonction `getAllUsers()` qui, comme son nom l'indique, récupère **tous les utilisateurs** de la base de données. Les onglets "Étudiants", "Professeurs" et "Admins" font de même avec `getUsersByRole()`.
    *   **Impact** : Un simple étudiant peut, en consultant l'onglet "Contacts", obtenir la liste complète de tous les élèves, professeurs et administrateurs de l'établissement, y compris leurs noms complets et adresses e-mail. Il s'agit d'une **fuite de données personnelles majeure**.
    *   **Solution** : Remplacer ces appels par des fonctions plus restrictives. Par exemple :
        *   Un **étudiant** ne devrait pouvoir lister que les élèves de sa propre classe et ses professeurs.
        *   Un **professeur** pourrait lister ses étudiants, les autres professeurs et le personnel administratif.
        *   La fonction `searchUsers` doit également être modifiée pour respecter ces restrictions.

2.  **Recherche Globale dans les Messages (Critique)**
    *   **Composant concerné** : `components/search/message-search.tsx`
    *   **Problème** : La fonction de recherche de messages effectue une requête très large sur la collection `messages` (`orderBy("timestamp", "desc")`) et ne filtre les messages pertinents pour l'utilisateur que **côté client**.
    *   **Impact** : La requête initiale à Firestore récupère des messages de conversations auxquelles l'utilisateur n'appartient pas. Même s'ils sont filtrés avant l'affichage, les données transitent inutilement et c'est une mauvaise pratique de sécurité qui pourrait exposer des données sensibles si le filtre côté client venait à faillir.
    *   **Solution** : La requête Firestore doit être fondamentalement modifiée pour ne rechercher que dans les conversations où l'utilisateur est un participant. Cela peut être fait en ajoutant une clause `where("participants", "array-contains", userId)` à la requête.

3.  **Affichage Potentiel de Toutes les Classes**
    *   **Composant concerné** : `components/dashboard/classes-tab.tsx`
    *   **Problème** : Ce composant contient une logique pour afficher les classes en fonction du rôle. Pour un étudiant, il ne récupère que sa classe, ce qui est correct (comme vous l'avez mentionné). Cependant, il est crucial de s'assurer que cette logique est sans faille et qu'un étudiant ne puisse jamais se retrouver dans le cas où `getClasses()` (qui récupère tout) est appelé.
    *   **Impact** : Faible si la logique actuelle est correcte, mais c'est un point de vigilance.
    *   **Solution** : Confirmer que la logique `if (currentUser.role === ...)` couvre tous les cas et qu'il n'y a pas de chemin où un utilisateur non-admin pourrait déclencher `getClasses()`.

---

## 2. Analyse de la Modélisation de Données

_(Les points de l'audit précédent restent valides mais sont de priorité secondaire par rapport à la correction des fuites de données.)_

1.  **Champs Utilisateur Manquants** : Les champs `department`, `position`, `subject` dans `UserCreation.tsx` ne sont pas dans le type `SchoolUser`.
2.  **Expiration des Invitations** : Le champ `expiresAt` est vérifié mais jamais défini lors de la création d'une invitation.
3.  **Type de Message "Annonce"** : Le type `announcement` existe mais n'est jamais utilisé.

---

## 3. Analyse des Permissions et de la Sécurité (Serveur - *en attente*)

Pour les besoins de la démonstration, nous ignorons temporairement les règles côté serveur. Cependant, les points suivants devront être traités impérativement avant toute mise en production.

*   **Permissions d'écriture des Admins sur les Utilisateurs.**
*   **Permission de création de Classes (Admin vs Professeur).**
*   **Validation du `senderId` à la création des messages.**
*   **Faille de sécurité dans les règles de conversation** (utilisation de `in` sur un tableau).
*   **Manque de cohérence des données** (ex: un élève retiré d'une classe garde l'accès aux conversations).

---

## 4. Recommandations et Plan d'Action (Mise à Jour)

**Priorité IMMÉDIATE (Logique Frontend & Fuites de Données)**:

1.  [ ] **Restreindre la visibilité des contacts** dans `ContactsTab.tsx`. Ne plus utiliser `getAllUsers()`. Créer et utiliser des fonctions plus spécifiques comme `getContactsForStudent(user)` ou `getContactsForTeacher(user)`.
2.  [ ] **Sécuriser la recherche d'utilisateurs**. Modifier `searchUsers()` pour qu'elle opère sur un périmètre restreint en fonction du rôle de l'utilisateur qui effectue la recherche.
3.  [ ] **Sécuriser la recherche de messages**. Modifier la requête dans `MessageSearch.tsx` pour inclure une clause `where` qui ne retourne que les messages des conversations de l'utilisateur.

**Priorité Secondaire (Bugs et Incohérences)**:

4.  [ ] **Ajouter les champs manquants** (`department`, etc.) aux types `SchoolUser` et `Invitation`.
5.  [ ] **Ajouter la date d'expiration** lors de la création d'invitations.

**Priorité Tertiaire (Avant Production - Sécurité Serveur)**:

6.  [ ] **Réactiver et corriger l'intégralité des règles de sécurité Firestore** en se basant sur les points soulevés dans ce rapport.
