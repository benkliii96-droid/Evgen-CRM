from django.db import models
from django.conf import settings


class Category(models.Model):
    name = models.CharField('Название', max_length=100, unique=True)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'
        ordering = ['name']
    
    def __str__(self):
        return self.name


class Product(models.Model):
    UNIT_CHOICES = [
        ('шт', 'Штук'),
        ('кг', 'Килограмм'),
        ('л', 'Литр'),
        ('м', 'Метр'),
        ('упак', 'Упаковка'),
    ]
    
    name = models.CharField('Наименование', max_length=200)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, verbose_name='Категория', related_name='products')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, verbose_name='Добавил', related_name='products', null=True, blank=True)
    unit = models.CharField('Единица измерения', max_length=10, choices=UNIT_CHOICES, default='шт')
    quantity = models.PositiveIntegerField('Количество', default=1)
    price = models.DecimalField('Цена', max_digits=10, decimal_places=2)
    has_discount = models.BooleanField('Есть скидка', default=False)
    discount_percent = models.PositiveSmallIntegerField('Процент скидки', default=0)
    description = models.TextField('Описание', blank=True)
    image = models.ImageField('Изображение', upload_to='products/', blank=True, null=True)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    updated_at = models.DateTimeField('Дата обновления', auto_now=True)
    
    class Meta:
        verbose_name = 'Товар'
        verbose_name_plural = 'Товары'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    @property
    def total(self):
        discount = self.discount_percent if self.has_discount else 0
        return float(self.quantity) * float(self.price) * (1 - discount / 100)
