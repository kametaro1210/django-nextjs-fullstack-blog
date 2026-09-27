from rest_framework import serializers
from django.contrib.auth import get_user_model
from mysite.utils import Base64ImageField

# 現在使っているユーザーモデルを取得する
# カスタムユーザーを使っていても、この1行で正しいモデルを参照できる
User = get_user_model()


# ユーザー情報のシリアライザ
class UserSerializer(serializers.ModelSerializer):
    
    # uidフィールドは読み取り専用
    uid = serializers.CharField(read_only=True)
    
    # Base64エンコードされた画像を受け入れるカスタムフィールド
    avatar = Base64ImageField(
        max_length=None, use_url=True, required=False, allow_null=True
    )

    # このシリアライザは User モデルを扱う
    # User のすべての項目を API で返す
    class Meta:
        model = User
        fields = "__all__"