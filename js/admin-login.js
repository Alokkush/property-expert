// Admin Login JavaScript for Property Expert

// DOM Elements
const adminLoginForm = document.getElementById('admin-login-form');
const adminLoginError = document.getElementById('admin-login-error');

// List of admin emails - Updated to use admin@gmail.com
const ADMIN_EMAILS = [
    "admin@gmail.com"
];

// Check authentication state
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already authenticated
    if (window.firebaseAuth) {
        window.firebaseAuth.onAuthStateChanged(user => {
            if (user) {
                // Check if user is admin
                if (isAdminUser(user)) {
                    // Redirect to admin dashboard
                    window.location.href = 'admin-dashboard.html';
                } else {
                    // Show error for non-admin users
                    showLoginError('Access denied. Admin privileges required.');
                }
            }
        });
    }
});

// Check if user is admin
function isAdminUser(user) {
    return ADMIN_EMAILS.includes(user.email);
}

// Admin login form submission
if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', e => {
        e.preventDefault();
        
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;
        
        // Validate email format
        if (!isValidEmail(email)) {
            showLoginError('Please enter a valid email address.');
            return;
        }
        
        // First, try to authenticate with Firebase
        if (window.firebaseAuth) {
            window.firebaseAuth.signInWithEmailAndPassword(email, password)
                .then(userCredential => {
                    const user = userCredential.user;
                    
                    // Check if user is admin
                    if (isAdminUser(user)) {
                        // Clear any previous errors
                        if (adminLoginError) {
                            adminLoginError.classList.add('d-none');
                        }
                        
                        // Redirect to admin dashboard
                        window.location.href = 'admin-dashboard.html';
                    } else {
                        // Sign out the user and show error
                        window.firebaseAuth.signOut();
                        showLoginError('Access denied. Admin privileges required.');
                    }
                })
                .catch(error => {
                    console.error("Firebase authentication error:", error);
                    // Display Firebase error message to user
                    showLoginError('Login failed: ' + error.message);
                });
        } else {
            showLoginError('Authentication system not initialized. Please refresh the page.');
        }
    });
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show login error
function showLoginError(message) {
    if (adminLoginError) {
        adminLoginError.textContent = message;
        adminLoginError.classList.remove('d-none');
    }
}