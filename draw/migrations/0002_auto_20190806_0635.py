# Generated by Django 2.2.3 on 2019-08-06 06:35

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('draw', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='dancer',
            name='color',
            field=models.CharField(default='White', max_length=30),
        ),
    ]
