from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound
from .models import Search, FavoritePlace, Booking
from .serializers import SearchSerializer, FavoritePlaceSerializer, BookingSerializer

# Requires authentication
class AuthenticatedMixin:
    permission_classes = [permissions.IsAuthenticated]

class SearchListCreateView(AuthenticatedMixin, generics.ListCreateAPIView):
    queryset = Search.objects.all()
    serializer_class = SearchSerializer

class FavoritePlaceListCreateView(AuthenticatedMixin, generics.ListCreateAPIView):
    queryset = FavoritePlace.objects.all()
    serializer_class = FavoritePlaceSerializer

class BookingListCreateView(AuthenticatedMixin, generics.ListCreateAPIView):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer

class TrackUserActivityView(AuthenticatedMixin, APIView):
    def get(self, request):
        user_id = request.query_params.get("id")
        if not user_id:
            return Response({"error": "Missing 'id' parameter"}, status=400)

        searches = Search.objects.filter(id=user_id).order_by("-time")
        if not searches.exists():
            raise NotFound("No search activity found.")

        latest = searches.first()
        serializer = SearchSerializer(latest)
        return Response(serializer.data)


from rest_framework import generics
from rest_framework.permissions import AllowAny  # or IsAuthenticated if you want
from .models import Feedback
from .serializers import FeedbackSerializer

class FeedbackCreateView(generics.CreateAPIView):
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    permission_classes = [AllowAny]  # or IsAuthenticated

