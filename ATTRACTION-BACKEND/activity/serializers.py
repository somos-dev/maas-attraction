from rest_framework import serializers
from .models import Search, FavoritePlace, Booking, Feedback

class SearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Search
        fields = '__all__'

class FavoritePlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = FavoritePlace
        fields = ['id', 'address', 'type']  # id is read-only by default


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
    date = serializers.DateTimeField()  # change this from DateField to DateTimeField
    mode = serializers.CharField(required=False)



