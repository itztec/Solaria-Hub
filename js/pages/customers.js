/**
 * CUSTOMER REGISTRATION PAGE CONTROLLER
 * Customer directory, CRUD modals, distributor filtering, role-based controls.
 */

import { CustomerService } from '../services/customerService.js';
import { DistributorService } from '../services/distributorService.js';
import { AuthService } from '../services/authService.js';
import { Modal } from '../components/modal.js';
import { Toast } from '../components/toast.js';
import { SweetAlert } from '../components/alert.js';

export const CustomerPage = {
    currentSearch: '',
    currentStatusFilter: '',
    currentDistributorFilter: '',

    setDistributorFilter(distId) {
        this.currentDistributorFilter = distId;
        const mainContent = document.getElementById('main-content-view');
        if (mainContent) {
            this.render(mainContent);
        }
    },

    async render(container) {
        const hash = window.location.hash || '#customers';
        const routeKey = hash.split('?')[0];
        const searchParams = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
        const customerId = searchParams.get('id');

        if (routeKey === '#customer-add') {
            await this.renderAddEditPageView(container, null);
            return;
        }

        if (routeKey === '#customer-edit') {
            await this.renderAddEditPageView(container, customerId);
            return;
        }

        if (routeKey === '#customer-docs') {
            await this.renderDocsPageView(container, customerId);
            return;
        }

        const currentUser = AuthService.getCurrentUser();
        const isDistributor = AuthService.isDistributor();

        let customers = await CustomerService.getAll();
        const distributors = await DistributorService.getAll();

        if (isDistributor && currentUser && currentUser.distributorId) {
            customers = customers.filter(c => c.distributorId === currentUser.distributorId);
            this.currentDistributorFilter = currentUser.distributorId;
        }

        this.renderView(container, customers, distributors, isDistributor);
    },

    renderView(container, customers, distributors, isDistributor) {
        const distCounts = {};
        customers.forEach(c => {
            if (c.distributorId) {
                distCounts[c.distributorId] = (distCounts[c.distributorId] || 0) + 1;
            }
        });

        let filtered = customers.filter(c => {
            const matchesSearch = !this.currentSearch ||
                c.customerName.toLowerCase().includes(this.currentSearch.toLowerCase()) ||
                c.id.toLowerCase().includes(this.currentSearch.toLowerCase()) ||
                (c.phone && c.phone.includes(this.currentSearch)) ||
                (c.systemSize && c.systemSize.toLowerCase().includes(this.currentSearch.toLowerCase())) ||
                (c.distributorName && c.distributorName.toLowerCase().includes(this.currentSearch.toLowerCase()));

            const matchesStatus = !this.currentStatusFilter || c.status === this.currentStatusFilter;
            const matchesDistributor = !this.currentDistributorFilter || c.distributorId === this.currentDistributorFilter;

            return matchesSearch && matchesStatus && matchesDistributor;
        });

        container.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        <svg width="22" height="22" fill="none" stroke="#3b82f6" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        ${isDistributor ? 'My Customer Registrations' : 'All Customer Registrations'}
                    </h3>
                    <button class="btn btn-primary" onclick="window.location.hash='#customer-add'">
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        Register New Customer
                    </button>
                </div>

                <!-- Filters & Search Bar -->
                <div class="table-filter-bar">
                    <div class="search-box">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        <input type="text" id="customer-search" class="form-control" placeholder="Search by Customer Name, ID, Phone, Solar System..." value="${this.currentSearch}" />
                    </div>

                    <div class="filter-group">
                        <select id="customer-status-filter" class="form-control" style="width: 150px;">
                            <option value="">All Statuses</option>
                            <option value="Active" ${this.currentStatusFilter === 'Active' ? 'selected' : ''}>Active</option>
                            <option value="Pending" ${this.currentStatusFilter === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Inactive" ${this.currentStatusFilter === 'Inactive' ? 'selected' : ''}>Inactive</option>
                        </select>

                        ${!isDistributor ? `
                            <select id="customer-distributor-filter" class="form-control" style="min-width: 250px; font-weight: 600;">
                                <option value="">All Distributors (${customers.length} Total Customers)</option>
                                ${distributors.map(d => {
                                    const count = distCounts[d.id] || 0;
                                    return `<option value="${d.id}" ${this.currentDistributorFilter === d.id ? 'selected' : ''}>${d.companyName} (${count} Customer${count !== 1 ? 's' : ''})</option>`;
                                }).join('')}
                            </select>
                        ` : ''}
                    </div>
                </div>

                ${!isDistributor ? `
                    <!-- Distributor Customer Summary Pill Filter Bar -->
                    <div style="display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 20px 0; padding: 12px 16px; background: #f8fafc; border: 1px solid var(--slate-200); border-radius: 10px; align-items: center;">
                        <span style="font-size: 13px; font-weight: 700; color: var(--slate-700); margin-right: 4px; display: flex; align-items: center; gap: 6px;">
                            <span>📊 Filter by Distributor:</span>
                        </span>
                        <button type="button" class="btn" style="padding: 5px 12px; font-size: 12.5px; font-weight: 600; border-radius: 999px; border: 1px solid ${!this.currentDistributorFilter ? '#3b82f6' : 'var(--slate-300)'}; background: ${!this.currentDistributorFilter ? '#eff6ff' : '#ffffff'}; color: ${!this.currentDistributorFilter ? '#1d4ed8' : 'var(--slate-600)'}; cursor: pointer;" onclick="window.CustomerPage.setDistributorFilter('')">
                            All (${customers.length})
                        </button>
                        ${distributors.map(d => {
                            const count = distCounts[d.id] || 0;
                            const isSelected = this.currentDistributorFilter === d.id;
                            return `
                                <button type="button" class="btn" style="padding: 5px 12px; font-size: 12.5px; font-weight: 600; border-radius: 999px; border: 1px solid ${isSelected ? '#3b82f6' : 'var(--slate-300)'}; background: ${isSelected ? '#eff6ff' : '#ffffff'}; color: ${isSelected ? '#1d4ed8' : 'var(--slate-700)'}; cursor: pointer;" onclick="window.CustomerPage.setDistributorFilter('${d.id}')">
                                    ${d.companyName}: <strong style="color: ${count > 0 ? '#15803d' : '#94a3b8'}; margin-left: 2px;">${count}</strong>
                                </button>
                            `;
                        }).join('')}
                    </div>
                ` : ''}

                <!-- Customer Cards List View -->
                <div class="customer-card-list">
                    ${filtered.length === 0 ? `
                        <div class="card" style="padding: 32px; text-align: center;">
                            <svg width="48" height="48" fill="none" stroke="var(--slate-400)" viewBox="0 0 24 24" style="margin: 0 auto 12px auto; display: block;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/></svg>
                            <div style="font-weight: 600; font-size: 16px; color: var(--slate-700);">No customer registrations found matching criteria</div>
                        </div>
                    ` : ''}

                    ${filtered.map(c => {
                        const dist = distributors.find(d => d.id === c.distributorId);
                        const hasDistributor = !!c.distributorId && c.distributorId !== 'none';
                        const distName = dist ? dist.companyName : (c.distributorName && c.distributorName !== 'Direct Customer' ? c.distributorName : '');
                        const distBadgeText = hasDistributor ? `🏪 ${distName || 'Distributor'} (${c.distributorId})` : `👤 Direct Registration (No Distributor)`;
                        const distBadgeStyle = hasDistributor ? `background-color: #f3e8ff; border-color: #d8b4fe; color: #6b21a8;` : `background-color: #f1f5f9; border-color: #cbd5e1; color: #475569;`;
                        const formattedDate = c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '31 Jul 2026';
                        const isPending = c.status === 'Pending';

                        return `
                            <div class="customer-card">
                                <div class="cust-card-header">
                                    <div class="cust-info-main">
                                        <h3 class="cust-name">${c.customerName}</h3>
                                        <div class="cust-contact">
                                            <span>📞 ${c.phone}</span>
                                            <a href="https://wa.me/91${c.phone ? c.phone.replace(/[^0-9]/g, '') : ''}" target="_blank" class="whatsapp-link" title="Chat on WhatsApp">💬</a>
                                        </div>
                                        <div class="cust-location">📍 ${c.address || c.city || c.district || 'Kalinagarhat'}</div>
                                    </div>

                                    <div class="cust-card-meta">
                                        <span class="badge ${isPending ? 'badge-amber-pill' : 'badge-green-pill'}">${isPending ? 'Pending' : 'New'}</span>
                                        <div class="cust-date">${formattedDate}</div>
                                    </div>
                                </div>

                                <div class="cust-system-banner">
                                    ⚡ ${c.systemSize || '3 KW'}
                                </div>

                                <div class="cust-tags-row">
                                    <span class="cust-tag" style="${distBadgeStyle}">${distBadgeText}</span>
                                    <span class="cust-tag"># CA: ${c.caNumber || '105108237'}</span>
                                    <span class="cust-tag">⚡ S.Load: ${c.sanctionLoad || '3 KW'}</span>
                                    <span class="cust-tag ${c.bankLoan === 'Yes' ? 'tag-loan-yes' : ''}">🏦 Loan: ${c.bankLoan || 'Yes'}</span>
                                    <span class="cust-tag">₹ ₹${c.projectCost ? parseInt(c.projectCost).toLocaleString('en-IN') : '180,000'}</span>
                                    <span class="cust-tag">🔌 ${c.discomName || c.connectionType || 'PUNB0158720'}</span>
                                </div>

                                <div class="cust-card-actions">
                                    <button class="btn-cust-action btn-save-gps" onclick="window.CustomerPage.handleSaveGPS('${c.id}')">
                                        📍 Save GPS
                                    </button>
                                    <button class="btn-cust-action btn-upload-doc" onclick="window.location.hash='#customer-docs?id=${c.id}'">
                                        📤 Upload Doc
                                    </button>
                                    <button class="btn-cust-action btn-edit-cust" onclick="window.location.hash='#customer-edit?id=${c.id}'">
                                        📝 Edit
                                    </button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        window.CustomerPage = this;
        this.bindEvents(container);
    },

    async renderAddEditPageView(container, id = null) {
        const currentUser = AuthService.getCurrentUser();
        const isDistributor = AuthService.isDistributor();
        const distributors = await DistributorService.getAll();

        let customer = null;
        if (id) {
            try {
                customer = await CustomerService.getById(id);
            } catch (err) {
                Toast.error('Customer record not found');
                window.location.hash = '#customers';
                return;
            }
        }

        const isEdit = !!customer;
        const defaultDistId = customer ? customer.distributorId : (isDistributor && currentUser ? currentUser.distributorId : (distributors[0]?.id || ''));
        const districts = ['Pune', 'Bengaluru Urban', 'Hyderabad', 'South Delhi', 'Kolkata', 'Mumbai Suburban', 'Chennai', 'Gautam Buddha Nagar (Noida)', 'Gurugram', 'Ahmedabad', 'Jaipur', 'Lucknow', 'North 24 Parganas', 'South 24 Parganas'];
        const selectedDistrict = customer ? (customer.district || customer.city || '') : '';

        container.innerHTML = `
            <div class="card" style="max-width: 900px; margin: 0 auto;">
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--slate-200); padding-bottom: 16px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <button class="btn btn-secondary" onclick="window.location.hash='#customers'">
                            ← Back to Customer Registrations
                        </button>
                        <h3 class="card-title" style="margin: 0; font-size: 18px;">
                            ${isEdit ? `Edit Customer Details (${customer.id})` : 'Register New Customer'}
                        </h3>
                    </div>
                    <span class="badge badge-info" style="font-size: 13px;">${isEdit ? 'Update Mode' : 'New Registration'}</span>
                </div>

                <form id="customer-page-form" style="margin-top: 20px;">
                    <!-- Section 1: Personal Info -->
                    <div style="font-weight: 700; font-size: 14px; color: var(--primary-700); margin-bottom: 12px; border-bottom: 1px solid var(--slate-200); padding-bottom: 6px;">
                        👤 Personal Information
                    </div>

                    <div class="form-grid">
                        <div class="form-group span-2">
                            <label class="form-label required">Full Name</label>
                            <input type="text" id="cust-name" class="form-control" value="${customer ? customer.customerName || '' : ''}" placeholder="Enter full name" required />
                        </div>

                        <div class="form-group">
                            <label class="form-label required">Mobile Number</label>
                            <div style="display: flex; align-items: center; gap: 6px;">
                                <span style="padding: 9px 12px; background: var(--slate-100); border: 1px solid var(--slate-300); border-radius: 6px; font-weight: 600; font-size: 13.5px; color: var(--slate-700);">+91</span>
                                <input type="tel" id="cust-phone" class="form-control" value="${customer ? customer.phone || '' : ''}" placeholder="Enter 10-digit mobile number" required maxlength="10" />
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Email Address</label>
                            <input type="email" id="cust-email" class="form-control" value="${customer ? customer.email || '' : ''}" placeholder="Enter email address (optional)" />
                        </div>
                    </div>

                    <!-- Section 2: Billing Address -->
                    <div style="font-weight: 700; font-size: 14px; color: var(--primary-700); margin-top: 20px; margin-bottom: 12px; border-bottom: 1px solid var(--slate-200); padding-bottom: 6px;">
                        🏠 Billing Address
                    </div>

                    <div class="form-grid">
                        <div class="form-group span-2">
                            <label class="form-label required">Address</label>
                            <input type="text" id="cust-address" class="form-control" value="${customer ? customer.address || '' : ''}" placeholder="Enter complete address" required />
                        </div>

                        <div class="form-group">
                            <label class="form-label required">Pin Code</label>
                            <input type="text" id="cust-pincode" class="form-control" value="${customer ? customer.pincode || '' : ''}" placeholder="Enter 6-digit pincode" required maxlength="6" />
                        </div>

                        <div class="form-group">
                            <label class="form-label required">District</label>
                            <select id="cust-district" class="form-control" required>
                                <option value="">Select District</option>
                                ${districts.map(d => `<option value="${d}" ${d === selectedDistrict ? 'selected' : ''}>${d}</option>`).join('')}
                                ${selectedDistrict && !districts.includes(selectedDistrict) ? `<option value="${selectedDistrict}" selected>${selectedDistrict}</option>` : ''}
                            </select>
                        </div>
                    </div>

                    <!-- Section 3: Solar & Technical Details -->
                    <div style="font-weight: 700; font-size: 14px; color: var(--primary-700); margin-top: 20px; margin-bottom: 12px; border-bottom: 1px solid var(--slate-200); padding-bottom: 6px;">
                        ⚡ Solar & Technical Details
                    </div>

                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label required">Solar Requirement</label>
                            <input type="text" id="cust-system-size" class="form-control" value="${customer ? customer.systemSize || '' : ''}" placeholder="4kw, 3kw solar system" required />
                        </div>

                        <div class="form-group">
                            <label class="form-label">Lead Source</label>
                            <input type="text" id="cust-lead-source" class="form-control" value="${customer ? customer.leadSource || '' : ''}" placeholder="How did you hear about us?" />
                        </div>

                        <div class="form-group">
                            <label class="form-label">CA No (Connection Number)</label>
                            <input type="text" id="cust-ca-no" class="form-control" value="${customer ? customer.caNumber || '' : ''}" placeholder="Enter CA / Connection Number" />
                        </div>

                        <div class="form-group">
                            <label class="form-label">Sanction Load (kW)</label>
                            <input type="text" id="cust-sanction-load" class="form-control" value="${customer ? customer.sanctionLoad || '' : ''}" placeholder="e.g. 5kW" />
                        </div>

                        <div class="form-group">
                            <label class="form-label">Bank Loan</label>
                            <select id="cust-bank-loan" class="form-control">
                                <option value="No" ${customer && customer.bankLoan === 'Yes' ? '' : 'selected'}>No</option>
                                <option value="Yes" ${customer && customer.bankLoan === 'Yes' ? 'selected' : ''}>Yes</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Project Cost (₹)</label>
                            <input type="number" id="cust-project-cost" class="form-control" value="${customer ? customer.projectCost || '0' : '0'}" placeholder="0" min="0" />
                        </div>

                        <div class="form-group">
                            <label class="form-label">Distribution Company Name</label>
                            <input type="text" id="cust-discom" class="form-control" value="${customer ? customer.discomName || '' : ''}" placeholder="Enter distribution company name" />
                        </div>

                        <div class="form-group">
                            <label class="form-label">Connection Type</label>
                            <select id="cust-connection-type" class="form-control">
                                <option value="">Select Connection Type</option>
                                <option value="Single Phase" ${customer && customer.connectionType === 'Single Phase' ? 'selected' : ''}>Single Phase</option>
                                <option value="Three Phase" ${customer && customer.connectionType === 'Three Phase' ? 'selected' : ''}>Three Phase</option>
                            </select>
                        </div>
                    </div>

                    <!-- Section 4: Partner Assignment -->
                    <div style="font-weight: 700; font-size: 14px; color: var(--primary-700); margin-top: 20px; margin-bottom: 12px; border-bottom: 1px solid var(--slate-200); padding-bottom: 6px;">
                        📋 Partner Assignment
                    </div>

                    <div class="form-grid">
                        <div class="form-group span-2">
                            <label class="form-label required">Assigned Solar Distributor</label>
                            ${isDistributor ? `
                                <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px 16px; display: flex; align-items: center; justify-content: space-between;">
                                    <div>
                                        <div style="font-weight: 700; font-size: 14.5px; color: #15803d;">
                                            ${currentUser.name || 'Your Distributor Account'}
                                        </div>
                                        <div style="font-size: 12.5px; color: #166534; margin-top: 2px;">
                                            Auto-Assigned ID: <strong>${defaultDistId}</strong>
                                        </div>
                                    </div>
                                    <span class="badge badge-active">Auto Linked</span>
                                </div>
                                <input type="hidden" id="cust-distributor" value="${defaultDistId}" />
                            ` : `
                                <select id="cust-distributor" class="form-control">
                                    <option value="none" ${!defaultDistId || defaultDistId === 'none' ? 'selected' : ''}>🚫 None (Direct Registration / No Distributor)</option>
                                    ${distributors.map(d => `
                                        <option value="${d.id}" ${d.id === defaultDistId ? 'selected' : ''}>
                                            ${d.companyName} (${d.id}) - ${d.district || d.area || ''}
                                        </option>
                                    `).join('')}
                                </select>
                            `}
                        </div>
                    </div>

                    <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 28px; padding-top: 16px; border-top: 1px solid var(--slate-200);">
                        <button type="button" class="btn btn-secondary" onclick="window.location.hash='#customers'">Cancel</button>
                        <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Register Customer'}</button>
                    </div>
                </form>
            </div>
        `;

        const form = document.getElementById('customer-page-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                let selectedDistId = '';
                const distSelect = form.querySelector('#cust-distributor');
                if (distSelect) {
                    selectedDistId = distSelect.value;
                } else {
                    selectedDistId = defaultDistId;
                }

                const isNone = !selectedDistId || selectedDistId === 'none' || selectedDistId === 'None';
                const distObj = isNone ? null : distributors.find(d => d.id === selectedDistId);

                const data = {
                    customerName: form.querySelector('#cust-name').value.trim(),
                    phone: form.querySelector('#cust-phone').value.trim(),
                    email: form.querySelector('#cust-email').value.trim(),
                    address: form.querySelector('#cust-address').value.trim(),
                    pincode: form.querySelector('#cust-pincode').value.trim(),
                    district: form.querySelector('#cust-district').value,
                    city: form.querySelector('#cust-district').value,
                    systemSize: form.querySelector('#cust-system-size').value.trim(),
                    leadSource: form.querySelector('#cust-lead-source').value.trim(),
                    caNumber: form.querySelector('#cust-ca-no').value.trim(),
                    sanctionLoad: form.querySelector('#cust-sanction-load').value.trim(),
                    bankLoan: form.querySelector('#cust-bank-loan').value,
                    projectCost: form.querySelector('#cust-project-cost').value || '0',
                    discomName: form.querySelector('#cust-discom').value.trim(),
                    connectionType: form.querySelector('#cust-connection-type').value,
                    distributorId: isNone ? '' : selectedDistId,
                    distributorName: isNone ? 'Direct Customer' : (distObj ? distObj.companyName : ''),
                    status: customer ? (customer.status || 'Active') : 'Active'
                };

                try {
                    if (isEdit) {
                        await CustomerService.update(id, data);
                        Toast.success('Customer details updated successfully');
                    } else {
                        await CustomerService.create(data);
                        Toast.success('Customer registered successfully');
                    }
                    window.location.hash = '#customers';
                } catch (err) {
                    Toast.error(err.message || 'Operation failed');
                }
            });
        }
    },

    async renderDocsPageView(container, id) {
        if (!id) {
            Toast.error('No customer selected');
            window.location.hash = '#customers';
            return;
        }

        try {
            const customer = await CustomerService.getById(id);
            const docs = customer.documents || {};

            const categories = [
                { id: 'aadhar_front', label: 'Aadhaar Front', icon: '💳', color: '#4f46e5' },
                { id: 'aadhar_back', label: 'Aadhaar Back', icon: '💳', color: '#7c3aed' },
                { id: 'pan_card', label: 'PAN Card', icon: '💳', color: '#d97706' },
                { id: 'bank_passbook', label: 'Bank Passbook', icon: '🏦', color: '#0d9488' },
                { id: 'electricity_bill', label: 'Electricity Bill', icon: '🧾', color: '#dc2626' },
                { id: 'property_doc', label: 'Property Document', icon: '🏠', color: '#0284c7' },
                { id: 'income_doc', label: 'Income Doc', icon: '📄', color: '#059669' },
                { id: 'site_gps_photo', label: 'Site GPS Photo', icon: '📍', color: '#ea580c' }
            ];

            container.innerHTML = `
                <div class="card">
                    <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--slate-200); padding-bottom: 16px; flex-wrap: wrap; gap: 12px;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <button class="btn btn-secondary" onclick="window.location.hash='#customers'">
                                ← Back to Customers
                            </button>
                            <div>
                                <h3 class="card-title" style="margin: 0; font-size: 18px;">
                                    Documents - ${customer.customerName}
                                </h3>
                                <div style="font-size: 13px; color: var(--slate-500); margin-top: 2px;">
                                    📞 +91 ${customer.phone} | 📍 ${customer.address || customer.city || 'Kalinagarhat'}
                                </div>
                            </div>
                        </div>
                        <span class="badge badge-info" style="font-size: 13px;">8 Document Categories</span>
                    </div>

                    <!-- Full-Page 8 Category Grid -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin-top: 24px;">
                        ${categories.map(cat => {
                            const isUploaded = !!docs[cat.id];
                            const docName = docs[cat.id] || 'Not uploaded';
                            return `
                                <div style="background: #ffffff; border: 1px solid var(--slate-200); border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); display: flex; flex-direction: column;">
                                    <div style="background-color: ${cat.color}; color: #ffffff; padding: 12px 16px; font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 10px;">
                                        <span>${cat.icon}</span>
                                        <span>${cat.label}</span>
                                    </div>
                                    <div style="padding: 24px 16px; text-align: center; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fafafa;">
                                        <svg width="32" height="32" fill="none" stroke="${isUploaded ? '#16a34a' : '#94a3b8'}" viewBox="0 0 24 24" style="margin-bottom: 8px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                                        <span id="page-doc-label-${cat.id}" style="font-size: 13px; font-weight: 600; color: ${isUploaded ? '#15803d' : '#64748b'};">${isUploaded ? `✓ ${docName}` : 'Not uploaded'}</span>
                                    </div>
                                    <div style="padding: 12px; background: #ffffff; border-top: 1px solid var(--slate-100); display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                                        <input type="file" id="page-file-input-${cat.id}" style="display: none;" accept="image/*,.pdf" />
                                        <button type="button" class="btn" style="width: 100%; border: 1px solid ${cat.color}; color: ${cat.color}; background: #ffffff; padding: 7px; font-size: 12.5px; font-weight: 600; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;" onclick="document.getElementById('page-file-input-${cat.id}').click()">
                                            📤 Upload
                                        </button>
                                        <button type="button" id="btn-download-${cat.id}" class="btn" style="width: 100%; border: 1px solid ${isUploaded ? '#16a34a' : 'var(--slate-300)'}; color: ${isUploaded ? '#15803d' : 'var(--slate-400)'}; background: ${isUploaded ? '#f0fdf4' : '#f8fafc'}; padding: 7px; font-size: 12.5px; font-weight: 600; border-radius: 6px; cursor: ${isUploaded ? 'pointer' : 'not-allowed'}; display: flex; align-items: center; justify-content: center; gap: 4px;" ${isUploaded ? '' : 'disabled'}>
                                            📥 Download
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;

            // Bind file change and download handlers
            categories.forEach(cat => {
                const fileInput = document.getElementById(`page-file-input-${cat.id}`);
                const downloadBtn = document.getElementById(`btn-download-${cat.id}`);

                if (fileInput) {
                    fileInput.addEventListener('change', async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                            docs[cat.id] = file.name;
                            await CustomerService.update(id, { documents: docs });

                            const labelEl = document.getElementById(`page-doc-label-${cat.id}`);
                            if (labelEl) {
                                labelEl.textContent = `✓ ${file.name}`;
                                labelEl.style.color = '#15803d';
                            }

                            if (downloadBtn) {
                                downloadBtn.disabled = false;
                                downloadBtn.style.cursor = 'pointer';
                                downloadBtn.style.borderColor = '#16a34a';
                                downloadBtn.style.color = '#15803d';
                                downloadBtn.style.background = '#f0fdf4';
                            }
                            Toast.success(`${cat.label} uploaded successfully!`);
                        }
                    });
                }

                if (downloadBtn) {
                    downloadBtn.addEventListener('click', () => {
                        if (docs[cat.id]) {
                            const element = document.createElement('a');
                            const fileText = `Document: ${cat.label}\nFile: ${docs[cat.id]}\nCustomer: ${customer.customerName}\nPhone: ${customer.phone}`;
                            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(fileText));
                            element.setAttribute('download', docs[cat.id]);
                            element.style.display = 'none';
                            document.body.appendChild(element);
                            element.click();
                            document.body.removeChild(element);
                            Toast.success(`Downloading ${cat.label}...`);
                        } else {
                            Toast.error(`No ${cat.label} document uploaded yet`);
                        }
                    });
                }
            });
        } catch (err) {
            Toast.error('Could not load customer documents page');
            window.location.hash = '#customers';
        }
    },

    async handleSaveGPS(id) {
        try {
            const customer = await CustomerService.getById(id);
            let defaultLat = '23.0450344';
            let defaultLng = '88.8153076';

            if (customer.gpsLat && customer.gpsLng) {
                defaultLat = customer.gpsLat;
                defaultLng = customer.gpsLng;
            }

            const modalContent = `
                <div style="padding: 6px 0;">
                    <div style="background-color: #d1fae5; border: 1px solid #6ee7b7; border-radius: 8px; padding: 14px 16px; display: flex; align-items: center; gap: 10px; margin-bottom: 20px; color: #065f46; font-weight: 600; font-size: 14px;">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        <span id="gps-coords-display">${defaultLat}, ${defaultLng}</span>
                    </div>

                    <div style="margin-bottom: 16px;">
                        <label class="form-label" style="font-size: 13px; color: var(--slate-600);">Latitude & Longitude</label>
                        <input type="text" id="gps-manual-input" class="form-control" value="${defaultLat}, ${defaultLng}" placeholder="e.g. 23.045034, 88.815307" />
                    </div>

                    <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 24px;">
                        <button type="button" class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
                        <button type="button" class="btn btn-danger" id="btn-save-gps-submit" style="background-color: #ef4444; border-color: #ef4444;">
                            💾 Save Location
                        </button>
                    </div>
                </div>
            `;

            Modal.show({
                title: '📍 Save GPS Location',
                contentHtml: modalContent,
                maxWidth: '480px'
            });

            // Try getting real geolocation if permitted
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        const lat = pos.coords.latitude.toFixed(7);
                        const lng = pos.coords.longitude.toFixed(7);
                        const displayEl = document.getElementById('gps-coords-display');
                        const inputEl = document.getElementById('gps-manual-input');
                        if (displayEl && inputEl) {
                            displayEl.textContent = `${lat}, ${lng}`;
                            inputEl.value = `${lat}, ${lng}`;
                        }
                    },
                    () => {}
                );
            }

            const saveBtn = document.getElementById('btn-save-gps-submit');
            if (saveBtn) {
                saveBtn.addEventListener('click', async () => {
                    const coordsVal = document.getElementById('gps-manual-input')?.value || `${defaultLat}, ${defaultLng}`;
                    const parts = coordsVal.split(',');
                    const lat = parts[0]?.trim() || defaultLat;
                    const lng = parts[1]?.trim() || defaultLng;

                    await CustomerService.update(id, { gpsLat: lat, gpsLng: lng });
                    Toast.success(`GPS Location (${lat}, ${lng}) saved successfully!`);
                    Modal.close();
                });
            }
        } catch (err) {
            Toast.error('Failed to load customer GPS details');
        }
    },

    async handleUploadDoc(id) {
        try {
            const customer = await CustomerService.getById(id);
            const docs = customer.documents || {};

            const categories = [
                { id: 'aadhar_front', label: 'Aadhaar Front', icon: '💳', color: '#4f46e5' },
                { id: 'aadhar_back', label: 'Aadhaar Back', icon: '💳', color: '#7c3aed' },
                { id: 'pan_card', label: 'PAN Card', icon: '💳', color: '#d97706' },
                { id: 'bank_passbook', label: 'Bank Passbook', icon: '🏦', color: '#0d9488' },
                { id: 'electricity_bill', label: 'Electricity Bill', icon: '🧾', color: '#dc2626' },
                { id: 'property_doc', label: 'Property Document', icon: '🏠', color: '#0284c7' },
                { id: 'income_doc', label: 'Income Doc', icon: '📄', color: '#059669' },
                { id: 'site_gps_photo', label: 'Site GPS Photo', icon: '📍', color: '#ea580c' }
            ];

            const modalContent = `
                <div style="padding: 4px 0;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--slate-200);">
                        <div>
                            <h4 style="margin: 0; font-size: 16px; color: var(--slate-900);">${customer.customerName}</h4>
                            <span style="font-size: 13px; color: var(--slate-500);">📞 ${customer.phone}</span>
                        </div>
                        <span class="badge badge-info" style="font-size: 12px;">Customer Docs</span>
                    </div>

                    <!-- 8 Category Document Grid -->
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; max-height: 60vh; overflow-y: auto; padding: 4px;">
                        ${categories.map(cat => {
                            const isUploaded = !!docs[cat.id];
                            const docName = docs[cat.id] || 'Not uploaded';
                            return `
                                <div style="background: #ffffff; border: 1px solid var(--slate-200); border-radius: 10px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; flex-direction: column;">
                                    <div style="background-color: ${cat.color}; color: #ffffff; padding: 10px 14px; font-weight: 700; font-size: 13px; display: flex; align-items: center; gap: 8px;">
                                        <span>${cat.icon}</span>
                                        <span>${cat.label}</span>
                                    </div>
                                    <div style="padding: 18px 14px; text-align: center; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #fafafa;">
                                        <svg width="28" height="28" fill="none" stroke="${isUploaded ? '#16a34a' : '#94a3b8'}" viewBox="0 0 24 24" style="margin-bottom: 6px;"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                                        <span id="doc-label-${cat.id}" style="font-size: 12.5px; font-weight: 600; color: ${isUploaded ? '#15803d' : '#64748b'};">${isUploaded ? `✓ ${docName}` : 'Not uploaded'}</span>
                                    </div>
                                    <div style="padding: 10px; background: #ffffff; border-top: 1px solid var(--slate-100);">
                                        <input type="file" id="file-input-${cat.id}" style="display: none;" accept="image/*,.pdf" />
                                        <button type="button" class="btn" style="width: 100%; border: 1px solid ${cat.color}; color: ${cat.color}; background: #ffffff; padding: 6px; font-size: 12.5px; font-weight: 600; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;" onclick="document.getElementById('file-input-${cat.id}').click()">
                                            📤 Upload
                                        </button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; padding-top: 12px; border-top: 1px solid var(--slate-200);">
                        <button type="button" class="btn btn-secondary" onclick="Modal.close()">Close</button>
                    </div>
                </div>
            `;

            Modal.show({
                title: `Documents - ${customer.customerName}`,
                contentHtml: modalContent,
                maxWidth: '780px'
            });

            // Bind file change event handlers for each category
            categories.forEach(cat => {
                const fileInput = document.getElementById(`file-input-${cat.id}`);
                if (fileInput) {
                    fileInput.addEventListener('change', async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                            docs[cat.id] = file.name;
                            await CustomerService.update(id, { documents: docs });

                            const labelEl = document.getElementById(`doc-label-${cat.id}`);
                            if (labelEl) {
                                labelEl.textContent = `✓ ${file.name}`;
                                labelEl.style.color = '#15803d';
                            }
                            Toast.success(`${cat.label} uploaded successfully!`);
                        }
                    });
                }
            });
        } catch (err) {
            Toast.error('Could not open document manager');
        }
    },

    bindEvents(container) {
        const searchInput = container.querySelector('#customer-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearch = e.target.value;
                this.render(container);
            });
        }

        const statusFilter = container.querySelector('#customer-status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', (e) => {
                this.currentStatusFilter = e.target.value;
                this.render(container);
            });
        }

        const distFilter = container.querySelector('#customer-distributor-filter');
        if (distFilter) {
            distFilter.addEventListener('change', (e) => {
                this.currentDistributorFilter = e.target.value;
                this.render(container);
            });
        }

        const addBtn = container.querySelector('#btn-add-customer');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openAddEditModal());
        }
    },

    async openAddEditModal(id = null) {
        const currentUser = AuthService.getCurrentUser();
        const isDistributor = AuthService.isDistributor();
        const distributors = await DistributorService.getAll();

        let customer = null;
        if (id) {
            try {
                customer = await CustomerService.getById(id);
            } catch (err) {
                Toast.error('Customer record not found');
                return;
            }
        }
            const isEdit = !!customer;
            const defaultDistId = customer ? customer.distributorId : (isDistributor && currentUser ? currentUser.distributorId : (distributors[0]?.id || ''));

            const districts = ['Pune', 'Bengaluru Urban', 'Hyderabad', 'South Delhi', 'Kolkata', 'Mumbai Suburban', 'Chennai', 'Gautam Buddha Nagar (Noida)', 'Gurugram', 'Ahmedabad', 'Jaipur', 'Lucknow', 'North 24 Parganas', 'South 24 Parganas'];
            const selectedDistrict = customer ? (customer.district || customer.city || '') : '';

            const modalContent = `
            <form id="customer-form">
                <!-- Section 1: Customer Personal Info -->
                <div style="font-weight: 700; font-size: 14px; color: var(--primary-700); margin-bottom: 12px; border-bottom: 1px solid var(--slate-200); padding-bottom: 6px;">
                    👤 Personal Information
                </div>

                <div class="form-grid">
                    <div class="form-group span-2">
                        <label class="form-label required">Full Name</label>
                        <input type="text" id="cust-name" class="form-control" value="${customer ? customer.customerName || '' : ''}" placeholder="Enter full name" required />
                    </div>

                    <div class="form-group">
                        <label class="form-label required">Mobile Number</label>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            <span style="padding: 9px 12px; background: var(--slate-100); border: 1px solid var(--slate-300); border-radius: 6px; font-weight: 600; font-size: 13.5px; color: var(--slate-700);">+91</span>
                            <input type="tel" id="cust-phone" class="form-control" value="${customer ? customer.phone || '' : ''}" placeholder="Enter 10-digit mobile number" required maxlength="10" />
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Email Address</label>
                        <input type="email" id="cust-email" class="form-control" value="${customer ? customer.email || '' : ''}" placeholder="Enter email address (optional)" />
                    </div>
                </div>

                <!-- Section 2: Billing Address -->
                <div style="font-weight: 700; font-size: 14px; color: var(--primary-700); margin-top: 18px; margin-bottom: 12px; border-bottom: 1px solid var(--slate-200); padding-bottom: 6px;">
                    🏠 Billing Address
                </div>

                <div class="form-grid">
                    <div class="form-group span-2">
                        <label class="form-label required">Address</label>
                        <input type="text" id="cust-address" class="form-control" value="${customer ? customer.address || '' : ''}" placeholder="Enter complete address" required />
                    </div>

                    <div class="form-group">
                        <label class="form-label required">Pin Code</label>
                        <input type="text" id="cust-pincode" class="form-control" value="${customer ? customer.pincode || '' : ''}" placeholder="Enter 6-digit pincode" required maxlength="6" />
                    </div>

                    <div class="form-group">
                        <label class="form-label required">District</label>
                        <select id="cust-district" class="form-control" required>
                            <option value="">Select District</option>
                            ${districts.map(d => `<option value="${d}" ${d === selectedDistrict ? 'selected' : ''}>${d}</option>`).join('')}
                            ${selectedDistrict && !districts.includes(selectedDistrict) ? `<option value="${selectedDistrict}" selected>${selectedDistrict}</option>` : ''}
                        </select>
                    </div>
                </div>

                <!-- Section 3: Additional Details -->
                <div style="font-weight: 700; font-size: 14px; color: var(--primary-700); margin-top: 18px; margin-bottom: 12px; border-bottom: 1px solid var(--slate-200); padding-bottom: 6px;">
                    ⚡ Solar & Technical Details
                </div>

                <div class="form-grid">
                    <div class="form-group">
                        <label class="form-label required">Solar Requirement</label>
                        <input type="text" id="cust-system-size" class="form-control" value="${customer ? customer.systemSize || '' : ''}" placeholder="4kw, 3kw solar system" required />
                    </div>

                    <div class="form-group">
                        <label class="form-label">Lead Source</label>
                        <input type="text" id="cust-lead-source" class="form-control" value="${customer ? customer.leadSource || '' : ''}" placeholder="How did you hear about us?" />
                    </div>

                    <div class="form-group">
                        <label class="form-label">CA No (Connection Number)</label>
                        <input type="text" id="cust-ca-no" class="form-control" value="${customer ? customer.caNumber || '' : ''}" placeholder="Enter CA / Connection Number" />
                    </div>

                    <div class="form-group">
                        <label class="form-label">Sanction Load (kW)</label>
                        <input type="text" id="cust-sanction-load" class="form-control" value="${customer ? customer.sanctionLoad || '' : ''}" placeholder="e.g. 5kW" />
                    </div>

                    <div class="form-group">
                        <label class="form-label">Bank Loan</label>
                        <select id="cust-bank-loan" class="form-control">
                            <option value="No" ${customer && customer.bankLoan === 'Yes' ? '' : 'selected'}>No</option>
                            <option value="Yes" ${customer && customer.bankLoan === 'Yes' ? 'selected' : ''}>Yes</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Project Cost (₹)</label>
                        <input type="number" id="cust-project-cost" class="form-control" value="${customer ? customer.projectCost || '0' : '0'}" placeholder="0" min="0" />
                    </div>

                    <div class="form-group">
                        <label class="form-label">Distribution Company Name</label>
                        <input type="text" id="cust-discom" class="form-control" value="${customer ? customer.discomName || '' : ''}" placeholder="Enter distribution company name" />
                    </div>

                    <div class="form-group">
                        <label class="form-label">Connection Type</label>
                        <select id="cust-connection-type" class="form-control">
                            <option value="">Select Connection Type</option>
                            <option value="Single Phase" ${customer && customer.connectionType === 'Single Phase' ? 'selected' : ''}>Single Phase</option>
                            <option value="Three Phase" ${customer && customer.connectionType === 'Three Phase' ? 'selected' : ''}>Three Phase</option>
                        </select>
                    </div>
                </div>

                </div>

                <div class="modal-footer" style="margin-top: 24px; padding: 16px 0 0 0;">
                    <button type="button" class="btn btn-secondary" onclick="Modal.close()">Cancel</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? 'Save Changes' : 'Register Customer'}</button>
                </div>
            </form>
        `;

        Modal.show({
            title: isEdit ? `Edit Customer Details (${customer.id})` : 'Register New Customer',
            contentHtml: modalContent,
            maxWidth: '740px'
        });

        const form = document.getElementById('customer-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const selectedDistId = defaultDistId;
                const distObj = distributors.find(d => d.id === selectedDistId);

                const data = {
                    customerName: form.querySelector('#cust-name').value.trim(),
                    phone: form.querySelector('#cust-phone').value.trim(),
                    email: form.querySelector('#cust-email').value.trim(),
                    address: form.querySelector('#cust-address').value.trim(),
                    pincode: form.querySelector('#cust-pincode').value.trim(),
                    district: form.querySelector('#cust-district').value,
                    city: form.querySelector('#cust-district').value,
                    systemSize: form.querySelector('#cust-system-size').value.trim(),
                    leadSource: form.querySelector('#cust-lead-source').value.trim(),
                    caNumber: form.querySelector('#cust-ca-no').value.trim(),
                    sanctionLoad: form.querySelector('#cust-sanction-load').value.trim(),
                    bankLoan: form.querySelector('#cust-bank-loan').value,
                    projectCost: form.querySelector('#cust-project-cost').value || '0',
                    discomName: form.querySelector('#cust-discom').value.trim(),
                    connectionType: form.querySelector('#cust-connection-type').value,
                    distributorId: selectedDistId,
                    distributorName: distObj ? distObj.companyName : '',
                    status: customer ? (customer.status || 'Active') : 'Active'
                };

                try {
                    if (isEdit) {
                        await CustomerService.update(id, data);
                        Toast.success('Customer details updated successfully');
                    } else {
                        await CustomerService.create(data);
                        Toast.success('Customer registered successfully');
                    }
                    Modal.close();
                    const mainContent = document.getElementById('main-content-view');
                    if (mainContent) this.render(mainContent);
                } catch (err) {
                    Toast.error(err.message || 'Operation failed');
                }
            });
        }
    },

    async openViewModal(id) {
        try {
            const customer = await CustomerService.getById(id);
            const distributors = await DistributorService.getAll();
            const dist = distributors.find(d => d.id === customer.distributorId);

            const content = `
                <div style="display: flex; flex-direction: column; gap: 16px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; background: var(--slate-50); padding: 14px 18px; border-radius: 8px;">
                        <div>
                            <h3 style="margin: 0; font-size: 18px; color: var(--slate-900);">${customer.customerName}</h3>
                            <span class="text-muted" style="font-size: 13px;">ID: ${customer.id} | Reg Date: ${customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <span class="badge badge-${customer.status ? customer.status.toLowerCase() : 'active'}">${customer.status || 'Active'}</span>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; font-size: 13.5px;">
                        <div><strong>Mobile Number:</strong> +91 ${customer.phone}</div>
                        <div><strong>Email Address:</strong> ${customer.email || 'N/A'}</div>
                        <div><strong>Solar Requirement:</strong> <span class="badge badge-info">${customer.systemSize || 'N/A'}</span></div>
                        <div><strong>Assigned Distributor:</strong> ${dist ? dist.companyName : (customer.distributorName || customer.distributorId)}</div>
                    </div>

                    <div style="background: var(--slate-50); padding: 12px 16px; border-radius: 6px; font-size: 13.5px;">
                        <strong>Billing Address:</strong>
                        <p style="margin: 4px 0 0 0; color: var(--slate-700);">${customer.address || 'N/A'}${customer.city ? ', ' + customer.city : ''}${customer.pincode ? ' - ' + customer.pincode : ''}</p>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; background: #f8fafc; padding: 14px; border: 1px solid var(--slate-200); border-radius: 6px;">
                        <div><strong>Lead Source:</strong> ${customer.leadSource || 'N/A'}</div>
                        <div><strong>CA / Connection No:</strong> ${customer.caNumber || 'N/A'}</div>
                        <div><strong>Sanction Load:</strong> ${customer.sanctionLoad || 'N/A'}</div>
                        <div><strong>Bank Loan Required:</strong> <span class="badge ${customer.bankLoan === 'Yes' ? 'badge-active' : 'badge-inactive'}">${customer.bankLoan || 'No'}</span></div>
                        <div><strong>Project Cost:</strong> ₹${customer.projectCost ? parseInt(customer.projectCost).toLocaleString('en-IN') : '0'}</div>
                        <div><strong>DISCOM Name:</strong> ${customer.discomName || 'N/A'}</div>
                        <div><strong>Connection Type:</strong> ${customer.connectionType || 'N/A'}</div>
                    </div>

                    <div class="modal-footer" style="padding: 12px 0 0 0;">
                        <button class="btn btn-secondary" onclick="Modal.close()">Close</button>
                        <button class="btn btn-primary" onclick="Modal.close(); window.CustomerPage.openAddEditModal('${customer.id}');">Edit Customer</button>
                    </div>
                </div>
            `;

            Modal.show({
                title: 'Customer Registration Details',
                contentHtml: content,
                maxWidth: '640px'
            });
        } catch (err) {
            Toast.error('Could not load customer details');
        }
    },

    async handleDelete(id) {
        const confirmed = await SweetAlert.confirm('Delete Customer', 'Are you sure you want to delete this customer registration record?');
        if (confirmed) {
            try {
                await CustomerService.delete(id);
                Toast.success('Customer record deleted successfully');
                const mainContent = document.getElementById('main-content-view');
                if (mainContent) this.render(mainContent);
            } catch (err) {
                Toast.error(err.message || 'Delete operation failed');
            }
        }
    }
};
