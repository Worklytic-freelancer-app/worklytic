import { auth } from '../config/firebase';
import { signInAnonymously } from 'firebase/auth';

export const initializeFirebaseAuth = async () => {
  try {
    // Gunakan anonymous auth untuk sementara
    const userCredential = await signInAnonymously(auth);
    console.log('Firebase Auth initialized:', userCredential.user.uid);
    return userCredential.user;
  } catch (error) {
    console.error('Error initializing Firebase Auth:', error);
    throw error;
  }
}; 