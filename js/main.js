// Main JavaScript for Property Expert Home Page

// DOM Elements
const propertiesContainer = document.getElementById('properties-container');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

// Default image placeholder
const DEFAULT_IMAGE_PLACEHOLDER = 'https://via.placeholder.com/400x300?text=No+Image+Available';
const DEFAULT_DEMO_IMAGE = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80';

// Sample properties data for demo
const demoProperties = [
    {
        title: "Modern Downtown Apartment",
        price: 450000,
        location: "New York, NY",
        description: "Beautiful modern apartment in the heart of downtown with stunning city views. Recently renovated with high-end finishes and appliances. Walking distance to parks, restaurants, and public transportation.",
        imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
    },
    {
        title: "Suburban Family Home",
        price: 750000,
        location: "Austin, TX",
        description: "Spacious family home in a quiet suburban neighborhood. Features 4 bedrooms, 3 bathrooms, large backyard, and updated kitchen. Close to top-rated schools and parks.",
        imageUrl: "https://images.unsplash.com/photo-1575517111839-3a3843ee7f5d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
    },
    {
        title: "Luxury Beachfront Villa",
        price: 2500000,
        location: "Miami, FL",
        description: "Stunning luxury villa directly on the beach with panoramic ocean views. Features infinity pool, private beach access, smart home technology, and designer finishes throughout.",
        imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
    },
    {
        title: "Cozy Mountain Cabin",
        price: 320000,
        location: "Aspen, CO",
        description: "Charming mountain cabin perfect for weekend getaways or full-time living. Features rustic charm with modern amenities, fireplace, and beautiful forest views.",
        imageUrl: "https://images.unsplash.com/photo-1594864267607-64e6a199c0eb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
    },
    {
        title: "Urban Loft with City Views",
        price: 620000,
        location: "Chicago, IL",
        description: "Industrial-style loft in trendy neighborhood with exposed brick walls and high ceilings. Open floor plan with large windows offering amazing city views.",
        imageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
    },
    {
        title: "Waterfront Condo",
        price: 895000,
        location: "Seattle, WA",
        description: "Elegant waterfront condo with private balcony overlooking the harbor. Features gourmet kitchen, spa-like bathroom, and access to building amenities including gym and concierge.",
        imageUrl: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
    }
];

// Function to add demo properties to Firestore with improved error handling
function addDemoProperties() {
    console.log("Checking if demo properties need to be added...");
    
    // Check if properties already exist
    return firebaseDb.collection('properties')
        .limit(1)
        .get()
        .then(snapshot => {
            console.log("Firestore query completed. Snapshot size:", snapshot.size);
            if (snapshot.empty) {
                console.log("No properties found. Adding demo properties...");
                // Add demo properties since none exist
                const batch = firebaseDb.batch();
                const propertiesCollection = firebaseDb.collection('properties');
                
                demoProperties.forEach((property, index) => {
                    // Add search terms and timestamp
                    const propertyWithMetadata = {
                        ...property,
                        searchTerms: [
                            property.title.toLowerCase(),
                            property.location.toLowerCase(),
                            ...property.title.toLowerCase().split(' '),
                            ...property.location.toLowerCase().split(' ')
                        ],
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    };
                    
                    const newPropertyRef = propertiesCollection.doc();
                    batch.set(newPropertyRef, propertyWithMetadata);
                    console.log(`Prepared demo property ${index + 1} for insertion with ID: ${newPropertyRef.id}`);
                });
                
                return batch.commit()
                    .then(() => {
                        console.log("All demo properties added successfully.");
                        return true;
                    })
                    .catch(error => {
                        console.error("Error committing batch of demo properties:", error);
                        throw error;
                    });
            } else {
                console.log("Properties already exist. Skipping demo data insertion.");
                return false;
            }
        })
        .catch(error => {
            console.error("Error checking for existing properties:", error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                code: error.code,
                stack: error.stack
            });
            // Don't throw error here to allow loading to continue
            return false;
        });
}

