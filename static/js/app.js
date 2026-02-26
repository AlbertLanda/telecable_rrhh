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
    
    // 🔥 MAGIA: Autodetectar al empleado por su Email o DNI en la Base de Datos Real
    if (currentUser.empId) {
        myEmpId = currentUser.empId;
    } else {
        // Fallback por si inicia sesión con un correo antiguo
        const empReal = MOCK.empleados.find(e => 
            e.email.toLowerCase() === currentUser.email.toLowerCase() || 
            e.dni === currentUser.email || 
            e.codigo === currentUser.email
        );
        myEmpId = empReal ? empReal.id : null;
    }
    
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
            <div class="modal" style="max-width: 480px;">
                <div class="modal-header">
                    <h3>Firma Electrónica de Documento</h3>
                    <button class="modal-close" onclick="closeModal()"><i data-lucide="x" style="width:14px;height:14px"></i></button>
                </div>
                <div class="modal-body" style="padding-top: 15px;">
                    
                    <div style="background:var(--info-50); color:var(--info); padding:14px 18px; border-radius:var(--r-sm); margin-bottom:24px; font-size:0.85rem; line-height:1.5; border: 1px solid var(--info-100);">
                        <i data-lucide="info" style="width:18px;height:18px; display:inline; vertical-align:middle; margin-right:6px;"></i>
                        Estás a punto de firmar digitalmente el documento: <br>
                        <strong style="color:var(--info-dark); display:block; margin-top:6px; font-size: 0.95rem;">📄 ${doc.nombre}</strong>
                    </div>
                    
                    <div class="field" style="margin-bottom: 18px;">
                        <label>Titular de la Firma</label>
                        <div class="input-wrap">
                            <i data-lucide="user" class="input-icon-l" style="width:16px;height:16px"></i>
                            <input type="text" value="${empFullName(emp)}" readonly style="background:var(--gray-100); font-weight:700; color:var(--text-primary); padding-left: 38px; cursor: not-allowed;">
                        </div>
                    </div>
                    
                    <div class="field" style="margin-bottom: 24px;">
                        <label>Documento de Identidad (DNI)</label>
                        <div class="input-wrap">
                            <i data-lucide="credit-card" class="input-icon-l" style="width:16px;height:16px"></i>
                            <input type="text" value="${emp.dni}" readonly style="background:var(--gray-100); font-weight:700; color:var(--text-primary); padding-left: 38px; cursor: not-allowed;">
                        </div>
                    </div>
                    
                    <div style="font-size:0.78rem; color:var(--text-secondary); display:flex; gap:12px; line-height:1.5; background:var(--gray-50); padding:16px; border-radius:var(--r-sm); border:1px dashed var(--gray-300);">
                        <i data-lucide="shield-check" style="width:28px;height:28px;flex-shrink:0; color:var(--success)"></i>
                        <p>Al hacer clic en <strong>"Confirmar Firma"</strong>, declaras que los datos son correctos, aceptas el contenido del documento y generas una validación electrónica vinculante a tu cuenta corporativa.</p>
                    </div>

                </div>
                <div class="modal-footer">
                    <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
                    <button class="btn btn-primary" onclick="confirmSignature(${docId})">
                        <i data-lucide="pen-tool" style="width:14px;height:14px"></i> Confirmar Firma
                    </button>
                </div>
            </div>
        </div>
    `;
    openModal(html);
}

window.confirmSignature = async function(docId) {
    // Buscamos el botón dentro del modal para bloquearlo
    const btn = document.querySelector('.modal-footer .btn-primary');
    if (btn.disabled) return; // Escudo anti-doble clic

    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<i data-lucide="loader-2" class="lucide-spin" style="width:14px;height:14px"></i> Procesando Firma...`;
    btn.disabled = true;
    lucide.createIcons();

    const csrf = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';

    try {
        const response = await fetch('/api/documentos/firmar/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf },
            body: JSON.stringify({ doc_id: docId })
        });

        const result = await response.json();
        
        if (result.success) {
            closeModal(); // Cerramos el modal de la firma
            
            // ABRIMOS EL MODAL DE ÉXITO ESTILO ENTERPRISE 😎
            setTimeout(() => {
                openModal(`
                  <div class="modal-overlay">
                    <div class="modal" style="max-width: 380px; text-align: center; padding: 40px 20px;">
                        <div style="width: 70px; height: 70px; background: var(--success-50); color: var(--success); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                            <i data-lucide="pen-tool" style="width: 36px; height: 36px;"></i>
                        </div>
                        <h3 style="font-size: 1.4rem; margin-bottom: 10px; font-weight: 800;">¡Documento Firmado!</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 25px; line-height: 1.5;">Tu firma digital tiene validez legal y ha sido registrada en el sistema con tu DNI y fecha de validación.</p>
                        <button class="btn btn-primary" style="width: 100%; justify-content: center; padding: 14px;" onclick="window.location.reload();">Entendido</button>
                    </div>
                  </div>
                `);
            }, 100);
            
        } else {
            alert("❌ Error: " + result.message);
            btn.innerHTML = originalHTML;
            btn.disabled = false;
        }
    } catch (e) {
        alert("❌ Error de conexión al servidor.");
        btn.innerHTML = originalHTML;
        btn.disabled = false;
    }
};

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
