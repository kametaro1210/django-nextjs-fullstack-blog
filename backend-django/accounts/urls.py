from django.urls import path
from accounts import views

# アプリケーション用 URL を作成

urlpatterns = [
    # ユーザー詳細
    path("users/<uid>/", views.UserDetailView.as_view()),
]