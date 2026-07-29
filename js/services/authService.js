/**
 * AUTH SERVICE
 * Handles fake admin authentication, login/logout, and active user session state.
 */

import { StorageService } from './storageService.js';

const DEMO_USER = {
    username: 'admin',
    password: 'password123',
    name: 'Solar Operations Director',
    role: 'System Administrator',
    email: 'admin@solariaenergy.com'
};

export const AuthService = {
    async login(username, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (username === DEMO_USER.username && password === DEMO_USER.password) {
                    const sessionData = {
                        username: DEMO_USER.username,
                        name: DEMO_USER.name,
                        role: DEMO_USER.role,
                        email: DEMO_USER.email,
                        token: 'solar_token_' + Date.now()
                    };
                    StorageService.set(StorageService.KEYS.AUTH_USER, sessionData);
                    resolve({ success: true, user: sessionData });
                } else if (username && password) {
                    // Allow login for testing with any valid non-empty input as demo admin
                    const sessionData = {
                        username: username,
                        name: 'Solar Administrator',
                        role: 'Administrator',
                        email: username + '@solar.com',
                        token: 'solar_token_' + Date.now()
                    };
                    StorageService.set(StorageService.KEYS.AUTH_USER, sessionData);
                    resolve({ success: true, user: sessionData });
                } else {
                    reject({ success: false, message: 'Invalid username or password' });
                }
            }, 300);
        });
    },

    logout() {
        StorageService.remove(StorageService.KEYS.AUTH_USER);
        window.location.hash = '#login';
    },

    getCurrentUser() {
        return StorageService.get(StorageService.KEYS.AUTH_USER);
    },

    isAuthenticated() {
        const user = this.getCurrentUser();
        return !!(user && user.token);
    }
};
