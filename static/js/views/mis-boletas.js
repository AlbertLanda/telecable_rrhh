// ============================================================
// VIEW: Mis Boletas (Sincronizado 100% con PostgreSQL)
// Ruta: static/js/views/mis-boletas.js
// ============================================================

let dbMisBoletas = [];

async function cargarMisBoletas() {
    try {
        const res = await fetch('/api/documentos/listar/');
        let data = await res.json();
        if(data.data) data = data.data;
        dbMisBoletas = data;
    } catch(e) {
        console.error("Error trayendo boletas de BD:", e);
    }
}

// --- Helpers Locales ---
const getMiPerfil = () => { 
    const rawData = localStorage.getItem('currentUser');
    let id = window.myEmpId; 
    if (rawData) {
        try {
            const user = JSON.parse(rawData);
            id = user.emp_id || id; 
        } catch(e){}
    }
    const emps = window.realEmpleados || [];
    return emps.find(e => String(e.id) === String(id)); 
};

const mb_fmtSoles = (amount) => 'S/ ' + parseFloat(amount || 0).toFixed(2);

const mb_getPuestoName = (id) => {
    const p = (window.realPuestos || []).find(x => String(x.id) === String(id));
    return p ? p.nombre : 'General';
};
// -----------------------

window.renderMisBoletas = function() {
    const emp = typeof window.myEmp === 'function' ? window.myEmp() : getMiPerfil();
    if (!emp) return `<div style="padding:40px; text-align:center; color:#ef4444;">Error: Perfil no vinculado.</div>`;

    // 🔥 LOADER AZUL: Esperamos a PostgreSQL
    if (dbMisBoletas.length === 0) {
        setTimeout(async () => {
            await cargarMisBoletas();
            const container = document.getElementById('mis-boletas-container');
            if (container) renderTablaMisBoletas(emp);
        }, 50);

        return `
        <div style="animation: fadeIn 0.4s ease-out;">
            <div class="view-header" style="margin-bottom: 24px;">
                <div class="view-header-left">
                    <h1 style="font-size: 1.8rem; font-weight: 800; color: #1e293b; margin-bottom:5px;">Mis Boletas de Pago</h1>
                    <p style="color: #64748b; margin:0;">Historial de remuneraciones</p>
                </div>
            </div>
            <div id="mis-boletas-container" style="padding: 60px; text-align: center; color: #64748b;">
                <i data-lucide="loader-2" class="lucide-spin" style="width:40px;height:40px;margin-bottom:15px; color:#4f46e5;"></i>
                <p style="font-weight: 600; font-size: 1.1rem;">Buscando boletas en PostgreSQL...</p>
            </div>
        </div>`;
    }

    setTimeout(() => renderTablaMisBoletas(emp), 0);

    return `
    <div style="animation: fadeIn 0.4s ease-out;">
        <div class="view-header" style="margin-bottom: 24px;">
            <div class="view-header-left">
                <h1 style="font-size: 1.8rem; font-weight: 800; color: #1e293b; margin-bottom:5px;">Mis Boletas de Pago</h1>
                <p style="color: #64748b; margin:0;">Historial de remuneraciones</p>
            </div>
        </div>
        <div id="mis-boletas-container"></div>
    </div>`;
};

