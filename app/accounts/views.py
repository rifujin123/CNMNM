from oauth2_provider.models import AccessToken,RefreshToken
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import RegisterSerializer

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