// ============================================================
// VIEW: Asistencia
// ============================================================

function renderAsistencia() {
    const hoy = '2026-02-23';
    const todayRecs = MOCK.asistencias.filter(a => a.fecha === hoy);
    const presentes = todayRecs.filter(a => a.tipo !== 'Falta').length;
    const tardanzas = todayRecs.filter(a => a.tipo === 'Tardanza').length;
    const faltas = MOCK.empleados.length - todayRecs.length;
    const horasExtra = todayRecs.filter(a => a.tipo === 'Hora Extra').length;

    const empOptions = MOCK.empleados.map(e => `<option value="${e.id}">${empFullName(e)}</option>`).join('');

    const rows = MOCK.asistencias.slice().reverse().map(a => {
        const emp = getEmp(a.empId);
        const dept = getDept(emp.deptId);
        return `<tr>
      <td><div class="td-user">
        <div class="td-avatar ${avatarColor(emp.id)}">${empInitials(emp)}</div>
        <div><div class="td-name">${empFullName(emp)}</div><div class="td-sub">${dept.nombre}</div></div>
      </div></td>
      <td>${fmtDate(a.fecha)}</td>
      <td>${a.entrada}</td>
      <td>${a.salida}</td>
      <td>${horasDiff(a.entrada, a.salida)}</td>
      <td><span class="badge ${tipoColor(a.tipo)} badge-dot">${a.tipo}</span></td>
      <td>${a.obs || '<span class="text-muted">—</span>'}</td>
    </tr>`;
    }).join('');

    return `
  <div class="view-header">
    <div class="view-header-left"><h1>Asistencia</h1><p>Control de ingresos, salidas y ausencias</p></div>
    <div class="view-header-actions">
      <button class="btn btn-ghost"><i data-lucide="download" style="width:15px;height:15px"></i> Exportar</button>
      <button class="btn btn-primary" onclick="openRegistrarAtt()"><i data-lucide="plus" style="width:15px;height:15px"></i> Registrar</button>
    </div>
  </div>

  <div class="att-today-bar">
    <div class="att-today-info">
      <h2>📅 Lunes, 23 de Febrero 2026</h2>
      <p>Resumen de asistencia del día · Hora actual: 09:26</p>
    </div>
    <div style="display:flex;gap:28px;align-items:center">
      <div style="text-align:center"><div style="font-size:1.6rem;font-weight:800">${presentes}</div><div style="font-size:.78rem;opacity:.8">Presentes</div></div>
      <div style="text-align:center"><div style="font-size:1.6rem;font-weight:800;color:#fde68a">${tardanzas}</div><div style="font-size:.78rem;opacity:.8">Tardanzas</div></div>
      <div style="text-align:center"><div style="font-size:1.6rem;font-weight:800;color:#fca5a5">${faltas}</div><div style="font-size:.78rem;opacity:.8">Faltas</div></div>
      <div style="text-align:center"><div style="font-size:1.6rem;font-weight:800;color:#6ee7b7">${horasExtra}</div><div style="font-size:.78rem;opacity:.8">H. Extra</div></div>
      <button class="att-clock-btn" onclick="openRegistrarAtt()">⏱ Marcar Asistencia</button>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <div><div class="card-title">Historial de Asistencia</div><div class="card-subtitle">Últimos registros</div></div>
      <div style="display:flex;gap:8px">
        <input type="date" class="filter-select" value="2026-02-23" onchange="filterAttDate(this.value)">
        <select class="filter-select" onchange="filterAttEmp(this.value)">
          <option value="">Todos los empleados</option>${empOptions}
        </select>
        <select class="filter-select" id="attTipoFilter" onchange="filterAttTipo(this.value)">
          <option value="">Todos los tipos</option>
          <option>Asistencia</option><option>Tardanza</option><option>Falta</option><option>Hora Extra</option>
        </select>
      </div>
    </div>
    <div class="table-wrap" id="attTableWrap">
      <table>
        <thead><tr><th>Empleado</th><th>Fecha</th><th>Entrada</th><th>Salida</th><th>Horas</th><th>Tipo</th><th>Observación</th></tr></thead>
        <tbody id="attTable">${rows}</tbody>
      </table>
    </div>
  </div>`;
}

function initAsistencia() { }

window.openRegistrarAtt = function () {
    const empOptions = MOCK.empleados.map(e => `<option value="${e.id}">${empFullName(e)}</option>`).join('');
    openModal(`
  <div class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <h3>Registrar Asistencia</h3>
        <button class="modal-close" onclick="closeModal()"><i data-lucide="x" style="width:14px;height:14px"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-grid">
          <div class="field form-full"><label>Empleado *</label>
            <select><option value="">Seleccionar empleado...</option>${empOptions}</select>
          </div>
          <div class="field"><label>Fecha *</label><input type="date" value="2026-02-23"></div>
          <div class="field"><label>Tipo *</label>
            <select><option>Asistencia</option><option>Tardanza</option><option>Falta</option><option>Hora Extra</option><option>Permiso</option></select>
          </div>
          <div class="field"><label>Hora de Entrada</label><input type="time" value="08:00"></div>
          <div class="field"><label>Hora de Salida</label><input type="time" value="17:00"></div>
          <div class="field form-full"><label>Observación</label><textarea placeholder="Motivo, justificación, etc."></textarea></div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" onclick="alert('✅ Asistencia registrada (demo)');closeModal()">
          <i data-lucide="check" style="width:14px;height:14px"></i> Guardar
        </button>
      </div>
    </div>
  </div>`);
};

window.filterAttDate = window.filterAttEmp = window.filterAttTipo = function () { };
