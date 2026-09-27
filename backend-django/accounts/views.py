from django.shortcuts import render

from django.contrib.auth import get_user_model
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import AllowAny
from .serializers import UserSerializer

User = get_user_model()

# ユーザー詳細
class UserDetailView(RetrieveAPIView):
    # 取得対象のユーザーを全件から探す
    queryset = User.objects.all()

    # 取得したユーザー情報を JSON に変換するときのルール
    serializer_class = UserSerializer

    # ログインしていないユーザーも含め、認証なしでこの API にアクセスできる
    permission_classes = (AllowAny,)

    # URL で指定する識別子は id ではなく uid を使う
    lookup_field = "uid"
