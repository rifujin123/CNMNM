from oauth2_provider.models import AccessToken,RefreshToken
import os
import time
import cloudinary.utils
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import viewsets
from rest_framework.decorators import action

from .models import User
from .serializers import (
    ChangePasswordSerializer,
    MeUpdateSerializer,
    ProviderApprovalSerializer,
    RegisterSerializer,
    UserReadSerializer,
    PendingProviderReadSerializer,
)

# Create your views here.
class AccountViewSet(viewsets.ViewSet):
    def get_permissions(self):
        if self.action in ['register', 'cloudinary_sign']:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(
        detail=False,
        methods=['post'],
        url_path='register',
        authentication_classes=[],
    )
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            {
                'detail': 'Đăng ký thành công.',
                'user_id': user.id,
                'username': user.username,
                'role': 'Provider' if user.is_provider else 'Customer',
            },
            status=status.HTTP_201_CREATED,
        )


    @action(detail=False, methods=['post'], url_path='logout')
    def logout(self, request):
        token = request.auth
        if not token:
            return Response({'detail': 'Không tìm thấy token.'}, status=status.HTTP_400_BAD_REQUEST)
        token = AccessToken.objects.filter(token=token).first()
        if not token:
            return Response({'detail': 'Không tìm thấy token.'}, status=status.HTTP_400_BAD_REQUEST)
        RefreshToken.objects.filter(access_token=token).delete()
        token.delete()
        return Response({'detail': 'Đăng xuất thành công.'}, status=status.HTTP_200_OK)


    @action(detail=False, methods=['get', 'patch'], url_path='me')
    def me(self, request):
        if request.method == 'PATCH':
            serializer = MeUpdateSerializer(request.user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(UserReadSerializer(request.user).data, status=status.HTTP_200_OK)

        return Response(UserReadSerializer(request.user).data, status=status.HTTP_200_OK)


    @action(detail=False, methods=['post'], url_path='me/change-password')
    def change_password(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password changed successfully."}, status=status.HTTP_200_OK)


    @action(
        detail=False,
        methods=['post'],
        url_path='cloudinary/sign',
        authentication_classes=[],
    )
    def cloudinary_sign(self, request):
        folder = request.data.get('folder')
        timestamp = int(time.time())

        # Sign only params frontend actually sends to Cloudinary
        params = {
            'timestamp': timestamp,
            'folder': folder,
        }
        signature = cloudinary.utils.api_sign_request(
            params,
            os.getenv('CLOUDINARY_API_SECRET', '')
        )

        return Response({
            'timestamp': timestamp,
            'signature': signature,
            'apiKey': os.getenv('CLOUDINARY_API_KEY', ''),
            'cloudName': os.getenv('CLOUDINARY_CLOUD_NAME', ''),
            'folder': folder,
        }, status=status.HTTP_200_OK)


class ProviderAdminViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['get'], url_path='pending')
    def pending(self, request):
        queryset = User.objects.filter(is_provider=True, is_approved=False).exclude(provider_profile__is_rejected=True).select_related("provider_profile").order_by('-date_joined')
        return Response(PendingProviderReadSerializer(queryset, many=True).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], url_path='verification')
    def verification(self, request, pk=None):
        provider = User.objects.filter(id=pk, is_provider=True).first()
        if not provider:
            return Response({'detail': 'Không tìm thấy nhà cung cấp.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProviderApprovalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        approved = serializer.validated_data['approved']

        provider.is_approved = approved
        provider.save(update_fields=['is_approved'])

        profile = getattr(provider, 'provider_profile', None)
        if profile:
            profile.is_verified = approved
            profile.is_rejected = not approved
            profile.save(update_fields=['is_verified', 'is_rejected'])

        return Response(
            {
                'provider_id': provider.id,
                'approved': approved,
            },
            status=status.HTTP_200_OK,
        )
