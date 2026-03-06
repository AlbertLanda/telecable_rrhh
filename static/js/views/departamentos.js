// ============================================================
// VIEW: Departamentos (Autocontenido - Sin dependencias externas)
// Ruta: static/js/views/departamentos.js
// ============================================================

window.renderDepartamentos = function() {
    // 1. Obtener datos desde la inyección del HTML (window.real...)
    const depts = window.realDepartamentos || [];
    const emps = window.realEmpleados || [];
    const puestos = window.realPuestos || [];
    
    const deptIcons = ['monitor', 'trending-up', 'calculator', 'package', 'megaphone', 'heart-handshake'];
    
    // --- HELPERS LOCALES ---
    const getPuestoName = (id) => {
        const p = puestos.find(x => String(x.id) === String(id));
        return p ? p.nombre : '—';
    };
    
    const formatSoles = (amount) => 'S/ ' + parseFloat(amount || 0).toFixed(2);
    
    const getAvatarColor = (id) => {
        const colors = ['av-indigo', 'av-blue', 'av-green', 'av-purple', 'av-amber', 'av-red'];
        return colors[(id || 0) % colors.length];
    };
    
    const getInitials = (emp) => (emp.nombres ? emp.nombres.charAt(0) : 'X') + (emp.apellidos ? emp.apellidos.charAt(0) : 'X');
    const getFullName = (emp) => `${emp.nombres || ''} ${emp.apellidos || ''}`.trim() || 'General';
    
    const getEstadoBadge = (estado) => {
        if(estado === 'Cesado' || estado === 'Suspendido') return 'badge-red';
        if(estado === 'En Vacaciones') return 'badge-amber';
        return 'badge-green';
    };
    // -----------------------

    // Exponemos una función local al objeto window SOLO para que el HTML inyectado la pueda llamar
    window._openDeptDetail = function (id) {
        const dept = depts.find(d => String(d.id) === String(id));
        if(!dept) return;
        
        const empsInDept = emps.filter(e => String(e.departamento_id || e.deptId) === String(id));

        const empRows = empsInDept.map(e => {
            return `<tr style="cursor:pointer" onclick="closeModal(); if(typeof window.navigate==='function') navigate('empleados'); setTimeout(()=> { if(typeof window.openEmpDetail === 'function') window.openEmpDetail(${e.id}) },300)">
          <td><div class="td-user">
            <div class="td-avatar ${getAvatarColor(e.id)}">${getInitials(e).toUpperCase()}</div>
            <div><div class="td-name">${getFullName(e)}</div><div class="td-sub">${e.email || '—'}</div></div>
          </div></td>
          <td>${getPuestoName(e.puesto_id || e.puestoId)}</td>
          <td>${formatSoles(e.sueldo_base || e.sueldo)}</td>
          <td><span class="badge ${getEstadoBadge(e.estado)} badge-dot">${e.estado || 'Activo'}</span></td>
        </tr>`;
        }).join('');

        window.openModal(`
      <div class="modal-overlay" style="z-index: 9999;">
        <div class="modal modal-lg">
          <div class="modal-header">
            <div>
              <h3>${dept.nombre}</h3>
              <div class="td-sub">${dept.descripcion || dept.desc || ''}</div>
            </div>
            <button class="modal-close" onclick="closeModal()"><i data-lucide="x" style="width:14px;height:14px"></i></button>
          </div>
          <div class="modal-body">
            <div class="grid-2" style="gap:10px;margin-bottom:18px">
              <div class="info-row"><span class="info-row-label">Jefe de Área</span><span class="info-row-value fw-700">${dept.jefe_nombre || dept.jefe || 'N/A'}</span></div>
              <div class="info-row"><span class="info-row-label">Total Colaboradores</span><span class="info-row-value fw-700">${empsInDept.length}</span></div>
            </div>
            <div class="section-label">Colaboradores del Departamento</div>
            <div class="table-wrap">
              <table>
                <thead><tr><th>Empleado</th><th>Puesto</th><th>Sueldo</th><th>Estado</th></tr></thead>
                <tbody>${empsInDept.length > 0 ? empRows : '<tr><td colspan="4" style="text-align:center;padding:20px;">Sin empleados</td></tr>'}</tbody>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" onclick="closeModal()">Cerrar</button>
          </div>
        </div>
      </div>`);
    };

    const cards = depts.map((d, i) => {
        const empsCount = emps.filter(e => String(e.departamento_id || e.deptId) === String(d.id)).length;
        const color = d.color || '#3b82f6';
        return `
    <div class="dept-card" onclick="window._openDeptDetail(${d.id})">
      <div class="dept-icon-wrap" style="background:${color}20">
        <i data-lucide="${deptIcons[i % deptIcons.length]}" style="width:22px;height:22px;color:${color}"></i>
      </div>
      <div class="dept-name">${d.nombre}</div>
      <div class="dept-desc">${d.descripcion || d.desc || 'Sin descripción'}</div>
      <div class="dept-meta">
        <div class="dept-count"><i data-lucide="users" style="width:13px;height:13px"></i> ${empsCount} colaboradores</div>
        <div class="dept-jefe" style="color:${color}">${d.jefe_nombre || d.jefe || 'Sin jefe'}</div>
      </div>
    </div>`;
    }).join('');

    return `
  <div class="view-header" style="animation: fadeIn 0.4s ease-out;">
    <div class="view-header-left"><h1>Departamentos</h1><p>${depts.length} áreas organizacionales</p></div>
    <div class="view-header-actions">
      <button class="btn btn-primary" onclick="openNewDeptModal()"><i data-lucide="plus" style="width:15px;height:15px"></i> Nuevo Departamento</button>
    </div>
  </div>

  <div class="stats-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:20px; animation: fadeIn 0.4s ease-out;">
    <div class="stat-card">
      <div class="stat-icon indigo"><i data-lucide="building-2" style="width:22px;height:22px"></i></div>
      <div><div class="stat-number">${depts.length}</div><div class="stat-label">Departamentos</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon green"><i data-lucide="users" style="width:22px;height:22px"></i></div>
      <div><div class="stat-number">${emps.length}</div><div class="stat-label">Total Empleados</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon amber"><i data-lucide="briefcase" style="width:22px;height:22px"></i></div>
      <div><div class="stat-number">${puestos.length}</div><div class="stat-label">Puestos Registrados</div></div>
    </div>
  </div>

  <div class="dept-grid" style="animation: fadeIn 0.4s ease-out;">${cards}</div>`;
};

