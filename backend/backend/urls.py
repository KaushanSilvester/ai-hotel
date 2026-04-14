from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Django built-in admin (superuser panel at /admin/)
    path('admin/', admin.site.urls),

    # Public + auth API
    path('api/', include('api.urls')),

    # 🔥 Admin dashboard API (protected by IsAdminUser)
    path('api/admin-panel/', include('api.admin_urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)