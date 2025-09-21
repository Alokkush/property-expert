// Authentication Handling for Property Expert

// DOM Elements
const authButtons = document.getElementById('auth-buttons');
const userInfo = document.getElementById('user-info');
const userEmail = document.getElementById('user-email');
const logoutBtn = document.getElementById('logout-btn');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginError = document.getElementById('login-error');
const signupError = document.getElementById('signup-error');

// List of admin emails
const ADMIN_EMAILS = [
    "admin@gmail.com"
];

// Check authentication state after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, checking authentication state');
    
    // Small delay to ensure DOM elements are fully loaded
    setTimeout(() => {
        // Check if firebaseAuth is available
        if (window.firebaseAuth) {
            window.firebaseAuth.onAuthStateChanged(user => {
                if (user) {
                    console.log('User is authenticated:', user.email);
                    // User is signed in
                    showUserUI(user);
                    // Check if user is admin
                    checkAdminStatus(user);
                } else {
                    console.log('User is not authenticated');
                    // User is signed out
                    showAuthUI();
                    // Hide admin dashboard link for non-authenticated users
                    hideAdminDashboard();
                }
            });
        } else {
            console.error('Firebase Auth not initialized');
            // Show auth UI if Firebase is not initialized
            showAuthUI();
            // Hide admin dashboard link if Firebase is not initialized
            hideAdminDashboard();
        }
    }, 100);
});

// Show authenticated user UI
function showUserUI(user) {
    console.log('Showing user UI for:', user.email);
    if (authButtons) authButtons.classList.add('d-none');
    if (userInfo) userInfo.classList.remove('d-none');
    if (userEmail) userEmail.textContent = user.email;
    // Check if user is admin when showing user UI
    // Small delay to ensure DOM elements are fully loaded
    setTimeout(() => {
        checkAdminStatus(user);
    }, 100);
}

// Show authentication buttons UI
function showAuthUI() {
    console.log('Showing auth UI');
    if (authButtons) authButtons.classList.remove('d-none');
    if (userInfo) userInfo.classList.add('d-none');
}

// Show admin dashboard link
function showAdminDashboard() {
    console.log('Showing admin dashboard link');
    // Try to find the element by ID first
    const adminDashboardNav = document.getElementById('admin-dashboard-nav');
    if (adminDashboardNav) {
        adminDashboardNav.style.display = 'block';
    } else {
        // If not found by ID, try to find it by class or other means
        console.log('Admin dashboard nav element not found by ID, trying again after delay');
        // Try again after a delay
        setTimeout(() => {
            const adminDashboardNav = document.getElementById('admin-dashboard-nav');
            if (adminDashboardNav) {
                adminDashboardNav.style.display = 'block';
            } else {
                console.log('Admin dashboard nav element still not found');
            }
        }, 500);
    }
}

// Hide admin dashboard link
function hideAdminDashboard() {
    console.log('Hiding admin dashboard link');
    // Try to find the element by ID first
    const adminDashboardNav = document.getElementById('admin-dashboard-nav');
    if (adminDashboardNav) {
        adminDashboardNav.style.display = 'none';
    } else {
        // If not found by ID, try to find it by class or other means
        console.log('Admin dashboard nav element not found by ID');
    }
}

// Check if user is admin
function checkAdminStatus(user) {
    console.log('Checking admin status for user:', user.email);
    
    // Check if user's email is in the admin list
    if (ADMIN_EMAILS.includes(user.email)) {
        console.log('User is admin, showing admin dashboard link');
        // Show admin dashboard link for admin users
        showAdminDashboard();
    } else {
        console.log('User is not admin, hiding admin dashboard link');
        // Hide admin dashboard link for non-admin users
        hideAdminDashboard();
    }
}

// Login form submission
if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        if (window.firebaseAuth) {
            window.firebaseAuth.signInWithEmailAndPassword(email, password)
                .then(userCredential => {
                    // Clear any previous errors
                    loginError.classList.add('d-none');
                    
                    // Close modal
                    const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                    if (loginModal) {
                        loginModal.hide();
                    }
                    
                    // Reset form
                    loginForm.reset();
                    
                    // Show success message
                    console.log('User logged in successfully');
                })
                .catch(error => {
                    loginError.textContent = error.message;
                    loginError.classList.remove('d-none');
                });
        } else {
            loginError.textContent = 'Authentication system not initialized. Please refresh the page.';
            loginError.classList.remove('d-none');
        }
    });
}

// Signup form submission
if (signupForm) {
    signupForm.addEventListener('submit', e => {
        e.preventDefault();
        
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        const signupError = document.getElementById('signup-error');
        
        // Check if passwords match
        if (password !== confirmPassword) {
            if (signupError) {
                signupError.textContent = 'Passwords do not match';
                signupError.classList.remove('d-none');
            }
            return;
        }
        
        if (window.firebaseAuth) {
            window.firebaseAuth.createUserWithEmailAndPassword(email, password)
                .then(userCredential => {
                    // Clear any previous errors
                    if (signupError) {
                        signupError.classList.add('d-none');
                    }
                    
                    // Close modal
                    const signupModal = bootstrap.Modal.getInstance(document.getElementById('signupModal'));
                    if (signupModal) {
                        signupModal.hide();
                    }
                    
                    // Reset form
                    signupForm.reset();
                    
                    // Show success message
                    console.log('User signed up successfully');
                })
                .catch(error => {
                    if (signupError) {
                        signupError.textContent = error.message;
                        signupError.classList.remove('d-none');
                    }
                });
        } else {
            if (signupError) {
                signupError.textContent = 'Authentication system not initialized. Please refresh the page.';
                signupError.classList.remove('d-none');
            }
        }
    });
}

// Logout functionality
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        if (window.firebaseAuth) {
            window.firebaseAuth.signOut()
                .then(() => {
                    console.log('User logged out successfully');
                    // Hide admin dashboard link on logout
                    hideAdminDashboard();
                    // Redirect to index.html after logout
                    window.location.href = 'index.html';
                })
                .catch(error => {
                    console.error('Error logging out:', error);
                });
        } else {
            console.error('Firebase Auth not initialized');
        }
    });
}

// Check if user is authenticated (for protected pages)
function checkAuth() {
    return new Promise((resolve, reject) => {
        if (window.firebaseAuth) {
            window.firebaseAuth.onAuthStateChanged(user => {
                if (user) {
                    resolve(user);
                } else {
                    reject(new Error('User not authenticated'));
                }
            });
        } else {
            reject(new Error('Firebase Auth not initialized'));
        }
    });
}

// Export admin check function for use in other files
window.isAdminUser = function(user) {
    return ADMIN_EMAILS.includes(user.email);
};