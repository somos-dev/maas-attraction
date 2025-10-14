from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.shortcuts import redirect, render
from django.http import Http404

from rest_framework import generics, serializers, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
from .utils import send_html_email



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
            return render(request, "activation_success.html", {
                "success": False,
                "title": "Invalid Link",
                "message": "This activation link is invalid or malformed.",
            })

        if user.is_active:
            return render(request, "activation_success.html", {
                "success": False,
                "title": "Already Activated",
                "message": "Your account is already active. You can log in now.",
            })

        if getattr(user, 'is_banned', False):
            return render(request, "activation_success.html", {
                "success": False,
                "title": "Account Banned",
                "message": "Your account has been banned. Please contact support.",
            })

        if default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return render(request, "activation_success.html", {
                "success": True,
                "title": "Account Activated",
                "message": "Your account has been successfully activated. You can now log in.",
            })

        return render(request, "activation_success.html", {
            "success": False,
            "title": "Invalid or Expired Link",
            "message": "This activation link is invalid or has expired.",
        })
    
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
            return Response({"success": False, "error": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({
                "success": True,
                "message": "If an account with this email exists, a reset link has been sent.",
                "status_code": status.HTTP_200_OK
            }, status=status.HTTP_200_OK)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_link = f"https://attraction.somos.srl/api/auth/password-reset-confirm/{uid}/{token}/"

        send_html_email(
            user,
            subject="Reset Your Password",
            title="Reset Your Password",
            message="You requested a password reset. Click the button below to reset your password.",
            link=reset_link
        )

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


from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uidb64, token):
        # Decode user
        try:
            user_id = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return render(request, "password_reset_confirm.html", {
                "success": False,
                "title": "Invalid Link",
                "message": "The reset link is invalid or malformed.",
                "show_form": False
            })

        if not default_token_generator.check_token(user, token):
            return render(request, "password_reset_confirm.html", {
                "success": False,
                "title": "Expired Link",
                "message": "This reset link has expired.",
                "show_form": False
            })

        return render(request, "password_reset_confirm.html", {
            "success": None,
            "title": "Reset Your Password",
            "show_form": True,
            "uidb64": uidb64,
            "token": token
        })

    def post(self, request, uidb64, token):
        new_password = request.POST.get("new_password")
        try:
            user_id = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return render(request, "password_reset_confirm.html", {
                "success": False,
                "title": "Error",
                "message": "Invalid token or user ID.",
                "show_form": False
            })

        if not default_token_generator.check_token(user, token):
            return render(request, "password_reset_confirm.html", {
                "success": False,
                "title": "Invalid or Expired Token",
                "message": "This reset link is invalid or has expired.",
                "show_form": False
            })

        if getattr(user, 'is_banned', False):
            return render(request, "password_reset_confirm.html", {
                "success": False,
                "title": "User Banned",
                "message": "This user account is banned.",
                "show_form": False
            })

        # Set new password
        user.set_password(new_password)
        user.save()

        return render(request, "password_reset_confirm.html", {
            "success": True,
            "title": "Password Reset Successful",
            "message": "Your password has been reset successfully.",
            "show_form": False
        })



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

    def update(self, request, *args, **kwargs):
        if request.content_type != 'application/json':
            response = Response({
                "success": False,
                "error": "Unsupported media type",
                "status_code": status.HTTP_415_UNSUPPORTED_MEDIA_TYPE
            }, status=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)
            print("Response:", response.data)
            return response

        user = self.get_object()
        old_email = user.email
        partial = kwargs.pop('partial', False)
        serializer = self.get_serializer(user, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        new_email = serializer.validated_data.get('email', old_email)

        if new_email != old_email:
            self.send_email_change_confirmation(user, new_email)
            response = Response({
                "success": True,
                "message": f"Email change is pending. A confirmation email has been sent to {new_email}.",
                "status_code": status.HTTP_200_OK
            })
            print("Response:", response.data)
            return response

        self.perform_update(serializer)
        response = Response({
            "success": True,
            "message": "User profile updated successfully",
            "data": serializer.data,
            "status_code": status.HTTP_200_OK
        })
        print("Response:", response.data)
        return response


    def send_email_change_confirmation(self, user, new_email):
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        encoded_new_email = urlsafe_base64_encode(force_bytes(new_email))
        confirm_link = f"https://attraction.somos.srl/api/auth/confirm-email-change/{uid}/{encoded_new_email}/{token}/"

        send_html_email(
            user,
            subject="Confirm Your New Email",
            title="Confirm Your New Email",
            message=f"Click the button below to confirm your new email address: {new_email}",
            link=confirm_link
        )


class ConfirmEmailChangeView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uidb64, new_email_b64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
            new_email = force_str(urlsafe_base64_decode(new_email_b64))
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            context = {
                "success": False,
                "title": "Invalid Link",
                "message": "The confirmation link is invalid or malformed."
            }
            return self._respond(request, context, status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            context = {
                "success": False,
                "title": "Invalid or Expired Link",
                "message": "The email confirmation link is invalid or has expired."
            }
            return self._respond(request, context, status.HTTP_400_BAD_REQUEST)

        # Update the email now
        user.email = new_email
        user.save()

        context = {
            "success": True,
            "title": "Email Changed Successfully",
            "message": "Email change is confirmed."
        }

        return self._respond(request, context, status.HTTP_200_OK)

    def _respond(self, request, context, http_status):
        """Return JSON if Accept header asks for application/json, else render HTML"""
        if request.headers.get("Accept") == "application/json":
            response = Response({
                "success": context["success"],
                "message": context["message"],
                "status_code": http_status
            }, status=http_status)
            print("Response:", response.data)  # prints JSON to console
            return response
        else:
            html_response = render(request, "email_change_result.html", context, status=http_status)
            print(f"HTML Response: {context['message']}")  # prints message for browser
            return html_response


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
