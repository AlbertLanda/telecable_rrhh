// ============================================================
// VIEW: Empleados
// ============================================================

let empFilter = { search: '', dept: '', estado: '' };

function renderEmpleados() {
  const deptOptions = MOCK.departamentos.map(d => `<option value="${d.id}">${d.nombre}</option>`).join('');
  return `
  <div class="view-header">
    <div class="view-header-left">
      <h1>Empleados</h1>
      <p>${MOCK.empleados.length} colaboradores registrados</p>
    </div>
    <div class="view-header-actions">
      <button class="btn btn-ghost"><i data-lucide="download" style="width:15px;height:15px"></i> Exportar</button>
      <button class="btn btn-primary" onclick="openNewEmpModal()"><i data-lucide="user-plus" style="width:15px;height:15px"></i> Nuevo Empleado</button>
    </div>
  </div>

  <div class="toolbar">
    <div class="toolbar-left">
      <div class="search-box">
        <i data-lucide="search" class="search-box-icon" style="width:15px;height:15px"></i>
        <input type="text" id="empSearch" placeholder="Buscar por nombre, código, DNI..." oninput="filterEmpleados()">
      </div>
      <select class="filter-select" id="empDept" onchange="filterEmpleados()">
        <option value="">Todos los departamentos</option>${deptOptions}
      </select>
      <select class="filter-select" id="empEstado" onchange="filterEmpleados()">
        <option value="">Todos los estados</option>
        <option value="Activo">Activo</option>
        <option value="En Vacaciones">En Vacaciones</option>
        <option value="Suspendido">Suspendido</option>
      </select>
    </div>
    <div style="display:flex;gap:6px">
      <button class="btn btn-ghost btn-icon" id="viewGrid" onclick="setView('grid')" title="Vista tarjetas">
        <i data-lucide="grid-3x3" style="width:16px;height:16px"></i>
      </button>
      <button class="btn btn-ghost btn-icon" id="viewList" onclick="setView('list')" title="Vista lista">
        <i data-lucide="list" style="width:16px;height:16px"></i>
      </button>
    </div>
  </div>

  <div id="empContainer"></div>`;
}

function initEmpleados() {
  filterEmpleados();
}

let empViewMode = 'list';
function setView(mode) {
  empViewMode = mode;
  filterEmpleados();
}

function filterEmpleados() {
  const q = (document.getElementById('empSearch')?.value || '').toLowerCase();
  const dept = document.getElementById('empDept')?.value || '';
  const est = document.getElementById('empEstado')?.value || '';

  let list = MOCK.empleados.filter(e => {
    const matchC = e.companyId === currentCompanyId;
    const matchQ = !q || empFullName(e).toLowerCase().includes(q) || e.codigo.toLowerCase().includes(q) || e.dni.includes(q) || e.email.toLowerCase().includes(q);
    const matchD = !dept || e.deptId == dept;
    const matchE = !est || e.estado === est;
    return matchC && matchQ && matchD && matchE;
  });

  const container = document.getElementById('empContainer');
  if (!container) return;

  if (empViewMode === 'grid') {
    container.innerHTML = `<div class="emp-grid">${list.map(empCard).join('')}</div>`;
  } else {
    container.innerHTML = `<div class="card"><div class="table-wrap">${empTable(list)}</div></div>`;
  }
  lucide.createIcons();
}

function empCard(emp) {
  const dept = getDept(emp.deptId);
  const puesto = getPuesto(emp.puestoId);
  return `<div class="emp-card" onclick="openEmpDetail(${emp.id})">
    <div class="emp-card-avatar ${avatarColor(emp.id)}">${empInitials(emp)}</div>
    <div class="emp-card-name">${empFullName(emp)}</div>
    <div class="emp-card-pos">${puesto?.nombre || '—'}</div>
    <div class="emp-card-dept"><i data-lucide="building-2" style="width:12px;height:12px;display:inline;margin-right:3px"></i>${dept?.nombre}</div>
    <span class="badge ${estadoBadge(emp.estado)} badge-dot">${emp.estado}</span>
  </div>`;
}

