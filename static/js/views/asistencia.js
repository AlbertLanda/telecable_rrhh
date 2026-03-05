// ============================================================
// VIEW: Asistencia
// ============================================================

window.renderAsistencia = function() {
    // 1. Obtenemos la fecha REAL de hoy automáticamente
    const hoyObj = new Date();
    const yyyy = hoyObj.getFullYear();
    const mm = String(hoyObj.getMonth() + 1).padStart(2, '0');
    const dd = String(hoyObj.getDate()).padStart(2, '0');
    const hoyStr = `${yyyy}-${mm}-${dd}`;
    
    const fechaFormateada = hoyObj.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // 2. Calculamos los datos para las tarjetas azules usando HOY
    const todayRecs = MOCK.asistencias.filter(a => a.fecha === hoyStr);
    const presentes = todayRecs.filter(a => a.tipo !== 'Falta').length;
    const tardanzas = todayRecs.filter(a => a.tipo === 'Tardanza').length;
    let faltas = MOCK.empleados.length - todayRecs.length;
    if (faltas < 0) faltas = 0;
    const horasExtra = todayRecs.filter(a => a.tipo === 'Hora Extra').length;

    const empOptions = MOCK.empleados.map(e => `<option value="${e.id}">${empFullName(e)}</option>`).join('');

    const rows = MOCK.asistencias.slice().reverse().map(a => {
        const empleado_id = a.empId || a.empleado_id;
        const emp = getEmp(empleado_id);
        const dept = emp ? getDept(emp.deptId || emp.departamento_id) : { nombre: 'Desconocido' };
        
        const entrada = a.entrada || a.hora_entrada || '—';
        const salida = a.salida || a.hora_salida || '—';

        return `<tr>
      <td><div class="td-user">
        <div class="td-avatar ${emp ? avatarColor(emp.id) : 'av-gray'}">${emp ? empInitials(emp) : 'XX'}</div>
        <div><div class="td-name">${emp ? empFullName(emp) : 'Usuario Eliminado'}</div><div class="td-sub">${dept.nombre}</div></div>
      </div></td>
      <td>${fmtDate(a.fecha)}</td>
      <td>${entrada.substring(0,5)}</td>
      <td>${salida.substring(0,5)}</td>
      <td>${horasDiff(entrada, salida)}</td>
      <td><span class="badge ${tipoColor(a.tipo)} badge-dot">${a.tipo}</span></td>
      <td>${a.obs || a.observaciones || '<span class="text-muted">—</span>'}</td>
    </tr>`;
    }).join('');

    return `
  <div class="view-header">
    <div class="view-header-left"><h1>Asistencia</h1><p>Control de ingresos, salidas y ausencias</p></div>
    <div class="view-header-actions">
      <button class="btn btn-ghost" onclick="exportarAsistencia()"><i data-lucide="download" style="width:15px;height:15px"></i> Exportar</button>
      <button class="btn btn-primary" onclick="openRegistrarAtt()"><i data-lucide="plus" style="width:15px;height:15px"></i> Registrar</button>
    </div>
  </div>

  <div class="att-today-bar">
    <div class="att-today-info">
      <h2 id="resumenFecha" style="text-transform: capitalize;">📅 ${fechaFormateada} (Hoy)</h2>
      <p>Resumen de asistencia de la fecha seleccionada</p>
    </div>
    <div style="display:flex;gap:28px;align-items:center">
      <div style="text-align:center"><div id="resumenPresentes" style="font-size:1.6rem;font-weight:800">${presentes}</div><div style="font-size:.78rem;opacity:.8">Presentes</div></div>
      <div style="text-align:center"><div id="resumenTardanzas" style="font-size:1.6rem;font-weight:800;color:#fde68a">${tardanzas}</div><div style="font-size:.78rem;opacity:.8">Tardanzas</div></div>
      <div style="text-align:center"><div id="resumenFaltas" style="font-size:1.6rem;font-weight:800;color:#fca5a5">${faltas}</div><div style="font-size:.78rem;opacity:.8">Faltas</div></div>
      <div style="text-align:center"><div id="resumenHorasExtra" style="font-size:1.6rem;font-weight:800;color:#6ee7b7">${horasExtra}</div><div style="font-size:.78rem;opacity:.8">H. Extra</div></div>
      <button class="att-clock-btn" onclick="openRegistrarAtt()">⏱ Marcar Asistencia</button>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <div><div class="card-title">Historial de Asistencia</div><div class="card-subtitle">Últimos registros</div></div>
      <div style="display:flex;gap:8px">
        <input type="date" class="filter-select" id="filtroAsisFecha" onchange="ejecutarFiltrosAsistencia()">
        <select class="filter-select" id="filtroAsisEmp" onchange="ejecutarFiltrosAsistencia()">
          <option value="">Todos los empleados</option>${empOptions}
        </select>
        <select class="filter-select" id="filtroAsisTipo" onchange="ejecutarFiltrosAsistencia()">
          <option value="">Todos los tipos</option>
          <option value="Asistencia">Asistencia</option>
          <option value="Tardanza">Tardanza</option>
          <option value="Falta">Falta</option>
          <option value="Hora Extra">Hora Extra</option>
        </select>
        <button class="btn btn-ghost" onclick="limpiarFiltrosAsistencia()" title="Limpiar Filtros" style="padding: 0 10px;"><i data-lucide="x-circle" style="width:18px;height:18px"></i></button>
      </div>
    </div>
    <div class="table-wrap" id="attTableWrap">
      <table>
        <thead><tr><th>Empleado</th><th>Fecha</th><th>Entrada</th><th>Salida</th><th>Horas</th><th>Tipo</th><th>Observación</th></tr></thead>
        <tbody id="attTable">${rows || '<tr><td colspan="7" style="text-align:center;padding:20px;">No hay registros</td></tr>'}</tbody>
      </table>
    </div>
  </div>`;
};

