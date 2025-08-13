import * as admin from 'firebase-admin';
import { exportedUsers, exportedClasses, exportedCourses } from '../lib/seed';

// =====================================================================================
// ATTENTION : CONFIGURATION REQUISE
// =====================================================================================
// 1. Téléchargez votre clé de compte de service Firebase :
//    Allez dans "Paramètres du projet" > "Comptes de service" > "Générer une nouvelle clé privée".
//    Renommez le fichier JSON téléchargé en `serviceAccountKey.json` et placez-le à la racine de votre projet.
//
// 2. Assurez-vous que ce fichier `serviceAccountKey.json` est bien listé dans votre `.gitignore`
//    pour ne jamais le publier par erreur.
//
// 3. Installez le SDK Admin : `npm install firebase-admin`
//
// 4. Exécutez ce script depuis la racine de votre projet : `npx ts-node scripts/seed-firestore.ts`
//    (vous devrez peut-être installer ts-node : `npm install -D ts-node`)
// =====================================================================================

// @ts-ignore
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

const seedDatabase = async () => {
  console.log('Début du seeding...');

  // 1. Seeding des Utilisateurs (Auth & Firestore)
  console.log('-> Création des utilisateurs (Auth & Firestore)...');
  let createdCount = 0;
  for (const user of exportedUsers) {
    try {
      // Étape 1: Créer l'utilisateur dans Firebase Authentication
      await auth.createUser({
        uid: user.uid,
        email: user.email,
        password: 'password123', // Mot de passe par défaut pour tous les utilisateurs
        displayName: user.displayName,
        emailVerified: true,
      });

      // Étape 2: Créer le document dans Firestore
      const userDataForFirestore = { ...user };
      // @ts-ignore
      delete userDataForFirestore.uid; // L'UID est l'ID du document, pas un champ

      await db.collection('users').doc(user.uid).set(userDataForFirestore);
      createdCount++;
    } catch (error: any) {
      if (error.code === 'auth/uid-already-exists' || error.code === 'auth/email-already-exists') {
        console.warn(`   Utilisateur ${user.email} existe déjà, ignoré.`);
      } else {
        console.error(`   Erreur lors de la création de ${user.email}:`, error.message);
      }
    }
  }
  console.log(`   ${createdCount} utilisateurs créés.`);

  // 2. Seeding des Classes
  console.log('-> Création des classes...');
  const classPromises = exportedClasses.map(cls => 
    db.collection('classes').doc(cls.id).set(cls)
  );
  await Promise.all(classPromises);
  console.log(`   ${exportedClasses.length} classes créées.`);

  // 3. Seeding des Cours
  console.log('-> Création des cours...');
  const coursePromises = exportedCourses.map(course => 
    db.collection('courses').doc(course.id).set(course)
  );
  await Promise.all(coursePromises);
  console.log(`   ${exportedCourses.length} cours créés.`);

  console.log('\nSeed terminé avec succès !');
};

seedDatabase().catch(error => {
  console.error('\nUne erreur est survenue durant le seeding:');
  console.error(error);
});
