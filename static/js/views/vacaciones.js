// ============================================================
// VIEW: Vacaciones
// ============================================================

function renderVacaciones() {
  const pendientes = MOCK.vacaciones.filter(v => v.estado === 'Pendiente');
  const aprobados = MOCK.vacaciones.filter(v => v.estado === 'Aprobado');
  const saldo = MOCK.saldoVacaciones;

  const rows = MOCK.vacaciones.map(v => {
    const emp = getEmp(v.empId);
    return `<tr>
      <td><div class="td-user">
        <div class="td-avatar ${avatarColor(emp.id)}">${empInitials(emp)}</div>
        <div><div class="td-name">${empFullName(emp)}</div><div class="td-sub">${getDept(emp.deptId).nombre}</div></div>
      </div></td>
      <td>${fmtDate(v.inicio)}</td>
      <td>${fmtDate(v.fin)}</td>
      <td><strong>${v.dias} días</strong></td>
      <td>${v.motivo}</td>
      <td><span class="badge ${vacEstadoBadge(v.estado)} badge-dot">${v.estado}</span></td>
      <td>
        ${v.estado === 'Pendiente' ? `
          <button class="btn btn-success btn-sm" onclick="accionVac(${v.id},'Aprobado')">Aprobar</button>
          <button class="btn btn-ghost btn-sm" style="margin-left:4px" onclick="accionVac(${v.id},'Rechazado')">Rechazar</button>
        ` : `<span class="text-muted" style="font-size:.78rem">${v.aprobadoPor || 'Automático'}</span>`}
      </td>
    </tr>`;
  }).join('');

  return `
  <div class="view-header">
    <div class="view-header-left"><h1>Vacaciones & Licencias</h1><p>Gestión de solicitudes y saldo de días</p></div>
    <div class="view-header-actions">
      <button class="btn btn-primary" onclick="openSolicitudVac()"><i data-lucide="plus" style="width:15px;height:15px"></i> Solicitar Vacaciones</button>
    </div>
  </div>

  <div class="vac-saldo">
    <div>
      <div class="vac-saldo-num">${saldo.diasPendientes}</div>
      <div style="font-size:.72rem;opacity:.7;margin-top:2px">días disponibles</div>
    </div>
    <div style="width:1px;height:50px;background:rgba(255,255,255,.2)"></div>
    <div>
      <div class="vac-saldo-label">Tu Saldo de Vacaciones 2026</div>
      <div class="vac-saldo-used">${saldo.diasAnuales} días anuales · ${saldo.diasUsados} usados · ${saldo.diasPendientes} disponibles</div>
      <div style="margin-top:8px">
        <div class="progress-bar" style="width:200px;background:rgba(255,255,255,.2)">
          <div class="progress-fill" style="width:${Math.round(saldo.diasUsados / saldo.diasAnuales * 100)}%;background:white;opacity:.8"></div>
        </div>
      </div>
    </div>
    <div style="margin-left:auto;display:flex;gap:24px">
      <div style="text-align:center">
        <div style="font-size:1.4rem;font-weight:800">${pendientes.length}</div>
        <div style="font-size:.75rem;opacity:.8">Pendientes</div>
      </div>
      <div style="text-align:center">
        <div style="font-size:1.4rem;font-weight:800">${aprobados.length}</div>
        <div style="font-size:.75rem;opacity:.8">Aprobados</div>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <div><div class="card-title">Solicitudes de Vacaciones</div><div class="card-subtitle">${MOCK.vacaciones.length} solicitudes en total</div></div>
      <div style="display:flex;gap:8px">
        <select class="filter-select" onchange="">
          <option>Todos los estados</option>
          <option>Pendiente</option><option>Aprobado</option><option>Rechazado</option>
        </select>
      </div>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Empleado</th><th>Inicio</th><th>Fin</th><th>Días</th><th>Motivo</th><th>Estado</th><th>Acción / Aprobado por</th></tr></thead>
        <tbody id="vacTable">${rows}</tbody>
      </table>
    </div>
  </div>`;
}

function initVacaciones() { }

window.accionVac = function (id, accion) {
  const v = MOCK.vacaciones.find(x => x.id === id);
  if (v) {
    v.estado = accion;
    if (accion === 'Aprobado') v.aprobadoPor = (typeof currentUser !== 'undefined' && currentUser?.name) || 'Admin';
    navigate('vacaciones');
  }
};

window.openSolicitudVac = function () {
  const empOptions = MOCK.empleados.map(e => `<option value="${e.id}">${empFullName(e)}</option>`).join('');
  openModal(`
  <div class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <h3>Solicitar Vacaciones</h3>
        <button class="modal-close" onclick="closeModal()"><i data-lucide="x" style="width:14px;height:14px"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-grid">
          <div class="field form-full"><label>Empleado *</label>
            <select><option value="">Seleccionar...</option>${empOptions}</select>
          </div>
          <div class="field"><label>Fecha Inicio *</label><input type="date" value="2026-03-01"></div>
          <div class="field"><label>Fecha Fin *</label><input type="date" value="2026-03-07"></div>
          <div class="field form-full"><label>Motivo *</label>
            <select><option>Vacaciones anuales</option><option>Asuntos personales</option><option>Viaje familiar</option><option>Otro</option></select>
          </div>
          <div class="field form-full"><label>Observaciones</label><textarea placeholder="Información adicional..."></textarea></div>
        </div>
        <div style="background:var(--info-50);padding:10px 14px;border-radius:var(--r-sm);font-size:.82rem;color:#1e40af;margin-top:4px">
          <strong>Saldo disponible:</strong> 20 días · Días seleccionados: 7 días
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" onclick="alert('✅ Solicitud enviada para aprobación (demo)');closeModal()">
          <i data-lucide="send" style="width:14px;height:14px"></i> Enviar Solicitud
        </button>
      </div>
    </div>
  </div>`);
};
