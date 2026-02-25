// ============================================================
// VIEW: Configuración
// ============================================================

function renderConfiguracion() {
    const users = [
        { name: 'Carlos Quispe', email: 'admin@rhm.pe', rol: 'Admin', estado: 'Activo', av: 'av-indigo' },
        { name: 'Ana García', email: 'rh@rhm.pe', rol: 'RH', estado: 'Activo', av: 'av-green' },
        { name: 'Luis Torres', email: 'empleado@rhm.pe', rol: 'Empleado', estado: 'Activo', av: 'av-teal' },
    ];
    const userRows = users.map(u => `
    <tr>
      <td><div class="td-user">
        <div class="td-avatar ${u.av}">${u.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
        <div><div class="td-name">${u.name}</div><div class="td-sub">${u.email}</div></div>
      </div></td>
      <td><span class="badge ${u.rol === 'Admin' ? 'badge-indigo' : u.rol === 'RH' ? 'badge-purple' : 'badge-blue'}">${u.rol}</span></td>
      <td><span class="badge badge-green badge-dot">${u.estado}</span></td>
      <td>
        <button class="btn btn-ghost btn-sm"><i data-lucide="edit" style="width:13px;height:13px"></i></button>
        <button class="btn btn-ghost btn-sm" style="color:var(--danger)"><i data-lucide="trash-2" style="width:13px;height:13px"></i></button>
      </td>
    </tr>`).join('');

    return `
  <div class="view-header">
    <div class="view-header-left"><h1>Configuración</h1><p>Empresa, usuarios del sistema y preferencias</p></div>
    <div class="view-header-actions">
      <button class="btn btn-primary" onclick="alert('✅ Cambios guardados (demo)')"><i data-lucide="save" style="width:15px;height:15px"></i> Guardar Cambios</button>
    </div>
  </div>

  <div class="tabs" style="margin-bottom:20px" id="cfgTabs">
    <div class="tab active" onclick="cfgTab(0)">Empresa</div>
    <div class="tab" onclick="cfgTab(1)">Usuarios del Sistema</div>
    <div class="tab" onclick="cfgTab(2)">Planilla & RRHH</div>
  </div>

  <!-- Tab 0: Empresa -->
  <div id="cfgPanel0">
    <div class="card" style="margin-bottom:16px">
      <div class="card-header"><div class="card-title">Información de la Empresa</div></div>
      <div class="card-body">
        <div class="form-grid">
          <div class="field form-full">
            <label>Nombre de la Empresa</label>
            <input type="text" value="${MOCK.empresa.nombre}">
          </div>
          <div class="field"><label>RUC</label><input type="text" value="${MOCK.empresa.ruc}" maxlength="11"></div>
          <div class="field"><label>Teléfono</label><input type="text" value="${MOCK.empresa.telefono}"></div>
          <div class="field"><label>Email de RRHH</label><input type="email" value="${MOCK.empresa.email}"></div>
          <div class="field"><label>Sitio Web</label><input type="text" value="${MOCK.empresa.web}"></div>
          <div class="field form-full"><label>Dirección</label><input type="text" value="${MOCK.empresa.direccion}"></div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="card-header"><div class="card-title">Jornada Laboral</div></div>
      <div class="card-body">
        <div class="form-grid">
          <div class="field"><label>Hora de Entrada</label><input type="time" value="08:00"></div>
          <div class="field"><label>Hora de Salida</label><input type="time" value="17:00"></div>
          <div class="field"><label>Hora de Tolerancia (minutos)</label><input type="number" value="10" min="0" max="60"></div>
          <div class="field"><label>Días Laborables</label>
            <select><option>Lunes a Viernes</option><option>Lunes a Sábado</option></select>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Tab 1: Usuarios -->
  <div id="cfgPanel1" style="display:none">
    <div class="card">
      <div class="card-header">
        <div class="card-title">Usuarios del Sistema</div>
        <button class="btn btn-primary btn-sm"><i data-lucide="plus" style="width:13px;height:13px"></i> Nuevo Usuario</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Usuario</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>${userRows}</tbody>
        </table>
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="card-header"><div class="card-title">Roles y Permisos</div></div>
      <div class="card-body">
        ${[
            { rol: 'Admin', color: 'badge-indigo', permisos: ['Dashboard', 'Empleados', 'Departamentos', 'Asistencia', 'Planilla', 'Vacaciones', 'Documentos', 'Reportes', 'Configuración'] },
            { rol: 'RH', color: 'badge-purple', permisos: ['Dashboard', 'Empleados', 'Departamentos', 'Asistencia', 'Planilla', 'Vacaciones', 'Documentos', 'Reportes'] },
            { rol: 'Empleado', color: 'badge-blue', permisos: ['Dashboard', 'Asistencia (propia)', 'Vacaciones (propias)', 'Documentos (propios)'] },
        ].map(r => `
          <div style="margin-bottom:14px;padding:14px;background:var(--gray-50);border-radius:var(--r);border:1px solid var(--border)">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
              <span class="badge ${r.color}">${r.rol}</span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:6px">
              ${r.permisos.map(p => `<span class="tag">${p}</span>`).join('')}
            </div>
          </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- Tab 2: Planilla -->
  <div id="cfgPanel2" style="display:none">
    <div class="card">
      <div class="card-header"><div class="card-title">Parámetros de Planilla</div></div>
      <div class="card-body">
        <div class="form-grid">
          <div class="field"><label>Remuneración Mínima Vital (RMV)</label><input type="number" value="1025"></div>
          <div class="field"><label>Asignación Familiar</label><input type="number" value="102.50"></div>
          <div class="field"><label>Aporte ONP (%)</label><input type="number" value="13" step="0.01"></div>
          <div class="field"><label>EsSalud Empleador (%)</label><input type="number" value="9" step="0.01"></div>
          <div class="field"><label>AFP – Aporte Obligatorio (%)</label><input type="number" value="10" step="0.01"></div>
          <div class="field"><label>AFP – Comisión Promedio (%)</label><input type="number" value="1.74" step="0.01"></div>
          <div class="field"><label>AFP – Seguro de Vida (%)</label><input type="number" value="1.35" step="0.01"></div>
          <div class="field"><label>Banco de pago</label><input type="text" value="BCP"></div>
        </div>
        <div style="margin-top:16px;padding:12px 16px;background:var(--info-50);border-radius:var(--r-sm);font-size:.82rem;color:#1e40af">
          <strong>Nota:</strong> Los cálculos de 5ta. categoría (IR) aplican automáticamente cuando el ingreso anual supera 7 UIT (S/ 36,050 para el anno 2026).
        </div>
      </div>
    </div>
    <div class="card" style="margin-top:16px">
      <div class="card-header"><div class="card-title">Días de Vacaciones</div></div>
      <div class="card-body">
        <div class="form-grid">
          <div class="field"><label>Días anuales por ley</label><input type="number" value="30"></div>
          <div class="field"><label>Tolerancia de solicitud (días de anticipación mín.)</label><input type="number" value="7"></div>
        </div>
      </div>
    </div>
  </div>`;
}

function initConfiguracion() { }

window.cfgTab = function (idx) {
    document.querySelectorAll('#cfgTabs .tab').forEach((t, i) => t.classList.toggle('active', i === idx));
    [0, 1, 2].forEach(i => {
        const p = document.getElementById('cfgPanel' + i);
        if (p) p.style.display = i === idx ? '' : 'none';
    });
    lucide.createIcons();
};
