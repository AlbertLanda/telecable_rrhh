// ============================================================
// VIEW: Mi Asistencia (Sincronizado con PostgreSQL y Autocontenido)
// Ruta: static/js/views/mi-asistencia.js
// ============================================================

// Variable global para almacenar las asistencias de la BD
let dbMisAsistencias = [];

async function cargarMisAsistencias() {
    try {
        const res = await fetch('/api/asistencias/listar/');
        let data = await res.json();
        // Por si Django lo envía dentro de "data"
        if(data.data) data = data.data;
        dbMisAsistencias = data;
    } catch (error) {
        console.error("Error conectando a PostgreSQL para asistencias:", error);
    }
}

// ─── HELPER LOCAL SEGURO: Obtener empleado logueado ──────
const getMiPerfil = () => { 
    const rawData = localStorage.getItem('currentUser');
    let id = window.myEmpId; 
    if (rawData) {
        try {
            const user = JSON.parse(rawData);
            id = user.emp_id || id; 
        } catch(e){}
    }
    const emps = window.realEmpleados || [];
    return emps.find(e => String(e.id) === String(id)); 
};

// ─── HELPERS DE FORMATO ────────────────────────────────────
const ma_fmtDate = (dateStr) => {
    if (!dateStr || dateStr === '—') return '—';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${d.getUTCDate()} ${meses[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};

const ma_horasDiff = (entrada, salida) => {
    if (!entrada || !salida || entrada === '—' || salida === '—') return '—';
    try {
        let [h1, m1] = entrada.split(':').map(Number);
        let [h2, m2] = salida.split(':').map(Number);
        let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
        if (diff <= 0) return '—';
        return `${Math.floor(diff / 60)}h ${diff % 60}m`;
    } catch(e) { return '—'; }
};

window.renderMiAsistencia = function() {
    // Intentar usar la función del Portal si existe, sino usar la de respaldo
    const emp = typeof window.myEmp === 'function' ? window.myEmp() : getMiPerfil();
    
    if (!emp) return `<div style="padding:40px; text-align:center; color:#ef4444;">Error: No se pudo cargar el perfil del empleado.</div>`;

    // 🔥 AUTO-ARRANQUE CON LOADER: Si la BD aún no carga, mostramos el loader y esperamos
    if (dbMisAsistencias.length === 0) {
        setTimeout(async () => {
            await cargarMisAsistencias();
            // Refrescar el contenedor una vez que los datos llegaron
            const container = document.getElementById('mi-asistencia-container');
            if (container) {
                renderTablaMiAsistencia(emp);
            }
        }, 50);

        return `
        <div style="animation: fadeIn 0.4s ease-out;">
            <div class="view-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end;">
                <div class="view-header-left">
                    <h1 style="font-size: 1.8rem; font-weight: 800; color: #1e293b; margin-bottom: 5px;">Mi Asistencia</h1>
                    <p style="color: #64748b; margin: 0;">Historial personal y registro de marcaciones</p>
                </div>
            </div>
            
            <div id="mi-asistencia-container" style="padding: 60px; text-align: center; color: #64748b;">
                <i data-lucide="loader-2" class="lucide-spin" style="width:40px;height:40px;margin-bottom:15px; color:#4f46e5;"></i>
                <p style="font-weight: 600; font-size: 1.1rem;">Sincronizando marcaciones con PostgreSQL...</p>
            </div>
        </div>`;
    }

    // Si ya tenemos los datos en memoria, lo mandamos a dibujar de inmediato
    setTimeout(() => renderTablaMiAsistencia(emp), 0);

    return `
    <div style="animation: fadeIn 0.4s ease-out;">
        <div class="view-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div class="view-header-left">
                <h1 style="font-size: 1.8rem; font-weight: 800; color: #1e293b; margin-bottom: 5px;">Mi Asistencia</h1>
                <p style="color: #64748b; margin: 0;">Historial personal y registro de marcaciones</p>
            </div>
            <div class="view-header-actions">
                <button class="btn btn-ghost" onclick="window.print()" style="background: white; border: 1px solid #e2e8f0;">
                    <i data-lucide="printer" style="width:16px; height:16px; margin-right: 6px;"></i> Imprimir
                </button>
            </div>
        </div>
        <div id="mi-asistencia-container"></div>
    </div>`;
};

// Función que dibuja los cuadros y la tabla con los datos reales
function renderTablaMiAsistencia(emp) {
    const container = document.getElementById('mi-asistencia-container');
    if (!container) return;

    // Filtramos usando la base de datos real y el ID del empleado logueado
    const myAtt = dbMisAsistencias.filter(a => String(a.empId || a.empleado_id) === String(emp.id));
    
    const pres = myAtt.filter(a => a.tipo !== 'Falta').length;
    const tard = myAtt.filter(a => a.tipo === 'Tardanza').length;
    const fal = myAtt.filter(a => a.tipo === 'Falta').length;

    const rows = myAtt.slice().reverse().map(a => {
        let badgeColor = 'badge-gray';
        if (a.tipo === 'Asistencia') badgeColor = 'badge-green';
        if (a.tipo === 'Tardanza') badgeColor = 'badge-amber';
        if (a.tipo === 'Falta') badgeColor = 'badge-red';
        if (a.tipo === 'Hora Extra') badgeColor = 'badge-blue';

        let horasTrabajadas = ma_horasDiff(a.entrada || a.hora_entrada, a.salida || a.hora_salida);
        let fechaFormateada = ma_fmtDate(a.fecha);

        return `
        <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
            <td style="padding: 16px; font-weight: 600; color: #334155;">${fechaFormateada}</td>
            <td style="padding: 16px; font-weight: 700; color: #0f172a;">${a.entrada || a.hora_entrada || '—'}</td>
            <td style="padding: 16px; color: #475569;">${a.salida || a.hora_salida || '—'}</td>
            <td style="padding: 16px; color: #64748b; font-size: 0.9rem;">
                <i data-lucide="clock" style="width:14px; height:14px; display:inline; margin-right:4px; vertical-align:middle;"></i>${horasTrabajadas}
            </td>
            <td style="padding: 16px;">
                <span class="badge ${badgeColor} badge-dot" style="font-weight: 600;">${a.tipo}</span>
            </td>
            <td style="padding: 16px; font-size: 0.85rem; color: #64748b;">${a.obs || a.observaciones || '—'}</td>
        </tr>`;
    }).join('');

    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 24px;">
            <div class="card" style="padding: 20px; display: flex; align-items: center; gap: 16px; border: none; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <div style="width: 50px; height: 50px; background: #dcfce7; color: #16a34a; border-radius: 14px; display: flex; align-items: center; justify-content: center;">
                    <i data-lucide="check-circle-2" style="width: 24px; height: 24px;"></i>
                </div>
                <div>
                    <div style="font-size: 1.8rem; font-weight: 800; color: #111827; line-height: 1;">${pres}</div>
                    <div style="font-size: 0.85rem; color: #64748b; font-weight: 600; text-transform: uppercase;">Asistencias</div>
                </div>
            </div>
            <div class="card" style="padding: 20px; display: flex; align-items: center; gap: 16px; border: none; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <div style="width: 50px; height: 50px; background: #fef3c7; color: #d97706; border-radius: 14px; display: flex; align-items: center; justify-content: center;">
                    <i data-lucide="alert-triangle" style="width: 24px; height: 24px;"></i>
                </div>
                <div>
                    <div style="font-size: 1.8rem; font-weight: 800; color: #111827; line-height: 1;">${tard}</div>
                    <div style="font-size: 0.85rem; color: #64748b; font-weight: 600; text-transform: uppercase;">Tardanzas</div>
                </div>
            </div>
            <div class="card" style="padding: 20px; display: flex; align-items: center; gap: 16px; border: none; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <div style="width: 50px; height: 50px; background: #fee2e2; color: #dc2626; border-radius: 14px; display: flex; align-items: center; justify-content: center;">
                    <i data-lucide="x-circle" style="width: 24px; height: 24px;"></i>
                </div>
                <div>
                    <div style="font-size: 1.8rem; font-weight: 800; color: #111827; line-height: 1;">${fal}</div>
                    <div style="font-size: 0.85rem; color: #64748b; font-weight: 600; text-transform: uppercase;">Faltas</div>
                </div>
            </div>
        </div>

        <div class="card" style="border: none; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border-radius: 16px; overflow: hidden;">
            <div class="card-header" style="border-bottom: 1px solid #f1f5f9; padding: 20px;">
                <div><div class="card-title" style="font-size: 1.1rem; font-weight: 700;">Registro Detallado</div></div>
            </div>
            <div class="table-wrap" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead style="background: #f8fafc;">
                        <tr>
                            <th style="padding: 16px; font-size: 0.75rem; color: #64748b; text-transform: uppercase;">Fecha</th>
                            <th style="padding: 16px; font-size: 0.75rem; color: #64748b; text-transform: uppercase;">Ingreso</th>
                            <th style="padding: 16px; font-size: 0.75rem; color: #64748b; text-transform: uppercase;">Salida</th>
                            <th style="padding: 16px; font-size: 0.75rem; color: #64748b; text-transform: uppercase;">Total Horas</th>
                            <th style="padding: 16px; font-size: 0.75rem; color: #64748b; text-transform: uppercase;">Estado</th>
                            <th style="padding: 16px; font-size: 0.75rem; color: #64748b; text-transform: uppercase;">Obs.</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows || '<tr><td colspan="6" style="text-align:center; padding: 40px; color: #9ca3af;">No tienes marcaciones registradas en el sistema.</td></tr>'}
                    </tbody>
                </table>
            </div>
        </div>`;
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}