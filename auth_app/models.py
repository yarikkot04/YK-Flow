from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from django.utils.text import slugify
from django.db.models.signals import pre_save, post_delete
from django.dispatch import receiver
import os

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

@receiver(pre_save, sender=CustomUser)
def auto_delete_profile_image_on_change(sender, instance, **kwargs):
    if not instance.pk:
        return

    try:
        old_user = CustomUser.objects.get(pk=instance.pk)
    except CustomUser.DoesNotExist:
        return

    old_image = old_user.profile_image
    new_image = instance.profile_image

    if old_image and old_image != new_image:
        folder_path = os.path.dirname(old_image.path)
        
        old_image.delete(save=False)
        
        try:
            if not os.listdir(folder_path):
                os.rmdir(folder_path)
        except OSError:
            pass


@receiver(post_delete, sender=CustomUser)
def auto_delete_profile_image_on_delete(sender, instance, **kwargs):
    if instance.profile_image:
        folder_path = os.path.dirname(instance.profile_image.path)
        
        instance.profile_image.delete(save=False)
        
        try:
            if not os.listdir(folder_path):
                os.rmdir(folder_path)
        except OSError:
            pass