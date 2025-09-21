from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.shortcuts import redirect
from django.http import Http404

from rest_framework import generics, serializers, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError

from .models import CustomUser
from .serializers import RegisterSerializer, UserProfileSerializer

User = get_user_model()


# ------------------------------
# User Registration
# ------------------------------
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        try:
            response = super().create(request, *args, **kwargs)
            return Response({
                "success": True,
                "message": "User registered successfully",
                "data": response.data,
                "status_code": status.HTTP_201_CREATED
            }, status=status.HTTP_201_CREATED)
        except serializers.ValidationError as e:
            return Response({
                "success": False,
                "error": e.detail,
                "status_code": status.HTTP_400_BAD_REQUEST
            }, status=status.HTTP_400_BAD_REQUEST)


# ------------------------------
# Account Activation
# ------------------------------
class ActivateAccountView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({
                "success": False,
                "error": "Invalid user ID.",
                "status_code": status.HTTP_400_BAD_REQUEST
            }, status=status.HTTP_400_BAD_REQUEST)

        if user.is_active:
            return Response({
                "success": False,
                "error": "Account already activated.",
                "status_code": status.HTTP_400_BAD_REQUEST
            }, status=status.HTTP_400_BAD_REQUEST)

        if default_token_generator.check_token(user, token):
            if getattr(user, 'is_banned', False):
                return Response({
                    "success": False,
                    "error": "User is banned.",
                    "status_code": status.HTTP_403_FORBIDDEN
                }, status=status.HTTP_403_FORBIDDEN)

            user.is_active = True
            user.save()
            return Response({
                "success": True,
                "message": "Account activated successfully",
                "status_code": status.HTTP_200_OK
            }, status=status.HTTP_200_OK)

        return Response({
            "success": False,
            "error": "Activation link is invalid",
            "status_code": status.HTTP_400_BAD_REQUEST
        }, status=status.HTTP_400_BAD_REQUEST)
    
# ------------------------------
# Password Reset Request
# ------------------------------
class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]
    serializer_class = PasswordResetRequestSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "error": serializer.errors,
                "status_code": status.HTTP_400_BAD_REQUEST
            }, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']

        try:
            user = User.objects.get(email=email)
            if getattr(user, 'is_banned', False):
                return Response({
                    "success": False,
                    "error": "User is banned.",
                    "status_code": status.HTTP_403_FORBIDDEN
                }, status=status.HTTP_403_FORBIDDEN)
        except User.DoesNotExist:
            # Do not reveal whether email exists
            return Response({
                "success": True,
                "message": "If an account with this email exists, a reset link has been sent.",
                "status_code": status.HTTP_200_OK
            }, status=status.HTTP_200_OK)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"https://attraction.somos.srl/api/auth/password-reset-confirm/{uid}/{token}/"

        subject = "Password Reset Requested"
        message = f"Click the link to reset your password:\n{reset_link}"
        send_mail(subject, message, 'noreply@yourdomain.com', [email])

        return Response({
            "success": True,
            "message": "If an account with this email exists, a reset link has been sent.",
            "status_code": status.HTTP_200_OK
        }, status=status.HTTP_200_OK)


# ------------------------------
# Password Reset Confirmation
# ------------------------------
class PasswordResetConfirmSerializer(serializers.Serializer):
    new_password = serializers.CharField(min_length=8)


