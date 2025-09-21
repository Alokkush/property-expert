// Authentication Handling for Property Expert
// Import statements are handled by the module system in firebase-config.js

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

// Export ADMIN_EMAILS for use in other files
window.ADMIN_EMAILS = ADMIN_EMAILS;

// Check authentication state after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, checking authentication state');
    
    // Function to initialize auth components
    function initializeAuth() {
        // Check if firebaseAuth is available
        console.log('Checking Firebase Auth availability...');
        console.log('window.firebaseAuth:', window.firebaseAuth);
        
        if (window.firebaseAuth) {
            console.log('Firebase Auth is available');
            try {
                firebase.auth().onAuthStateChanged(user => {
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
            } catch (error) {
                console.error('Error in onAuthStateChanged:', error);
                // Show auth UI if there's an error
                showAuthUI();
                // Hide admin dashboard link if there's an error
                hideAdminDashboard();
            }
        } else {
            console.error('Firebase Auth not initialized');
            // Show auth UI if Firebase is not initialized
            showAuthUI();
            // Hide admin dashboard link if Firebase is not initialized
            hideAdminDashboard();
        }
    }
    
    // Try to initialize immediately
    initializeAuth();
    
    // Also try after a delay to ensure DOM elements are fully loaded
    setTimeout(initializeAuth, 500);
});

// Show authenticated user UI
function showUserUI(user) {
    console.log('Showing user UI for:', user.email);
    if (authButtons) {
        console.log('Hiding auth buttons');
        authButtons.classList.add('d-none');
    }
    if (userInfo) {
        console.log('Showing user info');
        userInfo.classList.remove('d-none');
    }
    if (userEmail) {
        console.log('Setting user email');
        userEmail.textContent = user.email;
    }
    // Check if user is admin when showing user UI
    // Small delay to ensure DOM elements are fully loaded
    setTimeout(() => {
        checkAdminStatus(user);
    }, 100);
}

// Show authentication buttons UI
function showAuthUI() {
    console.log('Showing auth UI');
    if (authButtons) {
        console.log('Showing auth buttons');
        authButtons.classList.remove('d-none');
    }
    if (userInfo) {
        console.log('Hiding user info');
        userInfo.classList.add('d-none');
    }
}

// Show admin dashboard link
function showAdminDashboard() {
    console.log('Showing admin dashboard link');
    
    // Function to show the admin dashboard nav element
    function showElement() {
        // Try to find the element by ID first
        const adminDashboardNav = document.getElementById('admin-dashboard-nav');
        if (adminDashboardNav) {
            console.log('Found admin dashboard nav element, showing it');
            adminDashboardNav.style.display = 'block';
            return true;
        }
        
        // If not found by ID, try to find it by query selector
        const adminDashboardNavByClass = document.querySelector('#admin-dashboard-nav');
        if (adminDashboardNavByClass) {
            console.log('Found admin dashboard nav element by query selector, showing it');
            adminDashboardNavByClass.style.display = 'block';
            return true;
        }
        
        console.log('Admin dashboard nav element not found');
        return false;
    }
    
    // Try immediately
    if (!showElement()) {
        // Try again after a delay
        setTimeout(showElement, 100);
        // Try again after another delay
        setTimeout(showElement, 500);
        // Try again after a longer delay
        setTimeout(showElement, 1000);
    }
}

