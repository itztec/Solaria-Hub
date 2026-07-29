/**
 * REPORT SERVICE
 * Calculates aggregate stats and report analytics using LocalStorage data.
 */

import { DistributorService } from './distributorService.js';
import { RetailerService } from './retailerService.js';

export const ReportService = {
    async getSummaryMetrics() {
        const distributors = await DistributorService.getAll();
        const retailers = await RetailerService.getAll();

        const activeDistributors = distributors.filter(d => d.status === 'Active').length;
        const activeRetailers = retailers.filter(r => r.status === 'Active').length;
        const pendingDistributors = distributors.filter(d => d.status === 'Pending').length;
        const pendingRetailers = retailers.filter(r => r.status === 'Pending').length;

        // Group Distributors by State
        const stateBreakdown = {};
        distributors.forEach(d => {
            const state = d.state || 'Unspecified';
            stateBreakdown[state] = (stateBreakdown[state] || 0) + 1;
        });

        // Group Retailers by State
        const retailerStateBreakdown = {};
        retailers.forEach(r => {
            const state = r.state || 'Unspecified';
            retailerStateBreakdown[state] = (retailerStateBreakdown[state] || 0) + 1;
        });

        return {
            totalDistributors: distributors.length,
            activeDistributors,
            pendingDistributors,
            inactiveDistributors: distributors.length - activeDistributors - pendingDistributors,

            totalRetailers: retailers.length,
            activeRetailers,
            pendingRetailers,
            inactiveRetailers: retailers.length - activeRetailers - pendingRetailers,

            distributorStateBreakdown: stateBreakdown,
            retailerStateBreakdown,

            recentDistributors: distributors.slice(0, 5),
            recentRetailers: retailers.slice(0, 5)
        };
    }
};
