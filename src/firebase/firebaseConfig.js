// src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Your actual Firebase config
const firebaseConfig = {
apiKey: "AIzaSyD98ZCaLUReH7t4qBM6XBcPiUPzb45xrmI",
authDomain: "ecoscan-7fa2e.firebaseapp.com",
projectId: "ecoscan-7fa2e",
storageBucket: "ecoscan-7fa2e.appspot.com", // ✅ fixed typo here
messagingSenderId: "983867347492",
appId: "1:983867347492:web:048e9e25ce203acae17eb1",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Export for use in app
export { auth, db };