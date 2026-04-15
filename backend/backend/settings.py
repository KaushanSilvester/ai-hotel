from pathlib import Path
from datetime import timedelta
import os

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-d-w2jyxbd9_oz8-0!4@6te8b34rnn3j*dqn@&c7(rov8a0--+u'
DEBUG = True
ALLOWED_HOSTS = []

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'api',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [{
    'BACKEND': 'django.template.backends.django.DjangoTemplates',
    'DIRS': [],
    'APP_DIRS': True,
    'OPTIONS': {'context_processors': [
        'django.template.context_processors.request',
        'django.contrib.auth.context_processors.auth',
        'django.contrib.messages.context_processors.messages',
    ]},
}]

WSGI_APPLICATION = 'backend.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
STATIC_URL = 'static/'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':  timedelta(days=7),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'AUTH_HEADER_TYPES': ('Bearer',),
    'ROTATE_REFRESH_TOKENS': True,
}

CORS_ALLOW_ALL_ORIGINS = True

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# ── 🔥 Gmail SMTP ─────────────────────────────────────────────────────────────
# Steps to set up:
# 1. Go to your Google Account → Security → 2-Step Verification → turn ON
# 2. Then go to: https://myaccount.google.com/apppasswords
# 3. Create an App Password for "Mail" → copy the 16-character password
# 4. Paste it below as EMAIL_HOST_PASSWORD (NOT your real Gmail password)
EMAIL_BACKEND        = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST           = 'smtp.gmail.com'
EMAIL_PORT           = 587
EMAIL_USE_TLS        = True
EMAIL_HOST_USER      = 'your_gmail@gmail.com'       # 🔥 CHANGE THIS
EMAIL_HOST_PASSWORD  = 'xxxx xxxx xxxx xxxx'        # 🔥 CHANGE THIS (App Password)
DEFAULT_FROM_EMAIL   = 'HotelAI <your_gmail@gmail.com>'  # 🔥 CHANGE THIS


# ── 🔥 Anthropic AI Chatbot ───────────────────────────────────────────────────
# Get your free API key from: https://console.anthropic.com/
ANTHROPIC_API_KEY = 'sk-ant-your-key-here'  # 🔥 CHANGE THIS


# ── 🔥 Google Gemini AI (FREE) ────────────────────────────────────────────────
# Get your FREE key at: https://aistudio.google.com/apikey
# No credit card needed — generous free tier
GEMINI_API_KEY = 'AIza-your-key-here'   # 🔥 CHANGE THIS

# ── 🔥 Groq AI (FREE — much higher limits than Gemini) ───────────────────────
# Get your FREE key at: https://console.groq.com → API Keys
# No credit card needed — very generous free tier
GROQ_API_KEY = 'gsk_your_groq_key_here'   # 🔥 CHANGE THIS

# ── 🔥 Twilio SMS Notifications ───────────────────────────────────────────────
# Get free credentials at: https://www.twilio.com/try-twilio
TWILIO_ACCOUNT_SID  = 'AC320bb1150cb9fd717b0e11479f1b42d9'  # 🔥 CHANGE THIS
TWILIO_AUTH_TOKEN   = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'    # 🔥 CHANGE THIS
TWILIO_FROM_NUMBER  = '+18777804236'   # 🔥 Your Twilio number (e.g. +12345678901)
ADMIN_PHONE_NUMBER  = '+940773682597'   # 🔥 Admin's real phone number to receive SMS