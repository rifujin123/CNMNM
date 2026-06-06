import os
import time

import cloudinary.utils
from oauth2_provider.models import AccessToken, RefreshToken
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.viewsets import GenericViewSet

from .models import User
from .perms import IsAdmin
from .serializers import (
    ChangePasswordSerializer,
    MeUpdateSerializer,
    ProviderApprovalSerializer,
    RegisterSerializer,
    UserReadSerializer,
)


class AccountViewSet(GenericViewSet):
    """UC01-UC04: Register, Logout, Me, Change Password, Cloudinary."""

    def get_permissions(self):
        if self.action in ['register', 'cloudinary_sign']:
            return [AllowAny()]
        return [IsAuthenticated()]

    # UC01 - Register
    @action(detail=False, methods=['post'], url_path='register')
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                'detail': 'Registration successful.',
                'user_id': user.id,
                'username': user.username,
                'role': 'Provider' if user.is_provider else 'Customer',
            },
            status=status.HTTP_201_CREATED,
        )

    # UC02 - Logout
    @action(detail=False, methods=['post'], url_path='logout')
    def logout(self, request):
        token = request.auth
        if not token:
            return Response({'detail': 'Token not found.'}, status=status.HTTP_400_BAD_REQUEST)
        token_obj = AccessToken.objects.filter(token=token).first()
        if not token_obj:
            return Response({'detail': 'Token not found.'}, status=status.HTTP_400_BAD_REQUEST)
        RefreshToken.objects.filter(access_token=token_obj).delete()
        token_obj.delete()
        return Response({'detail': 'Logged out successfully.'}, status=status.HTTP_200_OK)

    # UC04 - Get/Update profile
    @action(detail=False, methods=['get', 'patch'], url_path='me')
    def me(self, request):
        if request.method == 'PATCH':
            serializer = MeUpdateSerializer(request.user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(UserReadSerializer(request.user).data, status=status.HTTP_200_OK)
        return Response(UserReadSerializer(request.user).data, status=status.HTTP_200_OK)

    # UC04 - Change password
    @action(detail=False, methods=['post'], url_path='me/change-password')
    def change_password(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'Password changed successfully.'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='cloudinary/sign')
    def cloudinary_sign(self, request):
        folder = request.data.get('folder')
        timestamp = int(time.time())
        params = {'timestamp': timestamp, 'folder': folder}
        signature = cloudinary.utils.api_sign_request(
            params, os.getenv('CLOUDINARY_API_SECRET', '')
        )
        return Response({
            'timestamp': timestamp,
            'signature': signature,
            'apiKey': os.getenv('CLOUDINARY_API_KEY', ''),
            'cloudName': os.getenv('CLOUDINARY_CLOUD_NAME', ''),
            'folder': folder,
        }, status=status.HTTP_200_OK)


# UC05 - Admin: manage provider accounts
class ProviderAdminViewSet(GenericViewSet):
    permission_classes = [IsAdmin]
    queryset = User.objects.filter(is_provider=True)

    @action(detail=False, methods=['get'], url_path='pending')
    def pending(self, request):
        queryset = User.objects.filter(is_provider=True, is_approved=False).order_by('-date_joined')
        return Response(UserReadSerializer(queryset, many=True).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], url_path='verify')
    def verify(self, request, pk=None):
        provider = self.get_object()
        serializer = ProviderApprovalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        approved = serializer.validated_data['approved']
        reason = serializer.validated_data.get('reason', '')

        provider.is_approved = approved
        provider.save(update_fields=['is_approved'])

        profile = getattr(provider, 'provider_profile', None)
        if profile:
            profile.is_verified = approved
            profile.save(update_fields=['is_verified'])

        return Response(
            {'provider_id': provider.id, 'approved': approved, 'reason': reason},
            status=status.HTTP_200_OK,
        )