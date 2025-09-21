// Admin Dashboard JavaScript - New Implementation
// This file handles all the admin dashboard functionality including data loading, chart rendering, and user management

console.log('Admin Dashboard New Implementation Loaded');

// Global variables
let locationChart = null;
let priceChart = null;
let allProperties = [];
let allUsers = [];

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

// Format date
function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    try {
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-IN');
    } catch (error) {
        console.error('Error formatting date:', error);
        return 'N/A';
    }
}

// Show error message
function showErrorMessage(message) {
    const errorMessageEl = document.getElementById('errorMessage');
    if (errorMessageEl) {
        errorMessageEl.textContent = message;
        errorMessageEl.classList.remove('d-none');
        
        // Hide error after 5 seconds
        setTimeout(() => {
            errorMessageEl.classList.add('d-none');
        }, 5000);
    }
    console.error('Dashboard Error:', message);
}

// Hide all loading indicators
function hideAllLoadingIndicators() {
    const loadingElements = [
        'propertiesLoading', 'usersLoading', 'listingsLoading', 'priceLoading',
        'locationChartLoading', 'priceChartLoading'
    ];
    
    loadingElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });
}

// Add fade-in animation to elements
function addFadeInAnimation(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.classList.add('fade-in');
        // Remove the class after animation completes to allow re-triggering
        setTimeout(() => {
            element.classList.remove('fade-in');
        }, 500);
    }
}

// Search properties
function searchProperties(query) {
    const recentPropertiesTableEl = document.getElementById('recentPropertiesTable');
    if (!recentPropertiesTableEl) return;
    
    if (!query) {
        // If no query, show recent properties
        loadRecentProperties();
        return;
    }
    
    // Filter properties based on query
    const filteredProperties = allProperties.filter(property => {
        const title = (property.title || '').toLowerCase();
        const location = (property.location || '').toLowerCase();
        const queryLower = query.toLowerCase();
        
        return title.includes(queryLower) || location.includes(queryLower);
    });
    
    // Clear table
    recentPropertiesTableEl.innerHTML = '';
    
    if (filteredProperties.length === 0) {
        recentPropertiesTableEl.innerHTML = '<tr><td colspan="5" class="text-center">No properties found matching your search</td></tr>';
        return;
    }
    
    // Add filtered properties to table
    filteredProperties.forEach(property => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>
                <img src="${property.imageUrl || 'https://via.placeholder.com/50'}" 
                     alt="Property" class="property-image" onerror="this.src='https://via.placeholder.com/50'">
            </td>
            <td>${property.title || 'N/A'}</td>
            <td>${property.location || 'N/A'}</td>
            <td>${property.price ? formatCurrency(property.price) : 'N/A'}</td>
            <td>${formatDate(property.createdAt)}</td>
        `;
        
        recentPropertiesTableEl.appendChild(row);
    });
}

// Search users
function searchUsers(query) {
    const usersTableEl = document.getElementById('usersTable');
    if (!usersTableEl) return;
    
    if (!query) {
        // If no query, show all users
        loadAllUsers();
        return;
    }
    
    // Filter users based on query
    const filteredUsers = allUsers.filter(user => {
        const name = (user.name || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        const phone = (user.phone || '').toLowerCase();
        const queryLower = query.toLowerCase();
        
        return name.includes(queryLower) || email.includes(queryLower) || phone.includes(queryLower);
    });
    
    // Clear table
    usersTableEl.innerHTML = '';
    
    if (filteredUsers.length === 0) {
        usersTableEl.innerHTML = '<tr><td colspan="4" class="text-center">No users found matching your search</td></tr>';
        return;
    }
    
    // Add filtered users to table
    filteredUsers.forEach(user => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${user.name || 'N/A'}</td>
            <td>${user.email || 'N/A'}</td>
            <td>${user.phone || 'N/A'}</td>
            <td>${formatDate(user.createdAt)}</td>
        `;
        
        usersTableEl.appendChild(row);
    });
}

// Show all loading indicators
function showAllLoadingIndicators() {
    const loadingElements = [
        'propertiesLoading', 'usersLoading', 'listingsLoading', 'priceLoading',
        'locationChartLoading', 'priceChartLoading'
    ];
    
    loadingElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'block';
    });
}

