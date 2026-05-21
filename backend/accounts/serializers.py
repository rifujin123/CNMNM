from rest_framework import serializers

from .models import User, ProviderProfile


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
        model = User
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
        user = User(**validated_data)
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

class UserReadSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    is_verified_provider = serializers.SerializerMethodField()

    def get_role(self, obj):
        if obj.is_staff:
            return 'Admin'
        if obj.is_provider:
            return 'Provider'
        return 'Customer'

    def get_is_verified_provider(self, obj):
        profile = getattr(obj, 'provider_profile', None)
        return bool(obj.is_approved or (profile and profile.is_verified))

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'first_name',
            'last_name',
            'avatar',
            'is_customer',
            'is_provider',
            'is_approved',
            'role',
            'is_verified_provider',
        ]


class ProviderProfileReadSerializer(serializers.ModelSerializer):
    business_license_url = serializers.SerializerMethodField()

    class Meta:
        model = ProviderProfile
        fields = [
            "business_name",
            "tax_code",
            "business_license",
            "business_license_url",
            "is_verified",
            "is_rejected",
            "created_at",
        ]

    def get_business_license_url(self, obj):
        request = self.context.get("request")
        if not obj.business_license:
            return None

        url = obj.business_license.url
        return request.build_absolute_uri(url) if request else url


class PendingProviderReadSerializer(UserReadSerializer):
    provider_profile = ProviderProfileReadSerializer(read_only=True)

    class Meta(UserReadSerializer.Meta):
        fields = UserReadSerializer.Meta.fields + [
            "provider_profile",
        ]

class MeUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "date_of_birth", "avatar", "username", "email"]


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True, min_length=8)

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value

    def validate(self, data):
        if data["old_password"] == data["new_password"]:
            raise serializers.ValidationError(
                {"new_password": "New password cannot be same as old password."}
            )
        return data

    def save(self):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user


class ProviderApprovalSerializer(serializers.Serializer):
    approved = serializers.BooleanField()