// Load all properties on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded. Initializing property loading...");
    
    // Add demo properties if database is empty
    addDemoProperties()
        .then((added) => {
            console.log("Demo properties check completed. Added:", added);
            // Load properties after a short delay to allow demo data to be inserted
            setTimeout(() => {
                loadProperties();
            }, 1000);
        })
        .catch(error => {
            console.error("Error during demo properties insertion:", error);
            // Still try to load properties even if demo insertion failed
            loadProperties();
        });
    
    // Set up search functionality
    if (searchBtn) {
        searchBtn.addEventListener('click', searchProperties);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                searchProperties();
            }
        });
    }
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
                <p class="mt-2">Loading...</p>
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
                <button class="btn btn-primary mt-3" onclick="loadProperties()">Retry</button>
            </div>
        `;
    }
}

// Show empty state
function showEmptyState(elementId, message, actionText, actionLink) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `
            <div class="text-center py-5">
                <h3>${message}</h3>
                <p class="text-muted">No properties found</p>
                <a href="${actionLink}" class="btn btn-primary">${actionText}</a>
            </div>
        `;
    }
}

// Load all properties from Firestore with improved error handling
function loadProperties() {
    console.log("Loading all properties from Firestore...");
    showLoading('properties-container');
    
    // Check if firebaseDb is available
    if (!window.firebaseDb) {
        console.error("Firebase DB not initialized");
        showError('properties-container', 'Database connection error. Please refresh the page.');
        return;
    }
    
    // Load ALL properties (no filtering)
    firebaseDb.collection('properties')
        .get()
        .then(snapshot => {
            console.log("All properties loaded from Firestore. Count:", snapshot.size);
            if (snapshot.empty) {
                showEmptyState('properties-container', 'No properties found', 'Add Property', 'add-property.html');
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
                propertiesHTML += createPropertyCard(property.id, property);
            });
            
            propertiesContainer.innerHTML = propertiesHTML;
            
            // Add animation delay to cards
            const cards = document.querySelectorAll('.property-card');
            cards.forEach((card, index) => {
                card.style.animationDelay = `${index * 0.1}s`;
            });
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

// Create property card HTML
function createPropertyCard(id, property) {
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
            </div>
        </div>
    `;
}

// Search properties
function searchProperties() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!searchTerm) {
        loadProperties();
        return;
    }
    
    // Show loading state
    showLoading('properties-container');
    
    // Search in Firestore
    firebaseDb.collection('properties')
        .where('searchTerms', 'array-contains', searchTerm)
        .get()
        .then(snapshot => {
            if (snapshot.empty) {
                showEmptyState('properties-container', 'No properties found', 'View All Properties', '#');
                // Add event listener to the link to load all properties
                const container = document.getElementById('properties-container');
                const link = container.querySelector('a');
                if (link) {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        searchInput.value = '';
                        loadProperties();
                    });
                }
                return;
            }
            
            let propertiesHTML = '';
            snapshot.forEach(doc => {
                const property = doc.data();
                propertiesHTML += createPropertyCard(doc.id, property);
            });
            
            propertiesContainer.innerHTML = propertiesHTML;
            
            // Add animation delay to cards
            const cards = document.querySelectorAll('.property-card');
            cards.forEach((card, index) => {
                card.style.animationDelay = `${index * 0.1}s`;
            });
        })
        .catch(error => {
            console.error('Error searching properties:', error);
            
            // Provide more specific error messages
            let errorMessage = 'Error searching properties. Please try again later.';
            if (error.code === 'permission-denied') {
                errorMessage = 'Access denied. You may not have permission to search these properties.';
            } else if (error.code === 'unavailable') {
                errorMessage = 'Database unavailable. Please check your internet connection and try again.';
            }
            
            showError('properties-container', errorMessage);
        });
}