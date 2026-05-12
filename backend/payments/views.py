from django.http import HttpResponse
from django.urls import reverse
from django.utils.html import escape
from rest_framework import status, viewsets, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Payment
from .serializers import PaymentReadSerializer, PaymentCreateSerializer
from .payServices.payment_service import complete_mock_gateway_payment


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related(
        'user', 
        'booking',
        'booking__service',
        'booking__service__provider'
    )
    
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ['get', 'post', 'head', 'options']

    def get_queryset(self):
        user = self.request.user

        if user.is_staff or user.is_superuser:
            return self.queryset

        if user.is_provider and user.is_approved:
            return self.queryset.filter(
                booking__service__provider_id=user.id
            )

        if user.is_customer:
            return self.queryset.filter(
                user_id=user.id
            )

        return Payment.objects.none()

    def get_serializer_class(self):
        if self.action == "create":
            return PaymentCreateSerializer

        return PaymentReadSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data )
        serializer.is_valid(raise_exception=True)

        payment = serializer.save(user=request.user)

        read_serializer = PaymentReadSerializer(payment,context=self.get_serializer_context())
        
        return Response(read_serializer.data, status=status.HTTP_201_CREATED)


