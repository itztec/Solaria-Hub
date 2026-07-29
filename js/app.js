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

        const appContainer = document.getElementById('app');
        const sidebar = document.getElementById('sidebar');
        const topbar = document.getElementById('topbar');
        const mainContent = document.getElementById('main-content-view');

        if (routeKey === '#login') {
            if (sidebar) sidebar.style.display = 'none';
            if (topbar) topbar.style.display = 'none';
            if (mainContent) mainContent.style.padding = '0';
            LoginPage.render(appContainer);
            return;
        }

        // Ensure App Shell Layout is visible
        this.ensureShellLayout();

        // Update active sidebar links
        this.updateSidebarActive(routeKey);

        // Update page title & breadcrumbs
        this.updateHeaderBreadcrumb(routeKey);

        // Render Page View
        const pageController = this.routes[routeKey] || DashboardPage;
        await pageController.render(document.getElementById('main-content-view'));
    }

    ensureShellLayout() {
        const sidebar = document.getElementById('sidebar');
        const topbar = document.getElementById('topbar');
        const mainContent = document.getElementById('main-content-view');

        if (sidebar) sidebar.style.display = 'flex';
        if (topbar) topbar.style.display = 'flex';
        if (mainContent) mainContent.style.padding = '28px';

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
