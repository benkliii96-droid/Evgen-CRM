"""
Скрипт для создания начальных данных
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User
from products.models import Category, UnitGroup, Unit, CategoryUnit

def create_initial_data():
    # Создаем админа
    if not User.objects.filter(username='admin').exists():
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='05092007u',
            role='admin'
        )
        print(f'Создан админ: {admin.username} (пароль: admin123)')
    else:
        print('Админ уже существует')
    
    # Создаем 15 стандартных категорий
    categories_data = [
        {'name': 'Смартфоны', 'sort_order': 1},
        {'name': 'Ноутбуки', 'sort_order': 2},
        {'name': 'Одежда', 'sort_order': 3},
        {'name': 'Обувь', 'sort_order': 4},
        {'name': 'Книги', 'sort_order': 5},
        {'name': 'Игрушки', 'sort_order': 6},
        {'name': 'Спорттовары', 'sort_order': 7},
        {'name': 'Бытовая техника', 'sort_order': 8},
        {'name': 'Автозапчасти', 'sort_order': 9},
        {'name': 'Косметика', 'sort_order': 10},
        {'name': 'Продукты питания', 'sort_order': 11},
        {'name': 'Мебель', 'sort_order': 12},
        {'name': 'Инструменты', 'sort_order': 13},
        {'name': 'Ювелирные изделия', 'sort_order': 14},
        {'name': 'Электроника', 'sort_order': 15},
    ]
    
    for cat_data in categories_data:
        category, created = Category.objects.get_or_create(
            name=cat_data['name'],
            defaults={'sort_order': cat_data['sort_order']}
        )
        if created:
            print(f'Создана категория: {category.name}')
    
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
    
    # Привязываем категории к единицам (CategoryUnit)
    category_unit_data = [
        # Смартфоны, Ноутбуки, Электроника → шт, упак
        ('Смартфоны', 'шт', True),
        ('Смартфоны', 'упак', False),
        ('Ноутбуки', 'шт', True),
        ('Электроника', 'шт', True),
        
        # Одежда, Обувь → пар, шт
        ('Одежда', 'шт', True),
        ('Одежда', 'пар', False),
        ('Обувь', 'пар', True),
        
        # Книги, Игрушки → шт
        ('Книги', 'шт', True),
        ('Игрушки', 'шт', True),
        
        # Спорттовары → шт, набор
        ('Спорттовары', 'шт', True),
        ('Спорттовары', 'набор', False),
        
        # Бытовая техника → шт
        ('Бытовая техника', 'шт', True),
        
        # Автозапчасти → шт, набор
        ('Автозапчасти', 'шт', True),
        ('Автозапчасти', 'набор', False),
        
        # Косметика, Продукты → шт, г, кг
        ('Косметика', 'шт', True),
        ('Продукты питания', 'шт', False),
        ('Продукты питания', 'г', True),
        ('Продукты питания', 'кг', False),
        
        # Мебель → шт
        ('Мебель', 'шт', True),
        
        # Инструменты → шт, набор
        ('Инструменты', 'шт', True),
        ('Инструменты', 'набор', False),
        
        # Ювелирка → шт, г
        ('Ювелирные изделия', 'шт', True),
        ('Ювелирные изделия', 'г', False),
    ]
    
    for cat_name, short_name, is_default in category_unit_data:
        try:
            category = Category.objects.get(name=cat_name)
            unit = Unit.objects.get(short_name=short_name)
            cat_unit, created = CategoryUnit.objects.get_or_create(
                category=category,
                unit=unit,
                defaults={'is_default': is_default, 'sort_order': 0}
            )
            if created:
                print(f'Привязана единица {short_name} к категории {cat_name}')
        except (Category.DoesNotExist, Unit.DoesNotExist):
            print(f'Пропущена привязка: категория {cat_name} или единица {short_name}')
    
    print('\n✅ Начальные данные созданы!')
    print('👤 Админ: admin / admin123')
    print('📱 API: /api/categories/?units=true')

if __name__ == '__main__':
    create_initial_data()

