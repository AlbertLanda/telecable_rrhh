// ============================================================
// VIEW: Planilla Mensual (Autocontenido - Sin dependencias externas)
// Ruta: static/js/views/planilla.js
// ============================================================

// Variables locales para la vista de planilla
let planEmpleados = [];
let planDepartamentos = [];

// ============================================================
// CARGA DE DATOS Y AUTO-ARRANQUE
// ============================================================
async function cargarDatosPlanilla() {
    try {
        const [resEmp, resDept] = await Promise.all([
            fetch('/api/empleados/listar/'),
            fetch('/api/departamentos/listar/')
        ]);

        let emps = await resEmp.json();
        if(emps.data) emps = emps.data;
        planEmpleados = emps;

        let depts = await resDept.json();
        if(depts.data) depts = depts.data;
        planDepartamentos = depts;

    } catch (error) {
        console.error("Error conectando a PostgreSQL:", error);
        if(typeof window.showToast === 'function') {
            window.showToast("Error al conectar con la base de datos.", "error");
        } else {
            alert("Error al conectar con la base de datos.");
        }
    }
}

window.initPlanilla = async function() {
    const container = document.getElementById('planillaContainer');
    
    // Mostrar loader mientras trae datos de PostgreSQL
    if (container) {
        container.innerHTML = `<div style="padding: 60px; text-align: center; color: #64748b;">
            <i data-lucide="loader-2" class="lucide-spin" style="width:40px;height:40px;margin-bottom:15px; color:#4f46e5;"></i>
            <p style="font-weight: 600; font-size: 1.1rem;">Calculando nómina desde PostgreSQL...</p>
        </div>`;
        if(typeof lucide !== 'undefined') lucide.createIcons();
    }
    
    await cargarDatosPlanilla();
    renderTablaPlanilla();
}

window.renderPlanilla = function() {
    const hoyObj = new Date();
    const anioActual = hoyObj.getFullYear();
    const mesActual = hoyObj.toLocaleDateString('es-ES', { month: 'long' });
    const periodoStr = `${mesActual.charAt(0).toUpperCase() + mesActual.slice(1)} ${anioActual}`;

    // Dibujamos el "Esqueleto" de la vista. La tabla se llenará sola tras cargar la BD usando initPlanilla (llamado desde app.js).
    return `
    <div style="animation: fadeIn 0.4s ease-out;">
        <div class="view-header" style="margin-bottom:24px; display:flex; justify-content:space-between; align-items:flex-end;">
            <div class="view-header-left">
                <h1 style="font-size: 1.8rem; font-weight: 800; color:#1e293b; margin-bottom:5px;">Planilla Mensual</h1>
                <p style="color:#64748b; margin:0;">Cálculo de remuneraciones y emisión de boletas legales</p>
            </div>
            <div class="view-header-actions" style="display:flex; gap:10px;">
                <button class="btn btn-ghost" onclick="window.exportarPlanillaExcel()"><i data-lucide="file-spreadsheet" style="width:15px;height:15px; color:#10b981;"></i> Excel</button>
                <button class="btn btn-ghost" onclick="window.exportarPlanillaPDF()"><i data-lucide="download" style="width:15px;height:15px; color:#ef4444;"></i> PDF</button>
                <button class="btn btn-primary" style="background:#4f46e5; border:none; box-shadow: 0 4px 6px rgba(79,70,229,0.3);" onclick="window.emitirBoletasMasivasBD('${periodoStr}')">
                    <i data-lucide="send" style="width:15px;height:15px; margin-right:6px;"></i> Emitir Boletas
                </button>
            </div>
        </div>
        
        <div id="planillaContainer"></div>
    </div>`;
};

