import sqlite3
from datetime import datetime
import os.path
import uuid

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
db_dir = (BASE_DIR + '\\text_saver.db')


def connection(func):
    con = sqlite3.connect('app/text_saver.db', check_same_thread=False)
    cur = con.cursor()

    def function(*args, **kwargs):
        result = func(cur, *args, **kwargs)
        con.commit()
        return result

    return function


@connection
def get_user(cur, user_id):
    user = cur.execute(f'select id, login, email from users where id = {user_id}').fetchone()
    return user


@connection
def set_user(cur, login, email, password_hash):
    cur.execute(f'insert into users (login, email, password_hash) '
                f'values ({repr(login)}, {repr(email)}, {repr(password_hash)})')


@connection
def create_room_id(cur, user_id):
    room_id = cur.execute(f'select room_id from users where id = {user_id}').fetchone()
    if room_id[0]:
        return room_id[0]
    else:
        room_id = uuid.uuid1()
        while cur.execute(f'select * from users where room_id = \'{room_id}\'').fetchone():
            room_id = uuid.uuid1()
        cur.execute(f'update users set room_id = \'{room_id}\' where id = {user_id}')
        return room_id


@connection
def get_room_id(cur, user_id):
    room_id = cur.execute(f'select room_id from users where id = {user_id}').fetchone()
    if room_id[0]:
        return room_id[0]
    else:
        return create_room_id(user_id)


@connection
def get_user_id(cur, login=None, email=None):
    if login:
        user_id = cur.execute(f'select id from users where login = {repr(login)}').fetchone()
    elif email:
        user_id = cur.execute(f'select id from users where email = {repr(email)}').fetchone()
    else:
        user_id = None
    if user_id:
        return user_id[0]
    else:
        return None


@connection
def get_user_password_hash(cur, user_id):
    password_hash = cur.execute(f'select password_hash from users where id = {user_id}').fetchone()
    return password_hash[0]


@connection
def add_word(cur, user_id, word):
    if not cur.execute(f'select * from words where user_id = {user_id} and word = {repr(word)}').fetchone():
        cur.execute(f'insert into words (user_id, word, added) values ({user_id}, {repr(word)}, \'{datetime.now()}\')')


@connection
def get_words(cur, user_id):
    if user_id:
        return cur.execute(f'select id, word from words where user_id = {user_id} order by added').fetchall()


@connection
def get_user_tags(cur, user_id):
    return cur.execute(f'select id, name from tags where user_id = {user_id}').fetchall()


@connection
def get_default_tags(cur, user_id=None):
    if not user_id:
        return cur.execute(f'select name from default_tags').fetchall()
    else:
        return cur.execute(f'select name from default_tags where id not in (select default_tags.id from default_tags '
                           f'inner join added_default_tags on default_tags.id = added_default_tags.tag_id '
                           f'inner join users on added_default_tags.user_id = users.id '
                           f'where users.id = {user_id})').fetchall()


@connection
def add_default_tag_to_user(cur, user_id, tag_name):
    default_tag_id = cur.execute(f'select id from default_tags where name = {repr(tag_name)}').fetchone()[0]
    cur.execute(f'insert into added_default_tags (user_id, tag_id) values ({user_id}, {default_tag_id})')


@connection
def get_tag(cur, tag_id):
    return cur.execute(f'select * from tags where id = {tag_id}').fetchone()


@connection
def set_tag(cur, user_id, tag):
    added = datetime.now()
    cur.execute(f'insert into tags (user_id, name, added) values ({user_id}, {repr(tag)}, \'{added}\')')
    return cur.execute(f'select id, name from tags where user_id = {user_id} and name = {repr(tag)} and added = \'{added}\'')\
        .fetchone()


@connection
def delete_word(cur, word_id):
    cur.execute(f'delete from words where id = {word_id}')


@connection
def delete_tag(cur, tag_id):
    cur.execute(f'delete from tags where id = {tag_id}')


@connection
def delete_user_default_tag(cur, user_id, tag_name):
    default_tag_id = cur.execute(f'select id from default_tags where name like \'{tag_name}\'').fetchone()[0]
    cur.execute(f'delete from added_default_tags where user_id = {user_id} and tag_id = {default_tag_id}')


@connection
def get_user_word_tags(cur, user_id):
    return cur.execute(f'select word_tags.* from word_tags '
                       f'inner join words on words.id = word_tags.word_id '
                       f'inner join users on users.id = words.user_id '
                       f'where users.id = {user_id}').fetchall()


@connection
def get_user_words_by_tag(cur, user_id, tag_id):
    return cur.execute(f'select words.id, words.word from words '
                       f'inner join users on words.user_id = users.id '
                       f'inner join word_tags on words.id = word_tags.word_id '
                       f'where users.id = {user_id} and word_tags.tag_id = {tag_id}').fetchall()


@connection
def add_tag_to_text(cur, text_id, tag_id):
    cur.execute(f'insert into word_tags (word_id, tag_id) values ({text_id}, {tag_id})')


@connection
def remove_tag_from_word(cur, text_id, tag_id):
    cur.execute(f'delete from word_tags where word_id = {text_id} and tag_id = {tag_id}')


@connection
def is_user_exists(cur, login=None, email=None, password_hash=None):
    if login:
        is_exists = cur.execute(f'select * from users '
                                f'where login = {repr(login)} and password_hash = {repr(password_hash)}').fetchone()
    elif email:
        is_exists = cur.execute(f'select * from users '
                                f'where email = {repr(email)} and password_hash = {repr(password_hash)}').fetchone()
    else:
        is_exists = False
    return bool(is_exists)