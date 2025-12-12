// Mobile menu functionality
function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    menu.classList.toggle('active');
}

// Close mobile menu when clicking on links
document.addEventListener('DOMContentLoaded', function() {
    const mobileNavLinks = document.querySelectorAll('.mobile-nav a');
    const mobileMenu = document.getElementById('mobile-menu');
    
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
    });

    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (!mobileMenuBtn.contains(event.target) && !mobileMenu.contains(event.target)) {
            mobileMenu.classList.remove('active');
        }
    });

    // Add scroll effect to header
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
        }
    });

    // Animate statistics on scroll
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statCards = entry.target.querySelectorAll('.stat-card');
                statCards.forEach((card, index) => {
                    setTimeout(() => {
                        card.style.animation = 'fadeInUp 0.6s ease forwards';
                    }, index * 100);
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const statisticsSection = document.querySelector('.statistics');
    if (statisticsSection) {
        observer.observe(statisticsSection);
    }

    // Add fade-in animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .stat-card {
            opacity: 0;
        }
        
        .animate-pulse {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0.5;
            }
        }
    `;
    document.head.appendChild(style);

    // Handle form interactions (if forms are added later)
    const ctaCards = document.querySelectorAll('.cta-card');
    ctaCards.forEach(card => {
        card.addEventListener('click', function() {
            const cardType = this.classList.contains('donor') ? 'donor' : 'patient';
            console.log(`${cardType} registration clicked`);
            // Here you would typically redirect to a registration form or open a modal
        });
    });

    // Add loading states for buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') {
                e.preventDefault();
                
                // Add loading state
                const originalText = this.innerHTML;
                this.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 0.5rem;"></i>Loading...';
                this.disabled = true;
                
                // Simulate loading
                setTimeout(() => {
                    this.innerHTML = originalText;
                    this.disabled = false;
                }, 2000);
            }
        });
    });

    // Social media links functionality
    const socialLinks = document.querySelectorAll('.social-links i');
    socialLinks.forEach(link => {
        link.addEventListener('click', function() {
            const platform = this.classList[1].split('-')[1]; // Get platform name from class
            console.log(`${platform} social link clicked`);
            // Here you would typically open the social media page
        });
    });

    // Emergency contact functionality
    const emergencyInfo = document.querySelector('.emergency-info');
    if (emergencyInfo) {
        emergencyInfo.addEventListener('click', function() {
            // In a real app, this might trigger an emergency call or show emergency contacts
            alert('Emergency contacts:\n911 - Emergency Services\n1-800-BLOOD - Blood Emergency Hotline');
        });
    }

    // Add hover effects for cards
    const cards = document.querySelectorAll('.card, .step-card, .stat-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Initialize any tooltips or additional interactive elements
    initializeInteractiveElements();
});

// Function to initialize additional interactive elements
function initializeInteractiveElements() {
    // Add click tracking for analytics (placeholder)
    const trackableElements = document.querySelectorAll('[data-track]');
    trackableElements.forEach(element => {
        element.addEventListener('click', function() {
            const trackingData = this.getAttribute('data-track');
            console.log('Analytics event:', trackingData);
            // Here you would send data to your analytics service
        });
    });

    // Initialize lazy loading for images if needed
    const images = document.querySelectorAll('img[data-src]');
    if (images.length > 0) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
}

// Utility functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add notification styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        border-left: 4px solid ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
        z-index: 1000;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}

// Add notification animations
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        font-size: 1.25rem;
        cursor: pointer;
        color: #6b7280;
        padding: 0;
        width: 1.5rem;
        height: 1.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .notification-close:hover {
        color: #374151;
    }
`;
document.head.appendChild(notificationStyle);

// Registration functionality
let currentTab = 'donor';

