/**
 * SETTINGS SERVICE
 * Manages solar company profile settings (Logo, Company Name, Address, Contact).
 */

import { StorageService } from './storageService.js';

export const SettingsService = {
    async getSettings() {
        return new Promise((resolve) => {
            const data = StorageService.get(StorageService.KEYS.SETTINGS);
            resolve(data || {});
        });
    },

    async updateSettings(newSettings) {
        return new Promise((resolve, reject) => {
            try {
                const current = StorageService.get(StorageService.KEYS.SETTINGS) || {};
                const updated = { ...current, ...newSettings };
                StorageService.set(StorageService.KEYS.SETTINGS, updated);
                resolve({ success: true, settings: updated });
            } catch (e) {
                reject({ success: false, message: e.message });
            }
        });
    }
};
