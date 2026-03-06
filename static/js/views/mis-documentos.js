// ============================================================
// VIEW: Mis Documentos (Expedientes Generales - 100% Independiente)
// Ruta: static/js/views/mis-documentos.js
// ============================================================

// Variable global para almacenar los documentos reales
let dbMisDocumentos = [];

async function cargarMisDocumentos() {
    try {
        const res = await fetch('/api/documentos/listar/');
        let data = await res.json();
        if(data.data) data = data.data;
        dbMisDocumentos = data;
    } catch (error) {
        console.error("Error cargando documentos de la BD:", error);
        dbMisDocumentos = window.realDocumentos || [];
    }
}

// --- Helpers Locales ---
const getMiPerfil = () => { 
    const rawData = localStorage.getItem('currentUser');
    let id = window.myEmpId; 
    
    if (rawData) {
        try {
            const user = JSON.parse(rawData);
            id = user.emp_id || user.id || id; 
        } catch(e) {}
    }
    
    const emps = window.realEmpleados || [];
    return emps.find(e => String(e.id) === String(id)); 
};

const md_fmtDate = (dateStr) => {
    if (!dateStr || dateStr === '—') return '—';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${d.getUTCDate()} ${meses[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};
// -----------------------

window.renderMisDocumentos = function() {
    const emp = typeof window.myEmp === 'function' ? window.myEmp() : getMiPerfil();
    if (!emp) return `<div style="padding:40px; text-align:center; color:#ef4444;">Error: Perfil no vinculado.</div>`;

    // 🔥 AUTO-ARRANQUE CON LOADER
    if (dbMisDocumentos.length === 0) {
        setTimeout(async () => {
            await cargarMisDocumentos();
            const container = document.getElementById('mis-documentos-container');
            if (container) {
                renderTarjetasMisDocumentos(emp);
            }
        }, 50);

        return `
        <div style="animation: fadeIn 0.4s ease-out;">
            <div class="view-header" style="margin-bottom: 24px;">
                <div class="view-header-left">
                    <h1 style="font-size: 1.8rem; font-weight: 800; color: #1e293b; margin-bottom: 5px;">Mis Documentos</h1>
                    <p style="color: #64748b; margin: 0;">Expediente personal: DNI, Contratos y Certificados</p>
                </div>
            </div>
            
            <div id="mis-documentos-container" style="padding: 60px; text-align: center; color: #64748b;">
                <i data-lucide="loader-2" class="lucide-spin" style="width:40px;height:40px;margin-bottom:15px; color:#4f46e5;"></i>
                <p style="font-weight: 600; font-size: 1.1rem;">Buscando expedientes en PostgreSQL...</p>
            </div>
        </div>`;
    }

    setTimeout(() => renderTarjetasMisDocumentos(emp), 0);

    return `
    <div style="animation: fadeIn 0.4s ease-out;">
        <div class="view-header" style="margin-bottom: 24px;">
            <div class="view-header-left">
                <h1 style="font-size: 1.8rem; font-weight: 800; color: #1e293b; margin-bottom: 5px;">Mis Documentos</h1>
                <p style="color: #64748b; margin: 0;">Expediente personal: DNI, Contratos y Certificados</p>
            </div>
        </div>
        <div id="mis-documentos-container"></div>
    </div>`;
};

// Dibuja las tarjetas reales
function renderTarjetasMisDocumentos(emp) {
    const container = document.getElementById('mis-documentos-container');
    if (!container) return;

    // FILTRO: Solo documentos del empleado y que NO sean boletas
    const misDocsGenerales = dbMisDocumentos.filter(d => {
        const esDelEmpleado = String(d.empleado_id || d.empId || '') === String(emp.id);
        const tipoDoc = String(d.tipo_documento || d.tipo || '').toLowerCase();
        const nombreDoc = String(d.nombre_archivo || d.nombre || '').toLowerCase();
        const esBoleta = tipoDoc.includes('boleta') || nombreDoc.includes('boleta');
        return esDelEmpleado && !esBoleta;
    }).reverse();

    const typeColors = { 
        'Contrato': 'badge-indigo', 
        'ID': 'badge-blue', 
        'Certificado': 'badge-green', 
        'Otro': 'badge-gray' 
    };

    const cards = misDocsGenerales.map(doc => {
        const docName = doc.nombre_archivo || doc.nombre || 'Documento';
        const docTipo = doc.tipo_documento || doc.tipo || 'Otro';
        const docFecha = md_fmtDate(doc.fecha_subida || doc.fecha);
        const docSize = doc.tamaño_kb || doc.tamano || '120';
        
        // 🛠️ RUTA A PRUEBA DE FALLOS 🛠️
        let docUrl = doc.archivo || doc.url || '#';
        if (docUrl !== '#' && !docUrl.startsWith('http')) {
            if (docUrl.startsWith('/')) docUrl = docUrl.substring(1);
            if (!docUrl.startsWith('media/')) docUrl = '/media/' + docUrl;
            else docUrl = '/' + docUrl;
        }

        return `
        <div class="card" style="padding: 24px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">
            <div style="display:flex; gap:15px; margin-bottom: 20px; align-items: flex-start;">
                <div style="width:50px; height:50px; background:#e0e7ff; color:#4f46e5; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                    <i data-lucide="file-text" style="width:24px; height:24px;"></i>
                </div>
                <div style="flex:1; overflow:hidden;">
                    <div style="font-size: 1.05rem; font-weight:700; color:#1e293b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${docName}">
                        ${docName}
                    </div>
                    <div style="font-size:0.85rem; color:#64748b; margin-top:4px; font-weight: 500;">
                        <span class="badge ${typeColors[docTipo] || 'badge-gray'}">${docTipo}</span>
                        · ${docFecha}
                    </div>
                </div>
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px dashed #e2e8f0;">
                <span style="font-size:0.8rem; color:#94a3b8; font-weight:600;"><i data-lucide="hard-drive" style="width:12px;height:12px;display:inline;margin-right:2px;"></i> ${docSize} KB</span>
            </div>

            <div style="display: flex; gap: 10px;">
                <button class="btn btn-ghost" style="flex: 1; justify-content:center; font-weight: 600; border: 1px solid #cbd5e1; color:#3b82f6;" onclick="window.abrirVisorMiDocumento('${doc.id}')">
                    <i data-lucide="eye" style="width:16px;height:16px;margin-right:6px;"></i> Ver Detalle
                </button>
                <a href="${docUrl}" target="_blank" class="btn btn-primary" style="flex: 1; justify-content:center; font-weight: 600; text-decoration:none; background:#10b981; border:none;">
                    <i data-lucide="download" style="width:16px;height:16px;margin-right:6px;"></i> Bajar
                </a>
            </div>
        </div>`;
    }).join('');

    container.innerHTML = misDocsGenerales.length === 0 ? `
        <div class="card" style="padding: 80px 20px; text-align: center; border: 2px dashed #cbd5e1; background: #f8fafc;">
            <div style="width: 80px; height: 80px; background: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <i data-lucide="folder" style="width:40px; height:40px; color:#94a3b8;"></i>
            </div>
            <h3 style="color:#1e293b; font-size: 1.4rem; margin-bottom:8px; font-weight: 800;">Expediente vacío</h3>
            <p style="color:#64748b; font-size: 1rem;">RR.HH. no ha subido documentos a tu perfil.</p>
        </div>` : `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;">
            ${cards}
        </div>`;
        
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ============================================================
// 🔥 MODAL: VISOR DE DOCUMENTOS DEL EMPLEADO 🔥
// ============================================================
window.abrirVisorMiDocumento = function(id) {
    const doc = dbMisDocumentos.find(d => String(d.id) === String(id));
    if (!doc) return;

    const emp = typeof window.myEmp === 'function' ? window.myEmp() : getMiPerfil();
    const empName = emp ? `${emp.nombres} ${emp.apellidos}` : 'Usuario';
    
    const docName = doc.nombre_archivo || doc.nombre || doc.titulo;
    const docTipo = doc.tipo_documento || doc.tipo;
    const fecha = md_fmtDate(doc.fecha_subida || doc.fecha);
    const tamano = doc.tamaño_kb || doc.tamano || '120 KB';
    
    // 🛠️ RUTA A PRUEBA DE FALLOS PARA EL MODAL 🛠️
    let archivoUrl = doc.archivo || doc.url || '';
    if (archivoUrl && !archivoUrl.startsWith('http')) {
        if (archivoUrl.startsWith('/')) archivoUrl = archivoUrl.substring(1);
        if (!archivoUrl.startsWith('media/')) archivoUrl = '/media/' + archivoUrl;
        else archivoUrl = '/' + archivoUrl;
    }

    let iconType = 'file-text';
    let color = '#3b82f6';
    if (docTipo === 'Contrato') { iconType = 'edit'; color = '#4f46e5'; }
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
                <button class="modal-close" onclick="window.closeModal()" style="position: absolute; right: 15px; top: 15px; background: #f3f4f6; border-radius: 50%; padding: 6px;"><i data-lucide="x" style="width:16px;height:16px;"></i></button>
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
                </div>
                <div style="margin-top: 20px;">
                    <a href="${archivoUrl}" target="_blank" class="btn btn-primary" style="background:${color}; border-color:${color}; width:100%; justify-content:center; padding: 14px; font-size: 1rem; box-shadow: 0 4px 6px ${color}40; text-decoration:none;">
                        <i data-lucide="download" style="width:18px;height:18px; margin-right:8px;"></i> Descargar Archivo
                    </a>
                </div>
            </div>
        </div>
    </div>`);
    if (typeof lucide !== 'undefined') lucide.createIcons();
};