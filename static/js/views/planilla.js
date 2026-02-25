// ============================================================
// VIEW: Planilla
// ============================================================

function renderPlanilla() {
    const periodo = 'Febrero 2026';
    let totalBruto = 0, totalDescuentos = 0, totalNeto = 0, totalEssalud = 0;

    const rows = MOCK.empleados.map(emp => {
        const dept = getDept(emp.deptId);
        const p = calcPlanilla(emp);
        totalBruto += p.brutoTotal;
        totalDescuentos += p.afpMonto;
        totalNeto += p.neto;
        totalEssalud += p.essalud;
        return `<tr onclick="openPlanillaDetail(${emp.id})" style="cursor:pointer">
      <td><div class="td-user">
        <div class="td-avatar ${avatarColor(emp.id)}">${empInitials(emp)}</div>
        <div><div class="td-name">${empFullName(emp)}</div><div class="td-sub">${dept.nombre}</div></div>
      </div></td>
      <td>${fmtSoles(p.bruto)}</td>
      <td>${fmtSoles(p.asigFam)}</td>
      <td class="fw-700">${fmtSoles(p.brutoTotal)}</td>
      <td style="color:var(--danger)">${fmtSoles(p.afpMonto)}</td>
      <td>${emp.afp}</td>
      <td style="color:var(--warning)">${fmtSoles(p.essalud)}</td>
      <td class="fw-700" style="color:var(--success)">${fmtSoles(p.neto)}</td>
      <td><button class="btn btn-ghost btn-sm" onclick="event.stopPropagation();openPlanillaDetail(${emp.id})">
        <i data-lucide="eye" style="width:13px;height:13px"></i>
      </button></td>
    </tr>`;
    }).join('');

    return `
  <div class="view-header">
    <div class="view-header-left"><h1>Planilla</h1><p>Cálculo de remuneraciones con AFP, ONP y EsSalud</p></div>
    <div class="view-header-actions">
      <button class="btn btn-ghost"><i data-lucide="download" style="width:15px;height:15px"></i> Exportar PDF</button>
      <button class="btn btn-primary"><i data-lucide="send" style="width:15px;height:15px"></i> Procesar Planilla</button>
    </div>
  </div>

  <div class="payroll-header">
    <div>
      <div class="payroll-period"><small>Período de Planilla</small>${periodo}</div>
      <div style="font-size:.8rem;opacity:.6;margin-top:4px">${MOCK.empleados.length} empleados · Generado el 23/02/2026</div>
    </div>
    <div class="payroll-totals">
      <div class="pay-total-item">
        <div class="pay-total-label">Total Bruto</div>
        <div class="pay-total-num">${fmtSoles(totalBruto)}</div>
      </div>
      <div class="pay-total-item">
        <div class="pay-total-label">Total Descuentos</div>
        <div class="pay-total-num" style="color:#fca5a5">${fmtSoles(totalDescuentos)}</div>
      </div>
      <div class="pay-total-item">
        <div class="pay-total-label">EsSalud (empleador)</div>
        <div class="pay-total-num" style="color:#fde68a">${fmtSoles(totalEssalud)}</div>
      </div>
      <div class="pay-total-item">
        <div class="pay-total-label">Total Neto</div>
        <div class="pay-total-num success">${fmtSoles(totalNeto)}</div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <div><div class="card-title">Detalle de Planilla – ${periodo}</div><div class="card-subtitle">Clic en una fila para ver recibo completo</div></div>
      <div style="display:flex;gap:8px">
        <select class="filter-select"><option>Febrero 2026</option><option>Enero 2026</option><option>Diciembre 2025</option></select>
      </div>
    </div>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Empleado</th><th>S. Base</th><th>Asig. Fam.</th><th>Bruto Total</th>
            <th>AFP/ONP</th><th>Sistema</th><th>EsSalud*</th><th>Neto a Pagar</th><th></th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr style="background:var(--gray-50);font-weight:700">
            <td>TOTALES (${MOCK.empleados.length} empleados)</td>
            <td colspan="2"></td>
            <td>${fmtSoles(totalBruto)}</td>
            <td style="color:var(--danger)">${fmtSoles(totalDescuentos)}</td>
            <td></td>
            <td style="color:var(--warning)">${fmtSoles(totalEssalud)}</td>
            <td style="color:var(--success)">${fmtSoles(totalNeto)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
    <div style="padding:10px 18px;font-size:.75rem;color:var(--text-muted);border-top:1px solid var(--border)">
      * EsSalud 9% es a cargo del empleador y no se descuenta del trabajador.
      AFP privada ~13.09% (aporte 10% + comisión + seguro). ONP 13% fijo.
    </div>
  </div>`;
}

function initPlanilla() { }

window.openPlanillaDetail = function (id) {
    const emp = getEmp(id);
    const p = calcPlanilla(emp);
    openModal(`
  <div class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <div><h3>Boleta de Pago</h3><div class="td-sub">Febrero 2026 · ${empFullName(emp)}</div></div>
        <button class="modal-close" onclick="closeModal()"><i data-lucide="x" style="width:14px;height:14px"></i></button>
      </div>
      <div class="modal-body">
        <div style="border:2px dashed var(--border);border-radius:var(--r-md);padding:20px">
          <div style="text-align:center;margin-bottom:16px">
            <div style="font-weight:800;font-size:1.1rem">${MOCK.empresa.nombre}</div>
            <div style="font-size:.8rem;color:var(--text-muted)">RUC ${MOCK.empresa.ruc}</div>
            <div style="font-weight:700;margin-top:8px;color:var(--primary)">BOLETA DE PAGO · FEBRERO 2026</div>
          </div>
          <div class="info-row between"><span class="info-row-label">Trabajador</span><span class="fw-700">${empFullName(emp)}</span></div>
          <div class="info-row between"><span class="info-row-label">DNI</span><span>${emp.dni}</span></div>
          <div class="info-row between"><span class="info-row-label">Cargo</span><span>${getPuesto(emp.puestoId)?.nombre}</span></div>
          <div class="info-row between"><span class="info-row-label">Sistema Pensionario</span><span>${emp.afp}</span></div>
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
            <span style="font-weight:700;color:#065f46;font-size:.95rem">NETO A PAGAR</span>
            <span style="font-weight:800;font-size:1.3rem;color:var(--success)">${fmtSoles(p.neto)}</span>
          </div>
          <div style="margin-top:12px;padding:8px 12px;background:var(--warning-50);border-radius:var(--r-sm);font-size:.78rem;color:#92400e">
            EsSalud 9% (cargo empleador): ${fmtSoles(p.essalud)} — No se descuenta del trabajador
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cerrar</button>
        <button class="btn btn-primary"><i data-lucide="printer" style="width:14px;height:14px"></i> Imprimir</button>
      </div>
    </div>
  </div>`);
};
