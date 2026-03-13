from django.db import models
from users.models import User


class Notification(models.Model):
    TYPE_CHOICES = [
        ('product_approved', 'Товар одобрен'),
        ('product_rejected', 'Товар отклонён'),
        ('category_approved', 'Категория одобрена'),
        ('category_rejected', 'Категория отклонена'),
        ('new_request', 'Новый запрос'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Пользователь', related_name='notifications')
    notification_type = models.CharField('Тип уведомления', max_length=30, choices=TYPE_CHOICES)
    title = models.CharField('Заголовок', max_length=200)
    message = models.TextField('Сообщение')
    is_read = models.BooleanField('Прочитано', default=False)
    related_id = models.IntegerField('ID связанного объекта', blank=True, null=True)
    created_at = models.DateTimeField('Дата создания', auto_now_add=True)
    
    class Meta:
        verbose_name = 'Уведомление'
        verbose_name_plural = 'Уведомления'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_notification_type_display()} для {self.user.username}"