window.initAsistencia = function() { };

// ============================================================
// FUNCIONES DEL MODAL Y GUARDADO REAL EN POSTGRESQL
// ============================================================

window.openRegistrarAtt = function () {
    const empOptions = MOCK.empleados.map(e => `<option value="${e.id}">${empFullName(e)}</option>`).join('');
    
    // Obtenemos fecha actual para el input por defecto
    const hoyObj = new Date();
    const hoyStr = `${hoyObj.getFullYear()}-${String(hoyObj.getMonth()+1).padStart(2,'0')}-${String(hoyObj.getDate()).padStart(2,'0')}`;

    openModal(`
  <div class="modal-overlay" style="z-index: 9999;">
    <div class="modal">
      <div class="modal-header">
        <h3>Registrar Asistencia</h3>
        <button class="modal-close" onclick="closeModal()"><i data-lucide="x" style="width:14px;height:14px"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-grid">
          <div class="field form-full"><label>Empleado *</label>
            <select id="newAsisEmp"><option value="">Seleccionar empleado...</option>${empOptions}</select>
          </div>
          <div class="field"><label>Fecha *</label><input type="date" id="newAsisFecha" value="${hoyStr}"></div>
          <div class="field"><label>Tipo *</label>
            <select id="newAsisTipo"><option>Asistencia</option><option>Tardanza</option><option>Falta</option><option>Hora Extra</option><option>Permiso</option></select>
          </div>
          <div class="field"><label>Hora de Entrada</label><input type="time" id="newAsisEntrada" value="08:00"></div>
          <div class="field"><label>Hora de Salida</label><input type="time" id="newAsisSalida" value="17:00"></div>
          <div class="field form-full"><label>Observación</label><textarea id="newAsisObs" placeholder="Motivo, justificación, etc."></textarea></div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" id="btnGuardarAsis" onclick="saveAsistencia()">
          <i data-lucide="check" style="width:14px;height:14px"></i> Guardar
        </button>
      </div>
    </div>
  </div>`);
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.saveAsistencia = async function() {
    const data = {
        empleado_id: document.getElementById('newAsisEmp').value,
        fecha: document.getElementById('newAsisFecha').value,
        tipo: document.getElementById('newAsisTipo').value,
        hora_entrada: document.getElementById('newAsisEntrada').value || null,
        hora_salida: document.getElementById('newAsisSalida').value || null,
        observaciones: document.getElementById('newAsisObs').value
    };

    if(!data.empleado_id || !data.fecha || !data.tipo) {
        return alert("⚠️ Selecciona el empleado, la fecha y el tipo.");
    }

    const btn = document.getElementById('btnGuardarAsis');
    btn.innerHTML = `Guardando...`; btn.disabled = true;

    const csrf = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';

    try {
        const response = await fetch('/api/asistencias/crear/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf },
            body: JSON.stringify(data)
        });

        const text = await response.text();
        let result;
        try { result = JSON.parse(text); } catch(err) {
            console.error(text); alert("Error interno en el servidor. Revisa la consola.");
            btn.innerHTML = `Guardar Registro`; btn.disabled = false; return;
        }

        if(response.ok || result.success) {
            closeModal();
            window.location.reload(); 
        } else {
            alert("Error: " + result.message);
            btn.innerHTML = `Guardar Registro`; btn.disabled = false;
        }
    } catch (e) {
        alert("Error de conexión al servidor.");
        btn.innerHTML = `Guardar Registro`; btn.disabled = false;
    }
};