// Load statistics
async function loadStatistics() {
    try {
        console.log('Loading statistics...');
        
        // Get DOM elements
        const totalPropertiesEl = document.getElementById('totalProperties');
        const totalUsersEl = document.getElementById('totalUsers');
        const recentListingsEl = document.getElementById('recentListings');
        const avgPriceEl = document.getElementById('avgPrice');
        const propertiesLoadingEl = document.getElementById('propertiesLoading');
        const usersLoadingEl = document.getElementById('usersLoading');
        const listingsLoadingEl = document.getElementById('listingsLoading');
        const priceLoadingEl = document.getElementById('priceLoading');
        
        // Show loading indicators
        if (propertiesLoadingEl) propertiesLoadingEl.style.display = 'block';
        if (usersLoadingEl) usersLoadingEl.style.display = 'block';
        if (listingsLoadingEl) listingsLoadingEl.style.display = 'block';
        if (priceLoadingEl) priceLoadingEl.style.display = 'block';
        
        // Check if Firebase is available
        if (!window.firebaseDb) {
            throw new Error('Firebase Database not available');
        }
        
        // Load properties count
        const propertiesSnapshot = await window.firebaseDb.collection('properties').get();
        const propertiesCount = propertiesSnapshot.size;
        console.log('Properties count:', propertiesCount);
        if (totalPropertiesEl) {
            totalPropertiesEl.textContent = propertiesCount;
            addFadeInAnimation('totalProperties');
        }
        if (propertiesLoadingEl) propertiesLoadingEl.style.display = 'none';
        
        // Load users count
        const usersSnapshot = await window.firebaseDb.collection('users').get();
        const usersCount = usersSnapshot.size;
        console.log('Users count:', usersCount);
        if (totalUsersEl) {
            totalUsersEl.textContent = usersCount;
            addFadeInAnimation('totalUsers');
        }
        if (usersLoadingEl) usersLoadingEl.style.display = 'none';
        
        // Load recent listings count (last 7 days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const recentListingsSnapshot = await window.firebaseDb.collection('properties')
            .where('createdAt', '>=', oneWeekAgo)
            .get();
        const recentListingsCount = recentListingsSnapshot.size;
        console.log('Recent listings count:', recentListingsCount);
        if (recentListingsEl) {
            recentListingsEl.textContent = recentListingsCount;
            addFadeInAnimation('recentListings');
        }
        if (listingsLoadingEl) listingsLoadingEl.style.display = 'none';
        
        // Calculate average price
        let totalPrice = 0;
        let propertyCount = 0;
        
        propertiesSnapshot.forEach(doc => {
            const property = doc.data();
            if (property.price) {
                totalPrice += property.price;
                propertyCount++;
            }
        });
        
        const avgPrice = propertyCount > 0 ? Math.round(totalPrice / propertyCount) : 0;
        console.log('Average price:', avgPrice);
        if (avgPriceEl) {
            avgPriceEl.textContent = formatCurrency(avgPrice);
            addFadeInAnimation('avgPrice');
        }
        if (priceLoadingEl) priceLoadingEl.style.display = 'none';
        
        console.log('Statistics loaded successfully');
    } catch (error) {
        console.error('Error loading statistics:', error);
        showErrorMessage('Failed to load statistics: ' + error.message);
    }
}

