from django.contrib import admin
from django.urls import path, include

# プロジェクト用 URL を作成

urlpatterns = [
    path("api/auth/", include("djoser.urls")),
    path("api/auth/", include("djoser.urls.jwt")),
    path("api/", include("accounts.urls")), # アカウント
    path('admin/', admin.site.urls), # 管理画面
]
