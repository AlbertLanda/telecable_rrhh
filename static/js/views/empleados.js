// ============================================================
// VIEW: Empleados (Conectado a PostgreSQL vía Django API)
// Ruta: static/js/views/empleados.js
// ============================================================

let empFilter = { search: '', dept: '', estado: '', empresa: '' };
let empViewMode = 'list';

let dbEmpleados = [];
let dbDepartamentos = [];
let dbEmpresas = [];
let dbSedes = [];
let dbPuestos = [];

// ============================================================
// SISTEMA DE ALERTAS PERSONALIZADAS (TOASTS)
// ============================================================
window.showSystemToast = function(mensaje, tipo = 'error') {
    const toast = document.createElement('div');
    let bg = tipo === 'error' ? '#ef4444' : (tipo === 'warning' ? '#f59e0b' : '#10b981');
    let icon = tipo === 'error' ? 'x-circle' : (tipo === 'warning' ? 'alert-triangle' : 'check-circle');
    
    toast.style.cssText = `
        position: fixed; top: 24px; right: 24px;
        background: ${bg}; color: white;
        padding: 14px 24px; border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
        z-index: 999999; font-weight: 500; font-size: 0.9rem;
        display: flex; align-items: center; gap: 12px;
        transform: translateX(120%); transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;
    toast.innerHTML = `<i data-lucide="${icon}" style="width:20px;height:20px"></i> <span>${mensaje}</span>`;
    document.body.appendChild(toast);
    if(typeof lucide !== 'undefined') lucide.createIcons({root: toast});
    
    requestAnimationFrame(() => { toast.style.transform = 'translateX(0)'; });
    
    setTimeout(() => {
        toast.style.transform = 'translateX(120%)';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
};

// ============================================================
// CARGA DE DATOS Y AUTO-ARRANQUE
// ============================================================
async function cargarDatosDeDB() {
  try {
    const [resEmp, resDept, resEmpresa, resSede, resPuesto] = await Promise.all([
      fetch('/api/empleados/listar/'),
      fetch('/api/departamentos/listar/'),
      fetch('/api/empresas/listar/'),
      fetch('/api/sedes/listar/'),
      fetch('/api/puestos/listar/')
    ]);

    dbEmpleados = await resEmp.json();
    if(dbEmpleados.data) dbEmpleados = dbEmpleados.data;

    dbDepartamentos = await resDept.json();
    if(dbDepartamentos.data) dbDepartamentos = dbDepartamentos.data;

    dbEmpresas = await resEmpresa.json();
    if(dbEmpresas.data) dbEmpresas = dbEmpresas.data;

    dbSedes = await resSede.json();
    if(dbSedes.data) dbSedes = dbSedes.data;

    dbPuestos = await resPuesto.json();
    if(dbPuestos.data) dbPuestos = dbPuestos.data;

  } catch (error) {
    console.error("Error conectando a PostgreSQL:", error);
    showSystemToast("Error al conectar con la base de datos.", "error");
  }
}

async function initEmpleados() {
  const container = document.getElementById('empContainer');
  
  // Solo mostramos el loader y recargamos si no hay datos cargados aún
  if (dbEmpleados.length === 0) {
      if (container) {
          container.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--text-muted);">
              <i data-lucide="loader-2" class="lucide-spin" style="width:30px;height:30px;margin-bottom:10px;"></i>
              <p>Conectando a la base de datos...</p>
          </div>`;
          if(typeof lucide !== 'undefined') lucide.createIcons();
      }
      await cargarDatosDeDB();
  }
  
  filterEmpleados();
}