// ============================================================
// 🔥 EL CEREBRO DE LOS FILTROS Y DEL RESUMEN AZUL 🔥
// ============================================================
window.ejecutarFiltrosAsistencia = function () {
    const dateVal = document.getElementById('filtroAsisFecha').value;
    const empVal = document.getElementById('filtroAsisEmp').value;
    const tipoVal = document.getElementById('filtroAsisTipo').value;

    const hoyObj = new Date();
    const hoyStr = `${hoyObj.getFullYear()}-${String(hoyObj.getMonth()+1).padStart(2,'0')}-${String(hoyObj.getDate()).padStart(2,'0')}`;
    const targetDate = dateVal || hoyStr; 

    let displayDateText = "";
    if (dateVal) {
        const [y, m, d] = dateVal.split('-');
        const tempDate = new Date(y, m - 1, d);
        displayDateText = tempDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } else {
        displayDateText = hoyObj.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + " (Hoy)";
    }
    
    document.getElementById('resumenFecha').innerHTML = `📅 ${displayDateText}`;
    
    const recsDia = MOCK.asistencias.filter(a => a.fecha === targetDate);
    document.getElementById('resumenPresentes').innerText = recsDia.filter(a => a.tipo !== 'Falta').length;
    document.getElementById('resumenTardanzas').innerText = recsDia.filter(a => a.tipo === 'Tardanza').length;
    let flt = MOCK.empleados.length - recsDia.length;
    document.getElementById('resumenFaltas').innerText = flt < 0 ? 0 : flt;
    document.getElementById('resumenHorasExtra').innerText = recsDia.filter(a => a.tipo === 'Hora Extra').length;

    let filtrados = MOCK.asistencias.filter(a => {
        const empleado_id = a.empId || a.empleado_id;
        const matchDate = !dateVal || a.fecha === dateVal;
        const matchEmp = !empVal || String(empleado_id) === String(empVal);
        const matchTipo = !tipoVal || a.tipo === tipoVal;
        return matchDate && matchEmp && matchTipo;
    });

    const tbody = document.getElementById('attTable');
    if (!tbody) return;

    if (filtrados.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:#6b7280;font-weight:500;">No se encontraron registros para este filtro.</td></tr>';
        return;
    }

    const rows = filtrados.slice().reverse().map(a => {
        const empleado_id = a.empId || a.empleado_id;
        const emp = getEmp(empleado_id);
        const dept = emp ? getDept(emp.deptId || emp.departamento_id) : { nombre: 'Desconocido' };
        const entrada = a.entrada || a.hora_entrada || '—';
        const salida = a.salida || a.hora_salida || '—';
        
        return `<tr>
      <td><div class="td-user">
        <div class="td-avatar ${emp ? avatarColor(emp.id) : 'av-gray'}">${emp ? empInitials(emp) : 'XX'}</div>
        <div><div class="td-name">${emp ? empFullName(emp) : 'Desconocido'}</div><div class="td-sub">${dept.nombre}</div></div>
      </div></td>
      <td>${fmtDate(a.fecha)}</td>
      <td>${entrada.substring(0,5)}</td>
      <td>${salida.substring(0,5)}</td>
      <td>${horasDiff(entrada, salida)}</td>
      <td><span class="badge ${tipoColor(a.tipo)} badge-dot">${a.tipo}</span></td>
      <td>${a.obs || a.observaciones || '<span class="text-muted">—</span>'}</td>
    </tr>`;
    }).join('');

    tbody.innerHTML = rows;
    if (typeof lucide !== 'undefined') lucide.createIcons(); 
};

