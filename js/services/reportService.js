/**
 * REPORT SERVICE
 * Calculates aggregate stats and report analytics using LocalStorage data.
 */

import { DistributorService } from './distributorService.js';
import { CustomerService } from './customerService.js';
import { AuthService } from './authService.js';

export const ReportService = {
    async getSummaryMetrics() {
        const currentUser = AuthService.getCurrentUser();
        const isDistributor = AuthService.isDistributor();

        let distributors = await DistributorService.getAll();
        let customers = await CustomerService.getAll();

        if (isDistributor && currentUser && currentUser.distributorId) {
            customers = customers.filter(c => c.distributorId === currentUser.distributorId);
            distributors = distributors.filter(d => d.id === currentUser.distributorId);
        }

        const activeDistributors = distributors.filter(d => d.status === 'Active').length;
        const activeCustomers = customers.filter(c => c.status === 'Active').length;
        const pendingDistributors = distributors.filter(d => d.status === 'Pending').length;
        const pendingCustomers = customers.filter(c => c.status === 'Pending').length;

        // Group Distributors by State
        const stateBreakdown = {};
        distributors.forEach(d => {
            const state = d.state || 'Unspecified';
            stateBreakdown[state] = (stateBreakdown[state] || 0) + 1;
        });

        // Group Customers by State
        const customerStateBreakdown = {};
        customers.forEach(c => {
            const state = c.state || 'Unspecified';
            customerStateBreakdown[state] = (customerStateBreakdown[state] || 0) + 1;
        });

        return {
            totalDistributors: distributors.length,
            activeDistributors,
            pendingDistributors,
            inactiveDistributors: distributors.length - activeDistributors - pendingDistributors,

            totalCustomers: customers.length,
            activeCustomers,
            pendingCustomers,
            inactiveCustomers: customers.length - activeCustomers - pendingCustomers,

            distributorStateBreakdown: stateBreakdown,
            customerStateBreakdown,

            recentDistributors: distributors.slice(0, 5),
            recentCustomers: customers.slice(0, 5)
        };
    }
};
