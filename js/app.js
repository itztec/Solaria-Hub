/**
 * MAIN APP CONTROLLER & ROUTER
 * Handles SPA client hash routing, active sidebar link states, mobile sidebar toggling,
 * authentication protection, and main viewport rendering.
 */

import { AuthService } from './services/authService.js';
import { StorageService } from './services/storageService.js';
import { LoginPage } from './pages/login.js';
import { DashboardPage } from './pages/dashboard.js';
import { DistributorPage } from './pages/distributors.js';
import { CustomerPage } from './pages/customers.js';
import { ReportsPage } from './pages/reports.js';

class AppRouter {
    constructor() {
        this.routes = {
            '#login': LoginPage,
            '#dashboard': DashboardPage,
            '#distributors': DistributorPage,
            '#customers': CustomerPage,
            '#customer-add': CustomerPage,
            '#customer-edit': CustomerPage,
            '#customer-docs': CustomerPage,
            '#reports': ReportsPage
        };

        this.init();
    }

    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('DOMContentLoaded', () => this.handleRoute());
        this.bindGlobalEvents();
    }

    closeMobileSidebar() {
        const sidebar = document.getElementById('sidebar');
        const backdrop = document.getElementById('sidebar-backdrop') || document.querySelector('.sidebar-overlay-backdrop');
        if (sidebar) sidebar.classList.remove('mobile-open');
        if (backdrop) backdrop.classList.remove('active');
    }

    bindGlobalEvents() {
        const toggleBtn = document.getElementById('sidebar-toggle');
        const closeBtn = document.getElementById('mobile-close-sidebar-btn');
        const sidebar = document.getElementById('sidebar');
        const backdrop = document.getElementById('sidebar-backdrop');

        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const isOpen = sidebar.classList.toggle('mobile-open');
                if (backdrop) {
                    if (isOpen) backdrop.classList.add('active');
                    else backdrop.classList.remove('active');
                }
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeMobileSidebar());
        }

        if (backdrop) {
            backdrop.addEventListener('click', () => this.closeMobileSidebar());
        }

        // Event delegation for sidebar links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('.sidebar-link');
            if (link && window.innerWidth <= 768) {
                this.closeMobileSidebar();
            }
        });

        // Logout action
        const logoutBtn = document.getElementById('nav-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                AuthService.logout();
            });
        }
    }

    async handleRoute() {
        // Auto-close mobile drawer on route navigation
        this.closeMobileSidebar();

        let hash = window.location.hash || '#dashboard';
        let routeKey = hash.split('?')[0];

        // Auth guard
        const isAuthenticated = AuthService.isAuthenticated();

        if (!isAuthenticated && routeKey !== '#login') {
            window.location.hash = '#login';
            return;
        }

        if (isAuthenticated && routeKey === '#login') {
            window.location.hash = '#dashboard';
            return;
        }

        // Role guard: Distributor cannot access Distributors management
        if (isAuthenticated && AuthService.isDistributor() && routeKey === '#distributors') {
            window.location.hash = '#customers';
            return;
        }

        const loginView = document.getElementById('login-view');
        const appShell = document.getElementById('app-shell');
        const mainContent = document.getElementById('main-content-view');

        if (routeKey === '#login') {
            if (appShell) appShell.style.display = 'none';
            if (loginView) {
                loginView.style.display = 'block';
                LoginPage.render(loginView);
            }
            return;
        }

        // Show main app workspace shell & hide login view
        if (loginView) loginView.style.display = 'none';
        if (appShell) appShell.style.display = 'flex';

        try {
            // Update user details & role-based sidebar visibility
            this.ensureShellLayout();

            // Update active sidebar links
            this.updateSidebarActive(routeKey);

            // Update page title & breadcrumbs
            this.updateHeaderBreadcrumb(routeKey);

            // Render Page View inside main content area
            const pageController = this.routes[routeKey] || DashboardPage;
            if (mainContent) {
                await pageController.render(mainContent);
            }
        } catch (err) {
            console.error('Error rendering page view:', err);
            if (mainContent) {
                mainContent.innerHTML = `
                    <div class="card" style="padding: 32px; text-align: center;">
                        <h3 style="color: #dc2626; margin-bottom: 8px;">⚠️ View Loading Error</h3>
                        <p style="color: var(--slate-600); font-size: 14px;">An error occurred while loading this view: ${err.message || err}</p>
                        <button class="btn btn-primary" style="margin-top: 16px;" onclick="window.location.hash='#dashboard'">Return to Dashboard</button>
                    </div>
                `;
            }
        }
    }

    ensureShellLayout() {
        const user = AuthService.getCurrentUser();
        if (user) {
            const nameEl = document.getElementById('user-profile-name');
            const roleEl = document.getElementById('user-profile-role');
            const avatarEl = document.querySelector('.user-avatar');

            if (user.role === 'Distributor') {
                const distList = StorageService.get(StorageService.KEYS.DISTRIBUTORS) || [];
                const targetId = user.distributorId || user.username;
                const found = distList.find(d => 
                    d.id.toLowerCase() === (targetId || '').toLowerCase() ||
                    d.id.toLowerCase() === (user.username || '').toLowerCase()
                );

                const distName = found ? found.companyName : (user.name && !user.name.startsWith('DIS-') ? user.name : 'GreenGrid Solar Tech');
                const distId = found ? found.id : (user.distributorId || 'DIS-2026-001');

                if (nameEl) nameEl.textContent = distName;
                if (roleEl) roleEl.textContent = `Distributor • ${distId}`;
                if (avatarEl) avatarEl.textContent = distName.substring(0, 2).toUpperCase();
            } else {
                if (nameEl) nameEl.textContent = user.name || 'Channel Partner Admin';
                if (roleEl) roleEl.textContent = 'Channel Partner Console';
                if (avatarEl) avatarEl.textContent = 'CP';
            }
        }

        // Hide/Show Distributors link depending on role
        const disNavItem = document.getElementById('nav-item-distributors');
        if (disNavItem) {
            if (AuthService.isDistributor()) {
                disNavItem.style.display = 'none';
            } else {
                disNavItem.style.display = 'block';
            }
        }
    }

    updateSidebarActive(routeKey) {
        document.querySelectorAll('.sidebar-link').forEach(link => {
            const href = link.getAttribute('href');
            if (href === routeKey) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    updateHeaderBreadcrumb(routeKey) {
        const titles = {
            '#dashboard': 'Dashboard Overview',
            '#distributors': 'Solar Distributors Directory',
            '#customers': 'Customer Registrations',
            '#customer-add': 'Register New Customer',
            '#customer-edit': 'Edit Customer Details',
            '#customer-docs': 'Customer Documents',
            '#reports': 'Reports & System Analytics'
        };

        const breadcrumbEl = document.getElementById('page-title-breadcrumb');
        if (breadcrumbEl) {
            breadcrumbEl.textContent = titles[routeKey] || 'Dashboard';
        }
    }
}

// Initialize application on script load
const app = new AppRouter();
