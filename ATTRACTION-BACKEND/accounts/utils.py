from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.timezone import now

def send_html_email(user, subject, title, message, link=None):
    html_content = render_to_string(
        'email_template.html',
        {
            'subject': subject,
            'title': title,
            'message': message,
            'link': link,
            'year': now().year,
        }
    )
    
    email = EmailMultiAlternatives(
        subject=subject,
        body=message,  # fallback plain text
        from_email='noreply@somos.srl',
        to=[user.email]
    )
    email.attach_alternative(html_content, "text/html")
    email.send(fail_silently=False)
