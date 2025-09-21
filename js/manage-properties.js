// Manage Properties JavaScript for Property Expert

// DOM Elements
const propertiesContainer = document.getElementById('properties-container');
const noPropertiesMessage = document.getElementById('no-properties-message');
const editPropertyForm = document.getElementById('edit-property-form');
const editPropertyModal = document.getElementById('editPropertyModal');

// Default image placeholder
const DEFAULT_IMAGE_PLACEHOLDER = 'https://via.placeholder.com/400x300?text=No+Image+Available';
const DEFAULT_DEMO_IMAGE = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80';

// Check authentication state when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, checking authentication state for manage properties");
    
    // Small delay to ensure DOM elements are fully loaded
    setTimeout(() => {
        // Check if firebaseAuth is available
        if (window.firebaseAuth) {
            window.firebaseAuth.onAuthStateChanged(user => {
                if (user) {
                    console.log("User authenticated for manage properties:", user.email);
                    // Show user info
                    document.getElementById('user-email').textContent = user.email;
                    document.getElementById('auth-buttons').classList.add('d-none');
                    document.getElementById('user-info').classList.remove('d-none');
                    
                    // Load user's properties
                    loadUserProperties();
                    
                    // Check if user is admin
                    checkAdminStatus(user);
                } else {
                    // User is not authenticated, redirect to login
                    console.log("User not authenticated for manage properties, redirecting to login");
                    window.location.href = 'index.html';
                }
            });
        } else {
            console.error("Firebase Auth not initialized for manage properties");
            // Try again after a delay
            setTimeout(() => {
                if (window.firebaseAuth) {
                    firebaseAuth.onAuthStateChanged(user => {
                        if (user) {
                            console.log("User authenticated after delay:", user.email);
                            // Show user info
                            document.getElementById('user-email').textContent = user.email;
                            document.getElementById('auth-buttons').classList.add('d-none');
                            document.getElementById('user-info').classList.remove('d-none');
                            
                            // Load user's properties
                            loadUserProperties();
                            
                            // Check if user is admin
                            checkAdminStatus(user);
                        } else {
                            // User is not authenticated, redirect to login
                            console.log("User not authenticated after delay, redirecting to login");
                            window.location.href = 'index.html';
                        }
                    });
                } else {
                    // Still not initialized, redirect to login
                    window.location.href = 'index.html';
                }
            }, 1000);
        }
    }, 100);
});

// Check if user is admin and show admin dashboard link
function checkAdminStatus(user) {
    console.log("Checking admin status in manage properties for user:", user.email);
    if (user) {
        console.log("Current user:", user.email);
        // Check if user is admin
        if (window.isAdminUser && window.isAdminUser(user)) {
            console.log("User is admin, showing admin dashboard link");
            // Try to find the element by ID first
            const adminNav = document.getElementById('admin-dashboard-nav');
            if (adminNav) {
                adminNav.style.display = 'block';
            } else {
                // Try again after a delay
                setTimeout(() => {
                    const adminNav = document.getElementById('admin-dashboard-nav');
                    if (adminNav) {
                        adminNav.style.display = 'block';
                    } else {
                        console.log('Admin dashboard nav element still not found in manage properties');
                    }
                }, 500);
            }
        }
    }
}

// Show loading spinner
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Loading your properties...</p>
            </div>
        `;
    }
}

// Show error message
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="text-center py-5">
                <div class="alert alert-danger d-inline-block">
                    <i class="fas fa-exclamation-circle me-2"></i>${message}
                </div>
                <p class="mt-3"><small>Please check the browser console for more details.</small></p>
                <button class="btn btn-primary mt-3" onclick="loadUserProperties()">Retry</button>
            </div>
        `;
    }
}

// Load properties for the current user
function loadUserProperties() {
    console.log("Loading user properties from Firestore...");
    
    // Show loading state
    showLoading('properties-container');
    
    // Check if firebaseAuth is available
    if (!window.firebaseAuth) {
        console.error("Firebase Auth not initialized");
        showError('properties-container', 'Authentication error. Please refresh the page.');
        return;
    }
    
    // Check if user is authenticated
    const user = window.firebaseAuth.currentUser;
    if (!user) {
        console.log("No user currently authenticated, waiting for auth state...");
        // Wait a bit for auth state to initialize, then check again
        setTimeout(() => {
            const currentUser = window.firebaseAuth.currentUser;
            if (currentUser) {
                console.log("User authenticated after delay:", currentUser.email);
                fetchUserProperties(currentUser);
            } else {
                console.log("User still not authenticated, redirecting to login");
                window.location.href = 'index.html';
            }
        }, 1000);
    } else {
        console.log("User already authenticated:", user.email);
        fetchUserProperties(user);
    }
}

