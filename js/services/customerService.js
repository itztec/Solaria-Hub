import { StorageService } from './storageService.js';
import { ApiService } from './apiService.js';

export const CustomerService = {
    async getAll() {
        if (ApiService.isServerAvailable()) {
            const apiRes = await ApiService.get('customers.php');
            if (apiRes && apiRes.success && Array.isArray(apiRes.customers)) {
                StorageService.set(StorageService.KEYS.CUSTOMERS, apiRes.customers);
                return apiRes.customers;
            }
        }
        return StorageService.get(StorageService.KEYS.CUSTOMERS) || [];
    },

    async getById(id) {
        if (ApiService.isServerAvailable()) {
            const apiRes = await ApiService.get('customers.php', { id });
            if (apiRes && apiRes.success && apiRes.customer) {
                return apiRes.customer;
            }
        }
        const list = StorageService.get(StorageService.KEYS.CUSTOMERS) || [];
        const found = list.find(c => c.id === id);
        if (found) return found;
        throw new Error('Customer not found');
    },

    async getByDistributor(distributorId) {
        if (ApiService.isServerAvailable()) {
            const apiRes = await ApiService.get('customers.php', { distributorId });
            if (apiRes && apiRes.success && Array.isArray(apiRes.customers)) {
                return apiRes.customers;
            }
        }
        const list = StorageService.get(StorageService.KEYS.CUSTOMERS) || [];
        return list.filter(c => c.distributorId === distributorId);
    },

    async create(customerData) {
        if (ApiService.isServerAvailable()) {
            const apiRes = await ApiService.post('customers.php', customerData);
            if (apiRes && apiRes.success && apiRes.customer) {
                const list = StorageService.get(StorageService.KEYS.CUSTOMERS) || [];
                list.unshift(apiRes.customer);
                StorageService.set(StorageService.KEYS.CUSTOMERS, list);
                return { success: true, customer: apiRes.customer };
            }
        }

        // LocalStorage fallback
        const list = StorageService.get(StorageService.KEYS.CUSTOMERS) || [];
        const newId = this.generateNextId(list);
        const newCustomer = {
            id: newId,
            ...customerData,
            createdAt: new Date().toISOString()
        };
        list.unshift(newCustomer);
        StorageService.set(StorageService.KEYS.CUSTOMERS, list);
        return { success: true, customer: newCustomer };
    },

    async update(id, updatedData) {
        if (ApiService.isServerAvailable()) {
            const apiRes = await ApiService.post('customers.php', { _action: 'PUT', id, ...updatedData });
            if (apiRes && apiRes.success && apiRes.customer) {
                const list = StorageService.get(StorageService.KEYS.CUSTOMERS) || [];
                const idx = list.findIndex(c => c.id === id);
                if (idx !== -1) {
                    list[idx] = apiRes.customer;
                    StorageService.set(StorageService.KEYS.CUSTOMERS, list);
                }
                return { success: true, customer: apiRes.customer };
            }
        }

        // LocalStorage fallback
        const list = StorageService.get(StorageService.KEYS.CUSTOMERS) || [];
        const index = list.findIndex(c => c.id === id);
        if (index !== -1) {
            list[index] = { ...list[index], ...updatedData, id: id };
            StorageService.set(StorageService.KEYS.CUSTOMERS, list);
            return { success: true, customer: list[index] };
        }
        throw new Error('Customer not found for update');
    },

    async delete(id) {
        if (ApiService.isServerAvailable()) {
            const apiRes = await ApiService.post('customers.php', { _action: 'DELETE', id });
            if (apiRes && apiRes.success) {
                let list = StorageService.get(StorageService.KEYS.CUSTOMERS) || [];
                list = list.filter(c => c.id !== id);
                StorageService.set(StorageService.KEYS.CUSTOMERS, list);
                return { success: true };
            }
        }

        // LocalStorage fallback
        let list = StorageService.get(StorageService.KEYS.CUSTOMERS) || [];
        const initialLength = list.length;
        list = list.filter(c => c.id !== id);
        if (list.length < initialLength) {
            StorageService.set(StorageService.KEYS.CUSTOMERS, list);
            return { success: true };
        }
        throw new Error('Customer not found for deletion');
    },

    generateNextId(list) {
        const year = new Date().getFullYear();
        if (!list || list.length === 0) {
            return `CUST-${year}-001`;
        }
        const numericIds = list
            .map(item => {
                const parts = item.id ? item.id.split('-') : [];
                return parts.length === 3 ? parseInt(parts[2], 10) : 0;
            })
            .filter(num => !isNaN(num));

        const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
        const nextNum = (maxId + 1).toString().padStart(3, '0');
        return `CUST-${year}-${nextNum}`;
    }
};
