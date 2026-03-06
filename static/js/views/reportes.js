// ============================================================
// VIEW: Reportes y Dashboard (Conectado a Datos Reales - PostgreSQL)
// Ruta: static/js/views/reportes.js
// ============================================================

window.renderReportes = function() {
    // 1. Obtener datos reales
    const emps = window.realEmpleados || [];
    const asistencias = window.realAsistencias || [];
    const depts = window.realDepartamentos || [];
    const sedes = window.realSedes || [];

    // Obtener sede actual
    const currentSedeId = typeof window.currentSedeId !== 'undefined' ? window.currentSedeId : (sedes[0] ? sedes[0].id : null);

    // Filtrar empleados por la sede actual
    const empsSede = emps.filter(e => !e.sede_id || String(e.sede_id) === String(currentSedeId));
    const empSedeIds = empsSede.map(e => String(e.id));

    // Filtrar asistencias correspondientes a los empleados de la sede
    const asistenciasSede = asistencias.filter(a => empSedeIds.includes(String(a.empleado_id || a.empId)));

    // Helpers locales
    const getEmpLocal = (id) => emps.find(e => String(e.id) === String(id));
    const getFullName = (emp) => emp ? `${emp.nombres || ''} ${emp.apellidos || ''}`.trim() : 'Desconocido';
    const getInitials = (emp) => emp ? ((emp.nombres ? emp.nombres.charAt(0) : 'X') + (emp.apellidos ? emp.apellidos.charAt(0) : 'X')).toUpperCase() : 'XX';
    const getAvatarColor = (id) => {
        const colors = ['av-indigo', 'av-blue', 'av-green', 'av-purple', 'av-amber', 'av-red'];
        return colors[(id || 0) % colors.length];
    };

    // 2. Obtener el mes actual
    const hoyObj = new Date();
    const mesActual = hoyObj.toLocaleDateString('es-ES', { month: 'short' });
    const mesCompleto = hoyObj.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    // 3. Cálculos para los KPIs Superiores
    const empleadosActivos = empsSede.filter(e => e.estado !== 'Cesado');
    const totalCesados = empsSede.filter(e => e.estado === 'Cesado').length;
    
    // Planilla Total Bruta
    const planillaBruta = empleadosActivos.reduce((sum, e) => sum + parseFloat(e.sueldo_base || e.sueldo || 0), 0);
    const asigFamTotal = empleadosActivos.filter(e => (e.nombres || '').includes('Rocio')).length * 102.50; // Lógica original mantenida
    const totalPlanilla = planillaBruta + asigFamTotal;

    // Asistencias, Faltas y Tardanzas (sobre el total histórico o podrías filtrar por mes si tienes la fecha)
    const faltas = asistenciasSede.filter(a => a.tipo === 'Falta').length;
    const tardanzas = asistenciasSede.filter(a => a.tipo === 'Tardanza').length;

    // % de Asistencia (Aproximado)
    const diasEsperados = empleadosActivos.length * 20; // Estimación de días laborables
    const presentes = asistenciasSede.filter(a => a.tipo !== 'Falta').length;
    let pctAsistencia = diasEsperados > 0 ? Math.round((presentes / diasEsperados) * 100) : 0;
    if (pctAsistencia > 100) pctAsistencia = 100;

    // % de Rotación
    const rotacion = empsSede.length > 0 ? Math.round((totalCesados / empsSede.length) * 100) : 0;

    // 4. Cálculos para Planilla por Departamento (Barras)
    const deptSueldos = {};
    empleadosActivos.forEach(e => {
        const dId = e.departamento_id || e.deptId;
        const dept = depts.find(d => String(d.id) === String(dId)) || { nombre: 'General' };
        if (!deptSueldos[dept.nombre]) deptSueldos[dept.nombre] = 0;
        deptSueldos[dept.nombre] += parseFloat(e.sueldo_base || e.sueldo || 0);
    });

    const maxSueldoDept = Math.max(...Object.values(deptSueldos), 1); 
    const coloresDepts = ['#4f46e5', '#10b981', '#f59e0b', '#0ea5e9'];
    
    let barrasDeptHTML = Object.keys(deptSueldos).map((deptName, i) => {
        const totalDept = deptSueldos[deptName];
        const porcentaje = Math.round((totalDept / maxSueldoDept) * 100);
        const color = coloresDepts[i % coloresDepts.length];
        return `
        <div style="margin-bottom: 15px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:0.85rem; color:#4b5563;">
                <span>${deptName}</span>
                <span style="font-weight:700; color:#111827;">S/ ${totalDept.toFixed(2)}</span>
            </div>
            <div style="width:100%; height:20px; background:#f3f4f6; border-radius:4px; overflow:hidden;">
                <div style="width:${porcentaje}%; height:100%; background:${color}; border-radius:4px; transition:width 1s;"></div>
            </div>
        </div>`;
    }).join('');

    // 5. Cálculos para Top Tardanzas
    const rankingTardanzas = {};
    asistenciasSede.filter(a => a.tipo === 'Tardanza').forEach(a => {
        const empId = a.empleado_id || a.empId;
        if (!rankingTardanzas[empId]) rankingTardanzas[empId] = 0;
        rankingTardanzas[empId] += 1;
    });

    const topTardanzasHTML = Object.keys(rankingTardanzas)
        .sort((a, b) => rankingTardanzas[b] - rankingTardanzas[a])
        .slice(0, 4)
        .map(empId => {
            const emp = getEmpLocal(empId);
            const bgColor = emp ? (emp.avatar_color || getAvatarColor(emp.id)) : 'av-gray';
            
            return `
            <div style="display:flex; justify-content:space-between; align-items:center; padding: 12px 0; border-bottom: 1px solid #f3f4f6;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <div class="td-avatar ${bgColor.startsWith('av-') ? bgColor : ''}" style="${bgColor.startsWith('#') ? 'background:'+bgColor+'; color:#fff;' : ''} width:30px; height:30px; font-size:0.7rem;">
                        ${getInitials(emp)}
                    </div>
                    <span style="font-weight:600; color:#111827; font-size:0.9rem;">${getFullName(emp)}</span>
                </div>
                <div style="font-weight:800; color:#f59e0b; background:#fffbeb; padding:4px 10px; border-radius:20px; font-size:0.8rem;">
                    ${rankingTardanzas[empId]} veces
                </div>
            </div>`;
        }).join('') || '<div style="padding:20px; text-align:center; color:#9ca3af; font-size:0.9rem;">Excelente: No hay tardanzas registradas</div>';

    return `
    <div class="view-header no-print" style="animation: fadeIn 0.4s ease-out;">
        <div class="view-header-left">
            <h1>Reportes</h1>
            <p>Análisis y estadísticas del capital humano</p>
        </div>
        <div class="view-header-actions">
            <select class="filter-select" style="min-width: 150px;"><option>${mesCompleto.charAt(0).toUpperCase() + mesCompleto.slice(1)}</option></select>
            <button class="btn btn-primary" onclick="window.imprimirReporte()"><i data-lucide="printer" style="width:15px;height:15px"></i> Exportar PDF</button>
        </div>
    </div>

    <div id="reportePrintArea" style="animation: fadeIn 0.4s ease-out;">
        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:20px; margin-bottom:25px;">
            <div style="background:white; border-radius:12px; padding:20px; border:1px solid #e5e7eb; display:flex; align-items:center; gap:15px; box-shadow:0 2px 4px rgba(0,0,0,0.02);">
                <div style="background:#ecfdf5; color:#10b981; width:50px; height:50px; border-radius:12px; display:flex; align-items:center; justify-content:center;">
                    <i data-lucide="trending-up" style="width:24px; height:24px;"></i>
                </div>
                <div>
                    <div style="font-size:1.8rem; font-weight:800; color:#111827; line-height:1;">${pctAsistencia}%</div>
                    <div style="font-size:0.85rem; color:#6b7280; font-weight:500; margin-bottom:4px;">% Asistencia (${mesActual})</div>
                    <div style="font-size:0.75rem; color:#10b981; font-weight:600;">Métrica de sede</div>
                </div>
            </div>
            
            <div style="background:white; border-radius:12px; padding:20px; border:1px solid #e5e7eb; display:flex; align-items:center; gap:15px; box-shadow:0 2px 4px rgba(0,0,0,0.02);">
                <div style="background:#fffbeb; color:#f59e0b; width:50px; height:50px; border-radius:12px; display:flex; align-items:center; justify-content:center;">
                    <i data-lucide="clock" style="width:24px; height:24px;"></i>
                </div>
                <div>
                    <div style="font-size:1.8rem; font-weight:800; color:#111827; line-height:1;">${tardanzas}</div>
                    <div style="font-size:0.85rem; color:#6b7280; font-weight:500; margin-bottom:4px;">Llegadas Tarde (${mesActual})</div>
                    <div style="font-size:0.75rem; color:${tardanzas > 5 ? '#ef4444' : '#10b981'}; font-weight:600;">
                        ${tardanzas > 5 ? '↑ Alerta de puntualidad' : 'Puntualidad controlada'}
                    </div>
                </div>
            </div>

            <div style="background:white; border-radius:12px; padding:20px; border:1px solid #e5e7eb; display:flex; align-items:center; gap:15px; box-shadow:0 2px 4px rgba(0,0,0,0.02);">
                <div style="background:#eff6ff; color:#3b82f6; width:50px; height:50px; border-radius:12px; display:flex; align-items:center; justify-content:center;">
                    <i data-lucide="banknote" style="width:24px; height:24px;"></i>
                </div>
                <div>
                    <div style="font-size:1.6rem; font-weight:800; color:#111827; line-height:1;">S/ ${(totalPlanilla/1000).toFixed(1)}K</div>
                    <div style="font-size:0.85rem; color:#6b7280; font-weight:500; margin-bottom:4px;">Planilla Bruta (${mesActual})</div>
                    <div style="font-size:0.75rem; color:#10b981; font-weight:600;">Sede actual</div>
                </div>
            </div>

            <div style="background:white; border-radius:12px; padding:20px; border:1px solid #e5e7eb; display:flex; align-items:center; gap:15px; box-shadow:0 2px 4px rgba(0,0,0,0.02);">
                <div style="background:#fef2f2; color:#ef4444; width:50px; height:50px; border-radius:12px; display:flex; align-items:center; justify-content:center;">
                    <i data-lucide="user-minus" style="width:24px; height:24px;"></i>
                </div>
                <div>
                    <div style="font-size:1.8rem; font-weight:800; color:#111827; line-height:1;">${rotacion}%</div>
                    <div style="font-size:0.85rem; color:#6b7280; font-weight:500; margin-bottom:4px;">Rotación (${mesActual})</div>
                    <div style="font-size:0.75rem; color:${rotacion === 0 ? '#10b981' : '#ef4444'}; font-weight:600;">
                        ${rotacion === 0 ? 'Sin bajas registradas' : `${totalCesados} cesados en total`}
                    </div>
                </div>
            </div>
        </div>

        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px;">
            
            <div style="display:flex; flex-direction:column; gap:20px;">
                <div style="background:white; border-radius:12px; border:1px solid #e5e7eb; padding:20px; box-shadow:0 2px 4px rgba(0,0,0,0.02);">
                    <h3 style="margin:0 0 5px 0; font-size:1.1rem; color:#111827;">Desglose de Asistencia</h3>
                    <p style="margin:0 0 20px 0; font-size:0.85rem; color:#6b7280;">Distribución de incidencias en la sede</p>
                    
                    <div style="display:flex; justify-content:space-between; text-align:center; margin-bottom:20px;">
                        <div style="flex:1; padding:15px; border-right:1px solid #e5e7eb;">
                            <div style="font-size:1.5rem; font-weight:800; color:#10b981;">${presentes}</div>
                            <div style="font-size:0.8rem; color:#6b7280; font-weight:600;">PRESENTES</div>
                        </div>
                        <div style="flex:1; padding:15px; border-right:1px solid #e5e7eb;">
                            <div style="font-size:1.5rem; font-weight:800; color:#f59e0b;">${tardanzas}</div>
                            <div style="font-size:0.8rem; color:#6b7280; font-weight:600;">TARDANZAS</div>
                        </div>
                        <div style="flex:1; padding:15px;">
                            <div style="font-size:1.5rem; font-weight:800; color:#ef4444;">${faltas}</div>
                            <div style="font-size:0.8rem; color:#6b7280; font-weight:600;">FALTAS</div>
                        </div>
                    </div>
                </div>

                <div style="background:white; border-radius:12px; border:1px solid #e5e7eb; padding:20px; box-shadow:0 2px 4px rgba(0,0,0,0.02);">
                    <h3 style="margin:0 0 5px 0; font-size:1.1rem; color:#111827;">Planilla por Departamento</h3>
                    <p style="margin:0 0 20px 0; font-size:0.85rem; color:#6b7280;">Gasto total en sueldo bruto (Sede actual)</p>
                    
                    <div>
                        ${barrasDeptHTML || '<p style="color:#9ca3af; text-align:center;">No hay datos suficientes</p>'}
                    </div>
                </div>
            </div>

            <div style="display:flex; flex-direction:column; gap:20px;">
                <div style="background:white; border-radius:12px; border:1px solid #e5e7eb; padding:20px; box-shadow:0 2px 4px rgba(0,0,0,0.02); flex:1;">
                    <h3 style="margin:0 0 5px 0; font-size:1.1rem; color:#111827;">Ranking Impuntualidad</h3>
                    <p style="margin:0 0 20px 0; font-size:0.85rem; color:#6b7280;">Colaboradores con más tardanzas</p>
                    
                    <div>
                        ${topTardanzasHTML}
                    </div>
                </div>
            </div>

        </div>
    </div>
    `;
};

window.initReportes = function() {
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.imprimirReporte = function() {
    const style = document.createElement('style');
    style.innerHTML = `
        @media print {
            body * { visibility: hidden !important; }
            #reportePrintArea, #reportePrintArea * { visibility: visible !important; }
            #reportePrintArea { position: absolute; left: 0; top: 0; width: 100%; }
            .sidebar, .app-header, .no-print { display: none !important; }
            @page { margin: 1.5cm; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
    `;
    document.head.appendChild(style);
    window.print();
    setTimeout(() => document.head.removeChild(style), 1000);
};