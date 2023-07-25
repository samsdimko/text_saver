from app import app
from flask import redirect, url_for, request, flash, jsonify, render_template
from flask_login import current_user, login_user, login_required
from db_utils import get_user, get_user_id, get_user_password_hash, delete_word
from models import User
from werkzeug.security import check_password_hash


# @app.route('/', methods=['GET', 'POST'])
# @app.route('/index', methods=['GET', 'POST'])
# @login_required
# def index():
# 	return render_template('index.html')


@app.route('/get-texts', methods=['GET'])
@login_required
def get_texts():
	user = User(get_user(current_user.user_id))
	texts = user.get_text()
	return jsonify(texts=texts)


@app.route('/delete-text/<text_id>/', methods=['DELETE'])
@login_required
def delete_text(text_id):
	delete_word(text_id)
	return True


@app.route('/login-google/')
def login_google():
	pass


@app.route('/login', methods=['GET', 'POST'])
def login():
	if current_user.is_authenticated:
		return redirect(url_for('index'))
	if request.method == 'POST':
		info = request.get_json()
		user_login = info.get('login', '')
		email = info.get('email', '')
		password = info.get('password', '')
		user_id = get_user_id(user_login, email)

		if user_id:
			user = User(get_user(user_id))
			if check_password_hash(get_user_password_hash(user_id), password):
				login_user(user)
				return redirect(url_for('index'))
			else:
				flash('Invalid password')
				return redirect(url_for('login'))
		else:
			flash('Invalid login')
			return redirect(url_for('login'))

	else:
		return render_template('login.html')


