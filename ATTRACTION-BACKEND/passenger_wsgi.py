import os
import sys

# Path principale del progetto (dove sta manage.py)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Path della cartella backend/ dove c’è settings.py
PROJECT_DIR = os.path.join(BASE_DIR, 'backend')

# Virtualenv
VENV_PATH = '/var/www/vhosts/attraction.somos.srl/venv-maas'

# Aggiungi PROJECT_DIR al PYTHONPATH
sys.path.insert(0, PROJECT_DIR)
sys.path.insert(0, BASE_DIR)

# Imposta settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Attiva virtualenv
activate_this = os.path.join(VENV_PATH, 'bin/activate_this.py')
if os.path.exists(activate_this):
    with open(activate_this) as f:
        exec(f.read(), dict(__file__=activate_this))

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
