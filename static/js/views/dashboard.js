// ============================================================
// VIEW: Dashboard
// ============================================================

function renderDashboard() {
  // 1. FILTRAMOS EMPLEADOS POR LA SEDE SELECCIONADA ARRIBA
  const emps = MOCK.empleados.filter(e => e.sedeId === currentSedeId);
  const empIds = emps.map(e => e.id);
  
  const total = emps.length;
  const activos = emps.filter(e => e.estado === 'Activo').length;
  const enVac = emps.filter(e => e.estado === 'En Vacaciones').length;

  const filteredVacaciones = MOCK.vacaciones.filter(v => empIds.includes(v.empId));
  const pendVac = filteredVacaciones.filter(v => v.estado === 'Pendiente').length;

  // Fechas reales
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const fechaLarga = now.toLocaleDateString('es-PE', options);
  const fechaHoyISO = now.toISOString().split('T')[0];

  const filteredAsistencias = MOCK.asistencias.filter(a => empIds.includes(a.empId));
  const asistentesHoy = filteredAsistencias.filter(a => a.fecha === fechaHoyISO);

  const presentes = asistentesHoy.filter(a => a.tipo !== 'Falta').length;
  const tardanzas = asistentesHoy.filter(a => a.tipo === 'Tardanza').length;
  
  const asistenciaPct = total > 0 ? Math.round((presentes / total) * 100) : 0;

  const todayAtt = asistentesHoy.slice(0, 6);
  const pendVacList = filteredVacaciones.filter(v => v.estado === 'Pendiente').slice(0, 4);

  const attRows = todayAtt.length > 0 ? todayAtt.map(a => {
    const emp = getEmp(a.empId);
    const dept = getDept(emp.deptId);
    return `<tr>
      <td><div class="td-user">
        <div class="td-avatar ${avatarColor(emp.id)}">${empInitials(emp)}</div>
        <div><div class="td-name">${empFullName(emp)}</div><div class="td-sub">${dept ? dept.nombre : ''}</div></div>
      </div></td>
      <td>${a.entrada}</td>
      <td>${a.salida || '—'}</td>
      <td>${horasDiff(a.entrada, a.salida)}</td>
      <td><span class="badge ${tipoColor(a.tipo)} badge-dot">${a.tipo}</span></td>
    </tr>`;
  }).join('') : `<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--text-muted);">No hay registros de asistencia hoy en esta sede</td></tr>`;

  const vacRows = pendVacList.length > 0 ? pendVacList.map(v => {
    const emp = getEmp(v.empId);
    return `<tr>
      <td><div class="td-user">
        <div class="td-avatar ${avatarColor(emp.id)}">${empInitials(emp)}</div>
        <div><div class="td-name">${empFullName(emp)}</div><div class="td-sub">${fmtDate(v.inicio)} → ${fmtDate(v.fin)}</div></div>
      </div></td>
      <td>${v.dias} días</td>
      <td>${v.motivo}</td>
      <td>
        <button class="btn btn-success btn-sm" onclick="aprobarVac(${v.id})">Aprobar</button>
        <button class="btn btn-ghost btn-sm" style="margin-left:4px" onclick="rechazarVac(${v.id})">Rechazar</button>
      </td>
    </tr>`;
  }).join('') : `<tr><td colspan="4" style="text-align:center; padding:30px; color:var(--text-muted);">No hay solicitudes pendientes en esta sede</td></tr>`;

  return `
  <div class="view-header">
    <div class="view-header-left">
      <h1>Panel de Control</h1>
      <p style="text-transform: capitalize;">${fechaLarga} · Bienvenido a Telecable RR.HH.</p>
    </div>
    <div class="view-header-actions">
      <button class="btn btn-ghost"><i data-lucide="download" style="width:15px;height:15px"></i> Exportar</button>
      <button class="btn btn-primary" onclick="navigate('empleados')"><i data-lucide="plus" style="width:15px;height:15px"></i> Nuevo Empleado</button>
    </div>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-icon indigo"><i data-lucide="users" style="width:22px;height:22px"></i></div>
      <div class="stat-content">
        <div class="stat-number">${total}</div>
        <div class="stat-label">Total Empleados</div>
        <div class="stat-change pos">Activos: ${activos}</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon green"><i data-lucide="user-check" style="width:22px;height:22px"></i></div>
      <div class="stat-content">
        <div class="stat-number">${presentes}</div>
        <div class="stat-label">Presentes Hoy</div>
        <div class="stat-change pos">${asistenciaPct}% de asistencia</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon amber"><i data-lucide="clock" style="width:22px;height:22px"></i></div>
      <div class="stat-content">
        <div class="stat-number">${tardanzas}</div>
        <div class="stat-label">Tardanzas Hoy</div>
        <div class="stat-change ${tardanzas > 0 ? 'neg' : 'pos'}">${tardanzas > 0 ? 'Revisar reportes' : '¡Excelente puntualidad!'}</div>
      </div>
    </div>
    <div class="stat-card">
      <div class="stat-icon blue"><i data-lucide="umbrella" style="width:22px;height:22px"></i></div>
      <div class="stat-content">
        <div class="stat-number">${enVac}</div>
        <div class="stat-label">En Vacaciones</div>
        <div class="stat-change pos">${pendVac} solicitudes pendientes</div>
      </div>
    </div>
  </div>

  <div class="grid-2" style="gap:16px;margin-bottom:16px">
    <div class="card">
      <div class="card-header">
        <div><div class="card-title">Asistencia Semanal</div><div class="card-subtitle">Últimos 7 días</div></div>
      </div>
      <div class="card-body"><div class="chart-wrap" style="height:220px"><canvas id="chartAsistencia"></canvas></div></div>
    </div>
    <div class="card">
      <div class="card-header">
        <div><div class="card-title">Distribución por Dpto.</div><div class="card-subtitle">Total ${total} empleados en sede</div></div>
      </div>
      <div class="card-body"><div class="chart-wrap" style="height:220px"><canvas id="chartDepts"></canvas></div></div>
    </div>
  </div>

  <div class="grid-2" style="gap:16px">
    <div class="card">
      <div class="card-header">
        <div><div class="card-title">Asistencia de Hoy</div><div class="card-subtitle">Ingresos recientes</div></div>
        <button class="btn btn-ghost btn-sm" onclick="navigate('asistencia')">Ver todo</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Empleado</th><th>Entrada</th><th>Salida</th><th>Horas</th><th>Estado</th></tr></thead>
          <tbody>${attRows}</tbody>
        </table>
      </div>
    </div>
    <div class="card">
      <div class="card-header">
        <div><div class="card-title">Solicitudes Pendientes</div><div class="card-subtitle">${pendVac} por aprobar</div></div>
        <button class="btn btn-ghost btn-sm" onclick="navigate('vacaciones')">Ver todo</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Empleado</th><th>Días</th><th>Motivo</th><th>Acción</th></tr></thead>
          <tbody id="pendVacTable">${vacRows}</tbody>
        </table>
      </div>
    </div>
  </div>`;
}