window.renderEmpleados = function() {
  // 🔥 AUTO-ARRANQUE: Lanzamos la conexión a BD apenas se dibuja la pantalla
  setTimeout(() => {
      initEmpleados();
  }, 50);

  return `
  <div class="view-header" style="animation: fadeIn 0.4s ease-out;">
    <div class="view-header-left">
      <h1>Empleados</h1>
      <p id="contador-empleados">Cargando colaboradores...</p>
    </div>
    <div class="view-header-actions">
      <button class="btn btn-ghost" onclick="exportarEmpleadosExcel()"><i data-lucide="download" style="width:15px;height:15px"></i> Exportar</button>
    </div>
  </div>

  <div class="toolbar" style="animation: fadeIn 0.4s ease-out;">
    <div class="toolbar-left">
      <div class="search-box">
        <i data-lucide="search" class="search-box-icon" style="width:15px;height:15px"></i>
        <input type="text" id="empSearch" placeholder="Buscar por nombre, código, DNI..." oninput="filterEmpleados()">
      </div>
      <select class="filter-select" id="empEmpresa" onchange="filterEmpleados()">
        <option value="">Todas las Razones Sociales</option>
        ${dbEmpresas.map(e => `<option value="${e.id}">${e.razon_social || e.nombre}</option>`).join('')}
      </select>
      
      <select class="filter-select" id="empDept" onchange="filterEmpleados()">
        <option value="">Todos los departamentos</option>
        ${dbDepartamentos.map(d => `<option value="${d.id}">${d.nombre}</option>`).join('')}
      </select>
      <select class="filter-select" id="empEstado" onchange="filterEmpleados()">
        <option value="">Todos los estados</option>
        <option value="Activo">Activo</option>
        <option value="En Vacaciones">En Vacaciones</option>
        <option value="Suspendido">Suspendido</option>
        <option value="Cesado">Cesado</option>
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

  <div id="empContainer" style="animation: fadeIn 0.4s ease-out;"></div>`;
}

window.setView = function(mode) {
  empViewMode = mode;
  filterEmpleados();
}

window.filterEmpleados = function() {
  const q = (document.getElementById('empSearch')?.value || '').toLowerCase();
  const dept = document.getElementById('empDept')?.value || '';
  const est = document.getElementById('empEstado')?.value || '';
  const empFiltro = document.getElementById('empEmpresa')?.value || '';

  let list = dbEmpleados.filter(e => {
    // 🔥 1. CORRECCIÓN DEL SALVAVIDAS DE LA SEDE:
    const empSede = e.sede_id || e.sede;
    const matchSede = !empSede || String(empSede) === String(window.currentSedeId);
    
    // 🔥 2. BÚSQUEDA MÁS SEGURA
    const fullName = `${e.nombres || ''} ${e.apellidos || ''}`.toLowerCase();
    
    const matchQ = !q || fullName.includes(q) || 
                   (e.codigo || '').toLowerCase().includes(q) || 
                   (e.dni || '').includes(q) || 
                   (e.email || '').toLowerCase().includes(q);
                   
    const matchD = !dept || String(e.departamento_id || e.departamento) === dept;
    const matchE = !est || e.estado === est;
    const matchEmpresa = !empFiltro || String(e.empresa_id || e.empresa) === empFiltro;
    
    return matchSede && matchQ && matchD && matchE && matchEmpresa;
  });

  const container = document.getElementById('empContainer');
  const contador = document.getElementById('contador-empleados');
  
  if (contador) contador.innerText = `${list.length} colaboradores en esta sede`;

  if (!container) return;

  if (empViewMode === 'grid') {
    container.innerHTML = `<div class="emp-grid">${list.map(empCard).join('')}</div>`;
  } else {
    container.innerHTML = `<div class="card"><div class="table-wrap">${empTable(list)}</div></div>`;
  }
  
  if(typeof lucide !== 'undefined') lucide.createIcons();
}

// ----------------------------------------------------
// TARJETAS Y TABLAS
// ----------------------------------------------------
function estadoBadge(estado) {
    if(estado === 'Cesado' || estado === 'Suspendido') return 'badge-red';
    if(estado === 'En Vacaciones') return 'badge-amber';
    return 'badge-green';
}

