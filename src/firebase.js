// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
//import { getAnalytics } from "firebase/analytics";
import { getFirestore } from '@firebase/firestore';
const firebaseConfig = {
  apiKey: 'AIzaSyB6djWhodEqw8crZZt85Ig1I2caq2bVBtA',
  authDomain: 'mad9135-hybrid-1-d294b.firebaseapp.com',
  projectId: 'mad9135-hybrid-1-d294b',
  storageBucket: 'mad9135-hybrid-1-d294b.appspot.com',
  messagingSenderId: '114567409114',
  appId: '1:114567409114:web:8a3f98390259b728e2a4e3',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);
