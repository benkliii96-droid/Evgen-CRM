from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from products.models import Category, Product, Unit
from .models import ProductRequest, CategoryRequest
from .serializers import (
    ProductRequestSerializer, ProductRequestCreateSerializer, ProductRequestReviewSerializer,
    CategoryRequestSerializer, CategoryRequestCreateSerializer, CategoryRequestReviewSerializer
)
from users.authentication import TokenAuthentication
from notifications.utils import (
    notify_product_approved, notify_product_rejected,
    notify_category_approved, notify_category_rejected,
    notify_new_request
)


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin


class ProductRequestViewSet(viewsets.ModelViewSet):
    queryset = ProductRequest.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = ProductRequest.objects.all()
        
        # Фильтрация по статусу
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if user.is_admin:
            return queryset
        return queryset.filter(user=user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ProductRequestCreateSerializer
        if self.action in ['update', 'partial_update']:
            return ProductRequestReviewSerializer
        return ProductRequestSerializer
    
    def perform_create(self, serializer):
        request_obj = serializer.save(user=self.request.user)
        # Уведомляем админов о новом запросе
        notify_new_request(
            admin_user=None,
            request_type='товар',
            request_name=request_obj.name,
            request_id=request_obj.id
        )
        
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
        
# Преобразуем строку единицы измерения в объект Unit
        unit_obj = None
        if product_request.unit:
            try:
                unit_obj = Unit.objects.filter(short_name=product_request.unit, is_active=True).first()
            except Exception as e:
                print(f"Error finding unit: {e}")
                unit_obj = None
        if not unit_obj:
            unit_obj = Unit.objects.filter(short_name='шт', is_active=True).first()
            
        try:
            Product.objects.create(
                name=product_request.name,
                category=product_request.category,
                unit=unit_obj,
                quantity=product_request.quantity,
                price=product_request.price,
                has_discount=product_request.has_discount,
                discount_percent=product_request.discount_percent,
                description=product_request.description,
                image=product_request.image
            )
        except Exception as e:
            return Response({'error': f'Ошибка при создании товара: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        product_request.status = 'approved'
        product_request.save()
        
        # Отправляем уведомление пользователю
        notify_product_approved(product_request)
        
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
        
        # Отправляем уведомление пользователю
        notify_product_rejected(product_request)
        
        return Response({'status': 'rejected'})

    @action(detail=False, methods=['post'])
    def bulk_approve(self, request):
        """Массовое одобрение заявок"""
        if not request.user.is_admin:
            return Response({'error': 'Нет прав'}, status=status.HTTP_403_FORBIDDEN)
        
        ids = request.data.get('ids', [])
        comment = request.data.get('comment', '')
        
        if not ids:
            return Response({'error': 'Не указаны ID заявок'}, status=status.HTTP_400_BAD_REQUEST)
        
        pending_requests = ProductRequest.objects.filter(id__in=ids, status='pending')
        approved_count = 0
        
        for product_request in pending_requests:
# Преобразуем строку единицы измерения в объект Unit
            unit_obj = None
            if product_request.unit:
                try:
                    unit_obj = Unit.objects.filter(short_name=product_request.unit, is_active=True).first()
                except Exception as e:
                    print(f"Error finding unit: {e}")
                    unit_obj = None
            if not unit_obj:
                unit_obj = Unit.objects.filter(short_name='шт', is_active=True).first()
            
            try:
                Product.objects.create(
                    name=product_request.name,
                    category=product_request.category,
                    unit=unit_obj,
                    quantity=product_request.quantity,
                    price=product_request.price,
                    has_discount=product_request.has_discount,
                    discount_percent=product_request.discount_percent,
                    description=product_request.description,
                    image=product_request.image
                )
                
                product_request.status = 'approved'
                product_request.save()
                
                notify_product_approved(product_request)
                approved_count += 1
            except Exception as e:
                print(f"Error approving request {product_request.id}: {e}")
                continue
        
        return Response({
            'status': 'approved',
            'approved_count': approved_count,
            'failed_count': len(ids) - approved_count
        })

    @action(detail=False, methods=['post'])
    def bulk_reject(self, request):
        """Массовое отклонение заявок"""
        if not request.user.is_admin:
            return Response({'error': 'Нет прав'}, status=status.HTTP_403_FORBIDDEN)
        
        ids = request.data.get('ids', [])
        comment = request.data.get('comment', '')
        
        if not ids:
            return Response({'error': 'Не указаны ID заявок'}, status=status.HTTP_400_BAD_REQUEST)
        
        pending_requests = ProductRequest.objects.filter(id__in=ids, status='pending')
        rejected_count = 0
        
        for product_request in pending_requests:
            product_request.status = 'rejected'
            product_request.admin_comment = comment
            product_request.save()
            
            notify_product_rejected(product_request)
            rejected_count += 1
        
        return Response({
            'status': 'rejected',
            'rejected_count': rejected_count,
            'failed_count': len(ids) - rejected_count
        })


class CategoryRequestViewSet(viewsets.ModelViewSet):
    queryset = CategoryRequest.objects.all()
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        queryset = CategoryRequest.objects.all()
        
        # Фильтрация по статусу
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if user.is_admin:
            return queryset
        return queryset.filter(user=user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CategoryRequestCreateSerializer
        if self.action in ['update', 'partial_update']:
            return CategoryRequestReviewSerializer
        return CategoryRequestSerializer
    
    def perform_create(self, serializer):
        request_obj = serializer.save(user=self.request.user)
        # Уведомляем админов о новом запросе
        notify_new_request(
            admin_user=None,
            request_type='категорию',
            request_name=request_obj.name,
            request_id=request_obj.id
        )
    
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
        
        # Отправляем уведомление пользователю
        notify_category_approved(category_request)
        
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
        
        # Отправляем уведомление пользователю
        notify_category_rejected(category_request)
        
        return Response({'status': 'rejected'})

    @action(detail=False, methods=['post'])
    def bulk_approve(self, request):
        """Массовое одобрение заявок"""
        if not request.user.is_admin:
            return Response({'error': 'Нет прав'}, status=status.HTTP_403_FORBIDDEN)
        
        ids = request.data.get('ids', [])
        
        if not ids:
            return Response({'error': 'Не указаны ID заявок'}, status=status.HTTP_400_BAD_REQUEST)
        
        pending_requests = CategoryRequest.objects.filter(id__in=ids, status='pending')
        approved_count = 0
        
        for category_request in pending_requests:
            Category.objects.create(name=category_request.name)
            
            category_request.status = 'approved'
            category_request.save()
            
            notify_category_approved(category_request)
            approved_count += 1
        
        return Response({
            'status': 'approved',
            'approved_count': approved_count,
            'failed_count': len(ids) - approved_count
        })
    
    @action(detail=False, methods=['post'])
    def bulk_reject(self, request):
        """Массовое отклонение заявок"""
        if not request.user.is_admin:
            return Response({'error': 'Нет прав'}, status=status.HTTP_403_FORBIDDEN)
        
        ids = request.data.get('ids', [])
        comment = request.data.get('comment', '')
        
        if not ids:
            return Response({'error': 'Не указаны ID заявок'}, status=status.HTTP_400_BAD_REQUEST)
        
        pending_requests = CategoryRequest.objects.filter(id__in=ids, status='pending')
        rejected_count = 0
        
        for category_request in pending_requests:
            category_request.status = 'rejected'
            category_request.admin_comment = comment
            category_request.save()
            
            notify_category_rejected(category_request)
            rejected_count += 1
        
        return Response({
            'status': 'rejected',
            'rejected_count': rejected_count,
            'failed_count': len(ids) - rejected_count
        })
