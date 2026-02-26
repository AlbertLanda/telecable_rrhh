// ============================================================
// VIEW: Mi Portal (Employee Self-Service)
// All sections filtered to the logged-in employee only
// ============================================================

// ─── Helper: get logged-in employee ─────────────────────────
function myEmp() { return getEmp(myEmpId); }

// ─── MI PORTAL (Home) ────────────────────────────────────────
function renderMiPortal() {
  const emp = myEmp();
  const dept = getDept(emp.deptId);
  const puesto = getPuesto(emp.puestoId);
  const p = calcPlanilla(emp);
  const saldo = MOCK.saldoVacaciones;

  // My attendance this month
  const myAtt = MOCK.asistencias.filter(a => a.empId === emp.id);
  const presentes = myAtt.filter(a => a.tipo !== 'Falta').length;
  const tardanzas = myAtt.filter(a => a.tipo === 'Tardanza').length;

  // My docs
  const myDocs = MOCK.documentos.filter(d => d.empId === emp.id);

  // My pending vacs
  const myVacs = MOCK.vacaciones.filter(v => v.empId === emp.id);

  // Seniority
  const ingreso = new Date(emp.ingreso);
  const now = new Date('2026-02-23');
  const years = Math.floor((now - ingreso) / (365.25 * 24 * 3600 * 1000));
  const months = Math.floor(((now - ingreso) % (365.25 * 24 * 3600 * 1000)) / (30.4375 * 24 * 3600 * 1000));

  return `
  <!-- PROFILE HERO -->
  <div style="background:linear-gradient(135deg,#0f172a 0%,#1e1b4b 55%,#312e81 100%);border-radius:var(--r-lg);padding:28px 32px;margin-bottom:20px;position:relative;overflow:hidden;">
    <div style="position:absolute;width:400px;height:400px;background:radial-gradient(circle,rgba(99,102,241,.25) 0%,transparent 70%);top:-100px;right:-80px;pointer-events:none"></div>
    <div style="display:flex;align-items:center;gap:20px;position:relative;z-index:1">
      <div style="width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,var(--primary),var(--secondary));display:flex;align-items:center;justify-content:center;font-size:1.8rem;font-weight:800;color:white;flex-shrink:0;box-shadow:0 8px 24px rgba(99,102,241,.45)">${empInitials(emp)}</div>
      <div style="flex:1">
        <div style="font-size:1.5rem;font-weight:800;color:white;letter-spacing:-.4px">${empFullName(emp)}</div>
        <div style="color:rgba(255,255,255,.7);font-size:.9rem;margin-top:3px">${puesto?.nombre} · ${dept?.nombre}</div>
        <div style="display:flex;gap:12px;margin-top:10px;flex-wrap:wrap">
          <span style="background:rgba(99,102,241,.25);color:#a5b4fc;padding:3px 10px;border-radius:99px;font-size:.75rem;font-weight:600">${emp.codigo}</span>
          <span style="background:rgba(99,102,241,.25);color:#a5b4fc;padding:3px 10px;border-radius:99px;font-size:.75rem;font-weight:600">${emp.contrato}</span>
          <span style="background:rgba(16,185,129,.2);color:#6ee7b7;padding:3px 10px;border-radius:99px;font-size:.75rem;font-weight:600">● Activo</span>
        </div>
      </div>
      <div style="text-align:right;color:white">
        <div style="font-size:1.8rem;font-weight:800;color:#6ee7b7">${fmtSoles(p.neto)}</div>
        <div style="font-size:.78rem;color:rgba(255,255,255,.55)">Sueldo neto / mes</div>
        <div style="font-size:.72rem;color:rgba(255,255,255,.4);margin-top:4px">${years} año${years !== 1 ? 's' : ''} ${months} mes${months !== 1 ? 'es' : ''} de antigüedad</div>
      </div>
    </div>
    <div style="display:flex;gap:32px;margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,.1);position:relative;z-index:1">
      <div><div style="font-size:.72rem;color:rgba(255,255,255,.4);margin-bottom:2px">Email</div><div style="font-size:.83rem;color:rgba(255,255,255,.8)">${emp.email}</div></div>
      <div><div style="font-size:.72rem;color:rgba(255,255,255,.4);margin-bottom:2px">Teléfono</div><div style="font-size:.83rem;color:rgba(255,255,255,.8)">${emp.tel}</div></div>
      <div><div style="font-size:.72rem;color:rgba(255,255,255,.4);margin-bottom:2px">Ingreso</div><div style="font-size:.83rem;color:rgba(255,255,255,.8)">${fmtDate(emp.ingreso)}</div></div>
      <div><div style="font-size:.72rem;color:rgba(255,255,255,.4);margin-bottom:2px">DNI</div><div style="font-size:.83rem;color:rgba(255,255,255,.8)">${emp.dni}</div></div>
      <div><div style="font-size:.72rem;color:rgba(255,255,255,.4);margin-bottom:2px">Sistema Pensión</div><div style="font-size:.83rem;color:rgba(255,255,255,.8)">${emp.afp}</div></div>
    </div>
  </div>

  <!-- STATS -->
  <div class="stats-grid" style="margin-bottom:20px">
    <div class="stat-card" style="cursor:pointer" onclick="navigate('mi-asistencia')">
      <div class="stat-icon green"><i data-lucide="check-circle-2" style="width:22px;height:22px"></i></div>
      <div><div class="stat-number">${presentes}</div><div class="stat-label">Asistencias (Feb)</div><div class="stat-change pos">↑ Buen registro</div></div>
    </div>
    <div class="stat-card" style="cursor:pointer" onclick="navigate('mi-asistencia')">
      <div class="stat-icon amber"><i data-lucide="clock" style="width:22px;height:22px"></i></div>
      <div><div class="stat-number">${tardanzas}</div><div class="stat-label">Tardanzas (Feb)</div>
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

  <!-- QUICK GRIDS -->
  <div class="grid-2" style="gap:16px">
    <!-- Recent attendance -->
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
              <td>${a.entrada}</td><td>${a.salida}</td>
              <td style="font-size:.82rem;color:var(--text-muted)">${horasDiff(a.entrada, a.salida)}</td>
              <td><span class="badge ${tipoColor(a.tipo)} badge-dot">${a.tipo}</span></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- My docs + last boleta -->
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
              <div><div class="td-name">${doc.nombre}</div><div class="td-sub">${doc.tipo} · ${fmtDate(doc.fecha)}</div></div>
            </div>
            <button class="btn btn-ghost btn-sm"><i data-lucide="download" style="width:13px;height:13px"></i></button>
          </div>`).join('')}
        ${myDocs.length === 0 ? '<div class="empty-state"><p>Sin documentos aún</p></div>' : ''}
      </div>
    </div>
  </div>

  <!-- Last boleta preview -->
  <div class="card" style="margin-top:16px">
    <div class="card-header">
      <div><div class="card-title">Mi Última Boleta de Pago</div><div class="card-subtitle">Febrero 2026 · ${empFullName(emp)}</div></div>
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
}

