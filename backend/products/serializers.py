from rest_framework import serializers
from .models import Category, Product, ProductField, ProductFieldValue, UnitGroup, Unit, CategoryUnit
from django.conf import settings


# Фильтр нецензурной речи
BAD_WORDS = ['бля', 'пизда', 'еба', 'хуй', 'нахуй', 'ебать', 'пиздец', 'сука', 'блядь', 'хуйня', 'пизд', 'ебал', 'еби', 'хуя', 'пздц', 'fuck', 'shit', 'ass', 'bitch']


def filter_bad_words(text):
    if not text:
        return text
    filtered = text
    for word in BAD_WORDS:
        import re
        regex = re.compile(word, re.IGNORECASE)
        filtered = regex.sub('*' * len(word), filtered)
    return filtered


# === Сериализаторы единиц измерения ===

class UnitSerializer(serializers.ModelSerializer):
    """Сериализатор единицы измерения"""
    group_name = serializers.CharField(source='group.name', read_only=True)
    group_slug = serializers.CharField(source='group.slug', read_only=True)
    
    class Meta:
        model = Unit
        fields = [
            'id', 'name', 'short_name', 'plural_name', 'group', 'group_name', 'group_slug',
            'ratio_to_base', 'is_base', 'is_default', 'sort_order', 'is_active'
        ]
        read_only_fields = ['id']
    
    def validate(self, data):
        # Проверяем, что только одна базовая в группе
        group = data.get('group')
        is_base = data.get('is_base', False)
        if is_base and group:
            existing = Unit.objects.filter(group=group, is_base=True)
            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)
            if existing.exists():
                raise serializers.ValidationError({'is_base': 'В группе уже есть базовая единица'})
        return data


class UnitListSerializer(serializers.ModelSerializer):
    """Компактный сериализатор для списка единиц"""
    group_name = serializers.CharField(source='group.name', read_only=True)
    
    class Meta:
        model = Unit
        fields = ['id', 'name', 'short_name', 'group_name', 'is_base', 'is_default', 'sort_order']


class UnitGroupSerializer(serializers.ModelSerializer):
    """Сериализатор группы единиц"""
    units = UnitListSerializer(many=True, read_only=True)
    units_count = serializers.SerializerMethodField()
    
    class Meta:
        model = UnitGroup
        fields = ['id', 'name', 'slug', 'icon', 'description', 'sort_order', 'is_active', 'units', 'units_count']
        read_only_fields = ['id']
    
    def get_units_count(self, obj):
        return obj.units.count()


class UnitGroupListSerializer(serializers.ModelSerializer):
    """Компактный сериализатор для списка групп"""
    units_count = serializers.SerializerMethodField()
    
    class Meta:
        model = UnitGroup
        fields = ['id', 'name', 'slug', 'icon', 'sort_order', 'is_active', 'units_count']
    
    def get_units_count(self, obj):
        return obj.units.count()


class CategoryUnitSerializer(serializers.ModelSerializer):
    """Сериализатор допустимых единиц для категории"""
    unit = UnitListSerializer(read_only=True)
    unit_id = serializers.PrimaryKeyRelatedField(
        queryset=Unit.objects.all(),
        source='unit',
        write_only=True
    )
    
    class Meta:
        model = CategoryUnit
        fields = ['id', 'unit', 'unit_id', 'is_default', 'sort_order']
        read_only_fields = ['id']


# === Сериализаторы полей ===

class ProductFieldSerializer(serializers.ModelSerializer):
    """Сериализатор для определения поля"""
    options = serializers.JSONField(required=False)
    
    class Meta:
        model = ProductField
        fields = [
            'id', 'name', 'slug', 'field_type', 'description', 'placeholder',
            'options', 'default_value', 'required',
            'min_value', 'max_value', 'min_length', 'max_length', 'pattern',
            'sort_order', 'is_filterable', 'is_visible', 'unit', 'categories'
        ]
        read_only_fields = ['id']
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Добавляем обработанные options с дефолтами
        data['options'] = instance.get_options()
        return data


