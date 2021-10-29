/** @format */

import firebase from 'firebase';

const firebaseApp = firebase.initializeApp({
  apiKey: 'AIzaSyBZO7D8P9ZoN6SIG9vaLCPe3vWhHUzJIUo',
  authDomain: 'seolsns.firebaseapp.com',
  projectId: 'seolsns',
  storageBucket: 'seolsns.appspot.com',
  messagingSenderId: '835287056658',
  appId: '1:835287056658:web:38fd64b91b746a36fd33cb',
  measurementId: 'G-KHSQRNGCWX',
});

const db = firebaseApp.firestore();
const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
const storage = firebase.storage();

export { auth, provider, storage };
export default db;
