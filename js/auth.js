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

// Check authentication state
firebaseAuth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        showUserUI(user);
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
}

// Show authentication buttons UI
function showAuthUI() {
    authButtons.classList.remove('d-none');
    userInfo.classList.add('d-none');
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