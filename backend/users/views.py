from rest_framework import viewsets, status, permissions
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator
from .serializers import UserSerializer, UserCreateSerializer
from .authentication import TokenAuthentication

User = get_user_model()


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_admin


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAdminUser]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register_view(request):
    serializer = UserCreateSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        token = user.generate_token()
        return Response({
            'user': UserSerializer(user).data,
            'token': token,
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response({'error': 'Введите логин и пароль'}, status=status.HTTP_400_BAD_REQUEST)
    
    user = authenticate(username=username, password=password)
    
    if user:
        token = user.generate_token()
        return Response({
            'user': UserSerializer(user).data,
            'token': token,
        })
    return Response({'error': 'Неверные учетные данные'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def logout_view(request):
    user = request.user
    if user.is_authenticated:
        user.auth_token = None
        user.save()
    return Response({'success': True})


@api_view(['GET'])
def me_view(request):
    if not request.user.is_authenticated:
        return Response({'error': 'Не авторизован'}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(UserSerializer(request.user).data)


@api_view(['POST'])
def toggle_theme_view(request):
    """Переключение темы для админ панели"""
    dark_mode = request.session.get('dark_mode', False)
    request.session['dark_mode'] = not dark_mode
    return Response({'dark_mode': request.session['dark_mode']})
