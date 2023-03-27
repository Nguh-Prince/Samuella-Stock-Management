# Generated by Django 4.1.7 on 2023-03-26 16:15

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('manageusers', '0005_employee_matriclenumber'),
    ]

    operations = [
        migrations.AddField(
            model_name='employee',
            name='isStockManager',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='employee',
            name='user',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to=settings.AUTH_USER_MODEL),
        ),
        migrations.AlterField(
            model_name='employee',
            name='structureId',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.PROTECT, related_name='employees', to='manageusers.structure'),
        ),
    ]