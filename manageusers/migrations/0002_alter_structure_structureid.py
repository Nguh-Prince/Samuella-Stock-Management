# Generated by Django 4.1.7 on 2023-03-20 22:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('manageusers', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='structure',
            name='structureId',
            field=models.IntegerField(blank=True, primary_key=True, serialize=False),
        ),
    ]