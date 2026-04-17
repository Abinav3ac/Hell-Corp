/**
 * HGE Identity & Access Management (IAM) Client
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on the login page
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        initLoginPage();
    } else {
        checkAuth();
    }
});

function checkAuth() {
    const user = getSessionUser();
    const token = localStorage.getItem('hc_token');
    
    // Redirect if not logged in (except on login/register pages)
    const isAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('register.html');
    
    if (!token && !isAuthPage) {
        window.location.href = '/login.html';
        return;
    }

    if (user) {
        updateUIWithUser(user);
    }
}

function getSessionUser() {
    try {
        const raw = localStorage.getItem('hc_user');
        return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
}

function updateUIWithUser(user) {
    const nameEl = document.getElementById('username');
    const roleEl = document.getElementById('userRole');
    
    if (nameEl) nameEl.textContent = user.username || 'Employee';
    if (roleEl) roleEl.textContent = user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Staff';
    
    // Handle admin link visibility
    const adminLink = document.getElementById('adminLink');
    if (adminLink && user.role !== 'admin' && user.role !== 'operator') {
        adminLink.style.display = 'none';
        
        // VULNERABILITY: Insecure direct object reference / Hidden link
        // We leave the IDOR endpoint accessible even if the link is hidden.
    }
}

async function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = loginForm.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Authenticating...';
        
        const username = document.getElementById('usernameInput').value;
        const password = document.getElementById('passwordInput').value;
        
        try {
            const res = await API.login(username, password);
            Utils.showToast('Access Granted. Redirecting...', 'success');
            
            // Subtle Open Redirect vulnerability path via "next" param
            const next = Utils.getParam('next') || '/';
            setTimeout(() => window.location.href = next, 1000);
            
        } catch (err) {
            Utils.showToast(err.message || 'Authentication Failed', 'error');
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    });
}

// Global logout handler
document.addEventListener('click', (e) => {
    if (e.target.closest('#logoutBtn')) {
        API.logout();
    }
});
