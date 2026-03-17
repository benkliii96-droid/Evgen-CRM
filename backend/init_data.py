"""
Скрипт для создания начальных данных
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User
from products.models import Category, UnitGroup, Unit

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
    
    # Создаем группы единиц измерения
    unit_groups = [
        {'name': 'Количество', 'slug': 'count', 'icon': '📦', 'sort_order': 1},
        {'name': 'Вес', 'slug': 'weight', 'icon': '⚖️', 'sort_order': 2},
        {'name': 'Объём', 'slug': 'volume', 'icon': '🧪', 'sort_order': 3},
        {'name': 'Длина', 'slug': 'length', 'icon': '📏', 'sort_order': 4},
    ]
    
    for group_data in unit_groups:
        group, created = UnitGroup.objects.get_or_create(
            slug=group_data['slug'],
            defaults=group_data
        )
        if created:
            print(f'Создана группа единиц: {group.name}')
    
    # Создаем единицы измерения
    units_data = [
        # Количество
        {'name': 'Штука', 'short_name': 'шт', 'plural_name': 'Штук', 'group_slug': 'count', 'is_base': True, 'is_default': True, 'sort_order': 1},
        {'name': 'Упаковка', 'short_name': 'упак', 'plural_name': 'Упаковок', 'group_slug': 'count', 'sort_order': 2},
        {'name': 'Пара', 'short_name': 'пар', 'plural_name': 'Пар', 'group_slug': 'count', 'sort_order': 3},
        {'name': 'Набор', 'short_name': 'набор', 'plural_name': 'Наборов', 'group_slug': 'count', 'sort_order': 4},
        
        # Вес
        {'name': 'Килограмм', 'short_name': 'кг', 'plural_name': 'Килограмм', 'group_slug': 'weight', 'is_base': True, 'is_default': True, 'sort_order': 1},
        {'name': 'Грамм', 'short_name': 'г', 'plural_name': 'Грамм', 'group_slug': 'weight', 'ratio_to_base': 0.001, 'sort_order': 2},
        {'name': 'Тонна', 'short_name': 'т', 'plural_name': 'Тонн', 'group_slug': 'weight', 'ratio_to_base': 1000, 'sort_order': 3},
        
        # Объём
        {'name': 'Литр', 'short_name': 'л', 'plural_name': 'Литров', 'group_slug': 'volume', 'is_base': True, 'is_default': True, 'sort_order': 1},
        {'name': 'Миллилитр', 'short_name': 'мл', 'plural_name': 'Миллилитров', 'group_slug': 'volume', 'ratio_to_base': 0.001, 'sort_order': 2},
        {'name': 'Метр кубический', 'short_name': 'м³', 'plural_name': 'Метров кубических', 'group_slug': 'volume', 'ratio_to_base': 1000, 'sort_order': 3},
        
        # Длина
        {'name': 'Метр', 'short_name': 'м', 'plural_name': 'Метров', 'group_slug': 'length', 'is_base': True, 'is_default': True, 'sort_order': 1},
        {'name': 'Сантиметр', 'short_name': 'см', 'plural_name': 'Сантиметров', 'group_slug': 'length', 'ratio_to_base': 0.01, 'sort_order': 2},
        {'name': 'Миллиметр', 'short_name': 'мм', 'plural_name': 'Миллиметров', 'group_slug': 'length', 'ratio_to_base': 0.001, 'sort_order': 3},
    ]
    
    for unit_data in units_data:
        group_slug = unit_data.pop('group_slug')
        try:
            group = UnitGroup.objects.get(slug=group_slug)
            unit, created = Unit.objects.get_or_create(
                group=group,
                short_name=unit_data['short_name'],
                defaults=unit_data
            )
            if created:
                print(f'Создана единица: {unit.name} ({unit.short_name})')
        except UnitGroup.DoesNotExist:
            print(f'Группа {group_slug} не найдена')
    
    print('\nНачальные данные созданы!')
    print('Админ: admin / admin123')

if __name__ == '__main__':
    create_initial_data()
