import json
from datetime import date, timedelta
from django.http import JsonResponse
from django.contrib.auth import authenticate, login as django_login
from django.shortcuts import render
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.core.serializers.json import DjangoJSONEncoder

# Importamos las tablas reales
from .models import Empleado, Departamento, Puesto, Sede, Empresa, Documento, PerfilUsuario
from apps.asistencia.models import Asistencia
from apps.vacaciones.models import Vacacion

def login_view(request):
    return render(request, 'index.html')

def app_view(request):
    # Traemos los datos para renderizar el inicio
    empresas = Empresa.objects.all()
    empresas_list = [{"id": emp.id, "nombre": emp.razon_social, "ruc": emp.ruc} for emp in empresas]
    
    sedes = Sede.objects.all()
    sedes_list = [{"id": s.id, "nombre": s.nombre} for s in sedes]

    deptos = Departamento.objects.all()
    deptos_list = [{"id": d.id, "nombre": d.nombre, "desc": d.descripcion or "", "color": d.color or "#6366f1", "jefe": d.jefe_nombre or "Sin jefe", "count": Empleado.objects.filter(departamento=d).count()} for d in deptos]
        
    puestos = Puesto.objects.all()
    puestos_list = [{"id": p.id, "nombre": p.nombre, "deptId": p.departamento_id} for p in puestos]

    empleados = Empleado.objects.all()
    emps_list = [
        {
            "id": e.id, "codigo": e.codigo, "nombres": e.nombres, "apellidos": e.apellidos, 
            "dni": e.dni, "email": e.email, "tel": e.telefono or "", 
            "nacimiento": str(e.fecha_nacimiento) if e.fecha_nacimiento else "", 
            "ingreso": str(e.fecha_ingreso) if e.fecha_ingreso else "", 
            "deptId": e.departamento_id, "puestoId": e.puesto_id, "sedeId": e.sede_id, 
            "empresaId": e.empresa_id,
            "empresaNombre": e.empresa.razon_social if e.empresa else "No asignada",
            "contrato": e.tipo_contrato or "No definido", "sueldo": float(e.sueldo_base) if e.sueldo_base else 0.0, 
            "afp": e.afp_onp or "No aplica", "estado": e.estado, "av": e.avatar_color or "av-indigo", "genero": e.genero or ""
        } 
        for e in empleados
    ]

    asistencias = Asistencia.objects.all()
    asis_list = [{"id": a.id, "empId": a.empleado_id, "fecha": str(a.fecha), "entrada": a.hora_entrada.strftime('%H:%M') if a.hora_entrada else '—', "salida": a.hora_salida.strftime('%H:%M') if a.hora_salida else '—', "tipo": a.tipo, "obs": a.observaciones or ""} for a in asistencias]

    vacaciones = Vacacion.objects.all()
    vac_list = [{"id": v.id, "empId": v.empleado_id, "inicio": str(v.fecha_inicio), "fin": str(v.fecha_fin), "dias": v.dias_totales or 0, "estado": v.estado, "motivo": v.motivo or "", "aprobadoPor": v.aprobado_por or ""} for v in vacaciones]

    documentos = Documento.objects.all()
    docs_list = [
        {
            "id": d.id, "empId": d.empleado_id, "nombre": d.nombre_archivo, "tipo": d.tipo_documento or "Otro",
            "fecha": d.fecha_subida.strftime('%Y-%m-%d') if d.fecha_subida else "", 
            "kb": d.tamaño_kb or 0, 
            # 🔥 Mejora de seguridad: Solo lee la URL si realmente hay un archivo físico adjunto
            "url": d.archivo.url if d.archivo and d.archivo.name else "",
            "signed": d.firmado, "signedAt": d.fecha_firma.strftime('%Y-%m-%d %H:%M') if d.fecha_firma else None
        }
        for d in documentos
    ]

    hoy = date.today()
    dias_es = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
    weekly_att = []
    
    for i in range(6, -1, -1):
        d = hoy - timedelta(days=i)
        day_str = f"{dias_es[d.weekday()]} {d.day}"
        att_day = Asistencia.objects.filter(fecha=d)
        weekly_att.append({
            "day": day_str, "pres": att_day.filter(tipo='Asistencia').count(),
            "tard": att_day.filter(tipo='Tardanza').count(), "falt": att_day.filter(tipo='Falta').count()
        })

    context = {
        "empresas_json": json.dumps(empresas_list),
        "sedes_json": json.dumps(sedes_list),
        "deptos_json": json.dumps(deptos_list),
        "puestos_json": json.dumps(puestos_list),
        "emps_json": json.dumps(emps_list),
        "asis_json": json.dumps(asis_list),
        "vac_json": json.dumps(vac_list),
        "docs_json": json.dumps(docs_list),
        "weekly_json": json.dumps(weekly_att),
    }
    
    return render(request, 'app.html', context)


