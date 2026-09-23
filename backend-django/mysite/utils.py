import base64

from rest_framework import serializers
from django.core.files.base import ContentFile

"""
Base64とは : 
画像やファイルのデータを「文字列の形」に変換する仕組みです。
画像データを文字列に変換して、API で送れるようにするために使います。
"""

# Base64 で送られてきた画像データを扱うためのカスタムフィールド
class Base64ImageField(serializers.ImageField):

    # 受け取ったデータを Django が使える形に変換する
    def to_internal_value(self, data):
        
        """
        Base64 形式の画像データを Django の画像ファイルとして扱える形に変換する。

        フロントエンドから `data:image/...;base64,...` のような文字列が送られてきた場合、
        その文字列から画像データ部分を取り出し、Base64 をデコードして
        Django の `ImageField` が保存・検証できる `ContentFile` に変換する。

        Returns:
            変換後の画像データ
        """

        # 画像が Base64 形式なら、通常の画像データに戻す
        if isinstance(data, str) and data.startswith("data:image"):

            # 形式と画像データを分ける
            format, imgstr = data.split(";base64,")

            # 画像の拡張子を取得する
            ext = format.split("/")[-1]

            # Base64 をデコードして、保存できる画像データにする
            data = ContentFile(base64.b64decode(imgstr), name=f"temp.{ext}")

        # 変換済みの画像データを返す
        # Django の通常の画像処理が使え、画像として保存できるようになる
        return super(Base64ImageField, self).to_internal_value(data)