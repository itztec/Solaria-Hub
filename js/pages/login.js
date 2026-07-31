/**
 * LOGIN PAGE CONTROLLER
 */

import { AuthService } from '../services/authService.js';
import { DistributorService } from '../services/distributorService.js';
import { Toast } from '../components/toast.js';

export const LoginPage = {
    selectedRole: 'Channel Partner',

    async render(container) {
        const distributors = await DistributorService.getAll();

        container.innerHTML = `
            <div class="login-body">
                <div class="login-card">
                    <div class="login-brand">
                        <div class="login-logo-icon">☀️</div>
                        <h2 class="login-title">Solar Management Portal</h2>
                        <p class="login-subtitle">Channel Partner & Distributor Console</p>
                    </div>

                    <!-- Role Switcher Tabs -->
                    <div style="display: flex; gap: 8px; margin-bottom: 20px; background: var(--slate-100); padding: 4px; border-radius: 8px;">
                        <button type="button" id="role-cp-btn" class="btn ${this.selectedRole === 'Channel Partner' ? 'btn-primary' : 'btn-secondary'}" style="flex: 1; font-size: 13px; padding: 8px;">
                            🏢 Channel Partner
                        </button>
                        <button type="button" id="role-dist-btn" class="btn ${this.selectedRole === 'Distributor' ? 'btn-primary' : 'btn-secondary'}" style="flex: 1; font-size: 13px; padding: 8px;">
                            🚚 Distributor
                        </button>
                    </div>

                    <form id="login-form">
                        ${this.selectedRole === 'Distributor' ? `
                            <div class="form-group">
                                <label class="form-label">Select Registered Distributor Account</label>
                                <select id="distributor-account-select" class="form-control" style="margin-bottom: 12px; font-weight: 600; color: var(--primary-700);">
                                    ${distributors.map(d => `<option value="${d.id}" data-pass="${d.password || 'password123'}">${d.companyName} (${d.id}) - ${d.district || ''}</option>`).join('')}
                                </select>
                            </div>
                        ` : ''}

                        <div class="form-group">
                            <label class="form-label" id="role-username-label">${this.selectedRole === 'Channel Partner' ? 'Channel Partner Username' : 'Or Enter Distributor ID / Username'}</label>
                            <input type="text" id="username" class="form-control" placeholder="${this.selectedRole === 'Channel Partner' ? 'e.g. channelpartner or admin' : 'e.g. DIS-2026-001 or distributor'}" value="${this.selectedRole === 'Channel Partner' ? 'channelpartner' : (distributors[0]?.id || 'DIS-2026-001')}" required />
                        </div>

                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <input type="password" id="password" class="form-control" placeholder="Enter password" value="${this.selectedRole === 'Distributor' && distributors[0]?.password ? distributors[0].password : 'password123'}" required />
                        </div>

                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <label style="font-size: 12.5px; color: var(--slate-600); cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                <input type="checkbox" checked /> Remember session
                            </label>
                            <a href="#" style="font-size: 12.5px;" id="demo-help-link">Demo Info?</a>
                        </div>

                        <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">
                            Sign In as ${this.selectedRole}
                        </button>

                        <div style="margin-top: 20px; text-align: center; font-size: 12px; color: var(--slate-500);">
                            ⚡ Solaria Energy Network Portal &copy; 2026
                        </div>
                    </form>
                </div>
            </div>
        `;

        const cpBtn = container.querySelector('#role-cp-btn');
        const distBtn = container.querySelector('#role-dist-btn');
        const helpLink = container.querySelector('#demo-help-link');

        if (cpBtn) {
            cpBtn.addEventListener('click', () => {
                this.selectedRole = 'Channel Partner';
                this.render(container);
            });
        }

        if (distBtn) {
            distBtn.addEventListener('click', () => {
                this.selectedRole = 'Distributor';
                this.render(container);
            });
        }

        if (helpLink) {
            helpLink.addEventListener('click', (e) => {
                e.preventDefault();
                alert(`Demo Logins:\n\n1. Channel Partner Admin:\n   Username: channelpartner (or admin)\n   Password: password123\n   (Access: Distributors + Customers)\n\n2. Distributor:\n   Username: distributor (or DIS-2026-001)\n   Password: password123\n   (Access: Customer Registrations ONLY)`);
            });
        }

        const distSelect = container.querySelector('#distributor-account-select');
        const usernameInput = container.querySelector('#username');
        const passwordInput = container.querySelector('#password');

        if (distSelect) {
            distSelect.addEventListener('change', () => {
                const selectedOpt = distSelect.options[distSelect.selectedIndex];
                if (usernameInput) usernameInput.value = distSelect.value;
                if (passwordInput && selectedOpt) passwordInput.value = selectedOpt.getAttribute('data-pass') || 'password123';
            });
        }

        const form = container.querySelector('#login-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const u = container.querySelector('#username').value.trim();
                const p = container.querySelector('#password').value.trim();
                const selectedDistId = distSelect ? distSelect.value : null;

                try {
                    const res = await AuthService.login(u, p, this.selectedRole, selectedDistId);
                    if (res.success) {
                        Toast.success(`Logged in as ${res.user.role}! Welcome ${res.user.name || ''}.`);
                        window.location.hash = '#dashboard';
                    }
                } catch (err) {
                    Toast.error(err.message || 'Authentication failed');
                }
            });
        }
    }
};
