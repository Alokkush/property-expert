// Firebase configuration
console.log('Initializing Firebase...');

// Check if firebase is available
if (typeof firebase === 'undefined') {
    console.error('Firebase SDK not loaded. Please check your script includes.');
} else {
    // Your web app's Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyB-HQLhJr2eT7HYz1K_ezztWhjwxi30Pig",
      authDomain: "property-expert-10.firebaseapp.com",
      projectId: "property-expert-10",
      storageBucket: "property-expert-10.firebasestorage.app",
      messagingSenderId: "302472088106",
      appId: "1:302472088106:web:8d15da967a7ee261211153",
      measurementId: "G-FYCCFFX9G7"
    };

    // Initialize Firebase
    console.log('Firebase config:', firebaseConfig);

    // Initialize Firebase using compat mode
    firebase.initializeApp(firebaseConfig);
    const auth = firebase.auth();
    const db = firebase.firestore();

    // Export for use in other files
    window.firebaseAuth = auth;
    window.firebaseDb = db;
    // Export Firebase auth functions
    window.signInWithEmailAndPassword = function(email, password) {
        return firebase.auth().signInWithEmailAndPassword(email, password);
    };
    window.createUserWithEmailAndPassword = function(email, password) {
        return firebase.auth().createUserWithEmailAndPassword(email, password);
    };
    window.signOut = function() {
        return firebase.auth().signOut();
    };
    window.onAuthStateChanged = function(callback) {
        return firebase.auth().onAuthStateChanged(callback);
    };

    console.log('Firebase initialized successfully');
    console.log('Exported firebaseAuth:', window.firebaseAuth);
    console.log('Exported firebaseDb:', window.firebaseDb);
}