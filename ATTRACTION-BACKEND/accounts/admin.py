from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    # Optionally customize list_display etc
    list_display = ('username', 'email', 'codice_fiscale', 'phone_number', 'address', 'is_staff', 'is_active')
