from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from products.models import Category, Product
from .models import ProductRequest, CategoryRequest
from .serializers import (
    ProductRequestSerializer, ProductRequestCreateSerializer, ProductRequestReviewSerializer,
    CategoryRequestSerializer, CategoryRequestCreateSerializer, CategoryRequestReviewSerializer
)
from users.authentication import TokenAuthentication


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin


class ProductRequestViewSet(viewsets.ModelViewSet):
    queryset = ProductRequest.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return ProductRequest.objects.all()
        return ProductRequest.objects.filter(user=user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ProductRequestCreateSerializer
        if self.action in ['update', 'partial_update']:
            return ProductRequestReviewSerializer
        return ProductRequestSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return super().get_permissions()
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        if not request.user.is_admin:
            return Response({'error': 'Нет прав'}, status=status.HTTP_403_FORBIDDEN)
        
        product_request = self.get_object()
        
        if product_request.status != 'pending':
            return Response({'error': 'Запрос уже обработан'}, status=status.HTTP_400_BAD_REQUEST)
        
        Product.objects.create(
            name=product_request.name,
            category=product_request.category,
            unit=product_request.unit,
            quantity=product_request.quantity,
            price=product_request.price,
            has_discount=product_request.has_discount,
            discount_percent=product_request.discount_percent,
            description=product_request.description,
            image=product_request.image
        )
        
        product_request.status = 'approved'
        product_request.save()
        
        return Response({'status': 'approved'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        if not request.user.is_admin:
            return Response({'error': 'Нет прав'}, status=status.HTTP_403_FORBIDDEN)
        
        product_request = self.get_object()
        
        if product_request.status != 'pending':
            return Response({'error': 'Запрос уже обработан'}, status=status.HTTP_400_BAD_REQUEST)
        
        product_request.status = 'rejected'
        product_request.admin_comment = request.data.get('comment', '')
        product_request.save()
        
        return Response({'status': 'rejected'})


class CategoryRequestViewSet(viewsets.ModelViewSet):
    queryset = CategoryRequest.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return CategoryRequest.objects.all()
        return CategoryRequest.objects.filter(user=user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CategoryRequestCreateSerializer
        if self.action in ['update', 'partial_update']:
            return CategoryRequestReviewSerializer
        return CategoryRequestSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return super().get_permissions()
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        if not request.user.is_admin:
            return Response({'error': 'Нет прав'}, status=status.HTTP_403_FORBIDDEN)
        
        category_request = self.get_object()
        
        if category_request.status != 'pending':
            return Response({'error': 'Запрос уже обработан'}, status=status.HTTP_400_BAD_REQUEST)
        
        Category.objects.create(name=category_request.name)
        
        category_request.status = 'approved'
        category_request.save()
        
        return Response({'status': 'approved'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        if not request.user.is_admin:
            return Response({'error': 'Нет прав'}, status=status.HTTP_403_FORBIDDEN)
        
        category_request = self.get_object()
        
        if category_request.status != 'pending':
            return Response({'error': 'Запрос уже обработан'}, status=status.HTTP_400_BAD_REQUEST)
        
        category_request.status = 'rejected'
        category_request.admin_comment = request.data.get('comment', '')
        category_request.save()
        
        return Response({'status': 'rejected'})
