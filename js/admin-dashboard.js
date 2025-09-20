// Admin Dashboard JavaScript for Property Expert

// DOM Elements
const totalPropertiesElement = document.getElementById('total-properties');
const totalUsersElement = document.getElementById('total-users');
const propertiesThisWeekElement = document.getElementById('properties-this-week');
const avgPriceElement = document.getElementById('avg-price');
const recentPropertiesTable = document.getElementById('recent-properties-table');

// Chart instances
let locationChart = null;
let timeChart = null;

// Check authentication state and ensure user is admin
document.addEventListener('DOMContentLoaded', () => {
    console.log("Admin dashboard loaded");
    
    // Check if firebaseAuth is available
    if (!window.firebaseAuth) {
        console.error("Firebase Auth not initialized");
        showErrorMessage('Authentication system not initialized. Please refresh the page.');
        redirectToLogin();
        return;
    }
    
    // Check authentication state
    firebaseAuth.onAuthStateChanged(user => {
        if (user) {
            console.log("User authenticated:", user.email);
            // Show user info
            document.getElementById('user-email').textContent = user.email;
            document.getElementById('auth-buttons').classList.add('d-none');
            document.getElementById('user-info').classList.remove('d-none');
            
            // Check if user is admin
            checkAdminAccess(user);
        } else {
            // User is not authenticated, redirect to login
            console.log("User not authenticated, redirecting to login");
            redirectToLogin();
        }
    });
    
    // Set up logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            firebaseAuth.signOut()
                .then(() => {
                    console.log('User logged out successfully');
                    window.location.href = 'index.html';
                })
                .catch(error => {
                    console.error('Error logging out:', error);
                });
        });
    }
    
    // Set up login form submission
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', e => {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const loginError = document.getElementById('login-error');
            
            firebaseAuth.signInWithEmailAndPassword(email, password)
                .then(userCredential => {
                    // Clear any previous errors
                    loginError.classList.add('d-none');
                    
                    // Close modal
                    const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                    loginModal.hide();
                    
                    // Reset form
                    loginForm.reset();
                    
                    console.log('User logged in successfully');
                })
                .catch(error => {
                    loginError.textContent = error.message;
                    loginError.classList.remove('d-none');
                });
        });
    }
    
    // Set up signup form submission
    const signupForm = document.getElementById('signup-form');
    if (signupForm) {
        signupForm.addEventListener('submit', e => {
            e.preventDefault();
            
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const confirmPassword = document.getElementById('signup-confirm-password').value;
            const signupError = document.getElementById('signup-error');
            
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
                    
                    console.log('User signed up successfully');
                })
                .catch(error => {
                    signupError.textContent = error.message;
                    signupError.classList.remove('d-none');
                });
        });
    }
});

// Redirect to login page
function redirectToLogin() {
    window.location.href = 'index.html';
}

// Check if user has admin access
function checkAdminAccess(user) {
    // List of admin emails
    const adminEmails = [
        "admin@propertyexpert.com",
        "alokkushwaha78600@gmail.com",
        "admin@gmail.com"
    ];
    
    // Check if user's email is in the admin list
    if (adminEmails.includes(user.email)) {
        console.log("Admin access granted");
        loadAdminData();
    } else {
        // Check if there are any admins in the database
        checkForExistingAdmins(user);
    }
}

// Check if there are existing admins in the database
function checkForExistingAdmins(currentUser) {
    // In a real app, you would have an admins collection in Firestore
    // For this demo, we'll assume the first user is the admin
    
    // Check if this is the first user by checking if any users exist
    firebaseDb.collection('users')
        .limit(1)
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                // This is the first user, make them admin
                makeUserAdmin(currentUser);
            } else {
                // Check if current user is in the admins collection
                checkIfUserIsAdmin(currentUser);
            }
        })
        .catch(error => {
            console.error("Error checking for existing users:", error);
            // Redirect to home page if there's an error
            redirectToLogin();
        });
}

