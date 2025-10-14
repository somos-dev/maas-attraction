from rest_framework import serializers
from .models import Search, FavoritePlace, Booking, Feedback
from django.contrib.auth import get_user_model

class SearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Search
        fields = '__all__'

class FavoritePlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoritePlace
        fields = ['id', 'address', 'type', 'latitude', 'longitude']  # id is read-only by default


class BookingSerializer(serializers.ModelSerializer):
    user_id = serializers.IntegerField(source='user.id', read_only=True)  # Expose the user ID

    class Meta:
        model = Booking
        fields = ['id', 'user_id', 'origin', 'destination', 'time', 'mode']

User = get_user_model()

class FeedbackSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = ['text']  # no need for user_id — we set it from request.user
        read_only_fields = []


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

