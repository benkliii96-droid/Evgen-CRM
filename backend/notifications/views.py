from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer
from users.authentication import TokenAuthentication


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            # Админ видит все уведомления
            return Notification.objects.all()
        # Пользователь видит только свои уведомления
        return Notification.objects.filter(user=user)
    
    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Количество непрочитанных уведомлений"""
        user = request.user
        if user.is_admin:
            count = Notification.objects.filter(is_read=False).count()
        else:
            count = Notification.objects.filter(user=user, is_read=False).count()
        return Response({'unread_count': count})
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Отметить уведомление как прочитанное"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'ok'})
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Отметить все уведомления как прочитанные"""
        user = request.user
        if user.is_admin:
            Notification.objects.filter(is_read=False).update(is_read=True)
        else:
            Notification.objects.filter(user=user, is_read=False).update(is_read=True)
        return Response({'status': 'ok'})
    
    @action(detail=False, methods=['delete'])
    def clear_all(self, request):
        """Очистить все уведомления"""
        user = request.user
        if user.is_admin:
            Notification.objects.all().delete()
        else:
            Notification.objects.filter(user=user).delete()
        return Response({'status': 'ok'})
