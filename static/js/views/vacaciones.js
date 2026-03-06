// ============================================================
// VIEW: Vacaciones & Licencias (Autocontenido y conectado a PostgreSQL)
// Ruta: static/js/views/vacaciones.js
// ============================================================

window.renderVacaciones = function() {
    // 🔥 AUTO-ARRANQUE PARA ACTUALIZAR DATOS FRESCOS
    setTimeout(() => {
        if(typeof window.initVacaciones === 'function') window.initVacaciones();
    }, 50);

    // 1. Cálculos de contadores dinámicos desde variables globales inyectadas
    const listaVac = window.realVacaciones || [];
    const emps = window.realEmpleados || [];
    
    // Obtenemos la sede actual (o la primera si no hay)
    const currentSedeId = typeof window.currentSedeId !== 'undefined' ? window.currentSedeId : (window.realSedes && window.realSedes[0] ? window.realSedes[0].id : null);

    // Filtramos las vacaciones solo para los empleados de la sede actual
    const vacacionesSede = listaVac.filter(v => {
        const emp = emps.find(e => String(e.id) === String(v.empleado_id || v.empId));
        return emp && (!emp.sede_id || String(emp.sede_id) === String(currentSedeId));
    });

    const pendientes = vacacionesSede.filter(v => v.estado === 'Pendiente').length;
    const aprobadas = vacacionesSede.filter(v => v.estado === 'Aprobado').length;
    
    // Calculamos el total de días tomados en la sede actual
    const diasTomados = vacacionesSede
        .filter(v => v.estado === 'Aprobado')
        .reduce((acc, curr) => acc + (parseInt(curr.dias_totales || curr.dias) || 0), 0);

    // --- Helpers Locales ---
    const getAvatarColor = (id) => {
        const colors = ['av-indigo', 'av-blue', 'av-green', 'av-purple', 'av-amber', 'av-red'];
        return colors[(id || 0) % colors.length];
    };
    const formatDateLocal = (dateStr) => {
        if (!dateStr || dateStr === '—') return '—';
        const d = new Date(dateStr);
        if (isNaN(d)) return dateStr;
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return `${d.getUTCDate()} ${meses[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
    };
    // -----------------------

    // 2. Generación de Filas de la Tabla
    const rows = vacacionesSede.length > 0 ? vacacionesSede.slice().reverse().map(v => {
        const emp = emps.find(e => String(e.id) === String(v.empleado_id || v.empId));
        
        let badge = 'badge-amber';
        if (v.estado === 'Aprobado') badge = 'badge-green';
        if (v.estado === 'Rechazado') badge = 'badge-red';

        // Lógica de acciones según el estado
        let celdaAccion = `
            <div style="display:flex; gap:8px; align-items:center;">
                <button class="btn btn-primary" style="padding:6px 12px; font-size:11px; background:#10b981; border:none; border-radius:6px; display:flex; align-items:center; gap:4px;" 
                    onclick="window.cambiarEstadoVacacion(${v.id}, 'Aprobado')">
                    <i data-lucide="check" style="width:14px; height:14px;"></i> Aprobar
                </button>
                <button class="btn btn-ghost" style="padding:6px 12px; font-size:11px; color:#ef4444; display:flex; align-items:center; gap:4px;" 
                    onclick="window.cambiarEstadoVacacion(${v.id}, 'Rechazado')">
                    <i data-lucide="x-circle" style="width:14px; height:14px;"></i> Rechazar
                </button>
            </div>
        `;

        if (v.estado !== 'Pendiente') {
            celdaAccion = `
                <div style="font-size:0.85rem; color:#6b7280; font-style:italic; display:flex; align-items:center; gap:6px;">
                    <i data-lucide="user-check" style="width:14px; height:14px;"></i>
                    Gestionado por ${v.aprobado_por || 'RRHH'}
                </div>`;
        }

        const nombreCompleto = emp ? `${emp.nombres} ${emp.apellidos}` : 'Colaborador no encontrado';
        const iniciales = emp ? (emp.nombres.charAt(0) + emp.apellidos.charAt(0)).toUpperCase() : '??';
        const bgColor = emp ? (emp.avatar_color || getAvatarColor(emp.id)) : 'av-gray';

        return `
        <tr style="animation: fadeIn 0.3s ease-in;">
            <td>
                <div class="td-user">
                    <div class="td-avatar ${bgColor.startsWith('av-') ? bgColor : ''}" style="${bgColor.startsWith('#') ? 'background:'+bgColor+'; color:#fff;' : ''} width:36px; height:36px; font-size:0.8rem;">${iniciales}</div>
                    <div>
                        <div class="td-name" style="font-weight:600; color:#111827;">${nombreCompleto}</div>
                        <div class="td-sub" style="font-size:0.75rem; color:#6b7280;">${v.motivo || 'Vacaciones'}</div>
                    </div>
                </div>
            </td>
            <td style="color:#374151;">${formatDateLocal(v.fecha_inicio || v.inicio)}</td>
            <td style="color:#374151;">${formatDateLocal(v.fecha_fin || v.fin)}</td>
            <td style="font-weight:700; color:#4f46e5; font-size:1rem;">${v.dias_totales || v.dias} <span style="font-size:0.7rem; font-weight:400; color:#6b7280;">días</span></td>
            <td><span class="badge ${badge} badge-dot" style="font-weight:600;">${v.estado}</span></td>
            <td>${celdaAccion}</td>
        </tr>`;
    }).join('') : `<tr><td colspan="6" style="text-align:center; padding:60px; color:#9ca3af;"><i data-lucide="umbrella" style="width:40px; height:40px; margin-bottom:10px; opacity:0.3;"></i><br>No hay solicitudes pendientes en esta sede</td></tr>`;

    return `
    <div class="view-header no-print" style="animation: fadeIn 0.4s ease-out;">
        <div class="view-header-left">
            <h1>Vacaciones & Licencias</h1>
            <p>Control de ausencias y aprobación de descansos remunerados</p>
        </div>
        <div class="view-header-actions">
            <button class="btn btn-primary" onclick="window.openSolicitarVacaciones()" style="box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.4);">
                <i data-lucide="plus-circle" style="width:18px; height:18px; margin-right:6px;"></i> Nueva Solicitud
            </button>
        </div>
    </div>

    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color:white; border-radius:16px; padding:24px; margin-bottom:24px; display:flex; justify-content:space-between; align-items:center; box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.2); animation: fadeIn 0.4s ease-out;">
        <div style="display:flex; align-items:center; gap:24px;">
            <div style="background:rgba(255,255,255,0.2); width:70px; height:70px; border-radius:12px; display:flex; align-items:center; justify-content:center;">
                <i data-lucide="calendar-check" style="width:35px; height:35px;"></i>
            </div>
            <div>
                <div style="font-size:2.5rem; font-weight:800; line-height:1;">${diasTomados}</div>
                <div style="font-weight:600; font-size:1rem; opacity:0.9; margin-top:4px;">Días Gozados en 2026</div>
                <div style="font-size:0.8rem; opacity:0.7;">Resumen consolidado de la sede</div>
            </div>
        </div>
        <div style="display:flex; gap:16px;">
            <div style="background:rgba(255,255,255,0.1); padding:12px 24px; border-radius:12px; text-align:center; border: 1px solid rgba(255,255,255,0.2);">
                <div style="font-size:1.5rem; font-weight:800;">${pendientes}</div>
                <div style="font-size:0.75rem; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; opacity:0.8;">Pendientes</div>
            </div>
            <div style="background:rgba(255,255,255,0.1); padding:12px 24px; border-radius:12px; text-align:center; border: 1px solid rgba(255,255,255,0.2);">
                <div style="font-size:1.5rem; font-weight:800;">${aprobadas}</div>
                <div style="font-size:0.75rem; font-weight:600; text-transform:uppercase; letter-spacing:0.5px; opacity:0.8;">Aprobadas</div>
            </div>
        </div>
    </div>

    <div class="card" style="border:none; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border-radius:12px; overflow:hidden; animation: fadeIn 0.4s ease-out;">
        <div class="table-wrap">
            <table style="width:100%; border-collapse: collapse;">
                <thead style="background:#f9fafb; border-bottom: 1px solid #edf2f7;">
                    <tr>
                        <th style="padding:16px; text-align:left; font-size:0.75rem; color:#6b7280; text-transform:uppercase;">Colaborador</th>
                        <th style="padding:16px; text-align:left; font-size:0.75rem; color:#6b7280; text-transform:uppercase;">Desde</th>
                        <th style="padding:16px; text-align:left; font-size:0.75rem; color:#6b7280; text-transform:uppercase;">Hasta</th>
                        <th style="padding:16px; text-align:left; font-size:0.75rem; color:#6b7280; text-transform:uppercase;">Total</th>
                        <th style="padding:16px; text-align:left; font-size:0.75rem; color:#6b7280; text-transform:uppercase;">Estado</th>
                        <th style="padding:16px; text-align:left; font-size:0.75rem; color:#6b7280; text-transform:uppercase;">Gestión</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    </div>`;
};

window.initVacaciones = async function() {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    if (typeof window.updateVacationBadge === 'function') window.updateVacationBadge();
};

// ============================================================
// MODAL: FORMULARIO DE NUEVA SOLICITUD
// ============================================================
window.openSolicitarVacaciones = function() {
    if(typeof window.openModal !== 'function') return;

    const emps = window.realEmpleados || [];
    const currentSedeId = typeof window.currentSedeId !== 'undefined' ? window.currentSedeId : (window.realSedes && window.realSedes[0] ? window.realSedes[0].id : null);
    
    // Solo mostramos empleados de la sede actual
    const empsSede = emps.filter(e => !e.sede_id || String(e.sede_id) === String(currentSedeId));
    const empOptions = empsSede.map(e => `<option value="${e.id}">${e.nombres} ${e.apellidos}</option>`).join('');
    
    const hoyObj = new Date();
    const offset = hoyObj.getTimezoneOffset() * 60000;
    const hoyStr = (new Date(hoyObj - offset)).toISOString().split('T')[0];

    window.openModal(`
    <div class="modal-overlay" style="z-index: 9999; backdrop-filter: blur(4px);">
        <div class="modal" style="max-width: 500px; border-radius:16px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
            <div class="modal-header" style="padding:20px; border-bottom:1px solid #f3f4f6;">
                <h3 style="font-size:1.25rem; font-weight:700; color:#111827;">Registrar Nueva Solicitud</h3>
                <button class="modal-close" onclick="window.closeModal()"><i data-lucide="x"></i></button>
            </div>
            <div class="modal-body" style="padding:24px;">
                <div class="form-grid">
                    <div class="field form-full">
                        <label style="font-weight:600; margin-bottom:8px; display:block;">Colaborador *</label>
                        <select id="vEmp" style="width:100%; padding:10px; border-radius:8px; border:1px solid #d1d5db;">
                            <option value="">Seleccionar...</option>
                            ${empOptions}
                        </select>
                    </div>
                    <div class="field">
                        <label style="font-weight:600; margin-bottom:8px; display:block;">Fecha Inicio *</label>
                        <input type="date" id="vIni" value="${hoyStr}" onchange="window.updateVacDays()" style="width:100%; padding:10px; border-radius:8px; border:1px solid #d1d5db;">
                    </div>
                    <div class="field">
                        <label style="font-weight:600; margin-bottom:8px; display:block;">Fecha Fin *</label>
                        <input type="date" id="vFin" onchange="window.updateVacDays()" style="width:100%; padding:10px; border-radius:8px; border:1px solid #d1d5db;">
                    </div>
                    <div class="field form-full">
                        <label style="font-weight:600; margin-bottom:8px; display:block;">Tipo de Licencia / Motivo</label>
                        <select id="vMot" style="width:100%; padding:10px; border-radius:8px; border:1px solid #d1d5db;">
                            <option value="Vacaciones Anuales">Vacaciones Anuales</option>
                            <option value="Descanso Médico">Descanso Médico</option>
                            <option value="Licencia con goce">Licencia con goce</option>
                            <option value="Licencia sin goce">Licencia sin goce</option>
                            <option value="Paternidad/Maternidad">Paternidad/Maternidad</option>
                        </select>
                    </div>
                    <div id="vMsg" style="grid-column:span 2; text-align:center; background:#f0fdf4; color:#166534; padding:10px; border-radius:8px; font-weight:700; margin-top: 10px; min-height: 40px; display:flex; align-items:center; justify-content:center;">
                        Selecciona las fechas para calcular días
                    </div>
                </div>
            </div>
            <div class="modal-footer" style="padding:20px; border-top:1px solid #f3f4f6; display:flex; justify-content:flex-end; gap:12px;">
                <button class="btn btn-ghost" onclick="window.closeModal()">Cancelar</button>
                <button class="btn btn-primary" id="vBtn" onclick="window.saveVac()" style="padding:10px 24px; border-radius:8px;">
                    <i data-lucide="send" style="width:16px;height:16px; margin-right:6px;"></i> Enviar Solicitud
                </button>
            </div>
        </div>
    </div>`);
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.updateVacDays = function() {
    const startStr = document.getElementById('vIni').value;
    const endStr = document.getElementById('vFin').value;
    const msg = document.getElementById('vMsg');
    
    if (!startStr || !endStr) return 0;

    const s = new Date(startStr);
    const e = new Date(endStr);
    
    if (e >= s) {
        const d = Math.floor((e - s) / 86400000) + 1;
        msg.innerText = `Total: ${d} día(s) de descanso programado`;
        msg.style.background = '#f0fdf4';
        msg.style.color = '#166534';
        return d;
    } else {
        msg.innerText = `⚠️ La fecha fin no puede ser menor al inicio`;
        msg.style.background = '#fef2f2';
        msg.style.color = '#991b1b';
        return 0;
    }
};

// ============================================================
// CONEXIÓN CON POSTGRESQL (GUARDAR NUEVA SOLICITUD)
// ============================================================
window.saveVac = async function() {
    const dias = window.updateVacDays();
    const data = {
        empleado_id: document.getElementById('vEmp').value,
        fecha_inicio: document.getElementById('vIni').value,
        fecha_fin: document.getElementById('vFin').value,
        motivo: document.getElementById('vMot').value,
        dias_totales: dias
    };

    if (!data.empleado_id || dias <= 0) {
        if(typeof window.showToast === 'function') window.showToast("Por favor, selecciona un colaborador y fechas válidas.", "warning");
        else alert("⚠️ Por favor, selecciona un colaborador y fechas válidas.");
        return;
    }

    const btn = document.getElementById('vBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = `<i data-lucide="loader-2" class="lucide-spin" style="width:16px;height:16px; margin-right:6px;"></i> Enviando...`;
    btn.disabled = true;
    if (typeof lucide !== 'undefined') lucide.createIcons();

    const csrf = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';

    try {
        const res = await fetch('/api/vacaciones/crear/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf },
            body: JSON.stringify(data)
        });
        
        const jsonResponse = await res.json();

        if (res.ok && jsonResponse.success) {
            window.closeModal();
            if (typeof window.showToast === 'function') window.showToast("Solicitud enviada con éxito", "success");
            setTimeout(() => { window.location.reload(); }, 800); // Recarga para actualizar MOCK global y UI
        } else {
            if (typeof window.showToast === 'function') window.showToast(jsonResponse.message || "No se pudo procesar la solicitud", "error");
            else alert("❌ Error: " + (jsonResponse.message || "No se pudo procesar la solicitud"));
            btn.innerHTML = originalText;
            btn.disabled = false;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    } catch (e) {
        console.error("Error en saveVac:", e);
        if (typeof window.showToast === 'function') window.showToast("Error de conexión con Django.", "error");
        else alert("❌ Error de conexión con el servidor Django.");
        btn.innerHTML = originalText;
        btn.disabled = false;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
};

// ============================================================
// CONEXIÓN CON POSTGRESQL (APROBAR / RECHAZAR)
// ============================================================
window.cambiarEstadoVacacion = async function(id, nuevoEstado) {
    if (!confirm(`¿Estás seguro de marcar esta solicitud como ${nuevoEstado.toUpperCase()}?`)) return;

    const csrf = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
    
    try {
        const res = await fetch(`/api/vacaciones/gestionar/${id}/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf },
            body: JSON.stringify({ estado: nuevoEstado })
        });

        if (res.ok) {
            if (typeof window.showToast === 'function') window.showToast(`Solicitud ${nuevoEstado}`, "success");
            setTimeout(() => { window.location.reload(); }, 800); // Recarga para actualizar MOCK global y UI
        } else {
            if (typeof window.showToast === 'function') window.showToast("Error al actualizar el estado.", "error");
            else alert("❌ Error al actualizar el estado en el servidor.");
        }
    } catch (e) {
        console.error("Error en gestionarVacacion:", e);
        if (typeof window.showToast === 'function') window.showToast("Error de conexión. Verifica Django.", "error");
        else alert("❌ Error de conexión. Verifica la API en Django.");
    }
};