class ProductFieldValueSerializer(serializers.ModelSerializer):
    """Сериализатор для значения поля товара"""
    field = ProductFieldSerializer(read_only=True)
    field_id = serializers.PrimaryKeyRelatedField(
        queryset=ProductField.objects.all(), 
        source='field', 
        write_only=True
    )
    
    class Meta:
        model = ProductFieldValue
        fields = ['id', 'field', 'field_id', 'value']
        read_only_fields = ['id']


class ProductFieldValueCreateSerializer(serializers.ModelSerializer):
    """Упрощённый сериализатор для создания значений"""
    field_id = serializers.IntegerField()
    
    class Meta:
        model = ProductFieldValue
        fields = ['field_id', 'value']
    
    def validate_field_id(self, value):
        if not ProductField.objects.filter(id=value).exists():
            raise serializers.ValidationError("Поле не найдено")
        return value


# === Сериализаторы категорий ===

class CategorySerializer(serializers.ModelSerializer):
    """Сериализатор категории с поддержкой вложенности"""
    products_count = serializers.SerializerMethodField()
    children = serializers.SerializerMethodField()
    fields = ProductFieldSerializer(many=True, read_only=True)
    full_path = serializers.ReadOnlyField()
    depth = serializers.ReadOnlyField()
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'slug', 'parent', 'children', 'icon', 'description',
            'is_active', 'sort_order', 'products_count', 'full_path', 'depth',
            'fields', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_products_count(self, obj):
        return obj.products.count()
    
    def get_children(self, obj):
        """Включаем дочерние категории (только первого уровня)"""
        children = obj.children.filter(is_active=True)
        return CategoryListSerializer(children, many=True).data


class CategoryWithUnitsSerializer(serializers.ModelSerializer):
    """Category + allowed_units for frontend dropdowns"""
    allowed_units = CategoryUnitSerializer(many=True, read_only=True)
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'allowed_units']


class CategoryListSerializer(serializers.ModelSerializer):
    """Компактный сериализатор для списков (без полей)"""
    products_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'parent', 'products_count', 'sort_order']
    
    def get_products_count(self, obj):
        return obj.products.count()


class CategoryTreeSerializer(serializers.ModelSerializer):
    """Сериализатор для дерева категорий"""
    children = serializers.SerializerMethodField()
    products_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'children', 'products_count']
    
    def get_products_count(self, obj):
        return obj.products.count()
    
    def get_children(self, obj):
        children = obj.children.filter(is_active=True)
        return CategoryTreeSerializer(children, many=True).data


# === Сериализаторы товаров ===

