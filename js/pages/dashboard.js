/**
 * DASHBOARD PAGE CONTROLLER
 * Renders AdminLTE-style modern cards, quick actions, and recent tables.
 */

import { ReportService } from '../services/reportService.js';
import { DistributorPage } from './distributors.js';
import { RetailerPage } from './retailers.js';

export const DashboardPage = {
    async render(container) {
        const metrics = await ReportService.getSummaryMetrics();

        container.innerHTML = `
            <div class="quick-actions-bar">
                <div class="quick-actions-text">
                    <h3>Solar Network Management Console</h3>
                    <p>Track, manage and empower your regional solar distributor & retailer network.</p>
                </div>
                <div class="quick-actions-btns">
                    <button class="btn btn-primary" id="dash-add-dis-btn">
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        Add Distributor
                    </button>
                    <button class="btn btn-secondary" id="dash-add-ret-btn">
                        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        Add Retailer
                    </button>
                </div>
            </div>

            <!-- KPI Metric Cards Grid -->
            <div class="stats-grid">
                <div class="stat-card emerald">
                    <div class="stat-info">
                        <div class="stat-label">Total Distributors</div>
                        <div class="stat-value">${metrics.totalDistributors}</div>
                    </div>
                    <div class="stat-icon">
                        <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
                    </div>
                </div>

                <div class="stat-card blue">
                    <div class="stat-info">
                        <div class="stat-label">Total Retailers</div>
                        <div class="stat-value">${metrics.totalRetailers}</div>
                    </div>
                    <div class="stat-icon">
                        <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                    </div>
                </div>

                <div class="stat-card amber">
                    <div class="stat-info">
                        <div class="stat-label">Active Distributors</div>
                        <div class="stat-value">${metrics.activeDistributors}</div>
                    </div>
                    <div class="stat-icon">
                        <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    </div>
                </div>

                <div class="stat-card purple">
                    <div class="stat-info">
                        <div class="stat-label">Active Retailers</div>
                        <div class="stat-value">${metrics.activeRetailers}</div>
                    </div>
                    <div class="stat-icon">
                        <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    </div>
                </div>
            </div>

            <!-- Dashboard Grid Lists -->
            <div class="dashboard-grid">
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

                <!-- Recent Retailers -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">
                            <svg width="20" height="20" fill="none" stroke="#3b82f6" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
                            Recent Retail Shops
                        </h3>
                        <a href="#retailers" class="btn btn-secondary btn-sm">View All</a>
                    </div>
                    <div class="table-responsive">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Shop Name</th>
                                    <th>Retailer</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${metrics.recentRetailers.length === 0 ? '<tr><td colspan="4" class="empty-state">No retailers registered yet</td></tr>' : ''}
                                ${metrics.recentRetailers.map(r => `
                                    <tr>
                                        <td><span class="font-bold">${r.id}</span></td>
                                        <td>
                                            <div class="table-cell-title">${r.shopName}</div>
                                            <div class="table-cell-sub">${r.area || ''}</div>
                                        </td>
                                        <td>${r.retailerName}</td>
                                        <td>
                                            <span class="badge badge-${r.status ? r.status.toLowerCase() : 'active'}">
                                                <span class="badge-dot"></span>${r.status || 'Active'}
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

        document.getElementById('dash-add-dis-btn').addEventListener('click', () => {
            DistributorPage.openAddEditModal();
        });

        document.getElementById('dash-add-ret-btn').addEventListener('click', () => {
            RetailerPage.openAddEditModal();
        });
    }
};
