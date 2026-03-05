// ============================================================
// VIEW: Mi Portal (Employee Self-Service)
// Todos los módulos personales del empleado
// ============================================================

// ─── Helper: Obtener empleado logueado de forma segura ──────
window.myEmp = function() { 
    const rawData = localStorage.getItem('currentUser');
    let id = window.myEmpId; 
    if (rawData) {
        try {
            const user = JSON.parse(rawData);
            id = user.emp_id || id; 
        } catch(e){}
    }
    return getEmp(id); 
};

// ─── 1. MI PORTAL (Home) ────────────────────────────────────────
window.renderMiPortal = function() {
    const emp = window.myEmp();
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

    if (!emp) {
        return `
        <div class="empty-state" style="padding: 100px 20px; animation: fadeIn 0.4s;">
          <i data-lucide="user-x" style="width: 64px; height: 64px; margin: 0 auto 20px; color: var(--text-muted); opacity: 0.5;"></i>
          <h2 style="font-size: 1.5rem; margin-bottom: 10px; color: var(--text-primary);">Perfil no vinculado</h2>
          <p style="color: var(--text-secondary); max-width: 400px; margin: 0 auto; line-height:1.5;">Tu usuario actual (<strong>${currentUser.email || currentUser.name || 'Admin'}</strong>) no está enlazado a ninguna ficha de empleado activa.</p>
        </div>`;
    }

    const dept = getDept(emp.deptId || emp.departamento_id);
    const puesto = getPuesto(emp.puestoId || emp.puesto_id);
    const p = (typeof calcPlanilla === 'function') ? calcPlanilla(emp) : { neto: emp.sueldo || emp.sueldo_base || 0, bruto: 0, asigFam: 0, brutoTotal: 0, afpLabel: 'AFP', afpMonto: 0, essalud: 0 };
    const saldo = MOCK.saldoVacaciones || { diasAnuales: 30, diasUsados: 10, diasPendientes: 20 };

    // Mi asistencia (Mes actual)
    const myAtt = (MOCK.asistencias || []).filter(a => String(a.empId || a.empleado_id) === String(emp.id));
    const presentes = myAtt.filter(a => a.tipo !== 'Falta').length;
    const tardanzas = myAtt.filter(a => a.tipo === 'Tardanza').length;

    // 🔥 FILTRO SUPREMO ARREGLADO: Mis docs excluyendo las boletas para que el contador sea exacto
    const myDocs = (MOCK.documentos || []).filter(d => {
        const esDelEmpleado = String(d.empId || d.empleado_id) === String(emp.id);
        const tipoDoc = String(d.tipo || d.tipo_documento || '').toLowerCase();
        const nombreDoc = String(d.nombre || d.nombre_archivo || '').toLowerCase();
        const esBoleta = tipoDoc.includes('boleta') || nombreDoc.includes('boleta');
        return esDelEmpleado && !esBoleta;
    });
    
    // Antigüedad
    const ingresoStr = emp.ingreso || emp.fecha_ingreso || new Date().toISOString();
    const ingreso = new Date(ingresoStr);
    const now = new Date();
    let diff = (now - ingreso) / (365.25 * 24 * 3600 * 1000);
    if(diff < 0) diff = 0;
    const years = Math.floor(diff);
    const months = Math.floor((diff - years) * 12);

    return `
    <div style="background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 55%,#312e81 100%);border-radius:var(--r-lg);padding:28px 32px;margin-bottom:20px;position:relative;overflow:hidden;animation: fadeIn 0.4s ease-out;">
      <div style="position:absolute;width:400px;height:400px;background:radial-gradient(circle,rgba(99,102,241,.25) 0%,transparent 70%);top:-100px;right:-80px;pointer-events:none"></div>
      <div style="display:flex;align-items:center;gap:20px;position:relative;z-index:1">
        <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--secondary));display:flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:800;color:white;flex-shrink:0;box-shadow:0 8px 24px rgba(99,102,241,.45)">${empInitials(emp)}</div>
        <div style="flex:1">
          <div style="font-size:1.5rem;font-weight:800;color:white;letter-spacing:-.4px; text-transform:uppercase;">${empFullName(emp)}</div>
          <div style="color:rgba(255,255,255,.7);font-size:.9rem;margin-top:3px">${puesto?.nombre || 'Colaborador'} · ${dept?.nombre || 'General'}</div>
          <div style="display:flex;gap:12px;margin-top:10px;flex-wrap:wrap">
            <span style="background:rgba(99,102,241,.25);color:#a5b4fc;padding:3px 10px;border-radius:99px;font-size:.75rem;font-weight:600">${emp.codigo || 'EMP-000'}</span>
            <span style="background:rgba(99,102,241,.25);color:#a5b4fc;padding:3px 10px;border-radius:99px;font-size:.75rem;font-weight:600">${emp.contrato || emp.tipo_contrato || 'Indefinido'}</span>
            <span style="background:rgba(16,185,129,.2);color:#6ee7b7;padding:3px 10px;border-radius:99px;font-size:.75rem;font-weight:600">● ${emp.estado || 'Activo'}</span>
          </div>
        </div>
        <div style="text-align:right;color:white">
          <div style="font-size:1.8rem;font-weight:800;color:#6ee7b7">${fmtSoles(p.neto)}</div>
          <div style="font-size:.78rem;color:rgba(255,255,255,.55)">Sueldo neto / mes</div>
          <div style="font-size:.72rem;color:rgba(255,255,255,.4);margin-top:4px">${years} año${years !== 1 ? 's' : ''} ${months} mes${months !== 1 ? 'es' : ''} de antigüedad</div>
        </div>
      </div>
      <div style="display:flex;gap:32px;margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,.1);position:relative;z-index:1">
        <div><div style="font-size:.72rem;color:rgba(255,255,255,.4);margin-bottom:2px">Email</div><div style="font-size:.83rem;color:rgba(255,255,255,.8)">${emp.email || '—'}</div></div>
        <div><div style="font-size:.72rem;color:rgba(255,255,255,.4);margin-bottom:2px">Teléfono</div><div style="font-size:.83rem;color:rgba(255,255,255,.8)">${emp.telefono || emp.tel || '—'}</div></div>
        <div><div style="font-size:.72rem;color:rgba(255,255,255,.4);margin-bottom:2px">Ingreso</div><div style="font-size:.83rem;color:rgba(255,255,255,.8)">${fmtDate(ingresoStr)}</div></div>
        <div><div style="font-size:.72rem;color:rgba(255,255,255,.4);margin-bottom:2px">DNI</div><div style="font-size:.83rem;color:rgba(255,255,255,.8)">${emp.dni || '—'}</div></div>
        <div><div style="font-size:.72rem;color:rgba(255,255,255,.4);margin-bottom:2px">Sistema Pensión</div><div style="font-size:.83rem;color:rgba(255,255,255,.8)">${emp.afp || emp.afp_onp || '—'}</div></div>
      </div>
    </div>

    <div class="stats-grid" style="margin-bottom:20px">
      <div class="stat-card" style="cursor:pointer" onclick="navigate('mi-asistencia')">
        <div class="stat-icon green"><i data-lucide="check-circle-2" style="width:22px;height:22px"></i></div>
        <div><div class="stat-number">${presentes}</div><div class="stat-label">Asistencias (Mes)</div><div class="stat-change pos">↑ Buen registro</div></div>
      </div>
      <div class="stat-card" style="cursor:pointer" onclick="navigate('mi-asistencia')">
        <div class="stat-icon amber"><i data-lucide="clock" style="width:22px;height:22px"></i></div>
        <div><div class="stat-number">${tardanzas}</div><div class="stat-label">Tardanzas (Mes)</div>
        ${tardanzas === 0 ? '<div class="stat-change pos">¡Sin tardanzas!</div>' : '<div class="stat-change neg">Revisar puntualidad</div>'}
        </div>
      </div>
      <div class="stat-card" style="cursor:pointer" onclick="navigate('mis-vacaciones')">
        <div class="stat-icon blue"><i data-lucide="umbrella" style="width:22px;height:22px"></i></div>
        <div><div class="stat-number">${saldo.diasPendientes}</div><div class="stat-label">Días Vac. Disponibles</div><div class="stat-change pos">De ${saldo.diasAnuales} días anuales</div></div>
      </div>
      <div class="stat-card" style="cursor:pointer" onclick="navigate('mis-documentos')">
        <div class="stat-icon indigo"><i data-lucide="file-text" style="width:22px;height:22px"></i></div>
        <div><div class="stat-number">${myDocs.length}</div><div class="stat-label">Mis Documentos</div><div class="stat-change pos">Disponibles para descarga</div></div>
      </div>
    </div>

    <div class="grid-2" style="gap:16px">
      <div class="card">
        <div class="card-header">
          <div><div class="card-title">Mi Asistencia Reciente</div><div class="card-subtitle">Últimos registros</div></div>
          <button class="btn btn-ghost btn-sm" onclick="navigate('mi-asistencia')">Ver todo</button>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Fecha</th><th>Entrada</th><th>Salida</th><th>Horas</th><th>Estado</th></tr></thead>
            <tbody>
              ${myAtt.slice(0, 5).map(a => `<tr>
                <td style="font-size:.82rem">${fmtDate(a.fecha)}</td>
                <td>${a.entrada || a.hora_entrada || '—'}</td><td>${a.salida || a.hora_salida || '—'}</td>
                <td style="font-size:.82rem;color:var(--text-muted)">${horasDiff(a.entrada || a.hora_entrada, a.salida || a.hora_salida)}</td>
                <td><span class="badge ${tipoColor(a.tipo)} badge-dot">${a.tipo}</span></td>
              </tr>`).join('')}
              ${myAtt.length === 0 ? '<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--text-muted)">Sin registros</td></tr>' : ''}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div><div class="card-title">Mis Últimos Documentos</div></div>
          <button class="btn btn-ghost btn-sm" onclick="navigate('mis-documentos')">Ver todo</button>
        </div>
        <div class="card-body" style="padding:0">
          ${myDocs.slice(0, 4).map(doc => `
            <div class="info-row between" style="padding:11px 18px">
              <div style="display:flex;align-items:center;gap:10px">
                <div class="stat-icon indigo" style="width:34px;height:34px;border-radius:8px;flex-shrink:0"><i data-lucide="file-text" style="width:15px;height:15px"></i></div>
                <div><div class="td-name">${doc.nombre || doc.nombre_archivo}</div><div class="td-sub">${doc.tipo || doc.tipo_documento} · ${fmtDate(doc.fecha || doc.fecha_subida)}</div></div>
              </div>
              <a href="${doc.url || '#'}" target="_blank" class="btn btn-ghost btn-sm"><i data-lucide="download" style="width:13px;height:13px"></i></a>
            </div>`).join('')}
          ${myDocs.length === 0 ? '<div class="empty-state"><p>Sin documentos aún</p></div>' : ''}
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:16px">
      <div class="card-header">
        <div><div class="card-title">Mi Última Boleta de Pago</div><div class="card-subtitle">Mes Actual · ${empFullName(emp)}</div></div>
        <button class="btn btn-primary btn-sm" onclick="navigate('mis-boletas')">Ver todas las boletas</button>
      </div>
      <div class="card-body">
        <div class="grid-2" style="gap:12px">
          <div style="background:var(--gray-50);border-radius:var(--r);padding:16px">
            <div class="section-label" style="margin-bottom:8px">Ingresos</div>
            <div class="info-row between"><span>Sueldo Básico</span><span>${fmtSoles(p.bruto)}</span></div>
            <div class="info-row between"><span>Asig. Familiar</span><span>${fmtSoles(p.asigFam)}</span></div>
            <div class="info-row between fw-700"><span>Total Bruto</span><span>${fmtSoles(p.brutoTotal)}</span></div>
          </div>
          <div style="background:var(--gray-50);border-radius:var(--r);padding:16px">
            <div class="section-label" style="margin-bottom:8px">Descuentos</div>
            <div class="info-row between" style="color:var(--danger)"><span>${p.afpLabel}</span><span>- ${fmtSoles(p.afpMonto)}</span></div>
            <div class="info-row between" style="color:var(--text-muted);font-size:.78rem"><span>EsSalud (empleador)</span><span>${fmtSoles(p.essalud)}</span></div>
            <div style="background:var(--success-50);border-radius:var(--r-sm);padding:10px 12px;margin-top:8px;display:flex;justify-content:space-between;align-items:center">
              <span style="font-weight:700;color:#065f46">Neto a Pagar</span>
              <span style="font-weight:800;font-size:1.2rem;color:var(--success)">${fmtSoles(p.neto)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>`;
};

