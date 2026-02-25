-- RHM - Recursos Humanos Management
-- Draft SQL Schema for Database Migration

-- Departments
CREATE TABLE departamentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    color TEXT,
    jefe_nombre TEXT
);

-- Job Positions
CREATE TABLE puestos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    dept_id INTEGER,
    FOREIGN KEY (dept_id) REFERENCES departamentos(id)
);

-- Employees
CREATE TABLE empleados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE NOT NULL,
    nombres TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    dni TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    telefono TEXT,
    fecha_nacimiento DATE,
    fecha_ingreso DATE,
    dept_id INTEGER,
    puesto_id INTEGER,
    tipo_contrato TEXT,
    sueldo_base DECIMAL(10,2),
    afp_onp TEXT,
    estado TEXT DEFAULT 'Activo',
    avatar_color TEXT,
    genero CHAR(1),
    FOREIGN KEY (dept_id) REFERENCES departamentos(id),
    FOREIGN KEY (puesto_id) REFERENCES puestos(id)
);

-- Attendance
CREATE TABLE asistencias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id INTEGER,
    fecha DATE NOT NULL,
    hora_entrada TIME,
    hora_salida TIME,
    tipo TEXT, -- 'Asistencia', 'Tardanza', 'Falta', 'Hora Extra'
    observaciones TEXT,
    FOREIGN KEY (emp_id) REFERENCES empleados(id)
);

-- Vacations
CREATE TABLE vacaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id INTEGER,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    dias_totales INTEGER,
    estado TEXT DEFAULT 'Pendiente', -- 'Aprobado', 'Rechazado'
    motivo TEXT,
    aprobado_por TEXT,
    FOREIGN KEY (emp_id) REFERENCES empleados(id)
);

-- Documents
CREATE TABLE documentos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    emp_id INTEGER,
    nombre_archivo TEXT NOT NULL,
    tipo_documento TEXT, -- 'Contrato', 'Boleta', 'DNI', etc.
    fecha_subida TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tamaño_kb INTEGER,
    FOREIGN KEY (emp_id) REFERENCES empleados(id)
);

-- Seed Initial Data (Example for Departments)
INSERT INTO departamentos (nombre, descripcion, color, jefe_nombre) VALUES 
('Tecnología', 'Desarrollo de software e infraestructura TI', '#6366f1', 'Carlos Mendoza'),
('RR.HH.', 'Gestión del talento y bienestar laboral', '#9333ea', 'Sandra Ruiz');
