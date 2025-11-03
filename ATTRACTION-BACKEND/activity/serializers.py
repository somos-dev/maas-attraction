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
    # allow client to send distance_km; co2_kg is calculated server-side and read-only
    distance_km = serializers.FloatField(required=False, allow_null=True)
    # allow client to send total distance in meters (e.g. from PlanTrip) — write-only
    total_distance_m = serializers.IntegerField(write_only=True, required=False)
    co2_kg = serializers.FloatField(read_only=True)
    # CO2 saved compared to baseline (car) in kilograms — computed server-side
    co2_saved_kg = serializers.FloatField(read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'user_id', 'origin', 'destination', 'time', 'mode', 'distance_km', 'total_distance_m', 'co2_kg', 'co2_saved_kg']

    def create(self, validated_data):
        """Handle write-only `total_distance_m` before creating the Booking instance.

        If the client sends `total_distance_m` (meters) we convert it to km and store
        it in `distance_km` so the model creation doesn't receive an unexpected
        keyword. Any extra kwargs (like `user` or `co2_kg`) are expected to already
        be present in `validated_data` when save() is called.
        """
        total_m = validated_data.pop('total_distance_m', None)
        if total_m is not None and validated_data.get('distance_km') is None:
            try:
                validated_data['distance_km'] = float(total_m) / 1000.0
            except (TypeError, ValueError):
                # leave distance_km unset if conversion fails; let model/validators handle it
                pass
        return super().create(validated_data)

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

