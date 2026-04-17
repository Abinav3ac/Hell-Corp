/**
 * HGE COMPONENT INJECTOR
 * Dynamically injects the shared navigation and sidebar to maintain consistency.
 */

const HGE_LAYOUT = {
    render: () => {
        const app = document.getElementById('hge-app');
        if (!app) return;

        const navHtml = `
            <nav class="hge-nav">
                <div class="hge-logo">HELL<em>CORP</em> <span style="font-size: 10px; color: var(--off); font-family: var(--font-ui); margin-left:10px; letter-spacing: 0.1em;">GLOBAL ENTERPRISE</span></div>
                <div style="display: flex; align-items: center; gap: 24px; font-size: 10px; color: var(--off);">
                    <div>NODE: <span style="color: var(--white); font-weight: bold;">HGE-CENTRAL-01</span></div>
                    <div id="hge-session-info">GUEST_MODE</div>
                </div>
            </nav>
        `;

        const sidebarHtml = `
            <aside class="hge-sidebar">
                <div class="hge-sb-section">
                    <div class="hge-sb-label">Enterprise Nodes</div>
                    <a href="/pages/dashboard.html" class="hge-sb-item">DASHBOARD</a>
                    <a href="/pages/hr.html" class="hge-sb-item">HR / PERSONNEL</a>
                    <a href="/pages/ledger.html" class="hge-sb-item">FINANCE / LEDGER</a>
                    <a href="/pages/ops.html" class="hge-sb-item">OPS / INFRASTRUCTURE</a>
                    <a href="/pages/research.html" class="hge-sb-item">R&D / ANALYTICS</a>
                </div>
                
                <div class="hge-sb-section" style="margin-top: 40px;">
                    <div class="hge-sb-label">System Control</div>
                    <a href="/pages/wiki.html" class="hge-sb-item">LEGAL / WIKI</a>
                    <a href="/login.html" class="hge-sb-item" style="color: var(--red);">TERMINATE SESSION</a>
                </div>
                
                <div style="margin-top: auto; padding: 24px; font-size: 8px; color: rgba(160,154,144,0.3); border-top: 1px solid var(--edge);">
                    HGE-CORE v4.8.2<br>
                    ENCRYPTION: SHARDED-AES<br>
                    STATUS: NOMINAL
                </div>
            </aside>
        `;

        // Create layout wrappers
        const layoutMain = document.createElement('div');
        layoutMain.className = 'hge-layout-main';
        
        const contentArea = document.createElement('main');
        contentArea.className = 'hge-content';
        contentArea.innerHTML = app.innerHTML; // Move existing page content into the new wrapper

        layoutMain.innerHTML = sidebarHtml;
        layoutMain.appendChild(contentArea);

        app.innerHTML = navHtml;
        app.appendChild(layoutMain);
        
        HGE.setActiveLink();
    }
};

window.addEventListener('load', HGE_LAYOUT.render);
