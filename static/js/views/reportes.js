// ============================================================
// VIEW: Reportes
// ============================================================

function renderReportes() {
    return `
  <div class="view-header">
    <div class="view-header-left"><h1>Reportes</h1><p>Análisis y estadísticas del capital humano</p></div>
    <div class="view-header-actions">
      <select class="filter-select">
        <option>Febrero 2026</option><option>Enero 2026</option><option>Diciembre 2025</option>
      </select>
      <button class="btn btn-ghost"><i data-lucide="download" style="width:15px;height:15px"></i> Exportar PDF</button>
    </div>
  </div>

  <div class="stats-grid" style="margin-bottom:20px">
    <div class="stat-card">
      <div class="stat-icon green"><i data-lucide="trending-up" style="width:22px;height:22px"></i></div>
      <div><div class="stat-number">87%</div><div class="stat-label">% Asistencia (Feb)</div><div class="stat-change pos">↑ 3% vs Enero</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon amber"><i data-lucide="clock" style="width:22px;height:22px"></i></div>
      <div><div class="stat-number">38</div><div class="stat-label">Hrs. Extra (Feb)</div><div class="stat-change neg">↑ 8 vs Enero</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon indigo"><i data-lucide="banknote" style="width:22px;height:22px"></i></div>
      <div><div class="stat-number">S/ ${(MOCK.empleados.reduce((s, e) => s + calcPlanilla(e).neto, 0) / 1000).toFixed(0)}K</div><div class="stat-label">Planilla Neta (Feb)</div><div class="stat-change pos">↑ S/ 2.1K vs Enero</div></div>
    </div>
    <div class="stat-card">
      <div class="stat-icon red"><i data-lucide="user-minus" style="width:22px;height:22px"></i></div>
      <div><div class="stat-number">0%</div><div class="stat-label">Rotación (Feb)</div><div class="stat-change pos">Sin bajas este mes</div></div>
    </div>
  </div>

  <div class="grid-2" style="gap:16px;margin-bottom:16px">
    <div class="card">
      <div class="card-header">
        <div><div class="card-title">Asistencia Mensual</div><div class="card-subtitle">Porcentaje diario · Febrero 2026</div></div>
      </div>
      <div class="card-body"><div class="chart-wrap" style="height:220px"><canvas id="chartRptAtt"></canvas></div></div>
    </div>
    <div class="card">
      <div class="card-header">
        <div><div class="card-title">Planilla por Departamento</div><div class="card-subtitle">Gasto total en sueldo bruto</div></div>
      </div>
      <div class="card-body"><div class="chart-wrap" style="height:220px"><canvas id="chartRptPlanilla"></canvas></div></div>
    </div>
  </div>

  <div class="grid-2" style="gap:16px">
    <div class="card">
      <div class="card-header">
        <div class="card-title">Tipos de Faltismo</div>
      </div>
      <div class="card-body">
        <div class="chart-wrap" style="height:200px"><canvas id="chartRptTipos"></canvas></div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Top Horas Extra</div></div>
      <div class="card-body">
        ${['Roberto Chávez', 'Carlos Mendoza', 'Diego Mamani', 'Luis Torres', 'Fernando Ccallo'].map((n, i) => {
        const hrs = [18, 12, 8, 5, 3][i];
        return `<div style="margin-bottom:14px">
            <div class="between mb-4" style="margin-bottom:4px">
              <span style="font-size:.83rem;font-weight:500">${n}</span>
              <span style="font-size:.82rem;font-weight:700;color:var(--primary)">${hrs} hrs</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width:${Math.round(hrs / 18 * 100)}%;background:var(--primary)"></div>
            </div>
          </div>`;
    }).join('')}
      </div>
    </div>
  </div>`;
}

function initReportes() {
    // Attendance trend
    new Chart(document.getElementById('chartRptAtt'), {
        type: 'line',
        data: {
            labels: Array.from({ length: 19 }, (_, i) => `${i + 3} Feb`),
            datasets: [{
                label: '% Asistencia',
                data: [85, 88, 90, 82, 87, 92, 89, 86, 91, 88, 84, 90, 93, 87, 88, 85, 89, 92, 87],
                borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,.08)',
                fill: true, tension: 0.4, pointRadius: 3, pointBackgroundColor: '#6366f1'
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { min: 70, max: 100, grid: { color: '#f1f5f9' }, ticks: { callback: v => v + '%' } },
                x: { grid: { display: false }, ticks: { maxTicksLimit: 8 } }
            }
        }
    });

    // Payroll by dept
    const deptData = MOCK.departamentos.map(d => ({
        nombre: d.nombre,
        total: MOCK.empleados.filter(e => e.deptId === d.id).reduce((s, e) => s + calcPlanilla(e).brutoTotal, 0)
    }));
    new Chart(document.getElementById('chartRptPlanilla'), {
        type: 'bar',
        data: {
            labels: deptData.map(d => d.nombre),
            datasets: [{ label: 'Planilla Bruta', data: deptData.map(d => d.total), backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#9333ea'], borderRadius: 6 }]
        },
        options: {
            responsive: true, maintainAspectRatio: false, indexAxis: 'y',
            plugins: { legend: { display: false } },
            scales: { x: { grid: { color: '#f1f5f9' }, ticks: { callback: v => 'S/' + Math.round(v / 1000) + 'K' } }, y: { grid: { display: false } } }
        }
    });

    // Absence types
    const att = MOCK.asistencias;
    new Chart(document.getElementById('chartRptTipos'), {
        type: 'doughnut',
        data: {
            labels: ['Asistencia', 'Tardanza', 'Falta', 'Hora Extra'],
            datasets: [{
                data: [
                    att.filter(a => a.tipo === 'Asistencia').length,
                    att.filter(a => a.tipo === 'Tardanza').length,
                    att.filter(a => a.tipo === 'Falta').length,
                    att.filter(a => a.tipo === 'Hora Extra').length,
                ],
                backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#6366f1'],
                borderWidth: 2, borderColor: '#fff', hoverOffset: 6
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, cutout: '60%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 }, padding: 10 } } } }
    });
}
