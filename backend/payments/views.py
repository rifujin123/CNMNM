from rest_framework import viewsets, permissions
from .models import Payment
from .serializers import PaymentReadSerializer, PaymentCreateSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.select_related(
        'user', 
        'booking',
        'booking__service',
        'booking__service__provider')
    
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
        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        booking_id = serializer.validated_data["booking_id"]
        payment_method = serializer.validated_data["payment_method"]

        booking = Booking.objects.get(
            id=booking_id
        )

        payment = create_payment_for_booking(
            booking=booking,
            user=request.user,
            payment_method=payment_method
        )

        read_serializer = PaymentReadSerializer(
            payment,
            context={"request": request}
        )

        return Response(
            read_serializer.data,
            status=status.HTTP_201_CREATED
        )