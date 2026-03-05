// ============================================================
// VIEW: Departamentos
// ============================================================

// Le agregamos window. para que app.js lo encuentre sin crashear
window.renderDepartamentos = function() {
    const deptIcons = ['monitor', 'trending-up', 'calculator', 'package', 'megaphone', 'heart-handshake'];
    const cards = MOCK.departamentos.map((d, i) => {
        // Vincula empleados por id
        const emps = MOCK.empleados.filter(e => String(e.deptId) === String(d.id));
        return `
    <div class="dept-card" onclick="openDeptDetail(${d.id})">
      <div class="dept-icon-wrap" style="background:${d.color}20">
        <i data-lucide="${deptIcons[i % deptIcons.length]}" style="width:22px;height:22px;color:${d.color}"></i>
      </div>
      <div class="dept-name">${d.nombre}</div>
      <div class="dept-desc">${d.desc || 'Sin descripción'}</div>
      <div class="dept-meta">
        <div class="dept-count"><i data-lucide="users" style="width:13px;height:13px"></i> ${emps.length} colaboradores</div>
        <div class="dept-jefe" style="color:${d.color}">${d.jefe || 'Sin jefe'}</div>
      </div>
    </div>`;
    }).join('');

    return `
  <div class="view-header">
    <div class="view-header-left"><h1>Departamentos</h1><p>${MOCK.departamentos.length} áreas organizacionales</p></div>
    <div class="view-header-actions">
      <button class="btn btn-primary" onclick="openNewDeptModal()"><i data-lucide="plus" style="width:15px;height:15px"></i> Nuevo Departamento</button>
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
};

// También globalizamos esta para evitar errores
window.initDepartamentos = function() { };

window.openDeptDetail = function (id) {
    const dept = MOCK.departamentos.find(d => String(d.id) === String(id));
    const emps = MOCK.empleados.filter(e => String(e.deptId) === String(id));

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
          <div class="td-sub">${dept.desc || ''}</div>
        </div>
        <button class="modal-close" onclick="closeModal()"><i data-lucide="x" style="width:14px;height:14px"></i></button>
      </div>
      <div class="modal-body">
        <div class="grid-2" style="gap:10px;margin-bottom:18px">
          <div class="info-row"><span class="info-row-label">Jefe de Área</span><span class="info-row-value fw-700">${dept.jefe || 'N/A'}</span></div>
          <div class="info-row"><span class="info-row-label">Total Colaboradores</span><span class="info-row-value fw-700">${emps.length}</span></div>
        </div>
        <div class="section-label">Colaboradores del Departamento</div>
        <div class="table-wrap">
          <table>
            <thead><tr><th>Empleado</th><th>Puesto</th><th>Sueldo</th><th>Estado</th></tr></thead>
            <tbody>${emps.length > 0 ? empRows : '<tr><td colspan="4" style="text-align:center;padding:20px;">Sin empleados</td></tr>'}</tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cerrar</button>
      </div>
    </div>
  </div>`);
};

window.openNewDeptModal = function () {
    openModal(`
    <div class="modal-overlay" style="z-index: 9999;">
        <div class="modal" style="max-width: 500px; padding:20px;">
            <div class="modal-header">
                <h3>Nuevo Departamento</h3>
                <button class="modal-close" onclick="closeModal()"><i data-lucide="x" style="width:14px;height:14px"></i></button>
            </div>
            <div class="modal-body" style="padding-top:15px;">
                <div class="form-grid">
                    <div class="field form-full"><label>Nombre del Área *</label><input type="text" id="ndNombre" placeholder="Ej: Soporte Técnico"></div>
                    <div class="field form-full"><label>Descripción corta</label><input type="text" id="ndDesc" placeholder="Breve descripción..."></div>
                    <div class="field form-full"><label>Nombre del Jefe/Encargado</label><input type="text" id="ndJefe" placeholder="Ej: Albert Landa"></div>
                    <div class="field form-full"><label>Color Identificador</label><input type="color" id="ndColor" value="#3b82f6" style="height: 40px; padding: 2px; width: 100%;"></div>
                </div>
            </div>
            <div class="modal-footer" style="margin-top:20px;">
                <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
                <button class="btn btn-primary" id="btnGuardarDept" onclick="saveNewDept()"><i data-lucide="save" style="width:14px;height:14px"></i> Guardar Área</button>
            </div>
        </div>
    </div>`);
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.saveNewDept = async function () {
    const data = {
        nombre: document.getElementById('ndNombre').value,
        descripcion: document.getElementById('ndDesc').value,
        jefe_nombre: document.getElementById('ndJefe').value,
        color: document.getElementById('ndColor').value
    };

    if(!data.nombre) return alert("El nombre del área es obligatorio");

    const btn = document.getElementById('btnGuardarDept');
    btn.innerHTML = `Guardando...`; btn.disabled = true;

    const csrf = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';

    try {
        const response = await fetch('/api/departamentos/crear/', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf }, 
            body: JSON.stringify(data) 
        });
        
        // --- BLINDAJE ANTI-CRASHEOS ---
        const text = await response.text(); 
        let result;
        try {
            result = JSON.parse(text); 
        } catch(err) {
            console.error("Django arrojó un error que no es JSON:", text);
            alert("Error en el servidor Django (Revisa la consola F12 para ver el error completo).");
            btn.innerHTML = `Guardar Área`; btn.disabled = false;
            return;
        }
        // ------------------------------
        
        if(response.ok || result.success) {
            closeModal();
            window.location.reload(); // Recarga y pinta tu nuevo dato MOCK instantáneamente
        } else {
            alert("Error al crear: " + (result.message || ""));
            btn.innerHTML = `Guardar Área`; btn.disabled = false;
        }
    } catch (e) {
        console.error(e);
        alert("Error de red o servidor apagado.");
        btn.innerHTML = `Guardar Área`; btn.disabled = false;
    }
};