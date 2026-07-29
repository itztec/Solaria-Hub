/**
 * SETTINGS PAGE CONTROLLER
 * Solar company configuration (Company Name, Logo, Address, Phone, Email, Website)
 * saved in LocalStorage.
 */

import { SettingsService } from '../services/settingsService.js';
import { Toast } from '../components/toast.js';

export const SettingsPage = {
    async render(container) {
        const settings = await SettingsService.getSettings();
        let logoBase64 = settings.logo || '';

        container.innerHTML = `
            <div class="card" style="max-width: 780px; margin: 0 auto;">
                <div class="card-header">
                    <h3 class="card-title">
                        <svg width="22" height="22" fill="none" stroke="var(--primary-600)" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        Solar Organization & System Settings
                    </h3>
                </div>

                <form id="settings-form">
                    <div class="form-group">
                        <label class="form-label">Solar Company Name <span class="required">*</span></label>
                        <input type="text" id="set-name" class="form-control" value="${settings.companyName || ''}" required />
                    </div>

                    <div class="form-group">
                        <label class="form-label">Company Brand Logo</label>
                        <div class="image-upload-box" id="set-logo-box">
                            <input type="file" id="set-logo-input" accept="image/*" style="display:none;" />
                            <div id="set-logo-preview">
                                ${logoBase64 ? `<img src="${logoBase64}" class="image-preview-thumb" style="max-height: 70px; width: auto;" />` : '<div style="font-size:28px;">☀️ Upload Logo</div>'}
                            </div>
                            <span style="font-size:12px; color:var(--slate-500);">Click to upload company logo (SVG / PNG / JPG)</span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Corporate Office Address <span class="required">*</span></label>
                        <textarea id="set-address" class="form-control" rows="2" required>${settings.address || ''}</textarea>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">City</label>
                            <input type="text" id="set-city" class="form-control" value="${settings.city || ''}" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">State</label>
                            <input type="text" id="set-state" class="form-control" value="${settings.state || ''}" />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Pincode</label>
                            <input type="text" id="set-pincode" class="form-control" value="${settings.pincode || ''}" />
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Official Phone <span class="required">*</span></label>
                            <input type="tel" id="set-phone" class="form-control" value="${settings.phone || ''}" required />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Official Email <span class="required">*</span></label>
                            <input type="email" id="set-email" class="form-control" value="${settings.email || ''}" required />
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Official Website URL</label>
                        <input type="url" id="set-website" class="form-control" value="${settings.website || ''}" placeholder="https://www.company.com" />
                    </div>

                    <div style="display: flex; justify-content: flex-end; margin-top: 24px;">
                        <button type="submit" class="btn btn-primary btn-lg">
                            Save Organization Settings
                        </button>
                    </div>
                </form>
            </div>
        `;

        const logoBox = container.querySelector('#set-logo-box');
        const logoInput = container.querySelector('#set-logo-input');
        const logoPreview = container.querySelector('#set-logo-preview');

        logoBox.addEventListener('click', () => logoInput.click());
        logoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    logoBase64 = evt.target.result;
                    logoPreview.innerHTML = `<img src="${logoBase64}" class="image-preview-thumb" style="max-height: 70px; width: auto;" />`;
                };
                reader.readAsDataURL(file);
            }
        });

        const form = container.querySelector('#settings-form');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const updated = {
                companyName: container.querySelector('#set-name').value.trim(),
                logo: logoBase64,
                address: container.querySelector('#set-address').value.trim(),
                city: container.querySelector('#set-city').value.trim(),
                state: container.querySelector('#set-state').value.trim(),
                pincode: container.querySelector('#set-pincode').value.trim(),
                phone: container.querySelector('#set-phone').value.trim(),
                email: container.querySelector('#set-email').value.trim(),
                website: container.querySelector('#set-website').value.trim()
            };

            await SettingsService.updateSettings(updated);
            Toast.success('Company settings updated successfully!');
            
            // Reload page title or header brand if needed
            const brandText = document.querySelector('.sidebar-brand-text');
            if (brandText) {
                brandText.innerHTML = `<span>${updated.companyName.split(' ')[0] || 'Solar'}</span> Hub`;
            }
        });
    }
};
