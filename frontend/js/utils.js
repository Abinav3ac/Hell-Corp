/**
 * HGE Unified Utilities
 */

const Utils = {
    // ── Formatting ──────────────────────────────────────────────
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(amount);
    },

    formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(new Date(date));
    },

    // ── HTML Escaping (Crucial for UI, except where VULN is intended) ─
    escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    // ── Notifications ───────────────────────────────────────────
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type} animate-in`;
        toast.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: var(--bg-panel);
            border: 1px solid var(--border-main);
            border-left: 4px solid var(--status-${type === 'error' ? 'error' : (type === 'success' ? 'success' : 'info')});
            padding: 16px 24px;
            border-radius: var(--radius-md);
            color: var(--text-primary);
            box-shadow: var(--shadow-md);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 0.875rem;
        `;
        
        const icon = type === 'error' ? 'times-circle' : (type === 'success' ? 'check-circle' : 'info-circle');
        toast.innerHTML = `<i class="fas fa-${icon}" style="color: var(--status-${type === 'error' ? 'error' : (type === 'success' ? 'success' : 'info')});"></i> <span>${this.escapeHtml(message)}</span>`;
        
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    },

    // ── URL Params ──────────────────────────────────────────────
    getParam(name) {
        return new URLSearchParams(window.location.search).get(name);
    }
};
