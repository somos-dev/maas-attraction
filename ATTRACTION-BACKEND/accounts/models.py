from django.db import models
from django.contrib.auth.models import AbstractUser

class CustomUser(AbstractUser):
    codice_fiscale = models.CharField(max_length=50, unique=True)
    phone_number = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)

    def __str__(self):
        return self.username
