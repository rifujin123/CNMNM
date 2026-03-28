from contextvars import Token

from django.shortcuts import render
from requests import Response

# Create your views here.
class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            token, created = Token.objects.getOrCreatedAt(user=user)
            return Response({'Token': token.key})