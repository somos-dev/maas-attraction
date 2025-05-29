from django.contrib import admin
from .models import Search, FavoritePlace, Booking, Feedback

@admin.register(Search)
class SearchAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'user_display',
        'origin_display',
        'destination_display',
        'trip_date',
        'modes',
        'requested_at',
    )

    def user_display(self, obj):
        return obj.user.id if obj.user else 'Anonymous'
    user_display.short_description = 'User ID'

    def origin_display(self, obj):
        return f"({obj.from_lat}, {obj.from_lon})"
    origin_display.short_description = 'Origin'

    def destination_display(self, obj):
        return f"({obj.to_lat}, {obj.to_lon})"
    destination_display.short_description = 'Destination'




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