// ─── 2. MI ASISTENCIA ───────────────────────────────────────────
window.renderMiAsistencia = function() {
    const emp = window.myEmp();
    if(!emp) return window.renderMiPortal(); 

    const myAtt = (MOCK.asistencias || []).filter(a => String(a.empId || a.empleado_id) === String(emp.id));
    const pres = myAtt.filter(a => a.tipo !== 'Falta').length;
    const tard = myAtt.filter(a => a.tipo === 'Tardanza').length;
    const fal = myAtt.filter(a => a.tipo === 'Falta').length;
    const hex = myAtt.filter(a => a.tipo === 'Hora Extra').length;

    const rows = myAtt.slice().reverse().map(a => `
    <tr style="transition: all 0.2s ease;">
      <td style="font-weight:600; color:#334155;">${fmtDate(a.fecha)}</td>
      <td style="font-weight:700; color:#0f172a;">${a.entrada || a.hora_entrada || '—'}</td>
      <td style="color:#475569;">${a.salida || a.hora_salida || '—'}</td>
      <td style="color:var(--text-muted)">${horasDiff(a.entrada || a.hora_entrada, a.salida || a.hora_salida)}</td>
      <td><span class="badge ${tipoColor(a.tipo)} badge-dot" style="font-weight:600;">${a.tipo}</span></td>
      <td style="font-size:.8rem;color:var(--text-muted)">${a.obs || a.observaciones || '—'}</td>
    </tr>`).join('');

    return `
    <div style="animation: fadeIn 0.4s ease-out;">
        <div class="view-header">
            <div class="view-header-left"><h1>Mi Asistencia</h1><p>Historial personal de ${empFullName(emp)}</p></div>
            <div class="view-header-actions">
                <button class="btn btn-ghost" onclick="window.print()"><i data-lucide="printer" style="width:15px;height:15px"></i> Imprimir</button>
                <button class="btn btn-primary"><i data-lucide="download" style="width:15px;height:15px"></i> Exportar</button>
            </div>
        </div>

        <div class="stats-grid" style="margin-bottom:20px">
            <div class="stat-card"><div class="stat-icon green"><i data-lucide="check-circle-2" style="width:22px;height:22px"></i></div>
                <div><div class="stat-number">${pres}</div><div class="stat-label">Asistencias</div></div>
            </div>
            <div class="stat-card"><div class="stat-icon amber"><i data-lucide="clock" style="width:22px;height:22px"></i></div>
                <div><div class="stat-number">${tard}</div><div class="stat-label">Tardanzas</div></div>
            </div>
            <div class="stat-card"><div class="stat-icon red"><i data-lucide="x-circle" style="width:22px;height:22px"></i></div>
                <div><div class="stat-number">${fal}</div><div class="stat-label">Faltas</div></div>
            </div>
            <div class="stat-card"><div class="stat-icon blue"><i data-lucide="zap" style="width:22px;height:22px"></i></div>
                <div><div class="stat-number">${hex}</div><div class="stat-label">Horas Extra</div></div>
            </div>
        </div>

        <div class="card" style="border:none; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border-radius:12px; overflow:hidden;">
            <div class="card-header" style="border-bottom: 1px solid #f1f5f9;">
                <div><div class="card-title">Historial Detallado</div><div class="card-subtitle">${myAtt.length} registros</div></div>
                <input type="month" class="filter-select" style="padding: 8px 12px; border-radius: 8px; border: 1px solid #cbd5e1; outline: none;">
            </div>
            <div class="table-wrap">
                <table style="width:100%; border-collapse: collapse;">
                    <thead style="background:#f8fafc;">
                        <tr>
                            <th style="padding:16px; text-align:left; font-size:0.75rem; color:#64748b; text-transform:uppercase;">Fecha</th>
                            <th style="padding:16px; text-align:left; font-size:0.75rem; color:#64748b; text-transform:uppercase;">Ingreso</th>
                            <th style="padding:16px; text-align:left; font-size:0.75rem; color:#64748b; text-transform:uppercase;">Salida</th>
                            <th style="padding:16px; text-align:left; font-size:0.75rem; color:#64748b; text-transform:uppercase;">Horas Trabajadas</th>
                            <th style="padding:16px; text-align:left; font-size:0.75rem; color:#64748b; text-transform:uppercase;">Tipo</th>
                            <th style="padding:16px; text-align:left; font-size:0.75rem; color:#64748b; text-transform:uppercase;">Observación</th>
                        </tr>
                    </thead>
                    <tbody>${rows || '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Sin registros</td></tr>'}</tbody>
                </table>
            </div>
        </div>
    </div>`;
};

