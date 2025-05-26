import os
import sys

# Percorso del progetto
PROJECT_PATH = os.path.abspath(os.path.dirname(__file__))
VENV_PATH = '/var/www/vhosts/attraction.somos.srl/venv-maas'

# Aggiungi httpdocs al path
sys.path.insert(0, PROJECT_PATH)

# Imposta settings di Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Attiva virtualenv
activate_this = os.path.join(VENV_PATH, 'bin/activate_this.py')
if os.path.exists(activate_this):
    with open(activate_this) as file_:
        exec(file_.read(), dict(__file__=activate_this))

# Import finale obbligatorio
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()

