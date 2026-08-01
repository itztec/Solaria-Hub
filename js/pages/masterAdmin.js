/**
 * MASTER ADMIN (HIDDEN CONTROL PANEL)
 * Requires Master Passcode authorization to manage Channel Partner credentials,
 * site suspension (Blank Page), and Master Passcode configuration.
 */

import { AuthService } from '../services/authService.js';
import { Toast } from '../components/toast.js';

export const MasterAdminPage = {
    async render(container) {
        if (!AuthService.isMasterAuthenticated()) {
            this.renderMasterAuthGate(container);
            return;
        }

        this.renderMasterPanel(container);
    },

    renderMasterAuthGate(container) {
        container.innerHTML = `
            <div style="max-width: 440px; margin: 60px auto; padding: 0 16px;">
                <div class="card" style="border: 2px solid #0f172a; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3); border-radius: 16px; overflow: hidden;">
                    <div style="background: #0f172a; color: #ffffff; padding: 28px 24px; text-align: center;">
                        <div style="font-size: 42px; margin-bottom: 8px;">🔐</div>
                        <h3 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff;">Master SuperAdmin Security</h3>
                        <p style="font-size: 13px; color: #94a3b8; margin-top: 6px;">Enter Master Security Password to access system controls</p>
                    </div>

                    <div style="padding: 28px 24px;">
                        <form id="master-auth-form">
                            <div class="form-group" style="margin-bottom: 20px;">
                                <label class="form-label" style="font-weight: 600; color: var(--slate-700);">Master Security Password</label>
                                <input type="password" id="master-pass-input" class="form-control" placeholder="Enter Master Password" style="font-size: 15px; padding: 12px;" autofocus required />
                            </div>

                            <button type="submit" class="btn btn-primary" style="width: 100%; padding: 12px; font-weight: 700; font-size: 15px; background: #0f172a; border-color: #0f172a;">
                                🔓 Authenticate & Access Master Panel
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        `;

        const form = container.querySelector('#master-auth-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const pass = container.querySelector('#master-pass-input').value;
                const ok = await AuthService.verifyMasterPassword(pass);
                if (ok) {
                    Toast.show('Master Authentication Successful', 'success');
                    this.render(container);
                } else {
                    Toast.show('Invalid Master Security Password', 'error');
                }
            });
        }
    },

    renderMasterPanel(container) {
        const isLocked = AuthService.isSiteLocked();
        const cpCreds = AuthService.getChannelPartnerCreds();
        const currentMasterPass = AuthService.getMasterPassword();

        container.innerHTML = `
            <div style="max-width: 700px; margin: 30px auto; padding: 0 16px;">
                <div class="card" style="border: 2px solid var(--slate-800); box-shadow: 0 20px 40px rgba(0,0,0,0.15); border-radius: 16px; overflow: hidden;">
                    <div class="card-header" style="background: var(--slate-900); color: #ffffff; padding: 20px 24px;">
                        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                            <div>
                                <h3 class="card-title" style="color: #ffffff; font-size: 20px; display: flex; align-items: center; gap: 10px;">
                                    🛡️ Master SuperAdmin Panel
                                </h3>
                                <p style="font-size: 13px; color: var(--slate-400); margin-top: 4px;">Subscription Control & Credential Overrides</p>
                            </div>
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <span class="badge ${isLocked ? 'badge-inactive' : 'badge-active'}" style="padding: 6px 12px; font-size: 12px;">
                                    ${isLocked ? '🔒 SITE BLANK / SUSPENDED' : '⚡ SITE ONLINE'}
                                </span>
                                <button id="btn-master-logout" class="btn btn-secondary" style="font-size: 12px; padding: 6px 12px; background: rgba(255,255,255,0.1); color: #fff; border: 1px solid rgba(255,255,255,0.2);">
                                    🔒 Lock Panel
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style="padding: 24px;">
                        <!-- Lock Site / Blank Screen Controller -->
                        <div style="background: ${isLocked ? '#fef2f2' : '#f0fdf4'}; border: 1.5px solid ${isLocked ? '#fca5a5' : '#86efac'}; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                            <h4 style="margin: 0 0 8px 0; color: ${isLocked ? '#991b1b' : '#166534'}; display: flex; align-items: center; gap: 8px; font-size: 16px;">
                                ${isLocked ? '🚫 Blank Screen Mode (Subscription Suspended)' : '✅ Site Running Normally'}
                            </h4>
                            <p style="font-size: 13px; color: var(--slate-600); margin-bottom: 16px; line-height: 1.5;">
                                ${isLocked ? 'All clients & distributors see a completely blank maintenance screen. Login is blocked.' : 'When enabled, the entire portal displays a blank page to users.'}
                            </p>
                            
                            <div style="display: flex; gap: 12px;">
                                <button id="btn-toggle-lock" class="btn ${isLocked ? 'btn-primary' : 'btn-danger'}" style="font-size: 14px; padding: 10px 20px; font-weight: 600;">
                                    ${isLocked ? '🔓 Restore Full Site (Turn ON Site)' : '🚫 Make Full Site Blank (Turn OFF Site)'}
                                </button>
                            </div>
                        </div>

                        <!-- Change Channel Partner Credentials -->
                        <div style="border-top: 1px solid var(--slate-200); padding-top: 20px; margin-bottom: 24px;">
                            <h4 style="margin-bottom: 14px; font-size: 16px; color: var(--slate-800); display: flex; align-items: center; gap: 8px;">
                                🔑 Update Channel Partner Login Credentials
                            </h4>
                            <p style="font-size: 13px; color: var(--slate-500); margin-bottom: 16px;">
                                Change the username & password for the main Channel Partner Admin account.
                            </p>

                            <form id="cp-creds-form">
                                <div class="form-group" style="margin-bottom: 16px;">
                                    <label class="form-label">New Channel Partner Username</label>
                                    <input type="text" id="master-new-username" class="form-control" value="${cpCreds.username}" required style="font-weight: 600;" />
                                </div>

                                <div class="form-group" style="margin-bottom: 20px;">
                                    <label class="form-label">New Channel Partner Password</label>
                                    <input type="text" id="master-new-password" class="form-control" value="${cpCreds.password}" required style="font-weight: 600;" />
                                </div>

                                <button type="submit" class="btn btn-primary" style="width: 100%; padding: 10px;">
                                    💾 Save Channel Partner Credentials
                                </button>
                            </form>
                        </div>

                        <!-- Change Master Secret Password -->
                        <div style="border-top: 1px solid var(--slate-200); padding-top: 20px;">
                            <h4 style="margin-bottom: 14px; font-size: 16px; color: var(--slate-800); display: flex; align-items: center; gap: 8px;">
                                🔐 Update Master Security Password (for #master-admin)
                            </h4>
                            <form id="master-pass-form">
                                <div class="form-group" style="margin-bottom: 16px;">
                                    <label class="form-label">Current Master Password: <code>${currentMasterPass}</code></label>
                                    <input type="text" id="new-master-pass-input" class="form-control" placeholder="Enter new Master Password" value="${currentMasterPass}" required style="font-weight: 600;" />
                                </div>

                                <button type="submit" class="btn btn-secondary" style="width: 100%; padding: 10px; font-weight: 600;">
                                    ⚙️ Update Master Access Password
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.bindPanelEvents(container);
    },

    bindPanelEvents(container) {
        const toggleLockBtn = container.querySelector('#btn-toggle-lock');
        const credsForm = container.querySelector('#cp-creds-form');
        const masterPassForm = container.querySelector('#master-pass-form');
        const logoutBtn = container.querySelector('#btn-master-logout');

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                AuthService.masterLogout();
                Toast.show('Master Session Locked', 'info');
                this.render(container);
            });
        }

        if (toggleLockBtn) {
            toggleLockBtn.addEventListener('click', () => {
                const currentStatus = AuthService.isSiteLocked();
                const nextStatus = !currentStatus;
                AuthService.setSiteLock(nextStatus);

                Toast.show(
                    nextStatus ? 'Site is now BLANK & locked!' : 'Site access RESTORED!',
                    nextStatus ? 'warning' : 'success'
                );

                this.render(container);
            });
        }

        if (credsForm) {
            credsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const newU = container.querySelector('#master-new-username').value.trim();
                const newP = container.querySelector('#master-new-password').value.trim();

                if (!newU || !newP) {
                    Toast.show('Username and Password cannot be empty', 'error');
                    return;
                }

                AuthService.setChannelPartnerCreds(newU, newP);
                Toast.show('Channel Partner credentials updated successfully!', 'success');
                this.render(container);
            });
        }

        if (masterPassForm) {
            masterPassForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const newMasterPass = container.querySelector('#new-master-pass-input').value.trim();

                if (!newMasterPass) {
                    Toast.show('Master Password cannot be empty', 'error');
                    return;
                }

                AuthService.setMasterPassword(newMasterPass);
                Toast.show('Master Password updated successfully!', 'success');
                this.render(container);
            });
        }
    }
};