// Load recent properties
async function loadRecentProperties() {
    try {
        console.log('Loading recent properties...');
        
        // Get DOM elements
        const recentPropertiesTableEl = document.getElementById('recentPropertiesTable');
        const listingsLoadingEl = document.getElementById('listingsLoading');
        
        // Check if element exists
        if (!recentPropertiesTableEl) {
            console.error('recentPropertiesTableEl not found');
            return;
        }
        
        // Show loading indicator
        if (listingsLoadingEl) listingsLoadingEl.style.display = 'block';
        
        // Check if Firebase is available
        if (!window.firebaseDb) {
            throw new Error('Firebase Database not available');
        }
        
        // Clear existing content
        recentPropertiesTableEl.innerHTML = '<tr><td colspan="5" class="text-center"><span class="loading-spinner"></span> Loading recent properties...</td></tr>';
        
        // Get all properties for search functionality
        const allPropertiesSnapshot = await window.firebaseDb.collection('properties').get();
        
        // Store all properties for search
        allProperties = [];
        allPropertiesSnapshot.forEach(doc => {
            allProperties.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Get recent properties (limit to 10)
        const recentPropertiesSnapshot = await window.firebaseDb.collection('properties')
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();
        
        console.log('Recent properties snapshot size:', recentPropertiesSnapshot.size);
        
        if (recentPropertiesSnapshot.empty) {
            recentPropertiesTableEl.innerHTML = '<tr><td colspan="5" class="text-center">No properties found</td></tr>';
            if (listingsLoadingEl) listingsLoadingEl.style.display = 'none';
            return;
        }
        
        // Clear table
        recentPropertiesTableEl.innerHTML = '';
        
        // Add properties to table
        let propertyCount = 0;
        recentPropertiesSnapshot.forEach(doc => {
            const property = doc.data();
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>
                    <img src="${property.imageUrl || 'https://via.placeholder.com/50'}" 
                         alt="Property" class="property-image" onerror="this.src='https://via.placeholder.com/50'">
                </td>
                <td>${property.title || 'N/A'}</td>
                <td>${property.location || 'N/A'}</td>
                <td>${property.price ? formatCurrency(property.price) : 'N/A'}</td>
                <td>${formatDate(property.createdAt)}</td>
            `;
            
            recentPropertiesTableEl.appendChild(row);
            propertyCount++;
        });
        
        console.log('Loaded', propertyCount, 'recent properties');
        if (listingsLoadingEl) listingsLoadingEl.style.display = 'none';
        // Add fade-in animation to the table
        const tableElement = document.getElementById('recentPropertiesTable');
        if (tableElement) {
            tableElement.classList.add('fade-in');
        }
        console.log('Recent properties loaded successfully');
    } catch (error) {
        console.error('Error loading recent properties:', error);
        const recentPropertiesTableEl = document.getElementById('recentPropertiesTable');
        if (recentPropertiesTableEl) {
            recentPropertiesTableEl.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading properties: ' + error.message + '</td></tr>';
        }
        showErrorMessage('Failed to load recent properties: ' + error.message);
    }
}

// Load all users
async function loadAllUsers() {
    try {
        console.log('Loading all users...');
        
        // Get DOM elements
        const usersTableEl = document.getElementById('usersTable');
        const usersLoadingEl = document.getElementById('usersLoading');
        
        // Check if element exists
        if (!usersTableEl) {
            console.error('usersTableEl not found');
            return;
        }
        
        // Show loading indicator
        if (usersLoadingEl) usersLoadingEl.style.display = 'block';
        
        // Check if Firebase is available
        if (!window.firebaseDb) {
            throw new Error('Firebase Database not available');
        }
        
        // Clear existing content
        usersTableEl.innerHTML = '<tr><td colspan="4" class="text-center"><span class="loading-spinner"></span> Loading users data...</td></tr>';
        
        // Get all users
        const usersSnapshot = await window.firebaseDb.collection('users').get();
        
        console.log('Users snapshot size:', usersSnapshot.size);
        
        // Store all users for search
        allUsers = [];
        usersSnapshot.forEach(doc => {
            allUsers.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        if (usersSnapshot.empty) {
            usersTableEl.innerHTML = '<tr><td colspan="4" class="text-center">No users found</td></tr>';
            if (usersLoadingEl) usersLoadingEl.style.display = 'none';
            return;
        }
        
        // Clear table
        usersTableEl.innerHTML = '';
        
        // Add users to table
        let userCount = 0;
        usersSnapshot.forEach(doc => {
            const user = doc.data();
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${user.name || 'N/A'}</td>
                <td>${user.email || 'N/A'}</td>
                <td>${user.phone || 'N/A'}</td>
                <td>${formatDate(user.createdAt)}</td>
            `;
            
            usersTableEl.appendChild(row);
            userCount++;
        });
        
        console.log('Loaded', userCount, 'users');
        if (usersLoadingEl) usersLoadingEl.style.display = 'none';
        // Add fade-in animation to the table
        const tableElement = document.getElementById('usersTable');
        if (tableElement) {
            tableElement.classList.add('fade-in');
        }
        console.log('Users loaded successfully');
    } catch (error) {
        console.error('Error loading users:', error);
        const usersTableEl = document.getElementById('usersTable');
        if (usersTableEl) {
            usersTableEl.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error loading users: ' + error.message + '</td></tr>';
        }
        showErrorMessage('Failed to load users: ' + error.message);
    }
}

// Load chart data
async function loadChartData() {
    try {
        console.log('Loading chart data...');
        
        // Get DOM elements
        const locationChartLoadingEl = document.getElementById('locationChartLoading');
        const priceChartLoadingEl = document.getElementById('priceChartLoading');
        
        // Show chart loading indicators
        if (locationChartLoadingEl) locationChartLoadingEl.style.display = 'block';
        if (priceChartLoadingEl) priceChartLoadingEl.style.display = 'block';
        
        // Check if Firebase is available
        if (!window.firebaseDb) {
            throw new Error('Firebase Database not available');
        }
        
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            throw new Error('Chart.js library not loaded');
        }
        
        // Destroy existing charts if they exist
        if (locationChart) {
            locationChart.destroy();
            locationChart = null;
        }
        if (priceChart) {
            priceChart.destroy();
            priceChart = null;
        }
        
        // Load properties for charts
        const propertiesSnapshot = await window.firebaseDb.collection('properties').get();
        
        console.log('Properties for charts:', propertiesSnapshot.size);
        
        // Location data
        const locationData = {};
        const priceRanges = {
            '0-10L': 0,
            '10L-25L': 0,
            '25L-50L': 0,
            '50L-1Cr': 0,
            '1Cr+': 0
        };
        
        let propertyCount = 0;
        propertiesSnapshot.forEach(doc => {
            const property = doc.data();
            propertyCount++;
            
            // Location data
            const location = property.location || 'Unknown';
            locationData[location] = (locationData[location] || 0) + 1;
            
            // Price range data
            if (property.price) {
                if (property.price <= 1000000) {
                    priceRanges['0-10L']++;
                } else if (property.price <= 2500000) {
                    priceRanges['10L-25L']++;
                } else if (property.price <= 5000000) {
                    priceRanges['25L-50L']++;
                } else if (property.price <= 10000000) {
                    priceRanges['50L-1Cr']++;
                } else {
                    priceRanges['1Cr+']++;
                }
            }
        });
        
        console.log('Processed', propertyCount, 'properties for charts');
        console.log('Location data:', locationData);
        console.log('Price ranges:', priceRanges);
        
        // Create location chart
        const locationCtx = document.getElementById('locationChart');
        if (locationCtx) {
            const ctx = locationCtx.getContext('2d');
            if (ctx) {
                locationChart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: Object.keys(locationData),
                        datasets: [{
                            label: 'Number of Properties',
                            data: Object.values(locationData),
                            backgroundColor: 'rgba(13, 110, 253, 0.7)',
                            borderColor: 'rgba(13, 110, 253, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
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
                console.log('Location chart created');
            } else {
                console.error('Could not get 2D context for location chart');
            }
        } else {
            console.error('Location chart canvas not found');
        }
        
        if (locationChartLoadingEl) locationChartLoadingEl.style.display = 'none';
        
        // Create price chart
        const priceCtx = document.getElementById('priceChart');
        if (priceCtx) {
            const ctx = priceCtx.getContext('2d');
            if (ctx) {
                priceChart = new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: Object.keys(priceRanges),
                        datasets: [{
                            data: Object.values(priceRanges),
                            backgroundColor: [
                                'rgba(13, 110, 253, 0.7)',
                                'rgba(40, 167, 69, 0.7)',
                                'rgba(255, 193, 7, 0.7)',
                                'rgba(220, 53, 69, 0.7)',
                                'rgba(108, 117, 125, 0.7)'
                            ],
                            borderColor: [
                                'rgba(13, 110, 253, 1)',
                                'rgba(40, 167, 69, 1)',
                                'rgba(255, 193, 7, 1)',
                                'rgba(220, 53, 69, 1)',
                                'rgba(108, 117, 125, 1)'
                            ],
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'right',
                            }
                        }
                    }
                });
                console.log('Price chart created');
            } else {
                console.error('Could not get 2D context for price chart');
            }
        } else {
            console.error('Price chart canvas not found');
        }
        
        if (priceChartLoadingEl) priceChartLoadingEl.style.display = 'none';
        
        console.log('Chart data loaded successfully');
    } catch (error) {
        console.error('Error loading chart data:', error);
        showErrorMessage('Failed to load chart data: ' + error.message);
        const locationChartLoadingEl = document.getElementById('locationChartLoading');
        const priceChartLoadingEl = document.getElementById('priceChartLoading');
        if (locationChartLoadingEl) locationChartLoadingEl.style.display = 'none';
        if (priceChartLoadingEl) priceChartLoadingEl.style.display = 'none';
    }
}