function initMiPortal() { }

// ─── MI ASISTENCIA ───────────────────────────────────────────
function renderMiAsistencia() {
  const emp = myEmp();
  const myAtt = MOCK.asistencias.filter(a => a.empId === emp.id);
  const pres = myAtt.filter(a => a.tipo !== 'Falta').length;
  const tard = myAtt.filter(a => a.tipo === 'Tardanza').length;
  const fal = myAtt.filter(a => a.tipo === 'Falta').length;
  const hex = myAtt.filter(a => a.tipo === 'Hora Extra').length;

  const rows = myAtt.slice().reverse().map(a => `
    <tr>
      <td>${fmtDate(a.fecha)}</td>
      <td><strong>${a.entrada}</strong></td>
      <td>${a.salida}</td>
      <td style="color:var(--text-muted)">${horasDiff(a.entrada, a.salida)}</td>
      <td><span class="badge ${tipoColor(a.tipo)} badge-dot">${a.tipo}</span></td>
      <td style="font-size:.8rem;color:var(--text-muted)">${a.obs || '—'}</td>
    </tr>`).join('');

  return `
  <div class="view-header">
    <div class="view-header-left"><h1>Mi Asistencia</h1><p>Historial personal de ${empFullName(emp)}</p></div>
    <div class="view-header-actions">
      <button class="btn btn-ghost"><i data-lucide="download" style="width:15px;height:15px"></i> Exportar</button>
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

  <div class="card">
    <div class="card-header">
      <div><div class="card-title">Historial Detallado</div><div class="card-subtitle">${myAtt.length} registros</div></div>
      <input type="month" class="filter-select" value="2026-02">
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Fecha</th><th>Entrada</th><th>Salida</th><th>Horas Trabajadas</th><th>Tipo</th><th>Observación</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-muted)">Sin registros</td></tr>'}</tbody>
      </table>
    </div>
  </div>`;
}

