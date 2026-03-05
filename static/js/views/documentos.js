// ============================================================
// VIEW: Documentos (Gestión de Archivos Pro con Vista Previa - PostgreSQL)
// Ruta: static/js/views/documentos.js
// ============================================================

let dbAdminDocs = [];
let dbAdminEmps = [];
let dbAdminDepts = [];
let isDocsLoaded = false; // Bandera de seguridad por si la BD tiene 0 documentos

async function cargarDatosDocumentos() {
    try {
        const [resDocs, resEmps, resDepts] = await Promise.all([
            fetch('/api/documentos/listar/'),
            fetch('/api/empleados/listar/'),
            fetch('/api/departamentos/listar/')
        ]);
        
        let docs = await resDocs.json();
        let emps = await resEmps.json();
        let depts = await resDepts.json();

        dbAdminDocs = docs.data ? docs.data : docs;
        dbAdminEmps = emps.data ? emps.data : emps;
        dbAdminDepts = depts.data ? depts.data : depts;
        
        isDocsLoaded = true;
    } catch (error) {
        console.error("Error conectando a PostgreSQL:", error);
        isDocsLoaded = true; // Para que no se quede trabado el loader en caso de error
    }
}

window.renderDocumentos = function() {
    // 🔥 AUTO-ARRANQUE CON LOADER AZUL SEGURO
    if (!isDocsLoaded) {
        setTimeout(async () => {
            await cargarDatosDocumentos();
            const container = document.getElementById('admin-docs-container');
            if (container) {
                container.innerHTML = renderTablaDocumentosAdmin();
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
        }, 50);

        return `
        <div class="view-header" style="animation: fadeIn 0.4s ease-out;">
            <div class="view-header-left">
                <h1>Documentos</h1>
                <p>Gestión de repositorio y expedientes de la empresa</p>
            </div>
        </div>
        <div id="admin-docs-container" style="padding: 60px; text-align: center; color: #64748b; animation: fadeIn 0.4s ease-out;">
            <i data-lucide="loader-2" class="lucide-spin" style="width:40px;height:40px;margin-bottom:15px; color:#4f46e5;"></i>
            <p style="font-weight: 600; font-size: 1.1rem;">Sincronizando Repositorio con PostgreSQL...</p>
        </div>`;
    }

    return `
    <div style="animation: fadeIn 0.4s ease-out;">
        <div class="view-header">
            <div class="view-header-left">
                <h1>Documentos</h1>
                <p>${dbAdminDocs.length} documentos registrados en el repositorio</p>
            </div>
            <div class="view-header-actions">
                <button class="btn btn-primary" onclick="openSubirDocumento()"><i data-lucide="upload" style="width:15px;height:15px"></i> Subir Documento</button>
            </div>
        </div>
        <div id="admin-docs-container">
            ${renderTablaDocumentosAdmin()}
        </div>
    </div>`;
};

function renderTablaDocumentosAdmin() {
    const countTipo = (t) => dbAdminDocs.filter(d => (d.tipo_documento || d.tipo) === t).length;
    const stats = {
        Contratos: countTipo('Contrato'),
        IDs: countTipo('ID'),
        Recibos: countTipo('Recibo'),
        Certificados: countTipo('Certificado'),
        Otros: countTipo('Otro'),
        Boletas: countTipo('Boleta')
    };

    const empOptions = dbAdminEmps.map(e => `<option value="${e.id}">${e.nombres} ${e.apellidos}</option>`).join('');

    const rows = dbAdminDocs.slice().reverse().map(d => {
        const empId = d.empleado_id || d.empId;
        const emp = dbAdminEmps.find(e => String(e.id) === String(empId));
        const dept = emp ? dbAdminDepts.find(x => String(x.id) === String(emp.departamento_id || emp.deptId)) : null;
        
        const nombreCompleto = emp ? `${emp.nombres || ''} ${emp.apellidos || ''}`.trim() : 'General / Empresa';
        const deptName = dept ? dept.nombre : 'Sin Área';
        const iniciales = emp ? ((emp.nombres || 'X').charAt(0) + (emp.apellidos || 'X').charAt(0)) : 'GE';
        const docTipo = d.tipo_documento || d.tipo;
        const docName = d.nombre_archivo || d.nombre || d.titulo;

        let badgeColor = 'badge-gray';
        if (docTipo === 'Boleta') badgeColor = 'badge-amber';
        if (docTipo === 'Contrato') badgeColor = 'badge-indigo';
        if (docTipo === 'Recibo' || docTipo === 'Certificado') badgeColor = 'badge-green';

        return `<tr class="doc-row" data-name="${(docName || '').toLowerCase()}" data-emp="${emp ? emp.id : ''}" data-tipo="${docTipo}">
            <td><div class="td-user">
                <div class="td-avatar ${emp ? 'av-indigo' : 'av-gray'}">${iniciales}</div>
                <div><div class="td-name">${nombreCompleto}</div><div class="td-sub">${deptName}</div></div>
            </div></td>
            <td>
                <div style="display:flex; align-items:center; gap:8px; font-weight:600; color:#111827;">
                    <i data-lucide="file-text" style="color:#3b82f6; width:16px; height:16px;"></i> ${docName}
                </div>
            </td>
            <td><span class="badge ${badgeColor}">${docTipo}</span></td>
            <td>${typeof window.fmtDate === 'function' ? window.fmtDate(d.fecha_subida || d.fecha) : (d.fecha_subida || d.fecha)}</td>
            <td style="color:#6b7280; font-size:0.85rem; font-weight:500;">${d.tamaño_kb || d.tamano || '120 KB'}</td>
            <td>
                <div style="display:flex; gap:8px; align-items:center;">
                    <button class="btn btn-ghost" style="padding:4px; color:#3b82f6;" title="Ver Detalle" onclick="abrirVistaDocumento('${d.id}')"><i data-lucide="eye" style="width:16px;height:16px;"></i></button>
                    <button class="btn btn-ghost" style="padding:4px; color:#ef4444;" title="Eliminar Documento" onclick="confirmarEliminarDoc('${d.id}')"><i data-lucide="trash-2" style="width:16px;height:16px;"></i></button>
                </div>
            </td>
        </tr>`;
    }).join('');

    return `
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap:15px; margin-bottom:25px;">
        ${[
            { lbl: 'Contratos', val: stats.Contratos, ic: 'edit', color: '#4f46e5' },
            { lbl: 'IDs', val: stats.IDs, ic: 'id-card', color: '#0ea5e9' },
            { lbl: 'Recibos', val: stats.Recibos, ic: 'receipt', color: '#10b981' },
            { lbl: 'Certificados', val: stats.Certificados, ic: 'award', color: '#8b5cf6' },
            { lbl: 'Otros', val: stats.Otros, ic: 'paperclip', color: '#f59e0b' },
            { lbl: 'Boletas', val: stats.Boletas, ic: 'file', color: '#3b82f6' }
        ].map(s => `
            <div style="background:white; border-radius:12px; padding:15px; border:1px solid #e5e7eb; display:flex; align-items:center; gap:15px; box-shadow:0 1px 2px rgba(0,0,0,0.05);">
                <div style="background:${s.color}15; color:${s.color}; width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center;">
                    <i data-lucide="${s.ic}"></i>
                </div>
                <div>
                    <div style="font-size:1.4rem; font-weight:800; color:#111827; line-height:1;">${s.val}</div>
                    <div style="font-size:0.8rem; color:#6b7280; font-weight:500;">${s.lbl}</div>
                </div>
            </div>
        `).join('')}
    </div>

    <div class="card">
        <div class="card-header" style="flex-wrap: wrap;">
            <div class="card-title">Repositorio General</div>
            <div style="display:flex; gap:8px;">
                <div style="position:relative;">
                    <i data-lucide="search" style="position:absolute; left:10px; top:50%; transform:translateY(-50%); width:14px; color:#9ca3af;"></i>
                    <input type="text" id="filtroDocSearch" class="filter-select" placeholder="Buscar documentos..." style="padding-left:30px; width:200px;" onkeyup="ejecutarFiltrosDocs()">
                </div>
                <select class="filter-select" id="filtroDocEmp" onchange="ejecutarFiltrosDocs()">
                    <option value="">Todos los empleados</option>
                    ${empOptions}
                </select>
                <select class="filter-select" id="filtroDocTipo" onchange="ejecutarFiltrosDocs()">
                    <option value="">Todos los tipos</option>
                    <option>Contrato</option>
                    <option>Boleta</option>
                    <option>ID</option>
                    <option>Recibo</option>
                    <option>Certificado</option>
                    <option>Otro</option>
                </select>
            </div>
        </div>
        <div class="table-wrap">
            <table>
                <thead><tr><th>EMPLEADO</th><th>DOCUMENTO</th><th>TIPO</th><th>FECHA</th><th>TAMAÑO</th><th>ACCIONES</th></tr></thead>
                <tbody id="docTableBody">${rows || '<tr><td colspan="6" style="text-align:center;padding:40px;color:#6b7280;">No hay documentos registrados</td></tr>'}</tbody>
            </table>
        </div>
    </div>`;
}

window.initDocumentos = function() { };

window.ejecutarFiltrosDocs = function() {
    const search = document.getElementById('filtroDocSearch').value.toLowerCase();
    const emp = document.getElementById('filtroDocEmp').value;
    const tipo = document.getElementById('filtroDocTipo').value;
    const rows = document.querySelectorAll('.doc-row');
    let visibles = 0;

    rows.forEach(row => {
        const rowName = row.getAttribute('data-name');
        const rowEmp = row.getAttribute('data-emp');
        const rowTipo = row.getAttribute('data-tipo');
        
        const matchSearch = rowName.includes(search);
        const matchEmp = !emp || String(rowEmp) === String(emp);
        const matchTipo = !tipo || rowTipo === tipo;

        if (matchSearch && matchEmp && matchTipo) { row.style.display = ''; visibles++; } 
        else { row.style.display = 'none'; }
    });

    let msgRow = document.getElementById('docEmptyRow');
    if (visibles === 0 && !msgRow) {
        document.getElementById('docTableBody').insertAdjacentHTML('beforeend', '<tr id="docEmptyRow"><td colspan="6" style="text-align:center;padding:30px;color:#6b7280;">No se encontraron documentos</td></tr>');
    } else if (visibles > 0 && msgRow) {
        msgRow.remove();
    }
};

// ============================================================
// 🔥 MODAL: VISOR DE DOCUMENTOS INTELIGENTE 🔥
// ============================================================
window.abrirVistaDocumento = function(id) {
    const doc = dbAdminDocs.find(d => String(d.id) === String(id));
    if (!doc) return;

    const empId = doc.empleado_id || doc.empId;
    const emp = dbAdminEmps.find(e => String(e.id) === String(empId));
    
    const empName = emp ? `${emp.nombres} ${emp.apellidos}` : 'Uso General / Empresa';
    const docName = doc.nombre_archivo || doc.nombre || doc.titulo;
    const docTipo = doc.tipo_documento || doc.tipo;
    const fecha = typeof window.fmtDate === 'function' ? window.fmtDate(doc.fecha_subida || doc.fecha) : (doc.fecha_subida || doc.fecha);
    const tamano = doc.tamaño_kb || doc.tamano || '120 KB';
    const archivoUrl = doc.archivo || doc.url || '';

    let iconType = 'file-text';
    let color = '#3b82f6';
    if (docTipo === 'Contrato') { iconType = 'edit'; color = '#4f46e5'; }
    else if (docTipo === 'Boleta') { iconType = 'file'; color = '#f59e0b'; }
    else if (docTipo === 'Recibo') { iconType = 'receipt'; color = '#10b981'; }

    let previewHTML = '';
    if (archivoUrl && archivoUrl !== 'undefined' && archivoUrl !== 'null' && archivoUrl !== '') {
        const ext = archivoUrl.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
            previewHTML = `<div style="width:100%; height:100%; min-height:500px; display:flex; align-items:center; justify-content:center; background:#e5e7eb; padding:20px;">
                <img src="${archivoUrl}" style="max-width:100%; max-height:100%; border-radius:8px; box-shadow:0 4px 6px rgba(0,0,0,0.1);">
            </div>`;
        } else {
            previewHTML = `<iframe src="${archivoUrl}#toolbar=0" style="width:100%; height:100%; border:none; min-height: 500px; background:#525659;"></iframe>`;
        }
    } else {
        previewHTML = `
        <div style="height:100%; min-height:500px; background:#f3f4f6; display:flex; flex-direction:column; align-items:center; justify-content:center; color:#9ca3af; padding: 20px; text-align:center;">
            <i data-lucide="file-question" style="width:64px; height:64px; margin-bottom:15px; opacity:0.5;"></i>
            <p style="font-size:1.1rem; font-weight:600; color:#6b7280;">Vista previa no disponible</p>
            <p style="font-size:0.85rem;">Este documento no tiene un archivo físico subido.</p>
        </div>`;
    }

    if(typeof window.openModal !== 'function') return;

    window.openModal(`
    <div class="modal-overlay" style="z-index: 9999;">
        <div class="modal" style="max-width: 900px; padding: 0; display: flex; flex-direction: row; overflow: hidden; border-radius: 12px; min-height: 500px;">
            <div style="flex: 1.5; border-right: 1px solid #e5e7eb; background: #e5e7eb; position: relative;">
                ${previewHTML}
            </div>
            <div style="flex: 1; padding: 35px 30px; position: relative; display: flex; flex-direction: column; justify-content: space-between; background: white;">
                <button class="modal-close" onclick="closeModal()" style="position: absolute; right: 15px; top: 15px; background: #f3f4f6; border-radius: 50%; padding: 6px;"><i data-lucide="x" style="width:16px;height:16px;"></i></button>
                <div>
                    <div style="background:${color}15; width:65px; height:65px; border-radius:16px; display:flex; align-items:center; justify-content:center; margin-bottom: 20px;">
                        <i data-lucide="${iconType}" style="width:32px; height:32px; color:${color};"></i>
                    </div>
                    <h3 style="font-size:1.4rem; color:#111827; margin-bottom:8px; line-height: 1.2;">${docName}</h3>
                    <span class="badge badge-gray" style="margin-bottom:25px; font-size: 0.85rem; padding: 4px 10px;">Tipo: ${docTipo}</span>

                    <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:12px; padding:18px; text-align:left; font-size:0.9rem; color:#4b5563;">
                        <div style="display:flex; flex-direction:column; margin-bottom:15px; border-bottom:1px dashed #d1d5db; padding-bottom:12px;">
                            <span style="font-size:0.8rem; color:#9ca3af; margin-bottom:4px; text-transform:uppercase; font-weight:700;">Asignado a</span> 
                            <span style="color:#111827; font-weight:600; font-size:1rem;">${empName}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:12px; border-bottom:1px dashed #d1d5db; padding-bottom:12px;">
                            <span style="color:#9ca3af; font-weight:500;">Fecha de subida:</span> 
                            <span style="font-weight:600; color:#4b5563;">${fecha}</span>
                        </div>
                        <div style="display:flex; justify-content:space-between;">
                            <span style="color:#9ca3af; font-weight:500;">Tamaño de archivo:</span> 
                            <span style="font-weight:600; color:#4b5563;">${tamano}</span>
                        </div>
                    </div>
                    <div id="descargaMsg" style="margin-top: 20px; font-weight: 700; font-size: 0.95rem; height: 20px; text-align:center;"></div>
                </div>
                <div style="margin-top: 20px;">
                    <button class="btn btn-primary" id="btnDescargarModal" onclick="ejecutarDescargaDoc('${archivoUrl}', '${docName}')" style="background:${color}; border-color:${color}; width:100%; justify-content:center; padding: 14px; font-size: 1rem; box-shadow: 0 4px 6px ${color}40;">
                        <i data-lucide="download" style="width:18px;height:18px; margin-right:8px;"></i> Descargar Archivo
                    </button>
                </div>
            </div>
        </div>
    </div>`);
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.ejecutarDescargaDoc = function(archivoUrl, nombreDoc) {
    const btn = document.getElementById('btnDescargarModal');
    const msg = document.getElementById('descargaMsg');
    
    if (!archivoUrl || archivoUrl === 'undefined' || archivoUrl === 'null' || archivoUrl === '') {
        msg.innerText = "❌ El archivo no existe en el servidor.";
        msg.style.color = "#ef4444";
        btn.style.transform = "translateX(5px)";
        setTimeout(() => btn.style.transform = "translateX(-5px)", 100);
        setTimeout(() => btn.style.transform = "translateX(0)", 200);
        return;
    }

    btn.innerHTML = `<i data-lucide="loader-2" class="lucide-spin" style="width:18px;height:18px; margin-right:8px;"></i> Preparando...`;
    btn.disabled = true;
    
    setTimeout(() => {
        msg.innerText = "✅ Descarga iniciada";
        msg.style.color = "#10b981";
        btn.innerHTML = `<i data-lucide="check" style="width:18px;height:18px; margin-right:8px;"></i> Descargado`;
        btn.style.background = "#10b981";
        btn.style.borderColor = "#10b981";
        
        const link = document.createElement('a');
        link.href = archivoUrl;
        link.download = nombreDoc;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setTimeout(() => closeModal(), 2000);
    }, 800);
};

// ============================================================
// MODAL: SUBIR Y ELIMINAR DOCUMENTO (Conexión a BD Django)
// ============================================================
window.openSubirDocumento = function() {
    const empOptions = dbAdminEmps.map(e => `<option value="${e.id}">${e.nombres} ${e.apellidos}</option>`).join('');
    
    if(typeof window.openModal !== 'function') return;

    window.openModal(`
    <div class="modal-overlay" style="z-index: 9999;">
        <div class="modal" style="max-width: 500px;">
            <div class="modal-header">
                <h3>Subir Documento</h3>
                <button class="modal-close" onclick="closeModal()"><i data-lucide="x"></i></button>
            </div>
            <div class="modal-body">
                <div class="form-grid">
                    <div class="field form-full">
                        <label>Asignar a Colaborador (Opcional)</label>
                        <select id="dEmp"><option value="">General / Empresa</option>${empOptions}</select>
                    </div>
                    <div class="field">
                        <label>Nombre del Documento *</label>
                        <input type="text" id="dNom" placeholder="Ej: Contrato Renovación">
                    </div>
                    <div class="field">
                        <label>Tipo de Documento *</label>
                        <select id="dTipo">
                            <option value="Contrato">Contrato</option><option value="Boleta">Boleta</option><option value="ID">ID / DNI</option>
                            <option value="Recibo">Recibo</option><option value="Certificado">Certificado</option><option value="Otro">Otro</option>
                        </select>
                    </div>
                    <div class="field form-full">
                        <label>Seleccionar Archivo *</label>
                        <div style="border: 2px dashed #d1d5db; border-radius: 8px; padding: 30px; text-align: center; background: #f9fafb; cursor: pointer;" onclick="document.getElementById('dFile').click()">
                            <i data-lucide="upload-cloud" style="width:30px; height:30px; color:#9ca3af; margin-bottom:10px;"></i>
                            <div style="font-weight:600; color:#4b5563;">Haz clic para buscar archivo</div>
                            <input type="file" id="dFile" style="display:none;" onchange="actualizarNombreArchivo(this)">
                        </div>
                        <div id="dFileName" style="margin-top:8px; font-size:13px; font-weight:600; color:#3b82f6; text-align:center;"></div>
                    </div>
                    <div id="dMsg" style="grid-column:span 2; text-align:center; font-weight:700; margin-top: 5px; min-height: 20px;"></div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
                <button class="btn btn-primary" id="dBtn" onclick="saveDocumento()"><i data-lucide="save" style="width:14px;height:14px"></i> Subir a Base de Datos</button>
            </div>
        </div>
    </div>`);
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.actualizarNombreArchivo = function(input) {
    if (input.files && input.files[0]) document.getElementById('dFileName').innerText = "📁 " + input.files[0].name;
};

window.saveDocumento = async function() {
    const nombre = document.getElementById('dNom').value;
    const fileInput = document.getElementById('dFile');
    const msgDiv = document.getElementById('dMsg');

    if (!nombre || !fileInput.files[0]) {
        msgDiv.innerText = "⚠️ Completa el nombre y selecciona un archivo.";
        msgDiv.style.color = '#ef4444'; 
        return;
    }

    const btn = document.getElementById('dBtn');
    btn.innerHTML = `<i data-lucide="loader-2" class="lucide-spin" style="width:14px;height:14px"></i> Subiendo...`; 
    btn.disabled = true;
    if(typeof lucide !== 'undefined') lucide.createIcons();

    msgDiv.innerText = "Subiendo archivo a PostgreSQL..."; 
    msgDiv.style.color = '#3b82f6';

    const formData = new FormData();
    // 🔥 CORRECCIÓN CRÍTICA: Los nombres deben ser idénticos a los que espera views.py
    formData.append('empId', document.getElementById('dEmp').value);
    formData.append('nombre', nombre); 
    formData.append('tipo', document.getElementById('dTipo').value);
    formData.append('archivo', fileInput.files[0]);

    const csrf = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';

    try {
        const res = await fetch('/api/documentos/subir/', { 
            method: 'POST', 
            headers: { 'X-CSRFToken': csrf }, 
            body: formData 
        });
        
        if (res.ok) {
            msgDiv.innerText = "✅ ¡Documento guardado con éxito!"; 
            msgDiv.style.color = '#10b981';
            
            // Refrescar el módulo en 1 segundo
            setTimeout(() => {
                closeModal();
                isDocsLoaded = false; // Forzamos a que vuelva a buscar de la BD
                if(typeof window.navigate === 'function') window.navigate('documentos');
            }, 1000);
        } else {
            msgDiv.innerText = "❌ Error del servidor al subir."; 
            msgDiv.style.color = '#ef4444';
            btn.innerHTML = `<i data-lucide="save" style="width:14px;height:14px"></i> Subir a Base de Datos`; 
            btn.disabled = false;
        }
    } catch (e) {
        msgDiv.innerText = "❌ Error de red conectando con Django."; 
        msgDiv.style.color = '#ef4444';
        btn.innerHTML = `<i data-lucide="save" style="width:14px;height:14px"></i> Subir a Base de Datos`; 
        btn.disabled = false;
    }
};

window.confirmarEliminarDoc = function(id) {
    if(typeof window.openModal !== 'function') return;

    window.openModal(`
    <div class="modal-overlay" style="z-index: 9999;">
        <div class="modal" style="max-width: 400px; text-align: center; padding: 30px 20px;">
            <div style="margin: 0 auto; background: #fee2e2; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 20px;">
                <i data-lucide="trash-2" style="width: 30px; height: 30px; color: #ef4444;"></i>
            </div>
            <h3 style="font-size: 1.4rem; margin-bottom: 10px; color: #111827;">Eliminar Documento</h3>
            <p style="color: #6b7280; font-size: 1rem; margin-bottom: 25px;">¿Seguro de que deseas eliminar este archivo? Esta acción es irreversible.</p>
            <div style="display: flex; justify-content: center; gap: 12px;">
                <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
                <button class="btn btn-primary" id="btnDelDoc" style="background: #ef4444; border-color: #ef4444;" onclick="ejecutarEliminarDoc('${id}')">Sí, Eliminar</button>
            </div>
        </div>
    </div>`);
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.ejecutarEliminarDoc = async function(id) {
    const btn = document.getElementById('btnDelDoc');
    btn.innerHTML = `<i data-lucide="loader-2" class="lucide-spin" style="width:16px;height:16px"></i> Borrando...`; 
    btn.disabled = true;
    if(typeof lucide !== 'undefined') lucide.createIcons();

    const csrf = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';

    try {
        const res = await fetch(`/api/documentos/eliminar/${id}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrf
            }
        });

        if (res.ok) {
            closeModal();
            isDocsLoaded = false; // Forzamos refresco desde BD
            if(typeof window.navigate === 'function') window.navigate('documentos');
            if(typeof window.showSystemToast === 'function') window.showSystemToast("Documento eliminado de la Base de Datos.", "success");
        } else {
            const modalBody = document.querySelector('.modal p');
            if (modalBody) {
                modalBody.innerHTML = "❌ Error: No se pudo eliminar de la base de datos.";
                modalBody.style.color = "#ef4444";
            }
            btn.innerHTML = "Sí, Eliminar"; btn.disabled = false;
        }
    } catch (e) {
        const modalBody = document.querySelector('.modal p');
        if (modalBody) {
            modalBody.innerHTML = "❌ Error de conexión con el servidor.";
            modalBody.style.color = "#ef4444";
        }
        btn.innerHTML = "Sí, Eliminar"; btn.disabled = false;
    }
};