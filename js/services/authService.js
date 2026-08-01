import { StorageService } from './storageService.js';
import { ApiService } from './apiService.js';

export const AuthService = {
    getChannelPartnerCreds() {
        const stored = StorageService.get(StorageService.KEYS.ADMIN_CREDS);
        if (stored && stored.username && stored.password) {
            return stored;
        }
        return { username: 'ASM26itztec', password: 'A2S6MSS' };
    },

    setChannelPartnerCreds(username, password) {
        StorageService.set(StorageService.KEYS.ADMIN_CREDS, { username, password });
        if (ApiService.isServerAvailable()) {
            ApiService.post('auth.php', { action: 'update_admin_creds', username, password });
        }
    },

    getMasterPassword() {
        const sys = StorageService.get(StorageService.KEYS.SYSTEM_CONFIG);
        if (sys && sys.masterPassword) {
            return sys.masterPassword;
        }
        return 'SUPER@ASM2026';
    },

    setMasterPassword(newPassword) {
        const sys = StorageService.get(StorageService.KEYS.SYSTEM_CONFIG) || {};
        sys.masterPassword = newPassword;
        StorageService.set(StorageService.KEYS.SYSTEM_CONFIG, sys);
        if (ApiService.isServerAvailable()) {
            ApiService.post('auth.php', { action: 'update_master_password', password: newPassword });
        }
    },

    isMasterAuthenticated() {
        return sessionStorage.getItem('solar_master_authenticated') === 'true';
    },

    async verifyMasterPassword(password) {
        if (ApiService.isServerAvailable()) {
            const apiRes = await ApiService.post('auth.php', { action: 'verify_master_password', password });
            if (apiRes && apiRes.success) {
                sessionStorage.setItem('solar_master_authenticated', 'true');
                return true;
            }
        }
        const masterPass = this.getMasterPassword();
        if (password === masterPass) {
            sessionStorage.setItem('solar_master_authenticated', 'true');
            return true;
        }
        return false;
    },

    masterLogout() {
        sessionStorage.removeItem('solar_master_authenticated');
    },

    isSiteLocked() {
        const sys = StorageService.get(StorageService.KEYS.SYSTEM_CONFIG);
        return !!(sys && sys.isLocked);
    },

    setSiteLock(isLocked, reason = '') {
        const sys = StorageService.get(StorageService.KEYS.SYSTEM_CONFIG) || {};
        sys.isLocked = !!isLocked;
        sys.lockReason = reason;
        StorageService.set(StorageService.KEYS.SYSTEM_CONFIG, sys);

        if (ApiService.isServerAvailable()) {
            ApiService.post('auth.php', { action: 'set_site_lock', isLocked, reason });
        }
    },

    async login(username, password, selectedRole = 'Channel Partner', targetDistId = null) {
        if (!username && !targetDistId) {
            throw { success: false, message: 'Please select or enter username' };
        }

        if (ApiService.isServerAvailable()) {
            const apiRes = await ApiService.post('auth.php', {
                action: 'login',
                username,
                password,
                selectedRole,
                targetDistId
            });

            if (apiRes && apiRes.success && apiRes.user) {
                StorageService.set(StorageService.KEYS.AUTH_USER, apiRes.user);
                return apiRes;
            } else if (apiRes && apiRes.message) {
                throw { success: false, message: apiRes.message };
            }
        }

        // LocalStorage fallback
        if (this.isSiteLocked() && username !== 'superadmin_master') {
            throw { success: false, message: 'Service Temporarily Suspended due to maintenance or subscription status.' };
        }

        const cpCreds = this.getChannelPartnerCreds();
        const uInput = (username || '').trim();
        const pInput = (password || '').trim();

        const distList = StorageService.get(StorageService.KEYS.DISTRIBUTORS) || [];
        const searchKey = (targetDistId || username || '').toLowerCase().trim();
        const userKey = (username || '').toLowerCase().trim();

        if (selectedRole === 'Channel Partner') {
            if (uInput !== cpCreds.username || pInput !== cpCreds.password) {
                throw { success: false, message: 'Invalid Channel Partner Username or Password' };
            }
        }

        const matchedDist = distList.find(d => 
            (d.id && d.id.toLowerCase() === searchKey) || 
            (d.id && d.id.toLowerCase() === userKey) || 
            (d.email && d.email.toLowerCase() === searchKey) ||
            (d.companyName && d.companyName.toLowerCase().includes(searchKey)) ||
            (d.companyName && d.companyName.toLowerCase().includes(userKey))
        );

        const isDistributorMode = selectedRole === 'Distributor';

        let sessionData;
        if (isDistributorMode) {
            const distObj = matchedDist || (distList.length > 0 ? distList[0] : { id: 'DIS-2026-001', companyName: 'GreenGrid Solar Tech', distributorName: 'Rajesh Sharma', password: 'password123' });
            
            if (distObj.password && pInput && distObj.password !== pInput) {
                throw { success: false, message: 'Invalid Distributor Password' };
            }

            sessionData = {
                username: username || distObj.id,
                name: distObj.companyName,
                distributorName: distObj.distributorName,
                role: 'Distributor',
                distributorId: distObj.id,
                email: distObj.email || `${distObj.id.toLowerCase()}@distributor.com`,
                token: 'solar_token_' + Date.now()
            };
        } else {
            sessionData = {
                username: cpCreds.username,
                name: 'Channel Partner Admin',
                role: 'Channel Partner',
                email: cpCreds.username + '@asmmoneyshefsolar.com',
                token: 'solar_token_' + Date.now()
            };
        }

        StorageService.set(StorageService.KEYS.AUTH_USER, sessionData);
        return { success: true, user: sessionData };
    },

    logout() {
        StorageService.remove(StorageService.KEYS.AUTH_USER);
        window.location.hash = '#login';
    },

    getCurrentUser() {
        const user = StorageService.get(StorageService.KEYS.AUTH_USER);
        if (user && user.role === 'Distributor') {
            const distList = StorageService.get(StorageService.KEYS.DISTRIBUTORS) || [];
            const targetId = user.distributorId || user.username;
            const found = distList.find(d => 
                d.id.toLowerCase() === (targetId || '').toLowerCase() ||
                d.id.toLowerCase() === (user.username || '').toLowerCase()
            );
            if (found) {
                user.name = found.companyName;
                user.distributorName = found.distributorName;
                user.distributorId = found.id;
            } else if (!user.name || user.name.startsWith('DIS-')) {
                user.name = 'GreenGrid Solar Tech';
            }
        }
        return user;
    },

    isChannelPartner() {
        const user = this.getCurrentUser();
        return user && user.role === 'Channel Partner';
    },

    isDistributor() {
        const user = this.getCurrentUser();
        return user && user.role === 'Distributor';
    },

    isAuthenticated() {
        const user = this.getCurrentUser();
        return !!(user && user.token);
    }
};
