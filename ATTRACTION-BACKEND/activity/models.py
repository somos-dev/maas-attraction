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
