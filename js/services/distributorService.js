/**
 * DISTRIBUTOR SERVICE
 * Handles CRUD operations for Solar Distributors with Promise-based async interfaces
 * to enable seamless drop-in PHP/MySQL API replacement later.
 */

import { StorageService } from './storageService.js';

export const DistributorService = {
    async getAll() {
        return new Promise((resolve) => {
            const list = StorageService.get(StorageService.KEYS.DISTRIBUTORS) || [];
            resolve(list);
        });
    },

    async getById(id) {
        return new Promise((resolve, reject) => {
            const list = StorageService.get(StorageService.KEYS.DISTRIBUTORS) || [];
            const found = list.find(d => d.id === id);
            if (found) {
                resolve(found);
            } else {
                reject({ message: 'Distributor not found' });
            }
        });
    },

    async create(distributorData) {
        return new Promise((resolve, reject) => {
            try {
                const list = StorageService.get(StorageService.KEYS.DISTRIBUTORS) || [];
                const newId = this.generateNextId(list);
                const newDistributor = {
                    id: newId,
                    ...distributorData,
                    createdAt: new Date().toISOString()
                };
                list.unshift(newDistributor);
                StorageService.set(StorageService.KEYS.DISTRIBUTORS, list);
                resolve({ success: true, distributor: newDistributor });
            } catch (err) {
                reject({ success: false, message: err.message });
            }
        });
    },

    async update(id, updatedData) {
        return new Promise((resolve, reject) => {
            try {
                const list = StorageService.get(StorageService.KEYS.DISTRIBUTORS) || [];
                const index = list.findIndex(d => d.id === id);
                if (index !== -1) {
                    list[index] = { ...list[index], ...updatedData, id: id };
                    StorageService.set(StorageService.KEYS.DISTRIBUTORS, list);
                    resolve({ success: true, distributor: list[index] });
                } else {
                    reject({ success: false, message: 'Distributor not found for update' });
                }
            } catch (err) {
                reject({ success: false, message: err.message });
            }
        });
    },

    async delete(id) {
        return new Promise((resolve, reject) => {
            try {
                let list = StorageService.get(StorageService.KEYS.DISTRIBUTORS) || [];
                const initialLength = list.length;
                list = list.filter(d => d.id !== id);
                if (list.length < initialLength) {
                    StorageService.set(StorageService.KEYS.DISTRIBUTORS, list);
                    resolve({ success: true });
                } else {
                    reject({ success: false, message: 'Distributor not found for deletion' });
                }
            } catch (err) {
                reject({ success: false, message: err.message });
            }
        });
    },

    generateNextId(list) {
        const year = new Date().getFullYear();
        if (!list || list.length === 0) {
            return `DIS-${year}-001`;
        }
        const numericIds = list
            .map(item => {
                const parts = item.id ? item.id.split('-') : [];
                return parts.length === 3 ? parseInt(parts[2], 10) : 0;
            })
            .filter(num => !isNaN(num));
        
        const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 0;
        const nextNum = (maxId + 1).toString().padStart(3, '0');
        return `DIS-${year}-${nextNum}`;
    }
};