# =========================================================
# VISTAS DE LOGIN
# =========================================================

def api_login(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            password = data.get('password')
            
            user = authenticate(request, username=username, password=password)
            
            if user is not None:
                django_login(request, user) 
                
                rol_asignado = 'Empleado'
                id_empleado = None 
                
                perfil = PerfilUsuario.objects.filter(usuario=user).first()
                if perfil:
                    rol_asignado = perfil.rol
                    if perfil.empleado:
                        id_empleado = perfil.empleado.id
                elif user.is_superuser:
                    rol_asignado = 'Admin'

                nombre_mostrar = user.first_name if user.first_name else user.username

                return JsonResponse({
                    'success': True, 
                    'redirect_url': '/app/', 
                    'role': rol_asignado,
                    'name': nombre_mostrar, 
                    'emp_id': id_empleado 
                })
            else:
                return JsonResponse({'success': False, 'message': 'Usuario o contraseña incorrectos.'})
        except Exception as e:
            print(f"Error en login: {str(e)}")
            return JsonResponse({'success': False, 'message': 'Error interno en el servidor.'})
    return JsonResponse({'success': False, 'message': 'Método no permitido'})


# =========================================================
# VISTAS PARA LA API (LISTAR DATOS PARA EL FETCH)
# =========================================================

@require_http_methods(["GET"])
def listar_empleados(request):
    empleados = list(Empleado.objects.values())
    return JsonResponse(empleados, safe=False, encoder=DjangoJSONEncoder)

@require_http_methods(["GET"])
def listar_departamentos(request):
    departamentos = list(Departamento.objects.values())
    return JsonResponse(departamentos, safe=False, encoder=DjangoJSONEncoder)

@require_http_methods(["GET"])
def listar_empresas(request):
    empresas = list(Empresa.objects.values())
    return JsonResponse(empresas, safe=False, encoder=DjangoJSONEncoder)

@require_http_methods(["GET"])
def listar_sedes(request):
    sedes = list(Sede.objects.values())
    return JsonResponse(sedes, safe=False, encoder=DjangoJSONEncoder)

@require_http_methods(["GET"])
def listar_puestos(request):
    puestos = list(Puesto.objects.values())
    return JsonResponse(puestos, safe=False, encoder=DjangoJSONEncoder)

@require_http_methods(["GET"])
def listar_asistencias(request):
    asistencias = list(Asistencia.objects.values())
    return JsonResponse(asistencias, safe=False, encoder=DjangoJSONEncoder)

@require_http_methods(["GET"])
def listar_vacaciones(request):
    vacaciones = list(Vacacion.objects.values('id', 'empleado_id', 'fecha_inicio', 'fecha_fin', 'dias_totales', 'motivo', 'estado', 'aprobado_por'))
    return JsonResponse(vacaciones, safe=False, encoder=DjangoJSONEncoder)

@require_http_methods(["GET"])
def listar_documentos(request):
    documentos = list(Documento.objects.values())
    return JsonResponse(documentos, safe=False, encoder=DjangoJSONEncoder)


# =========================================================
# VISTAS PARA CREAR Y EDITAR EMPLEADOS
# =========================================================

@csrf_exempt
def api_crear_empleado(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            dni_ingresado = data.get('dni')
            
            if Empleado.objects.filter(dni=dni_ingresado).exists():
                return JsonResponse({'success': False, 'message': 'Ya existe un empleado con este DNI en el sistema.'})
            
            Empleado.objects.create(
                codigo=f"EMP-{dni_ingresado}",
                nombres=data.get('nombres'),
                apellidos=data.get('apellidos'),
                dni=dni_ingresado,
                genero=data.get('genero'),
                email=data.get('email'),
                telefono=data.get('telefono'),
                fecha_nacimiento=data.get('fecha_nacimiento') or None,
                fecha_ingreso=data.get('fecha_ingreso') or None,
                tipo_contrato=data.get('tipo_contrato'),
                sueldo_base=data.get('sueldo_base'),
                afp_onp=data.get('afp_onp'),
                sede_id=data.get('sede_id'),
                empresa_id=data.get('empresa_id'),
                departamento_id=data.get('departamento_id'),
                puesto_id=data.get('puesto_id'),
                estado='Activo'
            )
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})
    return JsonResponse({'success': False, 'message': 'Método no permitido'})

