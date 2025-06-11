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


import requests
from datetime import datetime
from math import radians, cos, sin, asin, sqrt

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Search
from .serializers import PlanTripSerializer


def haversine(lon1, lat1, lon2, lat2):
    # Convert decimal degrees to radians
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    r = 6371000  # Radius of Earth in meters
    return c * r


class PlanTripView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PlanTripSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data

            # Force 'mode' to be present and uppercase
            mode_filter = data.get('mode')
            if not mode_filter:
                return Response({"error": "Mode is required and cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)
            mode_filter = mode_filter.strip().upper()

            date_obj = data.get('date')

            # Updated time handling logic: accept "timenow" or specific HH:MM:SS or default to now
            time_str = data.get('time', None)

            if not time_str or (isinstance(time_str, str) and time_str.lower() == 'timenow'):
                time_str = datetime.now().strftime("%H:%M:%S")

            try:
                datetime.strptime(time_str, "%H:%M:%S")
            except ValueError:
                return Response({"error": "Time must be in HH:MM:SS format."}, status=status.HTTP_400_BAD_REQUEST)

            date_str = date_obj.strftime("%Y-%m-%d")

            # Fetch stops
            stops_query = """
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
            headers = {"Content-Type": "application/json"}

            try:
                stops_response = requests.post(
                    "http://server.somos.srl:8080/otp/routers/default/index/graphql",
                    json={"query": stops_query},
                    headers=headers,
                    timeout=10
                )
                stops_response.raise_for_status()
                stops_data = stops_response.json()
            except requests.exceptions.RequestException as e:
                return Response({"error": f"Failed to fetch stops: {str(e)}"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

            if "errors" in stops_data:
                return Response({"errors": stops_data["errors"]}, status=status.HTTP_400_BAD_REQUEST)

            stops = stops_data["data"]["stops"]

            def find_closest_stop(lat, lon):
                closest = None
                min_dist = float('inf')
                for stop in stops:
                    dist = haversine(lon, lat, stop['lon'], stop['lat'])
                    if dist < min_dist:
                        min_dist = dist
                        closest = stop
                return closest

            from_stop = find_closest_stop(data['fromLat'], data['fromLon'])
            to_stop = find_closest_stop(data['toLat'], data['toLon'])

            # Query OTP plan
            plan_query = """
            query PlanTrip($fromLat: Float!, $fromLon: Float!, $toLat: Float!, $toLon: Float!, $date: String!, $time: String!) {
              plan(
                from: { lat: $fromLat, lon: $fromLon },
                to: { lat: $toLat, lon: $toLon },
                date: $date,
                time: $time
              ) {
                itineraries {
                  duration
                  legs {
                    mode
                    startTime
                    endTime
                    from {
                      name
                    }
                    to {
                      name
                    }
                    trip {
                      routeShortName
                    }
                    legGeometry {
                      points
                    }
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
                "date": date_str,
                "time": time_str,
            }

            try:
                plan_response = requests.post(
                    "http://server.somos.srl:8080/otp/routers/default/index/graphql",
                    json={"query": plan_query, "variables": variables},
                    headers=headers,
                    timeout=10
                )
                plan_response.raise_for_status()
                result = plan_response.json()
            except requests.exceptions.RequestException as e:
                return Response({"error": f"Failed to fetch plan: {str(e)}"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

            if "errors" in result:
                return Response({"errors": result["errors"]}, status=status.HTTP_400_BAD_REQUEST)

            itineraries = result["data"]["plan"].get("itineraries", [])

            # Prepare options dict with empty lists
            options = {
                "walk": [],
                "bus": [],
                "bicycle": [],
                "scooter": [],
                "other": []
            }

            for idx, itinerary in enumerate(itineraries, start=1):
                legs = itinerary.get("legs", [])
                modes_in_itinerary = {leg.get("mode", "").upper() for leg in legs}

                # Filtering according to mode_filter:
                if mode_filter != "ALL":
                    if mode_filter == "WALK":
                        if modes_in_itinerary != {"WALK"}:
                            continue
                    elif mode_filter == "BUS":
                        if "BUS" not in modes_in_itinerary:
                            continue
                    elif mode_filter == "BICYCLE":
                        if "BICYCLE" not in modes_in_itinerary:
                            continue
                    elif mode_filter == "SCOOTER":
                        if "SCOOTER" not in modes_in_itinerary:
                            continue
                    else:
                        if mode_filter not in modes_in_itinerary:
                            continue

                # Build steps list for this option
                steps = []
                for leg in legs:
                    mode = leg.get("mode", "UNKNOWN").lower()
                    start_ts = leg.get("startTime")
                    end_ts = leg.get("endTime")
                    from_name = leg.get("from", {}).get("name", "Unknown stop")
                    to_name = leg.get("to", {}).get("name", "Unknown stop")

                    # Replace generic origin/destination names with closest stops if available
                    if from_name == "Origin" and from_stop:
                        from_name = from_stop['name']
                    if to_name == "Destination" and to_stop:
                        to_name = to_stop['name']

                    if start_ts and end_ts:
                        start_dt = datetime.fromtimestamp(start_ts / 1000)
                        end_dt = datetime.fromtimestamp(end_ts / 1000)
                        duration_sec = (end_ts - start_ts) / 1000
                        minutes = int(duration_sec // 60)
                        seconds = int(duration_sec % 60)
                        duration_str = f"{minutes}m {seconds}s"

                        start_time_iso = start_dt.isoformat()
                        end_time_iso = end_dt.isoformat()
                    else:
                        duration_str = "N/A"
                        start_time_iso = None
                        end_time_iso = None

                    step = {
                        "type": mode,
                        "from": from_name,
                        "to": to_name,
                        "duration": duration_str,
                        "start_time": start_time_iso,
                        "end_time": end_time_iso
                    }

                    # Add route for bus legs
                    if mode == "bus":
                        bus_route = leg.get("trip", {}).get("routeShortName")
                        if bus_route:
                            step["route"] = bus_route

                    steps.append(step)

                if steps:
                    # Determine primary mode for classification in options keys
                    primary_mode = "other"
                    if modes_in_itinerary == {"WALK"}:
                        primary_mode = "walk"
                    elif "BUS" in modes_in_itinerary:
                        primary_mode = "bus"
                    elif "BICYCLE" in modes_in_itinerary:
                        primary_mode = "bicycle"
                    elif "SCOOTER" in modes_in_itinerary:
                        primary_mode = "scooter"

                    options[primary_mode].append({
                        "option": idx,
                        "steps": steps
                    })

            user = request.user if request.user.is_authenticated else None

            if not request.session.session_key:
                request.session.create()

            anonymous_session_key = request.session.session_key if user is None else None

            trip_datetime = datetime.strptime(f"{date_obj.strftime('%Y-%m-%d')} {time_str}", "%Y-%m-%d %H:%M:%S")
            trip_datetime = timezone.make_aware(trip_datetime)

            Search.objects.create(
                user=user,
                anonymous_session_key=anonymous_session_key,
                from_lat=data['fromLat'],
                from_lon=data['fromLon'],
                to_lat=data['toLat'],
                to_lon=data['toLon'],
                trip_date=trip_datetime,
                modes=mode_filter
            )

            response_data = {
                "fromStationName": from_stop['name'] if from_stop else None,
                "toStationName": to_stop['name'] if to_stop else None,
                "options": options
            }

            return Response(response_data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


'''import requests
from datetime import datetime
from math import radians, cos, sin, asin, sqrt

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import Search
from .serializers import PlanTripSerializer


def haversine(lon1, lat1, lon2, lat2):
    # Convert decimal degrees to radians
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    r = 6371000  # Radius of Earth in meters
    return c * r


class PlanTripView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PlanTripSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data

            # Force 'mode' to be present and uppercase
            mode_filter = data.get('mode')
            if not mode_filter:
                return Response({"error": "Mode is required and cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)
            mode_filter = mode_filter.strip().upper()

            date_obj = data.get('date')

            # Updated time handling logic: accept "timenow" or specific HH:MM:SS or default to now
            time_str = data.get('time', None)

            if not time_str or (isinstance(time_str, str) and time_str.lower() == 'timenow'):
                time_str = datetime.now().strftime("%H:%M:%S")

            try:
                datetime.strptime(time_str, "%H:%M:%S")
            except ValueError:
                return Response({"error": "Time must be in HH:MM:SS format."}, status=status.HTTP_400_BAD_REQUEST)

            date_str = date_obj.strftime("%Y-%m-%d")

            # Fetch stops
            stops_query = """
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
            headers = {"Content-Type": "application/json"}

            try:
                stops_response = requests.post(
                    "http://server.somos.srl:8080/otp/routers/default/index/graphql",
                    json={"query": stops_query},
                    headers=headers,
                    timeout=10
                )
                stops_response.raise_for_status()
                stops_data = stops_response.json()
            except requests.exceptions.RequestException as e:
                return Response({"error": f"Failed to fetch stops: {str(e)}"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

            if "errors" in stops_data:
                return Response({"errors": stops_data["errors"]}, status=status.HTTP_400_BAD_REQUEST)

            stops = stops_data["data"]["stops"]

            def find_closest_stop(lat, lon):
                closest = None
                min_dist = float('inf')
                for stop in stops:
                    dist = haversine(lon, lat, stop['lon'], stop['lat'])
                    if dist < min_dist:
                        min_dist = dist
                        closest = stop
                return closest

            from_stop = find_closest_stop(data['fromLat'], data['fromLon'])
            to_stop = find_closest_stop(data['toLat'], data['toLon'])

            # Query OTP plan
            plan_query = """
            query PlanTrip($fromLat: Float!, $fromLon: Float!, $toLat: Float!, $toLon: Float!, $date: String!, $time: String!) {
              plan(
                from: { lat: $fromLat, lon: $fromLon },
                to: { lat: $toLat, lon: $toLon },
                date: $date,
                time: $time
              ) {
                itineraries {
                  duration
                  legs {
                    mode
                    startTime
                    endTime
                    from {
                      name
                    }
                    to {
                      name
                    }
                    trip {
                      routeShortName
                    }
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
                "date": date_str,
                "time": time_str,
            }

            try:
                plan_response = requests.post(
                    "http://server.somos.srl:8080/otp/routers/default/index/graphql",
                    json={"query": plan_query, "variables": variables},
                    headers=headers,
                    timeout=10
                )
                plan_response.raise_for_status()
                result = plan_response.json()
            except requests.exceptions.RequestException as e:
                return Response({"error": f"Failed to fetch plan: {str(e)}"}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

            if "errors" in result:
                return Response({"errors": result["errors"]}, status=status.HTTP_400_BAD_REQUEST)

            itineraries = result["data"]["plan"].get("itineraries", [])

            options = {
                "walk": [],
                "bus": [],
                "bicycle": [],
                "scooter": [],
                "other": []
            }

            for idx, itinerary in enumerate(itineraries, start=1):
                legs = itinerary.get("legs", [])
                modes_in_itinerary = {leg.get("mode", "").upper() for leg in legs}

                # Filtering according to mode_filter:
                if mode_filter != "ALL":
                    if mode_filter == "WALK":
                        # Only include itineraries with 100% WALK legs
                        if modes_in_itinerary != {"WALK"}:
                            continue
                    elif mode_filter == "BUS":
                        # Include itineraries containing at least one BUS leg
                        if "BUS" not in modes_in_itinerary:
                            continue
                    elif mode_filter == "BICYCLE":
                        if "BICYCLE" not in modes_in_itinerary:
                            continue
                    elif mode_filter == "SCOOTER":
                        if "SCOOTER" not in modes_in_itinerary:
                            continue
                    else:
                        # Unknown mode: skip
                        if mode_filter not in modes_in_itinerary:
                            continue

                leg_descriptions = []
                for leg in legs:
                    mode = leg.get("mode", "UNKNOWN").upper()
                    start_ts = leg.get("startTime")
                    end_ts = leg.get("endTime")
                    from_name = leg.get("from", {}).get("name", "Unknown stop")
                    to_name = leg.get("to", {}).get("name", "Unknown stop")

                    if from_name == "Origin" and from_stop:
                        from_name = from_stop['name']
                    if to_name == "Destination" and to_stop:
                        to_name = to_stop['name']

                    if start_ts and end_ts:
                        start_readable = datetime.fromtimestamp(start_ts / 1000).strftime("%Y-%m-%d %H:%M:%S")
                        end_readable = datetime.fromtimestamp(end_ts / 1000).strftime("%Y-%m-%d %H:%M:%S")
                        duration_sec = (end_ts - start_ts) / 1000
                        minutes = int(duration_sec // 60)
                        seconds = int(duration_sec % 60)
                        duration_readable = f"{minutes}m {seconds}s"
                    else:
                        start_readable = end_readable = duration_readable = "N/A"

                    bus_number = leg.get("trip", {}).get("routeShortName") if mode == "BUS" else None

                    if mode == "BUS" and bus_number:
                        desc = (
                            f"Take bus {bus_number} from '{from_name}' to '{to_name}' "
                            f"for {duration_readable} (from {start_readable} to {end_readable})"
                        )
                    else:
                        desc = (
                            f"{mode.capitalize()} from '{from_name}' to '{to_name}' "
                            f"for {duration_readable} (from {start_readable} to {end_readable})"
                        )

                    leg_descriptions.append(desc)

                if leg_descriptions:
                    option_str = f"Option {idx}: " + ", then ".join(leg_descriptions)

                    primary_mode = "other"
                    if modes_in_itinerary == {"WALK"}:
                        primary_mode = "walk"
                    elif "BUS" in modes_in_itinerary:
                        primary_mode = "bus"
                    elif "BICYCLE" in modes_in_itinerary:
                        primary_mode = "bicycle"
                    elif "SCOOTER" in modes_in_itinerary:
                        primary_mode = "scooter"

                    options[primary_mode].append(option_str)

            user = request.user if request.user.is_authenticated else None

            if not request.session.session_key:
                request.session.create()

            anonymous_session_key = request.session.session_key if user is None else None

            # Combine date and time into single datetime object for trip_date
            trip_datetime = datetime.strptime(f"{date_obj.strftime('%Y-%m-%d')} {time_str}", "%Y-%m-%d %H:%M:%S")

            Search.objects.create(
                user=user,
                anonymous_session_key=anonymous_session_key,
                from_lat=data['fromLat'],
                from_lon=data['fromLon'],
                to_lat=data['toLat'],
                to_lon=data['toLon'],
                trip_date=trip_datetime,
                modes=mode_filter
            )

            response_data = {
                "fromStationName": from_stop['name'] if from_stop else None,
                "toStationName": to_stop['name'] if to_stop else None,
                "options": options
            }

            return Response(response_data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
'''
'''{
  "fromLat": 39.35589,
  "fromLon": 16.22727,
  "toLat": 39.35331,
  "toLon": 16.24230,
  "date": "2025-06-06",
  "time": "timenow",
  "mode": "bus"
} '''

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

            all_stops = result.get("data", {}).get("stops", [])

            # Filter for Rende and Cosenza
            def in_rende_or_cosenza(stop):
                lat = stop.get("lat")
                lon = stop.get("lon")
                if not lat or not lon:
                    return False

                in_cosenza = 39.28 <= lat <= 39.32 and 16.22 <= lon <= 16.28
                in_rende = 39.30 <= lat <= 39.38 and 16.17 <= lon <= 16.26
                return in_cosenza or in_rende

            filtered_stops = [stop for stop in all_stops if in_rende_or_cosenza(stop)]

            return Response({"stops": filtered_stops}, status=status.HTTP_200_OK)

        except requests.RequestException as e:
            return Response({"error": str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)


from datetime import datetime, timedelta
from django.shortcuts import render
import requests

def get_stop_schedule(request, stop_id):
    query = """
    query ($stopId: String!) {
      stop(id: $stopId) {
        name
        stoptimesWithoutPatterns (numberOfDepartures: 300) {
          scheduledArrival
          realtimeArrival
          scheduledDeparture
          realtimeDeparture
          trip {
            route {
              shortName
              longName
            }
          }
        }
      }
    }
    """
    variables = {"stopId": stop_id}
    response = requests.post(
        'http://server.somos.srl:8080/otp/routers/default/index/graphql',
        json={'query': query, 'variables': variables}
    )
    data = response.json()

    if "errors" in data or not data.get("data") or not data["data"].get("stop"):
        return render(request, "stop_schedule.html", {
            "stop_name": "Unknown Stop",
            "upcoming_trips": []
        })

    stop = data["data"]["stop"]
    now_seconds = datetime.now().hour * 3600 + datetime.now().minute * 60 + datetime.now().second
    midnight_seconds = 86400

    filtered = [
        t for t in stop.get("stoptimesWithoutPatterns", [])
        if t["realtimeArrival"] is not None and now_seconds <= t["realtimeArrival"] <= midnight_seconds
    ]

    # Optional: sort and limit
    filtered = sorted(filtered, key=lambda t: t["realtimeArrival"])

    upcoming_trips = []
    for t in filtered:
        arrival_sec = t["realtimeArrival"] or t["scheduledArrival"]
        departure_sec = t["realtimeDeparture"] or t["scheduledDeparture"]
        upcoming_trips.append({
            "route": t["trip"]["route"]["shortName"],
            "name": t["trip"]["route"]["longName"],
            "arrival": str(timedelta(seconds=arrival_sec))[:-3],
            "departure": str(timedelta(seconds=departure_sec))[:-3]
        })

    return render(request, "stop_schedule.html", {
        "stop_name": stop["name"],
        "upcoming_trips": upcoming_trips
    })
