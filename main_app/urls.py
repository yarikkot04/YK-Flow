from django.urls import path
from .views import MainPageView, ProfileUpdateView

app_name = 'main'

urlpatterns = [
    path('', MainPageView.as_view(), name='main_page'),
    path('profile/edit/', ProfileUpdateView.as_view(), name='profile_edit'),
]