@csrf_exempt
def api_editar_empleado(request, id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            empleado = Empleado.objects.get(id=id)
            dni_ingresado = data.get('dni')
            
            if Empleado.objects.filter(dni=dni_ingresado).exclude(id=id).exists():
                return JsonResponse({'success': False, 'message': 'El DNI ingresado ya pertenece a otro colaborador.'})

            empleado.empresa_id = data.get('empresa_id')
            empleado.sede_id = data.get('sede_id')
            empleado.departamento_id = data.get('departamento_id')
            empleado.puesto_id = data.get('puesto_id')
            empleado.email = data.get('email')
            empleado.nombres = data.get('nombres')
            empleado.apellidos = data.get('apellidos')
            empleado.dni = dni_ingresado
            empleado.genero = data.get('genero')
            empleado.telefono = data.get('telefono')
            empleado.fecha_nacimiento = data.get('fecha_nacimiento') or None
            empleado.fecha_ingreso = data.get('fecha_ingreso') or None
            empleado.tipo_contrato = data.get('tipo_contrato')
            empleado.sueldo_base = data.get('sueldo_base')
            empleado.afp_onp = data.get('afp_onp')
            empleado.estado = data.get('estado')
            
            empleado.save()
            return JsonResponse({'success': True, 'message': 'Datos actualizados.'})
        except Empleado.DoesNotExist:
            return JsonResponse({'success': False, 'message': 'Colaborador no encontrado.'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})
    return JsonResponse({'success': False, 'message': 'Método no permitido'})


# =========================================================
# VISTAS DE SEGURIDAD Y BAJAS 
# =========================================================

@csrf_exempt
def api_deshabilitar_empleado(request, id):
    if request.method == 'POST':
        try:
            empleado = Empleado.objects.get(id=id)
            empleado.estado = 'Cesado' 
            empleado.save()
            perfil = PerfilUsuario.objects.filter(empleado=empleado).first()
            if perfil and perfil.usuario:
                perfil.usuario.is_active = False
                perfil.usuario.save()
            return JsonResponse({'success': True, 'message': 'Colaborador deshabilitado.'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})
    return JsonResponse({'success': False, 'message': 'Método no permitido'})

@csrf_exempt
def api_cambiar_password(request, id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            nueva_password = data.get('password')
            if not nueva_password or len(nueva_password) < 6:
                return JsonResponse({'success': False, 'message': 'Mínimo 6 caracteres.'})

            empleado = Empleado.objects.get(id=id)
            perfil = PerfilUsuario.objects.filter(empleado=empleado).first()
            
            if perfil and perfil.usuario:
                perfil.usuario.set_password(nueva_password)
                perfil.usuario.save()
                return JsonResponse({'success': True, 'message': 'Contraseña actualizada.'})
            else:
                return JsonResponse({'success': False, 'message': 'Sin usuario vinculado.'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})
    return JsonResponse({'success': False, 'message': 'Método no permitido'})

@csrf_exempt
def api_eliminar_empleado(request, id):
    if request.method == 'POST' or request.method == 'DELETE':
        try:
            empleado = Empleado.objects.get(id=id)
            perfil = PerfilUsuario.objects.filter(empleado=empleado).first()
            if perfil and perfil.usuario:
                perfil.usuario.delete()
            empleado.delete()
            return JsonResponse({'success': True, 'message': 'Empleado eliminado.'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': 'Error al eliminar.'})
    return JsonResponse({'success': False, 'message': 'Método no permitido'})


# =========================================================
# VISTAS DE DEPARTAMENTOS
# =========================================================

@csrf_exempt
def api_crear_departamento(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            nombre = data.get('nombre')
            if not nombre:
                return JsonResponse({'success': False, 'message': 'El nombre es obligatorio.'})
            Departamento.objects.create(
                nombre=nombre,
                descripcion=data.get('descripcion'),
                jefe_nombre=data.get('jefe_nombre'),
                color=data.get('color')
            )
            return JsonResponse({'success': True, 'message': 'Departamento creado exitosamente.'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})
    return JsonResponse({'success': False, 'message': 'Método no permitido'})

@csrf_exempt
def api_editar_departamento(request, id):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            departamento = Departamento.objects.get(id=id)
            departamento.nombre = data.get('nombre')
            departamento.descripcion = data.get('descripcion')
            departamento.jefe_nombre = data.get('jefe_nombre')
            departamento.color = data.get('color')
            departamento.save()
            return JsonResponse({'success': True, 'message': 'Departamento actualizado.'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})
    return JsonResponse({'success': False, 'message': 'Método no permitido'})


# =========================================================
# VISTAS DE ASISTENCIA Y VACACIONES
# =========================================================

@csrf_exempt
def api_crear_asistencia(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            empleado_id = data.get('empleado_id')
            fecha = data.get('fecha')
            
            if not empleado_id or not fecha:
                return JsonResponse({'success': False, 'message': 'Empleado y Fecha son obligatorios.'})

            Asistencia.objects.create(
                empleado_id=empleado_id,
                fecha=fecha,
                tipo=data.get('tipo'),
                hora_entrada=data.get('hora_entrada') or None,
                hora_salida=data.get('hora_salida') or None,
                observaciones=data.get('observaciones')
            )
            return JsonResponse({'success': True, 'message': 'Asistencia guardada.'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})
    return JsonResponse({'success': False, 'message': 'Método no permitido'})

@csrf_exempt
def api_crear_vacacion(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            Vacacion.objects.create(
                empleado_id=data.get('empleado_id'),
                fecha_inicio=data.get('fecha_inicio'),
                fecha_fin=data.get('fecha_fin'),
                dias_totales=data.get('dias_totales'),
                motivo=data.get('motivo'),
                estado='Pendiente'
            )
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})
    return JsonResponse({'success': False})

@csrf_exempt
def gestionar_vacacion(request, id):
    if request.method == 'POST':
        data = json.loads(request.body)
        vac = Vacacion.objects.get(id=id)
        vac.estado = data.get('estado')
        vac.aprobado_por = request.user.username 
        vac.save()
        return JsonResponse({'success': True})


# =========================================================
# VISTAS DE DOCUMENTOS Y PLANILLA
# =========================================================

@csrf_exempt
def api_subir_documento(request):
    if request.method == 'POST':
        try:
            emp_id = request.POST.get('empId')
            nombre = request.POST.get('nombre')
            tipo = request.POST.get('tipo')
            archivo = request.FILES.get('archivo')

            if not all([emp_id, nombre, tipo, archivo]):
                return JsonResponse({'success': False, 'message': 'Faltan datos.'})

            empleado = Empleado.objects.get(id=emp_id)
            Documento.objects.create(
                empleado=empleado,
                nombre_archivo=nombre,
                tipo_documento=tipo,
                archivo=archivo,
                tamaño_kb=round(archivo.size / 1024) 
            )
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})
    return JsonResponse({'success': False, 'message': 'Método no permitido'})

@csrf_exempt
def api_firmar_documento(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            doc_id = data.get('doc_id')
            documento = Documento.objects.get(id=doc_id)
            documento.firmado = True
            documento.fecha_firma = timezone.now()
            documento.save()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})
    return JsonResponse({'success': False, 'message': 'Método no permitido'})

@csrf_exempt
def api_eliminar_documento(request, id):
    if request.method == 'POST':
        try:
            doc = Documento.objects.get(id=id) 
            doc.delete()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})
    return JsonResponse({'success': False, 'message': 'Método no permitido'})

@csrf_exempt
def emitir_boletas(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            periodo = data.get('periodo', 'Desconocido')
            
            empleados_activos = Empleado.objects.filter(estado='Activo')
            boletas_creadas = 0

            for emp in empleados_activos:
                nombre_boleta = f"Boleta de Pago - {periodo}"
                
                if not Documento.objects.filter(empleado=emp, nombre_archivo=nombre_boleta, tipo_documento="Boleta").exists():
                    Documento.objects.create(
                        empleado=emp,
                        nombre_archivo=nombre_boleta,
                        tipo_documento="Boleta",
                        tamaño_kb=120,
                        firmado=False,
                        fecha_subida=timezone.now()
                    )
                    boletas_creadas += 1

            print(f"✅ ¡Éxito! Se crearon {boletas_creadas} boletas en PostgreSQL para el periodo {periodo}.")

            return JsonResponse({
                "success": True, 
                "message": f"Se emitieron {boletas_creadas} boletas correctamente."
            }, status=200)

        except Exception as e:
            print(f"❌ Error al guardar en BD: {str(e)}")
            return JsonResponse({"success": False, "error": str(e)}, status=400)
    else:
        return JsonResponse({"success": False, "error": "Método no permitido."}, status=405)