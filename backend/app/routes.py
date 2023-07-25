import jwt
from app import app
from flask import request, jsonify
from app.models import User
from app.db_utils import get_user, get_user_id, get_user_password_hash, add_word, delete_word, set_user, \
    get_user_tags, set_tag, get_default_tags, add_default_tag_to_user, delete_tag, get_tag, delete_user_default_tag, \
    get_user_word_tags, add_tag_to_text, remove_tag_from_word, get_user_words_by_tag, get_room_id, create_room_id
from werkzeug.security import check_password_hash, generate_password_hash
from functools import wraps
from urllib.parse import parse_qs, urlparse


def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            token = token.split(' ')[1]  # Extract the token value from the header
            if not is_user_authorized(token):
                return jsonify({'message': 'Invalid token'}), 401
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
            current_user = User(*get_user(data['user_id']))
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401

        return f(current_user, *args, **kwargs)

    return decorated_function


def create_json_for_reload_tags(current_user):
    default_tags = get_default_tags(current_user.user_id)
    tags = get_user_tags(current_user.user_id)
    text_tags = get_user_word_tags(current_user.user_id)
    tag_info = {
        'userTags': tags,
        'defaultTags': default_tags,
        'textTags': text_tags
    }
    return tag_info


def is_user_authorized(token):
    try:
        decoded_token = jwt.decode(token, app.config['SECRET_KEY'], algorithms=['HS256'])
        return True
    except jwt.ExpiredSignatureError:
        return False
    except jwt.InvalidTokenError:
        return False


def extract_room_id_from_environ(environ):
    query_string = environ.get('QUERY_STRING', '')
    query_params = parse_qs(query_string)
    room_id = query_params.get('room_id', [''])[0]
    return room_id


@app.route('/check-authorization', methods=['GET'])
@token_required
def check_authorization(current_user):
    return jsonify({'message': 'User is authorized'})


@app.route('/save-text', methods=['POST'])
@token_required
def save_text(current_user):
    info = request.get_json()
    user_id = current_user.user_id
    text = info.get('text', '')
    add_word(user_id, text)
    return jsonify({'message': 'Text added successful'})


@app.route('/get-texts', methods=['GET'])
@token_required
def get_texts(current_user):
    user = current_user
    texts = user.get_text()
    return jsonify(texts=texts)


@app.route('/delete-text/<text_id>', methods=['DELETE'])
@token_required
def delete_text(current_user, text_id):
    if text_id is None:
        return jsonify({'message': 'Text ID is missing'}), 400
    delete_word(text_id)
    return jsonify({'message': 'Text deleted successfully'})


@app.route('/login', methods=['POST'])
def login():
    info = request.get_json()
    user_login = info.get('login', '')
    email = info.get('email', '')
    password = info.get('password', '')
    user_id = get_user_id(user_login, email)

    if user_id:
        if check_password_hash(get_user_password_hash(user_id), password):
            token = jwt.encode({'user_id': user_id}, app.config['SECRET_KEY'], algorithm='HS256')
            tags = get_user_tags(user_id)
            return jsonify({'token': token, 'tags': tags})
        else:
            return jsonify({'message': 'Invalid password'}), 401
    else:
        return jsonify({'message': 'Invalid login'}), 401


@app.route('/logout', methods=['POST'])
def logout():
    return jsonify({'message': 'Logout successful'})


@app.route('/register', methods=['POST'])
def register():
    if request.method == 'POST':
        info = request.get_json()
        user_login = info.get('login', '')
        email = info.get('email', '')
        password = info.get('password', '')
        if get_user_id(login=user_login):
            response = jsonify({'message': 'User with this login is already registered'})
        elif get_user_id(email=email):
            response = jsonify({'message': 'User with this email is already registered'})
        else:
            set_user(user_login, email, generate_password_hash(password))
            user_id = get_user_id(email=email)
            create_room_id(user_id)
            token = jwt.encode({'user_id': user_id}, app.config['SECRET_KEY'], algorithm='HS256')
            response = jsonify({'message': 'User registered successfully', 'token': token})

        response.status_code = 200
        return response


@app.route('/user-tags')
@token_required
def fetch_user_tags(current_user):
    return jsonify(tags=get_user_tags(current_user.user_id))


@app.route('/set-tag', methods=['POST'])
@token_required
def set_user_tags(current_user):
    info = request.get_json()
    tag = info.get('name', '')
    tag_id, tag_name = set_tag(current_user.user_id, tag)
    default_tags = get_default_tags()
    default_tags = [default_tag[0] for default_tag in default_tags]
    if tag in default_tags:
        add_default_tag_to_user(current_user.user_id, tag_name)
    return jsonify({'message': 'Tags set successfully', 'tag_id': tag_id, 'tag_name': tag_name})


@app.route('/user-default-tags')
@token_required
def fetch_default_tags(current_user):
    default_tags = get_default_tags(current_user.user_id)
    default_tags = [default_tag[0] for default_tag in default_tags]
    return jsonify(tags=default_tags)


@app.route('/remove-default-tag', methods=['POST'])
@token_required
def remove_default_tag(current_user):
    tag_name = request.get_json().get('tagName', '')
    add_default_tag_to_user(current_user.user_id, tag_name)
    return jsonify({'message': 'Tag removed successfully'})


@app.route('/delete-tag/<tag_id>', methods=['DELETE'])
@token_required
def delete_user_tag(current_user, tag_id):
    tag_info = get_tag(tag_id)
    if not tag_info:
        return jsonify({'message': 'Tag not found'}), 404
    tag_id, user_id, tag_name, added = tag_info
    default_tags = get_default_tags()
    default_tags = [default_tag[0] for default_tag in default_tags]
    delete_tag(tag_id)

    if tag_name in default_tags:
        delete_user_default_tag(user_id, tag_name)
        return jsonify({'message': 'Tag deleted successfully', 'tag_type': 'default'})
    return jsonify({'message': 'Tag deleted successfully', 'tag_type':  'custom'})


@app.route('/add-tag-to-text', methods=['POST'])
@token_required
def add_user_tag_to_text(current_user):
    info = request.get_json()
    text_id = info.get('text_id', '')
    tag_id = info.get('tag_id', '')
    if text_id and tag_id:
        add_tag_to_text(text_id, tag_id)
        return jsonify({'message': 'Tag added successfully'})
    else:
        return jsonify({'message': 'Not found'}), 404


@app.route('/remove-tag-from-text/<text_id>/<tag_id>', methods=['DELETE'])
@token_required
def delete_tag_from_text(current_user, text_id, tag_id):
    if text_id and tag_id:
        remove_tag_from_word(text_id, tag_id)
        return jsonify({'message': 'Tag removed successfully'})
    else:
        return jsonify({'message': 'Not found'}), 404


@app.route('/get-text-tags')
@token_required
def get_word_tags(current_user):
    word_tags = get_user_word_tags(current_user.user_id)
    return jsonify(text_tags=word_tags)


@app.route('/get-words-by-tag/<tag_id>')
@token_required
def fetch_words_by_tag(current_user, tag_id):
    words = get_user_words_by_tag(current_user.user_id, tag_id)
    return jsonify(words=words)


@app.route('/policy')
def get_policy():
    return PRIVACY_POLICY


@app.route('/')
def index():
    return 'Welcome to the Text Saver API'
