from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.utils.text import slugify

def define_upload_image_path(instance, filename):
    date_path = timezone.now().strftime('%Y/%m/%d')
    return f'profile_image/{instance.username}/{date_path}/{filename}'

class CustomUser(AbstractUser):
    status_text = models.CharField(max_length=150, blank=True, null=True)
    phone_number = models.CharField(max_length=50, blank=True, null=True) 
    slug = models.SlugField(unique=True, blank=True, max_length=150) 
    profile_image = models.ImageField(upload_to=define_upload_image_path, null=True, blank=True)
    github_url = models.URLField(max_length=500, null=True, blank=True)
    telegram_url = models.URLField(max_length=500, null=True, blank=True)
    linkedin_url = models.URLField(max_length=500, null=True, blank=True)

    def __str__(self):
        return self.username

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.username)
        super().save(*args, **kwargs)