// ============================================================
// VIEW: Configuración (Panel de Administración Nivel Empresarial)
// ============================================================

window.renderConfiguracion = function() {
    const empresa = (MOCK.empresas && MOCK.empresas.length > 0) ? MOCK.empresas[0] : { nombre: 'INVERSIONES EN TELECOMUNICACIONES DIGITALES S.A.C', ruc: '20603110456', telefono: '(064) 123456', direccion: 'Av. Principal 123, Huancayo' };
    const deptos = MOCK.departamentos || [];
    const sedes = MOCK.sedes || [];

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
                <button class="btn btn-ghost" style="padding:4px; color:#3b82f6;" onclick="openEditarDepto(${d.id})" title="Editar Área">
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
                    <button class="btn btn-ghost" style="padding:4px; color:#3b82f6;" title="Editar Sede" onclick="openModificarSede(${s.id}, '${s.nombre}')"><i data-lucide="edit-2" style="width:16px;height:16px;"></i></button>
                    <button class="btn btn-ghost" style="padding:4px; color:#ef4444;" title="Desactivar Sede"><i data-lucide="trash-2" style="width:16px;height:16px;"></i></button>
                </div>
            </td>
        </tr>
    `).join('');

    return `
    <div class="view-header no-print">
        <div class="view-header-left">
            <h1>Configuración del Sistema</h1>
            <p>Administración general, áreas y parámetros de la empresa</p>
        </div>
    </div>

    <div style="display:flex; gap:20px; border-bottom: 1px solid #e5e7eb; margin-bottom: 25px; overflow-x: auto;">
        <button class="conf-tab-btn active" onclick="switchConfTab('tab-general', this)">
            <i data-lucide="building"></i> Datos de Empresa
        </button>
        <button class="conf-tab-btn" onclick="switchConfTab('tab-deptos', this)">
            <i data-lucide="network"></i> Departamentos
        </button>
        <button class="conf-tab-btn" onclick="switchConfTab('tab-sedes', this)">
            <i data-lucide="map"></i> Sucursales / Sedes
        </button>
        <button class="conf-tab-btn" onclick="switchConfTab('tab-seguridad', this)">
            <i data-lucide="shield"></i> Seguridad
        </button>
    </div>

    <div class="conf-tab-content">
        
        <div id="tab-general" class="conf-pane active" style="animation: fadeIn 0.3s;">
            <div class="card" style="max-width: 800px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <div class="card-header"><div class="card-title">Información Corporativa</div></div>
                <div style="padding: 25px;">
                    <div style="display:flex; gap:20px; margin-bottom:30px; align-items:center; background:#f9fafb; padding:15px; border-radius:12px; border:1px dashed #d1d5db;">
                        <div style="width:80px; height:80px; background:white; border-radius:12px; border:1px solid #e5e7eb; display:flex; align-items:center; justify-content:center; flex-direction:column; cursor:pointer; transition:all 0.2s;" onmouseover="this.style.borderColor='#3b82f6'" onmouseout="this.style.borderColor='#e5e7eb'">
                            <i data-lucide="image" style="color:#9ca3af; margin-bottom:4px;"></i>
                            <span style="font-size:0.7rem; color:#6b7280; font-weight:600;">Subir Logo</span>
                        </div>
                        <div>
                            <h3 style="margin:0 0 5px 0; color:#111827; font-size:1.1rem;">Logo de la Empresa</h3>
                            <p style="margin:0; font-size:0.85rem; color:#6b7280; line-height:1.4;">Se usará en las boletas, reportes y pantalla de inicio.<br>Formato recomendado: PNG transparente (Max 2MB).</p>
                        </div>
                    </div>
                    
                    <div class="form-grid">
                        <div class="field form-full"><label>Razón Social *</label><input type="text" id="empNombre" value="${empresa.nombre}"></div>
                        <div class="field"><label>RUC *</label><input type="text" id="empRuc" value="${empresa.ruc}"></div>
                        <div class="field"><label>Teléfono Principal</label><input type="text" id="empTel" value="${empresa.telefono || ''}"></div>
                        <div class="field form-full"><label>Dirección Fiscal</label><input type="text" id="empDir" value="${empresa.direccion || ''}"></div>
                    </div>
                    
                    <div id="empresaMsg" style="text-align:right; font-weight:600; font-size:0.9rem; margin-top:15px; height:20px;"></div>
                    
                    <div style="margin-top: 15px; text-align: right; border-top: 1px solid #f3f4f6; padding-top: 20px;">
                        <button class="btn btn-primary" id="btnGuardarEmpresa" onclick="guardarDatosEmpresa()">
                            <i data-lucide="save" style="width:16px;height:16px; margin-right:6px;"></i> Guardar Cambios
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div id="tab-deptos" class="conf-pane" style="display:none; animation: fadeIn 0.3s;">
            <div class="card" style="box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <div class="card-header" style="flex-wrap: wrap; gap: 15px;">
                    <div><div class="card-title">Estructura Organizacional</div><div style="font-size:0.85rem; color:#6b7280; margin-top:4px;">Gestiona las áreas de la empresa</div></div>
                    <button class="btn btn-primary" onclick="openCrearDepto()"><i data-lucide="plus" style="width:15px;height:15px; margin-right:4px;"></i> Nuevo Departamento</button>
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
                    <button class="btn btn-primary" onclick="openCrearSede()"><i data-lucide="plus" style="width:15px;height:15px; margin-right:4px;"></i> Añadir Sede</button>
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
                        <button class="btn btn-primary" id="btnGuardarSeguridad" onclick="guardarSeguridad()">
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
// ACCIONES: TAB 1 (EMPRESA)
// ============================================================
window.guardarDatosEmpresa = function() {
    const btn = document.getElementById('btnGuardarEmpresa');
    const msg = document.getElementById('empresaMsg');
    
    // Validación básica
    if(!document.getElementById('empNombre').value || !document.getElementById('empRuc').value) {
        msg.innerText = "⚠️ Razón Social y RUC son obligatorios.";
        msg.style.color = "#ef4444"; return;
    }

    btn.innerHTML = `<i data-lucide="loader-2" class="lucide-spin" style="width:16px;height:16px; margin-right:6px;"></i> Guardando...`;
    btn.disabled = true;
    msg.innerText = "";

    // Simulación de guardado en servidor
    setTimeout(() => {
        btn.innerHTML = `<i data-lucide="check" style="width:16px;height:16px; margin-right:6px;"></i> Guardado`;
        btn.style.background = "#10b981"; btn.style.borderColor = "#10b981";
        msg.innerText = "✅ Datos de empresa actualizados correctamente.";
        msg.style.color = "#10b981";
        
        setTimeout(() => {
            btn.innerHTML = `<i data-lucide="save" style="width:16px;height:16px; margin-right:6px;"></i> Guardar Cambios`;
            btn.style.background = ""; btn.style.borderColor = "";
            btn.disabled = false;
        }, 3000);
    }, 1000);
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

// ============================================================
// ACCIONES: TAB 2 (DEPARTAMENTOS)
// ============================================================
window.openCrearDepto = function() {
    openModal(`
    <div class="modal-overlay" style="z-index: 9999;">
        <div class="modal" style="max-width: 450px;">
            <div class="modal-header">
                <h3>Nuevo Departamento</h3>
                <button class="modal-close" onclick="closeModal()"><i data-lucide="x"></i></button>
            </div>
            <div class="modal-body">
                <div class="form-grid">
                    <div class="field form-full"><label>Nombre del Área *</label><input type="text" id="depNom" placeholder="Ej: Operaciones"></div>
                    <div class="field form-full"><label>Descripción</label><input type="text" id="depDesc" placeholder="Breve descripción"></div>
                    <div class="field"><label>Jefe a cargo</label><input type="text" id="depJefe" placeholder="Ej: Carlos Q."></div>
                    <div class="field"><label>Color Identificador</label><input type="color" id="depColor" value="#3b82f6" style="height:42px; width:100%; cursor:pointer; padding:2px; border:1px solid #d1d5db; border-radius:8px;"></div>
                    <div id="depMsg" style="grid-column:span 2; text-align:center; font-weight:700; margin-top: 5px; min-height: 20px;"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
                <button class="btn btn-primary" id="btnGuardarDep" onclick="saveDepto()"><i data-lucide="save" style="width:14px;height:14px"></i> Crear Área</button>
            </div>
        </div>
    </div>`);
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.openEditarDepto = function(id) {
    const d = MOCK.departamentos.find(dep => String(dep.id) === String(id));
    if(!d) return;

    openModal(`
    <div class="modal-overlay" style="z-index: 9999;">
        <div class="modal" style="max-width: 450px;">
            <div class="modal-header">
                <h3>Editar Departamento</h3>
                <button class="modal-close" onclick="closeModal()"><i data-lucide="x"></i></button>
            </div>
            <div class="modal-body">
                <div class="form-grid">
                    <div class="field form-full"><label>Nombre del Área *</label><input type="text" id="depNom" value="${d.nombre}"></div>
                    <div class="field form-full"><label>Descripción</label><input type="text" id="depDesc" value="${d.desc || d.descripcion || ''}"></div>
                    <div class="field"><label>Jefe a cargo</label><input type="text" id="depJefe" value="${d.jefe || d.jefe_nombre || ''}"></div>
                    <div class="field"><label>Color Identificador</label><input type="color" id="depColor" value="${d.color || '#3b82f6'}" style="height:42px; width:100%; cursor:pointer; padding:2px; border:1px solid #d1d5db; border-radius:8px;"></div>
                    <div id="depMsg" style="grid-column:span 2; text-align:center; font-weight:700; margin-top: 5px; min-height: 20px;"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
                <button class="btn btn-primary" id="btnGuardarDep" onclick="saveDepto(${id})"><i data-lucide="save" style="width:14px;height:14px"></i> Guardar Cambios</button>
            </div>
        </div>
    </div>`);
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.saveDepto = async function(id = null) {
    const nombre = document.getElementById('depNom').value;
    const msg = document.getElementById('depMsg');
    
    if(!nombre) { msg.innerText = "❌ El nombre es obligatorio"; msg.style.color = "#ef4444"; return; }

    const data = {
        nombre: nombre,
        descripcion: document.getElementById('depDesc').value,
        jefe_nombre: document.getElementById('depJefe').value,
        color: document.getElementById('depColor').value
    };

    const btn = document.getElementById('btnGuardarDep');
    btn.innerHTML = "Guardando..."; btn.disabled = true;
    const csrf = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';

    // LÓGICA DE BACKEND (Comentada para que no falle si no tienes las rutas de Django aún)
    /*
    const url = id ? \`/api/departamentos/editar/\${id}/\` : '/api/departamentos/crear/';
    try {
        const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf }, body: JSON.stringify(data) });
        if(res.ok) { window.location.reload(); } 
        else { msg.innerText = "❌ Error en servidor"; btn.disabled = false; }
    } catch(e) { msg.innerText = "❌ Error de conexión"; btn.disabled = false; }
    */

    // Simulación elegante para el Frontend
    setTimeout(() => {
        msg.innerText = "✅ Área guardada correctamente";
        msg.style.color = "#10b981";
        setTimeout(() => { closeModal(); window.location.reload(); }, 600);
    }, 800);
};

// ============================================================
// ACCIONES: TAB 3 (SEDES)
// ============================================================
window.openCrearSede = function() {
    openModal(`
    <div class="modal-overlay" style="z-index: 9999;">
        <div class="modal" style="max-width: 400px;">
            <div class="modal-header">
                <h3>Añadir Nueva Sede</h3>
                <button class="modal-close" onclick="closeModal()"><i data-lucide="x"></i></button>
            </div>
            <div class="modal-body">
                <div class="field form-full" style="margin-bottom:15px;"><label>Nombre de la Sede *</label><input type="text" id="sedeNom" placeholder="Ej: Sede Norte"></div>
                <div class="field form-full"><label>Dirección (Opcional)</label><input type="text" placeholder="Ubicación física"></div>
                <div id="sedeMsg" style="text-align:center; font-weight:700; margin-top: 15px; min-height: 20px;"></div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
                <button class="btn btn-primary" id="btnGuardarSede" onclick="simularGuardado('sedeMsg', 'btnGuardarSede', '✅ Sede registrada')"><i data-lucide="save" style="width:14px;height:14px"></i> Añadir</button>
            </div>
        </div>
    </div>`);
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.openModificarSede = function(id, nombre) {
    openModal(`
    <div class="modal-overlay" style="z-index: 9999;">
        <div class="modal" style="max-width: 400px;">
            <div class="modal-header">
                <h3>Editar Sede</h3>
                <button class="modal-close" onclick="closeModal()"><i data-lucide="x"></i></button>
            </div>
            <div class="modal-body">
                <div class="field form-full"><label>Nombre de la Sede *</label><input type="text" value="${nombre}"></div>
                <div id="sedeEditMsg" style="text-align:center; font-weight:700; margin-top: 15px; min-height: 20px;"></div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
                <button class="btn btn-primary" id="btnEditSede" onclick="simularGuardado('sedeEditMsg', 'btnEditSede', '✅ Cambios guardados')"><i data-lucide="save" style="width:14px;height:14px"></i> Guardar</button>
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
        }, 3000);
    }, 1200);
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

// Helper genérico para simular guardados en modales sin conectar al backend aún
window.simularGuardado = function(msgId, btnId, textoExito) {
    const msg = document.getElementById(msgId);
    const btn = document.getElementById(btnId);
    btn.innerHTML = "Procesando..."; btn.disabled = true;
    setTimeout(() => {
        msg.innerText = textoExito; msg.style.color = "#10b981";
        setTimeout(() => { closeModal(); }, 800);
    }, 800);
};