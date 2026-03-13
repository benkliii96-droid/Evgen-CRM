from .models import Notification


def create_notification(user, notification_type, title, message, related_id=None):
    """Создать уведомление для пользователя"""
    Notification.objects.create(
        user=user,
        notification_type=notification_type,
        title=title,
        message=message,
        related_id=related_id
    )


def notify_product_approved(product_request):
    """Уведомить пользователя о одобрении товара"""
    create_notification(
        user=product_request.user,
        notification_type='product_approved',
        title='Ваш товар одобрен',
        message=f'Товар "{product_request.name}" был одобрен и добавлен в каталог.',
        related_id=product_request.id
    )


def notify_product_rejected(product_request):
    """Уведомить пользователя об отклонении товара"""
    comment = product_request.admin_comment or 'Причина не указана'
    create_notification(
        user=product_request.user,
        notification_type='product_rejected',
        title='Ваш товар отклонён',
        message=f'Товар "{product_request.name}" был отклонён. Причина: {comment}',
        related_id=product_request.id
    )


def notify_category_approved(category_request):
    """Уведомить пользователя об одобрении категории"""
    create_notification(
        user=category_request.user,
        notification_type='category_approved',
        title='Ваша категория одобрена',
        message=f'Категория "{category_request.name}" была одобрена и добавлена.',
        related_id=category_request.id
    )


def notify_category_rejected(category_request):
    """Уведомить пользователя об отклонении категории"""
    comment = category_request.admin_comment or 'Причина не указана'
    create_notification(
        user=category_request.user,
        notification_type='category_rejected',
        title='Ваша категория отклонена',
        message=f'Категория "{category_request.name}" была отклонена. Причина: {comment}',
        related_id=category_request.id
    )


def notify_new_request(admin_user, request_type, request_name, request_id):
    """Уведомить админа о новом запросе"""
    # Находим всех админов
    from users.models import User
    admins = User.objects.filter(role='admin')
    
    for admin in admins:
        create_notification(
            user=admin,
            notification_type='new_request',
            title=f'Новый запрос на {request_type}',
            message=f'Пользователь подал запрос на добавление: {request_name}',
            related_id=request_id
        )
