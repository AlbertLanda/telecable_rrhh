from django.db import models
from apps.empleados.models import Empleado

class Vacacion(models.Model):
    ESTADO_CHOICES = [
        ('Pendiente', 'Pendiente'),
        ('Aprobado', 'Aprobado'),
        ('Rechazado', 'Rechazado'),
    ]

    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='vacaciones')
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    dias_totales = models.IntegerField(blank=True, null=True)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='Pendiente')
    motivo = models.TextField(blank=True, null=True)
    aprobado_por = models.CharField(max_length=150, blank=True, null=True)

    def __str__(self):
        return f"Vacaciones {self.empleado.nombres} - {self.estado}"