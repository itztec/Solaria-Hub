/**
 * REPORTS PAGE CONTROLLER
 * Analytics dashboard providing summary metrics, state breakdown visual meters, and retailer ratios.
 */

import { ReportService } from '../services/reportService.js';

export const ReportsPage = {
    async render(container) {
        const metrics = await ReportService.getSummaryMetrics();

        // Calculate state distribution totals for percentage bars
        const maxDistState = Math.max(...Object.values(metrics.distributorStateBreakdown), 1);

        container.innerHTML = `
            <div class="card" style="margin-bottom: 24px;">
                <div class="card-header">
                    <h3 class="card-title">
                        <svg width="22" height="22" fill="none" stroke="var(--primary-600)" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                        Solar Distribution System Reports & Analytics
                    </h3>
                </div>

                <!-- KPI Metric Bar -->
                <div class="stats-grid" style="margin-bottom: 24px;">
                    <div class="stat-card emerald">
                        <div class="stat-info">
                            <div class="stat-label">Total Distributors</div>
                            <div class="stat-value">${metrics.totalDistributors}</div>
                            <div style="font-size: 12px; color: var(--slate-500); margin-top: 4px;">
                                Active: <strong>${metrics.activeDistributors}</strong> | Pending: <strong>${metrics.pendingDistributors}</strong>
                            </div>
                        </div>
                    </div>

                    <div class="stat-card blue">
                        <div class="stat-info">
                            <div class="stat-label">Total Retail Partners</div>
                            <div class="stat-value">${metrics.totalRetailers}</div>
                            <div style="font-size: 12px; color: var(--slate-500); margin-top: 4px;">
                                Active: <strong>${metrics.activeRetailers}</strong> | Pending: <strong>${metrics.pendingRetailers}</strong>
                            </div>
                        </div>
                    </div>

                    <div class="stat-card amber">
                        <div class="stat-info">
                            <div class="stat-label">Active Distributor Rate</div>
                            <div class="stat-value">${metrics.totalDistributors ? Math.round((metrics.activeDistributors / metrics.totalDistributors) * 100) : 0}%</div>
                        </div>
                    </div>

                    <div class="stat-card purple">
                        <div class="stat-info">
                            <div class="stat-label">Active Retail Shop Rate</div>
                            <div class="stat-value">${metrics.totalRetailers ? Math.round((metrics.activeRetailers / metrics.totalRetailers) * 100) : 0}%</div>
                        </div>
                    </div>
                </div>

                <!-- Two-Column Breakdown Charts -->
                <div class="dashboard-grid">
                    <!-- Distributor Regional Distribution -->
                    <div class="card" style="border: 1px solid var(--slate-200);">
                        <h4 style="font-size: 16px; margin-bottom: 16px; color: var(--slate-900);">
                            🗺️ Distributors State Breakdown
                        </h4>
                        <div style="display: flex; flex-direction: column; gap: 14px;">
                            ${Object.keys(metrics.distributorStateBreakdown).length === 0 ? '<p class="text-muted">No state data available.</p>' : ''}
                            ${Object.entries(metrics.distributorStateBreakdown).map(([state, count]) => {
                                const percent = Math.round((count / maxDistState) * 100);
                                return `
                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-bottom: 4px;">
                                            <span>${state}</span>
                                            <span>${count} Distributors</span>
                                        </div>
                                        <div style="height: 10px; background: var(--slate-100); border-radius: 999px; overflow: hidden;">
                                            <div style="width: ${percent}%; height: 100%; background: linear-gradient(90deg, var(--primary-500), var(--primary-700)); border-radius: 999px;"></div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>

                    <!-- Retailers Regional Distribution -->
                    <div class="card" style="border: 1px solid var(--slate-200);">
                        <h4 style="font-size: 16px; margin-bottom: 16px; color: var(--slate-900);">
                            🏪 Retail Shops State Breakdown
                        </h4>
                        <div style="display: flex; flex-direction: column; gap: 14px;">
                            ${Object.keys(metrics.retailerStateBreakdown).length === 0 ? '<p class="text-muted">No retailer state data available.</p>' : ''}
                            ${Object.entries(metrics.retailerStateBreakdown).map(([state, count]) => {
                                const percent = Math.round((count / maxDistState) * 100);
                                return `
                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-bottom: 4px;">
                                            <span>${state}</span>
                                            <span>${count} Retailers</span>
                                        </div>
                                        <div style="height: 10px; background: var(--slate-100); border-radius: 999px; overflow: hidden;">
                                            <div style="width: ${percent}%; height: 100%; background: linear-gradient(90deg, #3b82f6, #1d4ed8); border-radius: 999px;"></div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};