// ─── 3. MIS BOLETAS ──────────────────────────────────────────
const PERIODOS = [
  { mes: 'Febrero', anio: 2026 },
  { mes: 'Enero', anio: 2026 },
  { mes: 'Diciembre', anio: 2025 },
  { mes: 'Noviembre', anio: 2025 }
];

window.renderMisBoletas = function() {
  const emp = window.myEmp();
  if(!emp) return window.renderMiPortal();
  const p = (typeof calcPlanilla === 'function') ? calcPlanilla(emp) : { neto: emp.sueldo || emp.sueldo_base || 0, brutoTotal: 0, afpLabel: 'AFP', afpMonto: 0 };

  const cards = PERIODOS.map((per, i) => {
    const factor = i === 0 ? 1 : (0.992 + Math.random() * 0.016);
    const neto = (p.neto * factor).toFixed(2);
    return `
    <div class="card" style="cursor:pointer; transition:0.2s;" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform=''" onclick="openBoletaModal('${per.mes} ${per.anio}')">
      <div class="card-body" style="padding:18px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">
          <div>
            <div style="font-size:.72rem;color:var(--text-muted);font-weight:600;text-transform:uppercase;letter-spacing:.7px">Boleta de Pago</div>
            <div style="font-size:1rem;font-weight:700;margin-top:2px">${per.mes} ${per.anio}</div>
          </div>
          ${i === 0 ? '<span class="badge badge-green">Actual</span>' : '<span class="badge badge-gray">Pagado</span>'}
        </div>
        <div class="info-row between"><span style="color:var(--text-muted);font-size:.8rem">Sueldo Bruto</span><span style="font-size:.85rem">${fmtSoles(p.brutoTotal)}</span></div>
        <div class="info-row between"><span style="color:var(--danger);font-size:.8rem">${p.afpLabel}</span><span style="color:var(--danger);font-size:.85rem">- ${fmtSoles(p.afpMonto)}</span></div>
        <div style="background:var(--success-50);border-radius:var(--r-sm);padding:10px 12px;margin-top:10px;display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:.8rem;font-weight:600;color:#065f46">Neto</span>
          <span style="font-weight:800;color:var(--success)">${fmtSoles(Number(neto))}</span>
        </div>
        <button class="btn btn-ghost btn-sm" style="width:100%;margin-top:12px;justify-content:center" onclick="event.stopPropagation();openBoletaModal('${per.mes} ${per.anio}')">
          <i data-lucide="printer" style="width:13px;height:13px"></i> Ver / Imprimir
        </button>
      </div>
    </div>`;
  }).join('');

  return `
  <div style="animation: fadeIn 0.4s ease-out;">
      <div class="view-header">
        <div class="view-header-left"><h1>Mis Boletas de Pago</h1><p>Historial de remuneraciones</p></div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px">
        ${cards}
      </div>
  </div>`;
};

