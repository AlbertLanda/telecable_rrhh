// ============================================================
// VIEW: Documentos
// ============================================================

function renderDocumentos() {
  const emps = MOCK.empleados.filter(e => e.sedeId === currentSedeId);
  const empIds = emps.map(e => e.id);
  const empOptions = emps.map(e =>
    `<option value="${e.id}">${empFullName(e)}</option>`
  ).join('');

  const allDocTypes = ['Contrato', 'ID', 'Recibo', 'Certificado', 'Otro', 'Boleta'];
  const typeColors = { Contrato: 'badge-indigo', ID: 'badge-blue', Recibo: 'badge-green', Certificado: 'badge-purple', Otro: 'badge-gray', Boleta: 'badge-amber' };

  // Group docs by employee
  const filteredDocs = MOCK.documentos.filter(d => empIds.includes(d.empId));
  const docsByEmp = {};
  filteredDocs.forEach(doc => {
    if (!docsByEmp[doc.empId]) docsByEmp[doc.empId] = [];
    docsByEmp[doc.empId].push(doc);
  });

  const rows = filteredDocs.map(doc => {
    const emp = getEmp(doc.empId);
    return `<tr>
      <td><div class="td-user">
        <div class="td-avatar ${avatarColor(emp.id)}">${empInitials(emp)}</div>
        <div><div class="td-name">${empFullName(emp)}</div><div class="td-sub">${getDept(emp.deptId).nombre}</div></div>
      </div></td>
      <td><div style="display:flex;align-items:center;gap:8px">
        <i data-lucide="file-text" style="width:16px;height:16px;color:var(--primary)"></i>
        <span class="fw-700" style="font-size:.85rem">${doc.nombre}</span>
      </div></td>
      <td><span class="badge ${typeColors[doc.tipo] || 'badge-gray'}">${doc.tipo}</span></td>
      <td style="font-size:.82rem;color:var(--text-secondary)">${fmtDate(doc.fecha)}</td>
      <td style="font-size:.82rem;color:var(--text-muted)">${doc.kb} KB</td>
      <td>
        <button class="btn btn-ghost btn-sm" title="Descargar"><i data-lucide="download" style="width:13px;height:13px"></i></button>
        <button class="btn btn-ghost btn-sm" title="Eliminar" style="color:var(--danger)"><i data-lucide="trash-2" style="width:13px;height:13px"></i></button>
      </td>
    </tr>`;
  }).join('');

  return `
  <div class="view-header">
    <div class="view-header-left"><h1>Documentos</h1><p>${MOCK.documentos.length} documentos registrados</p></div>
    <div class="view-header-actions">
      <button class="btn btn-primary" onclick="openSubirDoc()"><i data-lucide="upload" style="width:15px;height:15px"></i> Subir Documento</button>
    </div>
  </div>

  <div class="stats-grid" style="grid-template-columns:repeat(5,1fr);margin-bottom:20px">
    ${allDocTypes.map(t => {
    const count = MOCK.documentos.filter(d => d.tipo === t).length;
    const icons = { Contrato: 'file-signature', ID: 'id-card', Recibo: 'receipt', Certificado: 'award', Otro: 'paperclip' };
    const cl = { Contrato: 'indigo', ID: 'blue', Recibo: 'green', Certificado: 'purple', Otro: 'amber' };
    return `<div class="stat-card">
        <div class="stat-icon ${cl[t] || 'indigo'}"><i data-lucide="${icons[t] || 'file'}" style="width:20px;height:20px"></i></div>
        <div><div class="stat-number">${count}</div><div class="stat-label">${t}s</div></div>
      </div>`;
  }).join('')}
  </div>

  <div class="toolbar">
    <div class="toolbar-left">
      <div class="search-box">
        <i data-lucide="search" class="search-box-icon" style="width:15px;height:15px"></i>
        <input type="text" placeholder="Buscar documentos...">
      </div>
      <select class="filter-select">
        <option value="">Todos los empleados</option>${empOptions}
      </select>
      <select class="filter-select">
        <option value="">Todos los tipos</option>
        ${allDocTypes.map(t => `<option>${t}</option>`).join('')}
      </select>
    </div>
  </div>

  <div class="card">
    <div class="card-header">
      <div class="card-title">Repositorio de Documentos</div>
    </div>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Empleado</th><th>Documento</th><th>Tipo</th><th>Fecha</th><th>Tamaño</th><th>Acciones</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  </div>`;
}

function initDocumentos() { }

window.openSubirDoc = function () {
  const empOptions = MOCK.empleados.map(e => `<option value="${e.id}">${empFullName(e)}</option>`).join('');
  openModal(`
  <div class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <h3>Subir Documento</h3>
        <button class="modal-close" onclick="closeModal()"><i data-lucide="x" style="width:14px;height:14px"></i></button>
      </div>
      <div class="modal-body">
        <div class="form-grid">
          <div class="field form-full"><label>Empleado *</label>
            <select><option value="">Seleccionar empleado...</option>${empOptions}</select>
          </div>
          <div class="field"><label>Nombre del Documento *</label><input type="text" placeholder="Ej: Contrato 2026"></div>
          <div class="field"><label>Tipo *</label>
            <select><option>Contrato</option><option>ID</option><option>Recibo</option><option>Certificado</option><option>Otro</option></select>
          </div>
          <div class="field form-full">
            <label>Archivo *</label>
            <div style="border:2px dashed var(--border);border-radius:var(--r);padding:28px;text-align:center;cursor:pointer;background:var(--gray-50)" onclick="this.querySelector('input').click()">
              <i data-lucide="upload-cloud" style="width:36px;height:36px;color:var(--text-muted);display:block;margin:0 auto 8px"></i>
              <div style="font-size:.85rem;color:var(--text-secondary)">Haz clic o arrastra el archivo aquí</div>
              <div style="font-size:.75rem;color:var(--text-muted);margin-top:4px">PDF, DOCX, PNG · Máx. 10 MB</div>
              <input type="file" style="display:none" accept=".pdf,.docx,.png,.jpg">
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" onclick="alert('✅ Documento subido exitosamente (demo)');closeModal()">
          <i data-lucide="upload" style="width:14px;height:14px"></i> Subir
        </button>
      </div>
    </div>
  </div>`);
};
