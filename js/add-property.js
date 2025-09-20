// JavaScript for Add Property Page

// DOM Elements
const propertyForm = document.getElementById('property-form');
const successMessage = document.getElementById('success-message');
const errorMessage = document.getElementById('error-message');

// Default demo image placeholder
const DEFAULT_DEMO_IMAGE = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80';

// Property form submission
if (propertyForm) {
    propertyForm.addEventListener('submit', e => {
        e.preventDefault();
        
        // Hide previous messages
        successMessage.classList.add('d-none');
        errorMessage.classList.add('d-none');
        
        // Get form values
        const title = document.getElementById('property-title').value;
        const price = parseFloat(document.getElementById('property-price').value);
        const location = document.getElementById('property-location').value;
        const description = document.getElementById('property-description').value;
        const contact = document.getElementById('property-contact').value;
        
        // Use default demo image
        const imageUrl = DEFAULT_DEMO_IMAGE;
        
        // Create search terms array for better search functionality
        const searchTerms = [
            title.toLowerCase(),
            location.toLowerCase(),
            ...title.toLowerCase().split(' '),
            ...location.toLowerCase().split(' ')
        ];
        
        // Create property object
        const property = {
            title,
            price,
            location,
            description,
            contact,
            imageUrl,
            searchTerms,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Save to Firestore
        saveProperty(property);
    });
}

// Save property to Firestore
function saveProperty(property) {
    console.log("Saving property to Firestore...");
    
    // Check if firebaseAuth is available
    if (!window.firebaseAuth) {
        console.error("Firebase Auth not initialized");
        showErrorMessage('Authentication error. Please refresh the page.');
        return;
    }
    
    // Check if user is authenticated
    const user = firebaseAuth.currentUser;
    
    if (!user) {
        console.log("User not authenticated");
        showErrorMessage('You must be logged in to add a property');
        return;
    }
    
    console.log("User authenticated:", user.email);
    
    // Check if firebaseDb is available
    if (!window.firebaseDb) {
        console.error("Firebase DB not initialized");
        showErrorMessage('Database connection error. Please refresh the page.');
        return;
    }
    
    // Add user ID to property
    property.userId = user.uid;
    
    // Save to Firestore
    firebaseDb.collection('properties')
        .add(property)
        .then(docRef => {
            console.log('Property added with ID:', docRef.id);
            showSuccessMessage('Property added successfully!');
            propertyForm.reset();
        })
        .catch(error => {
            console.error('Error adding property:', error);
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                code: error.code,
                stack: error.stack
            });
            showErrorMessage(`Error adding property: ${error.message}. Please try again.`);
        });
}

// Show success message
function showSuccessMessage(message) {
    if (successMessage) {
        successMessage.textContent = message;
        successMessage.classList.remove('d-none');
    }
}

// Show error message
function showErrorMessage(message) {
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('d-none');
    }
}