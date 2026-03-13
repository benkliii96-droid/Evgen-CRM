from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    is_admin = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'is_admin', 'avatar', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'password', 'password_confirm']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError('Пароли не совпадают')
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        # Создаем пользователя без email
        username = validated_data.pop('username')
        password = validated_data.pop('password')
        user = User.objects.create_user(username=username, email=None, password=password)
        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
