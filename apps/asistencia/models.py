from django.db import models
from apps.empleados.models import Empleado # Importamos la tabla Empleado

class Asistencia(models.Model):
    TIPO_CHOICES = [
        ('Asistencia', 'Asistencia'),
        ('Tardanza', 'Tardanza'),
        ('Falta', 'Falta'),
        ('Hora Extra', 'Hora Extra'),
    ]

    empleado = models.ForeignKey(Empleado, on_delete=models.CASCADE, related_name='asistencias')
    fecha = models.DateField()
    hora_entrada = models.TimeField(blank=True, null=True)
    hora_salida = models.TimeField(blank=True, null=True)
    tipo = models.CharField(max_length=20, choices=TIPO_CHOICES, blank=True, null=True)
    observaciones = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.empleado.nombres} - {self.fecha} ({self.tipo})"