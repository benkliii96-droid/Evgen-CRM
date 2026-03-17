from django.db import models
from users.models import User
from products.models import Category

class ProductRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'На рассмотрении'),
        ('approved', 'Одобрено'),
        ('rejected', 'Отклонено'),
    ]
    
    UNIT_CHOICES = [
        ('шт', 'Штук'),
        ('кг', 'Килограмм'),
        ('л', 'Литр'),
        ('м', 'Метр'),
        ('упак', 'Упаковка'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Пользователь', related_name='product_requests')
    name = models.CharField('Наименование', max_length=200)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, verbose_name='Категория')
    unit = models.CharField('Единица измерения', max_length=10, choices=UNIT_CHOICES, default='шт')
    quantity = models.PositiveIntegerField('Количество', default=1)
    price = models.DecimalField('Цена', max_digits=10, decimal_places=2)
    has_discount = models.BooleanField('Есть скидка', default=False)
    discount_percent = models.PositiveSmallIntegerField('Процент скидки', default=0)
    description = models.TextField('Описание', blank=True)
    image = models.ImageField('Изображение', upload_to='requests/', blank=True, null=True)
    status = models.CharField('Статус', max_length=10, choices=STATUS_CHOICES, default='pending')
    admin_comment = models.TextField('Комментарий админа', blank=True)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)
    
    class Meta:
        verbose_name = 'Запрос на добавление товара'
        verbose_name_plural = 'Запросы на добавление товаров'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} от {self.user.username}"



