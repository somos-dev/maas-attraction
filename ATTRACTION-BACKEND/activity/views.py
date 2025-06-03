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

# activity/views.py
from rest_framework import generics, permissions
from .models import FavoritePlace
from .serializers import FavoritePlaceSerializer

class FavoritePlaceListCreateView(generics.ListCreateAPIView):
    serializer_class = FavoritePlaceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FavoritePlace.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class FavoritePlaceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FavoritePlaceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return FavoritePlace.objects.filter(user=self.request.user)


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


from django.utils.dateparse import parse_datetime
from django.contrib.sessions.models import Session
from .models import Search
from .serializers import PlanTripSerializer
import requests
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.utils.timezone import now

class PlanTripView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowAny]  # Allow both authenticated and anonymous users

    def post(self, request):
        serializer = PlanTripSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data

            # Prepare GraphQL query
            graphql_query = """
            query PlanTrip($fromLat: Float!, $fromLon: Float!, $toLat: Float!, $toLon: Float!, $date: String!) {
              plan(
                from: { lat: $fromLat, lon: $fromLon },
                to: { lat: $toLat, lon: $toLon },
                date: $date
              ) {
                itineraries {
                  duration
                  legs {
                    mode
                    startTime
                    endTime
                  }
                }
              }
            }
            """

            variables = {
                "fromLat": data['fromLat'],
                "fromLon": data['fromLon'],
                "toLat": data['toLat'],
                "toLon": data['toLon'],
                "date": data['date'].isoformat()
            }

            headers = {"Content-Type": "application/json"}
            json_data = {"query": graphql_query, "variables": variables}

            try:
                resp = requests.post(
                    "http://server.somos.srl:8080/otp/routers/default/index/graphql",
                    json=json_data,
                    headers=headers,
                    timeout=10
                )
                resp.raise_for_status()
                result = resp.json()

                if "errors" in result:
                    return Response({"errors": result["errors"]}, status=status.HTTP_400_BAD_REQUEST)

                plan_data = result["data"]["plan"]
                itineraries = plan_data.get("itineraries", [])

                if itineraries:
                    modes_list = [leg['mode'] for leg in itineraries[0]['legs']]
                    modes_str = ",".join(modes_list)
                else:
                    modes_str = ""

                user = request.user if request.user.is_authenticated else None

                # Ensure session exists
                if not request.session.session_key:
                    request.session.create()

                anonymous_session_key = None
                if user is None:
                    anonymous_session_key = request.session.session_key

                # Save search with either user ID or session key
                Search.objects.create(
                    user=user,
                    anonymous_session_key=anonymous_session_key,
                    from_lat=data['fromLat'],
                    from_lon=data['fromLon'],
                    to_lat=data['toLat'],
                    to_lon=data['toLon'],
                    trip_date=data['date'],
                    modes=modes_str
                )

                return Response(plan_data, status=status.HTTP_200_OK)

            except requests.RequestException as e:
                return Response({"error": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

#{
  #"fromLat": 39.366095,
  #"fromLon": 16.227135,
  #"toLat": 39.333922,
  #"toLon": 16.241697,
  #"date": "2025-05-29"
#}

from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from .models import Search

@receiver(user_logged_in)
def link_anonymous_searches_to_user_signal(sender, request, user, **kwargs):
    session_key = request.session.session_key
    if session_key:
        Search.objects.filter(anonymous_session_key=session_key).update(user=user, anonymous_session_key=None)

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests

class StopsView(APIView):
    def get(self, request):
        graphql_query = """
        query {
          stops {
            id
            name
            lat
            lon
            code
          }
        }
        """

        json_data = {"query": graphql_query}
        headers = {"Content-Type": "application/json"}

        try:
            resp = requests.post(
                "http://server.somos.srl:8080/otp/routers/default/index/graphql",
                json=json_data,
                headers=headers,
                timeout=10
            )
            resp.raise_for_status()
            result = resp.json()

            if "errors" in result:
                return Response({"errors": result["errors"]}, status=status.HTTP_400_BAD_REQUEST)

            stops = result.get("data", {}).get("stops", [])

            return Response({"stops": stops}, status=status.HTTP_200_OK)

        except requests.RequestException as e:
            return Response({"error": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
from django.shortcuts import render

def stops_map_view(request):
    return render(request, 'stops_map.html')
