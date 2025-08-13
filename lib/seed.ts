/* eslint-disable */

// =================================================================
// FICHIER DE SEED POUR ECOLECHAT
// =================================================================
// Pour utiliser ce fichier :
// 1. Configurez le SDK Admin de Firebase dans un script Node.js.
// 2. Importez les tableaux `exportedUsers`, `exportedClasses`, `exportedCourses`.
// 3. Itérez sur chaque tableau et utilisez `admin.auth().createUser()` pour les utilisateurs
//    puis `admin.firestore().collection('...').doc(id).set(data)` pour enregistrer les données
//    dans Firestore.
// =================================================================

import type { SchoolUser, Class, Course, StudentProfile, UserRole } from '@/types/user';

// --- CONFIGURATION ---
const TOTAL_STUDENTS = 50;
const TOTAL_TEACHERS = 10;
const TOTAL_ADMINS = 2;

// --- DONNÉES DE BASE ---
const firstNames = ['Léa', 'Hugo', 'Chloé', 'Louis', 'Emma', 'Gabriel', 'Alice', 'Jules', 'Inès', 'Adam', 'Louise', 'Raphaël', 'Manon', 'Arthur', 'Camille', 'Lucas', 'Sarah', 'Maël', 'Eva', 'Nathan'];
const lastNames = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'David', 'Bertrand', 'Roux', 'Vincent', 'Fournier'];

const subjects = {
  Informatique: ['Algorithmique', 'Bases de Données', 'Développement Web', 'Systèmes d\'Exploitation', 'Intelligence Artificielle'],
  Droit: ['Droit Constitutionnel', 'Droit des Obligations', 'Droit Pénal', 'Droit des Affaires', 'Procédure Civile'],
  Biologie: ['Biologie Cellulaire', 'Génétique Moléculaire', 'Biochimie', 'Écologie', 'Physiologie Végétale'],
  Marketing: ['Marketing Fondamental', 'Communication Digitale', 'Étude de Marché', 'Marketing Stratégique', 'Gestion de la Marque'],
};

// --- FONCTIONS UTILITAIRES ---
const getRandomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const createId = (prefix: string, index: number) => `${prefix}_${index.toString().padStart(3, '0')}`;

// =================================================================
// 1. GÉNÉRATION DES CLASSES
// =================================================================

const rawClasses: { name: string; grade: string; area: keyof typeof subjects }[] = [
  { name: 'Licence 1 - Informatique', grade: 'L1', area: 'Informatique' },
  { name: 'Licence 2 - Informatique', grade: 'L2', area: 'Informatique' },
  { name: 'Master 1 - Droit des Affaires', grade: 'M1', area: 'Droit' },
  { name: 'Licence 3 - Biologie', grade: 'L3', area: 'Biologie' },
  { name: 'Master 2 - Marketing Digital', grade: 'M2', area: 'Marketing' },
];

export const exportedClasses: Class[] = rawClasses.map((c, i) => ({
  id: createId('class', i),
  name: c.name,
  grade: c.grade,
  createdAt: new Date(),
}));

// =================================================================
// 2. GÉNÉRATION DES UTILISATEURS
// =================================================================

export const exportedUsers: SchoolUser[] = [];

// Générer les Admins
for (let i = 0; i < TOTAL_ADMINS; i++) {
  const id = createId('admin', i);
  exportedUsers.push({
    uid: id,
    email: `admin${i + 1}@ecole.com`,
    displayName: `Administrateur ${i + 1}`,
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
    lastSeen: new Date(),
  });
}

// Générer les Professeurs
const teacherTemp: SchoolUser[] = [];
for (let i = 0; i < TOTAL_TEACHERS; i++) {
  const firstName = getRandomItem(firstNames);
  const lastName = getRandomItem(lastNames);
  const id = createId('teacher', i);
  teacherTemp.push({
    uid: id,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@ecole.com`,
    displayName: `Prof. ${firstName} ${lastName}`,
    role: 'teacher',
    isActive: true,
    createdAt: new Date(),
    lastSeen: new Date(),
  });
}
exportedUsers.push(...teacherTemp);

// Générer les Étudiants
for (let i = 0; i < TOTAL_STUDENTS; i++) {
  const firstName = getRandomItem(firstNames);
  const lastName = getRandomItem(lastNames);
  const assignedClass = getRandomItem(exportedClasses);
  const id = createId('student', i);

  const studentProfile: StudentProfile = {
    classId: assignedClass.id,
    className: assignedClass.name,
    grade: assignedClass.grade,
  };

  exportedUsers.push({
    uid: id,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@etu.ecole.com`,
    displayName: `${firstName} ${lastName}`,
    role: 'student',
    isActive: true,
    createdAt: new Date(),
    lastSeen: new Date(),
    studentProfile,
  });
}

// =================================================================
// 3. GÉNÉRATION DES COURS
// =================================================================

export const exportedCourses: Course[] = [];

const teachers = exportedUsers.filter(u => u.role === 'teacher');

let courseIndex = 0;
Object.entries(subjects).forEach(([area, courseNames]) => {
  const areaClasses = exportedClasses.filter(c => c.name.includes(area));
  if (areaClasses.length === 0) return;

  courseNames.forEach(courseName => {
    const teacher = getRandomItem(teachers);
    // Assigner le cours à une ou plusieurs classes du même domaine
    const assignedClassCount = Math.random() > 0.7 ? 2 : 1;
    const assignedClasses = [...areaClasses].sort(() => 0.5 - Math.random()).slice(0, assignedClassCount);

    exportedCourses.push({
      id: createId('course', courseIndex++),
      name: courseName,
      teacherId: teacher.uid,
      classIds: assignedClasses.map(c => c.id),
      createdAt: new Date(),
    });
  });
});