class ProductSerializer(serializers.ModelSerializer):
    """Полный сериализатор товара с полями"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    category_slug = serializers.CharField(source='category.slug', read_only=True)
    total = serializers.ReadOnlyField()
    image = serializers.SerializerMethodField()
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_avatar = serializers.SerializerMethodField()
    field_values = ProductFieldValueSerializer(many=True, read_only=True)
    unit_display = serializers.CharField(read_only=True)
    unit_name = serializers.CharField(source='unit.name', read_only=True)
    unit_short = serializers.CharField(source='unit.short_name', read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'category', 'category_name', 'category_slug', 
            'user', 'user_username', 'user_avatar', 'unit', 'unit_display', 'unit_name', 'unit_short',
            'quantity', 'price', 'has_discount', 'discount_percent', 'description',
            'image', 'total', 'created_at', 'updated_at',
            'field_values'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']
    
    def get_user_avatar(self, obj):
        if obj.user and obj.user.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.user.avatar.url)
            return f'https://csmevg.ru{obj.user.avatar.url}'
        return None

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return f'https://csmevg.ru{obj.image.url}'
        return None


class ProductListSerializer(serializers.ModelSerializer):
    """Компактный сериализатор для списка товаров"""
    category_name = serializers.CharField(source='category.name', read_only=True)
    total = serializers.ReadOnlyField()
    image = serializers.SerializerMethodField()
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_avatar = serializers.SerializerMethodField()
    unit_display = serializers.CharField(read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'category', 'category_name', 'user', 'user_username', 'user_avatar',
            'unit', 'unit_display', 'quantity', 'price', 'has_discount', 'discount_percent',
            'image', 'total', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def get_user_avatar(self, obj):
        if obj.user and obj.user.avatar:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.user.avatar.url)
            return f'https://csmevg.ru{obj.user.avatar.url}'
        return None

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return f'https://csmevg.ru{obj.image.url}'
        return None


class ProductCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания товара с полями"""
    field_values = ProductFieldValueCreateSerializer(many=True, required=False)
    
    class Meta:
        model = Product
        fields = [
            'name', 'category', 'unit', 'quantity', 'price',
            'has_discount', 'discount_percent', 'description', 'image', 'user',
            'field_values'
        ]
        read_only_fields = ['user']

    def validate_name(self, value):
        return filter_bad_words(value)

    def validate_description(self, value):
        return filter_bad_words(value)

    def create(self, validated_data):
        field_values_data = validated_data.pop('field_values', [])
        product = super().create(validated_data)
        
        # Создаём значения полей
        for fv_data in field_values_data:
            field_id = fv_data.pop('field_id')
            value = fv_data.get('value')
            ProductFieldValue.objects.create(
                product=product,
                field_id=field_id,
                value=value
            )
        
        return product
    
    def update(self, instance, validated_data):
        field_values_data = validated_data.pop('field_values', None)
        product = super().update(instance, validated_data)
        
        # Обновляем значения полей, если они переданы
        if field_values_data is not None:
            # Удаляем старые значения
            product.field_values.all().delete()
            
            # Создаём новые
            for fv_data in field_values_data:
                field_id = fv_data.pop('field_id')
                value = fv_data.get('value')
                ProductFieldValue.objects.create(
                    product=product,
                    field_id=field_id,
                    value=value
                )
        
        return product

    def to_internal_value(self, data):
        # Преобразуем данные из FormData (все значения - строки)
        converted = {}
        for key, value in data.items():
            if key == 'hasDiscount':
                converted['has_discount'] = value.lower() in ('true', '1', 'yes')
            elif key == 'category':
                try:
                    converted['category'] = int(value)
                except (ValueError, TypeError):
                    converted['category'] = value
            elif key == 'quantity':
                try:
                    converted['quantity'] = int(value)
                except (ValueError, TypeError):
                    converted['quantity'] = 0
            elif key == 'discountPercent':
                try:
                    converted['discount_percent'] = int(value)
                except (ValueError, TypeError):
                    converted['discount_percent'] = 0
            elif key == 'price':
                try:
                    converted['price'] = float(value)
                except (ValueError, TypeError):
                    converted['price'] = 0.0
            elif key == 'unit':
                # Если передан ID юнита - используем его, иначе ищем по short_name
                if value:
                    try:
                        unit_id = int(value)
                        converted['unit'] = unit_id
                    except (ValueError, TypeError):
                        # Это строка (short_name), нужно найти Unit
                        from .models import Unit
                        unit_obj = Unit.objects.filter(short_name=value, is_active=True).first()
                        if unit_obj:
                            converted['unit'] = unit_obj.id
                        # Если не найден - не добавляем (оставим null)
            elif key == 'name':
                converted['name'] = value.strip()
            elif key == 'description':
                converted['description'] = value or ''
            elif key == 'fieldValues':
                # Обработка field_values из FormData
                try:
                    import json
                    converted['field_values'] = json.loads(value)
                except:
                    converted['field_values'] = []
            else:
                converted[key] = value
        return super().to_internal_value(converted)
