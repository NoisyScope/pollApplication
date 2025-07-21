// Simple Poll - Main JavaScript functionality

document.addEventListener('DOMContentLoaded', function() {
    
    // Enhanced voting option selection
    const voteForm = document.getElementById('voteForm');
    if (voteForm) {
        const votingOptions = document.querySelectorAll('.voting-option');
        const castVoteBtn = document.getElementById('castVoteBtn');
        const selectedVoteInput = document.getElementById('selectedVote');
        
        votingOptions.forEach(option => {
            option.addEventListener('click', function() {
                const value = this.dataset.value;
                const optionCard = this.querySelector('.option-card');
                
                // Remove selection from all options
                votingOptions.forEach(opt => {
                    opt.querySelector('.option-card').classList.remove('selected');
                    opt.querySelector('.selection-indicator i').classList.add('d-none');
                });
                
                // Select current option
                optionCard.classList.add('selected');
                this.querySelector('.selection-indicator i').classList.remove('d-none');
                
                // Update hidden input and enable vote button
                selectedVoteInput.value = value;
                castVoteBtn.disabled = false;
                castVoteBtn.innerHTML = '<i class="fas fa-vote-yea me-2"></i>Cast Vote';
                
                // Update button text to show selected option
                const optionText = this.querySelector('.option-text').textContent;
                setTimeout(() => {
                    castVoteBtn.innerHTML = `<i class="fas fa-vote-yea me-2"></i>Vote for "${optionText}"`;
                }, 500);
            });
            
            // Add keyboard support
            option.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
            
            // Make options focusable
            option.setAttribute('tabindex', '0');
        });
        
        // Form submission with enhanced feedback
        voteForm.addEventListener('submit', function(e) {
            if (!selectedVoteInput.value) {
                e.preventDefault();
                showAlert('Please select an option before voting!', 'warning');
                return;
            }
            
            // Visual feedback
            castVoteBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Casting Vote...';
            castVoteBtn.disabled = true;
            
            // Add success animation to selected option
            const selectedOption = document.querySelector('.option-card.selected');
            if (selectedOption) {
                selectedOption.classList.add('success-animation');
            }
        });
    }
    
    // Add option form validation and feedback
    const addOptionForms = document.querySelectorAll('form[action="/add_option"]');
    addOptionForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const input = this.querySelector('input[name="new_option"]');
            const value = input.value.trim();
            
            if (value.length < 1) {
                e.preventDefault();
                showAlert('Please enter a valid option', 'warning');
                input.focus();
                return;
            }
            
            if (value.length > 100) {
                e.preventDefault();
                showAlert('Option text is too long (max 100 characters)', 'warning');
                input.focus();
                return;
            }
            
            // Visual feedback
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Adding...';
            submitBtn.disabled = true;
        });
    });
    
    // Smooth animations for progress bars
    const progressBars = document.querySelectorAll('.progress-bar');
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        setTimeout(() => {
            bar.style.transition = 'width 1s ease-in-out';
            bar.style.width = width;
        }, 100);
    });
    
    // Auto-refresh results every 30 seconds (only on voting page)
    if (window.location.pathname === '/' && voteForm) {
        setInterval(() => {
            // Only refresh if user hasn't selected an option
            if (document.visibilityState === 'visible' && !document.querySelector('.option-card.selected')) {
                fetch(window.location.href)
                    .then(response => response.text())
                    .then(html => {
                        const parser = new DOMParser();
                        const newDoc = parser.parseFromString(html, 'text/html');
                        const newResults = newDoc.querySelector('.card:last-of-type .card-body');
                        const currentResults = document.querySelector('.card:last-of-type .card-body');
                        
                        if (newResults && currentResults) {
                            currentResults.innerHTML = newResults.innerHTML;
                            // Re-animate progress bars
                            const progressBars = currentResults.querySelectorAll('.progress-bar');
                            progressBars.forEach(bar => {
                                const width = bar.style.width;
                                bar.style.width = '0%';
                                setTimeout(() => {
                                    bar.style.transition = 'width 0.5s ease-in-out';
                                    bar.style.width = width;
                                }, 50);
                            });
                        }
                    })
                    .catch(console.error);
            }
        }, 30000);
    }
});

// Helper function to show alerts
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.querySelector('.container');
    container.insertBefore(alertDiv, container.firstChild);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 150);
        }
    }, 5000);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Alt + V to go to vote page
    if (e.altKey && e.key === 'v') {
        e.preventDefault();
        window.location.href = '/';
    }
    
    // Alt + M to go to manage page
    if (e.altKey && e.key === 'm') {
        e.preventDefault();
        window.location.href = '/manage';
    }
    
    // Number keys 1-9 to select voting options
    if (window.location.pathname === '/') {
        if (e.key >= '1' && e.key <= '9') {
            const optionIndex = parseInt(e.key) - 1;
            const votingOption = document.querySelector(`[data-value="${optionIndex}"]`);
            if (votingOption) {
                votingOption.click();
            }
        }
        
        // Enter key to cast vote if option is selected
        if (e.key === 'Enter' && document.querySelector('.option-card.selected')) {
            const castVoteBtn = document.getElementById('castVoteBtn');
            if (castVoteBtn && !castVoteBtn.disabled) {
                castVoteBtn.click();
            }
        }
    }
});

// Toggle edit mode for poll options
function toggleEditMode(optionIndex) {
    const viewMode = document.getElementById('view' + optionIndex);
    const editMode = document.getElementById('edit' + optionIndex);
    
    if (viewMode && editMode) {
        if (viewMode.classList.contains('d-none')) {
            // Switch back to view mode
            viewMode.classList.remove('d-none');
            editMode.classList.add('d-none');
        } else {
            // Switch to edit mode
            viewMode.classList.add('d-none');
            editMode.classList.remove('d-none');
            
            // Focus on the name input
            const nameInput = editMode.querySelector('input[name="option_name"]');
            if (nameInput) {
                nameInput.focus();
                nameInput.select();
            }
        }
    }
}

// Make function globally available
window.toggleEditMode = toggleEditMode;