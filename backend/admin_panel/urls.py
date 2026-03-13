from django.urls import path
from . import views

app_name = 'admin'

urlpatterns = [
    path('login/', views.admin_login, name='login'),
    path('', views.dashboard, name='dashboard'),
    path('users/', views.users_list, name='users'),
    path('products/', views.products_list, name='products'),
    path('categories/', views.categories_list, name='categories'),
    path('requests/products/', views.product_requests, name='product_requests'),
    path('requests/categories/', views.category_requests, name='category_requests'),
    
    path('requests/products/<int:request_id>/approve/', views.approve_product_request, name='approve_product_request'),
    path('requests/products/<int:request_id>/reject/', views.reject_product_request, name='reject_product_request'),
    path('requests/categories/<int:request_id>/approve/', views.approve_category_request, name='approve_category_request'),
    path('requests/categories/<int:request_id>/reject/', views.reject_category_request, name='reject_category_request'),
    
    path('products/<int:product_id>/delete/', views.delete_product, name='delete_product'),
    path('users/<int:user_id>/delete/', views.delete_user, name='delete_user'),
    path('users/<int:user_id>/toggle-role/', views.toggle_user_role, name='toggle_user_role'),
]