// Hide admin dashboard link
function hideAdminDashboard() {
    console.log('Hiding admin dashboard link');
    
    // Function to hide the admin dashboard nav element
    function hideElement() {
        // Try to find the element by ID first
        const adminDashboardNav = document.getElementById('admin-dashboard-nav');
        if (adminDashboardNav) {
            console.log('Found admin dashboard nav element, hiding it');
            adminDashboardNav.style.display = 'none';
            return true;
        }
        
        // If not found by ID, try to find it by query selector
        const adminDashboardNavByClass = document.querySelector('#admin-dashboard-nav');
        if (adminDashboardNavByClass) {
            console.log('Found admin dashboard nav element by query selector, hiding it');
            adminDashboardNavByClass.style.display = 'none';
            return true;
        }
        
        console.log('Admin dashboard nav element not found');
        return false;
    }
    
    // Try immediately
    if (!hideElement()) {
        // Try again after a delay
        setTimeout(hideElement, 100);
        // Try again after another delay
        setTimeout(hideElement, 500);
        // Try again after a longer delay
        setTimeout(hideElement, 1000);
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
function attachLoginFormListener() {
    // Function to attach login form listener
    function attachListener() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            console.log('Login form found, adding event listener');
            // Check if listener is already attached
            if (loginForm.dataset.listenerAttached === 'true') {
                console.log('Login form listener already attached');
                return true;
            }
            
            loginForm.addEventListener('submit', e => {
                e.preventDefault();
                console.log('Login form submitted');
                
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                
                console.log('Login attempt with email:', email);
                
                if (window.firebaseAuth) {
                    console.log('Firebase Auth available for login');
                    // Use the Firebase signInWithEmailAndPassword syntax with global firebase object
                    firebase.auth().signInWithEmailAndPassword(email, password)
                        .then(userCredential => {
                            console.log('Login successful');
                            // Clear any previous errors
                            const loginError = document.getElementById('login-error');
                            if (loginError) {
                                loginError.classList.add('d-none');
                            }
                            
                            // Update user's last login timestamp
                            return updateUserLastLogin(userCredential.user);
                        })
                        .then(() => {
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
                            console.error('Login error:', error);
                            console.error('Error details:', {
                                name: error.name,
                                message: error.message,
                                code: error.code,
                                stack: error.stack
                            });
                            
                            // Provide more specific error messages
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
                            } else if (error.code === 'firestore/permission-denied') {
                                errorMessage = 'Permission denied when updating user document.';
                            } else if (error.code === 'firestore/unavailable') {
                                errorMessage = 'Database unavailable. Please try again later.';
                            }
                            
                            const loginError = document.getElementById('login-error');
                            if (loginError) {
                                loginError.textContent = errorMessage;
                                loginError.classList.remove('d-none');
                            }
                        });
                } else {
                    console.error('Firebase Auth not initialized');
                    const loginError = document.getElementById('login-error');
                    if (loginError) {
                        loginError.textContent = 'Authentication system not initialized. Please refresh the page.';
                        loginError.classList.remove('d-none');
                    }
                }
            });
            
            // Mark listener as attached
            loginForm.dataset.listenerAttached = 'true';
            return true;
        }
        
        console.log('Login form not found');
        return false;
    }
    
    // Try immediately
    if (!attachListener()) {
        // Try again after a delay
        setTimeout(attachListener, 100);
        // Try again after another delay
        setTimeout(attachListener, 500);
        // Try again after a longer delay
        setTimeout(attachListener, 1000);
    }
}

