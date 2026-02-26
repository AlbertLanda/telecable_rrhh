// ============================================================
// RHM - App Router & Bootstrap
// ============================================================

const VIEWS_FULL = {
    dashboard: { title: 'Dashboard', breadcrumb: 'RHM / Dashboard', render: renderDashboard, init: initDashboard },
    empleados: { title: 'Empleados', breadcrumb: 'RHM / Empleados', render: renderEmpleados, init: initEmpleados },
    departamentos: { title: 'Departamentos', breadcrumb: 'RHM / Departamentos', render: renderDepartamentos, init: initDepartamentos },
    asistencia: { title: 'Asistencia', breadcrumb: 'RHM / Asistencia', render: renderAsistencia, init: initAsistencia },
    planilla: { title: 'Planilla', breadcrumb: 'RHM / Planilla', render: renderPlanilla, init: initPlanilla },
    vacaciones: { title: 'Vacaciones', breadcrumb: 'RHM / Vacaciones', render: renderVacaciones, init: initVacaciones },
    documentos: { title: 'Documentos', breadcrumb: 'RHM / Documentos', render: renderDocumentos, init: initDocumentos },
    reportes: { title: 'Reportes', breadcrumb: 'RHM / Reportes', render: renderReportes, init: initReportes },
    configuracion: { title: 'Configuración', breadcrumb: 'RHM / Configuración', render: renderConfiguracion, init: initConfiguracion },
};

const VIEWS_EMP = {
    'mi-portal': { title: 'Mi Portal', breadcrumb: 'Mi Espacio / Inicio', render: renderMiPortal, init: initMiPortal },
    'mi-asistencia': { title: 'Mi Asistencia', breadcrumb: 'Mi Espacio / Asistencia', render: renderMiAsistencia, init: () => { } },
    'mis-boletas': { title: 'Mis Boletas', breadcrumb: 'Mi Espacio / Boletas', render: renderMisBoletas, init: initMisBoletas },
    'mis-documentos': { title: 'Mis Documentos', breadcrumb: 'Mi Espacio / Documentos', render: renderMisDocumentos, init: () => { } },
    'mis-vacaciones': { title: 'Mis Vacaciones', breadcrumb: 'Mi Espacio / Vacaciones', render: renderMisVacaciones, init: () => { } },
};

let currentUser = null;
let isEmployee = false;
let myEmpId = null;
let VIEWS = {};
let currentSedeId = 1;

function init() {
    const stored = sessionStorage.getItem('rhm_user') || localStorage.getItem('rhm_user');
    if (!stored) { window.location.href = '/'; return; }
    currentUser = JSON.parse(stored);

    isEmployee = currentUser.role === 'Empleado';
    myEmpId = USER_EMP_MAP[currentUser.email] ?? null;
    VIEWS = isEmployee ? VIEWS_EMP : VIEWS_FULL;

    // Cargar la última sede seleccionada
    const savedSedeId = localStorage.getItem('rhm_sede_id');
    if (savedSedeId) currentSedeId = parseInt(savedSedeId);

    // Setear info en UI
    const initials = currentUser.initials || (currentUser.name ? currentUser.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'US');
    document.getElementById('headerInitials').textContent = initials;
    document.getElementById('headerName').textContent = currentUser.name || currentUser.nombre;
    document.getElementById('headerRole').textContent = currentUser.role;

    // Poblar el selector de Sedes de forma inteligente
    const switcher = document.getElementById('currentSede');
    if (switcher) {
        if (isEmployee) {
            document.getElementById('sedeSwitcher').style.display = 'none';
        } else {
            if (MOCK.sedes && MOCK.sedes.length > 0) {
                const sedeExists = MOCK.sedes.find(s => s.id === currentSedeId);
                if (!sedeExists) currentSedeId = MOCK.sedes[0].id; // Fallback
                
                switcher.innerHTML = MOCK.sedes.map(s => 
                    `<option value="${s.id}" ${s.id === currentSedeId ? 'selected' : ''}>${s.nombre}</option>`
                ).join('');
            } else {
                switcher.innerHTML = `<option value="">⚠️ Sin sedes</option>`;
            }
        }
    }

    // Poblar Notificaciones Reales
    const pendVacs = MOCK.vacaciones ? MOCK.vacaciones.filter(v => v.estado === 'Pendiente') : [];
    const notifList = document.getElementById('notifList');
    const notifDot = document.getElementById('notifDot');
    const vacBadge = document.getElementById('vacBadge');

    if (pendVacs.length > 0) {
        if(notifDot) notifDot.style.display = 'block';
        if (vacBadge) vacBadge.textContent = pendVacs.length;
        
        if(notifList) {
            notifList.innerHTML = pendVacs.map(v => {
                const emp = getEmp(v.empId);
                const empName = emp ? empFullName(emp) : 'Un empleado';
                return `
                <div class="notif-item" onclick="navigate('vacaciones'); toggleDropdown('notifDropdown');">
                    <div class="notif-icon"><i data-lucide="umbrella" style="width:18px;"></i></div>
                    <div>
                        <div class="notif-text">El personal <strong>${empName}</strong> solicitó vacaciones.</div>
                        <span class="notif-time">Requiere tu aprobación</span>
                    </div>
                </div>`;
            }).join('');
        }
    } else {
        if(notifDot) notifDot.style.display = 'none';
        if (vacBadge) vacBadge.style.display = 'none';
        if(notifList) notifList.innerHTML = `<div style="padding:24px;text-align:center;color:var(--text-muted);font-size:0.85rem;"><i data-lucide="check-circle" style="opacity:0.5; margin-bottom:8px; display:block; margin-inline:auto;"></i>Todo al día. No hay notificaciones nuevas.</div>`;
    }

    // Show correct sidebar nav
    if (isEmployee) {
        document.getElementById('navFull').style.display = 'none';
        document.getElementById('navEmp').style.display = '';
    } else {
        document.getElementById('navFull').style.display = '';
        document.getElementById('navEmp').style.display = 'none';
    }

    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
        item.addEventListener('click', () => navigate(item.dataset.view));
    });

    const hash = window.location.hash.replace('#', '');
    const defaultView = isEmployee ? 'mi-portal' : 'dashboard';
    navigate(VIEWS[hash] ? hash : defaultView);

    lucide.createIcons();
}

