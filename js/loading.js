// Loading Animation Handler

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