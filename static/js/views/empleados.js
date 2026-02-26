// ============================================================
// VIEW: Empleados
// ============================================================

let empFilter = { search: '', dept: '', estado: '', empresa: '' };
let empViewMode = 'list';

function renderEmpleados() {
  const deptOptions = MOCK.departamentos.map(d => `<option value="${d.id}">${d.nombre}</option>`).join('');
  const empresaOptions = MOCK.empresas.map(e => `<option value="${e.id}">${e.nombre}</option>`).join(''); // <-- Lista de Razones Sociales

  // Filtramos para contar cuántos hay en esta Sede
  const empsEnSede = MOCK.empleados.filter(e => e.sedeId === currentSedeId);

  return `
  <div class="view-header">
    <div class="view-header-left">
      <h1>Empleados</h1>
      <p>${empsEnSede.length} colaboradores en esta sede</p>
    </div>
    <div class="view-header-actions">
      <button class="btn btn-ghost" onclick="exportarEmpleadosExcel()"><i data-lucide="download" style="width:15px;height:15px"></i> Exportar</button>
      <button class="btn btn-primary" onclick="openNewEmpModal()"><i data-lucide="user-plus" style="width:15px;height:15px"></i> Nuevo Empleado</button>
    </div>
  </div>

  <div class="toolbar">
    <div class="toolbar-left">
      <div class="search-box">
        <i data-lucide="search" class="search-box-icon" style="width:15px;height:15px"></i>
        <input type="text" id="empSearch" placeholder="Buscar por nombre, código, DNI..." oninput="filterEmpleados()">
      </div>
      <select class="filter-select" id="empEmpresa" onchange="filterEmpleados()">
        <option value="">Todas las Razones Sociales</option>${empresaOptions}
      </select>
      
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

function setView(mode) {
  empViewMode = mode;
  filterEmpleados();
}

function filterEmpleados() {
  const q = (document.getElementById('empSearch')?.value || '').toLowerCase();
  const dept = document.getElementById('empDept')?.value || '';
  const est = document.getElementById('empEstado')?.value || '';
  const emp = document.getElementById('empEmpresa')?.value || ''; // Leemos el filtro de empresa

  let list = MOCK.empleados.filter(e => {
    const matchSede = e.sedeId === currentSedeId; // Solo los de la sede actual
    const matchQ = !q || empFullName(e).toLowerCase().includes(q) || e.codigo.toLowerCase().includes(q) || e.dni.includes(q) || e.email.toLowerCase().includes(q);
    const matchD = !dept || e.deptId == dept;
    const matchE = !est || e.estado === est;
    const matchEmpresa = !emp || e.empresaId == emp; // Validamos la empresa
    
    return matchSede && matchQ && matchD && matchE && matchEmpresa;
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
    <div class="emp-card-dept" style="margin-bottom:4px;"><i data-lucide="building-2" style="width:12px;height:12px;display:inline;margin-right:3px"></i>${dept?.nombre || '—'}</div>
    <div style="font-size:0.7rem; color:var(--primary); font-weight:600; margin-bottom:10px;">${emp.empresaNombre || 'Sin Empresa'}</div>
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
      <td>
        <div style="font-weight:600; font-size:0.8rem; color:var(--text-primary);">${emp.empresaNombre || '—'}</div>
        <div style="font-size:0.75rem; color:var(--text-muted);">${dept?.nombre || '—'}</div>
      </td>
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
  
  if(list.length === 0) {
      return `<div class="empty-state" style="padding:40px;"><p>No se encontraron empleados con estos filtros.</p></div>`;
  }
  
  return `<table>
    <thead><tr><th>Empleado</th><th>Razón Social / Área</th><th>Puesto</th><th>Contrato</th><th>Ingreso</th><th>Sueldo</th><th>Estado</th><th></th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

// ============================================================
// FUNCIONES DE ACCIÓN (Exportar, Detalles, Crear)
// ============================================================

window.exportarEmpleadosExcel = function() {
    // Tomamos a los empleados de la sede actual
    const empsEnSede = MOCK.empleados.filter(e => e.sedeId === currentSedeId);
    
    if(empsEnSede.length === 0) {
        alert("No hay empleados para exportar en esta sede.");
        return;
    }

    // 1. Preparamos los datos en formato JSON para la librería
    const dataAExportar = empsEnSede.map(e => ({
        "Código": e.codigo,
        "Nombres": e.nombres,
        "Apellidos": e.apellidos,
        "DNI": e.dni,
        "Email Corporativo": e.email,
        "Teléfono": e.tel || "No registrado",
        "Razón Social": e.empresaNombre || "Sin empresa",
        "Departamento": getDept(e.deptId)?.nombre || "Sin área",
        "Puesto": getPuesto(e.puestoId)?.nombre || "Sin puesto",
        "Tipo Contrato": e.contrato,
        "Sueldo Base (S/)": e.sueldo,
        "Sistema Pensión": e.afp || "No aplica",
        "Estado": e.estado,
        "Fecha de Ingreso": e.ingreso
    }));

    // 2. Creamos el libro de Excel (Workbook) y la Hoja (Worksheet)
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataAExportar);

    // 3. Ajustamos el ancho de las columnas para que se vea hermoso
    const anchosColumnas = [
        { wch: 12 }, { wch: 20 }, { wch: 25 }, { wch: 12 }, { wch: 30 }, 
        { wch: 15 }, { wch: 35 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, 
        { wch: 15 }, { wch: 18 }, { wch: 12 }, { wch: 18 }
    ];
    ws['!cols'] = anchosColumnas;

    // 4. Añadimos la hoja al libro
    XLSX.utils.book_append_sheet(wb, ws, "Empleados_Activos");

    // 5. Descargamos el archivo como Excel real (.xlsx)
    const nombreSede = MOCK.sedes.find(s => s.id === currentSedeId)?.nombre || "Sede";
    const nombreArchivo = `Reporte_Empleados_${nombreSede.replace(/ /g, '_')}.xlsx`;
    
    XLSX.writeFile(wb, nombreArchivo);
};

window.openEmpDetail = function (id) {
  const emp = getEmp(id);
  const dept = getDept(emp.deptId);
  const puesto = getPuesto(emp.puestoId);
  const docs = MOCK.documentos ? MOCK.documentos.filter(d => d.empId === id) : [];
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
            <div class="info-row"><span class="info-row-label">Departamento</span><span class="info-row-value">${dept?.nombre || '—'}</span></div>
            <div class="info-row"><span class="info-row-label">Puesto</span><span class="info-row-value">${puesto?.nombre || '—'}</span></div>
            <div class="info-row"><span class="info-row-label">Fecha Ingreso</span><span class="info-row-value">${fmtDate(emp.ingreso)}</span></div></div>
          </div>
        </div>
        <div id="tab-contrato" style="display:none">
          <div class="grid-2" style="gap:12px;margin-bottom:16px">
            <div class="info-row form-full"><span class="info-row-label">Razón Social</span><span class="info-row-value fw-700" style="color:var(--primary)">${emp.empresaNombre || 'No asignada'}</span></div>
            <div class="info-row"><span class="info-row-label">Tipo Contrato</span><span class="info-row-value"><span class="badge badge-indigo">${emp.contrato}</span></span></div>
            <div class="info-row"><span class="info-row-label">Sistema Pensión</span><span class="info-row-value">${emp.afp}</span></div>
          </div>
          <div class="card" style="background:var(--gray-50)">
            <div class="card-body">
              <div class="section-label">Detalle de Remuneración</div>
              
              ${(emp.contrato === 'Recibo por Honorarios' || emp.contrato === 'Practicante') ? `
                  <div class="info-row between"><span>Monto Acordado (Bruto)</span><span class="fw-700">${fmtSoles(p.bruto)}</span></div>
                  <div class="info-row between"><span style="color:var(--text-muted)">Descuentos / Retenciones</span><span style="color:var(--text-muted)">- ${fmtSoles(0)}</span></div>
                  <div class="divider"></div>
                  <div class="info-row between"><span class="fw-700" style="color:var(--success)">Neto a Pagar</span><span class="fw-700" style="color:var(--success);font-size:1.1rem">${fmtSoles(p.neto)}</span></div>
              ` : `
                  <div class="info-row between"><span>Sueldo Base</span><span class="fw-700">${fmtSoles(p.bruto)}</span></div>
                  <div class="info-row between"><span>Asignación Familiar</span><span>${fmtSoles(p.asigFam)}</span></div>
                  <div class="info-row between"><span class="fw-700">Sueldo Bruto</span><span class="fw-700">${fmtSoles(p.brutoTotal)}</span></div>
                  <div class="divider"></div>
                  <div class="info-row between"><span style="color:var(--danger)">${p.afpLabel} (descuento)</span><span style="color:var(--danger)">- ${fmtSoles(p.afpMonto)}</span></div>
                  <div class="info-row between"><span style="color:var(--warning)">EsSalud 9% (cargo empleador)</span><span style="color:var(--warning)">${fmtSoles(p.essalud)}</span></div>
                  <div class="divider"></div>
                  <div class="info-row between"><span class="fw-700" style="color:var(--success)">Sueldo Neto Aprox.</span><span class="fw-700" style="color:var(--success);font-size:1.1rem">${fmtSoles(p.neto)}</span></div>
              `}
              
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
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cerrar</button>
        <button class="btn btn-primary"><i data-lucide="edit" style="width:14px;height:14px"></i> Editar en Panel</button>
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
  const empresaOptions = MOCK.empresas.map(e => `<option value="${e.id}" data-ruc="${e.ruc}">${e.nombre}</option>`).join('');
  const sedeOptions = MOCK.sedes.map(s => `<option value="${s.id}">${s.nombre}</option>`).join('');
  
  // Armamos los puestos indicando su departamento al lado para que sea fácil elegir
  const puestoOptions = MOCK.puestos.map(p => {
      const dName = MOCK.departamentos.find(d => d.id === p.deptId)?.nombre || '';
      return `<option value="${p.id}">${p.nombre} (${dName})</option>`;
  }).join('');

  openModal(`
  <div class="modal-overlay">
    <div class="modal modal-lg">
      <div class="modal-header">
        <h3>Nuevo Empleado</h3>
        <button class="modal-close" onclick="closeModal()"><i data-lucide="x" style="width:14px;height:14px"></i></button>
      </div>
      <div class="modal-body" style="padding-top: 15px;">
        
        <div class="section-label">1. Datos Corporativos</div>
        <div class="form-grid" style="margin-bottom:24px;">
          <div class="field">
            <label>Razón Social (Empresa) *</label>
            <select id="neEmpresa" onchange="document.getElementById('newEmpRuc').value = this.options[this.selectedIndex].dataset.ruc || ''">
              <option value="" data-ruc="">Seleccionar Razón...</option>${empresaOptions}
            </select>
          </div>
          <div class="field">
            <label>RUC</label>
            <input type="text" id="newEmpRuc" readonly style="background:var(--gray-100); color:var(--text-muted); font-weight:600;" placeholder="Autocompletado">
          </div>
          <div class="field">
            <label>Sede (Local de Trabajo) *</label>
            <select id="neSede">
              <option value="">Seleccionar Sede...</option>${sedeOptions}
            </select>
          </div>
          <div class="field"><label>Departamento *</label><select id="neDept"><option value="">Seleccionar...</option>${deptOptions}</select></div>
          <div class="field form-full"><label>Puesto / Cargo *</label><select id="nePuesto"><option value="">Seleccionar Puesto...</option>${puestoOptions}</select></div>
          <div class="field form-full"><label>Email corporativo *</label><input type="email" id="neEmail" placeholder="nombre@telecable.pe"></div>
        </div>

        <div class="section-label">2. Datos Personales</div>
        <div class="form-grid" style="margin-bottom:24px;">
          <div class="field"><label>Nombres *</label><input type="text" id="neNombres" placeholder="Ej: Juan Carlos"></div>
          <div class="field"><label>Apellidos *</label><input type="text" id="neApellidos" placeholder="Ej: Pérez López"></div>
          <div class="field"><label>DNI *</label><input type="text" id="neDni" placeholder="12345678" maxlength="8"></div>
          <div class="field"><label>Teléfono</label><input type="text" id="neTel" placeholder="9XXXXXXXX"></div>
          <div class="field form-full"><label>Fecha de Nacimiento</label><input type="date" id="neNacimiento"></div>
        </div>

        <div class="section-label">3. Contrato y Planilla</div>
        <div class="form-grid">
          <div class="field"><label>Fecha de Ingreso *</label><input type="date" id="neIngreso"></div>
          <div class="field"><label>Tipo de Contrato *</label>
            <select id="neContrato"><option value="Indefinido">Indefinido</option><option value="Plazo Fijo">Plazo Fijo</option><option value="Practicante">Practicante</option><option value="Recibo por Honorarios">Recibo por Honorarios</option></select>
          </div>
          <div class="field"><label>Sueldo Base (S/) *</label><input type="number" id="neSueldo" placeholder="1025" min="0"></div>
          <div class="field"><label>Sistema de Pensión *</label>
            <select id="neAfp"><option value="ONP">ONP</option><option value="Prima AFP">Prima AFP</option><option value="Integra">Integra</option><option value="Hábitat">Hábitat</option><option value="Profuturo">Profuturo</option></select>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" id="btnGuardarEmp" onclick="saveNewEmp()"><i data-lucide="save" style="width:14px;height:14px"></i> Guardar Empleado</button>
      </div>
    </div>
  </div>`);
};

window.saveNewEmp = async function () {
    const btn = document.getElementById('btnGuardarEmp');
    const originalHTML = btn.innerHTML;
    
    // Recolectar datos
    const data = {
        empresa_id: document.getElementById('neEmpresa').value,
        sede_id: document.getElementById('neSede').value,
        dept_id: document.getElementById('neDept').value,
        puesto_id: document.getElementById('nePuesto').value, // <-- NUEVO CAMPO AÑADIDO
        email: document.getElementById('neEmail').value,
        nombres: document.getElementById('neNombres').value,
        apellidos: document.getElementById('neApellidos').value,
        dni: document.getElementById('neDni').value,
        telefono: document.getElementById('neTel').value,
        nacimiento: document.getElementById('neNacimiento').value, // <-- NUEVO CAMPO AÑADIDO
        ingreso: document.getElementById('neIngreso').value,
        contrato: document.getElementById('neContrato').value,
        sueldo: document.getElementById('neSueldo').value,
        afp: document.getElementById('neAfp').value
    };

    // Validar requeridos
    if(!data.empresa_id || !data.sede_id || !data.dept_id || !data.puesto_id || !data.nombres || !data.apellidos || !data.dni || !data.sueldo) {
        alert("⚠️ Por favor completa todos los campos con asterisco (*).");
        return;
    }

    btn.innerHTML = `<i data-lucide="loader-2" class="lucide-spin" style="width:14px;height:14px"></i> Procesando...`;
    lucide.createIcons();
    btn.disabled = true;

    const csrf = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';

    try {
        const response = await fetch('/api/empleados/crear/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if(result.success) {
            closeModal(); // Cerramos el formulario
            
            // ABRIMOS EL MODAL DE ÉXITO ESTILO ENTERPRISE 😎
            setTimeout(() => {
                openModal(`
                  <div class="modal-overlay">
                    <div class="modal" style="max-width: 380px; text-align: center; padding: 40px 20px;">
                        <div style="width: 70px; height: 70px; background: var(--success-50); color: var(--success); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                            <i data-lucide="check" style="width: 36px; height: 36px;"></i>
                        </div>
                        <h3 style="font-size: 1.4rem; margin-bottom: 10px; font-weight: 800;">¡Registro Exitoso!</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 25px; line-height: 1.5;">El empleado <strong>${data.nombres}</strong> ha sido guardado correctamente en la base de datos.</p>
                        <button class="btn btn-primary" style="width: 100%; justify-content: center; padding: 14px;" onclick="window.location.reload();">Continuar</button>
                    </div>
                  </div>
                `);
            }, 100);
            
        } else {
            alert("❌ Error: " + result.message);
            btn.innerHTML = originalHTML;
            lucide.createIcons();
            btn.disabled = false;
        }
    } catch (e) {
        alert("❌ Error de conexión al servidor.");
        btn.innerHTML = originalHTML;
        lucide.createIcons();
        btn.disabled = false;
    }
};