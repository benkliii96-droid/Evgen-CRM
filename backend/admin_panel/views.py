from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.core.paginator import Paginator
from django.contrib import messages
from django.db.models import Q, Count

from users.models import User
from products.models import Product, Category
from requests.models import ProductRequest, CategoryRequest


def admin_login(request):
    """Страница входа в админ панель"""
    if request.user.is_authenticated and request.user.is_admin:
        return redirect('admin:dashboard')
    
    if request.method == 'POST':
        from django.contrib.auth import authenticate, login
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        if user and user.is_admin:
            login(request, user)
            return redirect('admin:dashboard')
        else:
            messages.error(request, 'Неверные учетные данные или недостаточно прав')
    
    return render(request, 'admin/login.html')


def admin_required(view_func):
    """Декоратор для проверки прав администратора"""
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return redirect('admin:login')
        if not request.user.is_admin:
            return redirect('/')
        return view_func(request, *args, **kwargs)
    return wrapper


@admin_required
def dashboard(request):
    """Главная страница админ панели"""
    stats = {
        'users_count': User.objects.count(),
        'products_count': Product.objects.count(),
        'categories_count': Category.objects.count(),
        'pending_product_requests': ProductRequest.objects.filter(status='pending').count(),
        'pending_category_requests': CategoryRequest.objects.filter(status='pending').count(),
    }
    return render(request, 'admin/dashboard.html', {'stats': stats})


@admin_required
def users_list(request):
    """Список пользователей"""
    search = request.GET.get('search', '')
    role_filter = request.GET.get('role', '')
    
    users = User.objects.all()
    
    if search:
        users = users.filter(
            Q(username__icontains=search) | 
            Q(email__icontains=search) |
            Q(first_name__icontains=search) |
            Q(last_name__icontains=search)
        )
    
    if role_filter:
        users = users.filter(role=role_filter)
    
    paginator = Paginator(users, 20)
    page = request.GET.get('page', 1)
    users = paginator.get_page(page)
    
    return render(request, 'admin/users.html', {
        'users': users,
        'search': search,
        'role_filter': role_filter,
    })


@admin_required
def products_list(request):
    """Список товаров"""
    search = request.GET.get('search', '')
    category_filter = request.GET.get('category', '')
    
    products = Product.objects.select_related('category').all()
    
    if search:
        products = products.filter(
            Q(name__icontains=search) | 
            Q(description__icontains=search)
        )
    
    if category_filter:
        products = products.filter(category_id=category_filter)
    
    paginator = Paginator(products, 20)
    page = request.GET.get('page', 1)
    products = paginator.get_page(page)
    
    categories = Category.objects.all()
    
    return render(request, 'admin/products.html', {
        'products': products,
        'categories': categories,
        'search': search,
        'category_filter': category_filter,
    })


@admin_required
def categories_list(request):
    """Список категорий"""
    categories = Category.objects.annotate(product_count=Count('products'))
    
    search = request.GET.get('search', '')
    if search:
        categories = categories.filter(name__icontains=search)
    
    paginator = Paginator(categories, 20)
    page = request.GET.get('page', 1)
    categories = paginator.get_page(page)
    
    return render(request, 'admin/categories.html', {
        'categories': categories,
        'search': search,
    })


@admin_required
def product_requests(request):
    """Запросы на добавление товаров"""
    status_filter = request.GET.get('status', '')
    
    requests_list = ProductRequest.objects.select_related('user', 'category')
    
    if status_filter:
        requests_list = requests_list.filter(status=status_filter)
    
    paginator = Paginator(requests_list, 20)
    page = request.GET.get('page', 1)
    requests_list = paginator.get_page(page)
    
    return render(request, 'admin/product_requests.html', {
        'requests': requests_list,
        'status_filter': status_filter,
    })


@admin_required
def category_requests(request):
    """Запросы на добавление категорий"""
    status_filter = request.GET.get('status', '')
    
    requests_list = CategoryRequest.objects.select_related('user')
    
    if status_filter:
        requests_list = requests_list.filter(status=status_filter)
    
    paginator = Paginator(requests_list, 20)
    page = request.GET.get('page', 1)
    requests_list = paginator.get_page(page)
    
    return render(request, 'admin/category_requests.html', {
        'requests': requests_list,
        'status_filter': status_filter,
    })


@admin_required
@require_POST
def approve_product_request(request, request_id):
    """Одобрение запроса на товар"""
    pr = get_object_or_404(ProductRequest, id=request_id)
    
    product = Product.objects.create(
        name=pr.name,
        category=pr.category,
        unit=pr.unit,
        quantity=pr.quantity,
        price=pr.price,
        has_discount=pr.has_discount,
        discount_percent=pr.discount_percent,
        description=pr.description,
        image=pr.image,
    )
    
    pr.status = 'approved'
    pr.save()
    
    messages.success(request, f'Товар "{product.name}" успешно создан')
    return redirect('admin:product_requests')


@admin_required
@require_POST
def reject_product_request(request, request_id):
    """Отклонение запроса на товар"""
    pr = get_object_or_404(ProductRequest, id=request_id)
    pr.status = 'rejected'
    pr.admin_comment = request.POST.get('comment', '')
    pr.save()
    
    messages.success(request, f'Запрос на товар "{pr.name}" отклонен')
    return redirect('admin:product_requests')


@admin_required
@require_POST
def approve_category_request(request, request_id):
    """Одобрение запроса на категорию"""
    cr = get_object_or_404(CategoryRequest, id=request_id)
    
    category = Category.objects.create(name=cr.name)
    
    cr.status = 'approved'
    cr.save()
    
    messages.success(request, f'Категория "{category.name}" успешно создана')
    return redirect('admin:category_requests')


@admin_required
@require_POST
def reject_category_request(request, request_id):
    """Отклонение запроса на категорию"""
    cr = get_object_or_404(CategoryRequest, id=request_id)
    cr.status = 'rejected'
    cr.admin_comment = request.POST.get('comment', '')
    cr.save()
    
    messages.success(request, f'Запрос на категорию "{cr.name}" отклонен')
    return redirect('admin:category_requests')


@admin_required
@require_POST
def delete_product(request, product_id):
    """Удаление товара"""
    product = get_object_or_404(Product, id=product_id)
    name = product.name
    product.delete()
    
    messages.success(request, f'Товар "{name}" удален')
    return redirect('admin:products')


@admin_required
@require_POST
def delete_user(request, user_id):
    """Удаление пользователя"""
    user = get_object_or_404(User, id=user_id)
    if user == request.user:
        messages.error(request, 'Нельзя удалить самого себя')
        return redirect('admin:users')
    
    username = user.username
    user.delete()
    
    messages.success(request, f'Пользователь "{username}" удален')
    return redirect('admin:users')


@admin_required
@require_POST
def toggle_user_role(request, user_id):
    """Изменение роли пользователя"""
    user = get_object_or_404(User, id=user_id)
    
    if user == request.user:
        messages.error(request, 'Нельзя изменить свою роль')
        return redirect('admin:users')
    
    user.role = 'admin' if user.role == 'user' else 'user'
    user.save()
    
    messages.success(request, f'Роль пользователя "{user.username}" изменена на {user.get_role_display()}')
    return redirect('admin:users')
