/**
 * RETAILER MODULE CONTROLLER
 * Retailer CRUD operations, distributor link dropdown, data table filters, and shop details view.
 */

import { RetailerService } from '../services/retailerService.js';
import { DistributorService } from '../services/distributorService.js';
import { Modal } from '../components/modal.js';
import { Toast } from '../components/toast.js';
import { SweetAlert } from '../components/alert.js';

export const RetailerPage = {
    currentSearch: '',
    currentStatusFilter: '',
    currentAreaFilter: '',

    async render(container) {
        const retailers = await RetailerService.getAll();
        const distributors = await DistributorService.getAll();

        // Create distributor map for fast name lookup
        const distributorMap = {};
        distributors.forEach(d => { distributorMap[d.id] = d.companyName || d.distributorName; });

        this.renderView(container, retailers, distributorMap, distributors);
    },

    renderView(container, retailers, distributorMap, distributors) {
        const districts = [...new Set(retailers.map(r => r.district).filter(Boolean))].sort();

        let filtered = retailers.filter(r => {
            const matchesSearch = !this.currentSearch ||
                r.shopName.toLowerCase().includes(this.currentSearch.toLowerCase()) ||
                r.retailerName.toLowerCase().includes(this.currentSearch.toLowerCase()) ||
                r.id.toLowerCase().includes(this.currentSearch.toLowerCase()) ||
                (r.phone && r.phone.includes(this.currentSearch)) ||
                (r.area && r.area.toLowerCase().includes(this.currentSearch.toLowerCase()));

            const matchesStatus = !this.currentStatusFilter || r.status === this.currentStatusFilter;
            const matchesArea = !this.currentAreaFilter || r.district === this.currentAreaFilter;

            return matchesSearch && matchesStatus && matchesArea;
        });

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <svg width="22" height="22" fill="none" stroke="#3b82f6" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                        Solar Retail Shops Directory
                    </h3>
                    <button class="btn btn-primary" id="btn-add-retailer">
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        Add Retailer
                    </button>
                </div>

                <!-- Filter & Search Bar -->
                <div class="table-filter-bar">
                    <div class="search-box">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        <input type="text" id="retailer-search" class="form-control" placeholder="Search by ID, Shop Name, Retailer, Phone, Area..." value="${this.currentSearch}" />
                    </div>

                    <div class="filter-group">
                        <select id="retailer-status-filter" class="form-control" style="width: 150px;">
                            <option value="">All Statuses</option>
                            <option value="Active" ${this.currentStatusFilter === 'Active' ? 'selected' : ''}>Active</option>
                            <option value="Pending" ${this.currentStatusFilter === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Inactive" ${this.currentStatusFilter === 'Inactive' ? 'selected' : ''}>Inactive</option>
                        </select>

                        <select id="retailer-area-filter" class="form-control" style="width: 170px;">
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
                                <th>Retailer ID</th>
                                <th>Shop Name</th>
                                <th>Retailer Name</th>
                                <th>Distributor</th>
                                <th>Phone</th>
                                <th>Area</th>
                                <th>Status</th>
                                <th style="text-align: right;">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.length === 0 ? `
                                <tr>
                                    <td colspan="8" class="empty-state">
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                                        <div>No retail shops found</div>
                                    </td>
                                </tr>
                            ` : ''}
                            ${filtered.map(r => `
                                <tr>
                                    <td><span class="font-bold">${r.id}</span></td>
                                    <td>
                                        <div class="table-cell-title">${r.shopName}</div>
                                        <div class="table-cell-sub">${r.email || ''}</div>
                                    </td>
                                    <td>${r.retailerName}</td>
                                    <td>
                                        <span class="badge badge-active" style="background:#e0f2fe; color:#075985;">
                                            🏢 ${distributorMap[r.distributorId] || r.distributorId || 'Direct'}
                                        </span>
                                    </td>
                                    <td>${r.phone}</td>
                                    <td>${r.area || '-'}</td>
                                    <td>
                                        <span class="badge badge-${r.status ? r.status.toLowerCase() : 'active'}">
                                            <span class="badge-dot"></span>${r.status || 'Active'}
                                        </span>
                                    </td>
                                    <td>
                                        <div class="action-buttons" style="justify-content: flex-end;">
                                            <button class="btn-action btn-view-ret" data-id="${r.id}" title="View Details">
                                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                            </button>
                                            <button class="btn-action btn-edit-ret" data-id="${r.id}" title="Edit Retailer">
                                                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                            </button>
                                            <button class="btn-action btn-delete btn-delete-ret" data-id="${r.id}" title="Delete Record">
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

        this.bindEvents(container, distributors);
    },

    bindEvents(container, distributors) {
        const searchInput = container.querySelector('#retailer-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value;
                this.render(container);
            });
        }

        const statusFilter = container.querySelector('#retailer-status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentStatusFilter = e.target.value;
                this.render(container);
            });
        }

        const areaFilter = container.querySelector('#retailer-area-filter');
        if (areaFilter) {
            areaFilter.addEventListener('change', (e) => {
                this.currentAreaFilter = e.target.value;
                this.render(container);
            });
        }

        const addBtn = container.querySelector('#btn-add-retailer');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openAddEditModal(null, distributors, container));
        }

        container.querySelectorAll('.btn-view-ret').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.dataset.id;
                this.openDetailModal(id);
            });
        });

        container.querySelectorAll('.btn-edit-ret').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                const retailer = await RetailerService.getById(id);
                this.openAddEditModal(retailer, distributors, container);
            });
        });

        container.querySelectorAll('.btn-delete-ret').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.dataset.id;
                const confirmed = await SweetAlert.confirm({
                    title: 'Delete Retailer Shop?',
                    text: `Are you sure you want to delete retailer ${id}?`
                });
                if (confirmed) {
                    await RetailerService.delete(id);
                    Toast.success(`Retailer ${id} deleted successfully.`);
                    this.render(container);
                }
            });
        });
    },

    async openAddEditModal(retailer = null, distributors = [], container = null) {
        const allRetailers = await RetailerService.getAll();
        const autoId = retailer ? retailer.id : RetailerService.generateNextId(allRetailers);
        let photoBase64 = retailer ? (retailer.photo || '') : '';

        const isEdit = !!retailer;
        const formHtml = `
            <form id="retailer-form">
                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Retailer ID (Auto-Generated)</label>
                        <input type="text" id="ret-id" class="form-control" value="${autoId}" readonly />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Shop Name <span class="required">*</span></label>
                        <input type="text" id="ret-shop" class="form-control" value="${retailer ? retailer.shopName : ''}" required />
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Retailer Owner Name <span class="required">*</span></label>
                        <input type="text" id="ret-name" class="form-control" value="${retailer ? retailer.retailerName : ''}" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Linked Distributor <span class="required">*</span></label>
                        <select id="ret-distributor" class="form-control" required>
                            <option value="">Select Parent Distributor</option>
                            ${distributors.map(d => `
                                <option value="${d.id}" ${retailer && retailer.distributorId === d.id ? 'selected' : ''}>
                                    ${d.companyName} (${d.distributorName}) - ${d.district || ''}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Phone Number <span class="required">*</span></label>
                        <input type="tel" id="ret-phone" class="form-control" value="${retailer ? retailer.phone : ''}" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email Address</label>
                        <input type="email" id="ret-email" class="form-control" value="${retailer ? retailer.email || '' : ''}" />
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">State <span class="required">*</span></label>
                        <input type="text" id="ret-state" class="form-control" value="${retailer ? retailer.state || '' : ''}" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label">District <span class="required">*</span></label>
                        <input type="text" id="ret-district" class="form-control" value="${retailer ? retailer.district || '' : ''}" required />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Area / Location <span class="required">*</span></label>
                        <input type="text" id="ret-area" class="form-control" value="${retailer ? retailer.area || '' : ''}" required />
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label class="form-label">Shop Address</label>
                        <input type="text" id="ret-address" class="form-control" value="${retailer ? retailer.address || '' : ''}" />
                    </div>
                    <div class="form-group">
                        <label class="form-label">Status <span class="required">*</span></label>
                        <select id="ret-status" class="form-control">
                            <option value="Active" ${retailer && retailer.status === 'Active' ? 'selected' : ''}>Active</option>
                            <option value="Pending" ${retailer && retailer.status === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Inactive" ${retailer && retailer.status === 'Inactive' ? 'selected' : ''}>Inactive</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Shop / Owner Photo</label>
                    <div class="image-upload-box" id="ret-photo-box">
                        <input type="file" id="ret-photo-input" accept="image/*" style="display:none;" />
                        <div id="ret-photo-preview">
                            ${photoBase64 ? `<img src="${photoBase64}" class="image-preview-thumb" />` : '<div style="font-size: 24px;">📸</div>'}
                        </div>
                        <span style="font-size:12px; color:var(--slate-500);">Click to upload shop front / owner photo</span>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Notes</label>
                    <textarea id="ret-notes" class="form-control" rows="2">${retailer ? retailer.notes || '' : ''}</textarea>
                </div>

                <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 20px;">
                    <button type="button" class="btn btn-secondary" onclick="document.getElementById('global-modal-overlay').click()">Cancel</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Create Retail Shop'}</button>
                </div>
            </form>
        `;

        Modal.show({
            title: isEdit ? `Edit Retail Shop (${retailer.id})` : 'Register New Solar Retail Partner',
            contentHtml: formHtml,
            maxWidth: '680px',
            onOpen: (modalEl) => {
                const photoBox = modalEl.querySelector('#ret-photo-box');
                const photoInput = modalEl.querySelector('#ret-photo-input');
                const photoPreview = modalEl.querySelector('#ret-photo-preview');

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

                const form = modalEl.querySelector('#retailer-form');
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const payload = {
                        shopName: modalEl.querySelector('#ret-shop').value.trim(),
                        retailerName: modalEl.querySelector('#ret-name').value.trim(),
                        distributorId: modalEl.querySelector('#ret-distributor').value,
                        phone: modalEl.querySelector('#ret-phone').value.trim(),
                        email: modalEl.querySelector('#ret-email').value.trim(),
                        state: modalEl.querySelector('#ret-state').value.trim(),
                        district: modalEl.querySelector('#ret-district').value.trim(),
                        area: modalEl.querySelector('#ret-area').value.trim(),
                        address: modalEl.querySelector('#ret-address').value.trim(),
                        status: modalEl.querySelector('#ret-status').value,
                        photo: photoBase64,
                        notes: modalEl.querySelector('#ret-notes').value.trim()
                    };

                    if (isEdit) {
                        await RetailerService.update(retailer.id, payload);
                        Toast.success(`Retailer ${retailer.id} updated successfully!`);
                    } else {
                        await RetailerService.create(payload);
                        Toast.success('New retail shop registered successfully!');
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

    async openDetailModal(id) {
        const retailer = await RetailerService.getById(id);
        let distributorName = 'Direct';
        if (retailer.distributorId) {
            try {
                const dist = await DistributorService.getById(retailer.distributorId);
                distributorName = `${dist.companyName} (${dist.distributorName})`;
            } catch (e) {
                distributorName = retailer.distributorId;
            }
        }

        const detailHtml = `
            <div class="profile-header-card" style="background: linear-gradient(135deg, #1e293b, #1e3a8a);">
                <img src="${retailer.photo || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" fill="%2394a3b8" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>'}" class="profile-avatar-xl" />
                <div class="profile-title-area" style="flex:1;">
                    <h2>${retailer.shopName}</h2>
                    <p style="color: var(--slate-300); font-size: 14px;">Retailer Owner: <strong>${retailer.retailerName}</strong></p>
                    <div class="profile-meta-pills">
                        <span class="meta-pill">🆔 ${retailer.id}</span>
                        <span class="meta-pill">🏢 Linked: ${distributorName}</span>
                        <span class="badge badge-${retailer.status ? retailer.status.toLowerCase() : 'active'}">
                            <span class="badge-dot"></span>${retailer.status || 'Active'}
                        </span>
                    </div>
                </div>
            </div>

            <div class="form-row" style="margin-bottom: 16px;">
                <div class="card" style="padding: 16px;">
                    <h4 style="color: #3b82f6; margin-bottom: 6px; font-size: 14px;">📞 Contact Information</h4>
                    <p style="font-size: 13px;"><strong>Phone:</strong> ${retailer.phone}</p>
                    <p style="font-size: 13px;"><strong>Email:</strong> ${retailer.email || 'N/A'}</p>
                </div>

                <div class="card" style="padding: 16px;">
                    <h4 style="color: #3b82f6; margin-bottom: 6px; font-size: 14px;">📍 Region & District</h4>
                    <p style="font-size: 13px;"><strong>State:</strong> ${retailer.state || '-'}</p>
                    <p style="font-size: 13px;"><strong>District:</strong> ${retailer.district || '-'}</p>
                    <p style="font-size: 13px;"><strong>Area:</strong> ${retailer.area || '-'}</p>
                </div>
            </div>

            <div class="card" style="margin-bottom: 16px; padding: 16px;">
                <h4 style="color: #3b82f6; margin-bottom: 4px; font-size: 14px;">🏠 Full Shop Address</h4>
                <p style="font-size: 13px; color: var(--slate-700);">${retailer.address || 'No address specified'}</p>
            </div>

            ${retailer.notes ? `
                <div class="card" style="margin-bottom: 16px; padding: 16px; background-color: var(--slate-50);">
                    <h4 style="color: var(--slate-800); margin-bottom: 4px; font-size: 13px;">📝 Notes</h4>
                    <p style="font-size: 12.5px; color: var(--slate-600);">${retailer.notes}</p>
                </div>
            ` : ''}

            <div style="display:flex; justify-content: flex-end; margin-top:20px;">
                <button class="btn btn-secondary" onclick="Modal.close()">Close Window</button>
            </div>
        `;

        Modal.show({
            title: `Retail Shop Details Overview`,
            contentHtml: detailHtml,
            maxWidth: '680px'
        });
    }
};
