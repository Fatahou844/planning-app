import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAYZW4TJ2JXQq3LuL_wIca9-QOw1rFoJFo",
  authDomain: "saas-garage.firebaseapp.com",
  projectId: "saas-garage",
  storageBucket: "saas-garage.appspot.com",
  messagingSenderId: "778768283944",
  appId: "1:778768283944:web:d0a844ef41f41f7122b81d",
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);

// Initialiser Firestore (base de données NoSQL)
const db = getFirestore(app);

// Initialiser l'authentification Firebase
const auth = getAuth(app);

export { auth, db };
