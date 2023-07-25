from flask_login import UserMixin
from app.db_utils import get_user, set_user, get_user_password_hash, get_user_id, get_words, delete_word
from werkzeug.security import generate_password_hash


class User(UserMixin):
    def __init__(self, user_id, login=None, email=None, password=None):
        self.user_id = user_id
        self.login = login
        self.email = email
        self.password = password

    def get_id(self):
        return str(get_user_id(self.login, self.email))

    def get_text(self):
        return get_words(self.user_id)

    @staticmethod
    def get(user_id=None, login=None, email=None):
        return get_user(user_id, login, email)

    @staticmethod
    def insert_user(login=None, email=None, password_hash=None):
        set_user(login, email, password_hash)

    @staticmethod
    def get_password_hash(user_id):
        return get_user_password_hash(user_id)

    @property
    def password(self):
        raise AttributeError('No such attribute!')

    @password.setter
    def password(self, password):
        if password:
            self.password_hash = generate_password_hash(password)
        else:
            self.password_hash = ''