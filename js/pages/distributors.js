/**
 * DISTRIBUTOR MODULE CONTROLLER
 * Comprehensive Distributor CRUD, data table filters, detail profile view, and agreement generator integration.
 */

import { DistributorService } from '../services/distributorService.js';
import { CustomerService } from '../services/customerService.js';
import { Modal } from '../components/modal.js';
import { Toast } from '../components/toast.js';
import { SweetAlert } from '../components/alert.js';

export const DistributorPage = {
    currentSearch: '',
    currentStatusFilter: '',
    currentAreaFilter: '',

    async render(container) {
        const distributors = await DistributorService.getAll();
        this.renderView(container, distributors);
    },

    renderView(container, distributors) {
        // Collect distinct areas/districts for the filter dropdown
        const districts = [...new Set(distributors.map(d => d.district).filter(Boolean))].sort();

        // Apply local filtering
        let filtered = distributors.filter(d => {
            const matchesSearch = !this.currentSearch || 
                d.companyName.toLowerCase().includes(this.currentSearch.toLowerCase()) ||
                d.distributorName.toLowerCase().includes(this.currentSearch.toLowerCase()) ||
                d.id.toLowerCase().includes(this.currentSearch.toLowerCase()) ||
                (d.phone && d.phone.includes(this.currentSearch)) ||
                (d.area && d.area.toLowerCase().includes(this.currentSearch.toLowerCase()));

            const matchesStatus = !this.currentStatusFilter || d.status === this.currentStatusFilter;
            const matchesArea = !this.currentAreaFilter || d.district === this.currentAreaFilter;

            return matchesSearch && matchesStatus && matchesArea;
        });

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <svg width="22" height="22" fill="none" stroke="var(--primary-600)" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                        Solar Distributors Directory
                    </h3>
                    <button class="btn btn-primary" id="btn-add-distributor">
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        Add Distributor
                    </button>
                </div>

                <!-- Filters & Search Bar -->
                <div class="table-filter-bar">
                    <div class="search-box">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        <input type="text" id="distributor-search" class="form-control" placeholder="Search by ID, Company, Name, Phone, Area..." value="${this.currentSearch}" />
                    </div>

                    <div class="filter-group">
                        <select id="distributor-status-filter" class="form-control" style="width: 150px;">
                            <option value="">All Statuses</option>
                            <option value="Active" ${this.currentStatusFilter === 'Active' ? 'selected' : ''}>Active</option>
                            <option value="Pending" ${this.currentStatusFilter === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Inactive" ${this.currentStatusFilter === 'Inactive' ? 'selected' : ''}>Inactive</option>
                        </select>

                        <select id="distributor-area-filter" class="form-control" style="width: 170px;">
                            <option value="">All Districts</option>
                            ${districts.map(dist => `<option value="${dist}" ${this.currentAreaFilter === dist ? 'selected' : ''}>${dist}</option>`).join('')}
                        </select>
                    </div>
                </div>

                <!-- Data Table -->
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Company</th>
                                <th>Distributor</th>
                                <th>Phone</th>
                                <th>Area</th>
                                <th>District</th>
                                <th>Status</th>
                                <th style="text-align: right;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.length === 0 ? `
                                <tr>
                                    <td colspan="8" class="empty-state">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                                        <div>No distributors found matching criteria</div>
                                    </td>
                                </tr>
                            ` : ''}
                            ${filtered.map(d => `
                                <tr>
                                    <td><span class="font-bold text-emerald">${d.id}</span></td>
                                    <td>
                                        <div class="table-cell-title">${d.companyName}</div>
                                        <div class="table-cell-sub">${d.email || ''}</div>
                                    </td>
                                    <td>${d.distributorName}</td>
                                    <td>${d.phone}</td>
                                    <td>${d.area || '-'}</td>
                                    <td>${d.district || '-'}</td>
                                    <td>
                                        <span class="badge badge-${d.status ? d.status.toLowerCase() : 'active'}">
                                            <span class="badge-dot"></span>${d.status || 'Active'}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="action-buttons" style="justify-content: flex-end;">
                                            <button class="btn-action btn-view-dis" data-id="${d.id}" title="View Profile & Customers">
                                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                            </button>
                                            <button class="btn-action btn-edit-dis" data-id="${d.id}" title="Edit Record">
                                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                            </button>
                                            <button class="btn-action btn-delete btn-delete-dis" data-id="${d.id}" title="Delete Record">
                                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        this.bindEvents(container);
    },

    bindEvents(container) {
        const searchInput = container.querySelector('#distributor-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value;
                this.render(container);
            });
        }

        const statusFilter = container.querySelector('#distributor-status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentStatusFilter = e.target.value;
                this.render(container);
            });
        }

        const areaFilter = container.querySelector('#distributor-area-filter');
        if (areaFilter) {
            areaFilter.addEventListener('change', (e) => {
                this.currentAreaFilter = e.target.value;
                this.render(container);
            });
        }

        const addBtn = container.querySelector('#btn-add-distributor');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openAddEditModal(null, container));
        }

        // Table actions delegation
        container.querySelectorAll('.btn-view-dis').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.openProfileModal(id);
            });
        });

        container.querySelectorAll('.btn-edit-dis').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                const distributor = await DistributorService.getById(id);
                this.openAddEditModal(distributor, container);
            });
        });

        container.querySelectorAll('.btn-delete-dis').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                const confirmed = await SweetAlert.confirm({
                    title: 'Delete Distributor?',
                    text: `Are you sure you want to delete distributor ${id}? This cannot be undone.`
                });
                if (confirmed) {
                    await DistributorService.delete(id);
                    Toast.success(`Distributor ${id} deleted successfully.`);
                    this.render(container);
                }
            });
        });
    },

    async openAddEditModal(distributor = null, container = null) {
        const allDistributors = await DistributorService.getAll();
        const autoId = distributor ? distributor.id : DistributorService.generateNextId(allDistributors);
        let photoBase64 = distributor ? (distributor.photo || '') : '';
        let pdfBase64 = distributor ? (distributor.pdfDoc || '') : '';

        const isEdit = !!distributor;
        const formHtml = `
            <form id="distributor-form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Distributor ID (Auto-Generated)</label>
                        <input type="text" id="dis-id" class="form-control" value="${autoId}" readonly />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Company Name <span class="required">*</span></label>
                        <input type="text" id="dis-company" class="form-control" value="${distributor ? distributor.companyName : ''}" required />
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Distributor Full Name <span class="required">*</span></label>
                        <input type="text" id="dis-name" class="form-control" value="${distributor ? distributor.distributorName : ''}" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Phone Number <span class="required">*</span></label>
                        <input type="tel" id="dis-phone" class="form-control" value="${distributor ? distributor.phone : ''}" required />
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Alternative Phone</label>
                        <input type="tel" id="dis-altphone" class="form-control" value="${distributor ? distributor.altPhone || '' : ''}" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email Address <span class="required">*</span></label>
                        <input type="email" id="dis-email" class="form-control" value="${distributor ? distributor.email || '' : ''}" required />
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">State <span class="required">*</span></label>
                        <input type="text" id="dis-state" class="form-control" value="${distributor ? distributor.state || '' : ''}" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label">District <span class="required">*</span></label>
                        <input type="text" id="dis-district" class="form-control" value="${distributor ? distributor.district || '' : ''}" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Area / Location <span class="required">*</span></label>
                        <input type="text" id="dis-area" class="form-control" value="${distributor ? distributor.area || '' : ''}" required />
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Pincode</label>
                        <input type="text" id="dis-pincode" class="form-control" value="${distributor ? distributor.pincode || '' : ''}" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Status <span class="required">*</span></label>
                        <select id="dis-status" class="form-control">
                            <option value="Active" ${distributor && distributor.status === 'Active' ? 'selected' : ''}>Active</option>
                            <option value="Pending" ${distributor && distributor.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Inactive" ${distributor && distributor.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                        </select>
                    </div>
                </div>

                <!-- Agreement Date, Duration & End Date Row -->
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Agreement Start Date <span class="required">*</span></label>
                        <input type="date" id="dis-agreedate" class="form-control" value="${distributor ? distributor.agreementDate || '' : new Date().toISOString().split('T')[0]}" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Agreement Duration <span class="required">*</span></label>
                        <div style="position: relative;">
                            <input type="number" id="dis-agree-duration" class="form-control" min="1" max="99" placeholder="e.g. 3" value="${distributor ? distributor.agreementDuration || '' : ''}" required style="padding-right: 52px;" />
                            <span style="position:absolute; right:12px; top:50%; transform:translateY(-50%); color:var(--slate-500); font-size:13px; font-weight:600; pointer-events:none;">Years</span>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Agreement End Date</label>
                        <input type="text" id="dis-agree-enddate" class="form-control" value="${distributor ? distributor.agreementEndDate || '' : ''}" readonly placeholder="Auto-calculated from Start Date + Duration" style="background-color:#f0fdf4; border-color: var(--primary-300); color: var(--primary-700); font-weight: 600;" />
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Full Address</label>
                    <textarea id="dis-address" class="form-control" rows="2">${distributor ? distributor.fullAddress || '' : ''}</textarea>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Distributor Photo Upload</label>
                        <div class="image-upload-box" id="dis-photo-box">
                            <input type="file" id="dis-photo-input" accept="image/*" style="display:none;" />
                            <div id="dis-photo-preview">
                                ${photoBase64 ? `<img src="${photoBase64}" class="image-preview-thumb" />` : '<div style="font-size: 24px;">📷</div>'}
                            </div>
                            <span style="font-size:12px; color:var(--slate-500);">Click to upload profile photo</span>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Agreement Document Upload (PDF/Doc)</label>
                        <div class="image-upload-box" id="dis-pdf-box">
                            <input type="file" id="dis-pdf-input" accept=".pdf,.doc,.docx" style="display:none;" />
                            <div id="dis-pdf-preview">
                                ${pdfBase64 ? `<span class="badge badge-active">📄 Document Uploaded</span>` : '<div style="font-size: 24px;">📄</div>'}
                            </div>
                            <span style="font-size:12px; color:var(--slate-500);">Click to upload signed document</span>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Notes & Special Directives</label>
                    <textarea id="dis-notes" class="form-control" rows="2">${distributor ? distributor.notes || '' : ''}</textarea>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('global-modal-overlay').click()">Cancel</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Create Distributor'}</button>
                </div>
            </form>
        `;

        Modal.show({
            title: isEdit ? `Edit Distributor (${distributor.id})` : 'Register New Solar Distributor',
            contentHtml: formHtml,
            maxWidth: '750px',
            onOpen: (modalEl) => {
                const photoBox = modalEl.querySelector('#dis-photo-box');
                const photoInput = modalEl.querySelector('#dis-photo-input');
                const photoPreview = modalEl.querySelector('#dis-photo-preview');

                photoBox.addEventListener('click', () => photoInput.click());
                photoInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                            photoBase64 = evt.target.result;
                            photoPreview.innerHTML = `<img src="${photoBase64}" class="image-preview-thumb" />`;
                        };
                        reader.readAsDataURL(file);
                    }
                });

                // ─── Agreement End Date Auto-Calculation ───────────────────
                const startDateInput = modalEl.querySelector('#dis-agreedate');
                const durationInput  = modalEl.querySelector('#dis-agree-duration');
                const endDateInput   = modalEl.querySelector('#dis-agree-enddate');

                const calcEndDate = () => {
                    const startVal = startDateInput.value;
                    const durVal   = parseInt(durationInput.value, 10);
                    if (startVal && durVal > 0) {
                        const start = new Date(startVal);
                        start.setFullYear(start.getFullYear() + durVal);
                        // Format as DD-MM-YYYY for readable display
                        const dd   = String(start.getDate()).padStart(2, '0');
                        const mm   = String(start.getMonth() + 1).padStart(2, '0');
                        const yyyy = start.getFullYear();
                        endDateInput.value = `${dd}-${mm}-${yyyy}`;
                    } else {
                        endDateInput.value = '';
                    }
                };

                startDateInput.addEventListener('change', calcEndDate);
                durationInput.addEventListener('input',  calcEndDate);

                // Trigger once on load if editing an existing record that has both values
                if (startDateInput.value && durationInput.value) {
                    calcEndDate();
                }
                // ──────────────────────────────────────────────────────────

                const pdfBox = modalEl.querySelector('#dis-pdf-box');
                const pdfInput = modalEl.querySelector('#dis-pdf-input');
                const pdfPreview = modalEl.querySelector('#dis-pdf-preview');

                pdfBox.addEventListener('click', () => pdfInput.click());
                pdfInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                            pdfBase64 = evt.target.result;
                            pdfPreview.innerHTML = `<span class="badge badge-active">📄 ${file.name}</span>`;
                        };
                        reader.readAsDataURL(file);
                    }
                });

                const form = modalEl.querySelector('#distributor-form');
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const payload = {
                        companyName: modalEl.querySelector('#dis-company').value.trim(),
                        distributorName: modalEl.querySelector('#dis-name').value.trim(),
                        phone: modalEl.querySelector('#dis-phone').value.trim(),
                        altPhone: modalEl.querySelector('#dis-altphone').value.trim(),
                        email: modalEl.querySelector('#dis-email').value.trim(),
                        state: modalEl.querySelector('#dis-state').value.trim(),
                        district: modalEl.querySelector('#dis-district').value.trim(),
                        area: modalEl.querySelector('#dis-area').value.trim(),
                        pincode: modalEl.querySelector('#dis-pincode').value.trim(),
                        agreementDate: modalEl.querySelector('#dis-agreedate').value,
                        agreementDuration: modalEl.querySelector('#dis-agree-duration').value,
                        agreementEndDate: modalEl.querySelector('#dis-agree-enddate').value,
                        status: modalEl.querySelector('#dis-status').value,
                        fullAddress: modalEl.querySelector('#dis-address').value.trim(),
                        photo: photoBase64,
                        pdfDoc: pdfBase64,
                        notes: modalEl.querySelector('#dis-notes').value.trim()
                    };
                    if (isEdit) {
                        await DistributorService.update(distributor.id, payload);
                        Toast.success(`Distributor ${distributor.id} updated successfully!`);
                    } else {
                        const res = await DistributorService.create(payload);
                        Toast.success(`Distributor Registered! ID: ${res.distributor.id} | Password: ${res.distributor.password}`);
                    }

                    Modal.close();
                    if (container) {
                        this.render(container);
                    } else {
                        const mainContent = document.getElementById('main-content-view');
                        if (mainContent) this.render(mainContent);
                    }
                });
            }
        });
    },

    async openProfileModal(id) {
        const distributor = await DistributorService.getById(id);
        const linkedCustomers = await CustomerService.getByDistributor(id);

        const profileHtml = `
            <div class="profile-header-card">
                ${distributor.photo ? `<img src="${distributor.photo}" class="profile-avatar-xl" />` : `<div class="profile-avatar-xl" style="background: rgba(255,255,255,0.2); color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 700; border-radius: 12px; min-width: 64px; height: 64px; border: 2px solid rgba(255,255,255,0.3);">${distributor.companyName ? distributor.companyName.substring(0, 2).toUpperCase() : 'DS'}</div>`}
                <div class="profile-title-area" style="flex:1;">
                    <h2 style="margin: 0; font-size: 20px;">${distributor.companyName}</h2>
                    <p style="color: rgba(255,255,255,0.85); font-size: 13.5px; margin-top: 4px;">Distributor Representative: <strong>${distributor.distributorName}</strong></p>
                    <div class="profile-meta-pills" style="margin-top: 8px;">
                        <span class="meta-pill">🆔 ${distributor.id}</span>
                        <span class="meta-pill">📍 ${distributor.area || ''}, ${distributor.district || ''}</span>
                        <span class="badge badge-${distributor.status ? distributor.status.toLowerCase() : 'active'}">
                            <span class="badge-dot"></span>${distributor.status || 'Active'}
                        </span>
                    </div>
                </div>
            </div>

            <div class="card" style="margin-bottom: 20px; padding: 16px; background: linear-gradient(135deg, #eff6ff, #f0fdf4); border: 1px solid #bfdbfe;">
                <h4 style="color: var(--primary-700); margin-bottom: 10px; font-size: 14px; display: flex; align-items: center; gap: 6px;">
                    <span>🔐 Login Credentials (Auto-Generated)</span>
                </h4>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div style="background: #ffffff; padding: 10px 14px; border-radius: 6px; border: 1px solid #dbeafe;">
                        <strong style="color: var(--slate-500); font-size: 11px; display: block; margin-bottom: 2px; text-transform: uppercase;">Distributor ID / Username</strong>
                        <span style="font-family: monospace; font-size: 15px; font-weight: 700; color: #1d4ed8;">${distributor.id}</span>
                    </div>
                    <div style="background: #ffffff; padding: 10px 14px; border-radius: 6px; border: 1px solid #dbeafe;">
                        <strong style="color: var(--slate-500); font-size: 11px; display: block; margin-bottom: 2px; text-transform: uppercase;">Password</strong>
                        <span style="font-family: monospace; font-size: 15px; font-weight: 700; color: #15803d;">${distributor.password || 'password123'}</span>
                    </div>
                </div>
            </div>

            <div class="form-row" style="margin-bottom: 20px;">
                <div class="card" style="padding: 16px;">
                    <h4 style="color: var(--primary-700); margin-bottom: 8px; font-size: 14px;">📞 Contact Details</h4>
                    <p style="font-size: 13px;"><strong>Phone:</strong> ${distributor.phone}</p>
                    <p style="font-size: 13px;"><strong>Alt Phone:</strong> ${distributor.altPhone || 'N/A'}</p>
                    <p style="font-size: 13px;"><strong>Email:</strong> ${distributor.email || 'N/A'}</p>
                </div>

                <div class="card" style="padding: 16px;">
                    <h4 style="color: var(--primary-700); margin-bottom: 8px; font-size: 14px;">🏠 Location & Details</h4>
                    <p style="font-size: 13px;"><strong>State:</strong> ${distributor.state || '-'}</p>
                    <p style="font-size: 13px;"><strong>Pincode:</strong> ${distributor.pincode || '-'}</p>
                    <p style="font-size: 13px;"><strong>Registration Date:</strong> ${distributor.agreementDate || '-'}</p>
                </div>
            </div>

            <div class="card" style="margin-bottom: 20px; padding: 16px;">
                <h4 style="color: var(--primary-700); margin-bottom: 6px; font-size: 14px;">📍 Full Address</h4>
                <p style="font-size: 13px; color: var(--slate-700);">${distributor.fullAddress || 'No full address specified'}</p>
            </div>

            <div class="card" style="margin-bottom: 20px; padding: 16px;">
                <h4 style="color: var(--primary-700); margin-bottom: 10px; font-size: 14px;">👥 Customer Registrations under this Distributor (${linkedCustomers.length})</h4>
                ${linkedCustomers.length === 0 ? '<p style="font-size: 12.5px; color: var(--slate-500);">No customer registrations linked to this distributor yet.</p>' : `
                    <div class="table-responsive" style="margin-top: 8px;">
                        <table class="data-table" style="font-size: 12.5px;">
                            <thead>
                                <tr>
                                    <th>Customer Name</th>
                                    <th>Phone</th>
                                    <th>System Capacity</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${linkedCustomers.map(c => `
                                    <tr>
                                        <td><strong>${c.customerName}</strong></td>
                                        <td>${c.phone}</td>
                                        <td><span class="badge badge-info">${c.systemSize || '-'}</span></td>
                                        <td><span class="badge badge-${c.status ? c.status.toLowerCase() : 'active'}">${c.status || 'Active'}</span></td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                `}
            </div>

            ${distributor.notes ? `
                <div class="card" style="margin-bottom: 20px; padding: 16px; background-color: var(--slate-50);">
                    <h4 style="color: var(--slate-800); margin-bottom: 4px; font-size: 13px;">📝 Notes</h4>
                    <p style="font-size: 12.5px; color: var(--slate-600);">${distributor.notes}</p>
                </div>
            ` : ''}

            <div style="display:flex; justify-content: space-between; align-items:center; margin-top:20px;">
                <button type="button" class="btn btn-secondary" onclick="window.Modal.close()">Close Profile</button>
                <button type="button" class="btn btn-primary" onclick="window.Modal.close(); window.location.hash='#customers';">
                    View Customer Registrations
                </button>
            </div>
        `;

        Modal.show({
            title: `Distributor Profile Overview`,
            contentHtml: profileHtml,
            maxWidth: '720px'
        });
    }
};
