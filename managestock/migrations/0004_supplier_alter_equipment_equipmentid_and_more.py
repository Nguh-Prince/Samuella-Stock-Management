# Generated by Django 4.1.7 on 2023-03-20 10:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('managestock', '0003_alter_equipment_equipmentname_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Supplier',
            fields=[
                ('supplierId', models.AutoField(primary_key=True, serialize=False)),
                ('supplierName', models.CharField(max_length=50)),
                ('supplierLocation', models.CharField(max_length=100)),
                ('supplierDescription', models.TextField(blank=True, null=True)),
            ],
        ),
        migrations.AlterField(
            model_name='equipment',
            name='equipmentId',
            field=models.AutoField(primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='stock',
            name='stockId',
            field=models.AutoField(primary_key=True, serialize=False),
        ),
        migrations.AlterField(
            model_name='stockequipment',
            name='stockEquipmentId',
            field=models.AutoField(primary_key=True, serialize=False),
        ),
    ]