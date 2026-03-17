from rest_framework import serializers
from .models import ProductRequest
from django.conf import settings


class ProductRequestSerializer(serializers.ModelSerializer):
    user_username = serializers.CharField(source='user.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    image = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductRequest
        fields = [
            'id', 'user', 'user_username', 'name', 'category', 'category_name',
            'unit', 'quantity', 'price', 'has_discount', 'discount_percent',
            'description', 'image', 'status', 'status_display', 'admin_comment',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'status', 'admin_comment', 'created_at', 'updated_at']

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return f'https://csmevg.ru{obj.image.url}'
        return None


class ProductRequestCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductRequest
        fields = [
            'name', 'category', 'unit', 'quantity', 'price',
            'has_discount', 'discount_percent', 'description', 'image'
        ]


class ProductRequestReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductRequest
        fields = ['status', 'admin_comment']



