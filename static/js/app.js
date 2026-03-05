// ============================================================
// app.js - NÚCLEO DEL SISTEMA FRONTEND (Versión Final + Toasts + Memoria de Boletas)
// ============================================================

window.currentSedeId = null;
window.myEmpId = null; // 🔥 Global para que "Mi Portal" sepa quién eres

document.addEventListener("DOMContentLoaded", () => {
    console.log("🚀 Sistema iniciado. Validando sesión...");

    // 🔥 MAGIA: RECUPERAR DOCUMENTOS GENERADOS PREVIAMENTE (Sobrevive al cierre de sesión)
    if (typeof window.MOCK !== 'undefined') {
        const docsGuardados = localStorage.getItem('docs_guardados_magia');
        if (docsGuardados) {
            window.MOCK.documentos = JSON.parse(docsGuardados);
        }
    }

    // 1. RECUPERACIÓN DE SESIÓN
    const rawData = localStorage.getItem('currentUser');
    
    // Si no hay datos, redirigimos al login
    if (!rawData) {
        if (window.location.pathname.includes('/app/')) {
            console.warn("⚠️ Sesión no encontrada. Redirigiendo al login...");
            window.location.href = '/';
            return;
        }
    }

    // Parseo seguro de datos del usuario
    let userData = { name: "Usuario Invitado", role: "Empleado", emp_id: null };
    try {
        if (rawData) {
            userData = JSON.parse(rawData);
            window.myEmpId = userData.emp_id; // 🔥 Asignamos el ID real del empleado
            console.log("✅ Usuario validado:", userData.name, "con Rol:", userData.role);
        }
    } catch (e) {
        console.error("❌ Error parseando LocalStorage:", e);
    }

    const nombres = userData.name || "Usuario";
    const cargo = userData.role || "Empleado";

    // 2. ACTUALIZACIÓN DE LA INTERFAZ (Sidebar y Header)
    const updateUI = () => {
        const elements = {
            sidebarName: document.getElementById('sidebarName'),
            sidebarRole: document.getElementById('sidebarRole'),
            sidebarInitials: document.getElementById('sidebarInitials'),
            headerName: document.getElementById('headerName'),
            headerRole: document.getElementById('headerRole'),
            headerInitials: document.getElementById('headerInitials')
        };

        // Generar iniciales (Diego Parodi -> DP)
        const iniciales = nombres.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

        if (elements.sidebarName) elements.sidebarName.innerText = nombres;
        if (elements.sidebarRole) elements.sidebarRole.innerText = cargo;
        if (elements.sidebarInitials) elements.sidebarInitials.innerText = iniciales;
        if (elements.headerName) elements.headerName.innerText = nombres;
        if (elements.headerRole) elements.headerRole.innerText = cargo;
        if (elements.headerInitials) elements.headerInitials.innerText = iniciales;
    };
    updateUI();

    // 3. CONTROL DE MENÚS Y NAVEGACIÓN INICIAL POR ROL
    const navFull = document.getElementById('navFull');
    const navEmp = document.getElementById('navEmp');
    const sedeSwitcher = document.getElementById('sedeSwitcher'); 

    if (cargo === 'Admin' || cargo === 'RRHH') {
        if(navFull) navFull.style.display = 'block';
        if(navEmp) navEmp.style.display = 'none';
        if(sedeSwitcher) sedeSwitcher.style.display = 'flex'; // Admin sí lo ve
        navigate('dashboard');
    } else {
        if(navFull) navFull.style.display = 'none';
        if(navEmp) navEmp.style.display = 'block';
        if(sedeSwitcher) sedeSwitcher.style.display = 'none'; // 🔥 Empleado NO LO VE
        navigate('mi-portal');
    }

    // 4. LLENAR SELECTOR DE SEDES (HEADER)
    const selectSede = document.getElementById('currentSede');
    if (selectSede && typeof MOCK !== 'undefined' && MOCK.sedes) {
        selectSede.innerHTML = MOCK.sedes.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('');
        if (MOCK.sedes.length > 0) {
            window.currentSedeId = parseInt(selectSede.value); 
        }
    }

    // 5. ACTIVAR EVENTOS DE CLIC EN EL MENÚ
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
            item.classList.add('active');
            const view = item.getAttribute('data-view');
            if(view) navigate(view);
        });
    });

    // 6. INICIALIZAR ICONOS Y NOTIFICACIONES
    if (typeof lucide !== 'undefined') lucide.createIcons();
    if (typeof updateVacationBadge === 'function') updateVacationBadge();
});

