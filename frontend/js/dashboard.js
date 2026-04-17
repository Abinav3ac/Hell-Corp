/**
 * HGE Central Management Dashboard Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize global configuration (Susceptible to DOM Clobbering)
    window.hgeConfig = window.hgeConfig || {
        environment: 'production',
        logLevel: 'info',
        enableDiagnostics: false
    };

    if (document.getElementById('assetTable')) {
        initDashboard();
    }
});

async function initDashboard() {
    try {
        // Load stats from backend
        // Note: Real data would be fetched from /api/finance/overview etc.
        // For now, we use a mix of real API calls and realistic placeholders.
        
        loadAssetTable();
        initTerminalStream();
        
    } catch (err) {
        console.error('HGE-Dashboard-Error:', err);
    }
}

async function loadAssetTable() {
    const tableBody = document.querySelector('#assetTable tbody');
    if (!tableBody) return;

    try {
        // Fetch real assets from backend (Asset Model)
        const data = await API.getAssets({ limit: 10 });
        const assets = data.assets || [];

        if (assets.length > 0) {
            tableBody.innerHTML = ''; // Clear default placeholders
            
            assets.forEach(asset => {
                const tr = document.createElement('tr');
                const statusClass = asset.status === 'active' ? 'success' : (asset.status === 'maintenance' ? 'warning' : 'error');
                const statusText = asset.status.charAt(0).toUpperCase() + asset.status.slice(1);
                
                tr.innerHTML = `
                    <td>
                        <i class="fas fa-${getAssetIcon(asset.category)}" style="margin-right: 8px; color: var(--brand-primary);"></i>
                        ${Utils.escapeHtml(asset.name)}
                    </td>
                    <td>${Utils.escapeHtml(asset.department || 'Corporate')}</td>
                    <td><span class="badge badge-${statusClass}">${statusText}</span></td>
                    <td>${asset.metatags?.uptime || '99.9%'}</td>
                    <td>
                        <button class="btn btn-secondary btn-sm" onclick="viewAssetDetails('${asset._id}')">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        }
           if (user) {
        // VULNERABLE: Direct rendering of user department (Potential DOM Clobbering)
        const deptEl = document.getElementById('userRole');
        if (deptEl) {
            // If user data contains a malicious ID (e.g. "hgeConfig"), 
            // it can clobber the global window.hgeConfig object.
            deptEl.innerHTML = `<span id="${user.department || 'Staff'}">${user.role.toUpperCase()} [${user.department || 'Node'}]</span>`;
        }
    }
} catch (err) {
        console.warn('Could not load dynamic assets, using fallback enterprise data.', err);
    }
}

function getAssetIcon(category) {
    const icons = {
        'cloud_node': 'server',
        'compute_cluster': 'microchip',
        'database': 'database',
        'network_appliance': 'network-wired',
        'security_gateway': 'shield-alt',
        'software_asset': 'code'
    };
    return icons[category] || 'box';
}

function initTerminalStream() {
    const terminal = document.getElementById('terminalOutput');
    if (!terminal) return;

    const messages = [
        "Syncing with Singapore Cluster...",
        "Validating encrypted payloads...",
        "Health check: 142 nodes responsive.",
        "Anomaly detected: Unexpected traffic on Node-7",
        "Clearing buffer caches...",
        "Maintenance window pushed to 04:00 UTC",
        "Backup job #8872 completed (12.4TB)"
    ];

    setInterval(() => {
        const msg = messages[Math.floor(Math.random() * messages.length)];
        const line = document.createElement('div');
        const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
        line.innerHTML = `<span style="color: #6e7681;">[${time}]</span> ${msg}`;
        terminal.appendChild(line);
        
        if (terminal.children.length > 8) {
            terminal.firstChild.remove();
        }
    }, 5000);
}

// Global functions for inline event handlers
window.viewAssetDetails = async (id) => {
    Utils.showToast('Retrieving asset documentation...', 'info');
    // Implement detail view / modal here later
};
