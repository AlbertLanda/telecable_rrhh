// ============================================================
// VIEW: Asistencia (Autocontenido - Sin dependencias externas)
// Ruta: static/js/views/asistencia.js
// ============================================================

window.renderAsistencia = function() {
    // --- HELPERS LOCALES DE ASISTENCIA ---
    const emps = window.realEmpleados || [];
    const depts = window.realDepartamentos || [];
    const asistencias = window.realAsistencias || [];

    const getEmpLocal = (id) => emps.find(e => String(e.id) === String(id));
    const getDeptLocal = (id) => depts.find(d => String(d.id) === String(id)) || { nombre: 'Desconocido' };
    const getFullName = (emp) => emp ? `${emp.nombres || ''} ${emp.apellidos || ''}`.trim() : 'Usuario Eliminado';
    const getInitials = (emp) => emp ? ((emp.nombres ? emp.nombres.charAt(0) : 'X') + (emp.apellidos ? emp.apellidos.charAt(0) : 'X')).toUpperCase() : 'XX';
    
    const getAvatarColor = (id) => {
        const colors = ['av-indigo', 'av-blue', 'av-green', 'av-purple', 'av-amber', 'av-red'];
        return colors[(id || 0) % colors.length];
    };

    const getTipoColor = (tipo) => {
        if (tipo === 'Asistencia') return 'badge-green';
        if (tipo === 'Tardanza') return 'badge-amber';
        if (tipo === 'Falta') return 'badge-red';
        return 'badge-blue';
    };

    const formatDateLocal = (dateStr) => {
        if (!dateStr || dateStr === '—') return '—';
        const d = new Date(dateStr);
        if (isNaN(d)) return dateStr;
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return `${d.getUTCDate()} ${meses[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    };

    const calcHorasDiff = (entrada, salida) => {
        if (!entrada || !salida || entrada === '—' || salida === '—') return '—';
        try {
            let [h1, m1] = entrada.split(':').map(Number);
            let [h2, m2] = salida.split(':').map(Number);
            let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
            if (diff <= 0) return '—';
            return `${Math.floor(diff / 60)}h ${diff % 60}m`;
        } catch(e) { return '—'; }
    };
    // ------------------------------------

    // 1. Obtenemos la fecha REAL de hoy automáticamente
    const hoyObj = new Date();
    const offset = hoyObj.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(hoyObj - offset)).toISOString().split('T')[0];
    const hoyStr = localISOTime;
    
    const fechaFormateada = hoyObj.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // 2. Calculamos los datos para las tarjetas azules usando HOY
    const todayRecs = asistencias.filter(a => a.fecha === hoyStr);
    const presentes = todayRecs.filter(a => a.tipo !== 'Falta').length;
    const tardanzas = todayRecs.filter(a => a.tipo === 'Tardanza').length;
    let faltas = emps.length - todayRecs.length;
    if (faltas < 0) faltas = 0;
    const horasExtra = todayRecs.filter(a => a.tipo === 'Hora Extra').length;

    const empOptions = emps.map(e => `<option value="${e.id}">${getFullName(e)}</option>`).join('');

    const rows = asistencias.slice().reverse().map(a => {
        const emp = getEmpLocal(a.empId || a.empleado_id);
        const dept = emp ? getDeptLocal(emp.deptId || emp.departamento_id) : { nombre: 'Desconocido' };
        
        const entrada = a.entrada || a.hora_entrada || '—';
        const salida = a.salida || a.hora_salida || '—';

        return `<tr>
      <td><div class="td-user">
        <div class="td-avatar ${emp ? getAvatarColor(emp.id) : 'av-gray'}">${getInitials(emp)}</div>
        <div><div class="td-name">${getFullName(emp)}</div><div class="td-sub">${dept.nombre}</div></div>
      </div></td>
      <td>${formatDateLocal(a.fecha)}</td>
      <td>${entrada.substring(0,5)}</td>
      <td>${salida.substring(0,5)}</td>
      <td>${calcHorasDiff(entrada, salida)}</td>
      <td><span class="badge ${getTipoColor(a.tipo)} badge-dot">${a.tipo}</span></td>
      <td>${a.obs || a.observaciones || '<span class="text-muted">—</span>'}</td>
    </tr>`;
    }).join('');

    return `
  <div class="view-header" style="animation: fadeIn 0.4s ease-out;">
    <div class="view-header-left"><h1>Asistencia</h1><p>Control de ingresos, salidas y ausencias</p></div>
    <div class="view-header-actions">
      <button class="btn btn-ghost" onclick="window.exportarAsistencia()"><i data-lucide="download" style="width:15px;height:15px"></i> Exportar</button>
      <button class="btn btn-primary" onclick="window.openRegistrarAtt()"><i data-lucide="plus" style="width:15px;height:15px"></i> Registrar</button>
    </div>
  </div>

  <div class="att-today-bar" style="animation: fadeIn 0.4s ease-out;">
    <div class="att-today-info">
      <h2 id="resumenFecha" style="text-transform: capitalize;">📅 ${fechaFormateada} (Hoy)</h2>
      <p>Resumen de asistencia de la fecha seleccionada</p>
    </div>
    <div style="display:flex;gap:28px;align-items:center">
      <div style="text-align:center"><div id="resumenPresentes" style="font-size:1.6rem;font-weight:800">${presentes}</div><div style="font-size:.78rem;opacity:.8">Presentes</div></div>
      <div style="text-align:center"><div id="resumenTardanzas" style="font-size:1.6rem;font-weight:800;color:#fde68a">${tardanzas}</div><div style="font-size:.78rem;opacity:.8">Tardanzas</div></div>
      <div style="text-align:center"><div id="resumenFaltas" style="font-size:1.6rem;font-weight:800;color:#fca5a5">${faltas}</div><div style="font-size:.78rem;opacity:.8">Faltas</div></div>
      <div style="text-align:center"><div id="resumenHorasExtra" style="font-size:1.6rem;font-weight:800;color:#6ee7b7">${horasExtra}</div><div style="font-size:.78rem;opacity:.8">H. Extra</div></div>
      <button class="att-clock-btn" onclick="window.openRegistrarAtt()">⏱ Marcar Asistencia</button>
    </div>
  </div>

  <div class="card" style="animation: fadeIn 0.4s ease-out;">
    <div class="card-header">
      <div><div class="card-title">Historial de Asistencia</div><div class="card-subtitle">Últimos registros</div></div>
      <div style="display:flex;gap:8px">
        <input type="date" class="filter-select" id="filtroAsisFecha" onchange="window.ejecutarFiltrosAsistencia()">
        <select class="filter-select" id="filtroAsisEmp" onchange="window.ejecutarFiltrosAsistencia()">
          <option value="">Todos los empleados</option>${empOptions}
        </select>
        <select class="filter-select" id="filtroAsisTipo" onchange="window.ejecutarFiltrosAsistencia()">
          <option value="">Todos los tipos</option>
          <option value="Asistencia">Asistencia</option>
          <option value="Tardanza">Tardanza</option>
          <option value="Falta">Falta</option>
          <option value="Hora Extra">Hora Extra</option>
        </select>
        <button class="btn btn-ghost" onclick="window.limpiarFiltrosAsistencia()" title="Limpiar Filtros" style="padding: 0 10px;"><i data-lucide="x-circle" style="width:18px;height:18px"></i></button>
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
    const emps = window.realEmpleados || [];
    const getFullName = (emp) => emp ? `${emp.nombres || ''} ${emp.apellidos || ''}`.trim() : 'Desconocido';
    const empOptions = emps.map(e => `<option value="${e.id}">${getFullName(e)}</option>`).join('');
    
    const hoyObj = new Date();
    const offset = hoyObj.getTimezoneOffset() * 60000;
    const hoyStr = (new Date(hoyObj - offset)).toISOString().split('T')[0];

    if(typeof window.openModal !== 'function') return;

    window.openModal(`
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
        <button class="btn btn-primary" id="btnGuardarAsis" onclick="window.saveAsistencia()">
          <i data-lucide="check" style="width:14px;height:14px"></i> Guardar
        </button>
      </div>
    </div>
  </div>`);
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
        if(typeof window.showToast === 'function') window.showToast("Selecciona el empleado, la fecha y el tipo.", "warning");
        else alert("⚠️ Selecciona el empleado, la fecha y el tipo.");
        return;
    }

    const btn = document.getElementById('btnGuardarAsis');
    btn.innerHTML = `<i data-lucide="loader-2" class="lucide-spin" style="width:14px;height:14px"></i> Guardando...`; 
    btn.disabled = true;
    if(typeof lucide !== 'undefined') lucide.createIcons();

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
            console.error(text); 
            if(typeof window.showToast === 'function') window.showToast("Error interno en el servidor", "error");
            else alert("Error interno en el servidor.");
            btn.innerHTML = `<i data-lucide="check" style="width:14px;height:14px"></i> Guardar Registro`; btn.disabled = false; 
            return;
        }

        if(response.ok || result.success) {
            window.closeModal();
            if(typeof window.showToast === 'function') window.showToast("Asistencia registrada", "success");
            setTimeout(() => { window.location.reload(); }, 800); 
        } else {
            if(typeof window.showToast === 'function') window.showToast("Error: " + result.message, "error");
            else alert("Error: " + result.message);
            btn.innerHTML = `<i data-lucide="check" style="width:14px;height:14px"></i> Guardar Registro`; btn.disabled = false;
        }
    } catch (e) {
        if(typeof window.showToast === 'function') window.showToast("Error de conexión", "error");
        else alert("Error de conexión al servidor.");
        btn.innerHTML = `<i data-lucide="check" style="width:14px;height:14px"></i> Guardar Registro`; btn.disabled = false;
    }
};

