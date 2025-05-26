import sys
import os

# Percorso assoluto della root del sito (httpdocs)
PROJECT_PATH = os.path.abspath(os.path.dirname(__file__))

# Percorso virtualenv fuori da httpdocs
VENV_PATH = '/var/www/vhosts/attraction.somos.srl/venv-maas'

# Aggiungi il progetto al sys.path
sys.path.insert(0, PROJECT_PATH)

# Imposta il modulo settings di Django
os.environ['DJANGO_SETTINGS_MODULE'] = 'backend.settings'

# Attiva la virtualenv
activate_this = os.path.join(VENV_PATH, 'bin/activate_this.py')
if os.path.exists(activate_this):
    with open(activate_this) as file_:
        exec(file_.read(), dict(__file__=activate_this))

# Avvia l'app WSGI
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
