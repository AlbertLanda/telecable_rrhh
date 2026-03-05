// ============================================================
// RHM - Mock Data (all prototype data lives here)
// ============================================================

// Login → Employee record mapping
const USER_EMP_MAP = {
  'admin@rhm.pe': null, // Admin: no single employee record
  'rh@rhm.pe': 6,   // Sandra Ruiz – Jefa de RR.HH.
  'empleado@rhm.pe': 7,   // Luis Torres  – Desarrollador Junior
};

const MOCK = {
  empresas: [
    {
      id: 1,
      nombre: 'Fraze Corporación S.A.C.',
      ruc: '20601234567',
      direccion: 'Av. Javier Prado Este 1234, San Isidro, Lima',
      telefono: '(01) 630-2200',
      email: 'rrhh@frazecorp.pe',
      web: 'www.frazecorp.pe',
      logo: 'FC'
    },
    {
      id: 2,
      nombre: 'Estudios FraZe SAC',
      ruc: '20701234567',
      direccion: 'Calle Las Orquídeas 567, Lince, Lima',
      telefono: '(01) 421-3300',
      email: 'consultoria@estudiosfraze.pe',
      web: 'www.estudiosfraze.pe',
      logo: 'EF'
    }
  ],

  departamentos: [
    { id: 1, nombre: 'Tecnología', desc: 'Desarrollo de software e infraestructura TI', color: '#6366f1', jefe: 'Carlos Mendoza', count: 4 },
    { id: 2, nombre: 'Ventas', desc: 'Gestión comercial y atención al cliente', color: '#10b981', jefe: 'Ana Flores', count: 5 },
    { id: 3, nombre: 'Contabilidad', desc: 'Finanzas, tributos y gestión contable', color: '#f59e0b', jefe: 'Rosa García', count: 2 },
    { id: 4, nombre: 'Operaciones', desc: 'Logística, almacén y procesos internos', color: '#3b82f6', jefe: 'Miguel Torres', count: 3 },
    { id: 5, nombre: 'Marketing', desc: 'Branding, digital y comunicaciones', color: '#ec4899', jefe: 'Lucía Vargas', count: 2 },
    { id: 6, nombre: 'RR.HH.', desc: 'Gestión del talento y bienestar laboral', color: '#9333ea', jefe: 'Sandra Ruiz', count: 1 },
  ],

  puestos: [
    { id: 1, nombre: 'Desarrollador Senior', deptId: 1 },
    { id: 2, nombre: 'Desarrollador Junior', deptId: 1 },
    { id: 3, nombre: 'DevOps Engineer', deptId: 1 },
    { id: 4, nombre: 'Jefe de TI', deptId: 1 },
    { id: 5, nombre: 'Ejecutivo de Ventas', deptId: 2 },
    { id: 6, nombre: 'Supervisor de Ventas', deptId: 2 },
    { id: 7, nombre: 'Analista Contable', deptId: 3 },
    { id: 8, nombre: 'Jefe de Contabilidad', deptId: 3 },
    { id: 9, nombre: 'Operario de Almacén', deptId: 4 },
    { id: 10, nombre: 'Jefe de Operaciones', deptId: 4 },
    { id: 11, nombre: 'Diseñador Gráfico', deptId: 5 },
    { id: 12, nombre: 'Especialista Digital', deptId: 5 },
    { id: 13, nombre: 'Jefe de RR.HH.', deptId: 6 },
  ],

  empleados: [
    { id: 1, companyId: 1, codigo: 'EMP-001', nombres: 'Carlos', apellidos: 'Mendoza López', dni: '45678901', email: 'c.mendoza@frazecorp.pe', tel: '987654321', nacimiento: '1985-03-15', ingreso: '2019-01-10', deptId: 1, puestoId: 4, contrato: 'Indefinido', sueldo: 7500, afp: 'Prima AFP', estado: 'Activo', av: 'av-indigo', genero: 'M' },
    { id: 2, companyId: 1, codigo: 'EMP-002', nombres: 'Ana', apellidos: 'Flores Quispe', dni: '52341678', email: 'a.flores@frazecorp.pe', tel: '976543210', nacimiento: '1990-07-22', ingreso: '2020-03-15', deptId: 2, puestoId: 6, contrato: 'Indefinido', sueldo: 5500, afp: 'Integra', estado: 'Activo', av: 'av-green', genero: 'F' },
    { id: 3, companyId: 1, codigo: 'EMP-003', nombres: 'Rosa', apellidos: 'García Mamani', dni: '63451289', email: 'r.garcia@frazecorp.pe', tel: '965432109', nacimiento: '1988-11-08', ingreso: '2018-06-01', deptId: 3, puestoId: 8, contrato: 'Indefinido', sueldo: 6000, afp: 'Hábitat', estado: 'Activo', av: 'av-amber', genero: 'F' },
    { id: 4, companyId: 1, codigo: 'EMP-004', nombres: 'Miguel', apellidos: 'Torres Salas', dni: '74562390', email: 'm.torres@frazecorp.pe', tel: '954321098', nacimiento: '1982-05-30', ingreso: '2017-09-20', deptId: 4, puestoId: 10, contrato: 'Indefinido', sueldo: 5800, afp: 'ONP', estado: 'Activo', av: 'av-blue', genero: 'M' },
    { id: 5, companyId: 1, codigo: 'EMP-005', nombres: 'Lucía', apellidos: 'Vargas Ccopa', dni: '85673401', email: 'l.vargas@frazecorp.pe', tel: '943210987', nacimiento: '1993-02-14', ingreso: '2021-01-20', deptId: 5, puestoId: 12, contrato: 'Plazo Fijo', sueldo: 4500, afp: 'Prima AFP', estado: 'Activo', av: 'av-pink', genero: 'F' },
    { id: 6, companyId: 1, codigo: 'EMP-006', nombres: 'Sandra', apellidos: 'Ruiz Palomino', dni: '96784512', email: 's.ruiz@frazecorp.pe', tel: '932109876', nacimiento: '1987-09-03', ingreso: '2016-04-12', deptId: 6, puestoId: 13, contrato: 'Indefinido', sueldo: 5200, afp: 'Integra', estado: 'Activo', av: 'av-purple', genero: 'F' },
    { id: 7, companyId: 1, codigo: 'EMP-007', nombres: 'Luis', apellidos: 'Torres Castro', dni: '12345678', email: 'l.torres@frazecorp.pe', tel: '921098765', nacimiento: '1995-06-18', ingreso: '2022-08-01', deptId: 1, puestoId: 2, contrato: 'Plazo Fijo', sueldo: 3800, afp: 'ONP', estado: 'Activo', av: 'av-teal', genero: 'M' },
    { id: 8, companyId: 2, codigo: 'EMP-008', nombres: 'Paola', apellidos: 'Huanca Ríos', dni: '23456789', email: 'p.huanca@frazecorp.pe', tel: '910987654', nacimiento: '1991-12-25', ingreso: '2020-11-10', deptId: 2, puestoId: 5, contrato: 'Indefinido', sueldo: 3200, afp: 'Hábitat', estado: 'En Vacaciones', av: 'av-green', genero: 'F' },
    { id: 9, companyId: 2, codigo: 'EMP-009', nombres: 'Roberto', apellidos: 'Chávez Pumari', dni: '34567890', email: 'r.chavez@frazecorp.pe', tel: '909876543', nacimiento: '1989-04-07', ingreso: '2019-07-15', deptId: 1, puestoId: 1, contrato: 'Indefinido', sueldo: 6500, afp: 'Prima AFP', estado: 'Activo', av: 'av-indigo', genero: 'M' },
    { id: 10, companyId: 2, codigo: 'EMP-010', nombres: 'Carmen', apellidos: 'Llerena Ponce', dni: '45678012', email: 'c.llerena@frazecorp.pe', tel: '898765432', nacimiento: '1994-08-19', ingreso: '2021-05-03', deptId: 2, puestoId: 5, contrato: 'Plazo Fijo', sueldo: 3200, afp: 'Integra', estado: 'Activo', av: 'av-amber', genero: 'F' },
    { id: 11, companyId: 2, codigo: 'EMP-011', nombres: 'Diego', apellidos: 'Mamani Colque', dni: '56789123', email: 'd.mamani@frazecorp.pe', tel: '887654321', nacimiento: '1992-01-30', ingreso: '2020-02-17', deptId: 4, puestoId: 9, contrato: 'Indefinido', sueldo: 2800, afp: 'ONP', estado: 'Activo', av: 'av-blue', genero: 'M' },
    { id: 12, companyId: 2, codigo: 'EMP-012', nombres: 'Valeria', apellidos: 'Soto Araujo', dni: '67890234', email: 'v.soto@frazecorp.pe', tel: '876543210', nacimiento: '1996-10-12', ingreso: '2023-03-01', deptId: 5, puestoId: 11, contrato: 'Plazo Fijo', sueldo: 3500, afp: 'Prima AFP', estado: 'Activo', av: 'av-pink', genero: 'F' },
    { id: 13, companyId: 2, codigo: 'EMP-013', nombres: 'Jorge', apellidos: 'Ramos Vidal', dni: '78901345', email: 'j.ramos@frazecorp.pe', tel: '865432109', nacimiento: '1983-07-22', ingreso: '2015-10-05', deptId: 3, puestoId: 7, contrato: 'Indefinido', sueldo: 4200, afp: 'Hábitat', estado: 'Activo', av: 'av-teal', genero: 'M' },
    { id: 14, companyId: 2, codigo: 'EMP-014', nombres: 'Milagros', apellidos: 'Quispe Apaza', dni: '89012456', email: 'm.quispe@frazecorp.pe', tel: '854321098', nacimiento: '1998-03-05', ingreso: '2023-07-15', deptId: 1, puestoId: 2, contrato: 'Practicante', sueldo: 1500, afp: 'ONP', estado: 'En Vacaciones', av: 'av-purple', genero: 'F' },
    { id: 15, companyId: 2, codigo: 'EMP-015', nombres: 'Fernando', apellidos: 'Ccallo Huanca', dni: '90123567', email: 'f.ccallo@frazecorp.pe', tel: '843210987', nacimiento: '1986-06-14', ingreso: '2018-12-10', deptId: 4, puestoId: 9, contrato: 'Indefinido', sueldo: 2800, afp: 'Integra', estado: 'Activo', av: 'av-red', genero: 'M' },
  ],

  asistencias: [
    { id: 1, empId: 1, fecha: '2026-02-23', entrada: '08:02', salida: '17:05', tipo: 'Asistencia', obs: '' },
    { id: 2, empId: 2, fecha: '2026-02-23', entrada: '08:15', salida: '17:00', tipo: 'Asistencia', obs: '' },
    { id: 3, empId: 3, fecha: '2026-02-23', entrada: '08:00', salida: '17:10', tipo: 'Asistencia', obs: '' },
    { id: 4, empId: 4, fecha: '2026-02-23', entrada: '08:30', salida: '17:00', tipo: 'Tardanza', obs: 'Tráfico' },
    { id: 5, empId: 5, fecha: '2026-02-23', entrada: '08:05', salida: '17:00', tipo: 'Asistencia', obs: '' },
    { id: 6, empId: 6, fecha: '2026-02-23', entrada: '08:00', salida: '17:00', tipo: 'Asistencia', obs: '' },
    { id: 7, empId: 7, fecha: '2026-02-23', entrada: '08:10', salida: '17:00', tipo: 'Asistencia', obs: '' },
    { id: 8, empId: 9, fecha: '2026-02-23', entrada: '08:00', salida: '18:30', tipo: 'Hora Extra', obs: 'Proyecto urgente' },
    { id: 9, empId: 10, fecha: '2026-02-23', entrada: '08:20', salida: '17:00', tipo: 'Tardanza', obs: '' },
    { id: 10, empId: 11, fecha: '2026-02-23', entrada: '08:00', salida: '17:00', tipo: 'Asistencia', obs: '' },
    { id: 11, empId: 12, fecha: '2026-02-23', entrada: '08:05', salida: '17:05', tipo: 'Asistencia', obs: '' },
    { id: 12, empId: 13, fecha: '2026-02-23', entrada: '08:00', salida: '17:00', tipo: 'Asistencia', obs: '' },
    { id: 13, empId: 15, fecha: '2026-02-23', entrada: '09:15', salida: '17:00', tipo: 'Tardanza', obs: 'Cita médica' },
    { id: 14, empId: 1, fecha: '2026-02-20', entrada: '08:00', salida: '17:00', tipo: 'Asistencia', obs: '' },
    { id: 15, empId: 2, fecha: '2026-02-20', entrada: '08:10', salida: '17:00', tipo: 'Tardanza', obs: '' },
    { id: 16, empId: 9, fecha: '2026-02-20', entrada: '08:00', salida: '19:00', tipo: 'Hora Extra', obs: 'Sprint cierre' },
    { id: 17, empId: 7, fecha: '2026-02-20', entrada: '08:05', salida: '17:00', tipo: 'Asistencia', obs: '' },
    { id: 18, empId: 3, fecha: '2026-02-19', entrada: '08:00', salida: '17:00', tipo: 'Asistencia', obs: '' },
    { id: 19, empId: 4, fecha: '2026-02-19', entrada: '—', salida: '—', tipo: 'Falta', obs: 'Sin justificación' },
    { id: 20, empId: 5, fecha: '2026-02-19', entrada: '08:00', salida: '17:00', tipo: 'Asistencia', obs: '' },
  ],

  vacaciones: [
    { id: 1, empId: 8, inicio: '2026-02-17', fin: '2026-02-28', dias: 10, estado: 'Aprobado', motivo: 'Vacaciones anuales', aprobadoPor: 'Sandra Ruiz' },
    { id: 2, empId: 14, inicio: '2026-02-10', fin: '2026-02-21', dias: 10, estado: 'Aprobado', motivo: 'Vacaciones anuales', aprobadoPor: 'Sandra Ruiz' },
    { id: 3, empId: 5, inicio: '2026-03-10', fin: '2026-03-14', dias: 5, estado: 'Pendiente', motivo: 'Asuntos personales', aprobadoPor: '' },
    { id: 4, empId: 7, inicio: '2026-03-20', fin: '2026-03-27', dias: 6, estado: 'Pendiente', motivo: 'Vacaciones anuales', aprobadoPor: '' },
    { id: 5, empId: 11, inicio: '2026-03-03', fin: '2026-03-07', dias: 5, estado: 'Pendiente', motivo: 'Viaje familiar', aprobadoPor: '' },
    { id: 6, empId: 1, inicio: '2026-04-01', fin: '2026-04-15', dias: 15, estado: 'Pendiente', motivo: 'Vacaciones anuales', aprobadoPor: '' },
    { id: 7, empId: 3, inicio: '2025-12-23', fin: '2026-01-03', dias: 10, estado: 'Aprobado', motivo: 'Navidad y Año Nuevo', aprobadoPor: 'Sandra Ruiz' },
    { id: 8, empId: 2, inicio: '2025-11-10', fin: '2025-11-14', dias: 5, estado: 'Rechazado', motivo: 'Solicitud personal', aprobadoPor: 'Sandra Ruiz' },
  ],

  documentos: [
    { id: 1, empId: 1, nombre: 'Contrato de Trabajo', tipo: 'Contrato', fecha: '2019-01-10', kb: 245 },
    { id: 2, empId: 1, nombre: 'DNI (Copia)', tipo: 'ID', fecha: '2019-01-10', kb: 120 },
    { id: 3, empId: 1, nombre: 'Boleta Enero 2026', tipo: 'Boleta', fecha: '2026-02-05', kb: 88, signed: false },
    { id: 4, empId: 1, nombre: 'Certificado Médico', tipo: 'Otro', fecha: '2025-08-14', kb: 310 },
    { id: 5, empId: 2, nombre: 'Contrato de Trabajo', tipo: 'Contrato', fecha: '2020-03-15', kb: 240 },
    { id: 6, empId: 2, nombre: 'DNI (Copia)', tipo: 'ID', fecha: '2020-03-15', kb: 115 },
    { id: 7, empId: 2, nombre: 'Boleta Enero 2026', tipo: 'Boleta', fecha: '2026-02-05', kb: 88, signed: true, signedBy: 'Ana Flores Quispe', signedDni: '52341678', signedAt: '2026-02-06 10:15' },
    { id: 8, empId: 9, nombre: 'Contrato de Trabajo', tipo: 'Contrato', fecha: '2019-07-15', kb: 248 },
    { id: 9, empId: 9, nombre: 'Boleta Enero 2026', tipo: 'Boleta', fecha: '2026-02-05', kb: 88, signed: false },
    { id: 10, empId: 9, nombre: 'Certificado Estudios', tipo: 'Certificado', fecha: '2019-07-10', kb: 520 },
    { id: 11, empId: 7, nombre: 'Contrato Plazo Fijo', tipo: 'Contrato', fecha: '2022-08-01', kb: 238 },
    { id: 12, empId: 7, nombre: 'DNI (Copia)', tipo: 'ID', fecha: '2022-08-01', kb: 118 },
    { id: 13, empId: 7, nombre: 'Boleta Enero 2026', tipo: 'Boleta', fecha: '2026-02-05', kb: 86, signed: false },
    { id: 14, empId: 7, nombre: 'Boleta Diciembre 2025', tipo: 'Boleta', fecha: '2026-01-05', kb: 84, signed: true, signedBy: 'Luis Torres Castro', signedDni: '12345678', signedAt: '2026-01-06 14:20' },
  ],

  saldoVacaciones: {
    diasAnuales: 30,
    diasUsados: 10,
    diasPendientes: 20
  },

  weeklyAttendance: [
    { day: 'Lun 17', pres: 11, falt: 2, tard: 2 },
    { day: 'Mar 18', pres: 12, falt: 2, tard: 1 },
    { day: 'Mié 19', pres: 10, falt: 3, tard: 2 },
    { day: 'Jue 20', pres: 13, falt: 1, tard: 1 },
    { day: 'Vie 21', pres: 11, falt: 2, tard: 2 },
    { day: 'Lun 23', pres: 13, falt: 2, tard: 3 },
  ],
};

