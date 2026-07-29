/**
 * RETAILER SERVICE
 * Handles CRUD operations for Solar Retailers with Promise-based async interfaces.
 */

import { StorageService } from './storageService.js';

export const RetailerService = {
    async getAll() {
        return new Promise((resolve) => {
            const list = StorageService.get(StorageService.KEYS.RETAILERS) || [];
            resolve(list);
        });
    },

    async getById(id) {
        return new Promise((resolve, reject) => {
            const list = StorageService.get(StorageService.KEYS.RETAILERS) || [];
            const found = list.find(r => r.id === id);
            if (found) {
                resolve(found);
            } else {
                reject({ message: 'Retailer not found' });
            }
        });
    },

    async getByDistributor(distributorId) {
        return new Promise((resolve) => {
            const list = StorageService.get(StorageService.KEYS.RETAILERS) || [];
            const filtered = list.filter(r => r.distributorId === distributorId);
            resolve(filtered);
        });
    },

    async create(retailerData) {
        return new Promise((resolve, reject) => {
            try {
                const list = StorageService.get(StorageService.KEYS.RETAILERS) || [];
                const newId = this.generateNextId(list);
                const newRetailer = {
                    id: newId,
                    ...retailerData,
                    createdAt: new Date().toISOString()
                };
                list.unshift(newRetailer);
                StorageService.set(StorageService.KEYS.RETAILERS, list);
                resolve({ success: true, retailer: newRetailer });
            } catch (err) {
                reject({ success: false, message: err.message });
            }
        });
    },

    async update(id, updatedData) {
        return new Promise((resolve, reject) => {
            try {
                const list = StorageService.get(StorageService.KEYS.RETAILERS) || [];
                const index = list.findIndex(r => r.id === id);
                if (index !== -1) {
                    list[index] = { ...list[index], ...updatedData, id: id };
                    StorageService.set(StorageService.KEYS.RETAILERS, list);
                    resolve({ success: true, retailer: list[index] });
                } else {
                    reject({ success: false, message: 'Retailer not found for update' });
                }
            } catch (err) {
                reject({ success: false, message: err.message });
            }
        });
    },

    async delete(id) {
        return new Promise((resolve, reject) => {
            try {
                let list = StorageService.get(StorageService.KEYS.RETAILERS) || [];
                const initialLength = list.length;
                list = list.filter(r => r.id !== id);
                if (list.length < initialLength) {
                    StorageService.set(StorageService.KEYS.RETAILERS, list);
                    resolve({ success: true });
                } else {
                    reject({ success: false, message: 'Retailer not found for deletion' });
                }
            } catch (err) {
                reject({ success: false, message: err.message });
            }
        });
    },

    generateNextId(list) {
        const year = new Date().getFullYear();
        if (!list || list.length === 0) {
            return `RET-${year}-001`;
        }
        const numericIds = list
            .map(item => {
                const parts = item.id ? item.id.split('-') : [];
                return parts.length === 3 ? parseInt(parts[2], 10) : 0;
            })
            .filter(num => !isNaN(num));

        const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
        const nextNum = (maxId + 1).toString().padStart(3, '0');
        return `RET-${year}-${nextNum}`;
    }
};
