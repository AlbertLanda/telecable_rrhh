// ============================================================
// VIEW: Departamentos
// ============================================================

function renderDepartamentos() {
    const deptIcons = ['monitor', 'trending-up', 'calculator', 'package', 'megaphone', 'heart-handshake'];
    const cards = MOCK.departamentos.map((d, i) => {
        const emps = MOCK.empleados.filter(e => e.deptId === d.id);
        return `
    <div class="dept-card" onclick="openDeptDetail(${d.id})">
      <div class="dept-icon-wrap" style="background:${d.color}20">
        <i data-lucide="${deptIcons[i]}" style="width:22px;height:22px;color:${d.color}"></i>
      </div>
      <div class="dept-name">${d.nombre}</div>
      <div class="dept-desc">${d.desc}</div>
      <div class="dept-meta">
        <div class="dept-count"><i data-lucide="users" style="width:13px;height:13px"></i> ${d.count} colaboradores</div>
        <div class="dept-jefe" style="color:${d.color}">${d.jefe}</div>
      </div>
    </div>`;
    }).join('');

    return `
  <div class="view-header">
    <div class="view-header-left"><h1>Departamentos</h1><p>${MOCK.departamentos.length} áreas organizacionales</p></div>
    <div class="view-header-actions">
      <button class="btn btn-primary"><i data-lucide="plus" style="width:15px;height:15px"></i> Nuevo Departamento</button>
    </div>
  </div>

  <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:20px">
    <div class="stat-card">
      <div class="stat-icon indigo"><i data-lucide="building-2" style="width:22px;height:22px"></i></div>
      <div><div class="stat-number">${MOCK.departamentos.length}</div><div class="stat-label">Departamentos</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon green"><i data-lucide="users" style="width:22px;height:22px"></i></div>
      <div><div class="stat-number">${MOCK.empleados.length}</div><div class="stat-label">Total Empleados</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon amber"><i data-lucide="briefcase" style="width:22px;height:22px"></i></div>
      <div><div class="stat-number">${MOCK.puestos.length}</div><div class="stat-label">Puestos Registrados</div></div>
    </div>
  </div>

  <div class="dept-grid">${cards}</div>`;
}

function initDepartamentos() { }

window.openDeptDetail = function (id) {
    const dept = MOCK.departamentos.find(d => d.id === id);
    const emps = MOCK.empleados.filter(e => e.deptId === id);

    const empRows = emps.map(e => {
        const puesto = getPuesto(e.puestoId);
        return `<tr style="cursor:pointer" onclick="closeModal();navigate('empleados');setTimeout(()=>openEmpDetail(${e.id}),300)">
      <td><div class="td-user">
        <div class="td-avatar ${avatarColor(e.id)}">${empInitials(e)}</div>
        <div><div class="td-name">${empFullName(e)}</div><div class="td-sub">${e.email}</div></div>
      </div></td>
      <td>${puesto?.nombre || '—'}</td>
      <td>${fmtSoles(e.sueldo)}</td>
      <td><span class="badge ${estadoBadge(e.estado)} badge-dot">${e.estado}</span></td>
    </tr>`;
    }).join('');

    openModal(`
  <div class="modal-overlay">
    <div class="modal modal-lg">
      <div class="modal-header">
        <div>
          <h3>${dept.nombre}</h3>
          <div class="td-sub">${dept.desc}</div>
        </div>
        <button class="modal-close" onclick="closeModal()"><i data-lucide="x" style="width:14px;height:14px"></i></button>
      </div>
      <div class="modal-body">
        <div class="grid-2" style="gap:10px;margin-bottom:18px">
          <div class="info-row"><span class="info-row-label">Jefe de Área</span><span class="info-row-value fw-700">${dept.jefe}</span></div>
          <div class="info-row"><span class="info-row-label">Total Colaboradores</span><span class="info-row-value fw-700">${dept.count}</span></div>
        </div>
        <div class="section-label">Colaboradores del Departamento</div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Empleado</th><th>Puesto</th><th>Sueldo</th><th>Estado</th></tr></thead>
            <tbody>${empRows}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cerrar</button>
        <button class="btn btn-primary"><i data-lucide="edit" style="width:14px;height:14px"></i> Editar</button>
      </div>
    </div>
  </div>`);
};
