/**
 * AUTH SERVICE
 * Handles fake admin authentication, login/logout, and active user session state.
 */

import { StorageService } from './storageService.js';

const USERS = {
    CHANNEL_PARTNER: {
        username: 'channelpartner',
        name: 'Channel Partner Admin',
        role: 'Channel Partner',
        email: 'cp@solariaenergy.com'
    },
    DISTRIBUTOR: {
        username: 'distributor',
        name: 'GreenGrid Solar Tech (Distributor)',
        role: 'Distributor',
        distributorId: 'DIS-2026-001',
        email: 'rajesh@greengrid.in'
    }
};

export const AuthService = {
    async login(username, password, selectedRole = 'Channel Partner', targetDistId = null) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (!username && !targetDistId) {
                    reject({ success: false, message: 'Please select or enter distributor username' });
                    return;
                }

                const distList = StorageService.get(StorageService.KEYS.DISTRIBUTORS) || [];
                const searchKey = (targetDistId || username || '').toLowerCase().trim();
                const userKey = (username || '').toLowerCase().trim();

                const matchedDist = distList.find(d => 
                    (d.id && d.id.toLowerCase() === searchKey) || 
                    (d.id && d.id.toLowerCase() === userKey) || 
                    (d.email && d.email.toLowerCase() === searchKey) ||
                    (d.companyName && d.companyName.toLowerCase().includes(searchKey)) ||
                    (d.companyName && d.companyName.toLowerCase().includes(userKey))
                );

                const isDistributorMode = selectedRole === 'Distributor' || 
                                          searchKey.includes('distributor') || 
                                          userKey.includes('distributor') ||
                                          searchKey.startsWith('dis-') || 
                                          userKey.startsWith('dis-') ||
                                          !!matchedDist;

                let sessionData;
                if (isDistributorMode) {
                    const distObj = matchedDist || (distList.length > 0 ? distList[0] : { id: 'DIS-2026-001', companyName: 'GreenGrid Solar Tech', distributorName: 'Rajesh Sharma' });
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
                        username: username,
                        name: username === 'admin' ? 'Channel Partner Director' : 'Channel Partner Admin',
                        role: 'Channel Partner',
                        email: username + '@solariaenergy.com',
                        token: 'solar_token_' + Date.now()
                    };
                }

                StorageService.set(StorageService.KEYS.AUTH_USER, sessionData);
                resolve({ success: true, user: sessionData });
            }, 200);
        });
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