// ─── MIS BOLETAS ─────────────────────────────────────────────
const PERIODOS = [
  { mes: 'Febrero', anio: 2026 },
  { mes: 'Enero', anio: 2026 },
  { mes: 'Diciembre', anio: 2025 },
  { mes: 'Noviembre', anio: 2025 },
  { mes: 'Octubre', anio: 2025 },
  { mes: 'Septiembre', anio: 2025 },
];

function renderMisBoletas() {
  const emp = myEmp();
  const p = calcPlanilla(emp);

  const cards = PERIODOS.map((per, i) => {
    const factor = i === 0 ? 1 : (0.992 + Math.random() * 0.016);
    const neto = (p.neto * factor).toFixed(2);
    return `
    <div class="card" style="cursor:pointer" onclick="openBoletaModal('${per.mes} ${per.anio}')">
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
  <div class="view-header">
    <div class="view-header-left"><h1>Mis Boletas de Pago</h1><p>Historial de remuneraciones de ${empFullName(emp)}</p></div>
  </div>

  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">
    ${cards}
  </div>`;
}

function initMisBoletas() { }

window.openBoletaModal = function (periodo) {
  const emp = myEmp();
  const company = MOCK.empresas[0];
  const p = calcPlanilla(emp);
  // Find the document for this period to check signature status
  const doc = MOCK.documentos.find(d => d.empId === emp.id && d.tipo === 'Boleta' && d.nombre.includes(periodo.split(' ')[0]));
  openModal(`
  <div class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <div><h3>Boleta de Pago</h3><div class="td-sub">${periodo} · ${empFullName(emp)}</div></div>
        <button class="modal-close" onclick="closeModal()"><i data-lucide="x" style="width:14px;height:14px"></i></button>
      </div>
      <div class="modal-body">
        <div style="border:2px dashed var(--border);border-radius:var(--r-md);padding:22px; position:relative;">
          <div style="text-align:center;margin-bottom:16px">
            <div style="font-weight:800;font-size:1.1rem">${company.nombre}</div>
            <div style="font-size:.78rem;color:var(--text-muted)">RUC ${company.ruc}</div>
            <div style="font-weight:700;margin-top:8px;color:var(--primary)">BOLETA DE PAGO · ${periodo.toUpperCase()}</div>
          </div>
          <div class="info-row between"><span class="info-row-label">Trabajador</span><span class="fw-700">${empFullName(emp)}</span></div>
          <div class="info-row between"><span class="info-row-label">DNI</span><span>${emp.dni}</span></div>
          <div class="info-row between"><span class="info-row-label">Cargo</span><span>${getPuesto(emp.puestoId)?.nombre}</span></div>
          <div class="info-row between"><span class="info-row-label">Sistema Pens.</span><span>${emp.afp}</span></div>
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
          
          ${doc && doc.signed ? `
          <div style="margin-top:24px; padding:16px; border:1px solid var(--success-100); background:var(--success-50); border-radius:var(--r); display:flex; align-items:center; gap:12px;">
            <div style="width:40px;height:40px;background:var(--success);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0">
                <i data-lucide="check" style="width:20px;height:20px"></i>
            </div>
            <div>
                <div style="font-weight:700;color:#065f46;font-size:0.85rem">Firmado Digitalmente</div>
                <div style="font-size:0.75rem;color:#065f46;opacity:0.8">Por: ${doc.signedBy} (DNI ${doc.signedDni})</div>
                <div style="font-size:0.7rem;color:#065f46;opacity:0.6">${doc.signedAt}</div>
            </div>
          </div>
          ` : `
          <div style="margin-top:24px; text-align:center; padding:20px; border:1px dashed var(--gray-300); border-radius:var(--r); color:var(--text-muted);">
            <div style="font-size:0.8rem; margin-bottom:10px;">Documento pendiente de firma electrónica</div>
            <button class="btn btn-primary btn-sm" onclick="closeModal(); showSignModal(${doc ? doc.id : 'null'})">
                <i data-lucide="pen-tool" style="width:14px;height:14px"></i> Firmar Ahora
            </button>
          </div>
          `}
          
          <div style="margin-top:10px;padding:8px 12px;background:var(--warning-50);border-radius:var(--r-sm);font-size:.76rem;color:#92400e">
            EsSalud 9% (cargo empleador): ${fmtSoles(p.essalud)} — No se descuenta del trabajador
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cerrar</button>
        <button class="btn btn-primary" onclick="alert('Función de impresión (demo)')"><i data-lucide="printer" style="width:14px;height:14px"></i> Imprimir</button>
      </div>
    </div>
  </div>`);
};

// ─── MIS DOCUMENTOS ───────────────────────────────────────────
function renderMisDocumentos() {
  const emp = myEmp();
  const myDocs = MOCK.documentos.filter(d => d.empId === emp.id);
  const typeColors = { Contrato: 'badge-indigo', ID: 'badge-blue', Recibo: 'badge-green', Certificado: 'badge-purple', Otro: 'badge-gray' };

  return `
  <div class="view-header">
    <div class="view-header-left"><h1>Mis Documentos</h1><p>${myDocs.length} documentos disponibles</p></div>
    <div class="view-header-actions">
      <button class="btn btn-primary btn-sm" onclick="alert('Solicitar documento al área de RR.HH. (demo)')">
        <i data-lucide="send" style="width:14px;height:14px"></i> Solicitar Documento
      </button>
    </div>
  </div>

  ${myDocs.length === 0 ? `
    <div class="card"><div class="empty-state" style="padding:60px 20px">
      <i data-lucide="folder-open" style="width:48px;height:48px;margin:0 auto 12px;display:block;color:var(--text-muted);opacity:.4"></i>
      <p>Aún no tienes documentos registrados.<br>Contacta a RR.HH. para solicitarlos.</p>
    </div></div>` :
      `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px">
    ${myDocs.map(doc => `
    <div class="card" style="transition:var(--t)" onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='var(--shadow-md)'" onmouseleave="this.style.transform='';this.style.boxShadow=''">
      <div class="card-body" style="padding:20px">
        <div style="display:flex;align-items:flex-start;gap:12px">
          <div class="stat-icon indigo" style="width:44px;height:44px;border-radius:var(--r);flex-shrink:0">
            <i data-lucide="${doc.tipo === 'Boleta' ? 'receipt' : 'file-text'}" style="width:20px;height:20px"></i>
          </div>
          <div style="flex:1;min-width:0">
            <div class="td-name" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${doc.nombre}</div>
            <div class="td-sub" style="margin-top:3px">${fmtDate(doc.fecha)} · ${doc.kb} KB</div>
            <div style="display:flex; gap:4px; flex-wrap:wrap; margin-top:8px">
                <span class="badge ${typeColors[doc.tipo] || 'badge-gray'}">${doc.tipo}</span>
                ${doc.tipo === 'Boleta' ? (doc.signed ? '<span class="badge badge-green">Firmado</span>' : '<span class="badge badge-amber">Pendiente Firma</span>') : ''}
            </div>
          </div>
        </div>
        <div style="display:flex; gap:8px; margin-top:14px;">
            ${doc.tipo === 'Boleta' && !doc.signed ? `
                <button class="btn btn-primary btn-sm" style="flex:1; justify-content:center" onclick="showSignModal(${doc.id})">
                    <i data-lucide="pen-tool" style="width:13px;height:13px"></i> Firmar
                </button>
            ` : ''}
            <button class="btn btn-ghost btn-sm" style="flex:1; justify-content:center">
                <i data-lucide="download" style="width:13px;height:13px"></i> Descargar
            </button>
        </div>
      </div>
    </div>`).join('')}
  </div>`}`;
}

// ─── MIS VACACIONES ───────────────────────────────────────────
function renderMisVacaciones() {
  const emp = myEmp();
  const myVacs = MOCK.vacaciones.filter(v => v.empId === emp.id);
  const saldo = MOCK.saldoVacaciones;

  const rows = myVacs.map(v => `
    <tr>
      <td>${fmtDate(v.inicio)}</td>
      <td>${fmtDate(v.fin)}</td>
      <td><strong>${v.dias} días</strong></td>
      <td>${v.motivo}</td>
      <td><span class="badge ${vacEstadoBadge(v.estado)} badge-dot">${v.estado}</span></td>
      <td style="font-size:.78rem;color:var(--text-muted)">${v.aprobadoPor || '—'}</td>
    </tr>`).join('');

  return `
  <div class="view-header">
    <div class="view-header-left"><h1>Mis Vacaciones</h1><p>Saldo y solicitudes de ${empFullName(emp)}</p></div>
    <div class="view-header-actions">
      <button class="btn btn-primary" onclick="openSolicitudVac()"><i data-lucide="plus" style="width:15px;height:15px"></i> Nueva Solicitud</button>
    </div>
  </div>

  <div class="vac-saldo" style="margin-bottom:20px">
    <div>
      <div class="vac-saldo-num">${saldo.diasPendientes}</div>
      <div style="font-size:.72rem;opacity:.7;margin-top:2px">días disponibles para usar</div>
    </div>
    <div style="width:1px;height:50px;background:rgba(255,255,255,.2)"></div>
    <div>
      <div class="vac-saldo-label">Saldo de Vacaciones 2026</div>
      <div class="vac-saldo-used">${saldo.diasAnuales} días anuales · ${saldo.diasUsados} días usados · ${saldo.diasPendientes} días disponibles</div>
      <div style="margin-top:8px"><div class="progress-bar" style="width:220px;background:rgba(255,255,255,.2)">
        <div class="progress-fill" style="width:${Math.round(saldo.diasUsados / saldo.diasAnuales * 100)}%;background:white;opacity:.8"></div>
      </div></div>
    </div>
    <div style="margin-left:auto;display:flex;gap:24px">
      <div style="text-align:center"><div style="font-size:1.4rem;font-weight:800">${myVacs.filter(v => v.estado === 'Aprobado').length}</div><div style="font-size:.75rem;opacity:.8">Aprobadas</div></div>
      <div style="text-align:center"><div style="font-size:1.4rem;font-weight:800">${myVacs.filter(v => v.estado === 'Pendiente').length}</div><div style="font-size:.75rem;opacity:.8">Pendientes</div></div>
    </div>
  </div>

  <div class="card">
    <div class="card-header"><div class="card-title">Mis Solicitudes</div></div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Inicio</th><th>Fin</th><th>Días</th><th>Motivo</th><th>Estado</th><th>Aprobado por</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--text-muted)">Sin solicitudes aún</td></tr>'}</tbody>
      </table>
    </div>
  </div>`;
}
