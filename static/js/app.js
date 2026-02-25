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
let currentCompanyId = 1;

function init() {
    const stored = sessionStorage.getItem('rhm_user');
    if (!stored) { window.location.href = 'index.html'; return; }
    currentUser = JSON.parse(stored);

    // Determine role
    isEmployee = currentUser.role === 'Empleado';
    myEmpId = USER_EMP_MAP[currentUser.email] ?? null;
    VIEWS = isEmployee ? VIEWS_EMP : VIEWS_FULL;

    // Load last selected company
    const savedCompanyId = localStorage.getItem('rhm_company_id');
    if (savedCompanyId) currentCompanyId = parseInt(savedCompanyId);

    // Set user info in UI
    const initials = currentUser.initials || (currentUser.name ? currentUser.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'US');
    document.getElementById('sidebarInitials').textContent = initials;
    document.getElementById('sidebarName').textContent = currentUser.name || currentUser.nombre;
    document.getElementById('sidebarRole').textContent = currentUser.role;
    document.getElementById('headerInitials').textContent = initials;
    document.getElementById('headerName').textContent = currentUser.name || currentUser.nombre;
    document.getElementById('headerRole').textContent = currentUser.role;

    // Poplate company switcher
    const switcher = document.getElementById('currentCompany');
    if (switcher) {
        if (isEmployee) {
            document.getElementById('companySwitcher').style.display = 'none';
        } else {
            switcher.innerHTML = MOCK.empresas.map(c => `<option value="${c.id}" ${c.id === currentCompanyId ? 'selected' : ''}>${c.nombre}</option>`).join('');
        }
    }

    // Show correct sidebar nav
    if (isEmployee) {
        document.getElementById('navFull').style.display = 'none';
        document.getElementById('navEmp').style.display = '';
    } else {
        document.getElementById('navFull').style.display = '';
        document.getElementById('navEmp').style.display = 'none';
    }

    // Nav click handlers — pick from both nav groups
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
        item.addEventListener('click', () => navigate(item.dataset.view));
    });

    // Hash routing
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
    window.location.href = 'index.html';
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

window.addEventListener('DOMContentLoaded', init);
window.navigate = navigate;
window.logout = logout;
window.closeModal = closeModal;
window.switchCompany = switchCompany;
window.showSignModal = showSignModal;
window.confirmSignature = confirmSignature;
