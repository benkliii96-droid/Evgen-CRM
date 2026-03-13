"""
Скрипт для создания начальных данных
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User
from products.models import Category

def create_initial_data():
    # Создаем админа
    if not User.objects.filter(username='admin').exists():
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123',
            role='admin'
        )
        print(f'Создан админ: {admin.username} (пароль: admin123)')
    else:
        print('Админ уже существует')
    
    # Создаем начальные категории
    categories = [
        'Техника для дома',
        'Настольные игры',
        'Электроника',
        'Спорт',
        'Книги',
        'Игрушки'
    ]
    
    for cat_name in categories:
        category, created = Category.objects.get_or_create(name=cat_name)
        if created:
            print(f'Создана категория: {cat_name}')
    
    print('\nНачальные данные созданы!')
    print('Админ: admin / admin123')

if __name__ == '__main__':
    create_initial_data()
