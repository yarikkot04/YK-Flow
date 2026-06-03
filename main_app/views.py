from django.urls import reverse_lazy
from django.views.generic import ListView, UpdateView
from .models import Post, Category
from .mixins import AdminRequiredMixin

from auth_app.models import CustomUser

class MainPageView(ListView):
    model = Post
    template_name = 'main_app/main_page.html'
    context_object_name = 'posts'
    ordering = ['-created_at']

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['author'] = CustomUser.objects.filter(is_superuser=True).first()
        context['categories'] = Category.objects.all()
        return context
    
class ProfileUpdateView(AdminRequiredMixin, UpdateView):
    model = CustomUser
    template_name = 'main_app/profile_edit.html'
    fields = ['username', 'status_text', 'profile_image', 'github_url', 'telegram_url', 'linkedin_url']
    success_url = reverse_lazy('main:main_page') 

    def get_object(self, queryset=None):
        return self.request.user