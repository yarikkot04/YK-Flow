from django.urls import reverse_lazy
from django.views.generic import ListView, UpdateView, DeleteView, CreateView
from .models import Post, Category, PostImage
from .mixins import AdminRequiredMixin
from .forms import PostForm, CategoryForm
from django.db import transaction

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
    
class CategoryCreateView(AdminRequiredMixin, CreateView):
    model = Category
    form_class = CategoryForm
    template_name = 'main_app/category_form.html'
    success_url = reverse_lazy('main:main_page')

class PostCreateView(AdminRequiredMixin, CreateView):
    model = Post
    form_class = PostForm
    template_name = 'main_app/post_form.html'
    success_url = reverse_lazy('main:main_page')

    def form_valid(self, form):
        form.instance.author = self.request.user
        
        with transaction.atomic():
            response = super().form_valid(form)
            
            images = self.request.FILES.getlist('images')
            for img in images:
                PostImage.objects.create(post=self.object, image=img)
                
        return response
    
class PostUpdateView(AdminRequiredMixin, UpdateView):
    model = Post
    form_class = PostForm
    template_name = 'main_app/post_form.html'
    slug_url_kwarg = 'slug'
    success_url = reverse_lazy('main:main_page')

    def form_valid(self, form):
        with transaction.atomic():
            response = super().form_valid(form)
            
            images = self.request.FILES.getlist('images')
            if images:
                self.object.images.all().delete() 
                
                for img in images:
                    PostImage.objects.create(post=self.object, image=img)
                    
        return response

class PostDeleteView(AdminRequiredMixin, DeleteView):
    model = Post
    slug_url_kwarg = 'slug'
    success_url = reverse_lazy('main:main_page')
    template_name = 'main_app/post_confirm_delete.html'