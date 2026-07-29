/**
 * MAIN APP CONTROLLER & ROUTER
 * Handles SPA client hash routing, active sidebar link states, mobile sidebar toggling,
 * authentication protection, and main viewport rendering.
 */

import { AuthService } from './services/authService.js';
import { SettingsService } from './services/settingsService.js';
import { LoginPage } from './pages/login.js';
import { DashboardPage } from './pages/dashboard.js';
import { DistributorPage } from './pages/distributors.js';
import { RetailerPage } from './pages/retailers.js';
import { AgreementPage } from './pages/agreement.js';
import { ReportsPage } from './pages/reports.js';
import { SettingsPage } from './pages/settings.js';

class AppRouter {
    constructor() {
        this.routes = {
            '#login': LoginPage,
            '#dashboard': DashboardPage,
            '#distributors': DistributorPage,
            '#retailers': RetailerPage,
            '#agreement': AgreementPage,
            '#reports': ReportsPage,
            '#settings': SettingsPage
        };

        this.init();
    }

    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        window.addEventListener('DOMContentLoaded', () => this.handleRoute());
        this.bindGlobalEvents();
    }

    bindGlobalEvents() {
        // Sidebar Toggle for Mobile / Desktop Collapsing
        const toggleBtn = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar');
        if (toggleBtn && sidebar) {
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('mobile-open');
            });
        }

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
        let hash = window.location.hash || '#dashboard';
        const routeKey = hash.split('?')[0];

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

        // Update user details in sidebar
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
    }

    ensureShellLayout() {
        // Set user profile info in sidebar
        const user = AuthService.getCurrentUser();
        if (user) {
            const nameEl = document.getElementById('user-profile-name');
            const roleEl = document.getElementById('user-profile-role');
            if (nameEl) nameEl.textContent = user.name || 'Solar Administrator';
            if (roleEl) roleEl.textContent = user.role || 'Administrator';
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
            '#distributors': 'Solar Distributors Management',
            '#retailers': 'Retail Partners Directory',
            '#agreement': 'Legal Agreement Generator',
            '#reports': 'Reports & System Analytics',
            '#settings': 'Organization Settings'
        };

        const breadcrumbEl = document.getElementById('page-title-breadcrumb');
        if (breadcrumbEl) {
            breadcrumbEl.textContent = titles[routeKey] || 'Dashboard';
        }
    }
}

// Initialize application on script load
const app = new AppRouter();
