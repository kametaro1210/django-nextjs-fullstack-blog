from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth import get_user_model

# settings.pyのAUTH_USER_MODELで指定したUserAccountモデルを取得
User = get_user_model()


# ユーザーをDjango管理画面で表示・編集する方法を設定するクラス
class UserAdminCustom(UserAdmin):
    
    # 登録済みユーザーの編集画面に表示する項目
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "uid",
                    "name",
                    "email",
                    "password",
                    "avatar",
                    "introduction",
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "updated_at",
                    "created_at",
                )
            },
        ),
    )

    # 管理画面からユーザーを新規登録するときに表示する項目
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": (
                    "name",
                    "email",
                    "password1",
                    "password2",
                    "is_active",
                    "is_staff",
                    "is_superuser",
                ),
            },
        ),
    )

    # ユーザー一覧画面に表示する項目
    list_display = (
        "uid",
        "name",
        "email",
        "is_active",
        "updated_at",
        "created_at",
    )

    # 一覧画面の絞り込み項目（今回は設定なし）
    list_filter = ()
    
    # uidとメールアドレスでユーザーを検索できるようにする
    search_fields = (
        "uid",
        "email",
    )
    # 更新日の新しい順にユーザーを表示
    ordering = ("updated_at",)
    
    # クリックして編集画面を開ける項目
    list_display_links = ("uid", "name", "email")
    
    # 自動で設定されるため、管理画面で編集できない項目
    readonly_fields = ("updated_at", "created_at", "uid")


# Userモデルをカスタマイズした管理画面として登録
admin.site.register(User, UserAdminCustom)