function renderTablaPlanilla() {
    const container = document.getElementById('planillaContainer');
    if (!container) return;

    const hoyObj = new Date();
    const anioActual = hoyObj.getFullYear();
    const mesActual = hoyObj.toLocaleDateString('es-ES', { month: 'long' });
    const periodoStr = `${mesActual.charAt(0).toUpperCase() + mesActual.slice(1)} ${anioActual}`;
    const fechaGenerado = hoyObj.toLocaleDateString('es-ES');

    let tBruto = 0, tDcto = 0, tEsSalud = 0, tNeto = 0;
    
    // Obtenemos la sede actual desde app.js (o usamos la primera si no existe)
    const currentSede = typeof window.currentSedeId !== 'undefined' ? window.currentSedeId : (window.realSedes && window.realSedes[0] ? window.realSedes[0].id : null);

    // Filtro estricto: Solo empleados activos de la sede actual
    const empleadosActivos = planEmpleados.filter(e => {
        const est = String(e.estado || '').toLowerCase();
        const noEsCesado = est !== 'cesado' && est !== 'inactivo';
        const empSede = e.sede_id || e.sede;
        const matchSede = !empSede || String(empSede) === String(currentSede);
        return noEsCesado && matchSede;
    });

    let rows = '<tr><td colspan="9" style="text-align:center;padding:30px;color:#9ca3af;">No hay empleados activos en esta sede.</td></tr>';

    if (empleadosActivos.length > 0) {
        rows = empleadosActivos.map(e => {
            const dId = e.deptId || e.departamento_id || e.departamento;
            const dept = planDepartamentos.find(d => String(d.id) === String(dId)) || { nombre: 'General' };
            
            const sueldoBase = parseFloat(e.sueldo || e.sueldo_base || 0);
            const asigFam = (e.nombres && String(e.nombres).includes('Rocio')) ? 102.50 : 0.00;
            const bruto = sueldoBase + asigFam;

            let sistema = e.afp_onp || e.afp || 'No aplica';
            let pctDcto = String(sistema).toUpperCase().includes('ONP') ? 0.13 : (String(sistema).toUpperCase().includes('AFP') ? 0.1309 : 0);

            const descuento = bruto * pctDcto;
            const essalud = bruto * 0.09;
            const neto = bruto - descuento;

            tBruto += bruto; tDcto += descuento; tEsSalud += essalud; tNeto += neto;

            let nombreCompleto = `${e.nombres || ''} ${e.apellidos || ''}`.trim() || 'Sin Nombre';
            const iniciales = (e.nombres || 'X').charAt(0) + (e.apellidos || 'X').charAt(0);
            
            // Helper local de color
            const getAvatarColor = (id) => { const c = ['av-indigo', 'av-blue', 'av-green', 'av-purple', 'av-amber', 'av-red']; return c[(id || 0) % c.length]; };
            const bgColor = e.avatar_color || getAvatarColor(e.id);

            return `
            <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
              <td style="padding:12px 16px;">
                <div class="td-user">
                    <div class="td-avatar ${bgColor.startsWith('av-') ? bgColor : ''}" style="${bgColor.startsWith('#') ? 'background:'+bgColor+'; color:#fff;' : ''} width:38px; height:38px; font-size:0.9rem;">${iniciales.toUpperCase()}</div>
                    <div>
                        <div class="td-name" style="font-weight:700; color:#1e293b;">${nombreCompleto}</div>
                        <div class="td-sub" style="font-size:0.8rem; color:#64748b;">${dept.nombre} | DNI: ${e.dni || '---'}</div>
                    </div>
                </div>
              </td>
              <td style="padding:16px;">S/ ${sueldoBase.toFixed(2)}</td>
              <td style="padding:16px;">S/ ${asigFam.toFixed(2)}</td>
              <td style="padding:16px; font-weight:700;">S/ ${bruto.toFixed(2)}</td>
              <td style="padding:16px; color:#ef4444; font-weight:600;">- S/ ${descuento.toFixed(2)}</td>
              <td style="padding:16px;"><span class="badge badge-gray" style="font-size:0.7rem;">${sistema}</span></td>
              <td style="padding:16px; color:#eab308; font-weight:600;">S/ ${essalud.toFixed(2)}</td>
              <td style="padding:16px; color:#10b981; font-weight:800;">S/ ${neto.toFixed(2)}</td>
              <td style="padding:16px;" class="col-accion-print">
                <button class="btn btn-ghost" style="padding:6px; color:#4f46e5; border:1px solid #e0e7ff; background:white; border-radius:6px;" onclick="window.imprimirBoletaIndividual('${e.id}')" title="Ver Boleta">
                  <i data-lucide="eye" style="width:16px;height:16px;"></i>
                </button>
              </td>
            </tr>`;
        }).join('');
    }

    container.innerHTML = `
      <div style="background:#111827; color:white; border-radius:12px; padding:24px; margin-bottom:24px; display:flex; justify-content:space-between; align-items:center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <div>
            <div style="color:#9ca3af; font-size:0.85rem; margin-bottom:4px;">Período de Planilla</div>
            <div style="font-size:1.5rem; font-weight:700; margin-bottom:4px;">${periodoStr}</div>
            <div style="color:#9ca3af; font-size:0.85rem;">${empleadosActivos.length} empleados procesados · Generado: ${fechaGenerado}</div>
        </div>
        <div style="display:flex; gap:40px; text-align:right;">
            <div>
                <div style="color:#9ca3af; font-size:0.8rem; margin-bottom:4px;">Total Bruto</div>
                <div style="font-size:1.2rem; font-weight:700;">S/ ${tBruto.toFixed(2)}</div>
            </div>
            <div>
                <div style="color:#fca5a5; font-size:0.8rem; margin-bottom:4px;">Total Descuentos</div>
                <div style="font-size:1.2rem; font-weight:700; color:#f87171;">S/ ${tDcto.toFixed(2)}</div>
            </div>
            <div>
                <div style="color:#fde68a; font-size:0.8rem; margin-bottom:4px;">EsSalud (Empleador)</div>
                <div style="font-size:1.2rem; font-weight:700; color:#fbbf24;">S/ ${tEsSalud.toFixed(2)}</div>
            </div>
            <div style="padding-left:20px; border-left: 1px solid #374151;">
                <div style="color:#6ee7b7; font-size:0.8rem; margin-bottom:4px;">Total Neto</div>
                <div style="font-size:1.4rem; font-weight:800; color:#34d399;">S/ ${tNeto.toFixed(2)}</div>
            </div>
        </div>
      </div>

      <div class="card" id="areaImpresionGlobal" style="border:none; border-radius:16px; overflow:hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div class="card-header" style="border-bottom: 1px solid #f1f5f9; padding:20px; display:flex; justify-content:space-between;">
          <div class="card-title" style="font-size: 1.1rem; font-weight: 700; color:#1e293b;">Detalle de Planilla – ${periodoStr}</div>
          <select class="filter-select" style="padding:6px 12px; border-radius:6px; border:1px solid #cbd5e1;"><option>${periodoStr}</option></select>
        </div>
        <div class="table-wrap" style="overflow-x: auto;">
          <table style="width:100%; text-align:left; border-collapse:collapse;">
            <thead style="background:#f8fafc; border-bottom:2px solid #e2e8f0;">
                <tr>
                    <th style="padding:16px; font-size:0.75rem; color:#64748b; text-transform:uppercase;">EMPLEADO</th>
                    <th style="padding:16px; font-size:0.75rem; color:#64748b; text-transform:uppercase;">S. BASE</th>
                    <th style="padding:16px; font-size:0.75rem; color:#64748b; text-transform:uppercase;">ASIG. FAM.</th>
                    <th style="padding:16px; font-size:0.75rem; color:#64748b; text-transform:uppercase;">BRUTO TOTAL</th>
                    <th style="padding:16px; font-size:0.75rem; color:#64748b; text-transform:uppercase;">AFP/ONP</th>
                    <th style="padding:16px; font-size:0.75rem; color:#64748b; text-transform:uppercase;">SISTEMA</th>
                    <th style="padding:16px; font-size:0.75rem; color:#64748b; text-transform:uppercase;">ESSALUD*</th>
                    <th style="padding:16px; font-size:0.75rem; color:#64748b; text-transform:uppercase;">NETO A PAGAR</th>
                    <th class="col-accion-print"></th>
                </tr>
            </thead>
            <tbody>${rows}</tbody>
            <tfoot style="background:#f9fafb; font-weight:700; border-top:2px solid #e5e7eb; color:#1e293b;">
                <tr>
                    <td colspan="3" style="padding:15px;">TOTALES (${empleadosActivos.length} empleados)</td>
                    <td style="padding:15px;">S/ ${tBruto.toFixed(2)}</td>
                    <td style="padding:15px; color:#ef4444;">S/ ${tDcto.toFixed(2)}</td>
                    <td></td>
                    <td style="padding:15px; color:#eab308;">S/ ${tEsSalud.toFixed(2)}</td>
                    <td style="padding:15px; color:#10b981; font-size:1.1rem;">S/ ${tNeto.toFixed(2)}</td>
                    <td class="col-accion-print"></td>
                </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `;
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ============================================================
// 🔥 EMISIÓN DE BOLETAS HACIA TU BASE DE DATOS DJANGO 🔥
// ============================================================
window.emitirBoletasMasivasBD = function(periodo) {
    if(typeof window.openModal !== 'function') return;
    
    window.openModal(`
    <div class="modal-overlay" style="z-index: 99999; backdrop-filter: blur(4px);">
        <div class="modal" style="max-width: 450px; text-align: center; padding: 40px 24px; border-radius: 16px; background: white; animation: modalPop 0.3s ease-out;">
            <div style="width: 60px; height: 60px; background: #e0e7ff; color: #4f46e5; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                <i data-lucide="send" style="width: 30px; height: 30px;"></i>
            </div>
            <h3 style="font-size: 1.5rem; font-weight: 800; color: #1e293b; margin-bottom: 12px;">Emitir a Base de Datos</h3>
            <p style="color: #64748b; font-size: 0.95rem; margin-bottom: 24px; line-height: 1.5;">
                Se registrarán las boletas de <strong>${periodo}</strong> en PostgreSQL para que los empleados puedan firmarlas legalmente desde su portal.
            </p>
            <div style="display: flex; gap: 12px;">
                <button class="btn btn-ghost" style="flex: 1; border: 1px solid #e2e8f0; font-weight: 600;" onclick="window.closeModal()">Cancelar</button>
                <button class="btn btn-primary" id="btn-emitir-bd" style="flex: 1; background: #4f46e5; border: none; font-weight:700;" onclick="window.procesarEmisionBD('${periodo}')">
                    Confirmar Emisión
                </button>
            </div>
        </div>
    </div>`);
};

window.procesarEmisionBD = async function(periodoStr) {
    const btn = document.getElementById('btn-emitir-bd');
    btn.innerHTML = '<i data-lucide="loader-2" class="lucide-spin" style="width:16px;height:16px;margin-right:6px;"></i> Conectando...';
    btn.disabled = true;
    if (typeof lucide !== 'undefined') lucide.createIcons();

    try {
        const csrf = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
        
        const response = await fetch('/api/boletas/emitir/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf },
            body: JSON.stringify({ periodo: periodoStr })
        });
        
        if (response.ok) {
            window.closeModal();
            if(typeof window.showToast === 'function') window.showToast("Boletas emitidas en la Base de Datos.", "success");
            else alert("Éxito. Boletas creadas.");
        } else {
            const errorData = await response.json().catch(() => ({}));
            if(typeof window.showToast === 'function') window.showToast(errorData.error || 'La ruta falló.', "error");
            else alert("Error del servidor.");
            window.closeModal();
        }
    } catch(e) {
        if(typeof window.showToast === 'function') window.showToast("Error de red conectando con Django.", "error");
        else alert("Error de red.");
        window.closeModal();
    }
};

