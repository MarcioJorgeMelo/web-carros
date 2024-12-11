import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCk5OpARYjQX0b1SBWQCW43Gg84xUItiPo",
  authDomain: "web-carros-4ba72.firebaseapp.com",
  projectId: "web-carros-4ba72",
  storageBucket: "web-carros-4ba72.firebasestorage.app",
  messagingSenderId: "882870688854",
  appId: "1:882870688854:web:05ee550cf1647185c2eff7",
  measurementId: "G-S2LD48PX8D"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { db, auth, storage };