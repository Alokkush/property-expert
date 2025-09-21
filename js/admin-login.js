// Admin Login JavaScript for Property Expert
// Import statements are handled by the module system in firebase-config.js

// DOM Elements
const adminLoginForm = document.getElementById('admin-login-form');
const adminLoginError = document.getElementById('admin-login-error');

// List of admin emails - Using ADMIN_EMAILS from auth.js

// Check authentication state
document.addEventListener('DOMContentLoaded', () => {
    console.log('Admin login page loaded');
    
    // Check if user is already authenticated
    console.log('Checking Firebase Auth availability for admin login...');
    console.log('window.firebaseAuth:', window.firebaseAuth);
    
    if (window.firebaseAuth) {
        console.log('Firebase Auth is available for admin login');
        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                console.log('User is authenticated:', user.email);
                // Check if user is admin
                if (isAdminUser(user)) {
                    console.log('Admin user detected, redirecting to dashboard');
                    // Redirect to admin dashboard
                    window.location.href = 'admin-dashboard.html';
                } else {
                    console.log('Non-admin user detected');
                    // Show error for non-admin users
                    showLoginError('Access denied. Admin privileges required.');
                }
            } else {
                console.log('No user is currently authenticated');
            }
        });
    } else {
        console.error('Firebase Auth not initialized');
        showLoginError('Authentication system not initialized. Please refresh the page.');
    }
});

// Check if user is admin
function isAdminUser(user) {
    console.log('Checking if user is admin:', user.email);
    // Use ADMIN_EMAILS from auth.js
    const isAdmin = window.ADMIN_EMAILS && window.ADMIN_EMAILS.includes(user.email);
    console.log('Is admin:', isAdmin);
    return isAdmin;
}

// Admin login form submission
if (adminLoginForm) {
    console.log('Admin login form found, adding event listener');
    adminLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Admin login form submitted');
        
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;
        
        console.log('Login attempt with email:', email);
        
        // Validate email format
        if (!isValidEmail(email)) {
            showLoginError('Please enter a valid email address.');
            return;
        }
        
        // First, try to authenticate with Firebase
        if (window.firebaseAuth) {
            console.log('Firebase Auth available for admin login');
            try {
                console.log('Attempting Firebase authentication');
                const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
                const user = userCredential.user;
                console.log('Firebase authentication successful for user:', user.email);
                
                // Check if user is admin
                if (isAdminUser(user)) {
                    console.log('User is admin, redirecting to dashboard');
                    // Clear any previous errors
                    if (adminLoginError) {
                        adminLoginError.classList.add('d-none');
                    }
                    
                    // Redirect to admin dashboard
                    window.location.href = 'admin-dashboard.html';
                } else {
                    console.log('User is not admin, signing out');
                    // Sign out the user and show error
                    await firebase.auth().signOut();
                    showLoginError('Access denied. Admin privileges required.');
                }
            } catch (error) {
                console.error("Firebase authentication error:", error);
                console.error('Error details:', {
                    name: error.name,
                    message: error.message,
                    code: error.code,
                    stack: error.stack
                });
                
                // Display Firebase error message to user
                let errorMessage = 'Login failed. Please check your credentials and try again.';
                if (error.code === 'auth/user-not-found') {
                    errorMessage = 'No user found with this email address.';
                } else if (error.code === 'auth/wrong-password') {
                    errorMessage = 'Incorrect password. Please try again.';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Invalid email address format.';
                } else if (error.code === 'auth/user-disabled') {
                    errorMessage = 'This account has been disabled.';
                } else if (error.code === 'auth/too-many-requests') {
                    errorMessage = 'Too many failed login attempts. Please try again later.';
                }
                
                showLoginError(errorMessage);
            }
        } else {
            console.error('Firebase Auth not initialized');
            showLoginError('Authentication system not initialized. Please refresh the page.');
        }
    });
} else {
    console.log('Admin login form not found');
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show login error
function showLoginError(message) {
    console.log('Showing login error:', message);
    if (adminLoginError) {
        adminLoginError.textContent = message;
        adminLoginError.classList.remove('d-none');
    }
}