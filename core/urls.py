from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

# Importamos TODAS las vistas (incluida la de emitir_boletas)
from apps.empleados.views import (
    login_view, 
    app_view, 
    api_login, 
    api_crear_empleado, 
    api_editar_empleado,
    listar_empleados, 
    listar_departamentos, 
    listar_empresas, 
    listar_sedes, 
    listar_puestos,
    api_subir_documento, 
    api_firmar_documento,
    api_eliminar_documento,
    api_deshabilitar_empleado,
    api_cambiar_password,
    api_eliminar_empleado,      
    api_editar_departamento,
    api_crear_departamento,
    listar_asistencias,       
    api_crear_asistencia,      
    listar_vacaciones,
    api_crear_vacacion,
    gestionar_vacacion,
    emitir_boletas,
    listar_documentos
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # ----------------------------------------------------
    # RUTAS DE LA INTERFAZ Y LOGIN
    # ----------------------------------------------------
    path('', login_view, name='login'),
    path('app/', app_view, name='app'),
    path('api/login/', api_login, name='api_login'),
    
    # ----------------------------------------------------
    # RUTAS API - LISTADOS PARA EL JAVASCRIPT (GET)
    # ----------------------------------------------------
    path('api/empleados/listar/', listar_empleados, name='listar_empleados'),
    path('api/departamentos/listar/', listar_departamentos, name='listar_departamentos'),
    path('api/empresas/listar/', listar_empresas, name='listar_empresas'),
    path('api/sedes/listar/', listar_sedes, name='listar_sedes'),
    path('api/puestos/listar/', listar_puestos, name='listar_puestos'),
    path('api/asistencias/listar/', listar_asistencias, name='listar_asistencias'), 
    path('api/documentos/listar/', listar_documentos, name='listar_documentos'),

    # ----------------------------------------------------
    # RUTAS API - CREAR Y EDITAR EMPLEADOS (POST)
    # ----------------------------------------------------
    path('api/empleados/crear/', api_crear_empleado, name='api_crear_empleado'),
    path('api/empleados/editar/<int:id>/', api_editar_empleado, name='api_editar_empleado'),
    
    # ----------------------------------------------------
    # RUTAS API - SEGURIDAD Y BAJAS EMPLEADOS (POST)
    # ----------------------------------------------------
    path('api/empleados/deshabilitar/<int:id>/', api_deshabilitar_empleado, name='api_deshabilitar_empleado'),
    path('api/empleados/cambiar-password/<int:id>/', api_cambiar_password, name='api_cambiar_password'),
    path('api/empleados/eliminar/<int:id>/', api_eliminar_empleado, name='api_eliminar_empleado'),
    
    # ----------------------------------------------------
    # RUTAS API - DOCUMENTOS
    # ----------------------------------------------------
    path('api/documentos/subir/', api_subir_documento, name='api_subir_documento'),
    path('api/documentos/firmar/', api_firmar_documento, name='api_firmar_documento'),
    path('api/documentos/eliminar/<int:id>/', api_eliminar_documento, name='api_eliminar_documento'),

    # ----------------------------------------------------
    # RUTAS API - DEPARTAMENTOS
    # ----------------------------------------------------
    path('api/departamentos/crear/', api_crear_departamento, name='api_crear_departamento'), 
    path('api/departamentos/editar/<int:id>/', api_editar_departamento, name='api_editar_departamento'),

    # ----------------------------------------------------
    # RUTAS API - ASISTENCIAS
    # ----------------------------------------------------
    path('api/asistencias/crear/', api_crear_asistencia, name='api_crear_asistencia'), 

    # ----------------------------------------------------
    # RUTAS API - VACACIONES
    # ----------------------------------------------------
    path('api/vacaciones/listar/', listar_vacaciones, name='listar_vacaciones'),
    path('api/vacaciones/crear/', api_crear_vacacion, name='api_crear_vacacion'),
    path('api/vacaciones/gestionar/<int:id>/', gestionar_vacacion, name='gestionar_vacacion'),

    # ----------------------------------------------------
    # RUTAS API - PLANILLA (POST)
    # ----------------------------------------------------
    path('api/boletas/emitir/', emitir_boletas, name='emitir_boletas'), # 🔥 LÍNEA AGREGADA: Ruta final
]

# Configuración para servir archivos multimedia (PDFs, imágenes) en desarrollo
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)