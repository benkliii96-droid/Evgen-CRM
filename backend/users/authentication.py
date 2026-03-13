from rest_framework import authentication, exceptions
from django.contrib.auth import get_user_model

User = get_user_model()


class TokenAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header:
            return None
        
        if not auth_header.startswith('Token '):
            return None
        
        token = auth_header.split(' ')[1]
        
        try:
            user = User.objects.get(auth_token=token)
            return (user, None)
        except User.DoesNotExist:
            raise exceptions.AuthenticationFailed('Неверный токен')
