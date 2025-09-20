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
const adminBtn = document.getElementById('admin-btn');

// Check authentication state
firebaseAuth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        showUserUI(user);
        // Check if user is admin
        checkAdminStatus(user);
    } else {
        // User is signed out
        showAuthUI();
    }
});

// Show authenticated user UI
function showUserUI(user) {
    authButtons.classList.add('d-none');
    userInfo.classList.remove('d-none');
    userEmail.textContent = user.email;
    // Check if user is admin when showing user UI
    checkAdminStatus(user);
}

// Show authentication buttons UI
function showAuthUI() {
    authButtons.classList.remove('d-none');
    userInfo.classList.add('d-none');
    if (adminBtn) {
        adminBtn.style.display = 'none';
    }
}

// Check if user is admin
function checkAdminStatus(user) {
    // List of admin emails
    const adminEmails = [
        "admin@propertyexpert.com",
        "alokkushwaha78600@gmail.com",
        "admin@gmail.com"
    ];
    
    // Check if user's email is in the admin list
    if (adminEmails.includes(user.email)) {
        if (adminBtn) {
            adminBtn.style.display = 'inline-block';
        }
    } else {
        // Check if user is admin in the database
        checkDatabaseForAdminStatus(user);
    }
}

// Check database for admin status
function checkDatabaseForAdminStatus(user) {
    // Check if users collection exists and user has admin flag
    firebaseDb.collection('users').doc(user.uid).get()
        .then(doc => {
            if (doc.exists) {
                const userData = doc.data();
                if (userData.isAdmin && adminBtn) {
                    adminBtn.style.display = 'inline-block';
                } else if (adminBtn) {
                    adminBtn.style.display = 'none';
                }
            } else {
                // Create user document if it doesn't exist
                createUserDocument(user);
            }
        })
        .catch(error => {
            console.error("Error checking admin status:", error);
            if (adminBtn) {
                adminBtn.style.display = 'none';
            }
        });
}

// Create user document
function createUserDocument(user) {
    const userData = {
        uid: user.uid,
        email: user.email,
        isAdmin: false, // Default to false, admin will be set manually
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    firebaseDb.collection('users').doc(user.uid).set(userData)
        .then(() => {
            console.log("User document created");
            if (adminBtn) {
                adminBtn.style.display = 'none';
            }
        })
        .catch(error => {
            console.error("Error creating user document:", error);
        });
}

// Login form submission
if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        firebaseAuth.signInWithEmailAndPassword(email, password)
            .then(userCredential => {
                // Clear any previous errors
                loginError.classList.add('d-none');
                
                // Close modal
                const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                loginModal.hide();
                
                // Reset form
                loginForm.reset();
                
                // Show success message
                console.log('User logged in successfully');
            })
            .catch(error => {
                loginError.textContent = error.message;
                loginError.classList.remove('d-none');
            });
    });
}

// Signup form submission
if (signupForm) {
    signupForm.addEventListener('submit', e => {
        e.preventDefault();
        
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const confirmPassword = document.getElementById('signup-confirm-password').value;
        
        // Check if passwords match
        if (password !== confirmPassword) {
            signupError.textContent = 'Passwords do not match';
            signupError.classList.remove('d-none');
            return;
        }
        
        firebaseAuth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                // Clear any previous errors
                signupError.classList.add('d-none');
                
                // Close modal
                const signupModal = bootstrap.Modal.getInstance(document.getElementById('signupModal'));
                signupModal.hide();
                
                // Reset form
                signupForm.reset();
                
                // Show success message
                console.log('User signed up successfully');
            })
            .catch(error => {
                signupError.textContent = error.message;
                signupError.classList.remove('d-none');
            });
    });
}

// Logout functionality
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        firebaseAuth.signOut()
            .then(() => {
                console.log('User logged out successfully');
                // Hide admin button on logout
                if (adminBtn) {
                    adminBtn.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Error logging out:', error);
            });
    });
}

// Check if user is authenticated (for protected pages)
function checkAuth() {
    return new Promise((resolve, reject) => {
        firebaseAuth.onAuthStateChanged(user => {
            if (user) {
                resolve(user);
            } else {
                reject(new Error('User not authenticated'));
            }
        });
    });
}