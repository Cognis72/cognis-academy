// Login Authentication System
class LoginAuth {
    constructor() {
        this.validCredentials = {
            username: 'admin',
            password: '1234'
        };
        this.init();
    }

    init() {
        const currentPage = this.getCurrentPage();
        
        if (currentPage === 'login') {
            this.initLoginPage();
        } else if (currentPage === 'video') {
            this.protectVideoPage();
        }
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('login.html')) return 'login';
        if (path.includes('video.html')) return 'video';
        return 'home';
    }

    initLoginPage() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const username = formData.get('username').trim();
        const password = formData.get('password').trim();
        
        // Show loading state
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'กำลังเข้าสู่ระบบ...';
        submitButton.disabled = true;
        
        // Simulate authentication delay
        await this.delay(1000);
        
        // Validate credentials
        if (this.validateCredentials(username, password)) {
            // Login successful
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', username);
            
            // Redirect to video page
            window.location.href = 'video.html';
        } else {
            // Login failed
            this.showError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
            
            // Reset button
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    }

    validateCredentials(username, password) {
        return username === this.validCredentials.username && 
               password === this.validCredentials.password;
    }

    protectVideoPage() {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
        if (!isLoggedIn) {
            alert('กรุณาเข้าสู่ระบบเพื่อเข้าถึงเนื้อหานี้');
            window.location.href = 'login.html';
        }
    }

    showError(message) {
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                errorElement.style.display = 'none';
            }, 5000);
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Contact Form Handler
class ContactForm {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    handleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(this.form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };
        
        if (this.validateForm(data)) {
            this.showSuccessMessage();
            this.form.reset();
        }
    }

    validateForm(data) {
        const errors = [];
        
        if (!data.name || data.name.trim().length < 2) {
            errors.push('กรุณากรอกชื่อที่ถูกต้อง');
        }
        
        if (!this.isValidEmail(data.email)) {
            errors.push('กรุณากรอกอีเมลที่ถูกต้อง');
        }
        
        if (!data.message || data.message.trim().length < 10) {
            errors.push('กรุณากรอกข้อความอย่างน้อย 10 ตัวอักษร');
        }
        
        if (errors.length > 0) {
            this.showErrorMessage(errors);
            return false;
        }
        
        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    showSuccessMessage() {
        this.showMessage('ส่งข้อความเรียบร้อยแล้ว! เราจะติดต่อกลับโดยเร็วที่สุด', 'success');
    }

    showErrorMessage(errors) {
        this.showMessage(errors.join('<br>'), 'error');
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessage = document.querySelector('.form-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create new message element
        const messageElement = document.createElement('div');
        messageElement.className = `form-message ${type}`;
        messageElement.innerHTML = message;
        
        // Style the message
        messageElement.style.cssText = `
            padding: 1rem;
            margin-bottom: 1rem;
            border-radius: 8px;
            font-weight: 500;
            ${type === 'success' 
                ? 'background-color: #d1fae5; color: #065f46; border: 1px solid #a7f3d0;' 
                : 'background-color: #fee2e2; color: #991b1b; border: 1px solid #fca5a5;'
            }
        `;
        
        // Insert message at the top of the form
        this.form.insertBefore(messageElement, this.form.firstChild);
        
        // Remove message after 5 seconds
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, 5000);
    }
}

// Video Page Management
class VideoManager {
    constructor() {
        this.videos = document.querySelectorAll('.video-card iframe');
        this.init();
    }

    init() {
        if (this.videos.length > 0) {
            this.setupVideoLoading();
            this.handlePageVisibility();
        }
    }

    setupVideoLoading() {
        this.videos.forEach(iframe => {
            iframe.addEventListener('load', () => {
                iframe.style.opacity = '1';
            });
            
            // Set initial opacity for smooth loading
            iframe.style.opacity = '0';
            iframe.style.transition = 'opacity 0.3s ease';
        });
    }

    handlePageVisibility() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.pauseAllVideos();
            }
        });
    }

    pauseAllVideos() {
        this.videos.forEach(iframe => {
            try {
                iframe.contentWindow.postMessage(
                    '{"event":"command","func":"pauseVideo","args":""}',
                    '*'
                );
            } catch (error) {
                // Ignore cross-origin errors
            }
        });
    }
}

// Responsive Handler
class ResponsiveHandler {
    constructor() {
        this.init();
    }

    init() {
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
        window.addEventListener('orientationchange', () => {
            setTimeout(() => this.handleResize(), 100);
        });
    }

    handleResize() {
        // Handle mobile navigation
        const navMenu = document.querySelector('.nav-menu');
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        
        if (window.innerWidth > 768) {
            if (navMenu) navMenu.classList.remove('active');
            if (mobileToggle) mobileToggle.classList.remove('active');
        }
    }
}

// Application Initializer
class App {
    constructor() {
        this.components = [];
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
        } else {
            this.initializeComponents();
        }
    }

    initializeComponents() {
        try {
            // Initialize core components
            this.components.push(new LoginAuth());
            this.components.push(new ContactForm());
            this.components.push(new VideoManager());
            this.components.push(new ResponsiveHandler());
            
            console.log('Cognis Academy system initialized successfully!');
            
        } catch (error) {
            console.error('Error initializing application:', error);
        }
    }
}

// Initialize the application
window.app = new App();

// Export for potential testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { App, LoginAuth, ContactForm, VideoManager };
}