function switchCompany(id) {
    currentCompanyId = parseInt(id);
    localStorage.setItem('rhm_company_id', id);
    const hash = window.location.hash.replace('#', '');
    navigate(hash);
}

function navigate(viewName) {
    if (!VIEWS[viewName]) viewName = isEmployee ? 'mi-portal' : 'dashboard';
    const v = VIEWS[viewName];

    // Update active nav
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.view === viewName);
    });

    // Update header
    document.getElementById('headerTitle').textContent = v.title;
    document.getElementById('headerBreadcrumb').textContent = v.breadcrumb;

    // Render view
    const container = document.getElementById('viewContent');
    container.innerHTML = v.render();
    lucide.createIcons();
    if (v.init) v.init();

    window.location.hash = viewName;
}

function logout() {
    sessionStorage.removeItem('rhm_user');
    localStorage.removeItem('rhm_user');
    window.location.href = '/';
}

function openModal(html) {
    document.getElementById('modalContainer').innerHTML = html;
    lucide.createIcons();
    document.getElementById('modalContainer').querySelector('.modal-overlay')
        .addEventListener('click', e => { if (e.target.classList.contains('modal-overlay')) closeModal(); });
}

function closeModal() {
    document.getElementById('modalContainer').innerHTML = '';
}

// Digital Signature Feature
function showSignModal(docId) {
    const doc = MOCK.documentos.find(d => d.id === docId);
    const emp = getEmp(doc.empId);

    const html = `
        <div class="modal-overlay">
            <div class="modal-content" style="max-width:450px animation: modalSlideUp 0.3s ease;">
                <div class="modal-header">
                    <h3>Firma Digital de Boleta</h3>
                    <button class="close-btn" onclick="closeModal()"><i data-lucide="x"></i></button>
                </div>
                <div class="modal-body">
                    <div style="background:var(--primary-50); padding:12px; border-radius:var(--r-sm); margin-bottom:16px;">
                        <p style="font-size:0.85rem; color:var(--primary-dark);">Estás a punto de firmar digitalmente el documento: <strong>${doc.nombre}</strong></p>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Nombre Completo (para firma)</label>
                        <div class="input-wrap">
                            <i data-lucide="user" class="input-icon-l" style="width:16px;height:16px"></i>
                            <input type="text" id="sign_name" value="${empFullName(emp)}" readonly>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">DNI</label>
                        <div class="input-wrap">
                            <i data-lucide="credit-card" class="input-icon-l" style="width:16px;height:16px"></i>
                            <input type="text" id="sign_dni" value="${emp.dni}" readonly>
                        </div>
                    </div>
                    
                    <div style="margin-top:20px; font-size:0.75rem; color:var(--text-secondary); display:flex; gap:8px;">
                        <i data-lucide="info" style="width:14px;height:14px;flex-shrink:0"></i>
                        <p>Al hacer clic en "Confirmar Firma", declaras que los datos son correctos y aceptas el contenido del documento.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-gray" onclick="closeModal()">Cancelar</button>
                    <button class="btn btn-primary" onclick="confirmSignature(${docId})">Confirmar Firma</button>
                </div>
            </div>
        </div>
    `;
    openModal(html);
}

function confirmSignature(docId) {
    const doc = MOCK.documentos.find(d => d.id === docId);
    const emp = getEmp(doc.empId);

    // Update mock data state
    doc.signed = true;
    doc.signedBy = empFullName(emp);
    doc.signedDni = emp.dni;
    const now = new Date();
    doc.signedAt = now.toISOString().split('T')[0] + ' ' + now.toTimeString().split(' ')[0].substring(0, 5);

    closeModal();

    // Refresh current view
    const hash = window.location.hash.replace('#', '');
    navigate(hash);

    // Potential notification
    alert('¡Boleta firmada con éxito!');
}

// Funciones para Menús Desplegables
function toggleDropdown(id) {
    // Cerramos todos los demás primero
    document.querySelectorAll('.dropdown-menu').forEach(el => {
        if(el.id !== id) el.classList.remove('show');
    });
    // Abrimos el que clickeamos
    document.getElementById(id).classList.toggle('show');
}

// Cerrar al hacer clic afuera
window.addEventListener('click', function(e) {
    if (!e.target.closest('.hdr-btn') && !e.target.closest('.dropdown-menu')) {
        document.querySelectorAll('.dropdown-menu').forEach(el => el.classList.remove('show'));
    }
});

// Función para cambiar de Sede
function switchSede(id) {
    currentSedeId = parseInt(id);
    localStorage.setItem('rhm_sede_id', id);
    const hash = window.location.hash.replace('#', '');
    navigate(hash);
}

window.addEventListener('DOMContentLoaded', init);
window.navigate = navigate;
window.logout = logout;
window.closeModal = closeModal;
window.switchCompany = switchCompany;
window.showSignModal = showSignModal;
window.confirmSignature = confirmSignature;