function empCard(emp) {
  const dept = dbDepartamentos.find(d => String(d.id) === String(emp.departamento_id || emp.departamento));
  const puesto = dbPuestos.find(p => String(p.id) === String(emp.puesto_id || emp.puesto));
  const empresa = dbEmpresas.find(e => String(e.id) === String(emp.empresa_id || emp.empresa));
  
  return `<div class="emp-card" onclick="openEmpDetail(${emp.id})">
    <div class="emp-card-avatar bg-indigo-100 text-indigo-700" style="background:${emp.avatar_color || '#e0e7ff'}">${(emp.nombres || 'X').charAt(0)}${(emp.apellidos || 'X').charAt(0)}</div>
    <div class="emp-card-name">${emp.nombres} ${emp.apellidos}</div>
    <div class="emp-card-pos">${puesto?.nombre || '—'}</div>
    <div class="emp-card-dept" style="margin-bottom:4px;"><i data-lucide="building-2" style="width:12px;height:12px;display:inline;margin-right:3px"></i>${dept?.nombre || '—'}</div>
    <div style="font-size:0.7rem; color:var(--primary); font-weight:600; margin-bottom:10px;">${empresa?.razon_social || empresa?.nombre || 'Sin Empresa'}</div>
    <span class="badge ${estadoBadge(emp.estado)} badge-dot">${emp.estado || 'Activo'}</span>
  </div>`;
}

