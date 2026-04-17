/**
 * HELLCORP GLOBAL ENTERPRISE (HGE) — SHARED INTERACTIVITY
 * Logic for sessions, toasts, and UI state
 */

const HGE = {
    // Session Management
    getToken: () => localStorage.getItem('hge_token'),
    setToken: (token) => localStorage.setItem('hge_token', token),
    clearToken: () => localStorage.removeItem('hge_token'),
    
    // UI Notifications
    toast: (message, type = 'info') => {
        const t = document.createElement('div');
        t.style.cssText = `
            position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
            background: var(--slab); border: 1px solid ${type === 'error' ? 'var(--red)' : 'var(--edge)'};
            color: var(--white); font-family: var(--font-ui); font-size: 10px;
            letter-spacing: 0.15em; padding: 12px 24px; z-index: 9999;
            animation: slide-up 0.2s ease both; white-space: nowrap;
        `;
        t.textContent = `⬛ ${message.toUpperCase()}`;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 4000);
    },

    // Navigation Helper
    setActiveLink: () => {
        const path = window.location.pathname;
        const links = document.querySelectorAll('.hge-sb-item');
        links.forEach(l => {
            if (l.getAttribute('href') === path || path.includes(l.getAttribute('href'))) {
                l.classList.add('active');
            }
        });
    },

    // API Wrapper
    api: async (endpoint, options = {}) => {
        const token = HGE.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };

        try {
            const response = await fetch(endpoint, { ...options, headers });
            const data = await response.json();
            
            if (!response.ok) {
                if (response.status === 401 && !window.location.pathname.includes('login')) {
                    // Redirect if unauthorized, unless we're already on login
                    HGE.toast('Session invalid. Redirecting to auth node...', 'error');
                    setTimeout(() => window.location.href = '/login.html', 1500);
                }
                throw new Error(data.message || 'HGE_API_EXCEPTION');
            }
            return data;
        } catch (err) {
            console.error('[HGE API ERROR]', err);
            throw err;
        }
    }
};

// Initialize common UI states
window.addEventListener('DOMContentLoaded', () => {
    HGE.setActiveLink();
    
    // Auto-update any stat elements with random fluctuations for "realism"
    setInterval(() => {
        const stats = document.querySelectorAll('.hge-stat-fluctuate');
        stats.forEach(s => {
            const val = parseFloat(s.textContent.replace(/[^-0-9.]/g, ''));
            const fluct = (Math.random() - 0.5) * (val * 0.05);
            s.textContent = (val + fluct).toFixed(2);
        });
    }, 5000);
});