function empTable(list) {
  const rows = list.map(emp => {
    const dept = getDept(emp.deptId);
    const puesto = getPuesto(emp.puestoId);
    return `<tr style="cursor:pointer" onclick="openEmpDetail(${emp.id})">
      <td><div class="td-user">
        <div class="td-avatar ${avatarColor(emp.id)}">${empInitials(emp)}</div>
        <div><div class="td-name">${empFullName(emp)}</div><div class="td-sub">${emp.codigo} · ${emp.email}</div></div>
      </div></td>
      <td>${dept?.nombre || '—'}</td>
      <td>${puesto?.nombre || '—'}</td>
      <td><span class="badge badge-gray">${emp.contrato}</span></td>
      <td>${fmtDate(emp.ingreso)}</td>
      <td>${fmtSoles(emp.sueldo)}</td>
      <td><span class="badge ${estadoBadge(emp.estado)} badge-dot">${emp.estado}</span></td>
      <td onclick="event.stopPropagation()">
        <button class="btn btn-ghost btn-sm" onclick="openEmpDetail(${emp.id})"><i data-lucide="eye" style="width:13px;height:13px"></i></button>
      </td>
    </tr>`;
  }).join('');
  return `<table>
    <thead><tr><th>Empleado</th><th>Departamento</th><th>Puesto</th><th>Contrato</th><th>Ingreso</th><th>Sueldo</th><th>Estado</th><th></th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

window.openEmpDetail = function (id) {
  const emp = getEmp(id);
  const dept = getDept(emp.deptId);
  const puesto = getPuesto(emp.puestoId);
  const docs = MOCK.documentos.filter(d => d.empId === id);
  const p = calcPlanilla(emp);

  openModal(`
  <div class="modal-overlay">
    <div class="modal modal-lg">
      <div class="modal-header">
        <div style="display:flex;align-items:center;gap:12px">
          <div class="td-avatar ${avatarColor(emp.id)}" style="width:42px;height:42px;font-size:1rem">${empInitials(emp)}</div>
          <div><h3>${empFullName(emp)}</h3><div class="td-sub">${emp.codigo} · <span class="badge ${estadoBadge(emp.estado)}">${emp.estado}</span></div></div>
        </div>
        <button class="modal-close" onclick="closeModal()"><i data-lucide="x" style="width:14px;height:14px"></i></button>
      </div>
      <div class="modal-body">
        <div class="tabs">
          <div class="tab active" onclick="switchTab(this,'tab-info')">Info Personal</div>
          <div class="tab" onclick="switchTab(this,'tab-contrato')">Contrato & Planilla</div>
          <div class="tab" onclick="switchTab(this,'tab-docs')">Documentos (${docs.length})</div>
        </div>
        <div id="tab-info">
          <div class="form-grid">
            <div><div class="info-row"><span class="info-row-label">Nombres</span><span class="info-row-value">${emp.nombres}</span></div>
            <div class="info-row"><span class="info-row-label">Apellidos</span><span class="info-row-value">${emp.apellidos}</span></div>
            <div class="info-row"><span class="info-row-label">DNI</span><span class="info-row-value">${emp.dni}</span></div>
            <div class="info-row"><span class="info-row-label">Nacimiento</span><span class="info-row-value">${fmtDate(emp.nacimiento)}</span></div>
            <div class="info-row"><span class="info-row-label">Género</span><span class="info-row-value">${emp.genero === 'M' ? 'Masculino' : 'Femenino'}</span></div></div>
            <div><div class="info-row"><span class="info-row-label">Email</span><span class="info-row-value">${emp.email}</span></div>
            <div class="info-row"><span class="info-row-label">Teléfono</span><span class="info-row-value">${emp.tel}</span></div>
            <div class="info-row"><span class="info-row-label">Departamento</span><span class="info-row-value">${dept?.nombre}</span></div>
            <div class="info-row"><span class="info-row-label">Puesto</span><span class="info-row-value">${puesto?.nombre}</span></div>
            <div class="info-row"><span class="info-row-label">Fecha Ingreso</span><span class="info-row-value">${fmtDate(emp.ingreso)}</span></div></div>
          </div>
        </div>
        <div id="tab-contrato" style="display:none">
          <div class="grid-2" style="gap:12px;margin-bottom:16px">
            <div class="info-row"><span class="info-row-label">Tipo Contrato</span><span class="info-row-value"><span class="badge badge-indigo">${emp.contrato}</span></span></div>
            <div class="info-row"><span class="info-row-label">Sistema Pensión</span><span class="info-row-value">${emp.afp}</span></div>
          </div>
          <div class="card" style="background:var(--gray-50)">
            <div class="card-body">
              <div class="section-label">Cálculo de Planilla – Feb 2026</div>
              <div class="info-row between"><span>Sueldo Base</span><span class="fw-700">${fmtSoles(p.bruto)}</span></div>
              <div class="info-row between"><span>Asignación Familiar</span><span>${fmtSoles(p.asigFam)}</span></div>
              <div class="info-row between"><span class="fw-700">Sueldo Bruto</span><span class="fw-700">${fmtSoles(p.brutoTotal)}</span></div>
              <div class="divider"></div>
              <div class="info-row between"><span style="color:var(--danger)">${p.afpLabel} (descuento)</span><span style="color:var(--danger)">- ${fmtSoles(p.afpMonto)}</span></div>
              <div class="info-row between"><span style="color:var(--warning)">EsSalud 9% (cargo empleador)</span><span style="color:var(--warning)">${fmtSoles(p.essalud)}</span></div>
              <div class="divider"></div>
              <div class="info-row between"><span class="fw-700" style="color:var(--success)">Sueldo Neto</span><span class="fw-700" style="color:var(--success);font-size:1.1rem">${fmtSoles(p.neto)}</span></div>
            </div>
          </div>
        </div>
        <div id="tab-docs" style="display:none">
          ${docs.length ? docs.map(doc => `
            <div class="info-row between">
              <div style="display:flex;align-items:center;gap:10px">
                <div class="stat-icon indigo" style="width:36px;height:36px;border-radius:8px"><i data-lucide="file-text" style="width:16px;height:16px"></i></div>
                <div><div class="td-name">${doc.nombre}</div><div class="td-sub">${doc.tipo} · ${fmtDate(doc.fecha)}</div></div>
              </div>
              <button class="btn btn-ghost btn-sm"><i data-lucide="download" style="width:13px;height:13px"></i></button>
            </div>`).join('') : '<div class="empty-state"><p>No hay documentos registrados</p></div>'}
          <div class="mt-16"><button class="btn btn-primary btn-sm"><i data-lucide="upload" style="width:13px;height:13px"></i> Subir Documento</button></div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cerrar</button>
        <button class="btn btn-primary"><i data-lucide="edit" style="width:14px;height:14px"></i> Editar</button>
      </div>
    </div>
  </div>`);
};

window.switchTab = function (el, tabId) {
  el.closest('.modal-body').querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  ['tab-info', 'tab-contrato', 'tab-docs'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = id === tabId ? '' : 'none';
  });
  lucide.createIcons();
};

window.openNewEmpModal = function () {
  const deptOptions = MOCK.departamentos.map(d => `<option value="${d.id}">${d.nombre}</option>`).join('');
  openModal(`
  <div class="modal-overlay">
    <div class="modal modal-lg">
      <div class="modal-header">
        <h3>Nuevo Empleado</h3>
        <button class="modal-close" onclick="closeModal()"><i data-lucide="x" style="width:14px;height:14px"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-grid">
          <div class="field"><label>Nombres *</label><input type="text" placeholder="Ej: Juan Carlos"></div>
          <div class="field"><label>Apellidos *</label><input type="text" placeholder="Ej: Pérez López"></div>
          <div class="field"><label>DNI *</label><input type="text" placeholder="12345678" maxlength="8"></div>
          <div class="field"><label>Email corporativo *</label><input type="email" placeholder="nombre@empresa.pe"></div>
          <div class="field"><label>Teléfono</label><input type="text" placeholder="9XXXXXXXX"></div>
          <div class="field"><label>Fecha de Nacimiento</label><input type="date"></div>
          <div class="field"><label>Fecha de Ingreso *</label><input type="date" value="2026-02-23"></div>
          <div class="field"><label>Departamento *</label><select><option value="">Seleccionar...</option>${deptOptions}</select></div>
          <div class="field"><label>Tipo de Contrato *</label>
            <select><option>Indefinido</option><option>Plazo Fijo</option><option>Practicante</option><option>Por Obra</option></select>
          </div>
          <div class="field"><label>Sistema de Pensión *</label>
            <select><option>Prima AFP</option><option>Integra</option><option>Hábitat</option><option>Profuturo</option><option>ONP</option></select>
          </div>
          <div class="field"><label>Sueldo Base (S/) *</label><input type="number" placeholder="3000" min="1025"></div>
          <div class="field"><label>Género</label>
            <select><option value="M">Masculino</option><option value="F">Femenino</option></select>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" onclick="saveNewEmp()"><i data-lucide="save" style="width:14px;height:14px"></i> Registrar Empleado</button>
      </div>
    </div>
  </div>`);
};

window.saveNewEmp = function () {
  alert('✅ Empleado registrado exitosamente (demo)');
  closeModal();
};