// Load all dashboard data
async function loadDashboardData() {
    console.log('Loading all dashboard data...');
    
    try {
        // Show all loading indicators at the start
        showAllLoadingIndicators();
        
        // Load all data concurrently
        console.log('Starting to load dashboard data...');
        await Promise.all([
            loadStatistics(),
            loadRecentProperties(),
            loadAllUsers(),
            loadChartData()
        ]);
        
        console.log('All dashboard data loaded successfully');
        
        // Hide any remaining loading indicators
        hideAllLoadingIndicators();
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showErrorMessage('Failed to load dashboard data: ' + error.message);
        hideAllLoadingIndicators();
    }
}

// Check admin access
async function checkAdminAccess() {
    return new Promise((resolve) => {
        // Check if Firebase auth is available
        if (!window.firebaseAuth) {
            console.error('Firebase Auth not available');
            showErrorMessage('Authentication system not initialized.');
            setTimeout(() => {
                window.location.href = 'admin-login.html';
            }, 3000);
            resolve(false);
            return;
        }
        
        window.firebaseAuth.onAuthStateChanged(async (user) => {
            if (user) {
                console.log('User authenticated:', user.email);
                // Check if user's email is in the admin list
                const ADMIN_EMAILS = ["admin@gmail.com"];
                const isAdmin = ADMIN_EMAILS.includes(user.email);
                
                if (isAdmin) {
                    console.log('Admin access verified for:', user.email);
                    resolve(true);
                } else {
                    console.log('User is not admin:', user.email);
                    showErrorMessage('Access denied. Admin privileges required.');
                    setTimeout(() => {
                        window.location.href = 'admin-login.html';
                    }, 3000);
                    resolve(false);
                }
            } else {
                console.log('User not logged in');
                showErrorMessage('Please log in as admin.');
                setTimeout(() => {
                    window.location.href = 'admin-login.html';
                }, 3000);
                resolve(false);
            }
        });
    });
}