window.initDepartamentos = function() { };

window.openNewDeptModal = function () {
    if(typeof window.openModal !== 'function') return;

    window.openModal(`
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
};

window.saveNewDept = async function () {
    const data = {
        nombre: document.getElementById('ndNombre').value,
        descripcion: document.getElementById('ndDesc').value,
        jefe_nombre: document.getElementById('ndJefe').value,
        color: document.getElementById('ndColor').value
    };

    if(!data.nombre) {
        if(typeof window.showToast === 'function') window.showToast("El nombre del área es obligatorio", "warning");
        else alert("El nombre del área es obligatorio");
        return;
    }

    const btn = document.getElementById('btnGuardarDept');
    btn.innerHTML = `<i data-lucide="loader-2" class="lucide-spin" style="width:14px;height:14px"></i> Guardando...`; 
    btn.disabled = true;
    if(typeof lucide !== 'undefined') lucide.createIcons();

    const csrf = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';

    try {
        const response = await fetch('/api/departamentos/crear/', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf }, 
            body: JSON.stringify(data) 
        });
        
        const text = await response.text(); 
        let result;
        try {
            result = JSON.parse(text); 
        } catch(err) {
            console.error("Django arrojó un error que no es JSON:", text);
            if(typeof window.showToast === 'function') window.showToast("Error en el servidor Django", "error");
            else alert("Error en el servidor Django");
            
            btn.innerHTML = `<i data-lucide="save" style="width:14px;height:14px"></i> Guardar Área`; btn.disabled = false;
            return;
        }
        
        if(response.ok || result.success) {
            window.closeModal();
            if(typeof window.showToast === 'function') window.showToast("Departamento creado", "success");
            
            // Recargar para traer los datos limpios desde Django
            setTimeout(() => {
                window.location.reload(); 
            }, 800);
        } else {
            if(typeof window.showToast === 'function') window.showToast("Error al crear: " + (result.message || ""), "error");
            else alert("Error al crear: " + (result.message || ""));
            
            btn.innerHTML = `<i data-lucide="save" style="width:14px;height:14px"></i> Guardar Área`; btn.disabled = false;
            if(typeof lucide !== 'undefined') lucide.createIcons();
        }
    } catch (e) {
        console.error(e);
        if(typeof window.showToast === 'function') window.showToast("Error de red o servidor apagado.", "error");
        else alert("Error de red o servidor apagado.");
        
        btn.innerHTML = `<i data-lucide="save" style="width:14px;height:14px"></i> Guardar Área`; btn.disabled = false;
        if(typeof lucide !== 'undefined') lucide.createIcons();
    }
};