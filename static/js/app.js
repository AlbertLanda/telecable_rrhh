// ============================================================
// app.js - NÚCLEO DEL SISTEMA FRONTEND (Versión Final)
// ============================================================

window.currentSedeId = null;
window.myEmpId = null; 

document.addEventListener("DOMContentLoaded", () => {
    if (typeof window.MOCK !== 'undefined') {
        const docsGuardados = localStorage.getItem('docs_guardados_magia');
        if (docsGuardados) window.MOCK.documentos = JSON.parse(docsGuardados);
    }

    const rawData = localStorage.getItem('currentUser');
    if (!rawData && window.location.pathname.includes('/app/')) {
        window.location.href = '/'; return;
    }

    let userData = { name: "Usuario Invitado", role: "Empleado", emp_id: null };
    try {
        if (rawData) {
            userData = JSON.parse(rawData);
            window.myEmpId = userData.emp_id; 
        }
    } catch (e) {}

    const nombres = userData.name || "Usuario";
    const cargo = userData.role || "Empleado";

    const updateUI = () => {
        const iniciales = nombres.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        const ids = ['sidebarName', 'headerName'];
        const roleIds = ['sidebarRole', 'headerRole'];
        const initIds = ['sidebarInitials', 'headerInitials'];
        
        ids.forEach(id => { if(document.getElementById(id)) document.getElementById(id).innerText = nombres; });
        roleIds.forEach(id => { if(document.getElementById(id)) document.getElementById(id).innerText = cargo; });
        initIds.forEach(id => { if(document.getElementById(id)) document.getElementById(id).innerText = iniciales; });
    };
    updateUI();

    const navFull = document.getElementById('navFull');
    const navEmp = document.getElementById('navEmp');
    const sedeSwitcher = document.getElementById('sedeSwitcher'); 

    if (cargo === 'Admin' || cargo === 'RRHH') {
        if(navFull) navFull.style.display = 'block';
        if(navEmp) navEmp.style.display = 'none';
        if(sedeSwitcher) sedeSwitcher.style.display = 'flex'; 
        window.navigate('dashboard');
    } else {
        if(navFull) navFull.style.display = 'none';
        if(navEmp) navEmp.style.display = 'block';
        if(sedeSwitcher) sedeSwitcher.style.display = 'none'; 
        window.navigate('mi-portal');
    }

    const selectSede = document.getElementById('currentSede');
    if (selectSede && window.realSedes) {
        selectSede.innerHTML = window.realSedes.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('');
        if (window.realSedes.length > 0) window.currentSedeId = parseInt(selectSede.value); 
    }

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            const view = item.getAttribute('data-view');
            if(view) window.navigate(view);
        });
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
});

// ENRUTADOR
window.navigate = function(view) {
    const contentDiv = document.getElementById('viewContent');
    if (!contentDiv) return;

    const viewName = view.charAt(0).toUpperCase() + view.slice(1).replace('-', ' ');
    if(document.getElementById('headerTitle')) document.getElementById('headerTitle').innerText = viewName;
    if(document.getElementById('headerBreadcrumb')) document.getElementById('headerBreadcrumb').innerText = 'Telecable / ' + viewName; 

    try {
        let contentHtml = '';
        const views = {
            'dashboard': typeof window.renderDashboard === 'function' ? window.renderDashboard : null,
            'empleados': typeof window.renderEmpleados === 'function' ? window.renderEmpleados : null,
            'departamentos': typeof window.renderDepartamentos === 'function' ? window.renderDepartamentos : null,
            'asistencia': typeof window.renderAsistencia === 'function' ? window.renderAsistencia : null,
            'planilla': typeof window.renderPlanilla === 'function' ? window.renderPlanilla : null,
            'vacaciones': typeof window.renderVacaciones === 'function' ? window.renderVacaciones : null,
            'documentos': typeof window.renderDocumentos === 'function' ? window.renderDocumentos : null,
            'reportes': typeof window.renderReportes === 'function' ? window.renderReportes : null,
            'configuracion': typeof window.renderConfiguracion === 'function' ? window.renderConfiguracion : null,
            'mi-portal': typeof window.renderMiPortal === 'function' ? window.renderMiPortal : null,
            'mi-asistencia': typeof window.renderMiAsistencia === 'function' ? window.renderMiAsistencia : null,
            'mis-boletas': typeof window.renderMisBoletas === 'function' ? window.renderMisBoletas : null,      
            'mis-documentos': typeof window.renderMisDocumentos === 'function' ? window.renderMisDocumentos : null,
            'mis-vacaciones': typeof window.renderMisVacaciones === 'function' ? window.renderMisVacaciones : null
        };

        if (views[view]) {
            contentHtml = views[view]();
        } else {
            contentHtml = `<div style="padding:100px; text-align:center;"><h2>Módulo "${view}" en construcción</h2></div>`;
        }

        contentDiv.innerHTML = contentHtml;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        
        // 🔥 EL GATILLO QUE ARREGLA TUS PANTALLAS EN BLANCO 🔥
        setTimeout(() => {
            if (view === 'dashboard' && typeof window.initDashboard === 'function') window.initDashboard();
            if (view === 'planilla' && typeof window.initPlanilla === 'function') window.initPlanilla();
            if (view === 'empleados' && typeof window.initEmpleados === 'function') window.initEmpleados();
        }, 100);

        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        contentDiv.innerHTML = `<div style="padding:40px; text-align:center; color:#ef4444;"><h3>Error: ${error.message}</h3></div>`;
    }
};

