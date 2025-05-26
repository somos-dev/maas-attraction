from django.contrib import admin
from .models import Search, FavoritePlace, Booking

@admin.register(Search)
class SearchAdmin(admin.ModelAdmin):
    list_display = ('id', 'origin', 'destination', 'time', 'mode')
    search_fields = ('origin', 'destination', 'mode')

@admin.register(FavoritePlace)
class FavoritePlaceAdmin(admin.ModelAdmin):
    list_display = ('id', 'address', 'type')
    search_fields = ('address', 'type')

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'origin', 'destination', 'time', 'mode')
    search_fields = ('origin', 'destination', 'mode')
