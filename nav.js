// Navigation Component
class NavigationComponent {
    constructor() {
        this.isAuthenticated = this.checkAuthStatus();
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    checkAuthStatus() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }

    getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('login.html')) return 'login';
        if (path.includes('video.html')) return 'video';
        if (path.includes('subscription.html')) return 'subscription';
        return 'home';
    }

    init() {
        this.createNavigation();
        this.addEventListeners();
    }

    createNavigation() {
        const navHTML = this.getNavigationHTML();
        const existingNav = document.querySelector('.navbar');
        if (existingNav) {
            existingNav.outerHTML = navHTML;
        } else {
            document.body.insertAdjacentHTML('afterbegin', navHTML);
        }
    }

    getNavigationHTML() {
        const baseNavItems = this.getBaseNavItems();
        const authNavItems = this.getAuthNavItems();
        const navActions = this.getNavActions();

        return `
            <nav class="navbar">
                <div class="nav-container">
                    <div class="nav-brand">
                        <a href="index.html"><h1>Cognis Academy</h1></a>
                    </div>
                    ${baseNavItems}
                    <div class="nav-actions">
                        <button class="theme-toggle" id="themeToggle" aria-label="สลับธีม">
                            <span class="theme-icon">🌙</span>
                        </button>
                        ${navActions}
                        <button class="mobile-menu-toggle" id="mobileMenuToggle">
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                </div>
            </nav>
        `;
    }

    getBaseNavItems() {
        if (this.currentPage === 'login') {
            return `
                <ul class="nav-menu">
                    <li><a href="index.html" class="nav-link">← กลับหน้าแรก</a></li>
                </ul>
            `;
        }

        if (this.currentPage === 'video') {
            if (!this.isAuthenticated) {
                // Redirect to login if not authenticated
                window.location.href = 'login.html';
                return '';
            }
            return `
                <ul class="nav-menu">
                    <li><a href="index.html" class="nav-link">หน้าแรก</a></li>
                    <li><a href="video.html" class="nav-link active">วิดีโอบทเรียน</a></li>
                    <li><a href="subscription.html" class="nav-link">แพ็คเกจ</a></li>
                </ul>
            `;
        }

        if (this.currentPage === 'subscription') {
            return `
                <ul class="nav-menu">
                    <li><a href="index.html" class="nav-link">หน้าแรก</a></li>
                    <li><a href="index.html#about" class="nav-link">เกี่ยวกับ</a></li>
                    <li><a href="index.html#courses" class="nav-link">คอร์สของเรา</a></li>
                    <li><a href="subscription.html" class="nav-link active">แพ็คเกจ</a></li>
                    <li><a href="index.html#contact" class="nav-link">ติดต่อ</a></li>
                </ul>
            `;
        }

        // Home page navigation
        const courseLink = this.isAuthenticated ? 'video.html' : 'login.html';
        return `
            <ul class="nav-menu">
                <li><a href="#home" class="nav-link">หน้าแรก</a></li>
                <li><a href="#about" class="nav-link">เกี่ยวกับ</a></li>
                <li><a href="${courseLink}" class="nav-link">คอร์สของเรา</a></li>
                <li><a href="subscription.html" class="nav-link">แพ็คเกจ</a></li>
                <li><a href="#reviews" class="nav-link">รีวิว</a></li>
                <li><a href="#contact" class="nav-link">ติดต่อ</a></li>
            </ul>
        `;
    }

    getAuthNavItems() {
        if (this.isAuthenticated && this.currentPage === 'video') {
            return `
                <div class="user-menu">
                    <span class="welcome-text">ยินดีต้อนรับ, <strong id="currentUser">${localStorage.getItem('currentUser') || 'User'}</strong></span>
                </div>
            `;
        }
        return '';
    }

    getNavActions() {
        if (this.currentPage === 'login') {
            return '';
        }

        if (this.isAuthenticated) {
            if (this.currentPage === 'video') {
                return `
                    <div class="user-menu">
                        <span class="welcome-text">ยินดีต้อนรับ, <strong id="currentUser">${localStorage.getItem('currentUser') || 'User'}</strong></span>
                        <button id="logoutButton" class="logout-button">ออกจากระบบ</button>
                    </div>
                `;
            } else {
                return `
                    <a href="video.html" class="courses-link">คอร์สของฉัน</a>
                    <button id="logoutButton" class="logout-button">ออกจากระบบ</button>
                `;
            }
        } else {
            return `
                <a href="login.html" class="login-icon" aria-label="เข้าสู่ระบบ">
                    <span class="person-icon">👤</span>
                </a>
            `;
        }
    }

    addEventListeners() {
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }

        // Logout button
        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', () => this.handleLogout());
        }

        // Mobile menu toggle
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const navMenu = document.querySelector('.nav-menu');
        if (mobileMenuToggle && navMenu) {
            mobileMenuToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                mobileMenuToggle.classList.toggle('active');
            });
        }

        // Smooth scrolling for anchor links (home page only)
        if (this.currentPage === 'home') {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    e.preventDefault();
                    const target = document.querySelector(anchor.getAttribute('href'));
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                });
            });
        }

        // Course access control
        this.addCourseAccessControl();
    }

    addCourseAccessControl() {
        // Redirect course links to login if not authenticated
        const courseButtons = document.querySelectorAll('.course-btn, .btn[href*="login"]');
        courseButtons.forEach(button => {
            if (button.getAttribute('href') === 'login.html' && this.isAuthenticated) {
                button.setAttribute('href', 'video.html');
                button.textContent = 'เข้าเรียน';
            }
        });

        // Update navigation course link
        const navCourseLink = document.querySelector('.nav-link[href*="login"], .nav-link[href*="video"]');
        if (navCourseLink) {
            if (this.isAuthenticated) {
                navCourseLink.setAttribute('href', 'video.html');
                navCourseLink.textContent = 'คอร์สของฉัน';
            } else {
                navCourseLink.setAttribute('href', 'login.html');
                navCourseLink.textContent = 'คอร์สของเรา';
            }
        }
    }

    toggleTheme() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        const themeIcon = document.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }
    }

    handleLogout() {
        // Clear authentication data
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        
        // Show confirmation
        const confirmed = confirm('คุณต้องการออกจากระบบหรือไม่?');
        if (confirmed) {
            // Redirect to home page
            window.location.href = 'index.html';
        }
    }

    // Method to update navigation when auth status changes
    updateNavigation() {
        this.isAuthenticated = this.checkAuthStatus();
        this.createNavigation();
        this.addEventListeners();
    }

    // Method to protect video page
    protectVideoPage() {
        if (this.currentPage === 'video' && !this.isAuthenticated) {
            alert('กรุณาเข้าสู่ระบบเพื่อเข้าถึงเนื้อหานี้');
            window.location.href = 'login.html';
        }
    }
}

// Theme initialization
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
}

// Initialize navigation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme first
    initializeTheme();
    
    // Create navigation
    window.nav = new NavigationComponent();
    
    // Protect video page if needed
    window.nav.protectVideoPage();
});

// Listen for storage changes (login/logout from other tabs)
window.addEventListener('storage', (e) => {
    if (e.key === 'isLoggedIn') {
        window.nav.updateNavigation();
    }
});

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationComponent;
}