// UI & GLOBALS
window.toggleDropdown = function(id) {
    const dropdown = document.getElementById(id);
    document.querySelectorAll('.dropdown-menu').forEach(d => { if (d.id !== id) d.style.display = 'none'; });
    if (dropdown) dropdown.style.display = (dropdown.style.display === 'block') ? 'none' : 'block';
};

document.addEventListener('click', function(event) {
    if (!event.target.closest('.hdr-btn') && !event.target.closest('.dropdown-menu')) {
        document.querySelectorAll('.dropdown-menu').forEach(d => d.style.display = 'none');
    }
});

window.openModal = function(htmlContent) {
    const container = document.getElementById('modalContainer');
    if(container) { container.innerHTML = htmlContent; if (typeof lucide !== 'undefined') lucide.createIcons(); }
};

window.closeModal = function() {
    const container = document.getElementById('modalContainer');
    if(container) container.innerHTML = '';
};

window.switchSede = function(val) {
    window.currentSedeId = parseInt(val); 
    const activeItem = document.querySelector('.nav-item.active');
    if(activeItem) window.navigate(activeItem.getAttribute('data-view'));
};

window.logout = function() {
    window.openModal(`
        <div class="modal-overlay" style="z-index: 99999; backdrop-filter: blur(4px);">
            <div class="modal" style="max-width: 400px; text-align: center; padding: 40px 20px; border-radius: 20px;">
                <h3 style="font-size: 1.5rem; margin-bottom: 10px; font-weight: 800; color: #1e293b;">Cerrar Sesión</h3>
                <div style="display: flex; gap: 12px; justify-content: center; margin-top:20px;">
                    <button class="btn btn-ghost" onclick="window.closeModal()">Cancelar</button>
                    <button class="btn btn-primary" style="background: #ef4444; border:none;" onclick="window.executeLogout()">Sí, salir ahora</button>
                </div>
            </div>
        </div>
    `);
};

window.executeLogout = function() {
    localStorage.removeItem('currentUser'); sessionStorage.removeItem('currentUser');
    window.location.href = "/";
};

window.showToast = function(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 999999; display: flex; flex-direction: column; gap: 12px; pointer-events: none;';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.style.cssText = `background: ${type === 'success' ? '#10b981' : '#ef4444'}; color: white; padding: 16px 24px; border-radius: 12px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.2); font-weight: 600; font-size: 0.95rem; transform: translateX(120%); transition: transform 0.4s; pointer-events: auto;`;
    toast.innerHTML = message;
    container.appendChild(toast);
    setTimeout(() => toast.style.transform = 'translateX(0)', 10);
    setTimeout(() => { toast.style.transform = 'translateX(120%)'; setTimeout(() => toast.remove(), 400); }, 3000);
};