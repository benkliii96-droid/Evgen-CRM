from rest_framework import serializers
from .models import Category, Product
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


class CategorySerializer(serializers.ModelSerializer):
    products_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'products_count', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_products_count(self, obj):
        return obj.products.count()


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    total = serializers.ReadOnlyField()
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'category', 'category_name', 'unit', 'quantity',
            'price', 'has_discount', 'discount_percent', 'description',
            'image', 'total', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            # Для продакшена - полный URL
            return f'https://csmevg.ru{obj.image.url}'
        return None


class ProductCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'name', 'category', 'unit', 'quantity', 'price',
            'has_discount', 'discount_percent', 'description', 'image'
        ]

    def validate_name(self, value):
        return filter_bad_words(value)

    def validate_description(self, value):
        return filter_bad_words(value)

    def to_internal_value(self, data):
        # Преобразуем данные из FormData (все значения - строки)
        converted = {}
        for key, value in data.items():
            if key == 'hasDiscount':
                converted['has_discount'] = value in ('true', 'True', '1', True)
            elif key == 'category':
                try:
                    converted['category'] = int(value)
                except (ValueError, TypeError):
                    converted['category'] = value
            elif key == 'quantity':
                try:
                    converted['quantity'] = int(value)
                except (ValueError, TypeError):
                    converted['quantity'] = value
            elif key == 'discountPercent':
                try:
                    converted['discount_percent'] = int(value)
                except (ValueError, TypeError):
                    converted['discount_percent'] = value
            elif key == 'price':
                try:
                    converted['price'] = float(value)
                except (ValueError, TypeError):
                    converted['price'] = value
            else:
                converted[key] = value
        return super().to_internal_value(converted)
