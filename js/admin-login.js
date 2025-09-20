// Admin Login JavaScript for Property Expert

// DOM Elements
const adminLoginForm = document.getElementById('admin-login-form');
const adminLoginError = document.getElementById('admin-login-error');

// Admin credentials (in a real application, this would be handled securely on the server)
const adminCredentials = [
    { email: "admin@propertyexpert.com", password: "admin123" },
    { email: "alokkushwaha78600@gmail.com", password: "admin123" },
    { email: "admin@gmail.com", password: "admin123" }
];

// Check authentication state
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already authenticated
    firebaseAuth.onAuthStateChanged(user => {
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
});

// Check if user is admin
function isAdminUser(user) {
    const adminEmails = [
        "admin@propertyexpert.com",
        "alokkushwaha78600@gmail.com",
        "admin@gmail.com"
    ];
    
    return adminEmails.includes(user.email);
}

// Admin login form submission
if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', e => {
        e.preventDefault();
        
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;
        
        // First, try to authenticate with Firebase
        firebaseAuth.signInWithEmailAndPassword(email, password)
            .then(userCredential => {
                const user = userCredential.user;
                
                // Check if user is admin
                if (isAdminUser(user)) {
                    // Clear any previous errors
                    adminLoginError.classList.add('d-none');
                    
                    // Redirect to admin dashboard
                    window.location.href = 'admin-dashboard.html';
                } else {
                    // Sign out the user and show error
                    firebaseAuth.signOut();
                    showLoginError('Access denied. Admin privileges required.');
                }
            })
            .catch(error => {
                console.error("Firebase authentication error:", error);
                // If Firebase auth fails, check against hardcoded credentials
                if (validateAdminCredentials(email, password)) {
                    // For demo purposes, we'll allow login with hardcoded credentials
                    // In a real application, all authentication should be handled by Firebase
                    adminLoginError.classList.add('d-none');
                    window.location.href = 'admin-dashboard.html';
                } else {
                    showLoginError('Invalid email or password.');
                }
            });
    });
}

// Validate admin credentials against hardcoded list
function validateAdminCredentials(email, password) {
    return adminCredentials.some(cred => cred.email === email && cred.password === password);
}

// Show login error
function showLoginError(message) {
    if (adminLoginError) {
        adminLoginError.textContent = message;
        adminLoginError.classList.remove('d-none');
    }
}