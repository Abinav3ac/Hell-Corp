/**
 * HELLCORP GLOBAL ENTERPRISE — Core API Client v2.4
 * All connectivity to HGE Backend systems is routed through this interface.
 * Access is restricted to authorized personnel only.
 */

const API = {
    // ── Authentication & Identity ────────────────────────────────
    async login(username, password, remember = false) {
        const data = await apiCall('/api/auth/login', {
            method: 'POST',
            body: { username, password, remember }
        });
        if (data.token) setAuth(data.token, data.user);
        return data;
    },

    async register(userData) {
        const data = await apiCall('/api/auth/register', {
            method: 'POST',
            body: userData
        });
        if (data.token) setAuth(data.token, data.user);
        return data;
    },

    async logout() {
        clearAuth();
        window.location.href = '/login.html';
    },

    async getMe() {
        return apiCall('/api/auth/me');
    },

    // ── Enterprise Asset Management ──────────────────────────────
    async getAssets(params = {}) {
        const q = new URLSearchParams(params).toString();
        return apiCall('/api/assets?' + q);
    },

    async getAsset(id) {
        return apiCall('/api/assets/' + id);
    },

    // ── Financial Operations ─────────────────────────────────────
    async getFinancialOverview() {
        return apiCall('/api/finance/overview');
    },

    async getTransactions() {
        return apiCall('/api/finance/transactions');
    },

    async initiateTransfer(toAccount, amount) {
        return apiCall('/api/finance/transfer', {
            method: 'POST',
            body: { toAccount, amount }
        });
    },

    // ── Human Resources (HR) ─────────────────────────────────────
    async getEmployees(params = {}) {
        const q = new URLSearchParams(params).toString();
        return apiCall('/api/hr/employees?' + q);
    },

    async getEmployeeDetails(id) {
        return apiCall('/api/hr/employees/' + id);
    },

    async updateEmployeeProfile(id, data) {
        return apiCall('/api/hr/employees/' + id, {
            method: 'PUT',
            body: data
        });
    },

    // ── Infrastructure & Network ─────────────────────────────────
    async getNetworkNodes() {
        return apiCall('/api/infrastructure/nodes');
    },

    async runDiagnostic(nodeId) {
        return apiCall('/api/infrastructure/nodes/' + nodeId + '/diagnostic', {
            method: 'POST'
        });
    },

    // ── R&D / Development ────────────────────────────────────────
    async getRepositories() {
        return apiCall('/api/dev/repositories');
    },

    async getPipelineStatus() {
        return apiCall('/api/dev/pipeline');
    },

    // ── Administrative & Internal Control ────────────────────────
    async getAdminDashboard() {
        return apiCall('/api/admin/dashboard');
    },

    async getSystemLogs() {
        return apiCall('/api/admin/logs');
    },

    async getSecurityAlerts() {
        return apiCall('/api/admin/alerts');
    },

    // ── Internal Utilities (SSRF / Path Traversal Vectors) ───────
    // These are maintained for internal diagnostic purposes
    async fetchRemoteResource(url) {
        return apiCall('/api/utils/fetch', { method: 'POST', body: { url } });
    },

    async readLogFile(path) {
        return apiCall('/api/utils/logs?file=' + encodeURIComponent(path));
    },

    // ── Unified Search ───────────────────────────────────────────
    async search(query) {
        return apiCall('/api/search?q=' + encodeURIComponent(query));
    }
};

/**
 * Global API Utility Function
 */
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('hc_token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
    };

    try {
        const response = await fetch(endpoint, {
            ...options,
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'System error occurred');
        }

        return data;
    } catch (err) {
        console.warn(`HGE-API [${endpoint}]:`, err.message);
        throw err;
    }
}

function setAuth(token, user) {
    localStorage.setItem('hc_token', token);
    localStorage.setItem('hc_user', JSON.stringify(user));
}

function clearAuth() {
    localStorage.removeItem('hc_token');
    localStorage.removeItem('hc_user');
}
