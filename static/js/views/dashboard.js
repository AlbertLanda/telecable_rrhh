// ============================================================
// VIEW: Dashboard (Autocontenido - Sin dependencias externas)
// ============================================================

window.renderDashboard = function() {
    // 1. Obtener datos desde la inyección del HTML (window.real...)
    const currentSedeId = document.getElementById('currentSede')?.value || (window.realSedes[0]?.id) || null;
    
    // 2. Filtramos empleados por la sede actual
    const emps = window.realEmpleados.filter(e => String(e.sedeId || e.sede_id) === String(currentSedeId));
    const empIds = emps.map(e => String(e.id));
    
    const total = emps.length;
    const activos = emps.filter(e => e.estado === 'Activo').length;
    const enVac = emps.filter(e => e.estado === 'En Vacaciones').length;

    // 3. Filtrar vacaciones y asistencias por los empleados de esta sede
    const filteredVacaciones = window.realVacaciones.filter(v => empIds.includes(String(v.empId || v.empleado_id)));
    const pendVac = filteredVacaciones.filter(v => v.estado === 'Pendiente').length;

    // 4. Fechas reales
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const fechaLarga = now.toLocaleDateString('es-PE', options);
    const offset = now.getTimezoneOffset() * 60000;
    const fechaHoyISO = (new Date(now - offset)).toISOString().split('T')[0];

    const filteredAsistencias = window.realAsistencias.filter(a => empIds.includes(String(a.empId || a.empleado_id)));
    const asistentesHoy = filteredAsistencias.filter(a => String(a.fecha) === fechaHoyISO);

    const presentes = asistentesHoy.filter(a => a.tipo !== 'Falta').length;
    const tardanzas = asistentesHoy.filter(a => a.tipo === 'Tardanza').length;
    const asistenciaPct = total > 0 ? Math.round((presentes / total) * 100) : 0;

    // --- FUNCIONES HELPER LOCALES ---
    const getEmpLocal = (id) => window.realEmpleados.find(e => String(e.id) === String(id)) || {};
    const getDeptLocal = (id) => window.realDepartamentos.find(d => String(d.id) === String(id)) || {};
    
    const formatTimeDiff = (entrada, salida) => {
        if (!entrada || !salida || entrada === '—' || salida === '—') return '—';
        try {
            let [h1, m1] = entrada.split(':').map(Number);
            let [h2, m2] = salida.split(':').map(Number);
            let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
            if (diff <= 0) return '—';
            return `${Math.floor(diff / 60)}h ${diff % 60}m`;
        } catch(e) { return '—'; }
    };

    const formatDateLocal = (dateStr) => {
        if (!dateStr || dateStr === '—') return '—';
        const d = new Date(dateStr);
        if (isNaN(d)) return dateStr;
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return `${d.getUTCDate()} ${meses[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    };

    const getTipoColor = (tipo) => {
        if (tipo === 'Asistencia') return 'badge-green';
        if (tipo === 'Tardanza') return 'badge-amber';
        if (tipo === 'Falta') return 'badge-red';
        return 'badge-blue';
    };

    const getAvatarColor = (id) => {
        const colors = ['av-indigo', 'av-blue', 'av-green', 'av-purple', 'av-amber', 'av-red'];
        return colors[(id || 0) % colors.length];
    };
    // --------------------------------

    // 5. Renderizar Tablas
    const todayAtt = asistentesHoy.slice(0, 6);
    const pendVacList = filteredVacaciones.filter(v => v.estado === 'Pendiente').slice(0, 4);

    const attRows = todayAtt.length > 0 ? todayAtt.map(a => {
        const empId = a.empId || a.empleado_id;
        const emp = getEmpLocal(empId);
        const dept = getDeptLocal(emp.deptId || emp.departamento_id);
        const fullName = `${emp.nombres || ''} ${emp.apellidos || ''}`.trim() || 'Desconocido';
        const initials = (emp.nombres ? emp.nombres.charAt(0) : 'X') + (emp.apellidos ? emp.apellidos.charAt(0) : 'X');
        const hIn = a.entrada || a.hora_entrada || '—';
        const hOut = a.salida || a.hora_salida || '—';

        return `<tr>
            <td><div class="td-user">
                <div class="td-avatar ${getAvatarColor(emp.id)}">${initials.toUpperCase()}</div>
                <div><div class="td-name">${fullName}</div><div class="td-sub">${dept.nombre || 'Sin Área'}</div></div>
            </div></td>
            <td>${hIn}</td>
            <td>${hOut}</td>
            <td>${formatTimeDiff(hIn, hOut)}</td>
            <td><span class="badge ${getTipoColor(a.tipo)} badge-dot">${a.tipo}</span></td>
        </tr>`;
    }).join('') : `<tr><td colspan="5" style="text-align:center; padding:30px; color:var(--text-muted);">No hay registros de asistencia hoy en esta sede</td></tr>`;

    const vacRows = pendVacList.length > 0 ? pendVacList.map(v => {
        const empId = v.empId || v.empleado_id;
        const emp = getEmpLocal(empId);
        const fullName = `${emp.nombres || ''} ${emp.apellidos || ''}`.trim() || 'Desconocido';
        const initials = (emp.nombres ? emp.nombres.charAt(0) : 'X') + (emp.apellidos ? emp.apellidos.charAt(0) : 'X');
        const fIn = v.inicio || v.fecha_inicio;
        const fOut = v.fin || v.fecha_fin;

        return `<tr>
            <td><div class="td-user">
                <div class="td-avatar ${getAvatarColor(emp.id)}">${initials.toUpperCase()}</div>
                <div><div class="td-name">${fullName}</div><div class="td-sub">${formatDateLocal(fIn)} → ${formatDateLocal(fOut)}</div></div>
            </div></td>
            <td>${v.dias || v.dias_totales} días</td>
            <td>${v.motivo}</td>
            <td>
                <button class="btn btn-success btn-sm" onclick="aprobarVac(${v.id})">Aprobar</button>
                <button class="btn btn-ghost btn-sm" style="margin-left:4px" onclick="rechazarVac(${v.id})">Rechazar</button>
            </td>
        </tr>`;
    }).join('') : `<tr><td colspan="4" style="text-align:center; padding:30px; color:var(--text-muted);">No hay solicitudes pendientes en esta sede</td></tr>`;

    return `
    <div class="view-header" style="animation: fadeIn 0.4s ease-out;">
        <div class="view-header-left">
            <h1>Panel de Control</h1>
            <p style="text-transform: capitalize;">${fechaLarga} · Bienvenido a Telecable RR.HH.</p>
        </div>
        <div class="view-header-actions">
            <button class="btn btn-ghost" onclick="window.print()" title="Imprimir o guardar como PDF">
                <i data-lucide="printer" style="width:15px;height:15px"></i> Imprimir Resumen
            </button>
        </div>
    </div>

    <div class="stats-grid" style="animation: fadeIn 0.4s ease-out;">
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

    <div class="grid-2" style="gap:16px;margin-bottom:16px; animation: fadeIn 0.4s ease-out;">
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

    <div class="grid-2" style="gap:16px; animation: fadeIn 0.4s ease-out;">
        <div class="card">
            <div class="card-header">
                <div><div class="card-title">Asistencia de Hoy</div><div class="card-subtitle">Ingresos recientes</div></div>
                <button class="btn btn-ghost btn-sm" onclick="if(typeof window.navigate==='function') window.navigate('asistencia')">Ver todo</button>
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
                <button class="btn btn-ghost btn-sm" onclick="if(typeof window.navigate==='function') window.navigate('vacaciones')">Ver todo</button>
            </div>
            <div class="table-wrap">
                <table>
                    <thead><tr><th>Empleado</th><th>Días</th><th>Motivo</th><th>Acción</th></tr></thead>
                    <tbody id="pendVacTable">${vacRows}</tbody>
                </table>
            </div>
        </div>
    </div>`;
};

window.initDashboard = function() {
    // Inicializar Gráficos con Chart.js
    const weeklyData = window.realWeeklyAtt || [];
    const days = weeklyData.map(d => d.day);
    const pres = weeklyData.map(d => d.pres);
    const tard = weeklyData.map(d => d.tard);
    const falt = weeklyData.map(d => d.falt);

    const canvasAsistencia = document.getElementById('chartAsistencia');
    if (canvasAsistencia) {
        new Chart(canvasAsistencia, {
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
    }

    const canvasDepts = document.getElementById('chartDepts');
    if (canvasDepts) {
        const currentSedeId = document.getElementById('currentSede')?.value || (window.realSedes[0]?.id) || null;
        const empsInSede = window.realEmpleados.filter(e => String(e.sedeId || e.sede_id) === String(currentSedeId));
        
        const deptNames = [];
        const deptCounts = [];
        const deptColors = [];
        const colorPalette = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#0ea5e9'];

        window.realDepartamentos.forEach((d, index) => {
            const count = empsInSede.filter(e => String(e.deptId || e.departamento_id) === String(d.id)).length;
            if (count > 0) {
                deptNames.push(d.nombre);
                deptCounts.push(count);
                deptColors.push(colorPalette[index % colorPalette.length]);
            }
        });

        if (deptCounts.length === 0) {
            deptNames.push("Sin personal");
            deptCounts.push(1);
            deptColors.push("#e2e8f0");
        }

        new Chart(canvasDepts, {
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
};