// Helpers
function getEmp(id) { return MOCK.empleados.find(e => e.id === id); }
function getDept(id) { return MOCK.departamentos.find(d => d.id === id); }
function getPuesto(id) { return MOCK.puestos.find(p => p.id === id); }
function empFullName(e) { return `${e.nombres} ${e.apellidos}`; }
function fmtSoles(n) { return 'S/ ' + Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtDate(str) {
  if (!str || str === '—') return str;
  if (str.includes(' ')) { // Handle timestamp
     const [d, t] = str.split(' ');
     const [y, m, day] = d.split('-');
     const ms = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
     return `${day} ${ms[+m - 1]} ${y} ${t}`;
  }
  const [y, m, d] = str.split('-');
  const ms = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${d} ${ms[+m - 1]} ${y}`;
}
function horasDiff(e, s) {
  if (e === '—' || s === '—') return '—';
  const [eh, em] = e.split(':').map(Number);
  const [sh, sm] = s.split(':').map(Number);
  const mins = (sh * 60 + sm) - (eh * 60 + em);
  const h = Math.floor(mins / 60); const m = mins % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}
function tipoColor(t) {
  const m = { Asistencia: 'badge-green', Tardanza: 'badge-amber', Falta: 'badge-red', 'Hora Extra': 'badge-blue', Permiso: 'badge-purple' };
  return m[t] || 'badge-gray';
}
function estadoBadge(e) {
  const m = { Activo: 'badge-green', 'En Vacaciones': 'badge-blue', Suspendido: 'badge-red', Inactivo: 'badge-gray' };
  return m[e] || 'badge-gray';
}
function vacEstadoBadge(e) {
  const m = { Aprobado: 'badge-green', Pendiente: 'badge-amber', Rechazado: 'badge-red' };
  return m[e] || 'badge-gray';
}
const AVATAR_COLORS = ['av-indigo', 'av-purple', 'av-blue', 'av-green', 'av-amber', 'av-red', 'av-pink', 'av-teal'];
function avatarColor(id) { return AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length]; }
function empInitials(e) { return (e.nombres[0] + e.apellidos[0]).toUpperCase(); }

// Planilla calculation (Peru rules)
function calcPlanilla(emp) {
  const bruto = Number(emp.sueldo) || 0;
  
  // 1. REGLA PARA HONORARIOS Y PRACTICANTES (Sin descuentos de ley)
  if (emp.contrato === 'Recibo por Honorarios' || emp.contrato === 'Practicante') {
      return {
          bruto: bruto,
          asigFam: 0,
          brutoTotal: bruto,
          afpMonto: 0,
          afpLabel: emp.contrato === 'Practicante' ? 'Modalidad Formativa' : 'Sin retención (4ta Cat.)',
          essalud: 0,
          neto: bruto // Reciben su dinero líquido
      };
  }

  // 2. REGLA PARA PLANILLA REGULAR (Indefinido / Plazo Fijo)
  const asigFam = 102.50; // Asignación familiar estándar
  const brutoTotal = bruto + asigFam;
  
  let afpMonto = 0, afpLabel = '';
  if (emp.afp === 'ONP') {
    afpMonto = brutoTotal * 0.13;
    afpLabel = 'ONP 13%';
  } else if (emp.afp && emp.afp !== 'Sin Pensión') {
    // AFP privada: ~10% aporte + 1.74% comisión + 1.35% seguro ≈ 13.09%
    afpMonto = brutoTotal * 0.1309;
    afpLabel = `${emp.afp} ~13.09%`;
  } else {
    afpMonto = 0;
    afpLabel = 'Sin retención';
  }
  
  const essalud = brutoTotal * 0.09; // Cargo del empleador
  const neto = brutoTotal - afpMonto;
  
  return { bruto, asigFam, brutoTotal, afpMonto, afpLabel, essalud, neto };
}
