from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    WORKER = 'worker'
    STUDENT = 'student'
    OTHER = 'other'
    USER_TYPE_CHOICES = [
        (WORKER, 'Worker'),
        (STUDENT, 'Student'),
        (OTHER, 'Other'),
    ]

    codice_fiscale = models.CharField(max_length=50, unique=True, blank=True, null=True)
    email = models.EmailField(unique=True)
    type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES, default=OTHER)  # <-- added

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'codice_fiscale']

    def __str__(self):
        return self.email
