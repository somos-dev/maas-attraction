# Generated by Django 4.2 on 2025-05-28 11:19

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('activity', '0004_alter_feedback_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='favoriteplace',
            name='is_default',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='favoriteplace',
            name='user',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='favorite_places', to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
    ]