// ============================================================
// ENRUTADOR PRINCIPAL (Maneja el cambio de pantallas)
// ============================================================
window.navigate = function(view) {
    const contentDiv = document.getElementById('viewContent');
    if (!contentDiv) return;

    // Actualizar títulos dinámicos en la cabecera
    const titleEl = document.getElementById('headerTitle');
    const breadEl = document.getElementById('headerBreadcrumb');
    const viewName = view.charAt(0).toUpperCase() + view.slice(1).replace('-', ' ');
    
    if(titleEl) titleEl.innerText = viewName;
    if(breadEl) breadEl.innerText = 'Telecable / ' + viewName; 

    try {
        let contentHtml = '';
        
        // Mapeo de vistas a funciones de renderizado
        const views = {
            'dashboard': typeof renderDashboard === 'function' ? renderDashboard : null,
            'empleados': typeof renderEmpleados === 'function' ? renderEmpleados : null,
            'departamentos': typeof renderDepartamentos === 'function' ? renderDepartamentos : null,
            'asistencia': typeof renderAsistencia === 'function' ? renderAsistencia : null,
            'planilla': typeof renderPlanilla === 'function' ? renderPlanilla : null,
            'vacaciones': typeof renderVacaciones === 'function' ? renderVacaciones : null,
            'documentos': typeof renderDocumentos === 'function' ? renderDocumentos : null,
            'reportes': typeof renderReportes === 'function' ? renderReportes : null,
            'configuracion': typeof renderConfiguracion === 'function' ? renderConfiguracion : null,
            
            // RUTAS DEL PORTAL DEL EMPLEADO
            'mi-portal': typeof renderMiPortal === 'function' ? renderMiPortal : null,
            'mi-asistencia': typeof renderMiAsistencia === 'function' ? renderMiAsistencia : null,
            'mis-boletas': typeof renderMisBoletas === 'function' ? renderMisBoletas : null,      
            'mis-documentos': typeof renderMisDocumentos === 'function' ? renderMisDocumentos : null,
            'mis-vacaciones': typeof renderMisVacaciones === 'function' ? renderMisVacaciones : null
        };

        if (views[view]) {
            contentHtml = views[view]();
        } else {
            contentHtml = `
            <div style="padding:100px 20px; text-align:center; animation: fadeIn 0.4s;">
                <div style="width: 80px; height: 80px; background: #f1f5f9; color: #94a3b8; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                    <i data-lucide="hammer" style="width: 40px; height: 40px;"></i>
                </div>
                <h2 style="color: #1e293b; font-size:1.8rem; margin-bottom:10px;">Módulo "${view}" en construcción</h2>
                <p style="color: #64748b; font-size:1.1rem;">Estamos trabajando para habilitar esta funcionalidad pronto.</p>
            </div>`;
        }

        contentDiv.innerHTML = contentHtml;

        // Refrescar iconos de la nueva vista
        if (typeof lucide !== 'undefined') lucide.createIcons();
        
        // Volver arriba al cambiar de vista
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error("🔥 Error cargando vista:", view, error);
        contentDiv.innerHTML = `
            <div style="padding:40px; text-align:center; color:#ef4444; background:#fef2f2; border-radius:16px; margin:20px; border:1px dashed #fca5a5;">
                <i data-lucide="alert-triangle" style="width:50px; height:50px; margin-bottom:15px; opacity:0.8;"></i>
                <h3 style="margin-top:0; font-size:1.4rem;">Error al cargar el módulo</h3>
                <p style="font-family: monospace; background: white; padding: 10px; border-radius: 8px; color: #b91c1c; display: inline-block;">${error.message}</p>
            </div>`;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
};

// ============================================================
// FUNCIONES GLOBALES DE UTILIDAD Y MODALES
// ============================================================

window.openModal = function(htmlContent) {
    const container = document.getElementById('modalContainer');
    if(container) container.innerHTML = htmlContent;
};

window.closeModal = function() {
    const container = document.getElementById('modalContainer');
    if(container) container.innerHTML = '';
};

window.switchSede = function(val) {
    window.currentSedeId = parseInt(val); 
    const activeItem = document.querySelector('.nav-item.active');
    if(activeItem) navigate(activeItem.getAttribute('data-view'));
};

// 1. Función de cierre de sesión
window.logout = function() {
    openModal(`
        <div class="modal-overlay" style="z-index: 99999; backdrop-filter: blur(4px);">
            <div class="modal" style="max-width: 400px; text-align: center; padding: 40px 20px; border-radius: 20px; animation: modalPop 0.3s ease-out;">
                <div style="width: 70px; height: 70px; background: #fef2f2; color: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                    <i data-lucide="log-out" style="width: 36px; height: 36px;"></i>
                </div>
                <h3 style="font-size: 1.5rem; margin-bottom: 10px; font-weight: 800; color: #1e293b;">Cerrar Sesión</h3>
                <p style="color: #64748b; margin-bottom: 30px; line-height: 1.5; font-size:0.95rem;">¿Estás seguro de que deseas salir de tu portal de <strong>RHM</strong>?</p>
                
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button class="btn btn-ghost" style="flex: 1; justify-content: center; padding: 12px; font-weight:600;" onclick="closeModal()">Cancelar</button>
                    <button class="btn btn-primary" id="btn-logout" style="flex: 1; justify-content: center; padding: 12px; background: #ef4444; border:none; font-weight:700;" onclick="executeLogout()">
                        Sí, salir ahora
                    </button>
                </div>
            </div>
        </div>
    `);
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.executeLogout = function() {
    const btn = document.getElementById('btn-logout');
    if(btn) btn.innerHTML = '<i data-lucide="loader-2" class="lucide-spin" style="width:18px;height:18px"></i>';
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Limpiamos la sesión del usuario actual
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    
    // OJO: No borramos 'docs_guardados_magia' para que el empleado pueda ver su boleta.
    
    setTimeout(() => window.location.href = "/", 600);
};

window.updateVacationBadge = function() {
    const badge = document.getElementById('vacBadge');
    if (!badge || typeof MOCK === 'undefined' || !MOCK.vacaciones) return;

    const pendientes = MOCK.vacaciones.filter(v => v.estado === 'Pendiente').length;

    if (pendientes > 0) {
        badge.innerText = pendientes;
        badge.style.display = 'flex';
    } else {
        badge.style.display = 'none';
    }
};

// ============================================================
// 🔥 SISTEMA DE NOTIFICACIONES TOAST (ADIÓS ALERTS GRISES) 🔥
// ============================================================
window.showToast = function(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 999999; display: flex; flex-direction: column; gap: 12px; pointer-events: none;';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const bgColor = type === 'success' ? '#10b981' : (type === 'error' ? '#ef4444' : '#4f46e5');
    const iconName = type === 'success' ? 'check-circle-2' : (type === 'error' ? 'alert-triangle' : 'info');

    toast.style.cssText = `
        background: ${bgColor}; 
        color: white; 
        padding: 16px 24px; 
        border-radius: 12px; 
        box-shadow: 0 10px 25px -5px rgba(0,0,0,0.2); 
        display: flex; 
        align-items: center; 
        gap: 14px; 
        font-weight: 600; 
        font-size: 0.95rem; 
        transform: translateX(120%); 
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        pointer-events: auto;
    `;
    
    toast.innerHTML = `
        <div style="background: rgba(255,255,255,0.2); border-radius: 50%; padding: 4px; display:flex;">
            <i data-lucide="${iconName}" style="width:20px;height:20px"></i>
        </div>
        <div>${message}</div>
    `;

    container.appendChild(toast);
    
    if (typeof lucide !== 'undefined') lucide.createIcons({root: toast});

    setTimeout(() => toast.style.transform = 'translateX(0)', 10);
    
    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 400); 
    }, 3500);
};