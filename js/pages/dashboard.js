/**
 * DASHBOARD PAGE CONTROLLER
 * Renders AdminLTE-style modern cards, quick actions, and recent tables.
 */

import { ReportService } from '../services/reportService.js';
import { AuthService } from '../services/authService.js';
import { DistributorPage } from './distributors.js';
import { CustomerPage } from './customers.js';

export const DashboardPage = {
    async render(container) {
        const metrics = await ReportService.getSummaryMetrics();
        const currentUser = AuthService.getCurrentUser();
        const isDistributor = AuthService.isDistributor();

        container.innerHTML = `
            <div class="quick-actions-bar">
                <div class="quick-actions-text">
                    <h3>${isDistributor ? 'Distributor Customer Portal' : 'Channel Partner Management Console'}</h3>
                    <p>${isDistributor ? 'Register and manage solar customer installations and track project status.' : 'Track, manage and empower your regional solar distributor network & customer registrations.'}</p>
                </div>
                <div class="quick-actions-btns">
                    ${!isDistributor ? `
                        <button class="btn btn-primary" id="dash-add-dis-btn">
                            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                            Add Distributor
                        </button>
                    ` : ''}
                    <button class="btn ${isDistributor ? 'btn-primary' : 'btn-secondary'}" id="dash-add-cust-btn">
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        Register New Customer
                    </button>
                </div>
            </div>

            <!-- KPI Metric Cards Grid -->
            <div class="stats-grid">
                ${!isDistributor ? `
                    <div class="stat-card emerald">
                        <div class="stat-info">
                            <div class="stat-label">Total Distributors</div>
                            <div class="stat-value">${metrics.totalDistributors}</div>
                        </div>
                        <div class="stat-icon">
                            <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                        </div>
                    </div>
                ` : ''}

                <div class="stat-card blue">
                    <div class="stat-info">
                        <div class="stat-label">Total Customers</div>
                        <div class="stat-value">${metrics.totalCustomers}</div>
                    </div>
                    <div class="stat-icon">
                        <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </div>
                </div>

                <div class="stat-card amber">
                    <div class="stat-info">
                        <div class="stat-label">Active Customers</div>
                        <div class="stat-value">${metrics.activeCustomers}</div>
                    </div>
                    <div class="stat-icon">
                        <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                </div>

                <div class="stat-card purple">
                    <div class="stat-info">
                        <div class="stat-label">Pending Inspections</div>
                        <div class="stat-value">${metrics.pendingCustomers}</div>
                    </div>
                    <div class="stat-icon">
                        <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    </div>
                </div>
            </div>

            <!-- Dashboard Grid Lists -->
            <div class="dashboard-grid" style="${isDistributor ? 'grid-template-columns: 1fr;' : ''}">
                ${!isDistributor ? `
                    <!-- Recent Distributors -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">
                                <svg width="20" height="20" fill="none" stroke="var(--primary-600)" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                                Recent Solar Distributors
                            </h3>
                            <a href="#distributors" class="btn btn-secondary btn-sm">View All</a>
                        </div>
                        <div class="table-responsive">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Company</th>
                                        <th>Distributor</th>
                                        <th>District</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${metrics.recentDistributors.length === 0 ? '<tr><td colspan="5" class="empty-state">No distributors registered yet</td></tr>' : ''}
                                    ${metrics.recentDistributors.map(d => `
                                        <tr>
                                            <td><span class="font-bold text-emerald">${d.id}</span></td>
                                            <td>
                                                <div class="table-cell-title">${d.companyName}</div>
                                                <div class="table-cell-sub">${d.area || ''}</div>
                                            </td>
                                            <td>${d.distributorName}</td>
                                            <td>${d.district || '-'}</td>
                                            <td>
                                                <span class="badge badge-${d.status ? d.status.toLowerCase() : 'active'}">
                                                    <span class="badge-dot"></span>${d.status || 'Active'}
                                                </span>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ` : ''}

                <!-- Recent Customers -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            <svg width="20" height="20" fill="none" stroke="#3b82f6" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                            Recent Customer Registrations
                        </h3>
                        <a href="#customers" class="btn btn-secondary btn-sm">View All</a>
                    </div>
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Customer Name</th>
                                    <th>Phone</th>
                                    <th>Solar Capacity</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${metrics.recentCustomers.length === 0 ? '<tr><td colspan="5" class="empty-state">No customers registered yet</td></tr>' : ''}
                                ${metrics.recentCustomers.map(c => `
                                    <tr>
                                        <td><span class="font-bold text-blue">${c.id}</span></td>
                                        <td>
                                            <div class="table-cell-title">${c.customerName}</div>
                                            <div class="table-cell-sub">${c.area || ''}</div>
                                        </td>
                                        <td>${c.phone}</td>
                                        <td><span class="badge badge-info">${c.systemSize || '-'}</span></td>
                                        <td>
                                            <span class="badge badge-${c.status ? c.status.toLowerCase() : 'active'}">
                                                <span class="badge-dot"></span>${c.status || 'Active'}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        const addDisBtn = document.getElementById('dash-add-dis-btn');
        if (addDisBtn) {
            addDisBtn.addEventListener('click', () => {
                DistributorPage.openAddEditModal();
            });
        }

        const addCustBtn = document.getElementById('dash-add-cust-btn');
        if (addCustBtn) {
            addCustBtn.addEventListener('click', () => {
                CustomerPage.openAddEditModal();
            });
        }
    }
};
