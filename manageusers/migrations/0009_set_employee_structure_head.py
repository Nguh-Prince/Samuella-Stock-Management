import logging

from django.db import migrations

format = "%(asctime)s: %(message)s"
logging.basicConfig(format=format, level=logging.INFO, datefmt="%H:%M:%S")

def set_employee_structure_head(apps, schema_editor):
    Employee = apps.get_model("manageusers", "Employee")

    for employee in Employee.objects.all():
        if employee.structureId.head == employee:
            employee.structure_head = True
            employee.save()

class Migration(migrations.Migration):

    dependencies = [
        ('manageusers', '0008_employee_structure_head'),
    ]

    operations = [
        migrations.RunPython(set_employee_structure_head)
    ]
