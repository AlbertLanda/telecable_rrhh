// ============================================================
// VIEW: Configuración (Panel de Administración Nivel Empresarial)
// Ruta: static/js/views/configuracion.js
// ============================================================

window.renderConfiguracion = function() {
    const empresas = window.realEmpresas || [];
    const deptos = window.realDepartamentos || [];
    const sedes = window.realSedes || [];

    // --- TABLA DE EMPRESAS (RAZONES SOCIALES) ---
    const empresasRows = empresas.map(e => `
        <tr>
            <td>
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="width:35px; height:35px; border-radius:8px; background:#eff6ff; color:#3b82f6; display:flex; align-items:center; justify-content:center;">
                        <i data-lucide="building" style="width:18px;height:18px;"></i>
                    </div>
                    <div>
                        <div style="font-weight:700; color:#111827;">${e.razon_social || e.nombre || 'Sin Razón Social'}</div>
                        <div style="font-size:0.8rem; color:#6b7280;">RUC: ${e.ruc || '---'}</div>
                    </div>
                </div>
            </td>
            <td style="color:#4b5563; font-size:0.9rem;">${e.direccion || 'No registrada'}</td>
            <td style="color:#4b5563; font-size:0.9rem;">${e.telefono || '---'}</td>
            <td>
                <button class="btn btn-ghost" style="padding:4px; color:#3b82f6;" onclick="window.simularGuardadoToast('Función de edición en desarrollo')" title="Editar Empresa">
                    <i data-lucide="edit-2" style="width:16px;height:16px;"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // --- TABLA DE DEPARTAMENTOS ---
    const deptosRows = deptos.map(d => `
        <tr>
            <td>
                <div style="display:flex; align-items:center; gap:10px;">
                    <div style="width:12px; height:12px; border-radius:50%; background:${d.color || '#6366f1'}; box-shadow: 0 0 4px ${d.color || '#6366f1'}80;"></div>
                    <span style="font-weight:600; color:#111827;">${d.nombre}</span>
                </div>
            </td>
            <td style="color:#6b7280; font-size:0.9rem;">${d.desc || d.descripcion || 'Sin descripción'}</td>
            <td>
                <div style="font-weight:600; color:#374151; font-size:0.9rem;">${d.jefe || d.jefe_nombre || 'No asignado'}</div>
            </td>
            <td>
                <button class="btn btn-ghost" style="padding:4px; color:#3b82f6;" onclick="window.openEditarDepto(${d.id})" title="Editar Área">
                    <i data-lucide="edit-2" style="width:16px;height:16px;"></i>
                </button>
            </td>
        </tr>
    `).join('');

    // --- TABLA DE SEDES ---
    const sedesRows = sedes.map(s => `
        <tr>
            <td>
                <div style="display:flex; align-items:center; gap:8px; font-weight:600; color:#111827;">
                    <i data-lucide="map-pin" style="width:16px; height:16px; color:#ef4444;"></i> ${s.nombre}
                </div>
            </td>
            <td style="color:#6b7280; font-size:0.9rem;">Sede Operativa</td>
            <td><span class="badge badge-green badge-dot">Activa</span></td>
            <td>
                <div style="display:flex; gap:8px; align-items:center;">
                    <button class="btn btn-ghost" style="padding:4px; color:#3b82f6;" title="Editar Sede" onclick="window.openModificarSede(${s.id}, '${s.nombre}')"><i data-lucide="edit-2" style="width:16px;height:16px;"></i></button>
                    <button class="btn btn-ghost" style="padding:4px; color:#ef4444;" title="Desactivar Sede" onclick="window.simularGuardadoToast('Sede no se puede eliminar porque tiene empleados asignados')"><i data-lucide="trash-2" style="width:16px;height:16px;"></i></button>
                </div>
            </td>
        </tr>
    `).join('');

    return `
    <div class="view-header no-print" style="animation: fadeIn 0.4s ease-out;">
        <div class="view-header-left">
            <h1>Configuración del Sistema</h1>
            <p>Administración general, áreas y parámetros de la empresa</p>
        </div>
    </div>

    <div style="display:flex; gap:20px; border-bottom: 1px solid #e5e7eb; margin-bottom: 25px; overflow-x: auto; animation: fadeIn 0.4s ease-out;">
        <button class="conf-tab-btn active" onclick="window.switchConfTab('tab-general', this)">
            <i data-lucide="building"></i> Razones Sociales
        </button>
        <button class="conf-tab-btn" onclick="window.switchConfTab('tab-deptos', this)">
            <i data-lucide="network"></i> Departamentos
        </button>
        <button class="conf-tab-btn" onclick="window.switchConfTab('tab-sedes', this)">
            <i data-lucide="map"></i> Sucursales / Sedes
        </button>
        <button class="conf-tab-btn" onclick="window.switchConfTab('tab-seguridad', this)">
            <i data-lucide="shield"></i> Seguridad
        </button>
    </div>

    <div class="conf-tab-content">
        
        <div id="tab-general" class="conf-pane active" style="animation: fadeIn 0.3s;">
            <div class="card" style="box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <div class="card-header" style="flex-wrap: wrap; gap: 15px;">
                    <div><div class="card-title">Empresas / Razones Sociales</div><div style="font-size:0.85rem; color:#6b7280; margin-top:4px;">Gestiona las entidades legales del grupo</div></div>
                    <button class="btn btn-primary" onclick="window.simularGuardadoToast('Formulario de creación de empresa en desarrollo')"><i data-lucide="plus" style="width:15px;height:15px; margin-right:4px;"></i> Nueva Empresa</button>
                </div>
                <div class="table-wrap">
                    <table>
                        <thead><tr><th>RAZÓN SOCIAL / RUC</th><th>DIRECCIÓN FISCAL</th><th>TELÉFONO</th><th>ACCIONES</th></tr></thead>
                        <tbody>${empresasRows || '<tr><td colspan="4" style="text-align:center;padding:30px;color:#6b7280;">No hay empresas registradas</td></tr>'}</tbody>
                    </table>
                </div>
            </div>
        </div>

        <div id="tab-deptos" class="conf-pane" style="display:none; animation: fadeIn 0.3s;">
            <div class="card" style="box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <div class="card-header" style="flex-wrap: wrap; gap: 15px;">
                    <div><div class="card-title">Estructura Organizacional</div><div style="font-size:0.85rem; color:#6b7280; margin-top:4px;">Gestiona las áreas de la empresa</div></div>
                    <button class="btn btn-primary" onclick="window.openCrearDepto()"><i data-lucide="plus" style="width:15px;height:15px; margin-right:4px;"></i> Nuevo Departamento</button>
                </div>
                <div class="table-wrap">
                    <table>
                        <thead><tr><th>DEPARTAMENTO / COLOR</th><th>DESCRIPCIÓN</th><th>JEFATURA</th><th>ACCIONES</th></tr></thead>
                        <tbody>${deptosRows || '<tr><td colspan="4" style="text-align:center;padding:30px;color:#6b7280;">No hay departamentos registrados</td></tr>'}</tbody>
                    </table>
                </div>
            </div>
        </div>

        <div id="tab-sedes" class="conf-pane" style="display:none; animation: fadeIn 0.3s;">
            <div class="card" style="box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <div class="card-header" style="flex-wrap: wrap; gap: 15px;">
                    <div><div class="card-title">Sucursales y Sedes</div><div style="font-size:0.85rem; color:#6b7280; margin-top:4px;">Puntos de operación físicos</div></div>
                    <button class="btn btn-primary" onclick="window.openCrearSede()"><i data-lucide="plus" style="width:15px;height:15px; margin-right:4px;"></i> Añadir Sede</button>
                </div>
                <div class="table-wrap">
                    <table>
                        <thead><tr><th>NOMBRE DE SEDE</th><th>TIPO</th><th>ESTADO</th><th>ACCIONES</th></tr></thead>
                        <tbody>${sedesRows || '<tr><td colspan="4" style="text-align:center;padding:30px;color:#6b7280;">No hay sedes registradas</td></tr>'}</tbody>
                    </table>
                </div>
            </div>
        </div>

        <div id="tab-seguridad" class="conf-pane" style="display:none; animation: fadeIn 0.3s;">
            <div class="card" style="max-width: 600px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <div class="card-header"><div class="card-title">Seguridad de la Cuenta</div></div>
                <div style="padding: 25px;">
                    <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:15px; margin-bottom:25px; display:flex; gap:15px; align-items:flex-start;">
                        <i data-lucide="shield-alert" style="color:#3b82f6; width:24px; height:24px; flex-shrink:0;"></i>
                        <div>
                            <h4 style="margin:0 0 5px 0; color:#1e3a8a; font-size:0.95rem;">Actualización de Credenciales</h4>
                            <p style="margin:0; font-size:0.85rem; color:#1e40af; line-height:1.4;">Cambia la contraseña de tu cuenta de Administrador. Te recomendamos usar una combinación de letras, números y símbolos.</p>
                        </div>
                    </div>

                    <div class="form-grid">
                        <div class="field form-full"><label>Contraseña Actual</label><input type="password" id="passActual" placeholder="••••••••"></div>
                        <div class="field"><label>Nueva Contraseña</label><input type="password" id="passNueva" placeholder="Mínimo 8 caracteres"></div>
                        <div class="field"><label>Confirmar Nueva Contraseña</label><input type="password" id="passConfirmar" placeholder="Repite la contraseña"></div>
                    </div>
                    
                    <div id="seguridadMsg" style="text-align:right; font-weight:600; font-size:0.9rem; margin-top:15px; height:20px;"></div>

                    <div style="margin-top: 15px; text-align: right; border-top: 1px solid #f3f4f6; padding-top: 20px;">
                        <button class="btn btn-primary" id="btnGuardarSeguridad" onclick="window.guardarSeguridad()">
                            <i data-lucide="key" style="width:16px;height:16px; margin-right:6px;"></i> Actualizar Contraseña
                        </button>
                    </div>
                </div>
            </div>
        </div>

    </div>

    <style>
        .conf-tab-btn { background: none; border: none; border-bottom: 2px solid transparent; padding: 12px 18px; font-weight: 600; color: #6b7280; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; margin-bottom: -1px; font-size: 0.95rem;}
        .conf-tab-btn:hover { color: #111827; background: #f9fafb; border-radius: 8px 8px 0 0; }
        .conf-tab-btn.active { color: #3b82f6; border-bottom: 2px solid #3b82f6; }
        .conf-tab-btn i { width: 18px; height: 18px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
    </style>
    `;
};

window.initConfiguracion = function() {
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

// ============================================================
// LÓGICA DE PESTAÑAS (TABS)
// ============================================================
window.switchConfTab = function(tabId, btnElement) {
    document.querySelectorAll('.conf-pane').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.conf-tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).style.display = 'block';
    btnElement.classList.add('active');
    if (typeof lucide !== 'undefined') lucide.createIcons();
};


// ============================================================
// ACCIONES: TAB 2 (DEPARTAMENTOS)
// ============================================================
window.openCrearDepto = function() {
    if(typeof window.openModal !== 'function') return;

    window.openModal(`
    <div class="modal-overlay" style="z-index: 9999;">
        <div class="modal" style="max-width: 450px;">
            <div class="modal-header">
                <h3>Nuevo Departamento</h3>
                <button class="modal-close" onclick="window.closeModal()"><i data-lucide="x"></i></button>
            </div>
            <div class="modal-body">
                <div class="form-grid">
                    <div class="field form-full"><label>Nombre del Área *</label><input type="text" id="depNom" placeholder="Ej: Operaciones"></div>
                    <div class="field form-full"><label>Descripción</label><input type="text" id="depDesc" placeholder="Breve descripción"></div>
                    <div class="field"><label>Jefe a cargo</label><input type="text" id="depJefe" placeholder="Ej: Carlos Q."></div>
                    <div class="field"><label>Color Identificador</label><input type="color" id="depColor" value="#3b82f6" style="height:42px; width:100%; cursor:pointer; padding:2px; border:1px solid #d1d5db; border-radius:8px;"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-ghost" onclick="window.closeModal()">Cancelar</button>
                <button class="btn btn-primary" id="btnGuardarDep" onclick="window.saveDepto()"><i data-lucide="save" style="width:14px;height:14px"></i> Crear Área</button>
            </div>
        </div>
    </div>`);
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.openEditarDepto = function(id) {
    if(typeof window.openModal !== 'function') return;

    const d = (window.realDepartamentos || []).find(dep => String(dep.id) === String(id));
    if(!d) return;

    window.openModal(`
    <div class="modal-overlay" style="z-index: 9999;">
        <div class="modal" style="max-width: 450px;">
            <div class="modal-header">
                <h3>Editar Departamento</h3>
                <button class="modal-close" onclick="window.closeModal()"><i data-lucide="x"></i></button>
            </div>
            <div class="modal-body">
                <div class="form-grid">
                    <div class="field form-full"><label>Nombre del Área *</label><input type="text" id="depNom" value="${d.nombre}"></div>
                    <div class="field form-full"><label>Descripción</label><input type="text" id="depDesc" value="${d.desc || d.descripcion || ''}"></div>
                    <div class="field"><label>Jefe a cargo</label><input type="text" id="depJefe" value="${d.jefe || d.jefe_nombre || ''}"></div>
                    <div class="field"><label>Color Identificador</label><input type="color" id="depColor" value="${d.color || '#3b82f6'}" style="height:42px; width:100%; cursor:pointer; padding:2px; border:1px solid #d1d5db; border-radius:8px;"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-ghost" onclick="window.closeModal()">Cancelar</button>
                <button class="btn btn-primary" id="btnGuardarDep" onclick="window.saveDepto(${id})"><i data-lucide="save" style="width:14px;height:14px"></i> Guardar Cambios</button>
            </div>
        </div>
    </div>`);
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.saveDepto = async function(id = null) {
    const nombre = document.getElementById('depNom').value;
    
    if(!nombre) { 
        if(typeof window.showToast === 'function') window.showToast("El nombre del área es obligatorio", "warning");
        return; 
    }

    const data = {
        nombre: nombre,
        descripcion: document.getElementById('depDesc').value,
        jefe_nombre: document.getElementById('depJefe').value,
        color: document.getElementById('depColor').value
    };

    const btn = document.getElementById('btnGuardarDep');
    btn.innerHTML = `<i data-lucide="loader-2" class="lucide-spin" style="width:14px;height:14px"></i> Guardando...`; 
    btn.disabled = true;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    
    const csrf = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';

    // 🔴 ESTO SE EJECUTARÁ SI TIENES LA RUTA EN DJANGO. Si no la tienes, simplemente usa la simulación de abajo.
    const url = id ? `/api/departamentos/editar/${id}/` : '/api/departamentos/crear/';
    
    try {
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf }, body: JSON.stringify(data) });
        if(res.ok) { 
            if(typeof window.showToast === 'function') window.showToast("Área guardada correctamente", "success");
            setTimeout(() => { window.closeModal(); window.location.reload(); }, 800);
        } else { 
            if(typeof window.showToast === 'function') window.showToast("Error en servidor al guardar", "error");
            btn.innerHTML = `<i data-lucide="save" style="width:14px;height:14px"></i> Guardar`;
            btn.disabled = false; 
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    } catch(e) { 
        if(typeof window.showToast === 'function') window.showToast("Error de red conectando a Django", "error");
        btn.innerHTML = `<i data-lucide="save" style="width:14px;height:14px"></i> Guardar`;
        btn.disabled = false; 
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
};

// ============================================================
// ACCIONES: TAB 3 (SEDES)
// ============================================================
window.openCrearSede = function() {
    if(typeof window.openModal !== 'function') return;

    window.openModal(`
    <div class="modal-overlay" style="z-index: 9999;">
        <div class="modal" style="max-width: 400px;">
            <div class="modal-header">
                <h3>Añadir Nueva Sede</h3>
                <button class="modal-close" onclick="window.closeModal()"><i data-lucide="x"></i></button>
            </div>
            <div class="modal-body">
                <div class="field form-full" style="margin-bottom:15px;"><label>Nombre de la Sede *</label><input type="text" id="sedeNom" placeholder="Ej: Sede Norte"></div>
                <div class="field form-full"><label>Dirección (Opcional)</label><input type="text" placeholder="Ubicación física"></div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-ghost" onclick="window.closeModal()">Cancelar</button>
                <button class="btn btn-primary" onclick="window.simularGuardadoToast('Sede creada exitosamente')"><i data-lucide="save" style="width:14px;height:14px"></i> Añadir</button>
            </div>
        </div>
    </div>`);
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.openModificarSede = function(id, nombre) {
    if(typeof window.openModal !== 'function') return;

    window.openModal(`
    <div class="modal-overlay" style="z-index: 9999;">
        <div class="modal" style="max-width: 400px;">
            <div class="modal-header">
                <h3>Editar Sede</h3>
                <button class="modal-close" onclick="window.closeModal()"><i data-lucide="x"></i></button>
            </div>
            <div class="modal-body">
                <div class="field form-full"><label>Nombre de la Sede *</label><input type="text" value="${nombre}"></div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-ghost" onclick="window.closeModal()">Cancelar</button>
                <button class="btn btn-primary" onclick="window.simularGuardadoToast('Cambios guardados en la sede')"><i data-lucide="save" style="width:14px;height:14px"></i> Guardar</button>
            </div>
        </div>
    </div>`);
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

// ============================================================
// ACCIONES: TAB 4 (SEGURIDAD)
// ============================================================
window.guardarSeguridad = function() {
    const pass1 = document.getElementById('passNueva').value;
    const pass2 = document.getElementById('passConfirmar').value;
    const msg = document.getElementById('seguridadMsg');
    const btn = document.getElementById('btnGuardarSeguridad');

    if(!document.getElementById('passActual').value || !pass1 || !pass2) {
        msg.innerText = "⚠️ Completa todos los campos de contraseña."; msg.style.color = "#ef4444"; return;
    }
    if(pass1 !== pass2) {
        msg.innerText = "❌ La nueva contraseña y la confirmación no coinciden."; msg.style.color = "#ef4444"; return;
    }
    if(pass1.length < 8) {
        msg.innerText = "⚠️ La nueva contraseña debe tener al menos 8 caracteres."; msg.style.color = "#f59e0b"; return;
    }

    btn.innerHTML = `<i data-lucide="loader-2" class="lucide-spin" style="width:16px;height:16px; margin-right:6px;"></i> Procesando...`;
    btn.disabled = true; msg.innerText = "";
    if (typeof lucide !== 'undefined') lucide.createIcons();

    setTimeout(() => {
        document.getElementById('passActual').value = '';
        document.getElementById('passNueva').value = '';
        document.getElementById('passConfirmar').value = '';
        
        btn.innerHTML = `<i data-lucide="check" style="width:16px;height:16px; margin-right:6px;"></i> Actualizado`;
        btn.style.background = "#10b981"; btn.style.borderColor = "#10b981";
        msg.innerText = "✅ Contraseña actualizada con éxito."; msg.style.color = "#10b981";
        
        setTimeout(() => {
            btn.innerHTML = `<i data-lucide="key" style="width:16px;height:16px; margin-right:6px;"></i> Actualizar Contraseña`;
            btn.style.background = ""; btn.style.borderColor = ""; btn.disabled = false; msg.innerText = "";
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }, 3000);
    }, 1200);
};

// Helper para botones que aún no tienen conexión Backend completa
window.simularGuardadoToast = function(textoExito) {
    if(typeof window.showToast === 'function') {
        window.showToast(textoExito, "success");
    } else {
        alert(textoExito);
    }
    if(typeof window.closeModal === 'function') window.closeModal();
};