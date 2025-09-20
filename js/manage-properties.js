// JavaScript for Manage Properties Page

// DOM Elements
const propertiesContainer = document.getElementById('properties-container');
const noPropertiesMessage = document.getElementById('no-properties-message');
const editPropertyForm = document.getElementById('edit-property-form');
const deletePropertyModal = document.getElementById('deletePropertyModal');

// Default image placeholder
const DEFAULT_IMAGE_PLACEHOLDER = 'https://via.placeholder.com/400x300?text=No+Image+Available';
const DEFAULT_DEMO_IMAGE = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80';

// Load user's properties on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded. Initializing property loading...");
    
    // Set up edit form submission
    if (editPropertyForm) {
        editPropertyForm.addEventListener('submit', updateProperty);
    }
    
    // Set up delete confirmation
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', deleteProperty);
    }
    
    // Load user properties
    loadUserProperties();
});

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
    const user = firebaseAuth.currentUser;
    if (!user) {
        console.log("No user currently authenticated, waiting for auth state...");
        // Wait a bit for auth state to initialize, then check again
        setTimeout(() => {
            const currentUser = firebaseAuth.currentUser;
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
    firebaseDb.collection('properties')
        .where('userId', '==', user.uid)
        .get()
        .then(snapshot => {
            console.log("User properties loaded from Firestore. Count:", snapshot.size);
            
            // Always hide the no properties message first
            noPropertiesMessage.style.display = 'none';
            
            if (snapshot.empty) {
                // Handle empty case
                propertiesContainer.innerHTML = '';
                noPropertiesMessage.style.display = 'block';
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
            
            propertiesContainer.innerHTML = propertiesHTML;
            
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
    
    return `
        <div class="col-md-6 col-lg-4 mb-4 card-animation">
            <div class="card property-card h-100">
                <img src="${imageUrl}" class="card-img-top property-image" alt="${property.title}" onerror="this.src='${DEFAULT_IMAGE_PLACEHOLDER}'">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${property.title}</h5>
                    <p class="property-price mb-1">₹${property.price ? property.price.toLocaleString() : '0'}</p>
                    <p class="property-location mb-2"><i class="fas fa-map-marker-alt me-1"></i> ${property.location}</p>
                    <p class="property-description flex-grow-1">${property.description}</p>
                    <div class="mt-auto">
                        <small class="text-muted">Posted on ${formattedDate}</small>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="d-flex justify-content-between">
                        <button class="btn btn-sm btn-outline-primary" onclick="openEditModal('${id}', ${JSON.stringify(property).replace(/"/g, '&quot;')})">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="openDeleteModal('${id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Open edit modal with property data
function openEditModal(id, property) {
    // Set form values
    document.getElementById('edit-property-id').value = id;
    document.getElementById('edit-property-title').value = property.title;
    document.getElementById('edit-property-price').value = property.price;
    document.getElementById('edit-property-location').value = property.location;
    document.getElementById('edit-property-description').value = property.description;
    document.getElementById('edit-property-image').value = property.imageUrl || '';
    
    // Update image preview
    const imagePreview = document.getElementById('edit-image-preview');
    if (imagePreview) {
        imagePreview.src = property.imageUrl || DEFAULT_DEMO_IMAGE;
        imagePreview.onerror = function() {
            this.src = DEFAULT_IMAGE_PLACEHOLDER;
        };
    }
    
    // Show modal
    const editModal = new bootstrap.Modal(document.getElementById('editPropertyModal'));
    editModal.show();
}

// Update property in Firestore
function updateProperty(e) {
    e.preventDefault();
    
    // Get form values
    const id = document.getElementById('edit-property-id').value;
    const title = document.getElementById('edit-property-title').value;
    const price = parseFloat(document.getElementById('edit-property-price').value);
    const location = document.getElementById('edit-property-location').value;
    const description = document.getElementById('edit-property-description').value;
    const imageUrl = document.getElementById('edit-property-image').value || DEFAULT_DEMO_IMAGE;
    
    // Create search terms array
    const searchTerms = [
        title.toLowerCase(),
        location.toLowerCase(),
        ...title.toLowerCase().split(' '),
        ...location.toLowerCase().split(' ')
    ];
    
    // Create updated property object
    const updatedProperty = {
        title,
        price,
        location,
        description,
        imageUrl,
        searchTerms
    };
    
    // Update in Firestore
    firebaseDb.collection('properties').doc(id)
        .update(updatedProperty)
        .then(() => {
            console.log('Property updated successfully');
            // Close modal
            const editModal = bootstrap.Modal.getInstance(document.getElementById('editPropertyModal'));
            editModal.hide();
            // Reload properties
            loadUserProperties();
        })
        .catch(error => {
            console.error('Error updating property:', error);
            alert(`Error updating property: ${error.message}. Please try again.`);
        });
}

// Open delete confirmation modal
function openDeleteModal(id) {
    document.getElementById('delete-property-id').value = id;
    const deleteModal = new bootstrap.Modal(deletePropertyModal);
    deleteModal.show();
}

// Delete property from Firestore
function deleteProperty() {
    const id = document.getElementById('delete-property-id').value;
    
    firebaseDb.collection('properties').doc(id)
        .delete()
        .then(() => {
            console.log('Property deleted successfully');
            // Close modal
            const deleteModal = bootstrap.Modal.getInstance(deletePropertyModal);
            deleteModal.hide();
            // Reload properties
            loadUserProperties();
        })
        .catch(error => {
            console.error('Error deleting property:', error);
            alert(`Error deleting property: ${error.message}. Please try again.`);
        });
}