function showRegistrationPage(tab = 'donor') {
    // Hide main content
    const homeContent = document.getElementById('home-content');
    const mainSections = document.querySelectorAll('.hero, .features, .how-it-works, .statistics');
    const registrationSection = document.getElementById('registration-section');
    
    mainSections.forEach(section => {
        section.style.display = 'none';
    });
    if (homeContent) homeContent.style.display = 'none';
    
    // Show registration section
    registrationSection.style.display = 'block';
    
    // Set active tab
    switchTab(tab);
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function showHomePage() {
    // Show main content
    const homeContent = document.getElementById('home-content');
    const mainSections = document.querySelectorAll('.hero, .features, .how-it-works, .statistics');
    const registrationSection = document.getElementById('registration-section');
    
    mainSections.forEach(section => {
        section.style.display = 'block';
    });
    if (homeContent) homeContent.style.display = 'block';
    
    // Hide registration section
    registrationSection.style.display = 'none';
    
    // Hide success message
    document.getElementById('success-message').style.display = 'none';
    
    // Scroll to top
    window.scrollTo(0, 0);
}

function switchTab(tab) {
    // Update current tab
    currentTab = tab;
    
    // Update tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tab) {
            btn.classList.add('active');
        }
    });
    
    // Update tab content
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tab}-form`) {
            content.classList.add('active');
        }
    });
}

// Initialize registration functionality when DOM is loaded
function initializeRegistration() {
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });
    
    // Form submission handling
    const forms = document.querySelectorAll('.registration-form');
    forms.forEach(form => {
        form.addEventListener('submit', handleFormSubmission);
    });
    
    // Medical conditions "None" checkbox logic
    const noneCheckbox = document.querySelector('input[name="medicalConditions"][value="none"]');
    const otherConditions = document.querySelectorAll('input[name="medicalConditions"]:not([value="none"])');
    
    if (noneCheckbox) {
        noneCheckbox.addEventListener('change', function() {
            if (this.checked) {
                otherConditions.forEach(checkbox => {
                    checkbox.checked = false;
                });
            }
        });
        
        otherConditions.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    noneCheckbox.checked = false;
                }
            });
        });
    }
    
    // Real-time form validation
    setupFormValidation();
    
    // Update header register buttons
    updateHeaderButtons();
}

function handleFormSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('.btn-submit');
    const formType = form.closest('.tab-content').id.includes('donor') ? 'donor' : 'patient';
    
    // Validate form
    if (!validateForm(form, formType)) {
        showNotification('Please fill in all required fields and agree to the terms.', 'error');
        return;
    }
    
    // Show loading state
    submitButton.classList.add('loading');
    submitButton.disabled = true;
    submitButton.innerHTML = `
        <i class="fas fa-spinner fa-spin"></i>
        Registering...
    `;
    
    // Simulate form submission
    setTimeout(() => {
        // Hide form and show success message
        document.querySelectorAll('.tab-content').forEach(content => {
            content.style.display = 'none';
        });
        document.querySelector('.tab-navigation').style.display = 'none';
        document.querySelector('.security-notice').style.display = 'none';
        document.getElementById('success-message').style.display = 'block';
        
        // Reset button state (in case user goes back)
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
        submitButton.innerHTML = formType === 'donor' 
            ? '<i class="fas fa-heart"></i> Register as Donor'
            : '<i class="fas fa-building"></i> Register Organization';
        
        // Reset form
        form.reset();
        
        // Show success notification
        showNotification('Registration submitted successfully!', 'success');
    }, 2000);
}

function validateForm(form, formType) {
    let isValid = true;
    
    if (formType === 'donor') {
        // Required fields for donor
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'bloodType', 'weight', 'gender'];
        requiredFields.forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field && (!field.value || (field.type === 'radio' && !form.querySelector(`[name="${fieldName}"]:checked`)))) {
                isValid = false;
                field.style.borderColor = '#ef4444';
            } else if (field) {
                field.style.borderColor = '#d1d5db';
            }
        });
        
        // Check weight minimum
        const weightField = form.querySelector('[name="weight"]');
        if (weightField && weightField.value && parseInt(weightField.value) < 110) {
            isValid = false;
            weightField.style.borderColor = '#ef4444';
            showNotification('Weight must be at least 110 lbs to donate blood.', 'error');
        }
    } else {
        // Required fields for patient/clinic
        const requiredFields = ['organizationType', 'organizationName', 'contactPersonName', 'email', 'phone', 'address'];
        requiredFields.forEach(fieldName => {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (field && !field.value) {
                isValid = false;
                field.style.borderColor = '#ef4444';
            } else if (field) {
                field.style.borderColor = '#d1d5db';
            }
        });
    }
    
    // Check terms agreement
    const termsCheckbox = form.querySelector('[name="agreedToTerms"]');
    const privacyCheckbox = form.querySelector('[name="agreedToPrivacy"]');
    
    if (!termsCheckbox || !termsCheckbox.checked) {
        isValid = false;
        if (termsCheckbox) termsCheckbox.style.outline = '2px solid #ef4444';
    } else if (termsCheckbox) {
        termsCheckbox.style.outline = 'none';
    }
    
    if (!privacyCheckbox || !privacyCheckbox.checked) {
        isValid = false;
        if (privacyCheckbox) privacyCheckbox.style.outline = '2px solid #ef4444';
    } else if (privacyCheckbox) {
        privacyCheckbox.style.outline = 'none';
    }
    
    return isValid;
}

function setupFormValidation() {
    const forms = document.querySelectorAll('.registration-form');
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.hasAttribute('required') && !this.value) {
                    this.style.borderColor = '#ef4444';
                } else {
                    this.style.borderColor = '#d1d5db';
                }
            });
            
            input.addEventListener('input', function() {
                if (this.style.borderColor === 'rgb(239, 68, 68)') {
                    this.style.borderColor = '#d1d5db';
                }
            });
        });
    });
}

function updateHeaderButtons() {
    // Update register buttons in header to show registration page
    const registerButtons = document.querySelectorAll('.header .btn:last-child, .mobile-nav .btn:last-child');
    registerButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            showRegistrationPage('donor');
        });
    });
    
    // Update hero buttons
    const heroButtons = document.querySelectorAll('.hero .btn');
    heroButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const isDonorButton = btn.textContent.includes('Donor');
            showRegistrationPage(isDonorButton ? 'donor' : 'patient');
        });
    });
}

// Add to DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    
    // Initialize registration functionality
    initializeRegistration();
    
    // ... rest of existing code ...
});