// ============================================================
// 🔥 EL CEREBRO DE LOS FILTROS Y DEL RESUMEN AZUL 🔥
// ============================================================
window.ejecutarFiltrosAsistencia = function () {
    const dateVal = document.getElementById('filtroAsisFecha').value;
    const empVal = document.getElementById('filtroAsisEmp').value;
    const tipoVal = document.getElementById('filtroAsisTipo').value;

    const emps = window.realEmpleados || [];
    const depts = window.realDepartamentos || [];
    const asistencias = window.realAsistencias || [];

    // Funciones locales duplicadas para los filtros
    const getEmpLocal = (id) => emps.find(e => String(e.id) === String(id));
    const getDeptLocal = (id) => depts.find(d => String(d.id) === String(id)) || { nombre: 'Desconocido' };
    const getFullName = (emp) => emp ? `${emp.nombres || ''} ${emp.apellidos || ''}`.trim() : 'Desconocido';
    const getInitials = (emp) => emp ? ((emp.nombres ? emp.nombres.charAt(0) : 'X') + (emp.apellidos ? emp.apellidos.charAt(0) : 'X')).toUpperCase() : 'XX';
    const getAvatarColor = (id) => { const c = ['av-indigo', 'av-blue', 'av-green', 'av-purple', 'av-amber', 'av-red']; return c[(id || 0) % c.length]; };
    const getTipoColor = (t) => { if(t === 'Asistencia') return 'badge-green'; if(t === 'Tardanza') return 'badge-amber'; if(t === 'Falta') return 'badge-red'; return 'badge-blue'; };
    const formatDateLocal = (dateStr) => { if(!dateStr || dateStr === '—') return '—'; const d = new Date(dateStr); if(isNaN(d)) return dateStr; const m = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']; return `${d.getUTCDate()} ${m[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
    const calcHorasDiff = (e, s) => { if(!e || !s || e === '—' || s === '—') return '—'; try { let [h1, m1] = e.split(':').map(Number); let [h2, m2] = s.split(':').map(Number); let diff = (h2 * 60 + m2) - (h1 * 60 + m1); if(diff <= 0) return '—'; return `${Math.floor(diff / 60)}h ${diff % 60}m`; } catch(err) { return '—'; } };


    const hoyObj = new Date();
    const offset = hoyObj.getTimezoneOffset() * 60000;
    const hoyStr = (new Date(hoyObj - offset)).toISOString().split('T')[0];
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
    
    const recsDia = asistencias.filter(a => a.fecha === targetDate);
    document.getElementById('resumenPresentes').innerText = recsDia.filter(a => a.tipo !== 'Falta').length;
    document.getElementById('resumenTardanzas').innerText = recsDia.filter(a => a.tipo === 'Tardanza').length;
    let flt = emps.length - recsDia.length;
    document.getElementById('resumenFaltas').innerText = flt < 0 ? 0 : flt;
    document.getElementById('resumenHorasExtra').innerText = recsDia.filter(a => a.tipo === 'Hora Extra').length;

    let filtrados = asistencias.filter(a => {
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

    const rowsAsis = filtrados.slice().reverse().map(a => {
        const emp = getEmpLocal(a.empId || a.empleado_id);
        const dept = emp ? getDeptLocal(emp.deptId || emp.departamento_id) : { nombre: 'Desconocido' };
        const entrada = a.entrada || a.hora_entrada || '—';
        const salida = a.salida || a.hora_salida || '—';
        
        return `<tr>
      <td><div class="td-user">
        <div class="td-avatar ${emp ? getAvatarColor(emp.id) : 'av-gray'}">${getInitials(emp)}</div>
        <div><div class="td-name">${getFullName(emp)}</div><div class="td-sub">${dept.nombre}</div></div>
      </div></td>
      <td>${formatDateLocal(a.fecha)}</td>
      <td>${entrada.substring(0,5)}</td>
      <td>${salida.substring(0,5)}</td>
      <td>${calcHorasDiff(entrada, salida)}</td>
      <td><span class="badge ${getTipoColor(a.tipo)} badge-dot">${a.tipo}</span></td>
      <td>${a.obs || a.observaciones || '<span class="text-muted">—</span>'}</td>
    </tr>`;
    }).join('');

    tbody.innerHTML = rowsAsis;
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
        if(typeof window.showToast === 'function') window.showToast("Error: La librería Excel no está cargada", "error");
        else alert("Error: La librería Excel no está cargada correctamente.");
        return;
    }

    const emps = window.realEmpleados || [];
    const depts = window.realDepartamentos || [];
    const asistencias = window.realAsistencias || [];
    const getEmpLocal = (id) => emps.find(e => String(e.id) === String(id));
    const getDeptLocal = (id) => depts.find(d => String(d.id) === String(id)) || { nombre: 'Desconocido' };
    const getFullName = (emp) => emp ? `${emp.nombres || ''} ${emp.apellidos || ''}`.trim() : 'Usuario Eliminado';
    const calcHorasDiff = (e, s) => { if(!e || !s || e === '—' || s === '—') return '—'; try { let [h1, m1] = e.split(':').map(Number); let [h2, m2] = s.split(':').map(Number); let diff = (h2 * 60 + m2) - (h1 * 60 + m1); if(diff <= 0) return '—'; return `${Math.floor(diff / 60)}h ${diff % 60}m`; } catch(err) { return '—'; } };


    // Leemos los filtros activos
    const dateVal = document.getElementById('filtroAsisFecha') ? document.getElementById('filtroAsisFecha').value : '';
    const empVal = document.getElementById('filtroAsisEmp') ? document.getElementById('filtroAsisEmp').value : '';
    const tipoVal = document.getElementById('filtroAsisTipo') ? document.getElementById('filtroAsisTipo').value : '';

    // Filtramos la data igual que en la tabla
    let filtrados = asistencias.filter(a => {
        const empleado_id = a.empId || a.empleado_id;
        const matchDate = !dateVal || a.fecha === dateVal;
        const matchEmp = !empVal || String(empleado_id) === String(empVal);
        const matchTipo = !tipoVal || a.tipo === tipoVal;
        return matchDate && matchEmp && matchTipo;
    });

    if (filtrados.length === 0) {
        if(typeof window.showToast === 'function') window.showToast("No hay datos para exportar", "warning");
        else alert("No hay datos para exportar con los filtros actuales.");
        return;
    }

    // Preparamos los datos para que las columnas en Excel queden perfectas
    const dataParaExcel = filtrados.map(a => {
        const emp = getEmpLocal(a.empId || a.empleado_id);
        const dept = emp ? getDeptLocal(emp.deptId || emp.departamento_id) : { nombre: 'Desconocido' };
        const entrada = a.entrada || a.hora_entrada || '';
        const salida = a.salida || a.hora_salida || '';

        return {
            "Empleado": emp ? getFullName(emp) : 'Usuario Eliminado',
            "Departamento": dept.nombre,
            "Fecha": a.fecha,
            "Hora Ingreso": entrada.substring(0,5),
            "Hora Salida": salida.substring(0,5),
            "Horas Trabajadas": calcHorasDiff(entrada, salida),
            "Estado": a.tipo,
            "Observaciones": a.obs || a.observaciones || ''
        };
    });

    // Construimos el Excel
    const worksheet = XLSX.utils.json_to_sheet(dataParaExcel);
    const workbook = XLSX.utils.book_new();
    
    worksheet['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 30 }];
    
    XLSX.utils.book_append_sheet(workbook, worksheet, "Asistencia");
    
    // Lo descargamos
    const hoy = new Date();
    const offset = hoy.getTimezoneOffset() * 60000;
    const hoyISOLocal = (new Date(hoy - offset)).toISOString().split('T')[0];
    
    const nombreArchivo = `Reporte_Asistencia_${dateVal ? dateVal : hoyISOLocal}.xlsx`;
    XLSX.writeFile(workbook, nombreArchivo);
};

window.filterAttDate = window.filterAttEmp = window.filterAttTipo = function () { };