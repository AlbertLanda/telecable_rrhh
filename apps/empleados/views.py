import json
from datetime import date, timedelta
from django.http import JsonResponse
from django.contrib.auth import authenticate, login as django_login
from django.shortcuts import render
from django.utils import timezone

# Importamos las tablas reales
from .models import Empleado, Departamento, Puesto, Sede, Empresa, Documento
from apps.asistencia.models import Asistencia
from apps.vacaciones.models import Vacacion

def login_view(request):
    return render(request, 'index.html')

def app_view(request):
    # 0. Traer Razones Sociales Reales
    empresas = Empresa.objects.all()
    empresas_list = [{"id": emp.id, "nombre": emp.razon_social, "ruc": emp.ruc} for emp in empresas]
    # 1. Traer Sedes Reales
    sedes = Sede.objects.all()
    sedes_list = [{"id": s.id, "nombre": s.nombre} for s in sedes]

    # 2. Departamentos
    deptos = Departamento.objects.all()
    deptos_list = [{"id": d.id, "nombre": d.nombre, "desc": d.descripcion or "", "color": d.color or "#6366f1", "jefe": d.jefe_nombre or "Sin jefe", "count": Empleado.objects.filter(departamento=d).count()} for d in deptos]
        
    # 3. Puestos
    puestos = Puesto.objects.all()
    puestos_list = [{"id": p.id, "nombre": p.nombre, "deptId": p.departamento_id} for p in puestos]

    # 4. Empleados (Le agregamos sedeId)
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

    # 5. Asistencias
    asistencias = Asistencia.objects.all()
    asis_list = [{"id": a.id, "empId": a.empleado_id, "fecha": str(a.fecha), "entrada": a.hora_entrada.strftime('%H:%M') if a.hora_entrada else '—', "salida": a.hora_salida.strftime('%H:%M') if a.hora_salida else '—', "tipo": a.tipo, "obs": a.observaciones or ""} for a in asistencias]

    # 6. Vacaciones
    vacaciones = Vacacion.objects.all()
    vac_list = [{"id": v.id, "empId": v.empleado_id, "inicio": str(v.fecha_inicio), "fin": str(v.fecha_fin), "dias": v.dias_totales or 0, "estado": v.estado, "motivo": v.motivo or "", "aprobadoPor": v.aprobado_por or ""} for v in vacaciones]

    # 6.5 Documentos Reales
    documentos = Documento.objects.all()
    docs_list = [
        {
            "id": d.id,
            "empId": d.empleado_id,
            "nombre": d.nombre_archivo,
            "tipo": d.tipo_documento or "Otro",
            "fecha": d.fecha_subida.strftime('%Y-%m-%d'),
            "kb": d.tamaño_kb or 0,
            "url": d.archivo.url if d.archivo else "",
            "signed": d.firmado,
            "signedAt": d.fecha_firma.strftime('%Y-%m-%d %H:%M') if d.fecha_firma else None
        }
        for d in documentos
    ]

    # 7. Cálculo real para el Gráfico Semanal
    hoy = date.today()
    dias_es = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
    weekly_att = []
    
    for i in range(6, -1, -1):
        d = hoy - timedelta(days=i)
        day_str = f"{dias_es[d.weekday()]} {d.day}"
        att_day = Asistencia.objects.filter(fecha=d)
        
        weekly_att.append({
            "day": day_str,
            "pres": att_day.filter(tipo='Asistencia').count(),
            "tard": att_day.filter(tipo='Tardanza').count(),
            "falt": att_day.filter(tipo='Falta').count()
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
                emp_id = None # <--- Creamos esta variable vacía
                
                if hasattr(user, 'perfil'):
                    rol_asignado = user.perfil.rol
                    if user.perfil.empleado: # <--- Si el perfil está enlazado a un empleado...
                        emp_id = user.perfil.empleado.id # <--- ¡Sacamos su ID exacto!
                elif user.is_superuser:
                    rol_asignado = 'Admin'

                nombre_mostrar = user.first_name if user.first_name else user.username

                return JsonResponse({
                    'success': True, 
                    'redirect_url': '/app/',
                    'role': rol_asignado,
                    'name': nombre_mostrar,
                    'emp_id': emp_id # <--- Lo mandamos al navegador
                })
            else:
                return JsonResponse({'success': False, 'message': 'Usuario o contraseña incorrectos.'})
        except Exception as e:
            return JsonResponse({'success': False, 'message': 'Error en el servidor.'})
            
    return JsonResponse({'success': False, 'message': 'Método no permitido'})

def api_crear_empleado(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            dni_ingresado = data.get('dni')
            
            # 1. Validar que no exista otro con ese DNI
            if Empleado.objects.filter(dni=dni_ingresado).exists():
                return JsonResponse({'success': False, 'message': 'Ya existe un empleado con este DNI en el sistema.'})
            
            # 2. Creamos al empleado en la Base de Datos
            nuevo_emp = Empleado.objects.create(
                codigo=f"EMP-{dni_ingresado}",
                nombres=data.get('nombres'),
                apellidos=data.get('apellidos'),
                dni=dni_ingresado,
                email=data.get('email'),
                telefono=data.get('telefono'),
                fecha_nacimiento=data.get('nacimiento') or None,
                fecha_ingreso=data.get('ingreso') or None,
                tipo_contrato=data.get('contrato'),
                sueldo_base=data.get('sueldo'),
                afp_onp=data.get('afp'),
                sede_id=data.get('sede_id'),
                empresa_id=data.get('empresa_id'),
                departamento_id=data.get('dept_id'),
                puesto_id=data.get('puesto_id'),
                estado='Activo'
            )
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})
            
    return JsonResponse({'success': False, 'message': 'Método no permitido'})

def api_subir_documento(request):
    if request.method == 'POST':
        try:
            # En envíos de archivos usamos request.POST y request.FILES (FormData)
            emp_id = request.POST.get('empId')
            nombre = request.POST.get('nombre')
            tipo = request.POST.get('tipo')
            archivo = request.FILES.get('archivo')

            if not all([emp_id, nombre, tipo, archivo]):
                return JsonResponse({'success': False, 'message': 'Faltan datos o el archivo no fue seleccionado.'})

            empleado = Empleado.objects.get(id=emp_id)

            # Guardamos el documento físico en la BD y en la carpeta media/
            Documento.objects.create(
                empleado=empleado,
                nombre_archivo=nombre,
                tipo_documento=tipo,
                archivo=archivo,
                tamaño_kb=round(archivo.size / 1024) # Calculamos el peso real en KB
            )

            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})
            
    return JsonResponse({'success': False, 'message': 'Método no permitido'})

def api_firmar_documento(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            doc_id = data.get('doc_id')
            
            # Buscamos el documento en la base de datos
            documento = Documento.objects.get(id=doc_id)
            
            # Aplicamos la "Firma Digital"
            documento.firmado = True
            documento.fecha_firma = timezone.now()
            documento.save()
            
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)})
            
    return JsonResponse({'success': False, 'message': 'Método no permitido'})