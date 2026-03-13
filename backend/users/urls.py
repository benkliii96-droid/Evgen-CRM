from django.urls import path
from .views import UserViewSet, register_view, login_view, logout_view, me_view, toggle_theme_view
from rest_framework.routers import DefaultRouter

urlpatterns = [
    path('register/', register_view, name='register'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('me/', me_view, name='me'),
    path('toggle-theme/', toggle_theme_view, name='toggle-theme'),
    path('users/', UserViewSet.as_view({'get': 'list', 'post': 'create'}), name='users'),
    path('users/<int:pk>/', UserViewSet.as_view({'get': 'retrieve', 'put': 'update', 'patch': 'partial_update', 'delete': 'destroy'}), name='user-detail'),
]
