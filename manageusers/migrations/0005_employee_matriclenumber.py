# Generated by Django 4.1.7 on 2023-03-26 13:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('manageusers', '0004_employee_structure_head'),
    ]

    operations = [
        migrations.AddField(
            model_name='employee',
            name='matricleNumber',
            field=models.CharField(default='SUp', max_length=100, unique=True),
            preserve_default=False,
        ),
    ]
