// ============================================================
// VIEW: Mis Documentos (Expedientes Generales - Conectado a BD)
// Ruta: static/js/views/mis-documentos.js
// ============================================================

// Variable global para almacenar los documentos reales
let dbMisDocumentos = [];

async function cargarMisDocumentos() {
    try {
        // Intentamos leer la variable inyectada por Django en el HTML primero (es más rápido)
        if (typeof document.getElementById('docs-data') !== 'undefined' && document.getElementById('docs-data') !== null) {
            const dataText = document.getElementById('docs-data').textContent;
            if (dataText) {
                dbMisDocumentos = JSON.parse(dataText);
                return;
            }
        }
        
        // Si no está en el HTML, podrías hacer un fetch aquí a un endpoint de documentos
        // (Asegúrate de tener un endpoint /api/documentos/listar/ en tu Django si usas esto)
        // const res = await fetch('/api/documentos/listar/');
        // dbMisDocumentos = await res.json();
    } catch (error) {
        console.error("Error cargando documentos de la BD:", error);
    }
}

window.renderMisDocumentos = function() {
    const emp = typeof window.myEmp === 'function' ? window.myEmp() : null;
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

    // Si ya cargó, dibuja inmediatamente
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

    // FILTRO SUPREMO: Solo documentos del empleado actual y que NO sean boletas
    const misDocsGenerales = dbMisDocumentos.filter(d => {
        const esDelEmpleado = String(d.empId || d.empleado_id) === String(emp.id);
        const tipoDoc = String(d.tipo || d.tipo_documento || '').toLowerCase();
        const nombreDoc = String(d.nombre || d.nombre_archivo || '').toLowerCase();
        const esBoleta = tipoDoc.includes('boleta') || nombreDoc.includes('boleta');
        return esDelEmpleado && !esBoleta;
    });

    const typeColors = { 
        'Contrato': 'badge-indigo', 
        'ID': 'badge-blue', 
        'Certificado': 'badge-green', 
        'Otro': 'badge-gray' 
    };

    const cards = misDocsGenerales.map(doc => {
        return `
        <div class="card" style="padding: 24px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform=''">
            <div style="display:flex; gap:15px; margin-bottom: 20px; align-items: flex-start;">
                <div style="width:50px; height:50px; background:#e0e7ff; color:#4f46e5; border-radius:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                    <i data-lucide="file-text" style="width:24px; height:24px;"></i>
                </div>
                <div style="flex:1; overflow:hidden;">
                    <div style="font-size: 1.05rem; font-weight:700; color:#1e293b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${doc.nombre_archivo || doc.nombre}">
                        ${doc.nombre_archivo || doc.nombre}
                    </div>
                    <div style="font-size:0.85rem; color:#64748b; margin-top:4px; font-weight: 500;">
                        <span class="badge ${typeColors[doc.tipo_documento || doc.tipo] || 'badge-gray'}">${doc.tipo_documento || doc.tipo}</span>
                        · ${typeof window.fmtDate === 'function' ? window.fmtDate(doc.fecha_subida || doc.fecha) : (doc.fecha_subida || doc.fecha)}
                    </div>
                </div>
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px dashed #e2e8f0;">
                <span style="font-size:0.8rem; color:#94a3b8; font-weight:600;"><i data-lucide="hard-drive" style="width:12px;height:12px;display:inline;margin-right:2px;"></i> ${doc.tamaño_kb || doc.kb || 120} KB</span>
            </div>

            <a href="${doc.url || doc.archivo || '#'}" target="_blank" class="btn btn-ghost" style="width: 100%; justify-content:center; font-weight: 600; border: 1px solid #cbd5e1; text-decoration:none; color:#1e293b;">
                <i data-lucide="download" style="width:16px;height:16px;margin-right:6px;"></i> Descargar Archivo
            </a>
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