function empTable(list) {
  const rows = list.map(emp => {
    const dept = dbDepartamentos.find(d => String(d.id) === String(emp.departamento_id || emp.departamento));
    const puesto = dbPuestos.find(p => String(p.id) === String(emp.puesto_id || emp.puesto));
    const empresa = dbEmpresas.find(e => String(e.id) === String(emp.empresa_id || emp.empresa));
    
    return `<tr style="cursor:pointer" onclick="openEmpDetail(${emp.id})">
      <td><div class="td-user">
        <div class="td-avatar bg-indigo-100 text-indigo-700" style="background:${emp.avatar_color || '#e0e7ff'}">${(emp.nombres || 'X').charAt(0)}${(emp.apellidos || 'X').charAt(0)}</div>
        <div><div class="td-name">${emp.nombres} ${emp.apellidos}</div><div class="td-sub">${emp.codigo || 'S/C'} · ${emp.email || '—'}</div></div>
      </div></td>
      <td>
        <div style="font-weight:600; font-size:0.8rem; color:var(--text-primary);">${empresa?.razon_social || empresa?.nombre || '—'}</div>
        <div style="font-size:0.75rem; color:var(--text-muted);">${dept?.nombre || '—'}</div>
      </td>
      <td>${puesto?.nombre || '—'}</td>
      <td><span class="badge badge-gray">${emp.tipo_contrato || '—'}</span></td>
      <td>${emp.fecha_ingreso || '—'}</td>
      <td style="font-weight:600;">S/ ${emp.sueldo_base ? parseFloat(emp.sueldo_base).toFixed(2) : '0.00'}</td>
      <td><span class="badge ${estadoBadge(emp.estado)} badge-dot">${emp.estado || 'Activo'}</span></td>
      <td onclick="event.stopPropagation()">
        <button class="btn btn-ghost btn-sm" onclick="openEmpDetail(${emp.id})"><i data-lucide="eye" style="width:14px;height:14px; color:#3b82f6;"></i></button>
      </td>
    </tr>`;
  }).join('');
  
  if(list.length === 0) return `<div class="empty-state" style="padding:40px;text-align:center;"><p>No se encontraron empleados en esta sede con los filtros actuales.</p></div>`;
  
  return `<table>
    <thead><tr><th>Empleado</th><th>Razón Social / Área</th><th>Puesto</th><th>Contrato</th><th>Ingreso</th><th>Sueldo</th><th>Estado</th><th></th></tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

// ----------------------------------------------------
// EXPORTAR, VER DETALLE, EDITAR, DESHABILITAR
// ----------------------------------------------------

window.exportarEmpleadosExcel = function() {
    const empsEnSede = dbEmpleados.filter(e => !e.sede_id || String(e.sede_id || e.sede) === String(window.currentSedeId));
    if(empsEnSede.length === 0) return showSystemToast("No hay empleados para exportar.", "warning");

    const dataAExportar = empsEnSede.map(e => {
        const dept = dbDepartamentos.find(d => String(d.id) === String(e.departamento_id || e.departamento));
        const puesto = dbPuestos.find(p => String(p.id) === String(e.puesto_id || e.puesto));
        const empresa = dbEmpresas.find(emp => String(emp.id) === String(e.empresa_id || e.empresa));

        return {
            "Código": e.codigo || 'S/C', "Nombres": e.nombres, "Apellidos": e.apellidos, "DNI": e.dni,
            "Género": e.genero === 'M' ? 'Masculino' : 'Femenino', "Email Corporativo": e.email,
            "Teléfono": e.telefono || e.tel || "No registrado", "Razón Social": empresa?.razon_social || empresa?.nombre || "Sin empresa",
            "Departamento": dept?.nombre || "Sin área", "Puesto": puesto?.nombre || "Sin puesto",
            "Tipo Contrato": e.tipo_contrato, "Sueldo Base (S/)": e.sueldo_base, "Sistema Pensión": e.afp_onp || "No aplica",
            "Estado": e.estado, "Fecha de Ingreso": e.fecha_ingreso
        };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(dataAExportar);
    ws['!cols'] = [{ wch: 12 }, { wch: 20 }, { wch: 25 }, { wch: 12 }, { wch: 12 }, { wch: 30 }, { wch: 15 }, { wch: 35 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 18 }, { wch: 12 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, "Empleados_BD");
    const sedeActual = dbSedes.find(s => String(s.id) === String(window.currentSedeId))?.nombre || "Sede";
    XLSX.writeFile(wb, `Reporte_Telecable_${sedeActual.replace(/ /g, '_')}.xlsx`);
};

window.openEmpDetail = function (id) {
  const emp = dbEmpleados.find(e => String(e.id) === String(id));
  if(!emp) return;

  const dept = dbDepartamentos.find(d => String(d.id) === String(emp.departamento_id || emp.departamento));
  const puesto = dbPuestos.find(p => String(p.id) === String(emp.puesto_id || emp.puesto));
  const empresa = dbEmpresas.find(e => String(e.id) === String(emp.empresa_id || emp.empresa));
  const tel = emp.telefono || emp.tel || '—';

  openModal(`
  <div class="modal-overlay">
    <div class="modal modal-lg">
      <div class="modal-header">
        <div style="display:flex;align-items:center;gap:12px">
          <div class="td-avatar bg-indigo-100 text-indigo-700" style="background:${emp.avatar_color || '#e0e7ff'}; width:42px;height:42px;font-size:1rem">${(emp.nombres || 'X').charAt(0)}${(emp.apellidos || 'X').charAt(0)}</div>
          <div><h3>${emp.nombres} ${emp.apellidos}</h3><div class="td-sub">${emp.codigo || ''} · <span class="badge ${estadoBadge(emp.estado)}">${emp.estado || 'Activo'}</span></div></div>
        </div>
        <button class="modal-close" onclick="closeModal()"><i data-lucide="x" style="width:14px;height:14px"></i></button>
      </div>
      <div class="modal-body">
        <div class="tabs">
          <div class="tab active" onclick="switchTab(this,'tab-info')">Info Personal</div>
          <div class="tab" onclick="switchTab(this,'tab-contrato')">Contrato & Planilla</div>
        </div>
        <div id="tab-info">
          <div class="form-grid">
            <div><div class="info-row"><span class="info-row-label">Nombres</span><span class="info-row-value">${emp.nombres}</span></div>
            <div class="info-row"><span class="info-row-label">Apellidos</span><span class="info-row-value">${emp.apellidos}</span></div>
            <div class="info-row"><span class="info-row-label">DNI</span><span class="info-row-value">${emp.dni}</span></div>
            <div class="info-row"><span class="info-row-label">Nacimiento</span><span class="info-row-value">${emp.fecha_nacimiento || '—'}</span></div>
            <div class="info-row"><span class="info-row-label">Género</span><span class="info-row-value">${emp.genero === 'M' ? 'Masculino' : (emp.genero === 'F' ? 'Femenino' : '—')}</span></div></div>
            <div><div class="info-row"><span class="info-row-label">Email</span><span class="info-row-value">${emp.email || '—'}</span></div>
            <div class="info-row"><span class="info-row-label">Teléfono</span><span class="info-row-value">${tel}</span></div>
            <div class="info-row"><span class="info-row-label">Departamento</span><span class="info-row-value">${dept?.nombre || '—'}</span></div>
            <div class="info-row"><span class="info-row-label">Puesto</span><span class="info-row-value">${puesto?.nombre || '—'}</span></div>
            <div class="info-row"><span class="info-row-label">Fecha Ingreso</span><span class="info-row-value">${emp.fecha_ingreso || '—'}</span></div></div>
          </div>
        </div>
        <div id="tab-contrato" style="display:none">
          <div class="grid-2" style="gap:12px;margin-bottom:16px">
            <div class="info-row form-full"><span class="info-row-label">Razón Social</span><span class="info-row-value fw-700" style="color:var(--primary)">${empresa?.razon_social || empresa?.nombre || 'No asignada'}</span></div>
            <div class="info-row"><span class="info-row-label">Tipo Contrato</span><span class="info-row-value"><span class="badge badge-indigo">${emp.tipo_contrato || '—'}</span></span></div>
            <div class="info-row"><span class="info-row-label">Sistema Pensión</span><span class="info-row-value">${emp.afp_onp || '—'}</span></div>
            <div class="info-row"><span class="info-row-label">Sueldo Base</span><span class="info-row-value fw-700">S/ ${emp.sueldo_base ? parseFloat(emp.sueldo_base).toFixed(2) : '0.00'}</span></div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cerrar</button>
        <button class="btn btn-primary" onclick="editEmpModal(${emp.id})"><i data-lucide="edit" style="width:14px;height:14px"></i> Editar Empleado</button>
      </div>
    </div>
  </div>`);
  if(typeof lucide !== 'undefined') lucide.createIcons();
};

window.switchTab = function (el, tabId) {
  el.closest('.modal-body').querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  ['tab-info', 'tab-contrato'].forEach(id => {
    const pane = document.getElementById(id);
    if (pane) pane.style.display = id === tabId ? '' : 'none';
  });
};

window.editEmpModal = function (id) {
  const emp = dbEmpleados.find(e => String(e.id) === String(id));
  if(!emp) return;
  
  const empDept = emp.departamento_id || emp.departamento || '';
  const empEmpresa = emp.empresa_id || emp.empresa || '';
  const empresaData = dbEmpresas.find(e => String(e.id) === String(empEmpresa));
  
  const deptOptions = dbDepartamentos.map(d => `<option value="${d.id}" ${String(d.id) === String(empDept) ? 'selected' : ''}>${d.nombre}</option>`).join('');
  const empresaOptions = dbEmpresas.map(e => `<option value="${e.id}" data-ruc="${e.ruc}" ${String(e.id) === String(empEmpresa) ? 'selected' : ''}>${e.razon_social || e.nombre}</option>`).join('');
  const sedeOptions = dbSedes.map(s => `<option value="${s.id}" ${String(s.id) === String(emp.sede_id || emp.sede) ? 'selected' : ''}>${s.nombre}</option>`).join('');
  const puestoOptions = dbPuestos.map(p => {
      const dName = dbDepartamentos.find(d => String(d.id) === String(p.departamento_id || p.departamento))?.nombre || '';
      return `<option value="${p.id}" ${String(p.id) === String(emp.puesto_id || emp.puesto) ? 'selected' : ''}>${p.nombre} (${dName})</option>`;
  }).join('');

  const contratoOptions = ['Indefinido', 'Plazo Fijo', 'Practicante', 'Recibo por Honorarios'].map(c => `<option value="${c}" ${c === emp.tipo_contrato ? 'selected' : ''}>${c}</option>`).join('');
  const afpOptions = `<option value="">Ninguno</option>` + ['ONP', 'Prima AFP', 'Integra', 'Hábitat', 'Profuturo'].map(a => `<option value="${a}" ${a === emp.afp_onp ? 'selected' : ''}>${a}</option>`).join('');
  const estadoOptions = ['Activo', 'En Vacaciones', 'Suspendido', 'Cesado'].map(e => `<option value="${e}" ${e === emp.estado ? 'selected' : ''}>${e}</option>`).join('');

  openModal(`
  <div class="modal-overlay">
    <div class="modal modal-lg">
      <div class="modal-header">
        <h3>Editar Empleado: ${emp.nombres}</h3>
        <button class="modal-close" onclick="closeModal()"><i data-lucide="x" style="width:14px;height:14px"></i></button>
      </div>
      <div class="modal-body" style="padding-top: 15px;">
        <div class="section-label">1. Datos Corporativos</div>
        <div class="form-grid" style="margin-bottom:24px;">
          <div class="field"><label>Razón Social (Empresa) *</label><select id="edEmpresa" onchange="document.getElementById('edEmpRuc').value = this.options[this.selectedIndex].dataset.ruc || ''">${empresaOptions}</select></div>
          <div class="field"><label>RUC</label><input type="text" id="edEmpRuc" readonly style="background:var(--gray-100); color:var(--text-muted); font-weight:600;" value="${empresaData ? empresaData.ruc : ''}"></div>
          <div class="field"><label>Sede *</label><select id="edSede">${sedeOptions}</select></div>
          <div class="field"><label>Departamento *</label><select id="edDept">${deptOptions}</select></div>
          <div class="field form-full"><label>Puesto / Cargo *</label><select id="edPuesto">${puestoOptions}</select></div>
          <div class="field form-full"><label>Email corporativo</label><input type="email" id="edEmail" value="${emp.email || ''}"></div>
        </div>
        <div class="section-label">2. Datos Personales</div>
        <div class="form-grid" style="margin-bottom:24px;">
          <div class="field"><label>Nombres *</label><input type="text" id="edNombres" value="${emp.nombres || ''}"></div>
          <div class="field"><label>Apellidos *</label><input type="text" id="edApellidos" value="${emp.apellidos || ''}"></div>
          <div class="field"><label>DNI *</label><input type="text" id="edDni" value="${emp.dni || ''}" maxlength="8"></div>
          <div class="field"><label>Teléfono</label><input type="text" id="edTel" value="${emp.telefono || emp.tel || ''}"></div>
          <div class="field"><label>Fecha Nacimiento</label><input type="date" id="edNacimiento" value="${emp.fecha_nacimiento || ''}"></div>
          <div class="field"><label>Género *</label><select id="edGenero"><option value="M" ${emp.genero === 'M' ? 'selected' : ''}>Masculino</option><option value="F" ${emp.genero === 'F' ? 'selected' : ''}>Femenino</option></select></div>
          <div class="field form-full"><label>Estado Laboral</label><select id="edEstado">${estadoOptions}</select></div>
        </div>
        <div class="section-label">3. Contrato y Planilla</div>
        <div class="form-grid">
          <div class="field"><label>Fecha Ingreso *</label><input type="date" id="edIngreso" value="${emp.fecha_ingreso || ''}"></div>
          <div class="field"><label>Tipo Contrato *</label><select id="edContrato">${contratoOptions}</select></div>
          <div class="field"><label>Sueldo Base (S/) *</label><input type="number" id="edSueldo" value="${emp.sueldo_base || ''}" min="0"></div>
          <div class="field"><label>Sistema Pensión</label><select id="edAfp">${afpOptions}</select></div>
        </div>
      </div>
      
      <div class="modal-footer" style="display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; gap:8px;">
            <button class="btn btn-ghost" style="color:var(--danger)" onclick="confirmDisableEmp(${emp.id})" title="Dar de baja y quitar acceso">
                <i data-lucide="user-x" style="width:14px;height:14px"></i> Deshabilitar
            </button>
        </div>
        <div style="display:flex; gap:8px;">
            <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
            <button class="btn btn-primary" id="btnActualizarEmp" onclick="updateEmp(${emp.id})"><i data-lucide="save" style="width:14px;height:14px"></i> Actualizar Datos</button>
        </div>
      </div>

    </div>
  </div>`);
};

window.updateEmp = async function (id) {
    const btn = document.getElementById('btnActualizarEmp');
    const data = {
        empresa_id: document.getElementById('edEmpresa').value, sede_id: document.getElementById('edSede').value,
        departamento_id: document.getElementById('edDept').value, puesto_id: document.getElementById('edPuesto').value,
        email: document.getElementById('edEmail').value, nombres: document.getElementById('edNombres').value,
        apellidos: document.getElementById('edApellidos').value, dni: document.getElementById('edDni').value,
        genero: document.getElementById('edGenero').value, telefono: document.getElementById('edTel').value,
        fecha_nacimiento: document.getElementById('edNacimiento').value, fecha_ingreso: document.getElementById('edIngreso').value,
        tipo_contrato: document.getElementById('edContrato').value, sueldo_base: document.getElementById('edSueldo').value,
        afp_onp: document.getElementById('edAfp').value, estado: document.getElementById('edEstado').value
    };

    if(!data.nombres || !data.apellidos || !data.dni || !data.sueldo_base || !data.fecha_ingreso) {
        return showSystemToast("Faltan campos obligatorios", "warning");
    }

    btn.innerHTML = `<i data-lucide="loader-2" class="lucide-spin" style="width:14px;height:14px"></i> Guardando...`; btn.disabled = true; lucide.createIcons();
    const csrf = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';

    try {
        const response = await fetch(`/api/empleados/editar/${id}/`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf }, body: JSON.stringify(data) });
        const result = await response.json();
        
        if(response.ok || result.success) {
            closeModal(); await cargarDatosDeDB(); filterEmpleados(); 
            showSystemToast("Datos actualizados correctamente", "success");
        } else {
            showSystemToast(result.message || "Fallo en servidor", "error"); 
            btn.innerHTML = "Actualizar Datos"; btn.disabled = false;
        }
    } catch (e) {
        showSystemToast("Error de conexión al servidor Django.", "error"); 
        btn.innerHTML = "Actualizar Datos"; btn.disabled = false;
    }
};

window.confirmDisableEmp = function(id) {
    const emp = dbEmpleados.find(e => String(e.id) === String(id));
    if(!emp) return;

    openModal(`
      <div class="modal-overlay" style="z-index: 99999;">
        <div class="modal" style="max-width: 400px; text-align: center; padding: 40px 20px;">
            <div style="width: 70px; height: 70px; background: #fef2f2; color: var(--danger); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                <i data-lucide="alert-triangle" style="width: 36px; height: 36px;"></i>
            </div>
            <h3 style="font-size: 1.4rem; margin-bottom: 10px; font-weight: 800;">¿Dar de baja?</h3>
            <p style="color: var(--text-secondary); margin-bottom: 25px; line-height: 1.5;">
                ¿Estás seguro de que deseas dar de baja a <strong>${emp.nombres}</strong>?<br>
                Esto cambiará su estado a 'Cesado' y bloqueará su acceso al sistema.
            </p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="btn btn-ghost" style="flex: 1; justify-content: center;" onclick="editEmpModal(${id})">Cancelar</button>
                <button class="btn btn-primary" style="flex: 1; justify-content: center; background: var(--danger); border-color: var(--danger);" id="btnConfirmDisable" onclick="executeDisableEmp(${id})">Sí, dar de baja</button>
            </div>
        </div>
      </div>
    `);
};

window.executeDisableEmp = async function(id) {
    const btn = document.getElementById('btnConfirmDisable');
    btn.innerHTML = `<i data-lucide="loader-2" class="lucide-spin" style="width:14px;height:14px"></i> Procesando...`;
    btn.disabled = true; lucide.createIcons();

    const csrf = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';

    try {
        const response = await fetch(`/api/empleados/deshabilitar/${id}/`, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf }
        });
        const result = await response.json();

        if(response.ok || result.success) {
            closeModal();
            await cargarDatosDeDB();
            filterEmpleados();
            showSystemToast("Colaborador dado de baja correctamente", "success");
        } else {
            showSystemToast(result.message || "No se pudo deshabilitar.", "error");
            btn.innerHTML = "Sí, dar de baja"; btn.disabled = false;
        }
    } catch (e) {
        showSystemToast("Error de conexión al servidor.", "error");
        btn.innerHTML = "Sí, dar de baja"; btn.disabled = false;
    }
};