from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('id', 'username', 'email', 'type', 'codice_fiscale', 'is_staff', 'is_active')

    # To make sure the `type` field shows up on the user edit form:
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('codice_fiscale', 'type')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('codice_fiscale', 'type')}),
    )
