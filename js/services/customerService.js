/**
 * CUSTOMER SERVICE
 * Handles CRUD operations for Customer Registrations under Distributors.
 */

import { StorageService } from './storageService.js';

export const CustomerService = {
    async getAll() {
        return new Promise((resolve) => {
            const list = StorageService.get(StorageService.KEYS.CUSTOMERS) || [];
            resolve(list);
        });
    },

    async getById(id) {
        return new Promise((resolve, reject) => {
            const list = StorageService.get(StorageService.KEYS.CUSTOMERS) || [];
            const found = list.find(c => c.id === id);
            if (found) {
                resolve(found);
            } else {
                reject({ message: 'Customer not found' });
            }
        });
    },

    async getByDistributor(distributorId) {
        return new Promise((resolve) => {
            const list = StorageService.get(StorageService.KEYS.CUSTOMERS) || [];
            const filtered = list.filter(c => c.distributorId === distributorId);
            resolve(filtered);
        });
    },

    async create(customerData) {
        return new Promise((resolve, reject) => {
            try {
                const list = StorageService.get(StorageService.KEYS.CUSTOMERS) || [];
                const newId = this.generateNextId(list);
                const newCustomer = {
                    id: newId,
                    ...customerData,
                    createdAt: new Date().toISOString()
                };
                list.unshift(newCustomer);
                StorageService.set(StorageService.KEYS.CUSTOMERS, list);
                resolve({ success: true, customer: newCustomer });
            } catch (err) {
                reject({ success: false, message: err.message });
            }
        });
    },

    async update(id, updatedData) {
        return new Promise((resolve, reject) => {
            try {
                const list = StorageService.get(StorageService.KEYS.CUSTOMERS) || [];
                const index = list.findIndex(c => c.id === id);
                if (index !== -1) {
                    list[index] = { ...list[index], ...updatedData, id: id };
                    StorageService.set(StorageService.KEYS.CUSTOMERS, list);
                    resolve({ success: true, customer: list[index] });
                } else {
                    reject({ success: false, message: 'Customer not found for update' });
                }
            } catch (err) {
                reject({ success: false, message: err.message });
            }
        });
    },

    async delete(id) {
        return new Promise((resolve, reject) => {
            try {
                let list = StorageService.get(StorageService.KEYS.CUSTOMERS) || [];
                const initialLength = list.length;
                list = list.filter(c => c.id !== id);
                if (list.length < initialLength) {
                    StorageService.set(StorageService.KEYS.CUSTOMERS, list);
                    resolve({ success: true });
                } else {
                    reject({ success: false, message: 'Customer not found for deletion' });
                }
            } catch (err) {
                reject({ success: false, message: err.message });
            }
        });
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
