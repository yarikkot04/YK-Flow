from django.urls import path
from .views import MainPageView, ProfileUpdateView, CategoryCreateView, PostCreateView, PostUpdateView, PostDeleteView

app_name = 'main'

urlpatterns = [
    path('', MainPageView.as_view(), name='main_page'),
    path('profile/edit/', ProfileUpdateView.as_view(), name='profile_edit'),
    path('category/add/', CategoryCreateView.as_view(), name='category_create'),
    path('post/add/', PostCreateView.as_view(), name='post_create'),
    path('post/<slug:slug>/edit/', PostUpdateView.as_view(), name='post_edit'),
    path('post/<slug:slug>/delete/', PostDeleteView.as_view(), name='post_delete'),
]