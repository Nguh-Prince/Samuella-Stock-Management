# Generated by Django 4.1.7 on 2023-03-21 09:01

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('managestock', '0007_alter_discharge_datecreated_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='discharge',
            name='dateCreated',
        ),
    ]
