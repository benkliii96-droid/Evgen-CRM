from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
import os

def react_serve(request, path='', **kwargs):
    """Отдаёт React билд - для SPA всегда отдаём index.html"""
    from django.http import FileResponse, Http404
    
    base_dir = os.path.join(settings.BASE_DIR.parent, 'frontend', 'dist')
    media_dir = settings.MEDIA_ROOT
    
    # Для API путей - 404
    if path.startswith('api/'):
        raise Http404("API not found")
    
    # Для медиа-файлов - отдаём если есть
    if path.startswith('media/') or path.startswith('products/') or path.startswith('avatars/') or path.startswith('requests/'):
        # Убираем префикс media/ если есть
        file_path = path
        if file_path.startswith('media/'):
            file_path = file_path[6:]
        
        full_path = os.path.join(media_dir, file_path)
        if os.path.exists(full_path) and os.path.isfile(full_path):
            # Определяем content-type по расширению
            content_type = 'application/octet-stream'
            if path.endswith('.jpg') or path.endswith('.jpeg'):
                content_type = 'image/jpeg'
            elif path.endswith('.png'):
                content_type = 'image/png'
            elif path.endswith('.gif'):
                content_type = 'image/gif'
            elif path.endswith('.webp'):
                content_type = 'image/webp'
            elif path.endswith('.svg'):
                content_type = 'image/svg+xml'
            return FileResponse(open(full_path, 'rb'), content_type=content_type)
        raise Http404("Media not found")
    
    # Для статических файлов - отдаём если есть
    if '.' in path.split('/')[-1]:
        file_path = os.path.join(base_dir, path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            # Определяем content-type
            content_type = 'application/octet-stream'
            if path.endswith('.js'):
                content_type = 'application/javascript'
            elif path.endswith('.css'):
                content_type = 'text/css'
            elif path.endswith('.html'):
                content_type = 'text/html'
            elif path.endswith('.svg'):
                content_type = 'image/svg+xml'
            return FileResponse(open(file_path, 'rb'), content_type=content_type)
    
    # Для SPA - всегда отдаём index.html
    index_path = os.path.join(base_dir, 'index.html')
    if os.path.exists(index_path):
        return FileResponse(open(index_path, 'rb'), content_type='text/html')
    
    raise Http404("Not found")

urlpatterns = [
    path('api/auth/', include('users.urls')),
    path('api/', include('products.urls')),
    path('api/requests/', include('requests.urls')),
    path('', react_serve, name='index'),
    path('<path:path>', react_serve, name='react_app'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
