from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, ProductViewSet, ProductFieldViewSet, UnitGroupViewSet, UnitViewSet, CategoryUnitViewSet

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'products', ProductViewSet)
router.register(r'fields', ProductFieldViewSet)
router.register(r'unit-groups', UnitGroupViewSet)
router.register(r'units', UnitViewSet)
router.register(r'category-units', CategoryUnitViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