class PasswordResetConfirmView(APIView):
    serializer_class = PasswordResetConfirmSerializer
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        serializer = self.serializer_class(data=request.data)
        if not serializer.is_valid():
            return Response({
                "success": False,
                "error": serializer.errors,
                "status_code": status.HTTP_400_BAD_REQUEST
            }, status=status.HTTP_400_BAD_REQUEST)

        new_password = serializer.validated_data['new_password']

        try:
            user_id = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({
                "success": False,
                "error": "Invalid token or user ID.",
                "status_code": status.HTTP_400_BAD_REQUEST
            }, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({
                "success": False,
                "error": "Invalid or expired token.",
                "status_code": status.HTTP_400_BAD_REQUEST
            }, status=status.HTTP_400_BAD_REQUEST)

        if getattr(user, 'is_banned', False):
            return Response({
                "success": False,
                "error": "User is banned.",
                "status_code": status.HTTP_403_FORBIDDEN
            }, status=status.HTTP_403_FORBIDDEN)

        user.set_password(new_password)
        user.save()

        return Response({
            "success": True,
            "message": "Password reset successful.",
            "status_code": status.HTTP_200_OK
        }, status=status.HTTP_200_OK)


# ------------------------------
# User Profile
# ------------------------------
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        user = getattr(self.request, 'user', None)
        if not user:
            raise Http404
        return user

    def retrieve(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user)
        return Response({
            "success": True,
            "message": "User profile retrieved successfully",
            "data": serializer.data,
            "status_code": status.HTTP_200_OK
        }, status=status.HTTP_200_OK)

    def update(self, request, *args, **kwargs):
        if request.content_type != 'application/json':
            return Response({
                "success": False,
                "error": "Unsupported media type",
                "status_code": status.HTTP_415_UNSUPPORTED_MEDIA_TYPE
            }, status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)

        partial = kwargs.pop('partial', False)
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response({
            "success": True,
            "message": "User profile updated successfully",
            "data": serializer.data,
            "status_code": status.HTTP_200_OK
        }, status=status.HTTP_200_OK)


# ------------------------------
# Logout
# ------------------------------
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({
                "success": False,
                "error": "Refresh token required.",
                "status_code": status.HTTP_400_BAD_REQUEST
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({
                "success": True,
                "message": "Successfully logged out.",
                "status_code": status.HTTP_205_RESET_CONTENT
            }, status=status.HTTP_205_RESET_CONTENT)
        except TokenError:
            return Response({
                "success": False,
                "error": "Invalid token.",
                "status_code": status.HTTP_400_BAD_REQUEST
            }, status=status.HTTP_400_BAD_REQUEST)


# ------------------------------
# HTTP Status Demo (All Codes)
# ------------------------------
class HttpStatusDemoView(APIView):
    permission_classes = []  # public access for testing

    STATUS_MESSAGES = {
        200: "OK - Request succeeded",
        201: "Created - Resource created",
        202: "Accepted - Processing later",
        204: "No Content - Success, no response body",
        301: "Moved Permanently - Permanent redirect",
        302: "Found - Temporary redirect",
        304: "Not Modified - Cached resource still valid",
        400: "Bad Request - Invalid request",
        401: "Unauthorized - Not authenticated",
        403: "Forbidden - Authenticated but not allowed",
        404: "Not Found - Resource missing",
        405: "Method Not Allowed - Wrong HTTP method",
        408: "Request Timeout - Client too slow",
        409: "Conflict - Resource conflict",
        413: "Payload Too Large - Request body too big",
        415: "Unsupported Media Type - Wrong content type",
        429: "Too Many Requests - Rate limit exceeded",
        500: "Internal Server Error - Generic server error",
        502: "Bad Gateway - Upstream server error",
        503: "Service Unavailable - Server down/overloaded",
        504: "Gateway Timeout - Upstream service timeout",
    }

    def get(self, request):
        try:
            code = int(request.query_params.get("code", 200))
            message = self.STATUS_MESSAGES.get(code, "Unknown status code")

            if code in [301, 302]:
                return redirect(redirect_to="/", permanent=(code == 301))

            if code == 204:
                return Response(status=204)

            return Response({
                "success": code < 400,
                "message": message,
                "error": None if code < 400 else message,
                "data": None,
                "status_code": code
            }, status=code)
        except ValueError:
            return Response({
                "success": False,
                "error": "Invalid code parameter",
                "status_code": status.HTTP_400_BAD_REQUEST
            }, status=status.HTTP_400_BAD_REQUEST)