window.openBoletaModal = function (periodo) {
    const emp = window.myEmp();
    const company = MOCK.empresas[0] || {nombre: 'Telecable S.A.C', ruc: '20123456789'};
    const p = typeof calcPlanilla === 'function' ? calcPlanilla(emp) : { neto: emp.sueldo_base, brutoTotal: emp.sueldo_base, afpMonto: 0, afpLabel: 'Sin AFP', essalud: 0, bruto: emp.sueldo_base, asigFam: 0 };
    
    openModal(`
    <div class="modal-overlay" style="backdrop-filter: blur(4px);">
      <div class="modal">
        <div class="modal-header">
          <div><h3>Boleta de Pago</h3><div class="td-sub">${periodo} · ${empFullName(emp)}</div></div>
          <button class="modal-close" onclick="closeModal()"><i data-lucide="x" style="width:14px;height:14px"></i></button>
        </div>
        <div class="modal-body">
          <div style="border:2px dashed var(--border);border-radius:var(--r-md);padding:22px; position:relative; background: #fafafa;">
            <div style="text-align:center;margin-bottom:16px">
              <div style="font-weight:800;font-size:1.1rem">${company.nombre}</div>
              <div style="font-size:.78rem;color:var(--text-muted)">RUC ${company.ruc}</div>
              <div style="font-weight:700;margin-top:8px;color:var(--primary)">BOLETA DE PAGO · ${periodo.toUpperCase()}</div>
            </div>
            <div class="info-row between"><span class="info-row-label">Trabajador</span><span class="fw-700">${empFullName(emp)}</span></div>
            <div class="info-row between"><span class="info-row-label">DNI</span><span>${emp.dni}</span></div>
            <div class="info-row between"><span class="info-row-label">Cargo</span><span>${getPuesto(emp.puestoId || emp.puesto_id)?.nombre || 'General'}</span></div>
            <div class="divider"></div>
            <div class="section-label">INGRESOS</div>
            <div class="info-row between"><span>Sueldo Básico</span><span>${fmtSoles(p.bruto)}</span></div>
            <div class="info-row between"><span>Asignación Familiar</span><span>${fmtSoles(p.asigFam)}</span></div>
            <div class="info-row between fw-700"><span>TOTAL INGRESOS</span><span>${fmtSoles(p.brutoTotal)}</span></div>
            <div class="divider"></div>
            <div class="section-label">DESCUENTOS</div>
            <div class="info-row between" style="color:var(--danger)"><span>${p.afpLabel}</span><span>- ${fmtSoles(p.afpMonto)}</span></div>
            <div class="info-row between fw-700" style="color:var(--danger)"><span>TOTAL DESCUENTOS</span><span>- ${fmtSoles(p.afpMonto)}</span></div>
            <div class="divider"></div>
            <div style="background:var(--success-50);padding:12px 14px;border-radius:var(--r-sm);display:flex;justify-content:space-between;align-items:center">
              <span style="font-weight:700;color:#065f46">NETO A PAGAR</span>
              <span style="font-weight:800;font-size:1.3rem;color:var(--success)">${fmtSoles(p.neto)}</span>
            </div>
            
            <div style="margin-top:24px; padding:16px; border:1px solid var(--success-100); background:var(--success-50); border-radius:var(--r); display:flex; align-items:center; gap:12px;">
              <div style="width:40px;height:40px;background:var(--success);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                  <i data-lucide="check" style="width:20px;height:20px"></i>
              </div>
              <div>
                  <div style="font-weight:700;color:#065f46;font-size:0.85rem">Firmado Digitalmente</div>
                  <div style="font-size:0.75rem;color:#065f46;opacity:0.8">Por: ${empFullName(emp)}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="closeModal()">Cerrar</button>
          <button class="btn btn-primary" onclick="window.print()"><i data-lucide="printer" style="width:14px;height:14px"></i> Imprimir Oficial</button>
        </div>
      </div>
    </div>`);
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

// ─── 4. MIS DOCUMENTOS ───────────────────────────────────────
window.renderMisDocumentos = function() {
  const emp = window.myEmp();
  if(!emp) return window.renderMiPortal();

  // 🔥 FILTRO SUPREMO ARREGLADO (También aquí por si acaso lo renderiza este archivo)
  const myDocs = (MOCK.documentos || []).filter(d => {
      const esDelEmpleado = String(d.empId || d.empleado_id) === String(emp.id);
      const tipoDoc = String(d.tipo || d.tipo_documento || '').toLowerCase();
      const nombreDoc = String(d.nombre || d.nombre_archivo || '').toLowerCase();
      const esBoleta = tipoDoc.includes('boleta') || nombreDoc.includes('boleta');
      return esDelEmpleado && !esBoleta;
  });
  
  const typeColors = { Contrato: 'badge-indigo', ID: 'badge-blue', Recibo: 'badge-green', Certificado: 'badge-purple', Otro: 'badge-gray', Boleta: 'badge-blue' };

  return `
  <div style="animation: fadeIn 0.4s ease-out;">
      <div class="view-header">
        <div class="view-header-left"><h1>Mis Documentos</h1><p>${myDocs.length} documentos en tu expediente</p></div>
      </div>
      ${myDocs.length === 0 ? `
        <div class="card"><div class="empty-state" style="padding:60px 20px">
          <i data-lucide="folder-open" style="width:48px;height:48px;margin:0 auto 12px;display:block;color:var(--text-muted);opacity:.4"></i>
          <p>Aún no tienes documentos registrados.</p>
        </div></div>` :
          `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px">
        ${myDocs.map(doc => `
        <div class="card" style="transition:var(--t)" onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='var(--shadow-md)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
          <div class="card-body" style="padding:20px">
            <div style="display:flex;align-items:flex-start;gap:12px">
              <div class="stat-icon indigo" style="width:44px;height:44px;border-radius:var(--r);flex-shrink:0">
                <i data-lucide="${(doc.tipo || doc.tipo_documento) === 'Boleta' ? 'receipt' : 'file-text'}" style="width:20px;height:20px"></i>
              </div>
              <div style="flex:1;min-width:0">
                <div class="td-name" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${doc.nombre || doc.nombre_archivo}</div>
                <div class="td-sub" style="margin-top:3px">${fmtDate(doc.fecha || doc.fecha_subida)}</div>
                <div style="display:flex; gap:4px; flex-wrap:wrap; margin-top:8px">
                    <span class="badge ${typeColors[doc.tipo || doc.tipo_documento] || 'badge-gray'}">${doc.tipo || doc.tipo_documento}</span>
                </div>
              </div>
            </div>
            <div style="display:flex; gap:8px; margin-top:14px;">
                <a href="${doc.url || '#'}" target="_blank" class="btn btn-ghost btn-sm" style="flex:1; justify-content:center; text-decoration: none;">
                    <i data-lucide="download" style="width:13px;height:13px"></i> Descargar
                </a>
            </div>
          </div>
        </div>`).join('')}
      </div>`}
  </div>`;
};

// ─── 5. MIS VACACIONES ───────────────────────────────────────
window.renderMisVacaciones = function() {
  const emp = window.myEmp();
  if(!emp) return window.renderMiPortal();

  const myVacs = (MOCK.vacaciones || []).filter(v => String(v.empId || v.empleado_id) === String(emp.id));
  const saldo = MOCK.saldoVacaciones || { diasAnuales: 30, diasUsados: 10, diasPendientes: 20 };

  const rows = myVacs.map(v => `
    <tr>
      <td style="font-weight:600;">${fmtDate(v.inicio || v.fecha_inicio)}</td>
      <td style="font-weight:600;">${fmtDate(v.fin || v.fecha_fin)}</td>
      <td><strong style="color:var(--primary);">${v.dias || v.dias_totales} días</strong></td>
      <td style="color:#475569;">${v.motivo}</td>
      <td><span class="badge ${vacEstadoBadge(v.estado)} badge-dot">${v.estado}</span></td>
      <td style="font-size:0.85rem; color:#64748b;">${v.aprobadoPor || v.aprobado_por || '—'}</td>
    </tr>`).join('');

  return `
  <div style="animation: fadeIn 0.4s ease-out;">
      <div class="view-header">
        <div class="view-header-left"><h1>Mis Vacaciones</h1><p>Control de descansos remunerados</p></div>
        <div class="view-header-actions">
          <button class="btn btn-primary" onclick="alert('Función de solicitud pronto disponible')"><i data-lucide="plus" style="width:15px;height:15px"></i> Nueva Solicitud</button>
        </div>
      </div>
      
      <div class="vac-saldo" style="margin-bottom:20px; display:flex; align-items:center; gap:24px; background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:white; padding:24px 30px; border-radius:16px; box-shadow: 0 10px 15px -3px rgba(16,185,129,0.2);">
        <div>
          <div style="font-size:3rem; font-weight:800; line-height: 1;">${saldo.diasPendientes}</div>
          <div style="font-size:0.9rem; opacity:0.9; margin-top:4px; font-weight: 600;">Días Disponibles</div>
        </div>
        <div style="width:2px; height:60px; background:rgba(255,255,255,0.3);"></div>
        <div style="flex:1;">
          <div style="font-weight: 700; font-size: 1.1rem; margin-bottom: 6px;">Saldo Anual 2026</div>
          <div style="font-size:0.85rem; opacity:0.9;">Total ${saldo.diasAnuales} días · Usados: ${saldo.diasUsados} días</div>
          <div style="margin-top:10px; width: 100%; max-width: 300px; background:rgba(255,255,255,0.2); height: 8px; border-radius: 4px; overflow: hidden;">
            <div style="width:${Math.round(saldo.diasUsados / saldo.diasAnuales * 100)}%; background:white; height:100%; border-radius: 4px;"></div>
          </div>
        </div>
      </div>

      <div class="card" style="border:none; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border-radius:12px; overflow:hidden;">
        <div class="card-header" style="border-bottom: 1px solid #f1f5f9;"><div class="card-title">Historial de Solicitudes</div></div>
        <div class="table-wrap">
          <table style="width:100%; border-collapse: collapse;">
            <thead style="background:#f8fafc;">
                <tr>
                    <th style="padding:16px; text-align:left; font-size:0.75rem; color:#64748b; text-transform:uppercase;">Inicio</th>
                    <th style="padding:16px; text-align:left; font-size:0.75rem; color:#64748b; text-transform:uppercase;">Fin</th>
                    <th style="padding:16px; text-align:left; font-size:0.75rem; color:#64748b; text-transform:uppercase;">Días</th>
                    <th style="padding:16px; text-align:left; font-size:0.75rem; color:#64748b; text-transform:uppercase;">Motivo</th>
                    <th style="padding:16px; text-align:left; font-size:0.75rem; color:#64748b; text-transform:uppercase;">Estado</th>
                    <th style="padding:16px; text-align:left; font-size:0.75rem; color:#64748b; text-transform:uppercase;">Gestionado Por</th>
                </tr>
            </thead>
            <tbody>${rows || '<tr><td colspan="6" style="text-align:center;padding:40px;color:var(--text-muted)">Sin solicitudes aún</td></tr>'}</tbody>
          </table>
        </div>
      </div>
  </div>`;
};