function renderTablaMisBoletas(emp) {
    const container = document.getElementById('mis-boletas-container');
    if (!container) return;

    // FILTRO ESTRICTO BD: Solo boletas de este empleado
    const misBoletas = dbMisBoletas.filter(d => 
        String(d.empleado_id || d.empId) === String(emp.id) && 
        (String(d.tipo_documento || d.tipo || '').toLowerCase().includes('boleta'))
    ).reverse();

    const sueldoBase = parseFloat(emp.sueldo || emp.sueldo_base || 0);
    const asigFam = (emp.nombres && String(emp.nombres).includes('Rocio')) ? 102.50 : 0.00;
    const bruto = sueldoBase + asigFam;

    let sistema = emp.afp_onp || emp.afp || 'No aplica';
    let pctDcto = String(sistema).toUpperCase().includes('ONP') ? 0.13 : (String(sistema).toUpperCase().includes('AFP') ? 0.1309 : 0);
    const descuento = bruto * pctDcto;
    const neto = bruto - descuento;
    
    const cards = misBoletas.map((boleta, i) => {
        const isSigned = boleta.firmado || boleta.signed;
        const isActual = i === 0;
        const nombrePeriodo = (boleta.nombre_archivo || boleta.nombre || '').replace('Boleta de Pago - ', '').replace('Boleta ', '');

        return `
        <div class="card" style="border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: transform 0.2s ease;" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='translateY(0)'">
            <div style="display:flex; justify-content:space-between; margin-bottom:16px;">
                <div>
                    <div style="font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing:0.5px;">BOLETA DE PAGO</div>
                    <div style="font-size: 1.1rem; font-weight: 800; color: #1e293b; margin-top:2px;">${nombrePeriodo}</div>
                </div>
                ${isActual ? '<span class="badge badge-green" style="font-weight:700;">Actual</span>' : '<span class="badge badge-gray" style="font-weight:600;">Pagado</span>'}
            </div>

            <div style="display:flex; justify-content:space-between; margin-bottom:8px; font-size: 0.85rem;">
                <span style="color: #64748b;">Sueldo Bruto</span>
                <span style="color: #1e293b; font-weight: 600;">${mb_fmtSoles(bruto)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-size: 0.85rem;">
                <span style="color: #ef4444;">${sistema}</span>
                <span style="color: #ef4444; font-weight: 600;">- ${mb_fmtSoles(descuento)}</span>
            </div>
            
            <div style="background: #ecfdf5; border-radius: 8px; padding: 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span style="font-size: 0.85rem; font-weight: 700; color: #16a34a;">Neto</span>
                <span style="font-weight: 800; font-size: 1.1rem; color: #16a34a;">${mb_fmtSoles(neto)}</span>
            </div>

            ${!isSigned 
                ? `<div style="text-align:center; font-size:0.8rem; color:#ef4444; font-weight:700;"><i data-lucide="alert-circle" style="width:14px;height:14px;display:inline;margin-right:4px;"></i>Pendiente Firma</div>` 
                : `<div style="text-align:center; font-size:0.8rem; color:#10b981; font-weight:700;"><i data-lucide="check-circle-2" style="width:14px;height:14px;display:inline;margin-right:4px;"></i>Firmado</div>`
            }

            <button class="btn btn-ghost btn-sm" style="width: 100%; margin-top: 8px; justify-content: center; border: 1px solid #e2e8f0; font-weight: 600; color:#1e293b;" onclick="window.abrirFirmaBD('${boleta.id}')">
                <i data-lucide="printer" style="width:16px; height:16px; margin-right: 6px;"></i> Ver / Firmar
            </button>
        </div>`;
    }).join('');

    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
            ${misBoletas.length > 0 ? cards : '<div style="grid-column: 1 / -1; padding:40px; text-align:center; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:12px; color:#64748b;">No hay boletas generadas en el sistema para tu perfil.</div>'}
        </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ─── MODAL Y LLAMADA A DJANGO (PYTHON) ───
window.abrirFirmaBD = function(docId) {
    const emp = typeof window.myEmp === 'function' ? window.myEmp() : getMiPerfil();
    if (!emp) return;

    const boleta = dbMisBoletas.find(d => String(d.id) === String(docId));
    if(!boleta) return;
    
    const isSigned = boleta.firmado || boleta.signed;
    const nombrePeriodo = (boleta.nombre_archivo || boleta.nombre || '').replace('Boleta de Pago - ', '').replace('Boleta ', '');

    const sueldoBase = parseFloat(emp.sueldo || emp.sueldo_base || 0);
    const asigFam = (emp.nombres && String(emp.nombres).includes('Rocio')) ? 102.50 : 0.00;
    const bruto = sueldoBase + asigFam;

    let sistema = emp.afp_onp || emp.afp || 'No aplica';
    let pctDcto = String(sistema).toUpperCase().includes('ONP') ? 0.13 : (String(sistema).toUpperCase().includes('AFP') ? 0.1309 : 0);
    const descuento = bruto * pctDcto;
    const neto = bruto - descuento;

    const empName = `${emp.nombres || ''} ${emp.apellidos || ''}`.trim() || 'Sin Nombre';
    const company = (window.realEmpresas && window.realEmpresas[0]) ? window.realEmpresas[0] : {nombre: 'Telecable S.A.C.', ruc: '20123456789'};

    if(typeof window.openModal !== 'function') return;

    window.openModal(`
    <div class="modal-overlay" style="z-index: 9999; backdrop-filter: blur(4px);">
        <div class="modal" style="max-width: 600px; padding: 0; border-radius: 12px; background: white; overflow: hidden; animation: modalPop 0.3s ease-out;">
            <div class="no-print" style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: white;">
                <div>
                    <h3 style="font-size: 1.1rem; font-weight: 800; color: #1e293b; margin: 0;">Boleta de Pago</h3>
                    <div style="font-size: 0.8rem; color: #64748b; margin-top: 2px;">${nombrePeriodo} · ${empName}</div>
                </div>
                <button onclick="window.closeModal()" style="background:#f1f5f9; border:none; width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; color:#64748b;"><i data-lucide="x" style="width:16px;height:16px"></i></button>
            </div>

            <div id="area-imprimir-empleado" style="padding: 30px; background: white;">
                <div style="text-align:center;margin-bottom:16px">
                  <div style="font-weight:800;font-size:1.1rem">${company.nombre || company.razon_social}</div>
                  <div style="font-size:.78rem;color:var(--text-muted)">RUC ${company.ruc}</div>
                  <div style="font-weight:700;margin-top:8px;color:var(--primary)">BOLETA DE PAGO · ${nombrePeriodo.toUpperCase()}</div>
                </div>

                <div class="info-row between"><span class="info-row-label">Trabajador</span><span class="fw-700">${empName}</span></div>
                <div class="info-row between"><span class="info-row-label">DNI</span><span>${emp.dni || '---'}</span></div>
                <div class="info-row between"><span class="info-row-label">Cargo</span><span>${mb_getPuestoName(emp.puestoId || emp.puesto_id)}</span></div>
                
                <div class="divider"></div>
                <div class="section-label" style="font-size: 0.75rem; font-weight: 800; color: #94a3b8; margin-bottom: 12px; letter-spacing: 1px; text-transform:uppercase;">Ingresos</div>
                
                <div style="display:flex; justify-content:space-between; font-size: 0.85rem; margin-bottom: 12px;">
                    <span style="color:#64748b;">Sueldo Básico</span>
                    <span style="color:#1e293b;">${mb_fmtSoles(sueldoBase)}</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size: 0.85rem; margin-bottom: 16px;">
                    <span style="color:#64748b;">Asignación Familiar</span>
                    <span style="color:#1e293b;">${mb_fmtSoles(asigFam)}</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size: 0.95rem; font-weight: 800; margin-bottom: 30px; border-bottom: 1px dashed #e2e8f0; padding-bottom:16px;">
                    <span style="color:#0f172a;">TOTAL INGRESOS</span>
                    <span style="color:#0f172a;">${mb_fmtSoles(bruto)}</span>
                </div>

                <div class="section-label" style="font-size: 0.75rem; font-weight: 800; color: #94a3b8; margin-bottom: 12px; letter-spacing: 1px; text-transform:uppercase;">Descuentos</div>
                
                <div style="display:flex; justify-content:space-between; font-size: 0.85rem; margin-bottom: 12px;">
                    <span style="color:#ef4444;">${sistema}</span>
                    <span style="color:#ef4444;">- ${mb_fmtSoles(descuento)}</span>
                </div>
                <div style="display:flex; justify-content:space-between; font-size: 0.95rem; font-weight: 800; margin-bottom: 30px; border-bottom: 1px dashed #e2e8f0; padding-bottom:16px;">
                    <span style="color:#ef4444;">TOTAL DESCUENTOS</span>
                    <span style="color:#ef4444;">- ${mb_fmtSoles(descuento)}</span>
                </div>

                <div style="background: #ecfdf5; padding: 16px 20px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <span style="font-weight: 800; color: #166534; font-size: 1rem;">NETO A PAGAR</span>
                    <span style="font-weight: 800; font-size: 1.4rem; color: #16a34a;">${mb_fmtSoles(neto)}</span>
                </div>

                ${isSigned ? `
                <div style="border: 1px solid #bbf7d0; background: #ecfdf5; padding: 16px; border-radius: 8px; display: flex; align-items: center; gap: 12px;">
                    <div style="width: 36px; height: 36px; background: #10b981; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i data-lucide="check" style="width: 20px; height: 20px;"></i>
                    </div>
                    <div>
                        <div style="font-weight: 800; color: #166534; font-size: 0.95rem;">Firmado Digitalmente</div>
                        <div style="font-size: 0.8rem; color: #16a34a;">Por: ${empName}</div>
                    </div>
                </div>
                ` : `
                <div class="no-print" style="border: 1px dashed #cbd5e1; background: #f8fafc; padding: 20px; border-radius: 8px; text-align: center;">
                    <button class="btn btn-primary" id="btn-firma-bd" style="background: #10b981; border: none; font-weight: 700; width: 100%; justify-content: center; padding:12px;" onclick="window.ejecutarFirmaDjango('${docId}')">
                        <i data-lucide="pen-tool" style="width:16px;height:16px;margin-right:6px;"></i> Firmar Boleta Ahora
                    </button>
                </div>
                `}
            </div>
            
            <div class="no-print" style="padding: 16px 24px; background: white; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
                <button class="btn btn-ghost" onclick="window.closeModal()" style="font-weight: 600; border: 1px solid #e2e8f0;">Cerrar</button>
                <button class="btn btn-primary" onclick="window.print()" style="font-weight: 600; background: #2563eb; border: none;">
                    <i data-lucide="printer" style="width:16px; height:16px; margin-right:6px;"></i> Imprimir Oficial
                </button>
            </div>
            
            <style>
                @media print {
                    body * { visibility: hidden !important; }
                    #area-imprimir-empleado, #area-imprimir-empleado * { visibility: visible !important; }
                    #area-imprimir-empleado { position: absolute; left: 0; top: 0; width: 100%; padding:0; margin:0; }
                    .no-print { display: none !important; }
                }
            </style>
        </div>
    </div>
    `);
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.ejecutarFirmaDjango = async function(docId) {
    const btn = document.getElementById('btn-firma-bd');
    btn.innerHTML = '<i data-lucide="loader-2" class="lucide-spin" style="width:16px;height:16px;margin-right:6px;"></i> Firmando...';
    btn.disabled = true;
    if (typeof lucide !== 'undefined') lucide.createIcons();

    try {
        const csrf = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
        const response = await fetch('/api/documentos/firmar/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf },
            body: JSON.stringify({ doc_id: docId })
        });
        
        if (response.ok) {
            window.closeModal();
            if(typeof window.showToast === 'function') window.showToast("¡Boleta firmada con éxito!", "success");
            
            // Recargamos el módulo para ver el cambio de la BD
            setTimeout(() => {
                dbMisBoletas = []; 
                if (typeof window.navigate === 'function') window.navigate('mis-boletas');
            }, 1000);
        } else {
            if(typeof window.showToast === 'function') window.showToast("Error del servidor.", "error");
            window.closeModal();
        }
    } catch(e) {
        if(typeof window.showToast === 'function') window.showToast("Error de red conectando con el servidor.", "error");
        window.closeModal();
    }
};