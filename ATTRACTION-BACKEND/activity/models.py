from django.db import models
from django.contrib.auth import get_user_model

class Search(models.Model):
    origin = models.CharField(max_length=255)
    destination = models.CharField(max_length=255)
    time = models.DateTimeField()
    mode = models.CharField(max_length=100)


from django.conf import settings

class FavoritePlace(models.Model):
    id = models.AutoField(primary_key=True)  # Favorite place ID (optional, Django adds it by default)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorite_places')
    address = models.CharField(max_length=255)
    type = models.CharField(max_length=100)
    is_default = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.pk:  # only when creating a new object
            # If user has no favorite place marked default yet, mark this one
            if not FavoritePlace.objects.filter(user=self.user, is_default=True).exists():
                self.is_default = True
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.address} ({self.type})"


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


