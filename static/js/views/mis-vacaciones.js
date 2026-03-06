// ============================================================
// VIEW: Mis Vacaciones (Sincronizado con PostgreSQL y Autocontenido)
// Ruta: static/js/views/mis-vacaciones.js
// ============================================================

let dbMisVacaciones = [];

async function cargarMisVacaciones() {
    try {
        const res = await fetch('/api/vacaciones/listar/');
        let data = await res.json();
        if(data.data) data = data.data;
        dbMisVacaciones = data;
    } catch (error) {
        console.error("Error conectando a PostgreSQL para vacaciones:", error);
    }
}

// --- Helpers Locales ---
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

const mv_fmtDate = (dateStr) => {
    if (!dateStr || dateStr === '—') return '—';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${d.getUTCDate()} ${meses[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};
// -----------------------

window.renderMisVacaciones = function() {
    const emp = typeof window.myEmp === 'function' ? window.myEmp() : getMiPerfil();
    if (!emp) return `<div style="padding:40px; text-align:center; color:#ef4444;">Error: Perfil no vinculado.</div>`;

    // 🔥 AUTO-ARRANQUE CON LOADER
    if (dbMisVacaciones.length === 0) {
        setTimeout(async () => {
            await cargarMisVacaciones();
            const container = document.getElementById('mis-vacaciones-container');
            if (container) {
                renderDashboardVacaciones(emp);
            }
        }, 50);

        return `
        <div style="animation: fadeIn 0.4s ease-out;">
            <div class="view-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end;">
                <div class="view-header-left">
                    <h1 style="font-size: 1.8rem; font-weight: 800; color: #1e293b; margin-bottom: 5px;">Mis Vacaciones</h1>
                    <p style="color: #64748b; margin: 0;">Control de descansos remunerados y licencias</p>
                </div>
            </div>
            
            <div id="mis-vacaciones-container" style="padding: 60px; text-align: center; color: #64748b;">
                <i data-lucide="loader-2" class="lucide-spin" style="width:40px;height:40px;margin-bottom:15px; color:#4f46e5;"></i>
                <p style="font-weight: 600; font-size: 1.1rem;">Calculando saldo y leyendo historial desde PostgreSQL...</p>
            </div>
        </div>`;
    }

    setTimeout(() => renderDashboardVacaciones(emp), 0);

    return `
    <div style="animation: fadeIn 0.4s ease-out;">
        <div class="view-header" style="margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end;">
            <div class="view-header-left">
                <h1 style="font-size: 1.8rem; font-weight: 800; color: #1e293b; margin-bottom: 5px;">Mis Vacaciones</h1>
                <p style="color: #64748b; margin: 0;">Control de descansos remunerados y licencias</p>
            </div>
            <div class="view-header-actions">
                <button class="btn btn-primary" onclick="window.abrirModalNuevaVacacion()" style="background: #4f46e5; border: none; box-shadow: 0 4px 6px rgba(79,70,229,0.2);">
                    <i data-lucide="plus" style="width:16px;height:16px;margin-right:6px;"></i> Nueva Solicitud
                </button>
            </div>
        </div>
        <div id="mis-vacaciones-container"></div>
    </div>`;
};

// Función para pintar la tarjeta verde y la tabla
function renderDashboardVacaciones(emp) {
    const container = document.getElementById('mis-vacaciones-container');
    if (!container) return;

    // Filtramos las vacaciones del usuario activo
    const myVacs = dbMisVacaciones.filter(v => String(v.empId || v.empleado_id) === String(emp.id));
    
    // CÁLCULO MATEMÁTICO REAL DEL SALDO
    const diasAnuales = 30; // Por ley
    let diasUsados = 0;
    
    myVacs.forEach(v => {
        // Solo restamos los días si la vacación fue aprobada
        if (v.estado === 'Aprobado') {
            diasUsados += parseInt(v.dias || v.dias_totales || 0);
        }
    });
    
    const diasPendientes = diasAnuales - diasUsados;

    const rows = myVacs.slice().reverse().map(v => {
        let badgeColor = 'badge-gray';
        if(v.estado === 'Aprobado') badgeColor = 'badge-green';
        if(v.estado === 'Pendiente') badgeColor = 'badge-amber';
        if(v.estado === 'Rechazado') badgeColor = 'badge-red';

        return `
        <tr style="border-bottom: 1px solid #f1f5f9; transition: background 0.2s;" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background='transparent'">
            <td style="padding: 16px; font-weight: 600; color: #334155;">${mv_fmtDate(v.inicio || v.fecha_inicio)}</td>
            <td style="padding: 16px; font-weight: 600; color: #334155;">${mv_fmtDate(v.fin || v.fecha_fin)}</td>
            <td style="padding: 16px;"><strong style="color: #4f46e5; background: #e0e7ff; padding: 4px 10px; border-radius: 6px;">${v.dias || v.dias_totales} días</strong></td>
            <td style="padding: 16px; color: #475569;">${v.motivo}</td>
            <td style="padding: 16px;"><span class="badge ${badgeColor} badge-dot" style="font-weight: 600;">${v.estado}</span></td>
            <td style="padding: 16px; font-size: 0.85rem; color: #64748b;">
                ${v.aprobadoPor || v.aprobado_por ? `<i data-lucide="user-check" style="width:14px;height:14px;display:inline;vertical-align:middle;margin-right:4px;"></i>${v.aprobadoPor || v.aprobado_por}` : 'Pendiente revisión'}
            </td>
        </tr>`;
    }).join('');

    container.innerHTML = `
        <div style="margin-bottom: 24px; display: flex; align-items: center; gap: 30px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px 40px; border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(16,185,129,0.2); position: relative; overflow: hidden;">
            <div style="position:absolute; right:-20px; top:-40px; opacity:0.1;"><i data-lucide="umbrella" style="width:180px; height:180px;"></i></div>
            
            <div style="position:relative; z-index:1; text-align: center;">
                <div style="font-size: 4rem; font-weight: 800; line-height: 1; letter-spacing:-2px;">${diasPendientes}</div>
                <div style="font-size: 0.95rem; opacity: 0.9; margin-top: 5px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Días Disponibles</div>
            </div>
            
            <div style="width: 2px; height: 80px; background: rgba(255,255,255,0.2); position:relative; z-index:1;"></div>
            
            <div style="flex: 1; position:relative; z-index:1;">
                <div style="font-weight: 800; font-size: 1.3rem; margin-bottom: 8px;">Tu Saldo Anual 2026</div>
                <div style="font-size: 0.95rem; opacity: 0.9; display: flex; justify-content: space-between; margin-bottom: 12px;">
                    <span>Total de ley: <strong>${diasAnuales} días</strong></span>
                    <span>Días gozados (aprobados): <strong>${diasUsados} días</strong></span>
                </div>
                <div style="width: 100%; background: rgba(255,255,255,0.2); height: 12px; border-radius: 6px; overflow: hidden; position: relative;">
                    <div style="width: ${Math.round((diasUsados / diasAnuales) * 100)}%; background: white; height: 100%; border-radius: 6px; box-shadow: 0 0 10px rgba(255,255,255,0.5);"></div>
                </div>
            </div>
        </div>

        <div class="card" style="border: none; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); border-radius: 16px; overflow: hidden;">
            <div class="card-header" style="border-bottom: 1px solid #f1f5f9; padding: 20px;">
                <div class="card-title" style="font-size: 1.1rem; font-weight: 700; color:#1e293b;">Historial de Solicitudes</div>
            </div>
            <div class="table-wrap" style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead style="background: #f8fafc;">
                        <tr>
                            <th style="padding: 16px; font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700;">Inicio</th>
                            <th style="padding: 16px; font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700;">Fin</th>
                            <th style="padding: 16px; font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700;">Días</th>
                            <th style="padding: 16px; font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700;">Motivo</th>
                            <th style="padding: 16px; font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700;">Estado</th>
                            <th style="padding: 16px; font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700;">Gestionado Por</th>
                        </tr>
                    </thead>
                    <tbody>${rows || '<tr><td colspan="6" style="text-align:center; padding: 60px; color: #9ca3af;"><i data-lucide="inbox" style="width:40px;height:40px;margin-bottom:10px;opacity:0.5;"></i><br>Sin solicitudes registradas</td></tr>'}</tbody>
                </table>
            </div>
        </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ============================================================
// 🔥 CREACIÓN DE NUEVA SOLICITUD DE VACACIONES (CONEXIÓN BD)
// ============================================================
window.abrirModalNuevaVacacion = function() {
    if(typeof window.openModal !== 'function') return;

    const hoyObj = new Date();
    const offset = hoyObj.getTimezoneOffset() * 60000;
    const hoyStr = (new Date(hoyObj - offset)).toISOString().split('T')[0];

    window.openModal(`
    <div class="modal-overlay" style="z-index: 9999;">
        <div class="modal" style="max-width: 500px; padding: 0; border-radius: 12px; background: white; overflow: hidden; animation: modalPop 0.3s ease-out;">
            <div style="padding: 20px 24px; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc;">
                <h3 style="font-size: 1.2rem; font-weight: 800; color: #1e293b; margin: 0;">Solicitar Vacaciones</h3>
                <button onclick="window.closeModal()" style="background:none; border:none; cursor:pointer; color:#64748b;"><i data-lucide="x" style="width:20px;height:20px"></i></button>
            </div>
            
            <div style="padding: 24px;">
                <div style="margin-bottom: 16px;">
                    <label style="display:block; font-size:0.85rem; font-weight:700; color:#475569; margin-bottom:8px;">Fecha de Inicio *</label>
                    <input type="date" id="vac-inicio" value="${hoyStr}" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;" onchange="window.calcularDiasVacaciones()">
                </div>
                
                <div style="margin-bottom: 16px;">
                    <label style="display:block; font-size:0.85rem; font-weight:700; color:#475569; margin-bottom:8px;">Fecha de Fin *</label>
                    <input type="date" id="vac-fin" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px;" onchange="window.calcularDiasVacaciones()">
                </div>

                <div style="margin-bottom: 16px;">
                    <label style="display:block; font-size:0.85rem; font-weight:700; color:#475569; margin-bottom:8px;">Total de Días a Tomar</label>
                    <input type="text" id="vac-dias" readonly value="0" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background:#f1f5f9; color:#4f46e5; font-weight:800; font-size:1.1rem; text-align:center;">
                </div>

                <div style="margin-bottom: 16px;">
                    <label style="display:block; font-size:0.85rem; font-weight:700; color:#475569; margin-bottom:8px;">Motivo / Observaciones *</label>
                    <textarea id="vac-motivo" rows="3" placeholder="Ej: Vacaciones correspondientes al periodo 2025" style="width: 100%; padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; resize:none;"></textarea>
                </div>
            </div>

            <div style="padding: 16px 24px; background: white; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
                <button class="btn btn-ghost" onclick="window.closeModal()" style="font-weight: 600; border: 1px solid #e2e8f0;">Cancelar</button>
                <button class="btn btn-primary" id="btn-enviar-vac" onclick="window.enviarSolicitudVacaciones()" style="font-weight: 600; background: #10b981; border: none;">
                    <i data-lucide="send" style="width:16px; height:16px; margin-right:6px;"></i> Enviar Solicitud
                </button>
            </div>
        </div>
    </div>
    `);
    if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.calcularDiasVacaciones = function() {
    const fInicio = document.getElementById('vac-inicio').value;
    const fFin = document.getElementById('vac-fin').value;
    const inputDias = document.getElementById('vac-dias');
    
    if (fInicio && fFin) {
        const date1 = new Date(fInicio);
        const date2 = new Date(fFin);
        
        if(date2 < date1) {
            inputDias.value = "Error en fechas";
            inputDias.style.color = "#ef4444";
        } else {
            const diffTime = Math.abs(date2 - date1);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; 
            inputDias.value = diffDays;
            inputDias.style.color = "#4f46e5";
        }
    }
};

window.enviarSolicitudVacaciones = async function() {
    const emp = typeof window.myEmp === 'function' ? window.myEmp() : getMiPerfil();
    if(!emp) return;

    const inicio = document.getElementById('vac-inicio').value;
    const fin = document.getElementById('vac-fin').value;
    const dias = document.getElementById('vac-dias').value;
    const motivo = document.getElementById('vac-motivo').value;

    if(!inicio || !fin || !motivo || dias === "0" || dias === "Error en fechas") {
        if(typeof window.showToast === 'function') window.showToast("Completa correctamente todos los campos.", "warning");
        else alert("Por favor, llena los campos correctamente.");
        return;
    }

    const btn = document.getElementById('btn-enviar-vac');
    btn.innerHTML = '<i data-lucide="loader-2" class="lucide-spin" style="width:16px;height:16px;margin-right:6px;"></i> Enviando...';
    btn.disabled = true;
    if (typeof lucide !== 'undefined') lucide.createIcons();

    try {
        const csrf = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';
        
        const response = await fetch('/api/vacaciones/crear/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf },
            body: JSON.stringify({
                empleado_id: emp.id,
                fecha_inicio: inicio,
                fecha_fin: fin,
                dias_totales: parseInt(dias),
                motivo: motivo
            })
        });
        
        if (response.ok) {
            window.closeModal();
            if(typeof window.showToast === 'function') window.showToast("¡Solicitud enviada con éxito!", "success");
            
            setTimeout(() => {
                dbMisVacaciones = []; // Vaciamos para forzar la recarga
                if (typeof window.navigate === 'function') window.navigate('mis-vacaciones');
            }, 1000);
        } else {
            if(typeof window.showToast === 'function') window.showToast("Error al enviar la solicitud.", "error");
            btn.innerHTML = '<i data-lucide="send" style="width:16px; height:16px; margin-right:6px;"></i> Enviar Solicitud'; btn.disabled = false;
        }
    } catch(e) {
        if(typeof window.showToast === 'function') window.showToast("Fallo de red conectando con el servidor.", "error");
        btn.innerHTML = '<i data-lucide="send" style="width:16px; height:16px; margin-right:6px;"></i> Enviar Solicitud'; btn.disabled = false;
    }
};