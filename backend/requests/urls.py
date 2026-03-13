from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductRequestViewSet, CategoryRequestViewSet

router = DefaultRouter()
router.register(r'products', ProductRequestViewSet)
router.register(r'categories', CategoryRequestViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
