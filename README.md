# 🏢 Sistema de Recursos Humanos - Telecable

Plataforma integral web para la gestión de Recursos Humanos, planillas, asistencia y documentos, desarrollada con **Django (Python)** en el backend y **Vanilla JavaScript** puro en el frontend, respaldada por una base de datos relacional en **PostgreSQL**.

Este sistema cuenta con dos vistas principales: un **Panel Administrativo** para el personal de RR.HH. y un **Portal del Empleado (Self-Service)** para que los colaboradores gestionen su información.

---

## 🚀 Características Principales

### 👨‍💼 Módulo Administrativo (RR.HH.)
* **Gestión de Colaboradores:** CRUD completo de empleados, asignación de sedes, departamentos y puestos.
* **Gestión de Documentos:** Repositorio centralizado con **Visor Inteligente** integrado (Soporte para previsualización de JPG, PNG, PDF y renderizado de Boletas Virtuales sin archivo físico).
* **Control de Asistencia:** Registro de marcaciones, cálculo de horas trabajadas y estados (Asistencia, Tardanza, Falta).
* **Gestión de Vacaciones:** Aprobación/rechazo de solicitudes, cálculo de saldo de días disponibles.
* **Planillas y Boletas:** Emisión masiva de boletas de pago por periodo con un solo clic.

### 👤 Portal del Empleado (Self-Service)
* **Mi Portal:** Dashboard interactivo con el resumen de sueldo neto, antigüedad, saldo vacacional y accesos rápidos.
* **Mis Boletas:** Historial de pagos con opción de visualización detallada, **firma electrónica en base de datos** e impresión oficial.
* **Mis Documentos:** Acceso seguro al expediente personal (Contratos, DNI, Certificados) con descarga directa (Filtro automático para separar boletas).
* **Mis Vacaciones:** Formulario automatizado para solicitar días libres con cálculo de fechas y visualización de estado de aprobación.
* **Mi Asistencia:** Historial personal de marcaciones y totalizador mensual.

---

## 🛠️ Stack Tecnológico

* **Backend:** Python 3, Django 5+
* **Base de Datos:** PostgreSQL
* **Frontend:** HTML5, CSS3 (Custom Properties), Vanilla JavaScript (ES6+), Fetch API asíncrona.
* **Iconografía:** Lucide Icons
* **Arquitectura:** Módulos SPA (Single Page Application) renderizados dinámicamente mediante inyección del DOM.

---

## ⚙️ Requisitos Previos

Antes de ejecutar el proyecto, asegúrate de tener instalado:
* Python 3.10 o superior.
* PostgreSQL (Servicio en ejecución).
* Git.

---

## 🖥️ Instalación y Despliegue Local

Sigue estos pasos para levantar el entorno de desarrollo:

**1. Clonar el repositorio**
\`\`\`bash
git clone https://github.com/Dino154/RHM.git
cd telecable_rrhh
\`\`\`

**2. Crear y activar el entorno virtual**
\`\`\`bash
# En Windows:
python -m venv venv
venv\Scripts\activate

# En Mac/Linux:
python3 -m venv venv
source venv/bin/activate
\`\`\`

**3. Instalar dependencias**
\`\`\`bash
pip install -r requirements.txt
\`\`\`

**4. Configurar la Base de Datos**
Asegúrate de configurar tus credenciales de PostgreSQL en el archivo `settings.py` de Django (sección `DATABASES`). Luego, ejecuta las migraciones:
\`\`\`bash
python manage.py makemigrations
python manage.py migrate
\`\`\`

**5. Crear el superusuario (Admin)**
\`\`\`bash
python manage.py createsuperuser
\`\`\`

**6. Levantar el servidor**
\`\`\`bash
python manage.py runserver
\`\`\`
El sistema estará disponible en `http://127.0.0.1:8000/`.

---

## 📡 API Endpoints Principales

El sistema utiliza endpoints RESTful nativos de Django para comunicarse con el frontend de forma asíncrona:

### Autenticación y Usuarios
* `POST /api/login/`: Autenticación y ruteo según rol.
* `POST /api/empleados/crear/`: Registra un nuevo colaborador.
* `POST /api/empleados/cambiar-password/<id>/`: Actualiza credenciales.

### Listados (Fetch API - GET)
* `GET /api/empleados/listar/`: Retorna JSON con empleados activos.
* `GET /api/documentos/listar/`: Retorna el repositorio general.
* `GET /api/vacaciones/listar/`: Retorna solicitudes de descansos.
* `GET /api/asistencias/listar/`: Retorna historial de marcaciones.

### Operaciones Documentales (POST)
* `POST /api/documentos/subir/`: Recibe `FormData` (archivos físicos y metadatos).
* `POST /api/documentos/eliminar/<id>/`: Borrado seguro de registros.
* `POST /api/documentos/firmar/`: Estampa la firma digital del empleado.
* `POST /api/boletas/emitir/`: Generación masiva de boletas virtuales.

---

## 🌟 Novedades Recientes (Última Versión)

* **Migración Total a PostgreSQL:** Se eliminaron los datos de prueba (`window.MOCK`) en favor de peticiones `fetch` reales al backend.
* **UX/UI Mejorada (Loader Azul):** Implementación de pantallas de carga asíncronas para una experiencia fluida mientras se sincronizan los datos de la base de datos.
* **Visor Documental Inteligente:** Lógica para detectar el tipo de archivo y mostrar un visor PDF, previsualizador de imágenes o un banner descriptivo para "Boletas Virtuales".

---

## 👨‍💻 Autor
* **Diego Estéfano Parodi Tardío** - *Full Stack Developer & Systems Engineering*
