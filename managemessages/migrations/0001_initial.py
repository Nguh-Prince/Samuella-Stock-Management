# Generated by Django 4.1.7 on 2023-04-17 20:00

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Chat',
            fields=[
                ('chatId', models.AutoField(primary_key=True, serialize=False)),
                ('chatTimeCreated', models.DateTimeField(auto_now_add=True)),
                ('chatEncryptionKey', models.TextField()),
            ],
        ),
        migrations.CreateModel(
            name='ChatParticipant',
            fields=[
                ('chatParticipantId', models.AutoField(primary_key=True, serialize=False)),
                ('chatId', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='participants', to='managemessages.chat')),
                ('participantId', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('participantId', 'chatId')},
            },
        ),
        migrations.CreateModel(
            name='Message',
            fields=[
                ('messageId', models.AutoField(primary_key=True, serialize=False)),
                ('time_sent', models.DateTimeField(auto_now_add=True)),
                ('messageContent', models.TextField()),
                ('chat', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='managemessages.chat')),
                ('sender', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='managemessages.chatparticipant')),
            ],
        ),
    ]