function initDashboard() {
  const days = MOCK.weeklyAttendance.map(d => d.day);
  const pres = MOCK.weeklyAttendance.map(d => d.pres);
  const tard = MOCK.weeklyAttendance.map(d => d.tard);
  const falt = MOCK.weeklyAttendance.map(d => d.falt);

  new Chart(document.getElementById('chartAsistencia'), {
    type: 'bar',
    data: {
      labels: days,
      datasets: [
        { label: 'Presentes', data: pres, backgroundColor: '#10b981', borderRadius: 5, borderSkipped: false },
        { label: 'Tardanzas', data: tard, backgroundColor: '#f59e0b', borderRadius: 5, borderSkipped: false },
        { label: 'Faltas', data: falt, backgroundColor: '#ef4444', borderRadius: 5, borderSkipped: false },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } },
      scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, beginAtZero: true, max: 16, grid: { color: '#f1f5f9' }, ticks: { stepSize: 4 } } }
    }
  });

  // 2. HACEMOS EL GRÁFICO DE DONA DINÁMICO POR SEDE
  const empsInSede = MOCK.empleados.filter(e => e.sedeId === currentSedeId);
  const deptNames = [];
  const deptCounts = [];
  const deptColors = [];
  const colorPalette = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#0ea5e9'];

  MOCK.departamentos.forEach((d, index) => {
      // Contamos cuántos empleados de esta sede pertenecen a este departamento
      const count = empsInSede.filter(e => e.deptId === d.id).length;
      if (count > 0) {
          deptNames.push(d.nombre);
          deptCounts.push(count);
          deptColors.push(colorPalette[index % colorPalette.length]);
      }
  });

  // Si la sede no tiene empleados, mostramos un gráfico gris vacío
  if (deptCounts.length === 0) {
      deptNames.push("Sin personal");
      deptCounts.push(1);
      deptColors.push("#e2e8f0");
  }

  new Chart(document.getElementById('chartDepts'), {
    type: 'doughnut',
    data: {
      labels: deptNames,
      datasets: [{ data: deptCounts, backgroundColor: deptColors, borderWidth: 2, borderColor: '#fff', hoverOffset: 6 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '68%',
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 }, padding: 12 } } }
    }
  });
}