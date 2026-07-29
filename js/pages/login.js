/**
 * LOGIN PAGE CONTROLLER
 */

import { AuthService } from '../services/authService.js';
import { Toast } from '../components/toast.js';

export const LoginPage = {
    render(container) {
        container.innerHTML = `
            <div class="login-body">
                <div class="login-card">
                    <div class="login-brand">
                        <div class="login-logo-icon">☀️</div>
                        <h2 class="login-title">Solar Operations Portal</h2>
                        <p class="login-subtitle">Distributor & Retailer Management Console</p>
                    </div>

                    <form id="login-form">
                        <div class="form-group">
                            <label class="form-label">Username</label>
                            <input type="text" id="username" class="form-control" placeholder="Enter username (e.g. admin)" value="admin" required />
                        </div>

                        <div class="form-group">
                            <label class="form-label">Password</label>
                            <input type="password" id="password" class="form-control" placeholder="Enter password (e.g. password123)" value="password123" required />
                        </div>

                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                            <label style="font-size: 12.5px; color: var(--slate-600); cursor: pointer; display: flex; align-items: center; gap: 6px;">
                                <input type="checkbox" checked /> Remember session
                            </label>
                            <a href="#" style="font-size: 12.5px;" onclick="alert('Demo Login: Username=admin, Password=password123'); return false;">Help?</a>
                        </div>

                        <button type="submit" class="btn btn-primary btn-lg" style="width: 100%;">
                            Sign In to Dashboard
                        </button>

                        <div style="margin-top: 20px; text-align: center; font-size: 12px; color: var(--slate-500);">
                            ⚡ Solaria Green Energy Systems &copy; 2026
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const u = document.getElementById('username').value.trim();
            const p = document.getElementById('password').value.trim();

            try {
                const res = await AuthService.login(u, p);
                if (res.success) {
                    Toast.success('Login successful! Welcome back.');
                    window.location.hash = '#dashboard';
                }
            } catch (err) {
                Toast.error(err.message || 'Authentication failed');
            }
        });
    }
};
