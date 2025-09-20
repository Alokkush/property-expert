// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDIUhahfQJlG2OQKv4Kx92H_YzeDayRiyw",
    authDomain: "property-expert-11.firebaseapp.com",
    projectId: "property-expert-11",
    storageBucket: "property-expert-11.firebasestorage.app",
    messagingSenderId: "1037467004096",
    appId: "1:1037467004096:web:8989558248312edd575125"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Export for use in other files
window.firebaseAuth = auth;
window.firebaseDb = db;