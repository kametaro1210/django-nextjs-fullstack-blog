from django.conf import settings  # Django の設定値を取得する
from django.contrib.auth.tokens import default_token_generator  # 認証用トークンを発行する
from djoser import utils  # ユーザー ID をメール URL 用の文字列に変換する
from templated_mail.mail import BaseEmailMessage  # テンプレートを使ったメールの基底クラス


# 各メールで共通して使う送信先や送信元を設定するクラス
class EmailManager(BaseEmailMessage):
    
    # メールを送信するための宛先や送信元を設定する
    def send(self, to, *args, **kwargs):
        
        # メールテンプレートをレンダリングして本文を準備する
        self.render()

        # メインの宛先を設定する
        self.to = to

        # オプションで指定された宛先を取り出す
        self.cc = kwargs.pop("cc", [])
        self.bcc = kwargs.pop("bcc", [])
        self.reply_to = kwargs.pop("reply_to", [])

        # 指定がなければ、サイト名とデフォルトのメールアドレスを送信元にする
        self.from_email = kwargs.pop(
            "from_email", f"{settings.SITE_NAME} <{settings.DEFAULT_FROM_EMAIL}>"
        )

        # 親クラスの処理を使ってメールを実際に送信する
        super(BaseEmailMessage, self).send(*args, **kwargs)


# アカウント本登録用の認証メールを作成するクラス
class ActivationEmail(EmailManager):
    
    # 本登録用メールの本文テンプレート
    template_name = "accounts/activation.html"

    # 本登録用 URL や認証情報をテンプレートに渡す
    def get_context_data(self):
        
        # 親クラスからメールに渡す基本データを取得する
        context = super().get_context_data()
        user = context.get("user")

        # メール本文に表示するユーザー名を設定する
        context["name"] = user.name

        # URL に埋め込むユーザー ID と、一度だけ使える認証トークンを作成する
        context["uid"] = utils.encode_uid(user.pk)
        context["token"] = default_token_generator.make_token(user)

        # ユーザーが本登録を完了するための URL を作成する
        context["url"] = settings.DJOSER["ACTIVATION_URL"].format(**context)

        # メール本文に表示するサイト情報を設定する
        context["domain"] = settings.SITE_DOMAIN
        context["site_name"] = settings.SITE_NAME
        return context


# アカウント本登録完了メールを作成するクラス
class ConfirmationEmail(EmailManager):
    
    # 本登録完了メールの本文テンプレート
    template_name = "accounts/confirmation.html"

    # 本登録完了メールに表示する情報をテンプレートに渡す
    def get_context_data(self):
        
        # 親クラスからメールに渡す基本データを取得する
        context = super().get_context_data()
        user = context.get("user")

        # メール本文に表示するユーザー名とサイト名を設定する
        context["name"] = user.name
        context["site_name"] = settings.SITE_NAME
        return context


# パスワード再設定用のメールを作成するクラス
class ForgotPasswordEmail(BaseEmailMessage):
    
    # パスワード再設定メールの本文テンプレート
    template_name = "accounts/forgot_password.html"

    # パスワード再設定用 URL や認証情報をテンプレートに渡す
    def get_context_data(self):
        
        # 親クラスからメールに渡す基本データを取得する
        context = super().get_context_data()
        user = context.get("user")

        # メール本文に表示するユーザー名を設定する
        context["name"] = user.name

        # URL に埋め込むユーザー ID と、パスワード再設定用トークンを作成する
        context["uid"] = utils.encode_uid(user.pk)
        context["token"] = default_token_generator.make_token(user)

        # ユーザーがパスワードを再設定するための URL を作成する
        context["url"] = settings.DJOSER["PASSWORD_RESET_CONFIRM_URL"].format(**context)

        # メール本文に表示するサイト情報を設定する
        context["domain"] = settings.SITE_DOMAIN
        context["site_name"] = settings.SITE_NAME
        return context


# パスワード再設定完了メールを作成するクラス
class ResetPasswordEmail(BaseEmailMessage):
    
    # パスワード再設定完了メールの本文テンプレート
    template_name = "accounts/reset_password.html"

    # パスワード再設定完了メールに表示する情報をテンプレートに渡す
    def get_context_data(self):
        # 親クラスからメールに渡す基本データを取得する
        context = super().get_context_data()
        user = context.get("user")

        # メール本文に表示するユーザー名とサイト名を設定する
        context["name"] = user.name
        context["site_name"] = settings.SITE_NAME
        return context