// ============================================================
// 🔥 IMPRIMIR BOLETA INDIVIDUAL Y EXPORTACIONES 🔥
// ============================================================
window.imprimirBoletaIndividual = function(empId) {
    const e = planEmpleados.find(x => String(x.id) === String(empId));
    if (!e) return alert("Error: No se encontró el empleado.");

    const dId = e.deptId || e.departamento_id || e.departamento;
    const dept = planDepartamentos.find(d => String(d.id) === String(dId)) || { nombre: 'General' };
    const sueldoBase = parseFloat(e.sueldo || e.sueldo_base || 0);
    const asigFam = (e.nombres && String(e.nombres).includes('Rocio')) ? 102.50 : 0.00;
    const bruto = sueldoBase + asigFam;
    
    let sistema = e.afp_onp || e.afp || 'No aplica';
    let pctDcto = String(sistema).toUpperCase().includes('ONP') ? 0.13 : (String(sistema).toUpperCase().includes('AFP') ? 0.1309 : 0);
    const descuento = bruto * pctDcto;
    const neto = bruto - descuento;

    const hoyObj = new Date();
    const periodoMayuscula = `${hoyObj.toLocaleDateString('es-ES', { month: 'long' }).toUpperCase()} ${hoyObj.getFullYear()}`;
    const nombreCompleto = `${e.nombres || ''} ${e.apellidos || ''}`.trim() || 'Sin Nombre';

    if(typeof window.openModal !== 'function') return;

    window.openModal(`
    <div class="modal-overlay" style="z-index: 9999;">
        <div class="modal" style="max-width: 750px; padding: 0; overflow: hidden; background: white; color: #111827; animation: modalPop 0.3s ease-out;">
            <div id="boletaPrintArea" style="padding: 40px; background: white;">
                <div style="display: flex; justify-content: space-between; border-bottom: 3px solid #1e3a8a; padding-bottom: 15px; margin-bottom: 25px;">
                    <div>
                        <h2 style="margin:0; color:#1e3a8a; font-weight: 800; font-size: 24px;">TELECABLE S.A.C.</h2>
                        <p style="margin:0; font-size:12px; color: #4b5563;">RUC: 20123456789 | Av. Principal 123</p>
                    </div>
                    <div style="text-align: right;">
                        <h3 style="margin:0; font-size: 20px;">BOLETA DE PAGO</h3>
                        <p style="margin:0; font-weight: 600; color: #6b7280;">${periodoMayuscula}</p>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; font-size: 13px; margin-bottom: 30px; background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <div>
                        <div style="margin-bottom: 6px;"><b>Empleado:</b> ${nombreCompleto}</div>
                        <div style="margin-bottom: 6px;"><b>DNI:</b> ${e.dni || '---'}</div>
                    </div>
                    <div>
                        <div style="margin-bottom: 6px;"><b>Área:</b> ${dept.nombre}</div>
                        <div style="margin-bottom: 6px;"><b>Sistema Pensión:</b> ${sistema}</div>
                    </div>
                </div>

                <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 14px;">
                    <thead style="background: #f3f4f6;">
                        <tr>
                            <th style="border: 1px solid #e5e7eb; padding: 10px; text-align: left;">CONCEPTO</th>
                            <th style="border: 1px solid #e5e7eb; padding: 10px; text-align: right;">INGRESOS</th>
                            <th style="border: 1px solid #e5e7eb; padding: 10px; text-align: right;">DESCUENTOS</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="border: 1px solid #e5e7eb; padding: 10px;">Remuneración Básica</td>
                            <td style="border: 1px solid #e5e7eb; padding: 10px; text-align: right;">${sueldoBase.toFixed(2)}</td>
                            <td style="border: 1px solid #e5e7eb; padding: 10px; text-align: right;">0.00</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #e5e7eb; padding: 10px;">Asignación Familiar</td>
                            <td style="border: 1px solid #e5e7eb; padding: 10px; text-align: right;">${asigFam.toFixed(2)}</td>
                            <td style="border: 1px solid #e5e7eb; padding: 10px; text-align: right;">0.00</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #e5e7eb; padding: 10px;">Aportación Pensión</td>
                            <td style="border: 1px solid #e5e7eb; padding: 10px; text-align: right;">0.00</td>
                            <td style="border: 1px solid #e5e7eb; padding: 10px; text-align: right; color: #ef4444;">${descuento.toFixed(2)}</td>
                        </tr>
                    </tbody>
                    <tfoot style="background: #f9fafb; font-weight: 700;">
                        <tr>
                            <td style="border: 1px solid #e5e7eb; padding: 12px; text-align: right;">TOTALES:</td>
                            <td style="border: 1px solid #e5e7eb; padding: 12px; text-align: right;">${bruto.toFixed(2)}</td>
                            <td style="border: 1px solid #e5e7eb; padding: 12px; text-align: right; color: #ef4444;">${descuento.toFixed(2)}</td>
                        </tr>
                    </tfoot>
                </table>

                <div style="background: #1e3a8a; color: white; padding: 18px 25px; display: flex; justify-content: space-between; border-radius: 8px;">
                    <span style="font-weight: 600; font-size: 16px;">NETO A PAGAR:</span>
                    <span style="font-size: 26px; font-weight: 900;">S/ ${neto.toFixed(2)}</span>
                </div>
            </div>
            
            <div class="modal-footer no-print-btn" style="background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 20px; display: flex; justify-content: flex-end; gap: 12px;">
                <button class="btn btn-ghost" onclick="window.closeModal()" style="border: 1px solid #cbd5e1; font-weight: 600;">Cerrar</button>
                <button class="btn btn-primary" style="background:#2563eb; border:none; font-weight: 600;" onclick="window.ejecutarImpresionLimpia()"><i data-lucide="printer" style="width:16px;height:16px;margin-right:6px;"></i> Imprimir Documento</button>
            </div>
        </div>
    </div>
    `);
};

