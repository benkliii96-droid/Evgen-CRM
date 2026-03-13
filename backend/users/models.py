from django.db import models
from django.contrib.auth.models import AbstractUser
import secrets


class User(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Администратор'),
        ('user', 'Пользователь'),
    ]
    
    role = models.CharField('Роль', max_length=10, choices=ROLE_CHOICES, default='user')
    avatar = models.ImageField('Аватар', upload_to='avatars/', blank=True, null=True)
    created_at = models.DateTimeField('Дата регистрации', auto_now_add=True)
    auth_token = models.CharField('Токен авторизации', max_length=64, blank=True, null=True, unique=True)
    
    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
    
    @property
    def is_admin(self):
        return self.role == 'admin'

    def generate_token(self):
        self.auth_token = secrets.token_hex(32)
        self.save()
        return self.auth_token
