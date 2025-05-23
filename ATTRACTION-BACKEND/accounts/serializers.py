from rest_framework import serializers
from .models import CustomUser
from django.contrib.auth.password_validation import validate_password
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'codice_fiscale', 'password', 'confirm_password']

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError("Passwords do not match.")
        validate_password(data['password'])
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        
        # Create user as inactive
        user = CustomUser.objects.create_user(**validated_data)
        user.is_active = False
        user.save()

        # Send confirmation email
        self.send_activation_email(user)
        return user

    def send_activation_email(self, user):
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        activation_link = f"http://localhost:8000/api/auth/activate/{uid}/{token}/"

        subject = "Activate your account"
        message = f"Hi {user.username},\n\nPlease click the link below to activate your account:\n{activation_link}"

        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )

from rest_framework import serializers

class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

from django.contrib.auth.password_validation import validate_password

class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value