window.limpiarFiltrosAsistencia = function() {
    document.getElementById('filtroAsisFecha').value = '';
    document.getElementById('filtroAsisEmp').value = '';
    document.getElementById('filtroAsisTipo').value = '';
    window.ejecutarFiltrosAsistencia(); 
};

// ============================================================
// 🔥 EXPORTAR A EXCEL 🔥
// ============================================================
window.exportarAsistencia = function() {
    if (typeof XLSX === 'undefined') {
        return alert("Error: La librería Excel no está cargada correctamente.");
    }

    // Leemos los filtros activos
    const dateVal = document.getElementById('filtroAsisFecha') ? document.getElementById('filtroAsisFecha').value : '';
    const empVal = document.getElementById('filtroAsisEmp') ? document.getElementById('filtroAsisEmp').value : '';
    const tipoVal = document.getElementById('filtroAsisTipo') ? document.getElementById('filtroAsisTipo').value : '';

    // Filtramos la data igual que en la tabla
    let filtrados = MOCK.asistencias.filter(a => {
        const empleado_id = a.empId || a.empleado_id;
        const matchDate = !dateVal || a.fecha === dateVal;
        const matchEmp = !empVal || String(empleado_id) === String(empVal);
        const matchTipo = !tipoVal || a.tipo === tipoVal;
        return matchDate && matchEmp && matchTipo;
    });

    if (filtrados.length === 0) {
        return alert("No hay datos para exportar con los filtros actuales.");
    }

    // Preparamos los datos para que las columnas en Excel queden perfectas
    const dataParaExcel = filtrados.map(a => {
        const empleado_id = a.empId || a.empleado_id;
        const emp = getEmp(empleado_id);
        const dept = emp ? getDept(emp.deptId || emp.departamento_id) : { nombre: 'Desconocido' };
        
        const entrada = a.entrada || a.hora_entrada || '';
        const salida = a.salida || a.hora_salida || '';

        return {
            "Empleado": emp ? empFullName(emp) : 'Usuario Eliminado',
            "Departamento": dept.nombre,
            "Fecha": a.fecha,
            "Hora Ingreso": entrada.substring(0,5),
            "Hora Salida": salida.substring(0,5),
            "Horas Trabajadas": horasDiff(entrada, salida),
            "Estado": a.tipo,
            "Observaciones": a.obs || a.observaciones || ''
        };
    });

    // Construimos el Excel
    const worksheet = XLSX.utils.json_to_sheet(dataParaExcel);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Asistencia");
    
    // Lo descargamos
    const hoy = new Date().toISOString().split('T')[0];
    const nombreArchivo = `Reporte_Asistencia_${dateVal ? dateVal : hoy}.xlsx`;
    
    XLSX.writeFile(workbook, nombreArchivo);
};

window.filterAttDate = window.filterAttEmp = window.filterAttTipo = function () { };