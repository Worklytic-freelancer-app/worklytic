import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBK2fP1wjhbUsaHjjjblXN2Hd22LcU96qk",
  authDomain: "worklytic-2870d.firebaseapp.com",
  projectId: "worklytic-2870d",
  databaseURL: "https://worklytic-2870d-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "worklytic-2870d.firebasestorage.app",
  messagingSenderId: "415125572037",
  appId: "1:415125572037:web:b90b356319cbe4017063ac",
  measurementId: "G-HH3BNX9TXN"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);
const auth = getAuth(app);
const database = getDatabase(app);

export { app, firestore, auth, database }; 