// Logout function
function logout() {
    if (window.firebaseAuth) {
        window.firebaseAuth.signOut().then(() => {
            console.log('User logged out successfully');
            window.location.href = 'index.html';
        }).catch((error) => {
            console.error('Error logging out:', error);
            showErrorMessage('Error logging out: ' + error.message);
        });
    } else {
        console.error('Firebase Auth not available');
        window.location.href = 'index.html';
    }
}

// Initialize dashboard
async function initDashboard() {
    console.log('Initializing admin dashboard...');
    
    try {
        // Small delay to ensure DOM is fully loaded
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Get DOM elements
        const refreshBtn = document.getElementById('refreshBtn');
        const logoutBtn = document.getElementById('logoutBtn');
        
        // Get search elements
        const propertySearchInput = document.getElementById('propertySearch');
        const userSearchInput = document.getElementById('userSearch');
        const clearPropertySearchBtn = document.getElementById('clearPropertySearch');
        const clearUserSearchBtn = document.getElementById('clearUserSearch');
        
        // Log element status for debugging
        console.log('DOM Elements Status:', {
            refreshBtn: !!refreshBtn,
            logoutBtn: !!logoutBtn,
            propertySearchInput: !!propertySearchInput,
            userSearchInput: !!userSearchInput,
            clearPropertySearchBtn: !!clearPropertySearchBtn,
            clearUserSearchBtn: !!clearUserSearchBtn
        });
        
        // Check admin access
        const hasAdminAccess = await checkAdminAccess();
        if (!hasAdminAccess) {
            console.log('Admin access denied');
            return;
        }
        
        console.log('Admin access granted, loading dashboard data...');
        
        // Add welcome animation
        const dashboardTitle = document.querySelector('.page-header h1');
        if (dashboardTitle) {
            dashboardTitle.style.opacity = '0';
            dashboardTitle.style.transform = 'translateY(-20px)';
            dashboardTitle.style.transition = 'all 0.5s ease';
            
            setTimeout(() => {
                dashboardTitle.style.opacity = '1';
                dashboardTitle.style.transform = 'translateY(0)';
            }, 300);
        }
        
        // Load all dashboard data
        await loadDashboardData();
        
        // Set up refresh button
        if (refreshBtn) {
            refreshBtn.addEventListener('click', async () => {
                refreshBtn.disabled = true;
                refreshBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>Refreshing...';
                
                await loadDashboardData();
                
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt me-1"></i>Refresh';
            });
        }
        
        // Set up logout button
        if (logoutBtn) {
            logoutBtn.addEventListener('click', logout);
        }
        
        // Set up property search
        if (propertySearchInput) {
            propertySearchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                searchProperties(query);
            });
        }
        
        // Set up user search
        if (userSearchInput) {
            userSearchInput.addEventListener('input', (e) => {
                const query = e.target.value.trim();
                searchUsers(query);
            });
        }
        
        // Set up clear property search
        if (clearPropertySearchBtn && propertySearchInput) {
            clearPropertySearchBtn.addEventListener('click', () => {
                propertySearchInput.value = '';
                loadRecentProperties(); // Reload recent properties
            });
        }
        
        // Set up clear user search
        if (clearUserSearchBtn && userSearchInput) {
            clearUserSearchBtn.addEventListener('click', () => {
                userSearchInput.value = '';
                loadAllUsers(); // Reload all users
            });
        }
        
        console.log('Admin dashboard initialized successfully');
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showErrorMessage('Failed to initialize dashboard: ' + error.message);
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    // DOM is already loaded
    initDashboard();
}

console.log('Admin Dashboard New Implementation Setup Complete');