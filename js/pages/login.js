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

                    const cpCreds = AuthService.getChannelPartnerCreds();

                    container.innerHTML = `
                        <div class="login-body">
                            <div class="login-card">
                                <div class="login-brand">
                                    <img src="assets/logo.jpg" alt="ASM Money Shef Solar Logo" class="login-logo-img" />
                                    <h2 class="login-title">ASM Money Shef Solar</h2>
                                    <p class="login-subtitle">Smart Energy • Safe Future Portal</p>
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
                                                <option value="" disabled selected>-- Select Distributor Account --</option>
                                                ${distributors.map(d => `<option value="${d.id}">${d.companyName} (${d.id}) - ${d.district || ''}</option>`).join('')}
                                            </select>
                                        </div>
                                    ` : ''}

                                    <div class="form-group">
                                        <label class="form-label" id="role-username-label">${this.selectedRole === 'Channel Partner' ? 'Channel Partner Username' : 'Or Enter Distributor ID / Email'}</label>
                                        <input type="text" id="username" class="form-control" placeholder="${this.selectedRole === 'Channel Partner' ? 'Enter Username' : 'e.g. DIS-2026-001'}" value="" required />
                                    </div>

                                    <div class="form-group">
                                        <label class="form-label">Password</label>
                                        <input type="password" id="password" class="form-control" placeholder="Enter Password" value="" required />
                                    </div>

                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <label style="font-size: 12.5px; color: var(--slate-600); cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                <input type="checkbox" checked /> Remember session
                            </label>
                        </div>

                        <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">
                            Sign In as ${this.selectedRole}
                        </button>

                        <div style="margin-top: 20px; text-align: center; font-size: 12px; color: var(--slate-500);">
                            ⚡ ASM Money Shef Solar Network Portal &copy; 2026
                        </div>
                    </form>
                </div>
            </div>
        `;

        const cpBtn = container.querySelector('#role-cp-btn');
        const distBtn = container.querySelector('#role-dist-btn');

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

        const distSelect = container.querySelector('#distributor-account-select');
        const usernameInput = container.querySelector('#username');

        if (distSelect) {
            distSelect.addEventListener('change', () => {
                if (usernameInput && distSelect.value) usernameInput.value = distSelect.value;
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