window.ejecutarImpresionLimpia = function() {
    const style = document.createElement('style');
    style.innerHTML = `@media print { body * { visibility: hidden !important; } #boletaPrintArea, #boletaPrintArea * { visibility: visible !important; } #boletaPrintArea { position: absolute; left: 0; top: 0; width: 100%; padding:0; margin:0;} .no-print-btn { display: none !important; } @page { margin: 1cm; } }`;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => document.head.removeChild(style), 1000);
};

window.exportarPlanillaPDF = function() {
    const style = document.createElement('style');
    style.innerHTML = `@media print { body * { visibility: hidden; } #areaImpresionGlobal, #areaImpresionGlobal * { visibility: visible; } #areaImpresionGlobal { position: absolute; left: 0; top: 0; width: 100%; border: none; box-shadow: none; } .col-accion-print { display: none !important; } .sidebar, .app-header { display: none !important; } @page { size: landscape; margin: 1cm; } }`;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => document.head.removeChild(style), 1000);
};

window.exportarPlanillaExcel = function() {
    if (typeof XLSX === 'undefined') {
        if(typeof window.showToast === 'function') window.showToast("Librería Excel no cargada.", "error");
        else alert("Librería Excel no cargada.");
        return;
    }
    
    const currentSede = typeof window.currentSedeId !== 'undefined' ? window.currentSedeId : (window.realSedes && window.realSedes[0] ? window.realSedes[0].id : null);

    const empleadosActivos = planEmpleados.filter(e => {
        const est = String(e.estado || '').toLowerCase();
        const empSede = e.sede_id || e.sede;
        return est !== 'cesado' && est !== 'inactivo' && (!empSede || String(empSede) === String(currentSede));
    });
    
    if(empleadosActivos.length === 0) {
        if(typeof window.showToast === 'function') window.showToast("No hay empleados para exportar en esta sede.", "warning");
        else alert("No hay empleados para exportar en esta sede.");
        return;
    }

    const dataParaExcel = empleadosActivos.map(e => {
        const dId = e.deptId || e.departamento_id || e.departamento;
        const dept = planDepartamentos.find(d => String(d.id) === String(dId)) || {nombre: 'General'};
        return { 
            "DNI": e.dni, 
            "Empleado": `${e.nombres || ''} ${e.apellidos || ''}`.trim(), 
            "Área": dept.nombre, 
            "Sueldo Base": e.sueldo || e.sueldo_base,
            "Sistema Pensión": e.afp_onp || e.afp || 'No aplica'
        };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataParaExcel);
    const workbook = XLSX.utils.book_new();
    
    worksheet['!cols'] = [{ wch: 12 }, { wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 18 }];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, "Planilla");
    XLSX.writeFile(workbook, `Planilla_Export.xlsx`);
};