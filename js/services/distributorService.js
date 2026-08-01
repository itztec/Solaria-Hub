import { StorageService } from './storageService.js';
import { ApiService } from './apiService.js';

export const DistributorService = {
    async getAll() {
        if (ApiService.isServerAvailable()) {
            const apiRes = await ApiService.get('distributors.php');
            if (apiRes && apiRes.success && Array.isArray(apiRes.distributors)) {
                StorageService.set(StorageService.KEYS.DISTRIBUTORS, apiRes.distributors);
                return apiRes.distributors;
            }
        }
        return StorageService.get(StorageService.KEYS.DISTRIBUTORS) || [];
    },

    async getById(id) {
        if (ApiService.isServerAvailable()) {
            const apiRes = await ApiService.get('distributors.php', { id });
            if (apiRes && apiRes.success && apiRes.distributor) {
                return apiRes.distributor;
            }
        }
        const list = StorageService.get(StorageService.KEYS.DISTRIBUTORS) || [];
        const found = list.find(d => d.id === id);
        if (found) return found;
        throw new Error('Distributor not found');
    },

    generateAutoPassword() {
        const randNum = Math.floor(1000 + Math.random() * 9000);
        return `Pass@${randNum}`;
    },

    async create(distributorData) {
        // Handle file upload if present
        if (distributorData.photo && distributorData.photo.startsWith('data:')) {
            const uploaded = await ApiService.uploadFile(distributorData.photo);
            if (uploaded && uploaded.url) distributorData.photo = uploaded.url;
        }
        if (distributorData.pdfDoc && distributorData.pdfDoc.startsWith('data:')) {
            const uploaded = await ApiService.uploadFile(distributorData.pdfDoc);
            if (uploaded && uploaded.url) distributorData.pdfDoc = uploaded.url;
        }

        if (ApiService.isServerAvailable()) {
            const apiRes = await ApiService.post('distributors.php', distributorData);
            if (apiRes && apiRes.success && apiRes.distributor) {
                const list = StorageService.get(StorageService.KEYS.DISTRIBUTORS) || [];
                list.unshift(apiRes.distributor);
                StorageService.set(StorageService.KEYS.DISTRIBUTORS, list);
                return { success: true, distributor: apiRes.distributor };
            }
        }

        // LocalStorage fallback
        const list = StorageService.get(StorageService.KEYS.DISTRIBUTORS) || [];
        const newId = this.generateNextId(list);
        const password = distributorData.password || this.generateAutoPassword();
        const newDistributor = {
            id: newId,
            password: password,
            ...distributorData,
            createdAt: new Date().toISOString()
        };
        list.unshift(newDistributor);
        StorageService.set(StorageService.KEYS.DISTRIBUTORS, list);
        return { success: true, distributor: newDistributor };
    },

    async update(id, updatedData) {
        // Handle file upload if present
        if (updatedData.photo && updatedData.photo.startsWith('data:')) {
            const uploaded = await ApiService.uploadFile(updatedData.photo);
            if (uploaded && uploaded.url) updatedData.photo = uploaded.url;
        }
        if (updatedData.pdfDoc && updatedData.pdfDoc.startsWith('data:')) {
            const uploaded = await ApiService.uploadFile(updatedData.pdfDoc);
            if (uploaded && uploaded.url) updatedData.pdfDoc = uploaded.url;
        }

        if (ApiService.isServerAvailable()) {
            const apiRes = await ApiService.post('distributors.php', { _action: 'PUT', id, ...updatedData });
            if (apiRes && apiRes.success && apiRes.distributor) {
                const list = StorageService.get(StorageService.KEYS.DISTRIBUTORS) || [];
                const idx = list.findIndex(d => d.id === id);
                if (idx !== -1) {
                    list[idx] = apiRes.distributor;
                    StorageService.set(StorageService.KEYS.DISTRIBUTORS, list);
                }
                return { success: true, distributor: apiRes.distributor };
            }
        }

        // LocalStorage fallback
        const list = StorageService.get(StorageService.KEYS.DISTRIBUTORS) || [];
        const index = list.findIndex(d => d.id === id);
        if (index !== -1) {
            list[index] = { ...list[index], ...updatedData, id: id };
            StorageService.set(StorageService.KEYS.DISTRIBUTORS, list);
            return { success: true, distributor: list[index] };
        }
        throw new Error('Distributor not found for update');
    },

    async delete(id) {
        if (ApiService.isServerAvailable()) {
            const apiRes = await ApiService.post('distributors.php', { _action: 'DELETE', id });
            if (apiRes && apiRes.success) {
                let list = StorageService.get(StorageService.KEYS.DISTRIBUTORS) || [];
                list = list.filter(d => d.id !== id);
                StorageService.set(StorageService.KEYS.DISTRIBUTORS, list);
                return { success: true };
            }
        }

        // LocalStorage fallback
        let list = StorageService.get(StorageService.KEYS.DISTRIBUTORS) || [];
        const initialLength = list.length;
        list = list.filter(d => d.id !== id);
        if (list.length < initialLength) {
            StorageService.set(StorageService.KEYS.DISTRIBUTORS, list);
            return { success: true };
        }
        throw new Error('Distributor not found for deletion');
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
