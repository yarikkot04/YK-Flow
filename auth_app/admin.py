from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'phone_number', 'is_staff', 'is_superuser')
    
    search_fields = ('username', 'email', 'phone_number')
    
    list_filter = ('is_staff', 'is_superuser', 'is_active')

    fieldsets = UserAdmin.fieldsets + (
        (_('Додаткова інформація'), {
            'fields': ('phone_number', 'slug', 'profile_image', 'github_url', 'telegram_url', 'linkedin_url', 'status_text')
        }),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        (_('Додаткова інформація'), {
            'fields': ('phone_number', 'slug', 'profile_image', 'github_url', 'telegram_url', 'linkedin_url', 'status_text')
        }),
    )