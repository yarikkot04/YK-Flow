from django.db import models
from django.utils import timezone
from django.utils.text import slugify
from django.conf import settings
import uuid

from auth_app.models import CustomUser

def post_image_path(instance, filename):
    return f'posts/{instance.post.slug}/{filename}'

class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=True)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

CYRILLIC_TO_LATIN = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ie',
    'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'i', 'й': 'i', 'к': 'k', 'л': 'l',
    'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ь': '', 
    'ю': 'iu', 'я': 'ia', 'ы': 'y', 'э': 'e', 'ъ': ''
}

def transliterate(text):
    return ''.join(CYRILLIC_TO_LATIN.get(c, c) for c in text.lower())

class Post(models.Model):
    author = models.ForeignKey(to=CustomUser, on_delete=models.CASCADE, related_name='posts')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='posts')
    title = models.CharField(max_length=200, unique=True)
    
    slug = models.SlugField(unique=True, blank=True, max_length=250)
    
    content = models.TextField() 
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            transliterated_title = transliterate(self.title)
            
            base_slug = slugify(transliterated_title)
            
            if not base_slug:
                base_slug = str(uuid.uuid4())[:8]
                
            self.slug = base_slug
            
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title
    
class PostImage(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to=post_image_path)
    
    def __str__(self):
        return f"Image for {self.post.title}"