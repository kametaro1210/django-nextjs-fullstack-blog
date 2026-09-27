from django.db import models
from django.contrib.auth.models import (
    AbstractBaseUser,
    PermissionsMixin,
    BaseUserManager,
)
from django.db.models.signals import post_save
from django.dispatch import receiver
from hashids import Hashids


# ユーザーの登録や管理者ユーザーの作成方法を定義するクラス
class UserManager(BaseUserManager):
    
    # メールアドレスとパスワードで通常ユーザーを作成
    def create_user(self, email, password=None, **extra_fields):
        
        # メールアドレスの検証
        if not email:
            raise ValueError("メールアドレスは必須です")

        # メールアドレスの形式をそろえて、小文字に変換
        email = self.normalize_email(email)
        email = email.lower()

        # ユーザーオブジェクトの作成と保存
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()

        return user

    # Django管理画面を使える管理者ユーザーを作成
    def create_superuser(self, email, password=None, **extra_fields):
        user = self.create_user(email, password, **extra_fields)
        user.is_superuser = True
        user.is_staff = True
        user.save()

        return user


# ユーザーの情報やログインに必要な項目を定義するクラス
class UserAccount(AbstractBaseUser, PermissionsMixin):
    uid = models.CharField("uid", max_length=30, unique=True)
    email = models.EmailField("メールアドレス", max_length=255, unique=True)
    name = models.CharField("名前", max_length=255)
    avatar = models.ImageField(
        upload_to="avatar", verbose_name="プロフィール画像", null=True, blank=True
    )
    introduction = models.TextField("自己紹介", null=True, blank=True)
    updated_at = models.DateTimeField("更新日", auto_now=True)
    created_at = models.DateTimeField("作成日", auto_now_add=True)

    # アクティブ状態とスタッフ権限フィールド
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    # ユーザーマネージャーと認証フィールドの設定
    objects = UserManager()
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]

    class Meta:
        verbose_name = "ユーザーアカウント"
        verbose_name_plural = "ユーザーアカウント"

    def __str__(self):
        return self.name


# ユーザー保存後に自動で実行される処理
@receiver(post_save, sender=UserAccount)
def generate_random_user_uid(sender, instance, created, **kwargs):
    # 新しいユーザーにuidを自動設定
    if created:
        hashids = Hashids(salt="xRXSMT8XpzdUbDNM9qkv6JzUezU64D4Z", min_length=8)
        instance.uid = hashids.encode(instance.id)
        instance.save()