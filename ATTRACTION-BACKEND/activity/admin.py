from django.contrib import admin
from .models import Search, FavoritePlace, Booking, Feedback

@admin.register(Search)
class SearchAdmin(admin.ModelAdmin):
    list_display = ('id', 'origin', 'destination', 'time', 'mode')
    search_fields = ('origin', 'destination', 'mode')


@admin.register(FavoritePlace)
class FavoritePlaceAdmin(admin.ModelAdmin):
    list_display = ('id', 'user_id', 'address', 'type')  # Show place id, user id, address, and type

    # Optional: if you want to make user_id clickable to go to the user page
    def user_id(self, obj):
        return obj.user.id
    user_id.admin_order_field = 'user__id'  # Allows sorting by user id
    user_id.short_description = 'User ID'


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ('user_id', 'text', 'timestamp')
    search_fields = ('user_id', 'text')
    list_filter = ('timestamp',)
