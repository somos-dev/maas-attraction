from rest_framework import serializers
from .models import Search, FavoritePlace, Booking, Feedback

class SearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Search
        fields = '__all__'

class FavoritePlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoritePlace
        fields = ['id', 'address', 'type', 'latitude', 'longitude']  # id is read-only by default


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = '__all__'

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Feedback

User = get_user_model()

class FeedbackSerializer(serializers.ModelSerializer):
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='user'  # maps user_id to the Feedback.user foreign key
    )

    class Meta:
        model = Feedback
        fields = ['user_id', 'text']

# api/serializers.py
from rest_framework import serializers

class PlanTripSerializer(serializers.Serializer):
    fromLat = serializers.FloatField()
    fromLon = serializers.FloatField()
    toLat = serializers.FloatField()
    toLon = serializers.FloatField()
    date = serializers.DateField()
    time = serializers.CharField()
    requested_date= serializers.DateField()
    requested_time = serializers.CharField()
    mode = serializers.CharField()  # required by default

    def validate_mode(self, value):
        allowed_modes = ['all', 'bus', 'walk', 'bicycle', 'scooter']
        if value.lower() not in allowed_modes:
            raise serializers.ValidationError(f"Mode must be one of {allowed_modes}")
        return value.lower()

