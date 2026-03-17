from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Category, Product, ProductField, ProductFieldValue, UnitGroup, Unit, CategoryUnit
from .serializers import (
    CategorySerializer, CategoryListSerializer, CategoryTreeSerializer, CategoryWithUnitsSerializer,
    ProductSerializer, ProductListSerializer, ProductCreateSerializer,
    ProductFieldSerializer, ProductFieldValueSerializer,
    UnitGroupSerializer, UnitGroupListSerializer, UnitSerializer, UnitListSerializer,
    CategoryUnitSerializer
)
from users.authentication import TokenAuthentication


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin


class UnitGroupViewSet(viewsets.ModelViewSet):
    """ViewSet для групп единиц измерения"""
    queryset = UnitGroup.objects.all()
    serializer_class = UnitGroupSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['sort_order', 'name']
    ordering = ['sort_order', 'name']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UnitGroupListSerializer
        return UnitGroupSerializer


class UnitViewSet(viewsets.ModelViewSet):
    """ViewSet для единиц измерения"""
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'short_name']
    ordering_fields = ['sort_order', 'name']
    ordering = ['sort_order', 'name']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return UnitListSerializer
        return UnitSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        group_id = self.request.query_params.get('group')
        if group_id:
            queryset = queryset.filter(group_id=group_id)
        return queryset
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Получить единицы для категории"""
        category_id = request.query_params.get('category_id')
        if not category_id:
            return Response({'error': 'Укажите category_id'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            category = Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            return Response({'error': 'Категория не найдена'}, status=status.HTTP_404_NOT_FOUND)
        
        units, default_unit = category.get_allowed_units()
        serializer = UnitListSerializer(units, many=True)
        return Response({
            'units': serializer.data,
            'default_unit_id': default_unit.id if default_unit else None
        })
    
    @action(detail=False, methods=['get'])
    def all_active(self, request):
        """Получить все активные единицы, сгруппированные"""
        groups = UnitGroup.objects.filter(is_active=True).prefetch_related('units')
        result = []
        for group in groups:
            units = group.units.filter(is_active=True)
            result.append({
                'id': group.id,
                'name': group.name,
                'slug': group.slug,
                'icon': group.icon,
                'units': UnitListSerializer(units, many=True).data
            })
        return Response(result)


class CategoryUnitViewSet(viewsets.ModelViewSet):
    """ViewSet для настройки допустимых единиц категорий"""
    queryset = CategoryUnit.objects.all()
    serializer_class = CategoryUnitSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminUser]
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Получить допустимые единицы для категории"""
        category_id = request.query_params.get('category_id')
        if not category_id:
            return Response({'error': 'Укажите category_id'}, status=status.HTTP_400_BAD_REQUEST)
        
        category_units = CategoryUnit.objects.filter(category_id=category_id).select_related('unit', 'unit__group')
        return Response(CategoryUnitSerializer(category_units, many=True).data)


class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet для категорий с поддержкой вложенности"""
    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['sort_order', 'name', 'created_at']
    ordering = ['sort_order', 'name']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return super().get_permissions()

    def get_serializer_class(self):
        if self.action == 'list':
            if self.request.query_params.get('units') == 'true':
                return CategoryWithUnitsSerializer
            # Проверяем, нужно ли дерево
            if self.request.query_params.get('tree') == 'true':
                return CategoryTreeSerializer
            return CategoryListSerializer
        return CategorySerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Фильтрация по родительской категории
        parent_id = self.request.query_params.get('parent')
        if parent_id:
            if parent_id == 'null':
                queryset = queryset.filter(parent__isnull=True)
            else:
                queryset = queryset.filter(parent_id=parent_id)
        
        # В админке показываем все категории
        if self.request.user.is_authenticated and self.request.user.is_admin:
            return Category.objects.all()
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def tree(self, request):
        """Получить дерево категорий"""
        # Только корневые категории
        categories = Category.objects.filter(parent__isnull=True, is_active=True)
        serializer = CategoryTreeSerializer(categories, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def flat(self, request):
        """Получить плоский список всех категорий"""
        categories = Category.objects.filter(is_active=True).order_by('sort_order', 'name')
        serializer = CategoryListSerializer(categories, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def children(self, request, pk=None):
        """Получить дочерние категории"""
        category = self.get_object()
        children = category.children.filter(is_active=True)
        serializer = CategoryListSerializer(children, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def breadcrumbs(self, request, pk=None):
        """Получить хлебные крошки для категории"""
        category = self.get_object()
        path = []
        current = category
        while current:
            path.insert(0, {
                'id': current.id,
                'name': current.name,
                'slug': current.slug
            })
            current = current.parent
        return Response(path)


class ProductFieldViewSet(viewsets.ModelViewSet):
    """ViewSet для полей товаров"""
    queryset = ProductField.objects.all()
    serializer_class = ProductFieldSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminUser]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'slug']
    ordering_fields = ['sort_order', 'name', 'field_type']
    ordering = ['sort_order', 'name']
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Получить поля для категории (включая родительские)"""
        category_id = request.query_params.get('category_id')
        if not category_id:
            return Response({'error': 'Укажите category_id'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            category = Category.objects.get(id=category_id)
        except Category.DoesNotExist:
            return Response({'error': 'Категория не найдена'}, status=status.HTTP_404_NOT_FOUND)
        
        fields = category.get_all_fields()
        serializer = ProductFieldSerializer(fields, many=True)
        return Response(serializer.data)


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'has_discount']
    search_fields = ['name', 'category__name']
    ordering_fields = ['id', 'name', 'price', 'quantity', 'created_at']
    ordering = ['-created_at']
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAdminUser()]
        return super().get_permissions()
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateSerializer
        return ProductSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        products = Product.objects.all()
        total_products = products.count()
        total_value = sum(p.total for p in products)
        categories_count = Category.objects.count()
        
        # Общая статистика для админ-панели
        from users.models import User
        from requests.models import ProductRequest
        
        return Response({
            'total_products': total_products,
            'total_value': round(total_value, 2),
            'categories_count': categories_count,
            'users_count': User.objects.count(),
            'pending_requests': ProductRequest.objects.filter(status='pending').count(),
        })

    @action(detail=False, methods=['get'], url_path='by-user/(?P<user_id>[^/.]+)')
    def by_user(self, request, user_id=None):
        """Получить товары пользователя"""
        products = self.queryset.filter(user_id=user_id)
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)
