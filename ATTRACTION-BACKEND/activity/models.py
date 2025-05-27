from django.db import models

class Search(models.Model):
    origin = models.CharField(max_length=255)
    destination = models.CharField(max_length=255)
    time = models.DateTimeField()
    mode = models.CharField(max_length=100)

class FavoritePlace(models.Model):
    address = models.CharField(max_length=255)
    type = models.CharField(max_length=100)

class Booking(models.Model):
    origin = models.CharField(max_length=255)
    destination = models.CharField(max_length=255)
    time = models.DateTimeField()
    mode = models.CharField(max_length=100)

from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

class Feedback(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)