// Make a user an admin
function makeUserAdmin(user) {
    // Create a user document
    const userData = {
        uid: user.uid,
        email: user.email,
        isAdmin: true,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // Save user data
    firebaseDb.collection('users').doc(user.uid).set(userData)
        .then(() => {
            console.log("User made admin");
            loadAdminData();
        })
        .catch(error => {
            console.error("Error making user admin:", error);
            // Redirect to home page if there's an error
            redirectToLogin();
        });
}

// Check if current user is an admin
function checkIfUserIsAdmin(user) {
    firebaseDb.collection('users').doc(user.uid).get()
        .then(doc => {
            if (doc.exists) {
                const userData = doc.data();
                if (userData.isAdmin) {
                    console.log("User is admin");
                    loadAdminData();
                } else {
                    console.log("User is not admin, redirecting");
                    showErrorMessage('Access denied. Admin privileges required.');
                    setTimeout(() => {
                        redirectToLogin();
                    }, 3000);
                }
            } else {
                // User document doesn't exist, redirect
                console.log("User document not found, redirecting");
                showErrorMessage('Access denied. User not found.');
                setTimeout(() => {
                    redirectToLogin();
                }, 3000);
            }
        })
        .catch(error => {
            console.error("Error checking user admin status:", error);
            // Redirect to home page
            showErrorMessage('Access denied. Error checking permissions.');
            setTimeout(() => {
                redirectToLogin();
            }, 3000);
        });
}

// Load all admin data
function loadAdminData() {
    console.log("Loading admin data");
    
    // Load statistics
    loadStatistics();
    
    // Load charts
    loadCharts();
    
    // Load recent properties
    loadRecentProperties();
}

// Load statistics
function loadStatistics() {
    console.log("Loading statistics");
    
    // Load total properties count
    firebaseDb.collection('properties').get()
        .then(snapshot => {
            const totalProperties = snapshot.size;
            totalPropertiesElement.textContent = totalProperties;
            
            // Calculate average price
            let totalPrice = 0;
            let propertyCount = 0;
            
            snapshot.forEach(doc => {
                const property = doc.data();
                if (property.price && !isNaN(property.price)) {
                    totalPrice += property.price;
                    propertyCount++;
                }
            });
            
            const avgPrice = propertyCount > 0 ? Math.round(totalPrice / propertyCount) : 0;
            avgPriceElement.textContent = `₹${avgPrice.toLocaleString()}`;
        })
        .catch(error => {
            console.error("Error loading properties count:", error);
            totalPropertiesElement.textContent = "Error";
            avgPriceElement.textContent = "₹0";
        });
    
    // Load total users count
    firebaseDb.collection('users').get()
        .then(snapshot => {
            totalUsersElement.textContent = snapshot.size;
        })
        .catch(error => {
            console.error("Error loading users count:", error);
            totalUsersElement.textContent = "Error";
        });
    
    // Load properties added this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    firebaseDb.collection('properties')
        .where('createdAt', '>=', oneWeekAgo)
        .get()
        .then(snapshot => {
            propertiesThisWeekElement.textContent = snapshot.size;
        })
        .catch(error => {
            console.error("Error loading properties this week:", error);
            propertiesThisWeekElement.textContent = "Error";
        });
}

// Load charts
function loadCharts() {
    console.log("Loading charts");
    
    // Load location chart data
    loadLocationChartData();
    
    // Load time chart data
    loadTimeChartData();
}

// Load location chart data
function loadLocationChartData() {
    firebaseDb.collection('properties').get()
        .then(snapshot => {
            const locationCounts = {};
            
            snapshot.forEach(doc => {
                const property = doc.data();
                const location = property.location || 'Unknown';
                
                if (locationCounts[location]) {
                    locationCounts[location]++;
                } else {
                    locationCounts[location] = 1;
                }
            });
            
            // Prepare data for chart
            const labels = Object.keys(locationCounts);
            const data = Object.values(locationCounts);
            
            // Limit to top 10 locations for better visualization
            const sortedLocations = Object.entries(locationCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);
            
            const topLabels = sortedLocations.map(item => item[0]);
            const topData = sortedLocations.map(item => item[1]);
            
            // Create or update location chart
            const ctx = document.getElementById('locationChart').getContext('2d');
            
            if (locationChart) {
                locationChart.destroy();
            }
            
            locationChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: topLabels,
                    datasets: [{
                        label: 'Number of Properties',
                        data: topData,
                        backgroundColor: 'rgba(13, 110, 253, 0.7)',
                        borderColor: 'rgba(13, 110, 253, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        })
        .catch(error => {
            console.error("Error loading location chart data:", error);
        });
}

// Load time chart data
function loadTimeChartData() {
    firebaseDb.collection('properties').get()
        .then(snapshot => {
            // Group properties by month
            const monthlyCounts = {};
            
            snapshot.forEach(doc => {
                const property = doc.data();
                if (property.createdAt) {
                    let date;
                    if (property.createdAt.toDate) {
                        date = property.createdAt.toDate();
                    } else {
                        date = new Date(property.createdAt);
                    }
                    
                    // Format as "Month Year" (e.g., "Jan 2023")
                    const monthYear = date.toLocaleString('default', { month: 'short', year: 'numeric' });
                    
                    if (monthlyCounts[monthYear]) {
                        monthlyCounts[monthYear]++;
                    } else {
                        monthlyCounts[monthYear] = 1;
                    }
                }
            });
            
            // Sort by date
            const sortedEntries = Object.entries(monthlyCounts)
                .sort((a, b) => {
                    const dateA = new Date(a[0]);
                    const dateB = new Date(b[0]);
                    return dateA - dateB;
                });
            
            const labels = sortedEntries.map(entry => entry[0]);
            const data = sortedEntries.map(entry => entry[1]);
            
            // Create or update time chart
            const ctx = document.getElementById('timeChart').getContext('2d');
            
            if (timeChart) {
                timeChart.destroy();
            }
            
            timeChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Properties Added',
                        data: data,
                        borderColor: 'rgba(40, 167, 69, 1)',
                        backgroundColor: 'rgba(40, 167, 69, 0.2)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        })
        .catch(error => {
            console.error("Error loading time chart data:", error);
        });
}

// Load recent properties
function loadRecentProperties() {
    console.log("Loading recent properties");
    
    firebaseDb.collection('properties')
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                recentPropertiesTable.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center">No properties found</td>
                    </tr>
                `;
                return;
            }
            
            let tableHTML = '';
            
            // Get user emails for display
            const userIds = new Set();
            snapshot.forEach(doc => {
                const property = doc.data();
                if (property.userId) {
                    userIds.add(property.userId);
                }
            });
            
            // Get user data
            const userPromises = Array.from(userIds).map(uid => 
                firebaseDb.collection('users').doc(uid).get()
            );
            
            Promise.all(userPromises)
                .then(userDocs => {
                    const userMap = {};
                    userDocs.forEach(userDoc => {
                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            userMap[userData.uid] = userData.email;
                        }
                    });
                    
                    // Generate table rows
                    snapshot.forEach(doc => {
                        const property = doc.data();
                        const formattedDate = property.createdAt ? 
                            new Date(property.createdAt.toDate ? property.createdAt.toDate() : property.createdAt).toLocaleDateString() : 
                            'Unknown';
                        
                        const ownerEmail = property.userId && userMap[property.userId] ? 
                            userMap[property.userId] : 
                            'Unknown';
                        
                        tableHTML += `
                            <tr>
                                <td>${property.title || 'Untitled'}</td>
                                <td>₹${(property.price || 0).toLocaleString()}</td>
                                <td>${property.location || 'Unknown'}</td>
                                <td>${ownerEmail}</td>
                                <td>${formattedDate}</td>
                            </tr>
                        `;
                    });
                    
                    recentPropertiesTable.innerHTML = tableHTML;
                })
                .catch(error => {
                    console.error("Error loading user data:", error);
                    
                    // Fallback without user emails
                    snapshot.forEach(doc => {
                        const property = doc.data();
                        const formattedDate = property.createdAt ? 
                            new Date(property.createdAt.toDate ? property.createdAt.toDate() : property.createdAt).toLocaleDateString() : 
                            'Unknown';
                        
                        tableHTML += `
                            <tr>
                                <td>${property.title || 'Untitled'}</td>
                                <td>₹${(property.price || 0).toLocaleString()}</td>
                                <td>${property.location || 'Unknown'}</td>
                                <td>Unknown</td>
                                <td>${formattedDate}</td>
                            </tr>
                        `;
                    });
                    
                    recentPropertiesTable.innerHTML = tableHTML;
                });
        })
        .catch(error => {
            console.error("Error loading recent properties:", error);
            recentPropertiesTable.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center">Error loading properties</td>
                </tr>
            `;
        });
}

// Show error message
function showErrorMessage(message) {
    // Create an error alert if it doesn't exist
    let errorAlert = document.getElementById('admin-error-alert');
    if (!errorAlert) {
        errorAlert = document.createElement('div');
        errorAlert.id = 'admin-error-alert';
        errorAlert.className = 'alert alert-danger position-fixed top-0 start-50 translate-middle-x mt-3';
        errorAlert.style.zIndex = '10000';
        errorAlert.style.minWidth = '300px';
        errorAlert.innerHTML = `
            <i class="fas fa-exclamation-circle me-2"></i>
            <span>${message}</span>
            <button type="button" class="btn-close float-end" data-bs-dismiss="alert" aria-label="Close"></button>
        `;
        document.body.appendChild(errorAlert);
    } else {
        errorAlert.querySelector('span').textContent = message;
        errorAlert.classList.remove('d-none');
    }
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        errorAlert.classList.add('d-none');
    }, 5000);
}