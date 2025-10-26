from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone  # <-- add this

User = get_user_model()

class Search(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    anonymous_session_key = models.CharField(max_length=40, null=True, blank=True)
    from_lat = models.FloatField(default=0.0)
    from_lon = models.FloatField(default=0.0)
    to_lat = models.FloatField(default=0.0)
    to_lon = models.FloatField(default=0.0)
    trip_date = models.DateTimeField(default=timezone.now)
    requested_at = models.DateTimeField(default=timezone.now)
    modes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Search from ({self.from_lat}, {self.from_lon}) to ({self.to_lat}, {self.to_lon}) on {self.trip_date}"


from django.conf import settings

from django.db import models
from django.conf import settings

class FavoritePlace(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorite_places')
    address = models.CharField(max_length=255)
    type = models.CharField(max_length=100)
    is_default = models.BooleanField(default=False)
    latitude = models.FloatField(null=True, blank=True)  
    longitude = models.FloatField(null=True, blank=True)  

    def save(self, *args, **kwargs):
        if not self.pk:
            if not FavoritePlace.objects.filter(user=self.user, is_default=True).exists():
                self.is_default = True
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.address} ({self.type})"

from django.conf import settings
from django.db import models

class Booking(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='bookings'
    )
    origin = models.CharField(max_length=255)
    destination = models.CharField(max_length=255)
    time = models.DateTimeField()
    mode = models.CharField(max_length=100)
    # distance in kilometers for this booking (optional)
    distance_km = models.FloatField(null=True, blank=True, default=None)
    # computed CO2 consumption in kilograms for this booking (optional)
    co2_kg = models.FloatField(null=True, blank=True, default=None)
    # computed CO2 saved in kilograms compared to baseline (car) for this booking (optional)
    co2_saved_kg = models.FloatField(null=True, blank=True, default=None)

    def __str__(self):
        return f"Booking by {self.user} from {self.origin} to {self.destination} at {self.time}"


from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()

class Feedback(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

