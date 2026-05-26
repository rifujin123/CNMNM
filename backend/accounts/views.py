from oauth2_provider.models import AccessToken,RefreshToken
import os
import time
import cloudinary.utils
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from rest_framework.permissions import IsAdminUser

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
class RegisterView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
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


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        token = request.auth
        if not token:
            return Response({'detail': 'Không tìm thấy token.'}, status=status.HTTP_400_BAD_REQUEST)
        token = AccessToken.objects.filter(token=token).first()
        RefreshToken.objects.filter(access_token=token).delete()
        token.delete()
        return Response({'detail': 'Đăng xuất thành công.'}, status=status.HTTP_200_OK)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserReadSerializer(request.user).data, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = MeUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserReadSerializer(request.user).data, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"detail": "Password changed successfully."}, status=status.HTTP_200_OK)


class PendingProviderListView(ListAPIView):
    permission_classes = [IsAdminUser]
    serializer_class = PendingProviderReadSerializer

    def get_queryset(self):
        return (
            User.objects
            .filter(
                is_provider=True,
                is_approved=False,
                provider_profile__is_rejected=False,
            )
            .select_related('provider_profile')
            .order_by('-date_joined')
        )


class ProviderVerificationView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, provider_id):
        provider = User.objects.filter(id=provider_id, is_provider=True).first()
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


class CloudinarySignView(APIView):
    """Sign upload params for Cloudinary (server-side signature)."""
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        folder = request.data.get('folder') or os.getenv('CLOUDINARY_FOLDER', 'travel_app_uploads')
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
