import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';

const ADMIN_IMAGES_COLLECTION = 'adminImages';
const PROFILE_IMAGES_COLLECTION = 'profileImages';

// Add a new image URL to Firestore
export async function addAdminImage(url) {
  const docRef = await addDoc(collection(db, ADMIN_IMAGES_COLLECTION), { url, createdAt: new Date() });
  return docRef.id;
}

// Fetch all admin image URLs from Firestore
export async function fetchAdminImages() {
  const querySnapshot = await getDocs(collection(db, ADMIN_IMAGES_COLLECTION));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Delete an image by document ID
export async function deleteAdminImage(id) {
  await deleteDoc(doc(db, ADMIN_IMAGES_COLLECTION, id));
}

// Profile Images Functions
export async function addProfileImage(url, title, description) {
  const docRef = await addDoc(collection(db, PROFILE_IMAGES_COLLECTION), { 
    url, 
    title,
    description,
    createdAt: new Date() 
  });
  return docRef.id;
}

export async function fetchProfileImages() {
  const querySnapshot = await getDocs(collection(db, PROFILE_IMAGES_COLLECTION));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function deleteProfileImage(id) {
  await deleteDoc(doc(db, PROFILE_IMAGES_COLLECTION, id));
} 