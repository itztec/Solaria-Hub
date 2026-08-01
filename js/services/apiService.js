/**
 * API SERVICE
 * Connects frontend JS services with cPanel PHP/MySQL REST API.
 * Includes automatic detection for web server vs local file environment.
 */

const API_BASE_URL = 'api/';

export const ApiService = {
    // Check if running on web server (http/https) vs static file system
    isServerAvailable() {
        return window.location.protocol.startsWith('http');
    },

    async request(endpoint, options = {}) {
        if (!this.isServerAvailable()) {
            return { isServerAvailable: false };
        }

        try {
            const url = API_BASE_URL + endpoint;
            const defaultHeaders = {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            };

            const config = {
                method: options.method || 'GET',
                headers: { ...defaultHeaders, ...(options.headers || {}) }
            };

            if (options.body) {
                config.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
            }

            const response = await fetch(url, config);
            const data = await response.json().catch(() => null);

            if (!response.ok) {
                return {
                    success: false,
                    status: response.status,
                    message: data?.message || `Server error (${response.status})`
                };
            }

            return data || { success: true };
        } catch (err) {
            console.warn('[ApiService] Fetch error, falling back to LocalStorage:', err);
            return { isServerAvailable: false, error: err.message };
        }
    },

    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    },

    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: data
        });
    },

    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: data
        });
    },

    async delete(endpoint, data = {}) {
        const queryString = typeof data === 'object' && !Array.isArray(data) ? new URLSearchParams(data).toString() : '';
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, {
            method: 'DELETE',
            body: typeof data === 'object' ? data : null
        });
    },

    async uploadFile(fileOrBase64) {
        if (!this.isServerAvailable()) return null;

        if (fileOrBase64 instanceof File) {
            const formData = new FormData();
            formData.append('file', fileOrBase64);
            try {
                const res = await fetch(API_BASE_URL + 'upload.php', {
                    method: 'POST',
                    body: formData
                });
                return await res.json();
            } catch (e) {
                console.error('File upload failed:', e);
                return null;
            }
        } else if (typeof fileOrBase64 === 'string' && fileOrBase64.startsWith('data:')) {
            return this.post('upload.php', { base64Data: fileOrBase64 });
        }
        return null;
    }
};
