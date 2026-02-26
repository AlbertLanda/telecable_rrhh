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
  // Filtramos a los empleados por la sede actual para no confundir a RRHH
  const empsSede = MOCK.empleados.filter(e => e.sedeId === currentSedeId);
  const empOptions = empsSede.map(e => `<option value="${e.id}">${empFullName(e)}</option>`).join('');
  
  openModal(`
  <div class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <h3>Subir Documento</h3>
        <button class="modal-close" onclick="closeModal()"><i data-lucide="x" style="width:14px;height:14px"></i></button>
      </div>
      <div class="modal-body">
        <form id="formSubirDoc">
            <div class="form-grid">
            <div class="field form-full"><label>Empleado *</label>
                <select id="docEmpId" required><option value="">Seleccionar empleado...</option>${empOptions}</select>
            </div>
            <div class="field"><label>Nombre del Documento *</label><input type="text" id="docNombre" placeholder="Ej: Boleta Febrero 2026" required></div>
            <div class="field"><label>Tipo *</label>
                <select id="docTipo"><option>Boleta</option><option>Contrato</option><option>ID</option><option>Certificado</option><option>Otro</option></select>
            </div>
            <div class="field form-full">
                <label>Archivo (PDF) *</label>
                <input type="file" id="docArchivo" accept=".pdf" style="padding: 10px; border: 2px dashed var(--border); width: 100%; background: var(--gray-50); border-radius: var(--r);" required>
            </div>
            </div>
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn btn-ghost" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" id="btnSubirDoc" onclick="subirDocumentoBD()">
          <i data-lucide="upload" style="width:14px;height:14px"></i> Subir Archivo
        </button>
      </div>
    </div>
  </div>`);
};

window.subirDocumentoBD = async function() {
    const btn = document.getElementById('btnSubirDoc');
    
    // 🛡️ ESCUDO ANTI-DOBLE CLIC: Si el botón ya está deshabilitado, ignoramos cualquier otro clic
    if (btn.disabled) return;

    const form = document.getElementById('formSubirDoc');
    if(!form.checkValidity()) {
        form.reportValidity(); // Muestra las alertas de "campo requerido"
        return;
    }

    const originalHTML = btn.innerHTML;
    
    // BLOQUEAMOS EL BOTÓN AL INSTANTE
    btn.innerHTML = `<i data-lucide="loader-2" class="lucide-spin" style="width:14px;height:14px"></i> Subiendo...`;
    btn.disabled = true;
    btn.style.opacity = '0.7'; // Le damos efecto visual de apagado
    btn.style.cursor = 'not-allowed'; // Cambiamos el puntero del mouse
    lucide.createIcons();

    // Recolectamos los datos y el archivo físico
    const formData = new FormData();
    formData.append('empId', document.getElementById('docEmpId').value);
    formData.append('nombre', document.getElementById('docNombre').value);
    formData.append('tipo', document.getElementById('docTipo').value);
    formData.append('archivo', document.getElementById('docArchivo').files[0]);

    const csrf = document.querySelector('[name=csrfmiddlewaretoken]')?.value || '';

    try {
        const response = await fetch('/api/documentos/subir/', {
            method: 'POST',
            headers: { 'X-CSRFToken': csrf },
            body: formData 
        });

        const result = await response.json();
        
        if(result.success) {
            closeModal(); // Cerramos el formulario de subida
            
            // ABRIMOS EL MODAL DE ÉXITO ESTILO ENTERPRISE 😎
            setTimeout(() => {
                openModal(`
                  <div class="modal-overlay">
                    <div class="modal" style="max-width: 380px; text-align: center; padding: 40px 20px;">
                        <div style="width: 70px; height: 70px; background: var(--success-50); color: var(--success); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
                            <i data-lucide="check" style="width: 36px; height: 36px;"></i>
                        </div>
                        <h3 style="font-size: 1.4rem; margin-bottom: 10px; font-weight: 800;">¡Subida Exitosa!</h3>
                        <p style="color: var(--text-secondary); margin-bottom: 25px; line-height: 1.5;">El documento se ha encriptado y guardado de forma segura en el repositorio del empleado.</p>
                        <button class="btn btn-primary" style="width: 100%; justify-content: center; padding: 14px;" onclick="window.location.reload();">Continuar</button>
                    </div>
                  </div>
                `);
            }, 100);
            
        } else {
            // SI HAY ERROR, DESBLOQUEAMOS EL BOTÓN PARA QUE INTENTE DE NUEVO
            alert("❌ Error: " + result.message);
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            btn.style.opacity = '1';
            btn.style.cursor = 'pointer';
            lucide.createIcons();
        }
    } catch(e) {
        // SI SE CAE EL INTERNET, DESBLOQUEAMOS EL BOTÓN
        alert("❌ Error de conexión al servidor.");
        btn.innerHTML = originalHTML;
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
        lucide.createIcons();
    }
};