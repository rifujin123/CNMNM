from django.contrib.auth import authenticate
from rest_framework import serializers

from .models import CustomUser, ProviderProfile


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        user = authenticate(
            username=attrs['username'],
            password=attrs['password'],
        )
        if not user:
            raise serializers.ValidationError(
                'Tên đăng nhập hoặc mật khẩu không đúng.'
            )
        if not user.is_active:
            raise serializers.ValidationError('Tài khoản đã bị vô hiệu hóa.')
        attrs['user'] = user
        return attrs


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    # Flat fields — multipart/form-data dễ gửi kèm file hơn nested JSON
    provider_business_name = serializers.CharField(
        write_only=True, required=False, allow_blank=True
    )
    provider_tax_code = serializers.CharField(
        write_only=True, required=False, allow_blank=True
    )
    business_license = serializers.ImageField(write_only=True, required=False)

    class Meta:
        model = CustomUser
        fields = [
            'username',
            'email',
            'password',
            'first_name',
            'last_name',
            'date_of_birth',
            'avatar',
            'is_provider',
            'is_customer',
            'provider_business_name',
            'provider_tax_code',
            'business_license',
        ]

    def validate(self, attrs):
        if attrs.get('is_provider'):
            if not attrs.get('provider_business_name'):
                raise serializers.ValidationError(
                    {'provider_business_name': 'Tên doanh nghiệp là bắt buộc.'}
                )
            if not attrs.get('provider_tax_code'):
                raise serializers.ValidationError(
                    {'provider_tax_code': 'Mã số thuế là bắt buộc.'}
                )
            if not attrs.get('business_license'):
                raise serializers.ValidationError(
                    {'business_license': 'Giấy phép kinh doanh là bắt buộc.'}
                )
        return attrs

    def create(self, validated_data):
        provider_business_name = validated_data.pop('provider_business_name', '') or ''
        provider_tax_code = validated_data.pop('provider_tax_code', '') or ''
        business_license = validated_data.pop('business_license', None)
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        if user.is_provider:
            ProviderProfile.objects.create(
                user=user,
                business_name=provider_business_name.strip(),
                tax_code=provider_tax_code.strip(),
                business_license=business_license,
            )
        return user