// Function to update user's last login timestamp
async function updateUserLastLogin(user) {
    try {
        console.log('Updating last login for user:', user.uid);
        
        // Check if firebaseDb is available
        if (!window.firebaseDb) {
            throw new Error('Firebase DB not initialized');
        }
        
        // Update user document with last login timestamp
        await firebase.firestore().collection('users').doc(user.uid).update({
            lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('User last login updated successfully for:', user.uid);
    } catch (error) {
        console.error('Error updating user last login:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        // Don't throw error here as this is not critical for login
    }
}

// Try to attach login form listener immediately
attachLoginFormListener();

// Also try after a delay to ensure DOM elements are fully loaded
setTimeout(attachLoginFormListener, 500);

// Signup form submission
function attachSignupFormListener() {
    // Function to attach signup form listener
    function attachListener() {
        const signupForm = document.getElementById('signup-form');
        if (signupForm) {
            console.log('Signup form found, adding event listener');
            // Check if listener is already attached
            if (signupForm.dataset.listenerAttached === 'true') {
                console.log('Signup form listener already attached');
                return true;
            }
            
            signupForm.addEventListener('submit', e => {
                e.preventDefault();
                console.log('Signup form submitted');
                
                const email = document.getElementById('signup-email').value;
                const password = document.getElementById('signup-password').value;
                const confirmPassword = document.getElementById('signup-confirm-password').value;
                
                console.log('Signup attempt with email:', email);
                
                // Check if passwords match
                if (password !== confirmPassword) {
                    console.log('Passwords do not match');
                    const signupError = document.getElementById('signup-error');
                    if (signupError) {
                        signupError.textContent = 'Passwords do not match';
                        signupError.classList.remove('d-none');
                    }
                    return;
                }
                
                // Check password length
                if (password.length < 6) {
                    console.log('Password too short');
                    const signupError = document.getElementById('signup-error');
                    if (signupError) {
                        signupError.textContent = 'Password must be at least 6 characters long';
                        signupError.classList.remove('d-none');
                    }
                    return;
                }
                
                if (window.firebaseAuth) {
                    console.log('Firebase Auth available for signup');
                    // Use the Firebase createUserWithEmailAndPassword syntax with global firebase object
                    firebase.auth().createUserWithEmailAndPassword(email, password)
                        .then(userCredential => {
                            console.log('Signup successful');
                            // Clear any previous errors
                            const signupError = document.getElementById('signup-error');
                            if (signupError) {
                                signupError.classList.add('d-none');
                            }
                            
                            // Create user document in Firestore
                            return createUserDocument(userCredential.user);
                        })
                        .then(() => {
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
                            console.error('Signup error:', error);
                            console.error('Error details:', {
                                name: error.name,
                                message: error.message,
                                code: error.code,
                                stack: error.stack
                            });
                            
                            // Provide more specific error messages
                            let errorMessage = 'Signup failed. Please try again.';
                            if (error.code === 'auth/email-already-in-use') {
                                errorMessage = 'An account already exists with this email address.';
                            } else if (error.code === 'auth/invalid-email') {
                                errorMessage = 'Invalid email address format.';
                            } else if (error.code === 'auth/weak-password') {
                                errorMessage = 'Password is too weak. Please use a stronger password.';
                            } else if (error.code === 'auth/operation-not-allowed') {
                                errorMessage = 'Email/password accounts are not enabled.';
                            } else if (error.code === 'auth/too-many-requests') {
                                errorMessage = 'Too many requests. Please try again later.';
                            } else if (error.code === 'firestore/permission-denied') {
                                errorMessage = 'Permission denied when creating user document.';
                            } else if (error.code === 'firestore/unavailable') {
                                errorMessage = 'Database unavailable. Please try again later.';
                            }
                            
                            const signupError = document.getElementById('signup-error');
                            if (signupError) {
                                signupError.textContent = errorMessage;
                                signupError.classList.remove('d-none');
                            }
                        });
                } else {
                    console.error('Firebase Auth not initialized');
                    const signupError = document.getElementById('signup-error');
                    if (signupError) {
                        signupError.textContent = 'Authentication system not initialized. Please refresh the page.';
                        signupError.classList.remove('d-none');
                    }
                }
            });
            
            // Mark listener as attached
            signupForm.dataset.listenerAttached = 'true';
            return true;
        }
        
        console.log('Signup form not found');
        return false;
    }
    
    // Try immediately
    if (!attachListener()) {
        // Try again after a delay
        setTimeout(attachListener, 100);
        // Try again after another delay
        setTimeout(attachListener, 500);
        // Try again after a longer delay
        setTimeout(attachListener, 1000);
    }
}

// Function to create user document in Firestore
async function createUserDocument(user) {
    try {
        console.log('Creating user document for:', user.uid);
        
        // Check if firebaseDb is available
        if (!window.firebaseDb) {
            throw new Error('Firebase DB not initialized');
        }
        
        // Create user document
        const userData = {
            uid: user.uid,
            email: user.email,
            name: user.displayName || 'New User',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await firebase.firestore().collection('users').doc(user.uid).set(userData);
        console.log('User document created successfully for:', user.uid);
    } catch (error) {
        console.error('Error creating user document:', error);
        console.error('Error details:', {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack
        });
        throw error;
    }
}

// Try to attach signup form listener immediately
attachSignupFormListener();

// Also try after a delay to ensure DOM elements are fully loaded
setTimeout(attachSignupFormListener, 500);

// Logout function
function attachLogoutButtonListener() {
    // Function to attach logout button listener
    function attachListener() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            console.log('Logout button found, adding event listener');
            // Check if listener is already attached
            if (logoutBtn.dataset.listenerAttached === 'true') {
                console.log('Logout button listener already attached');
                return true;
            }
            
            logoutBtn.addEventListener('click', e => {
                e.preventDefault();
                console.log('Logout button clicked');
                
                if (window.firebaseAuth) {
                    console.log('Firebase Auth available for logout');
                    // Use the Firebase signOut syntax with global firebase object
                    firebase.auth().signOut()
                        .then(() => {
                            console.log('User logged out successfully');
                            // Redirect to home page
                            window.location.href = 'index.html';
                        })
                        .catch(error => {
                            console.error('Error logging out:', error);
                            console.error('Error details:', {
                                name: error.name,
                                message: error.message,
                                code: error.code,
                                stack: error.stack
                            });
                            // Still redirect to home page
                            window.location.href = 'index.html';
                        });
                } else {
                    console.error('Firebase Auth not initialized');
                    // Redirect to home page anyway
                    window.location.href = 'index.html';
                }
            });
            
            // Mark listener as attached
            logoutBtn.dataset.listenerAttached = 'true';
            return true;
        }
        
        console.log('Logout button not found');
        return false;
    }
    
    // Try immediately
    if (!attachListener()) {
        // Try again after a delay
        setTimeout(attachListener, 100);
        // Try again after another delay
        setTimeout(attachListener, 500);
        // Try again after a longer delay
        setTimeout(attachListener, 1000);
    }
}

// Try to attach logout button listener immediately
attachLogoutButtonListener();

// Also try after a delay to ensure DOM elements are fully loaded
setTimeout(attachLogoutButtonListener, 500);