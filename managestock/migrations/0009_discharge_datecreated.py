# Generated by Django 4.1.7 on 2023-03-21 09:02

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('managestock', '0008_remove_discharge_datecreated'),
    ]

    operations = [
        migrations.AddField(
            model_name='discharge',
            name='dateCreated',
            field=models.DateField(auto_created=True, default=datetime.date(2023, 3, 21)),
            preserve_default=False,
        ),
    ]