// Fetch properties for a specific user
function fetchUserProperties(user) {
    // Check if firebaseDb is available
    if (!window.firebaseDb) {
        console.error("Firebase DB not initialized");
        showError('properties-container', 'Database connection error. Please refresh the page.');
        return;
    }
    
    console.log("Fetching properties for user:", user.uid);
    
    // Load user's properties using where clause
    window.firebaseDb.collection('properties')
        .where('userId', '==', user.uid)
        .get()
        .then(snapshot => {
            console.log("User properties loaded from Firestore. Count:", snapshot.size);
            
            // Always hide the no properties message first
            if (noPropertiesMessage) {
                noPropertiesMessage.style.display = 'none';
            }
            
            if (snapshot.empty) {
                // Handle empty case
                if (propertiesContainer) {
                    propertiesContainer.innerHTML = '';
                }
                if (noPropertiesMessage) {
                    noPropertiesMessage.style.display = 'block';
                }
                return;
            }
            
            // Convert snapshot to array and sort by createdAt
            const properties = [];
            snapshot.forEach(doc => {
                properties.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Sort by createdAt in descending order (newest first)
            properties.sort((a, b) => {
                // Handle cases where createdAt might be missing
                if (!a.createdAt && !b.createdAt) return 0;
                if (!a.createdAt) return 1;
                if (!b.createdAt) return -1;
                
                // Convert to Date objects if they're Firestore timestamps
                const dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                const dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                
                return dateB - dateA;
            });
            
            // Generate HTML for properties
            let propertiesHTML = '';
            properties.forEach(property => {
                propertiesHTML += createUserPropertyCard(property.id, property);
            });
            
            if (propertiesContainer) {
                propertiesContainer.innerHTML = propertiesHTML;
            }
            
            // Add animation delay to cards
            const cards = document.querySelectorAll('.property-card');
            if (cards.length > 0) {
                cards.forEach((card, index) => {
                    card.style.animationDelay = `${index * 0.1}s`;
                });
            }
        })
        .catch(error => {
            console.error('Error loading properties:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                code: error.code,
                stack: error.stack
            });
            
            // Provide more specific error messages
            let errorMessage = 'Error loading properties. Please try again later.';
            if (error.code === 'permission-denied') {
                errorMessage = 'Access denied. You may not have permission to view these properties.';
            } else if (error.code === 'unavailable') {
                errorMessage = 'Database unavailable. Please check your internet connection and try again.';
            } else if (error.code === 'failed-precondition') {
                errorMessage = 'Database index required. Please refresh the page or contact support.';
            }
            
            showError('properties-container', errorMessage);
        });
}

// Create property card HTML for user's properties
function createUserPropertyCard(id, property) {
    // Handle createdAt field properly
    let formattedDate = 'Unknown date';
    if (property.createdAt && property.createdAt.toDate) {
        try {
            formattedDate = new Date(property.createdAt.toDate()).toLocaleDateString();
        } catch (e) {
            console.error('Error formatting date:', e);
            formattedDate = 'Unknown date';
        }
    }
    
    // Use default demo image if no image URL is provided
    const imageUrl = property.imageUrl || DEFAULT_DEMO_IMAGE;
    
    // Add contact information if available
    let contactHTML = '';
    if (property.contact) {
        contactHTML = `
            <p class="property-contact mb-2"><i class="fas fa-phone me-1"></i> <strong>Contact:</strong> ${property.contact}</p>
        `;
    }
    
    return `
        <div class="col-md-6 col-lg-4 mb-4 card-animation">
            <div class="card property-card h-100">
                <img src="${imageUrl}" class="card-img-top property-image" alt="${property.title}" onerror="this.src='${DEFAULT_IMAGE_PLACEHOLDER}'">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${property.title}</h5>
                    <p class="property-price mb-1">₹${property.price ? property.price.toLocaleString() : '0'}</p>
                    <p class="property-location mb-2"><i class="fas fa-map-marker-alt me-1"></i> ${property.location}</p>
                    ${contactHTML}
                    <p class="property-description flex-grow-1">${property.description}</p>
                    <div class="mt-auto">
                        <small class="text-muted">Posted on ${formattedDate}</small>
                    </div>
                    <div class="mt-3 d-flex gap-2">
                        <button class="btn btn-primary btn-sm flex-grow-1" onclick="editProperty('${id}')">
                            <i class="fas fa-edit me-1"></i>Edit
                        </button>
                        <button class="btn btn-danger btn-sm flex-grow-1" onclick="deleteProperty('${id}')">
                            <i class="fas fa-trash me-1"></i>Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Edit property function
function editProperty(propertyId) {
    console.log("Editing property:", propertyId);
    
    // Check if firebaseDb is available
    if (!window.firebaseDb) {
        console.error("Firebase DB not initialized");
        alert('Database connection error. Please refresh the page.');
        return;
    }
    
    // Get property data from Firestore
    window.firebaseDb.collection('properties').doc(propertyId).get()
        .then(doc => {
            if (doc.exists) {
                const property = doc.data();
                
                // Fill form with property data
                document.getElementById('edit-property-id').value = propertyId;
                document.getElementById('edit-property-title').value = property.title || '';
                document.getElementById('edit-property-price').value = property.price || '';
                document.getElementById('edit-property-location').value = property.location || '';
                document.getElementById('edit-property-description').value = property.description || '';
                document.getElementById('edit-property-image').value = property.imageUrl || '';
                document.getElementById('edit-property-contact').value = property.contact || '';
                
                // Update image preview
                const imagePreview = document.getElementById('edit-image-preview');
                if (imagePreview) {
                    imagePreview.src = property.imageUrl || DEFAULT_DEMO_IMAGE;
                }
                
                // Show modal
                const modal = new bootstrap.Modal(editPropertyModal);
                modal.show();
            } else {
                console.error("Property not found");
                alert('Property not found.');
            }
        })
        .catch(error => {
            console.error("Error getting property:", error);
            alert('Error loading property data. Please try again.');
        });
}

// Delete property function
function deleteProperty(propertyId) {
    console.log("Deleting property:", propertyId);
    
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
        return;
    }
    
    // Check if firebaseDb is available
    if (!window.firebaseDb) {
        console.error("Firebase DB not initialized");
        alert('Database connection error. Please refresh the page.');
        return;
    }
    
    // Delete property from Firestore
    window.firebaseDb.collection('properties').doc(propertyId).delete()
        .then(() => {
            console.log("Property deleted successfully");
            // Reload properties
            loadUserProperties();
            // Show success message
            alert('Property deleted successfully!');
        })
        .catch(error => {
            console.error("Error deleting property:", error);
            alert('Error deleting property. Please try again.');
        });
}

// Handle edit property form submission
if (editPropertyForm) {
    editPropertyForm.addEventListener('submit', e => {
        e.preventDefault();
        
        // Get form data
        const propertyId = document.getElementById('edit-property-id').value;
        const title = document.getElementById('edit-property-title').value;
        const price = parseFloat(document.getElementById('edit-property-price').value);
        const location = document.getElementById('edit-property-location').value;
        const description = document.getElementById('edit-property-description').value;
        const imageUrl = document.getElementById('edit-property-image').value;
        const contact = document.getElementById('edit-property-contact').value;
        
        // Validate required fields
        if (!title || !price || !location || !description || !imageUrl || !contact) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Check if firebaseDb is available
        if (!window.firebaseDb) {
            console.error("Firebase DB not initialized");
            alert('Database connection error. Please refresh the page.');
            return;
        }
        
        // Update property in Firestore
        window.firebaseDb.collection('properties').doc(propertyId).update({
            title: title,
            price: price,
            location: location,
            description: description,
            imageUrl: imageUrl,
            contact: contact,
            updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
            console.log("Property updated successfully");
            // Close modal
            const modal = bootstrap.Modal.getInstance(editPropertyModal);
            if (modal) {
                modal.hide();
            }
            // Reload properties
            loadUserProperties();
            // Show success message
            alert('Property updated successfully!');
        })
        .catch(error => {
            console.error("Error updating property:", error);
            alert('Error updating property. Please try again.');
        });
    });
}

// Update image preview when URL changes
const editPropertyImage = document.getElementById('edit-property-image');
if (editPropertyImage) {
    editPropertyImage.addEventListener('input', () => {
        const imagePreview = document.getElementById('edit-image-preview');
        if (imagePreview) {
            imagePreview.src = editPropertyImage.value || DEFAULT_DEMO_IMAGE;
        }
    });
}

// Handle delete confirmation
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', () => {
        const propertyId = document.getElementById('delete-property-id').value;
        deleteProperty(propertyId);
    });
}