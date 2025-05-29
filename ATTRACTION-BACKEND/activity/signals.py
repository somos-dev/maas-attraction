from django.contrib.auth.signals import user_logged_in
from django.dispatch import receiver
from django.contrib.sessions.models import Session
from .models import Search

@receiver(user_logged_in)
def merge_anonymous_searches(sender, user, request, **kwargs):
    session_key = request.session.session_key
    if session_key:
        # Update all anonymous Search entries with this session key to be owned by the user
        Search.objects.filter(anonymous_session_key=session_key, user__isnull=True).update(user=user, anonymous_session_key=None)
