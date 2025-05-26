from django.urls import path
from . import views

urlpatterns = [
    path('auth/search', views.SearchListCreateView.as_view(), name='search-api'),
    path('auth/places', views.FavoritePlaceListCreateView.as_view(), name='places-api'),
    path('auth/track', views.TrackUserActivityView.as_view(), name='track-api'),
    path('auth/booking', views.BookingListCreateView.as_view(), name='booking-api'),
]
