from django.urls import reverse_lazy
from django.views.generic import ListView, UpdateView, DeleteView, CreateView, DetailView
from .models import Post, Category, PostImage
from .mixins import AdminRequiredMixin
from .forms import PostForm, CategoryForm
from django.db import transaction

from auth_app.models import CustomUser

class MainPageView(ListView):
    model = Post
    template_name = 'main_app/main_page.html'
    context_object_name = 'posts'
    paginate_by = 5

    def get_queryset(self):
        queryset = Post.objects.all().order_by('-created_at')
        
        category_id = self.request.GET.get('category')
        if category_id and category_id != 'all':
            queryset = queryset.filter(category_id=category_id)
            
        return queryset

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['author'] = CustomUser.objects.filter(is_superuser=True).first()
        context['categories'] = Category.objects.all()
        context['current_category'] = self.request.GET.get('category', 'all')
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
            content = self.object.content
            
            for i, img in enumerate(images, start=1):
                post_img = PostImage.objects.create(post=self.object, image=img)
                placeholder = f'{{img{i}}}'
                content = content.replace(placeholder, f"![Зображення]({post_img.image.url})")
                
            if images:
                self.object.content = content
                self.object.save()
                
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
            content = self.object.content
            
            for i, img in enumerate(images, start=1):
                post_img = PostImage.objects.create(post=self.object, image=img)
                placeholder = f'{{new_img{i}}}'
                content = content.replace(placeholder, f"![Зображення]({post_img.image.url})")
                
            if images:
                self.object.content = content
                self.object.save()
            
            for post_img in self.object.images.all():
                if post_img.image and post_img.image.url not in self.object.content:
                    post_img.delete()
                    
        return response

class PostDeleteView(AdminRequiredMixin, DeleteView):
    model = Post
    slug_url_kwarg = 'slug'
    success_url = reverse_lazy('main:main_page')
    template_name = 'main_app/post_confirm_delete.html'

class PostDetailView(DetailView):
    model = Post
    template_name = 'main_app/post_detail.html'
    context_object_name = 'post'
    slug_url_kwarg = 'slug'