from django.urls import path
from . import views
from .views import (
    FeedbackCreateView,
    FavoritePlaceListCreateView,
    FavoritePlaceDetailView,
    PlanTripView,
    StopsView,
    
)

urlpatterns = [
    path('auth/search/', views.SearchListCreateView.as_view(), name='search-api'),
    path('auth/places/', FavoritePlaceListCreateView.as_view(), name='places-api'),
    path('auth/places/<int:pk>/', FavoritePlaceDetailView.as_view(), name='place-detail-api'),  # 👈 Added
    path('auth/track/', views.TrackUserActivityView.as_view(), name='track-api'),
    path('auth/booking/', views.BookingListCreateView.as_view(), name='booking-api'),
    path('auth/feedback/', FeedbackCreateView.as_view(), name='submit-feedback'),
    path('auth/plan-trip/', PlanTripView.as_view(), name='plan-trip'),
    path('auth/stops/', StopsView.as_view(), name='stops-list'),
    
]
